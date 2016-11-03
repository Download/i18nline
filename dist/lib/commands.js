'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _check = require('./commands/check');

var _check2 = _interopRequireDefault(_check);

var _export = require('./commands/export');

var _export2 = _interopRequireDefault(_export);

var _help = require('./commands/help');

var _help2 = _interopRequireDefault(_help);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* global process */

var log = _utils2.default.createLogger('i18nline');

function capitalize(string) {
  return typeof string === "string" && string ? string.slice(0, 1).toUpperCase() + string.slice(1) : string;
}

var Commands = {
  run: function run(name, options) {
    name = name || 'help';
    options = options || {};
    log.debug(log.name + ': ' + name, options);
    if (name != 'help' && !options.directories) {
      options.directories = autoConfigureDirectories(options);
    }
    var Command = this[capitalize(name)];
    if (Command) {
      try {
        return new Command(options).run();
      } catch (e) {
        log.error(log.name + ': ERROR: ' + e.message + "\n");
      }
    } else {
      log.error(log.name + ": ERROR: unknown command " + name + "\n");
    }
    return false;
  },

  Check: _check2.default,
  Export: _export2.default,
  Help: _help2.default
};

function autoConfigureDirectories(options) {
  log.debug(log.name + ': autoConfigureDirectories');
  var base = _path2.default.resolve(process.cwd(), options.basePath);
  return _fs2.default.readdirSync(base).filter(function (file) {
    return _fs2.default.statSync(_path2.default.resolve(base, file)).isDirectory() && options.ignoreDirectories.indexOf(file) === -1;
  });
}

exports.default = Commands;
