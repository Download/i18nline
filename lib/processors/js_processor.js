var log = require('../log')('i18nline:processors:js');

var fs = require('fs');
var BaseProcessor = require('./base_processor');
var I18nJsExtractor = require('../extractors/i18n_js_extractor');

function JsProcessor(translations, options) {
  BaseProcessor.call(this, translations, options);
}

JsProcessor.prototype = Object.create(BaseProcessor.prototype);
JsProcessor.prototype.constructor = JsProcessor;
JsProcessor.prototype.I18nJsExtractor = I18nJsExtractor;

JsProcessor.prototype.checkContents = function(source, name) {
  var fileData = this.preProcess(source);
  if (fileData.skip) {return;}
  var extractor = new this.I18nJsExtractor(fileData);
  var found = 0;
  extractor.forEach(function(key, value, meta) {
    this.translations.set(key, value, meta);
    this.translationCount++;
    found++;
  }.bind(this));
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

log.debug('Initialized ' + log.name);
