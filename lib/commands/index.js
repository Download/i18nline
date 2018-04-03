var log = require('../log')('i18nline:commands:index');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var chalk = require("chalk");
var r = chalk.red, g = chalk.green, gr = chalk.grey;

var Check = require("./check");
var I18nline = require('../i18nline');

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
	var imports = supportedLocales.map(function(l){
		return "case '" + l + "': return import('./" + l + ".json');"
	});
	var reloads = supportedLocales.map(function(l){
		return "module.hot.accept('./" + l + ".json', I18n.reload('" + l + "'));";
	});
	var parts = template.split(/\/\*\[[A-Z_]+\]\*\//);
	var script = parts[0] + imports.join('\n\t\t') + parts[1] +	reloads.join('\n\t') + parts[2];
	try {
		fs.writeFileSync(indexFile, script, {encoding:'utf8',flag:'w'});
		log.info(g('index    ') + gr(indexFile));
	} catch(e) {
		this.errors.push(e.message + "\n" + def);
		log.error(r("ERR" + this.errors.length) + (this.errors.length < 10 ? '     ' : '    ') + gr(indexFile));
	}
	for (var i=0,e; e=this.errors[i]; i++) {
		log.error('\nERR' + (i+1) + '\n' + e);
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
