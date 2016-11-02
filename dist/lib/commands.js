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
    options = options || {};
    if (!name) {
      name = 'help';
    }
    var Command = this[capitalize(name)];
    if (Command) {
      if (name != 'help' && !options.directories && !options.directory) {
        log.warn(log.name + ': WARN: No directories set in options', options);
        log.warn(log.name + ': WARN: Either configure the default search directories in .i18nrc,');
        log.warn(log.name + ': WARN: or pass the --directories command line option.');

        var directories = [];
        var defaultDirs = ['src', 'lib'];
        defaultDirs.forEach(function (dir) {
          try {
            var stats = _fs2.default.lstatSync(dir);
            if (stats && stats.isDirectory()) {
              directories.push(dir);
            }
          } catch (e) {
            log.debug(log.name + ': Directory not found: ' + dir);
          }
        });
        if (!directories.length) {
          log.warn(log.name + ': WARN: None of the default directories found', defaultDirs);
          log.warn(log.name + ': WARN: Falling back to using project root directory');
          log.warn(log.name + ': WARN: This may take a long time. CTRL+C to abort');
          log.warn('');
        } else {
          log.warn(log.name + ': WARN: Using default directories', directories);
          options.directories = directories;
        }
      }

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

exports.default = Commands;
