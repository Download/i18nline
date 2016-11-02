"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require("mkdirp");

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _figlet = require("figlet");

var _figlet2 = _interopRequireDefault(_figlet);

var _generic_command = require("./generic_command");

var _generic_command2 = _interopRequireDefault(_generic_command);

var _i18nline = require("../../lib/i18nline");

var _i18nline2 = _interopRequireDefault(_i18nline);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Help(options) {
  _generic_command2.default.call(this, options);
}

Help.prototype = Object.create(_generic_command2.default.prototype);
Help.prototype.constructor = Help;

Help.prototype.run = function () {
  var log = this.log;
  log.info('');
  log.info('  ██╗    ███╗   ██╗██╗     ██╗███╗   ██╗███████╗ ');
  log.info('  ██║    ████╗  ██║██║     ██║████╗  ██║██╔════╝ ');
  log.info('  ██║ 18 ██╔██╗ ██║██║     ██║██╔██╗ ██║█████╗   ');
  log.info('  ██║    ██║╚██╗██║██║     ██║██║╚██╗██║██╔══╝   ');
  log.info('  ██║    ██║ ╚████║███████╗██║██║ ╚████║███████╗ ');
  log.info('  ╚═╝    ╚═╝  ╚═══╝╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝ ');
  log.info('          KEEP YOUR TRANSLATIONS IN LINE         ');
  log.info('');
  log.info('Usage');
  log.info('-----');
  log.info('i18nline command [options]');
  log.info('');
  log.info('Commands');
  log.info('--------');
  log.info('check     Performs a dry-run with all checks, but does not write any files');
  log.info('export    Performs a check, then writes the default translation file');
  log.info('help      Prints this help screen');
  log.info('');
  log.info('Options');
  log.info('--------');
  log.info('--directory    Sets the directory in which to search');
  log.info('--directories  Sets the directories in which to search (comma separated)');
  log.info('--pattern      Sets the file matching pattern (defaults to \'**/*.js\')');
  log.info('--patterns     Sets the file matching patterns (comma separated)');
  log.info('--only         Only process a single file/directory/pattern');
  log.info('--outputFile   Where should the output file be written');
  log.info('--silent       Don\'t log any message');
  log.info('-s             Alias for --silent');
  log.info('');
  log.info('Examples');
  log.info('--------');
  log.info('$ i18nline check --only=src/some-file.js');
  log.info('> Only check the given file for errors');
  log.info('');
  log.info('$ i18nline export --directory=src --patterns=**/*.js,**/*.jsx');
  log.info('> Export all translations in directory source from .js and .jsx files');
  log.info('> to default output file config/locales/generated/en.json');
  log.info('');
  log.info('$ i18nline export --directory=src --outputFile=translations/en.json');
  log.info('> Export all translations in directory source from .js files');
  log.info('> to the given output file translations/en.json');
  log.info('');
  log.info('See what\'s happening');
  log.info('---------------------');
  log.info('i18nline uses ulog for it\'s logging, when available. To use it:');
  log.info('$ npm install --save-dev ulog');
  log.info('$ log=DEBUG   (or LOG, INFO, WARN, ERROR)');
  log.info('Now, i18nline will log any messages at or above the set level');
  log.info('');
  return 0;
};

exports.default = Help;
