var log = require('../log')('i18nline:commands:base');
var chalk = require("chalk");
var fs = require('fs');
var extend = require('extend');
var I18nline = require('../i18nline');

function BaseCommand(options) {
  if (options.silent) log.level = log.NONE;
  options.out = options.o || options.out || options.outputFile;
  if (options.outputFile) {
    log.warn(chalk.yellow('i18nline: Option `outputFile` is deprecated. Prefer `out` instead.'));
  }
  options = extend({}, I18nline.config, options);
  options.patterns = typeof options.patterns == 'string' ? options.patterns.split(',') : options.patterns || [];
  options.ignorePatterns = typeof options.ignorePatterns == 'string' ? options.ignorePatterns.split(',') : options.ignorePatterns || [];
  options.directories = typeof options.directories == 'string' ? options.directories.split(',') : options.directories;
  this.options = options;
}

module.exports = BaseCommand;

log.debug('Initialized ' + log.name);
