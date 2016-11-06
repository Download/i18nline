var fs = require('fs');
var AbstractProcessor = require('./abstract_processor');
var I18nJsExtractor = require('../extractors/i18n_js_extractor');

function JsProcessor(translations, options) {
  AbstractProcessor.call(this, translations, options);
}

JsProcessor.prototype = Object.create(AbstractProcessor.prototype);
JsProcessor.prototype.constructor = JsProcessor;
JsProcessor.prototype.I18nJsExtractor = I18nJsExtractor;

JsProcessor.prototype.checkContents = function(source, name) {
  var fileData = this.preProcess(source);
  if (fileData.skip) { 
    this.log.debug(this.log.name + ': skipping ' + name);
    return;
  }
  this.log.debug(this.log.name + ': processing ' + name);
  var extractor = new this.I18nJsExtractor(fileData);
  var found = 0;
  extractor.forEach(function(key, value, meta) {
    this.translations.set(key, value, meta);
    this.translationCount++;
    found++;
  }.bind(this));
  if (found) {this.log.debug(this.log.name + ': found ' + found + ' translation' + (found != 1 ? 's' : ''));}
  return found;
};

JsProcessor.prototype.sourceFor = function(file) {
  return fs.readFileSync(file).toString();
};

JsProcessor.prototype.preProcess = function(source) {
  return {
    source: source,
    skip: !source.match(/I18n\.t/)
  };
};

module.exports = JsProcessor;
