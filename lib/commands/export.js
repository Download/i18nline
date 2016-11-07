var log = require('../log')('i18nline:commands:export');

var fs = require('fs');
var mkdirp = require('mkdirp');
var Check = require('./check');
var I18nline = require('../../lib/i18nline');

function Export(options) {
  Check.call(this, options);
}

Export.prototype = Object.create(Check.prototype);
Export.prototype.constructor = Export;

Export.prototype.run = function() {
  this.log.log(this.log.name + ': export', this.options)
  var success = Check.prototype.run.call(this);
  var locale = 'en';
  var translations = {};
  translations[locale] = this.translations.translations;
  var basePath = this.options.basePath || I18nline.config.basePath;
  var outputFile = this.options.outputFile || I18nline.config.outputFile;
  this.outputFile = basePath + '/' + outputFile;
  mkdirp.sync(this.outputFile.replace(/\/[^\/]+$/, ''));
  if (success) {
    fs.writeFileSync(this.outputFile, JSON.stringify(translations, null, 2));
    this.log.info("Wrote default translations to " + this.outputFile + "\n");
  }
  return success;
};

module.exports = Export;

log.log('Initialized ' + log.name);
