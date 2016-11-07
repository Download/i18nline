var log = require('../log')('i18nline:processors:base');

var fs = require('fs');
var Globby = require('gglobby');

var Utils = require('../utils');
var I18nline = require('../i18nline');

function chdir(dir, cb) {
  var origDir = process.cwd();
  try {
    process.chdir(dir);
    return cb();
  }
  finally {
    process.chdir(origDir);
  }
}

function BaseProcessor(translations, options) {
  this.log = require('../log')(
    'i18nline:' + this.constructor.name, 
    options.silent || options.s
  );
  this.log.debug(this.log.name + ': Initializing processor', options)
  this.translations = translations;
  this.translationCount = 0;
  this.fileCount = 0;
  this.file = options.file;
  this.only = options.only;
  this.checkWrapper = options.checkWrapper || this.checkWrapper;
  this.directories = options.directories;
  this.patterns = options.patterns;
  this.ignorePatterns = options.ignorePatterns;
  this.log.debug(this.log.name + ': Initialized processor', this)
}

BaseProcessor.prototype.checkWrapper = function(file, checker) {
  return checker(file);
};

BaseProcessor.prototype.ignore = function() {
  if (fs.existsSync(".i18nignore")) {
      return fs.readFileSync(".i18nignore").toString().trim().split(/\r?\n|\r/)
  }
  return [];
}

BaseProcessor.prototype.files = function(directory) {
  return chdir(directory, function() {
    var fileScope = Globby
      .select(this.patterns)
      .reject(this.ignorePatterns)
      .reject(this.ignore());
    if (this.only) {
      fileScope = fileScope.select(this.only instanceof Array ? this.only : [this.only]);
    }
    return fileScope.files;
  }.bind(this));
};

BaseProcessor.prototype.checkFiles = function() {
  var directories = this.getDirectories();
  var directoriesLen = directories.length;
  var i;
  for (i = 0; i < directoriesLen; i++) {
    this.checkFilesIn(directories[i]);
  }
};

BaseProcessor.prototype.checkFilesIn = function(directory) {
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

BaseProcessor.prototype.checkFile = function(file) {
  this.fileCount++;
  return this.checkContents(this.sourceFor(file), file);
};

BaseProcessor.prototype.getDirectories = function() {
  if (this.directories) return this.directories;
  if (I18nline.config.directories) return typeof I18nline.config.directories == 'string' ? I18nline.config.directories.split(',') : I18nline.config.directories;
  return [I18nline.config.basePath];
};

module.exports = BaseProcessor;

log.log('Initialized ' + log.name);
