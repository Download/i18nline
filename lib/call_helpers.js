var pluralize = require('./pluralize');
var Utils = require('./utils');
var I18nline = require('./i18nline');
var getSlug = require('speakingurl');
var crc32 = require('crc32');

var CallHelpers = {
  ALLOWED_PLURALIZATION_KEYS: ["zero", "one", "few", "many", "other"],
  REQUIRED_PLURALIZATION_KEYS: ["one", "other"],
  UNSUPPORTED_EXPRESSION: [],

  normalizeKey: function(key) {
    return key;
  },

  normalizeDefault: function(defaultValue, translateOptions) {
    defaultValue = CallHelpers.inferPluralizationHash(defaultValue, translateOptions);
    return defaultValue;
  },

  inferPluralizationHash: function(defaultValue, translateOptions) {
    if (typeof defaultValue === 'string' && defaultValue.match(/^[\w-]+$/) && translateOptions && ("count" in translateOptions)) {
      return {one: "1 " + defaultValue, other: "%{count} " + pluralize(defaultValue)};
    }
    else {
      return defaultValue;
    }
  },

  isObject: function(object) {
    return typeof object === 'object' && object !== this.UNSUPPORTED_EXPRESSION;
  },

  validDefault: function(allowBlank) {
    var defaultValue = this.defaultValue;
    return allowBlank && (typeof defaultValue === 'undefined' || defaultValue === null) ||
      typeof defaultValue === 'string' ||
      this.isObject(defaultValue);
  },

  inferKey: function(defaultValue, translateOptions) {
    if (this.validDefault(defaultValue)) {
      defaultValue = this.normalizeDefault(defaultValue, translateOptions);
      if (typeof defaultValue === 'object')
        defaultValue = "" + defaultValue.other;
      return this.keyify(defaultValue);
    }
  },

  keyifyUnderscored: function(string) {
    var key = getSlug(string, {separator: '_', lang: false}).replace(/[-_]+/g, '_');
    return key.substring(0, I18nline.config.underscoredKeyLength);
  },

  keyifyUnderscoredCrc32: function(string) {
    var checksum = crc32(string.length + ":" + string).toString(16);
    return this.keyifyUnderscored(string) + "_" + checksum;
  },

  keyify: function(string) {
    switch (I18nline.config.inferredKeyFormat) {
      case 'underscored':
        return this.keyifyUnderscored(string);
      case 'underscored_crc32':
        return this.keyifyUnderscoredCrc32(string);
      default:
        return string;
    }
  },

  keyPattern: /^(\w+\.)+\w+$/,

  /**
   * Possible translate signatures:
   *
   * key [, options]
   * key, default_string [, options]
   * key, default_object, options
   * default_string [, options]
   * default_object, options
   **/
  isKeyProvided: function(keyOrDefault, defaultOrOptions, maybeOptions) {
    if (typeof keyOrDefault === 'object')
      return false;
    if (typeof defaultOrOptions === 'string')
      return true;
    if (maybeOptions)
      return true;
    if (typeof keyOrDefault === 'string' && keyOrDefault.match(CallHelpers.keyPattern))
      return true;
    return false;
  },

  isPluralizationHash: function(object) {
    var pKeys;
    return this.isObject(object) &&
      (pKeys = Utils.keys(object)) &&
      pKeys.length > 0 &&
      Utils.difference(pKeys, this.ALLOWED_PLURALIZATION_KEYS).length === 0;
  },

  inferArguments: function(args, meta) {
    if (args.length === 2 && typeof args[1] === 'object' && args[1].defaultValue)
      return args;

    var hasKey = this.isKeyProvided.apply(this, args);
    if (meta)
      meta.inferredKey = !hasKey;
    if (!hasKey)
      args.unshift(null);

    var defaultValue = null;
    var defaultOrOptions = args[1];
    if (args[2] || typeof defaultOrOptions === 'string' || this.isPluralizationHash(defaultOrOptions))
      defaultValue = args.splice(1, 1)[0];
    if (args.length === 1)
      args.push({});
    var options = args[1];
    if (defaultValue)
      options.defaultValue = defaultValue;
    if (!hasKey)
      args[0] = this.inferKey(defaultValue, options);
    return args;
  },

  applyWrappers: function(string, wrappers) {
    var i;
    var len;
    var keys;
    if (typeof wrappers === 'string')
      wrappers = [wrappers];
    if (wrappers instanceof Array) {
      for (i = wrappers.length; i; i--)
        string = this.applyWrapper(string, new Array(i + 1).join("*"), wrappers[i - 1]);
    }
    else {
      keys = Utils.keys(wrappers);
      keys.sort(function(a, b) { return b.length - a.length; }); // longest first
      for (i = 0, len = keys.length; i < len; i++)
        string = this.applyWrapper(string, keys[i], wrappers[keys[i]]);
    }
    return string;
  },

  applyWrapper: function(string, delimiter, wrapper) {
    var escapedDelimiter = Utils.regexpEscape(delimiter);
    var pattern = new RegExp(escapedDelimiter + "(.*?)" + escapedDelimiter, "g");
    return string.replace(pattern, wrapper);
  }
};

module.exports = CallHelpers;
