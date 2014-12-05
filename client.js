require('yamlify/register');
require('coffee-script/register');

var starter = require('./starter');

var script = require(process.env.SCRIPT);

starter(script);

