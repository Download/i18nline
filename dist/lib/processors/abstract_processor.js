"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _gglobby = require("gglobby");

var _gglobby2 = _interopRequireDefault(_gglobby);

var _utils = require("../utils");

var _utils2 = _interopRequireDefault(_utils);

var _i18nline = require("../i18nline");

var _i18nline2 = _interopRequireDefault(_i18nline);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function chdir(dir, cb) {
  var origDir = process.cwd();
  try {
    process.chdir(dir);
    return cb();
  } finally {
    process.chdir(origDir);
  }
} /* global process */

function AbstractProcessor(translations, options) {
  this.log = _utils2.default.createLogger('i18nline:' + this.constructor.name, options.silent || options.s);
  this.log.debug(this.log.name + ': Initializing processor', options);
  this.translations = translations;
  this.translationCount = 0;
  this.fileCount = 0;
  this.file = options.file;
  this.only = options.only;
  this.checkWrapper = options.checkWrapper || this.checkWrapper;
  this.directories = options.directories;
  this.patterns = options.patterns;
  this.ignorePatterns = options.ignorePatterns;
  this.log.debug(this.log.name + ': Initialized processor', this);
}

AbstractProcessor.prototype.checkWrapper = function (file, checker) {
  return checker(file);
};

AbstractProcessor.prototype.files = function (directory) {
  return chdir(directory, function () {
    var fileScope = _gglobby2.default.select(this.patterns).reject(this.ignorePatterns).reject(_i18nline2.default.ignore());
    if (this.only) {
      fileScope = fileScope.select(this.only instanceof Array ? this.only : [this.only]);
    }
    return fileScope.files;
  }.bind(this));
};

AbstractProcessor.prototype.checkFiles = function () {
  var directories = this.getDirectories();
  var directoriesLen = directories.length;
  var i;
  for (i = 0; i < directoriesLen; i++) {
    this.checkFilesIn(directories[i]);
  }
};

AbstractProcessor.prototype.checkFilesIn = function (directory) {
  var files = this.files(directory);
  var filesLen = files.length;
  var checkWrapper = this.checkWrapper;
  var checkFile = this.checkFile.bind(this);
  var i;
  this.log.debug(this.log.name + ': processing ' + directory + '  (' + filesLen + ' files)');
  for (i = 0; i < filesLen; i++) {
    checkWrapper(directory + "/" + files[i], checkFile);
  }
};

AbstractProcessor.prototype.checkFile = function (file) {
  this.fileCount++;
  return this.checkContents(this.sourceFor(file), file);
};

AbstractProcessor.prototype.getDirectories = function () {
  if (this.directories) return this.directories;
  if (_i18nline2.default.config.directories) return typeof _i18nline2.default.config.directories == 'string' ? _i18nline2.default.config.directories.split(',') : _i18nline2.default.config.directories;
  return [_i18nline2.default.config.basePath];
};

exports.default = AbstractProcessor;
