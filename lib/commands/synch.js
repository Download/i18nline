var log = require('../log')('i18nline:commands:synch');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var extend = require('extend');
var chalk = require("chalk");
var r = chalk.red, g = chalk.green, gr = chalk.gray, m = chalk.magenta;

var I18nline = require('../i18nline');
var Export = require('./export');

var template = fs.readFileSync(path.resolve(__dirname, '../template.js')).toString();

function Synch(options) {
  if (options.silent) log.level = log.NONE;
  Export.call(this, options);
}

Synch.prototype = Object.create(Export.prototype);
Synch.prototype.constructor = Synch;

Synch.prototype.run = function() {
  var now = new Date();
  this.startTime = now.getTime();
	log.debug(log.name + ': synch started at ' + now)

	var locale = this.options.defaultLocale || I18nline.config.defaultLocale;
	var basePath = this.options.basePath || I18nline.config.basePath;
	this.out = path.resolve(basePath, this.options.out || I18nline.config.out);

	try {
		if (path.extname(this.out) !== '.json') {
			log.info('Synching internationalization files in ' + this.out);
			log.info(gr("Create files here named '{locale}.json' (e.g. 'fr.json') to include them in the synching process.\n"));
		}
		else {
			log.warn(m('Unable to perform a synch. Option `out` is set to a file. Performing an export instead.'));
			log.warn(gr('Set `out` to a folder to enable synch. Current value: ') + this.out + '\n');
		}

		Export.prototype.run.call(this);

		if (this.isSuccess() && path.extname(this.out) !== '.json') {
			var translations = {};
			translations[locale] = Object.keys(this.translations.translations).sort()
				.reduce(function(r,k){return ((r[k] = this.translations.translations[k]) && r) || r}.bind(this), {});
	
			var defLoc = path.resolve(this.out, locale + '.json')
			if (! fs.existsSync(defLoc)) {
				try {
					var empty = {};
					empty[locale] = {};
					fs.writeFileSync(defLoc, JSON.stringify(empty, null, 2), {encoding:'utf8',flag:'w'});
				} catch(e) {
					this.errors.push(e.message + "\n" + defLoc);
					log.error(r("ERR" + this.errors.length) + (this.errors.length < 10 ? '     ' : '    '));
				}
			}
							
			var files = fs.readdirSync(this.out)
				.filter(function(f){return !fs.lstatSync(path.resolve(this.out, f)).isDirectory()}.bind(this))
				.filter(function(f){return path.basename(f).match(/^[a-z][a-z][_\-]?([A-Z][A-Z])?\.json$/)});

			var supportedLocales = [];
					
			if (this.isSuccess()) {
				for (var i=0,f; f = files[i]; i++) {
					var synchLocale = f.substring(0, f.length - 5);
					supportedLocales.push(synchLocale);

					log.debug('Synching translations for locale ' + synchLocale);
					var oldData = {};
					var file = path.resolve(this.out, f);
					try {
						oldData = fs.readFileSync(file);
						oldData = oldData && oldData.length && JSON.parse(oldData) || {};
						if (! (synchLocale in oldData)) oldData[synchLocale] = {};
						log.debug('Read translations for ' + synchLocale + ' from ' + f);

						log.debug('Compiling new translations for ' + synchLocale);
						var newData = {};
						newData[synchLocale] = {}
						Object.keys(translations[locale]).sort().forEach(k => (
								newData[synchLocale][k] = k in oldData[synchLocale] 
										? oldData[synchLocale][k] 
										: translations[locale][k]
						));
	
						log.debug('Writing translations for ' + synchLocale);
						var removed = Object.keys(oldData[synchLocale] || {})
								.filter(function(k){return !(k in newData[synchLocale])}).length;
						var added = Object.keys(newData[synchLocale])
								.filter(function(k){return !(k in (oldData[synchLocale] || {}))}).length;
						var status = '';
						var file = path.resolve(this.out, f);
						if (added || removed) {
							try {
								fs.writeFileSync(file, JSON.stringify(newData, null, 2), {encoding:'utf8',flag:'w'});
								status += added > 0 ? (g('+' + added) + (added < 10 ? '  ' : ' ')) : gr(' -  ');
								status += removed > 0 ? (r('-' + removed) + (removed < 10 ? '   ' : '  ')) : gr(' -   ');
							} catch(e) {
								this.errors.push(e.message + "\n" + file);
								status = (r("ERR" + this.errors.length) + (this.errors.length < 10 ? '     ' : '    '));
							}
							log.info(status + gr(path.resolve(this.out, f)));
						}
					} catch(e) {
						this.errors.push(e.message + "\n" + file);
						log.error(r("ERR" + this.errors.length) + (this.errors.length < 10 ? '     ' : '    '));
					}
				}

				var generateIndex = new I18nline.Commands.Index(this.options);
				generateIndex.sub = true; // ran as sub-command
				if (!generateIndex.run()) {
					this.errors.push.apply(this.errors, generateIndex.errors);
				}

				for (var i=0,e; e=this.errors[i]; i++) {
					log.error('ERR' + (i+1) + '\n' + e);
				}
			}
		}
	} catch(e) {
		this.errors.push(e.message + "\n");
		for (var i=0,e; e=this.errors[i]; i++) {
			log.error('ERR' + (i+1) + '\n' + e);
		}
}
  var elapsed = (new Date()).getTime() - this.startTime;
  log[!this.sub && this.constructor === Synch ? 'info' : 'debug'](
    "\nSynch finished " + (this.isSuccess() ? "" : "with errors ") + "in " + (elapsed / 1000) + " seconds\n"
  );
  return this.isSuccess();
};

module.exports = Synch;

log.debug('Initialized ' + log.name);
