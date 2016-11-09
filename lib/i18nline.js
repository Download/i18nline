var log = require('./log')('i18nline');

var Utils = require('./utils');

var I18nline = {
  set: function (key, value, fn) {
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

  configure: function(config) {
    for (var key in config) {
      if (key === "plugins") {
        this.configurePlugins(config[key]);
      }
      else {
        this.set(key, config[key]);
      }
    }
  },

  configurePlugins: function(plugins) {
    plugins.forEach(function(plugin) {
      plugin({
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

log.debug('Initialized ' + log.name);
