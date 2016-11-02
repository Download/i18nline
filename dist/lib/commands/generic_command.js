'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

var _i18nline = require('../i18nline');

var _i18nline2 = _interopRequireDefault(_i18nline);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function GenericCommand(options) {
  this.options = options;
  this.log = _utils2.default.createLogger('i18nline:' + this.constructor.name, options.silent || options.s);
}

exports.default = GenericCommand;
