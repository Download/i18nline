#!/usr/bin/env node

var minimist = require('minimist');
var extend = require('extend');
var argv = minimist(process.argv.slice(2));

var log = require('../lib/log')('i18nline', argv.s || argv.silent)

var command = argv._[0];
delete argv._
var I18nline = require('../lib/main').configure(argv);
I18nline.Commands.run(command, I18nline.config);
