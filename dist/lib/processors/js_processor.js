"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var fs = _interopRequire(require("fs"));

var AbstractProcessor = _interopRequire(require("./abstract_processor"));

var I18nJsExtractor = _interopRequire(require("../extractors/i18n_js_extractor"));

function JsProcessor(translations, options) {
  AbstractProcessor.call(this, translations, options);
}

JsProcessor.prototype = Object.create(AbstractProcessor.prototype);
JsProcessor.prototype.constructor = JsProcessor;
JsProcessor.prototype.defaultPattern = "**/*.js";
JsProcessor.prototype.I18nJsExtractor = I18nJsExtractor;

JsProcessor.prototype.checkContents = function (source) {
  if (!source.match(/I18n\.t/)) return;
  var extractor = new this.I18nJsExtractor(this.preProcess(source));
  extractor.forEach((function (key, value, meta) {
    this.translations.set(key, value, meta);
    this.translationCount++;
  }).bind(this));
};

JsProcessor.prototype.sourceFor = function (file) {
  return fs.readFileSync(file).toString();
};

JsProcessor.prototype.preProcess = function (source) {
  return { source: source };
};

module.exports = JsProcessor;