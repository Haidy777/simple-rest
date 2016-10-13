"use strict";

const simpleRest = require('../index');
const join = require('path').join;

simpleRest.setup('sampleServer', '0.0.1', 3000, join(__dirname, 'routes'), join(__dirname, 'functions'));