var log = require('../log')('i18nline:commands:base');

var fs = require('fs');
var extend = require('extend');
var I18nline = require('../i18nline');

function BaseCommand(options) {
  options.outputFile = options.o || options.outputFile;
  options = extend({}, I18nline.config, options);
  options.patterns = typeof options.patterns == 'string' ? options.patterns.split(',') : options.patterns || [];
  options.ignorePatterns = typeof options.ignorePatterns == 'string' ? options.ignorePatterns.split(',') : options.ignorePatterns || [];
  options.directories = typeof options.directories == 'string' ? options.directories.split(',') : options.directories;

  
  this.options = options;
  this.log = require('../log')(
    'i18nline:' + this.constructor.name, 
    options.silent || options.s
  );
}

module.exports = BaseCommand;

log.log('Initialized ' + log.name);
