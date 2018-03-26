var esprima = require('esprima')
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
    ignoreDirectories: ['node_modules', 'bower_components', '.git', 'dist'],
    patterns: ['**/*.js', '**/*.jsx'],
    ignorePatterns: [],
    outputFile: 'i18n/en.json',
    inferredKeyFormat: 'underscored_crc32',
    underscoredKeyLength: 50,
    // we need to enable jsx parsing and location info in recast 0.12+ because it
    // is using new esprima 4 which defaults these to false apparently
    recastOptions: {
      parser: {
        parse: function(source) {
          return esprima.parse(source, {jsx:true, loc:true})
        }
      }
    }
  }
};

module.exports = I18nline;

log.debug('Initialized ' + log.name);
