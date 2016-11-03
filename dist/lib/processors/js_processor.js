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
JsProcessor.prototype.I18nJsExtractor = _i18n_js_extractor2.default;

JsProcessor.prototype.checkContents = function (source, name) {
  var fileData = this.preProcess(source);
  if (fileData.skip) {
    this.log.debug(this.log.name + ': skipping ' + name);
    return;
  }
  this.log.debug(this.log.name + ': processing ' + name);
  var extractor = new this.I18nJsExtractor(fileData);
  var found = 0;
  extractor.forEach(function (key, value, meta) {
    this.translations.set(key, value, meta);
    this.translationCount++;
    found++;
  }.bind(this));
  if (found) {
    this.log.debug(this.log.name + ': found ' + found + ' translation' + (found != 1 ? 's' : ''));
  }
  return found;
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
