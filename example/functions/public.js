"use strict";

const responseBuilder = require('../../index').responseBuilder;

module.exports = [
    {
        name: 'testFunc',
        func: (query, body) => {
            return {hello: 'world'};
        }
    }, {
        name: 'testFuncWithTemplate',
        func: (query, body) => {
            return responseBuilder.build({
                '<PLACEHOLDER:status>': 'ok',
                '<PLACEHOLDER:query>': query,
                '<PLACEHOLDER:body>': body,
                '<PLACEHOLDER:data>': {hello: 'world'}
            });
        }
    }
];