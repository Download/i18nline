var Utils = require('./utils');
var log = require('./log')('i18nline');

var fs;

var I18nline = {
  ignore () {
    fs = fs || require("fs");
    var ignores = [];
    if (fs.existsSync(".i18nignore")) {
      ignores = fs.readFileSync(".i18nignore").toString().trim().split(/\r?\n|\r/);
    }
    return ignores;
  },

  set (key, value, fn) {
    var prevValue = this.config[key];
    this.config[key] = value;
    if (fn) {
      try {
        fn();
      }
      finally {
        this.config[key] = prevValue;
      }
    }
  },

  loadConfig () {
    fs = fs || require("fs");
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
      config = Utils.extend({}, config, pkg.i18n);
      log.debug(log.name + ': loaded config from package.json', pkg.i18n);
    }

    if (fs.existsSync(".i18nrc")) {
      try {
        var rc = JSON.parse(fs.readFileSync(".i18nrc").toString())
        config = Utils.extend({}, config, rc);
        log.debug(log.name + ': loaded config from .i8nrc', rc);
      } catch (e) {
        log.error(log.name + ': ERROR: ' + e.message, e);
      }
    }

    for (var key in config) {
      if (key === "plugins") {
        this.loadPlugins(config[key]);
      }
      else {
        this.set(key, config[key]);
      }
    }
  },

  loadPlugins (plugins) {
    plugins.forEach(function(pluginName) {
      log.debug(log.name + ': loading plugin ' + pluginName);
      require(pluginName)({
        processors: this.Commands.Check.processors,
        config: this.config
      });
    }.bind(this));
  },

  config: {
    basePath: '.',
    ignoreDirectories: ['node_modules', 'bower_components', '.git', 'dist'],
    patterns: ['**/*.js', '**/*.jsx'],
    ignorePatterns: [],
    outputFile: 'i18n/en.json',
    inferredKeyFormat: 'underscored_crc32',
    underscoredKeyLength: 50,
  }
};

module.exports = I18nline;
