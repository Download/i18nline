#!/usr/bin/env node

var minimist = require('minimist');
var argv = minimist(process.argv.slice(2));
var i18nline = require('../dist/lib/main').default;

i18nline.Commands.run(argv._[0], argv);
