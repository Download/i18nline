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
    var arrOpts = ['patterns','ignorePatterns','directories','ignoreDirectories']
    Object.keys(config)
    .filter(function(key){return key !== 'plugins'})
    .forEach(function(key){
      if ((typeof config[key] == 'string') && (arrOpts.indexOf(key) !== -1)) {
        this.set(key, config[key].split(','));
      } else {
        this.set(key, config[key])
      }
    }.bind(this));
    if (config.plugins) this.configurePlugins(config.plugins);
    return this;
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
    ignoreDirectories: ['node_modules', 'bower_components', '.git', 'dist', 'build'],
    patterns: ['**/*.js', '**/*.jsx'],
    ignorePatterns: [],
    out: 'src/i18n',
    inferredKeyFormat: 'underscored_crc32',
    underscoredKeyLength: 50,
    defaultLocale: 'en',
  }
};

module.exports = I18nline;

log.debug('Initialized ' + log.name);
