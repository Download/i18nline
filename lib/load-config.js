var log = require('./log')('i18nline:load-config');

var fs = require("fs");
var extend = require('extend');
var chalk = require("chalk");
var r = chalk.red, m = chalk.magenta;

function loadConfig() {
	var config = {}, pkg;
	try {
		pkg = require('pkgcfg')();
	}
	catch(e) {
		try {
			pkg = JSON.parse(fs.readFileSync('package.json').toString());
		}
		catch(e) {
			log.error(r(log.name + ': ERROR: Could not load package.json' + e.message), e);
		}
	}

	if (pkg && pkg.i18n) {
		config = extend({}, config, pkg.i18n);
		log.debug(log.name + ': loaded config from package.json', pkg.i18n);
	}

	if (fs.existsSync(".i18nrc")) {
		try {
			var rc = JSON.parse(fs.readFileSync(".i18nrc").toString())
			config = extend({}, config, rc);
			log.debug(log.name + ': loaded config from .i8nrc', rc);
		} catch (e) {
			log.error(r(log.name + ': ERROR: Could not load config from .i18nrc'), e);
		}
	}

	var deps = extend({}, pkg && pkg.devDependencies || {}, pkg && pkg.dependencies || {});
	var autoPlugins = Object.keys(deps)
	.filter(function(key){return key.endsWith('-i18nline') || key.startsWith('i18nline-');})
	.map(function(key){
		try {require(key); return key;} 
		catch(e){log.warn(log.name + m(' WARN: Failed loading plugin from dependency ' + key + '@' + deps[key] + ': ') + e.message); return null;}
	})
	.filter(function(key){return key;});
	config.plugins = (config.plugins || []).concat(autoPlugins);

	if (config.plugins && config.plugins.length) {
		for (var i=0,pluginName; pluginName=config.plugins[i]; i++) {
			if (typeof pluginName == 'string') {
				log.debug(log.name + ': loading plugin ' + pluginName);
				try {
					config.plugins[i] = require(pluginName);
				} catch(e) {
					log.error(r(log.name + ': ERROR: Unable to load plugin ' + pluginName), e);
				}
			}
		}
	}

	return config;
};

module.exports = loadConfig;

log.debug('Initialized ' + log.name);
