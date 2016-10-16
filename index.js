"use strict";

const restify = require('restify');
const bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs'));
const _ = require('lodash');
const join = require('path').join;

module.exports = {
    _routes: [],

    _functions: [],

    _prepareURL (file, path) {
        return '/' + file.split('.')[0] + path;
    },

    responseBuilder: require('./response-builder'),

    setup (servername, version, port, routesDirectory, functionsDirectory) {
        const context = this;
        const server = restify.createServer({
            name: servername,
            version: version
        });

        server.use(restify.acceptParser(server.acceptable));
        server.use(restify.queryParser());
        server.use(restify.bodyParser());

        this._loadFunctions(functionsDirectory).then(()=> {
            return context._loadRoutes(server, routesDirectory);
        }).then(()=> {
            server.listen(port, () => {
                console.log('%s listening at %s', server.name, server.url);
            });
        });
    },

    _loadRoutes (server, routesDirectory)  {
        const context = this;

        return fs.readdirAsync(routesDirectory).then((files)=> {
            _.forEach(files, (file) => {
                const routes = require(join(routesDirectory, file));

                _.forEach(routes, (route) => {
                    const routePath = context._prepareURL(file, route.path);
                    context._routes.push({
                        path: routePath,
                        method: route.method,
                        route: server[route.method](routePath, (req, res) => {
                            const functionResult = _.find(context._functions, {name: context._prepareURL(file, route.functionName)}).func(req.params || {}, req.body || {});

                            if (typeof functionResult.then === 'function') {
                                functionResult.then((result) => {
                                    res.json(200, result);
                                });
                            } else {
                                res.json(200, functionResult);
                            }
                        })
                    });
                });
            });
        });
    },

    _loadFunctions (functionsDirectory) {
        const context = this;

        return fs.readdirAsync(functionsDirectory).then((files)=> {
            _.forEach(files, (file) => {
                const functions = require(join(functionsDirectory, file));
                _.forEach(functions, (func) => {
                    context._functions.push({
                        name: context._prepareURL(file, func.name),
                        func: func.func
                    });
                });
            });
        });
    }
};