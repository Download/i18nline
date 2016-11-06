#!/usr/bin/env node

var minimist = require('minimist');
var argv = minimist(process.argv.slice(2));
var log = require('../lib/log')('i18nline', argv.s || argv.silent)
var I18nline = require('../lib/main');
var Utils = require('../lib/utils');

var config = I18nline.config;
var command = argv._[0];
var options = Utils.extend({}, config, argv);
options.patterns = typeof options.patterns == 'string' ? options.patterns.split(',') : options.patterns || [];
options.ignorePatterns = typeof options.ignorePatterns == 'string' ? options.ignorePatterns.split(',') : options.ignorePatterns || [];
options.directories = typeof options.directories == 'string' ? options.directories.split(',') : options.directories;

I18nline.Commands.run(command, options);
