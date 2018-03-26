var ulog = require('ulog');
var fs = require('fs');
var BaseProcessor = require('./base_processor');
var I18nJsExtractor = require('../extractors/i18n_js_extractor');

var parse = require('babylon').parse;

const log = ulog("i18nline:processors:js");

function JsProcessor(translations, options) {
  BaseProcessor.call(this, translations, options);
}

JsProcessor.prototype = Object.create(BaseProcessor.prototype);
JsProcessor.prototype.constructor = JsProcessor;
JsProcessor.prototype.I18nJsExtractor = I18nJsExtractor;

JsProcessor.prototype.checkContents = function(source, name) {
  var fileData = this.preProcess(source);
  fileData.ast = fileData.ast || this.parse(fileData.source);
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

JsProcessor.prototype.parse = function(source) {
  return parse(source, { plugins: ["jsx", "classProperties", "objectRestSpread"], sourceType: "module" });
};

JsProcessor.prototype.preProcess = function(source) {
  return {
    source: source,
    skip: !source.match(/I18n\.t/)
  };
};

module.exports = JsProcessor;

log.debug('Initialized ' + log.name);
