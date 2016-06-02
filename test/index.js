/**
 * As per the requirements of the apache license file:
 * This file has been modified from its original form by github user adam-26.
 * The original source can be found at: https://github.com/p-meier/hapi-api-version/commit/ec47bb44e52e227c1feca909fb1e5a4d15ef7346
 */
'use strict';

const Hapi = require('hapi');
const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();

const expect = Code.expect;

const describe = lab.describe;
const it = lab.it;
const beforeEach = lab.beforeEach;

let server;

beforeEach((done) => {

    server = new Hapi.Server();
    server.connection();

    done();
});

describe('Plugin registration', () => {

    it('should fail if no options are specified', (done) => {

        server.register({
            register: require('../'),
            options: {}
        }, (err) => {

            if (err) {
                done();
            }
        });
    });

    it('should fail if no validVersions are specified', (done) => {

        server.register({
            register: require('../'),
            options: {
                defaultVersion: 1,
                vendorName: 'mysuperapi'
            }
        }, (err) => {

            if (err) {
                done();
            }
        });
    });

    it('should fail if validVersions is not an array', (done) => {

        server.register({
            register: require('../'),
            options: {
                validVersions: 1,
                defaultVersion: 1,
                vendorName: 'mysuperapi'
            }
        }, (err) => {

            if (err) {
                done();
            }
        });
    });

    it('should fail if validVersions is an empty array', (done) => {

        server.register({
            register: require('../'),
            options: {
                validVersions: [],
                defaultVersion: 1,
                vendorName: 'mysuperapi'
            }
        }, (err) => {

            if (err) {
                done();
            }
        });
    });

    it('should fail if validVersions contains non integer values', (done) => {

        server.register({
            register: require('../'),
            options: {
                validVersions: ['1', 2.2],
                defaultVersion: 1,
                vendorName: 'mysuperapi'
            }
        }, (err) => {

            if (err) {
                done();
            }
        });
    });

    it('should fail if no defaultVersion is specified', (done) => {

        server.register({
            register: require('../'),
            options: {
                validVersions: [1, 2],
                vendorName: 'mysuperapi'
            }
        }, (err) => {

            if (err) {
                done();
            }
        });
    });

    it('should fail if defaultVersion is not an integer', (done) => {

        server.register({
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: '1',
                vendorName: 'mysuperapi'
            }
        }, (err) => {

            if (err) {
                done();
            }
        });
    });

    it('should fail if defaultVersion is not an element of validVersions', (done) => {

        server.register({
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 3,
                vendorName: 'mysuperapi'
            }
        }, (err) => {

            if (err) {
                done();
            }
        });
    });

    it('should fail if defaultVersion is not an element of validVersions', (done) => {

        server.register({
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 3,
                vendorName: 'mysuperapi'
            }
        }, (err) => {

            if (err) {
                done();
            }
        });
    });

    it('should fail if both vendorName and getVersion are specified', (done) => {

        server.register({
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 1,
                vendorName: 'mysuperapi',
                getVersion: (request, opts) => {}
            }
        }, (err) => {

            if (err) {
                done();
            }
        });
    });

    it('should fail if vendorName is not a string', (done) => {

        server.register({
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 1,
                vendorName: 33
            }
        }, (err) => {

            if (err) {
                done();
            }
        });
    });

    it('should fail if passiveMode is not a boolean', (done) => {

        server.register({
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 1,
                vendorName: 33,
                passiveMode: []
            }
        }, (err) => {

            if (err) {
                done();
            }
        });
    });

    it('should succeed if all required options are provided correctly', (done) => {

        server.register({
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 1,
                vendorName: 'mysuperapi'
            }
        }, (err) => {

            if (!err) {
                done();
            }
        });
    });

    it('should succeed if getVersion is provided without vendorName', (done) => {

        server.register({
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 1,
                getVersion: (request, opts) => {

                    return null;
                }
            }
        }, (err) => {

            if (!err) {
                done();
            }
        });
    });
});

