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
    if (fs.existsSync(".i18nrc")) {
      try {
        var config = JSON.parse(fs.readFileSync(".i18nrc").toString());
        for (var key in config) {
          if (key === "plugins") {
            this.loadPlugins(config[key]);
          }
          else {
            this.set(key, config[key]);
          }
        }
      } catch (e) {}
    }
  },

  loadPlugins (plugins) {
    plugins.forEach(function(pluginName) {
      require(pluginName)({
        processors: this.Commands.Check.processors,
        config: this.config
      });
    }.bind(this));
  },

  config: {
    inferredKeyFormat: 'underscored_crc32',
    underscoredKeyLength: 50,
    basePath: ".",
    directories: []
  }
};

export default I18nline;
