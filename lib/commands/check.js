import clc from "cli-color";

import TranslationHash from "../extractors/translation_hash";
import GenericCommand from "./generic_command";
import JsProcessor from "../processors/js_processor";

var red = clc.red;
var green = clc.green;

function sum(array, prop) {
  var total = 0;
  for (var i = 0, len = array.length; i < len; i++) {
    total += array[i][prop];
  }
  return total;
}

function Check(options) {
  GenericCommand.call(this, options);
  this.errors = [];
  this.translations = new this.TranslationHash();
  this.setUpProcessors();
}

Check.prototype = Object.create(GenericCommand.prototype);
Check.prototype.constructor = Check;

Check.prototype.TranslationHash = TranslationHash;

Check.prototype.setUpProcessors = function() {
  this.processors = [];
  for (var key in Check.processors) {
    var Processor = Check.processors[key];
    this.processors.push(
      new Processor(this.translations, {
        translations: this.translations,
        checkWrapper: this.checkWrapper.bind(this),
        only: this.options.only,
        patterns: this.options.patterns,
        ignorePatterns: this.options.ignorePatterns,
        directories: this.options.directories,
        ignoreDirectories: this.options.ignoreDirectories,
      })
    );
  }
};

Check.prototype.checkFiles = function() {
  for (var i = 0; i < this.processors.length; i++) {
    this.processors[i].checkFiles();
  }
};

Check.prototype.checkWrapper = function(file, checker) {
  try {
    var found = checker(file);
    if (found) {this.log.info(green("+" + found));}
    else {this.log.info(".");}
    return found;
  } catch (e) {
    this.errors.push(e.message + "\n" + file);
    this.log.error(red("ERR" + this.errors.length));
    return 0;
  }
};

Check.prototype.isSuccess = function() {
  return !this.errors.length;
};

Check.prototype.printSummary = function() {
  var processors = this.processors;
  var summary;
  var errors = this.errors;
  var errorsLen = errors.length;
  var i;

  var translationCount = sum(processors, 'translationCount');
  var fileCount = sum(processors, 'fileCount');
  var elapsed = (new Date()).getTime() - this.startTime;

  this.log.info("\n\n");

  for (i = 0; i < errorsLen; i++) {
    this.log.error("ERR" + (i+1) + ")\n" + red(errors[i]) + "\n\n");
  }
  this.log.info("Finished in " + (elapsed / 1000) + " seconds\n\n");
  summary = fileCount + " files, " + translationCount + " strings, " + errorsLen + " failures";
  if (this.isSuccess()) {this.log.info(green(summary));} 
  else {this.log.error(red(summary));}
  this.log.info("\n");
};

Check.prototype.run = function() {
  var now = new Date();
  this.startTime = now.getTime();
  this.log.log(this.log.name + ': check started at ' + now);
  this.checkFiles();
  this.printSummary();
  return this.isSuccess();
};

Check.processors = { JsProcessor };

export default Check;
