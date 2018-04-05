var log = require('../log')('i18nline:commands:index');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var chalk = require("chalk");
var r = chalk.red, g = chalk.green, gr = chalk.grey;

var I18nline = require('../i18nline');
var Check = require('./check');

var template = fs.readFileSync(path.resolve(__dirname, '../template.js')).toString();

function Index(options) {
  if (options.silent) log.level = log.NONE;
  Check.call(this, options);
}

Index.prototype = Object.create(Check.prototype);
Index.prototype.constructor = Index;

Index.prototype.run = function() {
  var now = new Date();
	this.startTime = now.getTime();

	var basePath = this.options.basePath || I18nline.config.basePath;
	this.out = path.resolve(basePath, this.options.out || I18nline.config.out);

  log[!this.sub && this.constructor === Index ? 'info' : 'debug'](
		'Generating index file\n' + 
		gr('Import the generated file into your project\n')
  );

	mkdirp.sync(this.out);
	var supportedLocales = fs.readdirSync(this.out)
		.filter(function(f){return !fs.lstatSync(path.resolve(this.out, f)).isDirectory();}.bind(this))
		.filter(function(f){return path.basename(f).match(/^[a-z][a-z]_?([A-Z][A-Z])?\.json$/);})
		.map(function(f){return f.substring(0, f.length - 5);});
	var indexFile = path.resolve(this.out, 'index.js');
	var ignoredConfigKeys = ['basePath', 'directories', 'ignoreDirectories', 'patterns', 'ignorePatterns', 'autoTranslateTags', 'neverTranslateTags', 'out', 'inferredKeyFormat', 'underscoredKeyLength', 'locales'];
	var configuration = [].concat(
		'I18n.supportedLocales = ' + JSON.stringify(supportedLocales).replace(/"/g, "'") + ';',
		Object.keys(I18nline.config)
		.filter(function(k){return ignoredConfigKeys.indexOf(k) === -1})
		.map(function(k){return 'I18n.' + k + ' = ' + JSON.stringify(I18nline.config[k]).replace(/"/g, "'") + ';'})
	);
	if (I18nline.config.locales) configuration = configuration.concat(
		Object.keys(I18nline.config.locales)
		.map(function(k){return 'I18n.locales.' + k + ' = ' + JSON.stringify(I18nline.config.locales[k]).replace(/"/g, "'") + ';'})
	)
	var imports = supportedLocales
		.map(function(l){return "case '" + l + "': return import(/* webpackChunkName: 'i18n." + l + "' */ './" + l + ".json');"});
	var reloads = supportedLocales
		.map(function(l){return "module.hot.accept('./" + l + ".json', I18n.reload('" + l + "'));";});
	var parts = template.split(/\/\*\[[A-Z_]?[A-Z0-9_]+\]\*\//);
	var script = parts[0] + 
		configuration.join('\n') + parts[1] + 
		imports.join('\n\t\t') + parts[2] + 
		reloads.join('\n\t') + parts[3];

	// allow outside code to process the generated script
	// by assigning a function to indexFilehook
	if (this.indexFileHook) {
		script = this.indexFileHook(script)
	}

	try {
		fs.writeFileSync(indexFile, script, {encoding:'utf8',flag:'w'});
		log.info(g('index    ') + gr(indexFile));
	} catch(e) {
		this.errors.push(e.message + "\n" + def);
		log.error(r("ERR" + this.errors.length) + (this.errors.length < 10 ? '     ' : '    ') + gr(indexFile));
	}
	if (this.constructor === Index) {
		for (var i=0,e; e=this.errors[i]; i++) {
			log.error('ERR' + (i+1) + '\n' + e);
		}
	}
	var elapsed = (new Date()).getTime() - this.startTime;
  log[!this.sub && this.constructor === Index ? 'info' : 'debug'](
    "\nIndex finished " + (this.isSuccess() ? "" : "with errors ") + "in " + (elapsed / 1000) + " seconds\n"
  );
  return this.isSuccess();
};

module.exports = Index;

log.debug('Initialized ' + log.name);
