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
        pattern: this.options.pattern,
        only: this.options.only,
        directory: this.options.directory
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
    checker(file);
    this.print(green("."));
  } catch (e) {
    this.errors.push(e.message + "\n" + file);
    this.print(red("F"));
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

  this.print("\n\n");

  for (i = 0; i < errorsLen; i++) {
    this.print((i + 1) + ")\n" + red(errors[i]) + "\n\n");
  }
  this.print("Finished in " + (elapsed / 1000) + " seconds\n\n");
  summary = fileCount + " files, " + translationCount + " strings, " + errorsLen + " failures";
  this.print((this.isSuccess() ? green : red)(summary) + "\n");
};

Check.prototype.run = function() {
  this.startTime = (new Date()).getTime();
  this.checkFiles();
  this.printSummary();
  return this.isSuccess();
};

Check.processors = { JsProcessor };

export default Check;