describe('MediaType Versioning', () => {

    beforeEach((done) => {

        server.register([{
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 1,
                vendorName: 'mysuperapi'
            }
        }], (err) => {

            if (err) {
                return console.error('Can not register plugins', err);
            }
        });

        done();
    });

    describe(' -> basic versioning', () => {

        beforeEach((done) => {

            server.route({
                method: 'GET',
                path: '/unversioned',
                handler: function (request, reply) {

                    const response = {
                        version: null,
                        data: 'unversioned'
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/v1/versioned',
                handler: function (request, reply) {

                    const response = {
                        version: 1,
                        data: 'versioned'
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/v2/versioned',
                handler: function (request, reply) {

                    const response = {
                        version: 2,
                        data: 'versioned'
                    };

                    return reply(response);
                }
            });

            done();
        });

        it('returns version 2 if accept header is valid', (done) => {

            server.inject({
                method: 'GET',
                url: '/versioned',
                headers: {
                    'Accept': 'application/vnd.mysuperapi.v2+json'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(2);
                expect(response.result.data).to.equal('versioned');

                done();
            });
        });

        it('returns default version if no header is sent', (done) => {

            server.inject({
                method: 'GET',
                url: '/versioned'
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(1);
                expect(response.result.data).to.equal('versioned');

                done();
            });
        });

        it('returns status code 415 if accept header is invalid', (done) => {

            server.inject({
                method: 'GET',
                url: '/versioned',
                headers: {
                    'Accept': 'application/someinvalidapi.vasf+json'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(415);
                done();
            });
        });

        it('returns status code 415 if accept header mediaType is invalid', (done) => {

            server.inject({
                method: 'GET',
                url: '/versioned',
                headers: {
                    'Accept': 'fail/someinvalidapi.vasf+json'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(415);
                done();
            });
        });

        it('returns status code 415 if accept header has an invalid vendor-name', (done) => {

            server.inject({
                method: 'GET',
                url: '/versioned',
                headers: {
                    'Accept': 'application/vnd.someinvalidapi.v2+json'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(415);
                done();
            });
        });

        it('returns status code 415 if accept header has an invalid version', (done) => {

            server.inject({
                method: 'GET',
                url: '/versioned',
                headers: {
                    'Accept': 'application/vnd.someinvalidapi.vABC+json'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(415);
                done();
            });
        });

        it('returns a 415 if invalid api version is requested (not included in validVersions)', (done) => {

            server.inject({
                method: 'GET',
                url: '/versioned',
                headers: {
                    'Accept': 'application/vnd.mysuperapi.v3+json'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(415);
                done();
            });
        });

        it('returns the same response for an unversioned route no matter what version is requested - version 1', (done) => {

            server.inject({
                method: 'GET',
                url: '/unversioned',
                headers: {
                    'Accept': 'application/vnd.mysuperapi.v1+json'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(null);
                expect(response.result.data).to.equal('unversioned');

                done();
            });
        });

        it('returns the same response for an unversioned route no matter what version is requested - version 2', (done) => {

            server.inject({
                method: 'GET',
                url: '/unversioned',
                headers: {
                    'Accept': 'application/vnd.mysuperapi.v2+json'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(null);
                expect(response.result.data).to.equal('unversioned');

                done();
            });
        });

        it('returns the same response for an unversioned route no matter what version is requested - no version (=default)', (done) => {

            server.inject({
                method: 'GET',
                url: '/unversioned'
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(null);
                expect(response.result.data).to.equal('unversioned');

                done();
            });
        });
    });

    it('preserves query parameters after url-rewrite', (done) => {

        server.route({
            method: 'GET',
            path: '/v1/versionedWithParams',
            handler: function (request, reply) {

                const response = {
                    params: request.query
                };

                return reply(response);
            }
        });

        server.inject({
            method: 'GET',
            url: '/versionedWithParams?test=1'
        }, (response) => {

            expect(response.statusCode).to.equal(200);
            expect(response.result.params).to.deep.equal({
                test: '1'
            });

            done();
        });
    });

    it('should work with CORS enabled', (done) => {

        server.route({
            method: 'GET',
            path: '/corstest',
            handler: function (request, reply) {

                return reply('Testing CORS!');
            },
            config: {
                cors: {
                    origin: ['*'],
                    headers: ['Accept', 'Authorization']
                }
            }
        });

        server.inject({
            method: 'OPTIONS',
            url: '/corstest',
            headers: {
                'Origin': 'http://www.example.com',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'accept, authorization'
            }
        }, (response) => {

            expect(response.statusCode).to.equal(200);
            expect(response.headers).to.include({
                'access-control-allow-origin': 'http://www.example.com'
            });

            expect(response.headers).to.include('access-control-allow-methods');
            expect(response.headers['access-control-allow-methods'].split(',')).to.include('GET');

            expect(response.headers).to.include('access-control-allow-headers');
            expect(response.headers['access-control-allow-headers'].split(',')).to.include(['Accept', 'Authorization']);

            done();
        });
    });

    describe(' -> path parameters', () => {

        beforeEach((done) => {

            server.route({
                method: 'GET',
                path: '/unversioned/{catchAll*}',
                handler: function (request, reply) {

                    const response = {
                        version: null,
                        data: 'unversionedCatchAll'
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/v2/versioned/{catchAll*}',
                handler: function (request, reply) {

                    const response = {
                        version: request.plugins['hapi-api-version'].apiVersion,
                        data: 'versionedCatchAll'
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/unversioned/withPathParam/{unversionedPathParam}',
                handler: function (request, reply) {

                    const response = {
                        version: null,
                        data: request.params.unversionedPathParam
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/v1/versioned/withPathParam/{versionedPathParam}',
                handler: function (request, reply) {

                    const response = {
                        version: request.plugins['hapi-api-version'].apiVersion,
                        data: request.params.versionedPathParam
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/v2/versioned/multiSegment/{segment*2}',
                handler: function (request, reply) {

                    const response = {
                        version: request.plugins['hapi-api-version'].apiVersion,
                        data: request.params.segment
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/v2/versioned/optionalPathParam/{optional?}',
                handler: function (request, reply) {

                    const response = {
                        version: request.plugins['hapi-api-version'].apiVersion,
                        data: request.params.optional
                    };

                    return reply(response);
                }
            });

            done();
        });

        it('resolves unversioned catch all routes', (done) => {

            server.inject({
                method: 'GET',
                url: '/unversioned/catch/all/route'
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(null);
                expect(response.result.data).to.equal('unversionedCatchAll');

                done();
            });
        });

        it('resolves versioned catch all routes', (done) => {

            const apiVersion = 2;

            server.inject({
                method: 'GET',
                url: '/versioned/catch/all/route',
                headers: {
                    'Accept': `application/vnd.mysuperapi.v${apiVersion}+json`
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(apiVersion);
                expect(response.result.data).to.equal('versionedCatchAll');

                done();
            });
        });

        it('resolves unversioned routes with path parameters', (done) => {

            const pathParam = '123456789';

            server.inject({
                method: 'GET',
                url: '/unversioned/withPathParam/' + pathParam
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(null);
                expect(response.result.data).to.equal(pathParam);

                done();
            });
        });

        it('resolves versioned routes with path parameters', (done) => {

            const pathParam = '123456789';
            const apiVersion = 1;

            server.inject({
                method: 'GET',
                url: '/versioned/withPathParam/' + pathParam,
                headers: {
                    'Accept': `application/vnd.mysuperapi.v${apiVersion}+json`
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(apiVersion);
                expect(response.result.data).to.equal(pathParam);

                done();
            });
        });

        it('resolves multi segment path parameters', (done) => {

            const apiVersion = 2;
            const pathParam = 'multi/segment';

            server.inject({
                method: 'GET',
                url: '/versioned/multiSegment/' + pathParam,
                headers: {
                    'Accept': `application/vnd.mysuperapi.v${apiVersion}+json`
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(apiVersion);
                expect(response.result.data).to.equal(pathParam);

                done();
            });
        });

        it('resolves optional path parameters - without optional value', (done) => {

            const apiVersion = 2;
            const pathParam = undefined;

            server.inject({
                method: 'GET',
                url: '/versioned/optionalPathParam/',
                headers: {
                    'Accept': `application/vnd.mysuperapi.v${apiVersion}+json`
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(apiVersion);
                expect(response.result.data).to.equal(pathParam);

                done();
            });
        });

        it('resolves optional path parameters - with optional value', (done) => {

            const apiVersion = 2;
            const pathParam = 'test';

            server.inject({
                method: 'GET',
                url: '/versioned/optionalPathParam/' + pathParam,
                headers: {
                    'Accept': `application/vnd.mysuperapi.v${apiVersion}+json`
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(apiVersion);
                expect(response.result.data).to.equal(pathParam);

                done();
            });
        });
    });
});

describe('Custom Versioning', () => {

    beforeEach((done) => {

        server.register([{
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 1,
                getVersion: (request, opts) => {

                    const headerVersion = request.headers['api-version'];
                    if (!headerVersion) {
                        return null;
                    }

                    const parsedVersion = parseInt(headerVersion, 10);
                    if (!isNaN(parsedVersion)) {
                        return parsedVersion;
                    }

                    return -1;

                }
            }
        }], (err) => {

            if (err) {
                return console.error('Can not register plugins', err);
            }
        });

        done();
    });

    describe(' -> basic versioning', () => {

        beforeEach((done) => {

            server.route({
                method: 'GET',
                path: '/unversioned',
                handler: function (request, reply) {

                    const response = {
                        version: null,
                        data: 'unversioned'
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/v1/versioned',
                handler: function (request, reply) {

                    const response = {
                        version: 1,
                        data: 'versioned'
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/v2/versioned',
                handler: function (request, reply) {

                    const response = {
                        version: 2,
                        data: 'versioned'
                    };

                    return reply(response);
                }
            });

            done();
        });

        it('returns version 2 if custom header is valid', (done) => {

            server.inject({
                method: 'GET',
                url: '/versioned',
                headers: {
                    'api-version': '2'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(2);
                expect(response.result.data).to.equal('versioned');

                done();
            });
        });

        it('returns default version if no header is sent', (done) => {

            server.inject({
                method: 'GET',
                url: '/versioned'
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(1);
                expect(response.result.data).to.equal('versioned');

                done();
            });
        });

        it('returns status 415 if custom header is invalid', (done) => {

            server.inject({
                method: 'GET',
                url: '/versioned',
                headers: {
                    'api-version': 'asdf'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(415);
                done();
            });
        });


        it('returns a 415 if invalid api version is requested (not included in validVersions)', (done) => {

            server.inject({
                method: 'GET',
                url: '/versioned',
                headers: {
                    'api-version': '3'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(415);

                done();
            });
        });

        it('returns the same response for an unversioned route no matter what version is requested - version 1', (done) => {

            server.inject({
                method: 'GET',
                url: '/unversioned',
                headers: {
                    'api-version': '1'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(null);
                expect(response.result.data).to.equal('unversioned');

                done();
            });
        });

        it('returns the same response for an unversioned route no matter what version is requested - version 2', (done) => {

            server.inject({
                method: 'GET',
                url: '/unversioned',
                headers: {
                    'api-version': '2'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(null);
                expect(response.result.data).to.equal('unversioned');

                done();
            });
        });

        it('returns the same response for an unversioned route no matter what version is requested - no version (=default)', (done) => {

            server.inject({
                method: 'GET',
                url: '/unversioned'
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(null);
                expect(response.result.data).to.equal('unversioned');

                done();
            });
        });
    });

    it('preserves query parameters after url-rewrite', (done) => {

        server.route({
            method: 'GET',
            path: '/v1/versionedWithParams',
            handler: function (request, reply) {

                const response = {
                    params: request.query
                };

                return reply(response);
            }
        });

        server.inject({
            method: 'GET',
            url: '/versionedWithParams?test=1'
        }, (response) => {

            expect(response.statusCode).to.equal(200);
            expect(response.result.params).to.deep.equal({
                test: '1'
            });

            done();
        });
    });

    it('should work with CORS enabled', (done) => {

        server.route({
            method: 'GET',
            path: '/corstest',
            handler: function (request, reply) {

                return reply('Testing CORS!');
            },
            config: {
                cors: {
                    origin: ['*'],
                    headers: ['Accept', 'Authorization']
                }
            }
        });

        server.inject({
            method: 'OPTIONS',
            url: '/corstest',
            headers: {
                'Origin': 'http://www.example.com',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'accept, authorization'
            }
        }, (response) => {

            expect(response.statusCode).to.equal(200);
            expect(response.headers).to.include({
                'access-control-allow-origin': 'http://www.example.com'
            });

            expect(response.headers).to.include('access-control-allow-methods');
            expect(response.headers['access-control-allow-methods'].split(',')).to.include('GET');

            expect(response.headers).to.include('access-control-allow-headers');
            expect(response.headers['access-control-allow-headers'].split(',')).to.include(['Accept', 'Authorization']);

            done();
        });
    });

    describe(' -> path parameters', () => {

        beforeEach((done) => {

            server.route({
                method: 'GET',
                path: '/unversioned/{catchAll*}',
                handler: function (request, reply) {

                    const response = {
                        version: null,
                        data: 'unversionedCatchAll'
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/v2/versioned/{catchAll*}',
                handler: function (request, reply) {

                    const response = {
                        version: request.plugins['hapi-api-version'].apiVersion,
                        data: 'versionedCatchAll'
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/unversioned/withPathParam/{unversionedPathParam}',
                handler: function (request, reply) {

                    const response = {
                        version: null,
                        data: request.params.unversionedPathParam
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/v1/versioned/withPathParam/{versionedPathParam}',
                handler: function (request, reply) {

                    const response = {
                        version: request.plugins['hapi-api-version'].apiVersion,
                        data: request.params.versionedPathParam
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/v2/versioned/multiSegment/{segment*2}',
                handler: function (request, reply) {

                    const response = {
                        version: request.plugins['hapi-api-version'].apiVersion,
                        data: request.params.segment
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/v2/versioned/optionalPathParam/{optional?}',
                handler: function (request, reply) {

                    const response = {
                        version: request.plugins['hapi-api-version'].apiVersion,
                        data: request.params.optional
                    };

                    return reply(response);
                }
            });

            done();
        });

        it('resolves unversioned catch all routes', (done) => {

            server.inject({
                method: 'GET',
                url: '/unversioned/catch/all/route'
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(null);
                expect(response.result.data).to.equal('unversionedCatchAll');

                done();
            });
        });

        it('resolves versioned catch all routes', (done) => {

            const apiVersion = 2;

            server.inject({
                method: 'GET',
                url: '/versioned/catch/all/route',
                headers: {
                    'api-version': apiVersion
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(apiVersion);
                expect(response.result.data).to.equal('versionedCatchAll');

                done();
            });
        });

        it('resolves unversioned routes with path parameters', (done) => {

            const pathParam = '123456789';

            server.inject({
                method: 'GET',
                url: '/unversioned/withPathParam/' + pathParam
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(null);
                expect(response.result.data).to.equal(pathParam);

                done();
            });
        });

        it('resolves versioned routes with path parameters', (done) => {

            const pathParam = '123456789';
            const apiVersion = 1;

            server.inject({
                method: 'GET',
                url: '/versioned/withPathParam/' + pathParam,
                headers: {
                    'api-version': apiVersion
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(apiVersion);
                expect(response.result.data).to.equal(pathParam);

                done();
            });
        });

        it('resolves multi segment path parameters', (done) => {

            const apiVersion = 2;
            const pathParam = 'multi/segment';

            server.inject({
                method: 'GET',
                url: '/versioned/multiSegment/' + pathParam,
                headers: {
                    'api-version': apiVersion
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(apiVersion);
                expect(response.result.data).to.equal(pathParam);

                done();
            });
        });

        it('resolves optional path parameters - without optional value', (done) => {

            const apiVersion = 2;
            const pathParam = undefined;

            server.inject({
                method: 'GET',
                url: '/versioned/optionalPathParam/',
                headers: {
                    'api-version': apiVersion
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(apiVersion);
                expect(response.result.data).to.equal(pathParam);

                done();
            });
        });

        it('resolves optional path parameters - with optional value', (done) => {

            const apiVersion = 2;
            const pathParam = 'test';

            server.inject({
                method: 'GET',
                url: '/versioned/optionalPathParam/' + pathParam,
                headers: {
                    'api-version': apiVersion
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(apiVersion);
                expect(response.result.data).to.equal(pathParam);

                done();
            });
        });
    });
});

describe('Versioning with passive mode', () => {

    beforeEach((done) => {

        server.register([{
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 1,
                vendorName: 'mysuperapi',
                passiveMode: true
            }
        }], (err) => {

            if (err) {
                return console.error('Can not register plugins', err);
            }
        });

        server.route({
            method: 'GET',
            path: '/unversioned',
            handler: function (request, reply) {

                const response = {
                    data: 'unversioned'
                };

                return reply(response);
            }
        });

        done();
    });

    it('returns no version if no header is supplied', (done) => {

        server.inject({
            method: 'GET',
            url: '/unversioned'
        }, (response) => {

            expect(response.statusCode).to.equal(200);
            expect(response.result.version).to.equal(undefined);
            expect(response.result.data).to.equal('unversioned');

            done();
        });
    });
});

describe('Invalid Version Error Code', () => {

    beforeEach((done) => {

        server.register([{
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 1,
                vendorName: 'mysuperapi',
                invalidVersionErrorCode: 410
            }
        }], (err) => {

            if (err) {
                return console.error('Can not register plugins', err);
            }
        });

        server.route({
            method: 'GET',
            path: '/versioned',
            handler: function (request, reply) {

                return reply();
            }
        });

        done();
    });

    it('returns custom http response error code when version is invalid', (done) => {

        server.inject({
            method: 'GET',
            url: '/versioned',
            headers: {
                'Accept': 'application/vnd.mysuperapi.v5+json'
            }
        }, (response) => {

            expect(response.statusCode).to.equal(410);

            done();
        });
    });

});

describe('Versioning with custom base path', () => {

    beforeEach((done) => {

        server.register([{
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 1,
                vendorName: 'mysuperapi',
                basePath: '/api/'
            }
        }], (err) => {

            if (err) {
                return console.error('Can not register plugins', err);
            }
        });

        server.route({
            method: 'GET',
            path: '/unversioned',
            handler: function (request, reply) {

                const plugin = request.plugins['hapi-api-version'];
                const response = {
                    version: plugin ? plugin.apiVersion : void 0,
                    data: 'unversioned'
                };

                return reply(response);
            }
        });

        server.route({
            method: 'GET',
            path: '/api/v1/versioned',
            handler: function (request, reply) {

                const plugin = request.plugins['hapi-api-version'];
                const response = {
                    version: plugin ? plugin.apiVersion : void 0,
                    data: 'versioned'
                };

                return reply(response);
            }
        });

        done();
    });

    it('returns the default version', (done) => {

        server.inject({
            method: 'GET',
            url: '/api/versioned'
        }, (response) => {

            expect(response.statusCode).to.equal(200);
            expect(response.result.version).to.equal(1);
            expect(response.result.data).to.equal('versioned');

            done();
        });
    });

    it('returns 404 when the requested resource does not exist', (done) => {

        server.inject({
            method: 'GET',
            url: '/api/random'
        }, (response) => {

            expect(response.statusCode).to.equal(404);

            done();
        });
    });

    it('returns immediately when the requested path does not start with the versioned base path', (done) => {

        server.inject({
            method: 'GET',
            url: '/unversioned'
        }, (response) => {

            expect(response.statusCode).to.equal(200);
            expect(response.result.version).to.equal(undefined);
            expect(response.result.data).to.equal('unversioned');

            done();
        });
    });
});

describe('Multiple plugin registration', () => {

    beforeEach((done) => {

        const validVersions = [1, 2];
        const defaultVersion = 1;
        const basePath = '/api/';

        server.register([{
            register: require('../'),
            options: {
                validVersions: validVersions,
                defaultVersion: defaultVersion,
                vendorName: 'mysuperapi',
                basePath: basePath
            }
        }, {
            register: require('../'),
            options: {
                validVersions: validVersions,
                defaultVersion: defaultVersion,
                basePath: basePath,
                getVersion: (request, opts) => {

                    const version = request.query.version;
                    return version ? parseInt(request.query.version, 10) : null;
                }
            }
        }], (err) => {

            if (err) {
                console.error('Can not register plugins', err);
                return done(err);
            }
        });

        server.route({
            method: 'GET',
            path: '/unversioned',
            handler: function (request, reply) {

                const response = {
                    version: null,
                    data: 'unversioned'
                };

                return reply(response);
            }
        });

        server.route({
            method: 'GET',
            path: '/api/v1/versioned',
            handler: function (request, reply) {

                const plugin = request.plugins['hapi-api-version'];
                const response = {
                    version: 1,
                    count: plugin ? plugin.count : 0,
                    data: 'versioned'
                };

                return reply(response);
            }
        });

        server.route({
            method: 'GET',
            path: '/api/v2/versioned',
            handler: function (request, reply) {

                const plugin = request.plugins['hapi-api-version'];
                const response = {
                    version: 2,
                    count: plugin ? plugin.count : 0,
                    data: 'versioned'
                };

                return reply(response);
            }
        });

        done();
    });

    it('returns the default version', (done) => {

        server.inject({
            method: 'GET',
            url: '/api/versioned'
        }, (response) => {

            expect(response.statusCode).to.equal(200);
            expect(response.result.version).to.equal(1);
            expect(response.result.data).to.equal('versioned');

            done();
        });
    });

    it('returns 404 when the requested resource does not exist', (done) => {

        server.inject({
            method: 'GET',
            url: '/api/fail'
        }, (response) => {

            expect(response.statusCode).to.equal(404);

            done();
        });
    });

    it('returns the requested mediaType version and does not attempt to determine the version again', (done) => {

        server.inject({
            method: 'GET',
            url: '/api/versioned',
            headers: {
                'Accept': 'application/vnd.mysuperapi.v2+json'
            }
        }, (response) => {

            expect(response.statusCode).to.equal(200);
            expect(response.result.version).to.equal(2);
            expect(response.result.count).to.equal(1);
            expect(response.result.data).to.equal('versioned');

            done();
        });
    });

    it('returns the requested querystring version and does not attempt to determine the version again', (done) => {

        server.inject({
            method: 'GET',
            url: '/api/versioned?version=2'
        }, (response) => {

            expect(response.statusCode).to.equal(200);
            expect(response.result.version).to.equal(2);
            expect(response.result.count).to.equal(2);
            expect(response.result.data).to.equal('versioned');

            done();
        });
    });


    it('returns immediately when the requested path does not start with the versioned base path', (done) => {

        server.inject({
            method: 'GET',
            url: '/unversioned'
        }, (response) => {

            expect(response.statusCode).to.equal(200);
            expect(response.result.version).to.equal(null);
            expect(response.result.data).to.equal('unversioned');

            done();
        });
    });
});
