"use strict";

const restify = require('restify');
const bluebird = require('bluebird');
const fs = require('fs');
const _ = require('lodash');
const join = require('path').join;

module.exports = {
    _routes: [],

    _functions: [],

    _concatPath (file, path) {
        return '/' + file.split('.')[0] + path;
    },

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
            context._loadRoutes(server, routesDirectory).then(()=> {
                server.listen(port, () => {
                    console.log('%s listening at %s', server.name, server.url);
                });
            });
        });
    },

    _loadRoutes (server, routesDirectory)  {
        const context = this;
        return new bluebird((resolve, reject) => {
            fs.readdir(routesDirectory, (err, files)=> {
                if (err) {
                    reject(err);
                } else {
                    _.each(files, (file) => {
                        const routes = require(join(routesDirectory, file));

                        _.each(routes, (route) => {
                            const routePath = context._concatPath(file, route.path);
                            context._routes.push({
                                path: routePath,
                                method: route.method,
                                route: server[route.method](routePath, (req, res) => {
                                    const functionResult = _.find(context._functions, {name: context._concatPath(file, route.functionName)}).func(req.params, req.body);

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

                    resolve();
                }
            });
        });
    },

    _loadFunctions (functionsDirectory) {
        const context = this;

        return new bluebird((resolve, reject) => {
            fs.readdir(functionsDirectory, (err, files)=> {
                if (err) {
                    reject(err);
                } else {
                    _.each(files, (file) => {
                        const functions = require(join(functionsDirectory, file));

                        _.each(functions, (func) => {
                            context._functions.push({
                                name: context._concatPath(file, func.name),
                                func: func.func
                            });
                        });
                    });

                    resolve();
                }
            });
        });
    }
};