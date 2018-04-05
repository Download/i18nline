var log = require('../log')('i18nline:commands:export');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var extend = require('extend');
var chalk = require("chalk");
var r = chalk.red, g = chalk.green, gr = chalk.gray;

var I18nline = require('../i18nline');
var Check = require('./check');

var template = fs.readFileSync(path.resolve(__dirname, '../template.js')).toString();

function Export(options) {
  if (options.silent) log.level = log.NONE;
  Check.call(this, options);
}

Export.prototype = Object.create(Check.prototype);
Export.prototype.constructor = Export;

Export.prototype.run = function() {
  var now = new Date();
  this.startTime = now.getTime();

  var locale = this.options.defaultLocale || I18nline.config.defaultLocale;
  var basePath = this.options.basePath || I18nline.config.basePath;
  this.out = path.resolve(basePath, this.options.out || I18nline.config.out);
  var outputFolder = path.extname(this.out) == '.json' ? path.dirname(this.out) : this.out;

  log[!this.sub && this.constructor === Export ? 'info' : 'debug'](
    'Exporting default translations to ' + (this.out.endsWith('.json') ? this.out : path.join(this.out, 'default.json')) + '\n'
  );

  Check.prototype.run.call(this);

  if (this.isSuccess()) {
    var translations = {};
    translations[locale] = Object.keys(this.translations.translations).sort()
      .reduce(function(r,k){return ((r[k] = this.translations.translations[k]) && r) || r}.bind(this), {});

    try {
      mkdirp.sync(outputFolder);
      var def = path.extname(this.out) == '.json' ? this.out : path.resolve(outputFolder, 'default.json');

      this.oldDefaults = {};
      if (fs.existsSync(def)) {
        try {
          this.oldDefaults = JSON.parse(fs.readFileSync(def));
        } catch(e) {
          this.errors.push(e.message + "\n" + def);
          log.error(r("ERR" + this.errors.length) + (this.errors.length < 10 ? '     ' : '    '));
        }
      }

      if (this.isSuccess()) {
        var removed = Object.keys(this.oldDefaults[locale] || {})
            .filter(function(k){return !(k in translations[locale])}).length;
        var added = Object.keys(translations[locale])
            .filter(function(k){return !(k in (this.oldDefaults[locale] || {}))}.bind(this)).length;
        var status = '';
        if (added || removed) {
          try {
            fs.writeFileSync(def, JSON.stringify(translations, null, 2), {encoding:'utf8',flag:'w'});
            status += added > 0 ? (g('+' + added) + (added < 10 ? '  ' : ' ')) : '    ';
            status += removed > 0 ? (r('-' + removed) + (removed < 10 ? '   ' : '  ')) : '     ';
          } catch(e) {
            this.errors.push(e.message + "\n" + def);
            status = r("ERR" + this.errors.length) + (this.errors.length < 10 ? '     ' : '    ');
          }
          log.info(status + gr(def));
        }
      }

      for (var i=0,e; e=this.errors[i]; i++) {
        log.error('\nERR' + (i+1) + '\n' + e);
      }
    } catch(e) {
      this.errors.push(r(e.message + "\n" + def));
      log.error(r("ERR" + this.errors.length) + (this.errors.length < 10 ? '     ' : '    '));
      for (var i=0,e; e=this.errors[i]; i++) {
        log.error('\nERR' + (i+1) + '\n' + e);
      }
    }
  }
  var elapsed = (new Date()).getTime() - this.startTime;
  log[!this.sub && this.constructor === Export ? 'info' : 'debug'](
    "\nExport finished " + (this.isSuccess() ? "" : "with errors ") + "in " + (elapsed / 1000) + " seconds\n"
  );
  return this.isSuccess();
};

module.exports = Export;

log.debug('Initialized ' + log.name);
