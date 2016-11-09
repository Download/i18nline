#!/usr/bin/env node

var minimist = require('minimist');
var extend = require('extend');
var argv = minimist(process.argv.slice(2));

var log = require('../lib/log')('i18nline', argv.s || argv.silent)

var I18nline = require('../lib/main');
var normalize = require('../lib/load-config').normalize;

var config = I18nline.config;
var command = argv._[0];
var options = normalize(extend({}, config, argv));

I18nline.Commands.run(command, options);
