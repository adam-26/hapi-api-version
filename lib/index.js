/**
 * As per the requirements of the apache license file:
 * This file has been modified from its original form by github user adam-26.
 * The original source can be found at: https://github.com/p-meier/hapi-api-version/commit/ec47bb44e52e227c1feca909fb1e5a4d15ef7346
 */
'use strict';

const Boom = require('boom');
const Hoek = require('hoek');
const Joi = require('joi');
const MediaType = require('media-type');

const Package = require('../package');

const internals = {
    optionsSchema: Joi.object({
        validVersions: Joi.array().items(Joi.number().integer()).min(1).required(),
        defaultVersion: Joi.any().valid(Joi.ref('validVersions')).required(),
        passiveMode: Joi.boolean().default(false),
        basePath: Joi.string().trim().min(1).default('/'),
        vendorName: Joi.string().trim().min(1),
        getVersion: Joi.func(),
        descriptor: Joi.string().min(1).invalid('default').default('mediatype'),
        invalidVersionErrorCode: Joi.number().integer().default(415)
    }).xor('vendorName', 'getVersion')
};

const _extractVersionFromAcceptHeader = function (request, options) {

    const acceptHeader = request.headers.accept;
    if (!acceptHeader) {
        return null;
    }

    const media = MediaType.fromString(acceptHeader);
    if (media.isValid() && (/^vnd.[a-zA-Z0-9]+\.v[0-9]+$/).test(media.subtype)) {

        if (media.subtypeFacets[1] !== options.vendorName) {
            return -1;
        }

        const version = media.subtypeFacets[2].replace('v', '');
        return parseInt(version, 10);
    }

    return -1;
};

exports.register = function (server, options, next) {

    const validateOptions = Joi.validate(options, internals.optionsSchema, { abortEarly: false, allowUnknown: false });

    if (validateOptions.error) {
        return next(validateOptions.error);
    }

    // Use the validated and maybe converted values from Joi
    options = validateOptions.value;

    // Assign plugin metadata, and ensure that plugins have unique descriptors
    const serverPlugin = server.plugins['hapi-api-version'] = server.plugins['hapi-api-version'] || { count: 0, descriptors: [] };
    if (serverPlugin.descriptors.indexOf(options.descriptor) !== -1) {
        return next(new Error('hapi-api-version plugins contain duplicate descriptors \'' + options.descriptor + '\'. When registering multiple plugins, each plugin must be assigned a unique descriptor.'));
    }

    serverPlugin.count++;
    serverPlugin.descriptors.push(options.descriptor);
    const isRootPath = options.basePath === '/';

    server.ext('onRequest', (request, reply) => {

        // If the request is not for a versioned resource, nothing to do here
        if (!isRootPath && !request.path.startsWith(options.basePath)) {
            return reply.continue();
        }

        // Allow the plugin to be applied multiple times (example: use multiple custom functions)
        const requestPlugin = request.plugins['hapi-api-version'] = request.plugins['hapi-api-version'] || { count: 0, useDefault: true };

        // If the apiVersion has already been determined, nothing to do here
        if (requestPlugin.apiVersion && !requestPlugin.useDefault) {
            return reply.continue();
        }

        // Increment the request plugin counter
        requestPlugin.count++;

        // determine the requested version
        let requestedVersion = typeof options.getVersion === 'function' ? options.getVersion(request, options) : _extractVersionFromAcceptHeader(request, options);

        // If passive mode skips the rest for non versioned routes
        if (options.passiveMode === true && !requestedVersion) {
            return reply.continue();
        }

        // If there was a version by now check if it is valid
        if (requestedVersion && !Hoek.contain(options.validVersions, requestedVersion)) {
            return reply(Boom.create(options.invalidVersionErrorCode, 'Invalid api-version. Valid values: ' + options.validVersions.join(',')));
        }

        // Determine if other API version plugins exist. If yes, nothing to do here.
        if (!requestedVersion && requestPlugin.count !== serverPlugin.count) {
            return reply.continue();
        }

        // If there was no version by now use the default version
        let useDefault = false;
        if (!requestedVersion) {
            requestedVersion = options.defaultVersion;
            useDefault = true;
        }

        const versionedPath = options.basePath + 'v' + requestedVersion + request.path.slice(options.basePath.length - 1);
        const route = server.match(request.method, versionedPath);

        if (route && route.path.indexOf(options.basePath + 'v' + requestedVersion + '/') === 0) {
            request.setUrl(options.basePath + 'v' + requestedVersion + request.url.path.slice(options.basePath.length - 1)); //required to preserve query parameters

            //Set version for usage in handler
            request.plugins['hapi-api-version'] = {
                apiVersion: requestedVersion,
                useDefault: useDefault,
                count: requestPlugin.count,
                descriptor: useDefault ? 'default' : options.descriptor
            };
        }

        return reply.continue();

    });

    return next();
};

exports.register.attributes = {
    name: Package.name,
    version: Package.version,
    multiple: true
};
