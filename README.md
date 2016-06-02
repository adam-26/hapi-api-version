# hapi-api-version

[![Build Status](https://travis-ci.org/adam-26/hapi-api-version.svg?branch=master)](https://travis-ci.org/adam-26/hapi-api-version)

An API versioning plugin for [hapi](http://hapijs.com/).

*Forked from: https://github.com/p-meier/hapi-api-version*

## Features / Goals

- Supports versioning using mediaTypes defined via `accept` header, as described by the [media type specification](https://tools.ietf.org/html/rfc6838) and used on [github.com](https://developer.github.com/v3/media/)
- Allows custom function to extract the version number from a request
- Allows the plugin to be registered multiple times (for example, you could apply the plugin multiple times - each with a custom function to provide multiple options to specify an api version, such as querystring, url path and the default mediaType accept header)
- 100% test coverage
- Easy to use and flexible
- Follows the [hapi coding conventions](http://hapijs.com/styleguide)
- Allows to follow the DRY principle

## Requirements

Runs with Node >=4 and hapi >=10 which is tested with Travis CI.

## A note about creating media type headers

If you create a custom media type, be sure to register it with the [iana](http://www.iana.org/form/media-types)

## Installation

```
npm install --save @adam-26/hapi-api-version
```

## Usage

Register it with the server:

```javascript
import * as HapiApiVersionPlugin from '@adam-26/hapi-api-version';

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({
    port: 3000
});

const validVersions = [1, 2];
const defaultVersion = 2;

server.register([{
    register: HapiApiVersionPlugin,
    options: {
        validVersions: validVersions,
        defaultVersion: defaultVersion,
        vendorName: 'mysuperapi'
    }
}, {
       register: HapiApiVersionPlugin,
       options: {
           validVersions: validVersions,
           defaultVersion: defaultVersion,
           descriptor: 'querystring',
           getVersion: (request, options) => {

           		// Extract the version from the querystring parameter 'version'
           		if (request.query.version) {
           			return parseInt(request.query.version);
           		}

           		return null;
           }
       }
}], (err) => {

    //Add routes here...

    server.start((err) => {
        console.log('Server running at:', server.info.uri);
    });
});

```

Time to add some routes...

There are typically two common use cases which this plugin is designed to address.

#### Unversioned routes

This is the type of routes which never change regardless of the api version. The route definition and the handler stay the same.
No `request.plugins['hapi-api-version']` data is available for unversioned routes.

```javascript
server.route({
    method: 'GET',
    path:'/healthcheck',
    handler: function (request, reply) {

        return reply({
          status: 'healthy'
        });
    }
});
```

#### Versioned routes

This is the type of routes which actually change.

##### Different route definitions per version

Each route definition is version specific.

```javascript
const usersVersion1 = [{
    name: 'Peter Miller'
}];

const usersVersion2 = [{
    firtname: 'Peter',
    lastname: 'Miller'
}];

server.route({
    method: 'GET',
    path: '/v1/users',
    handler: function (request, reply) {

        return reply(usersVersion1);
    },
    config: {
        response: {
            schema: Joi.array().items(
                Joi.object({
                    name: Joi.string().required()
                })
            )
        }
    }
});

server.route({
    method: 'GET',
    path: '/v2/users',
    handler: function (request, reply) {

        return reply(usersVersion2);
    },
    config: {
        response: {
            schema: Joi.array().items(
                Joi.object({
                    firtname: Joi.string().required(),
                    lastname: Joi.string().required()
                })
            )
        }
    }

});
```

Note the different schemas for response validation here.

The user still sends a request to `/users` and the plugin rewrites it internally to either `/v1/users` or `/v2/users` based on the requested version.

## Example

A complete working example with routes can be found in the `example` folder.

## Documentation

**hapi-api-version** works internally with rewriting urls. The process is very simple:

1. Check if an `accept` header OR a custom getVersion function is present and extract the version
2. If a version was extracted check if it is valid, otherwise respond with a status code `415` (The HTTP response code can be configured)
3. If no version was extracted (e.g. no headers sent) use the default version
4. Check if a versioned route (like `/v2/users`) exists -> if so rewrite the url from `/users` to `/v2/users`, otherwise do nothing

### Options

The options for the plugin are validated on plugin registration.

- `validVersions` (required) is an array of integer values. Specifies all valid api versions you support. Anything else will be considered invalid and the plugin responds with a status code as defined by `invalidVersionErrorCode`.
- `defaultVersion` (required) is an integer that is included in `validVersions`. Defines which version to use if no headers are sent.
- `vendorName` (required, if no getVersion function defined) is a string. Defines the vendor name used in the `accept` header.
- `passiveMode` (optional) is a boolean. Allows to bypass when no headers are supplied. Useful when you have serve other content like documentation and reduces overhead on processing those.
- `basePath` (optional) is a string. In case we have a base path different from `/` (example: `/api/`). Per default this is `/`.
- `getVersion` (required, if no vendorName defined) is a string. Return an integer to define the requested version, or null/undefined if no version was provided.
- `descriptor` (optional, required to be unique for multiple plugins) is a string, used to describe the versioning technique. This data is available on the request.plugins['hapi-api-plugin'] object.
- `invalidVersionErrorCode` (optional) is a integer, used to respond to invalid versions. Defaults to 415.

*NOTE: One of  `vendorName`  or the  `getVersion`  function must be defined*

### Getting the requested API version in the handler

```
handler: function (request, reply) {

	const pluginData = request.plugins['hapi-api-version'];

	// the API version
	console.log(pluginData.apiVersion);

	// true if the default API version was assigned
	console.log(pluginData.useDefault);

	// the number of plugins used to determine the API version
	console.log(pluginData.count);

	// 'default' if the default API version was assigned,
	// otherwise the descriptor of the plugin used to
	// determine the API version
	console.log(pluginData.descriptor);
	// ...
}
```

You can get the API version requested by the user (or maybe the default version if nothing was requested) in the handler. It is stored in `request.plugins['hapi-api-version'].apiVersion`.

### Headers

The headers must have a specific format to be correctly recognized and processed by the plugin.

##### Accept header

```
accept: application/vnd.mysuperapi.v2+json
```

Here `mysuperapi` is what was specified in options as `vendorName`. If the vendor name does not match, the default version will be used instead.

##### Custom getVersion function

```
getVersion: (request, options) => { return parseInt(request.query.version, 10); }
```

For example, to return a version defined in the querystring.


## Running the tests

[lab](https://github.com/hapijs/lab) is used for all tests. Make sure you install it globally before running the tests:

```
npm install -g lab
```

Now just execute the tests:

```
npm test
```

To see the coverage report in html just execute:

```
npm run test-coverage
```

After this the html report can be found in `coverage/coverage.html`.

## License

Apache-2.0
