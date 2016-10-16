"use strict";

const _ = require('lodash');

module.exports = {
    basicTemplate: {
        status: "<PLACEHOLDER:status>",
        request: {
            query: "<PLACEHOLDER:query>",
            body: "<PLACEHOLDER:body>"
        },
        data: "<PLACEHOLDER:data>"
    },

    build (values, template){
        template = template || this.basicTemplate;

        let result = JSON.stringify(template);

        _.forEach(values, (value, key) => {
            result = result.replace(new RegExp('"' + key + '"', 'g'), JSON.stringify(value));
        });

        return JSON.parse(result);
    }
};