"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require("mkdirp");

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _check = require("./check");

var _check2 = _interopRequireDefault(_check);

var _i18nliner = require("../../lib/i18nliner");

var _i18nliner2 = _interopRequireDefault(_i18nliner);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Export(options) {
  _check2.default.call(this, options);
}

Export.prototype = Object.create(_check2.default.prototype);
Export.prototype.constructor = Export;

Export.prototype.run = function () {
  var success = _check2.default.prototype.run.call(this);
  var locale = 'en';
  var translations = {};
  translations[locale] = this.translations.translations;
  this.outputFile = _i18nliner2.default.config.basePath + '/' + (this.options.outputFile || "config/locales/generated/" + locale + ".json");
  _mkdirp2.default.sync(this.outputFile.replace(/\/[^\/]+$/, ''));
  if (success) {
    _fs2.default.writeFileSync(this.outputFile, JSON.stringify(translations));
    this.print("Wrote default translations to " + this.outputFile + "\n");
  }
  return success;
};

exports.default = Export;
