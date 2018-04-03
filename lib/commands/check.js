var log = require('../log')('i18nline:commands:check');

var chalk = require("chalk");
var r = chalk.red, g = chalk.green, gr = chalk.gray;

var TranslationHash = require("../extractors/translation_hash");
var BaseCommand = require("./base_command");
var JsProcessor = require("../processors/js_processor");


function sum(array, prop) {
  var total = 0;
  for (var i = 0, len = array.length; i < len; i++) {
    total += array[i][prop];
  }
  return total;
}

function Check(options) {
  if (options.silent) log.level = log.NONE;
  BaseCommand.call(this, options);
  this.errors = [];
  this.translations = new this.TranslationHash();
  this.setUpProcessors();
}

Check.prototype = Object.create(BaseCommand.prototype);
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
    if (found) {log.info(g("+" + found) + (found < 10 ? '       ' : '      ') + gr(file));}
    return found;
  } catch (e) {
    this.errors.push(e.message + "\n" + file);
    log.error(r("ERR" + this.errors.length) + (this.errors.length < 10 ? '     ' : '    ') + gr(file));
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

  for (i = 0; i < errorsLen; i++) {
    log.error("\nERR" + (i+1) + ")\n" + r(errors[i]));
  }
  summary = "\n" + fileCount + " files, " + translationCount + " strings, " + errorsLen + " failures\n";
  if (this.isSuccess()) {log.info(g(summary));} 
  else {log.error(r(summary));}
};

Check.prototype.run = function() {
  var now = new Date();
  this.startTime = now.getTime();

  log[!this.sub && this.constructor === Check ? 'info' : 'debug'](
		'Checking source files for errors\n' + 
		gr('Tip: Add this task to your continuous build.\n')
  );

  this.checkFiles();
  this.printSummary();
  var elapsed = (new Date()).getTime() - this.startTime;
  log[!this.sub && this.constructor === Check ? 'info' : 'debug'](
    "\nCheck finished " + (this.isSuccess() ? "" : "with errors ") + "in " + (elapsed / 1000) + " seconds\n"
  );
  return this.isSuccess();
};

Check.processors = {JsProcessor: JsProcessor};

module.exports = Check;

log.debug('Initialized ' + log.name);
