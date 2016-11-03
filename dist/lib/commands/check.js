"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cliColor = require("cli-color");

var _cliColor2 = _interopRequireDefault(_cliColor);

var _translation_hash = require("../extractors/translation_hash");

var _translation_hash2 = _interopRequireDefault(_translation_hash);

var _generic_command = require("./generic_command");

var _generic_command2 = _interopRequireDefault(_generic_command);

var _js_processor = require("../processors/js_processor");

var _js_processor2 = _interopRequireDefault(_js_processor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var red = _cliColor2.default.red;
var green = _cliColor2.default.green;

function sum(array, prop) {
  var total = 0;
  for (var i = 0, len = array.length; i < len; i++) {
    total += array[i][prop];
  }
  return total;
}

function Check(options) {
  _generic_command2.default.call(this, options);
  this.errors = [];
  this.translations = new this.TranslationHash();
  this.setUpProcessors();
}

Check.prototype = Object.create(_generic_command2.default.prototype);
Check.prototype.constructor = Check;

Check.prototype.TranslationHash = _translation_hash2.default;

Check.prototype.setUpProcessors = function () {
  this.processors = [];
  for (var key in Check.processors) {
    var Processor = Check.processors[key];
    this.processors.push(new Processor(this.translations, {
      translations: this.translations,
      checkWrapper: this.checkWrapper.bind(this),
      only: this.options.only,
      patterns: this.options.patterns,
      ignorePatterns: this.options.ignorePatterns,
      directories: this.options.directories,
      ignoreDirectories: this.options.ignoreDirectories
    }));
  }
};

Check.prototype.checkFiles = function () {
  for (var i = 0; i < this.processors.length; i++) {
    this.processors[i].checkFiles();
  }
};

Check.prototype.checkWrapper = function (file, checker) {
  try {
    var found = checker(file);
    if (found) {
      this.log.info(green("+" + found));
    } else {
      this.log.info(".");
    }
    return found;
  } catch (e) {
    this.errors.push(e.message + "\n" + file);
    this.log.error(red("ERR" + this.errors.length));
    return 0;
  }
};

Check.prototype.isSuccess = function () {
  return !this.errors.length;
};

Check.prototype.printSummary = function () {
  var processors = this.processors;
  var summary;
  var errors = this.errors;
  var errorsLen = errors.length;
  var i;

  var translationCount = sum(processors, 'translationCount');
  var fileCount = sum(processors, 'fileCount');
  var elapsed = new Date().getTime() - this.startTime;

  this.log.info("\n\n");

  for (i = 0; i < errorsLen; i++) {
    this.log.error("ERR" + (i + 1) + ")\n" + red(errors[i]) + "\n\n");
  }
  this.log.info("Finished in " + elapsed / 1000 + " seconds\n\n");
  summary = fileCount + " files, " + translationCount + " strings, " + errorsLen + " failures";
  if (this.isSuccess()) {
    this.log.info(green(summary));
  } else {
    this.log.error(red(summary));
  }
  this.log.info("\n");
};

Check.prototype.run = function () {
  var now = new Date();
  this.startTime = now.getTime();
  this.log.log(this.log.name + ': check started at ' + now);
  this.checkFiles();
  this.printSummary();
  return this.isSuccess();
};

Check.processors = { JsProcessor: _js_processor2.default };

exports.default = Check;
