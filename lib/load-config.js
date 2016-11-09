var log = require('./log')('i18nline:load-config');

var fs = require("fs");
var extend = require('extend');

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
			log.error(log.name + ': ERROR: ' + e.message, e);
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
			log.error(log.name + ': ERROR: ' + e.message, e);
		}
	}

	return config;
};

module.exports = loadConfig;

log.debug('Initialized ' + log.name);
