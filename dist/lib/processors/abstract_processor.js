"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _gglobby = require("gglobby");

var _gglobby2 = _interopRequireDefault(_gglobby);

var _i18nliner = require("../i18nliner");

var _i18nliner2 = _interopRequireDefault(_i18nliner);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* global process */

function chdir(dir, cb) {
  var origDir = process.cwd();
  try {
    process.chdir(dir);
    return cb();
  } finally {
    process.chdir(origDir);
  }
}

function AbstractProcessor(translations, options) {
  this.translations = translations;
  this.translationCount = 0;
  this.fileCount = 0;
  this.checkWrapper = options.checkWrapper || this.checkWrapper;
  this.pattern = options.pattern || this.defaultPattern;
  this.file = options.file;
  if (options.directory) this.directories = [options.directory];
  this.only = options.only;
}

AbstractProcessor.prototype.checkWrapper = function (file, checker) {
  checker(file);
};

AbstractProcessor.prototype.files = function (directory) {
  var pattern = this.pattern instanceof Array ? this.pattern : [this.pattern];
  return chdir(directory, function () {
    var fileScope = _gglobby2.default.select(pattern).reject(["/node_modules", "/bower_components"]).reject(_i18nliner2.default.ignore());
    if (this.only) {
      var only = this.only instanceof Array ? this.only : [this.only];
      fileScope = fileScope.select(only);
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
  if (_i18nliner2.default.config.directories.length) return _i18nliner2.default.config.directories;
  return [_i18nliner2.default.config.basePath];
};

exports.default = AbstractProcessor;
