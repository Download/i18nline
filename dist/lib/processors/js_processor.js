"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _abstract_processor = require("./abstract_processor");

var _abstract_processor2 = _interopRequireDefault(_abstract_processor);

var _i18n_js_extractor = require("../extractors/i18n_js_extractor");

var _i18n_js_extractor2 = _interopRequireDefault(_i18n_js_extractor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function JsProcessor(translations, options) {
  _abstract_processor2.default.call(this, translations, options);
}

JsProcessor.prototype = Object.create(_abstract_processor2.default.prototype);
JsProcessor.prototype.constructor = JsProcessor;
JsProcessor.prototype.defaultPattern = "**/*.js";
JsProcessor.prototype.I18nJsExtractor = _i18n_js_extractor2.default;

JsProcessor.prototype.checkContents = function (source) {
  var fileData = this.preProcess(source);
  if (fileData.skip) return;
  var extractor = new this.I18nJsExtractor(fileData);
  extractor.forEach(function (key, value, meta) {
    this.translations.set(key, value, meta);
    this.translationCount++;
  }.bind(this));
};

JsProcessor.prototype.sourceFor = function (file) {
  return _fs2.default.readFileSync(file).toString();
};

JsProcessor.prototype.preProcess = function (source) {
  return {
    source: source,
    skip: !source.match(/I18n\.t/)
  };
};

exports.default = JsProcessor;
