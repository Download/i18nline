var log = require('../log')('i18nline:processors:base');

var fs = require('fs');
var path = require('path');
var Globby = require('gglobby');
var GlObject = require('gglobby/dist/lib/globject');

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

function getFilesAndDirs(root, files, dirs) {
  root = root === "." ? "" : root + "/";
  files = files || [];
  dirs = dirs || [];
  fs.readdirSync(root || ".").forEach(function(entry){
    if (fs.statSync(root + entry).isDirectory()) {
      dirs.push(root + entry + "/");
      getFilesAndDirs(root + entry, files, dirs);
    } else {
      files.push(root + entry);
    }
  })
  return {files:files, dirs:dirs};
}

function BaseProcessor(translations, options) {
  this.translations = translations;
  this.translationCount = 0;
  this.fileCount = 0;
  this.file = options.file;
  this.only = options.only;
  this.checkWrapper = options.checkWrapper || this.checkWrapper;
  this.directories = options.directories;
  this.patterns = options.patterns;
  this.ignorePatterns = options.ignorePatterns;
  if (I18nline.config.out && !I18nline.config.out.endsWith('.json')) {
    this.ignorePatterns.push(I18nline.config.out + (I18nline.config.out.endsWith('/') ? '':'/') + 'index.js');
  }
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
  var result = Globby
    .select(this.patterns, getFilesAndDirs(directory))
    .reject(this.ignorePatterns)
    .reject(this.ignore());
  if (this.only) {
    result = result.select(this.only instanceof Array ? this.only : [this.only]);
  }
  return result.files;
};

BaseProcessor.prototype.checkFiles = function() {
  var directories = this.getDirectories();
  chdir(I18nline.config.basePath, function(){
    for (var i=0,l=directories.length; i<l; i++) {
      this.checkFilesIn(directories[i]);
    }
  }.bind(this));
};

BaseProcessor.prototype.checkFilesIn = function(directory) {
  var files = this.files(directory);
  var filesLen = files.length;
  var checkWrapper = this.checkWrapper;
  var checkFile = this.checkFile.bind(this);
  var i;
  log.debug(log.name + ': processing ' + directory + '  (' + filesLen + ' files)');
  for (i = 0; i < filesLen; i++) {
    checkWrapper(files[i], checkFile);
  }
};

BaseProcessor.prototype.checkFile = function(file) {
  this.fileCount++;
  return this.checkContents(this.sourceFor(file), file);
};

BaseProcessor.prototype.getDirectories = function() {
  if (this.directories) return this.directories;
  if (I18nline.config.directories) return typeof I18nline.config.directories == 'string' ? I18nline.config.directories.split(',') : I18nline.config.directories;
  return ["."];
};

module.exports = BaseProcessor;

log.debug('Initialized ' + log.name);
