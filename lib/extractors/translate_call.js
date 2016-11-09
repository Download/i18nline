var log = require('../log')('i18nline:extractors:translate-call');

var extend = require('extend');
var CallHelpers = require('../call_helpers');
var Errors = require('../errors');
var Utils = require('../utils');

function TranslateCall(line, method, args) {
  this.line = line;
  this.method = method;

  this.normalizeArguments(args);

  this.validate();
  this.normalize();
}

extend(TranslateCall.prototype, CallHelpers);

TranslateCall.prototype.validate = function() {
  this.validateKey();
  this.validateDefault();
  this.validateOptions();
};

TranslateCall.prototype.normalize = function() {
  this.defaultValue = this.normalizeDefault(this.defaultValue, this.options || {});
};

TranslateCall.prototype.translations = function() {
  var key = this.key;
  var defaultValue = this.defaultValue;

  if (!defaultValue)
    return [];
  if (typeof defaultValue === 'string')
    return [[key, defaultValue]];

  var translations = [];
  for (var k in defaultValue) {
    if (defaultValue.hasOwnProperty(k)) {
      translations.push([key + "." + k, defaultValue[k]]);
    }
  }
  return translations;
};

TranslateCall.prototype.validateKey = function() {};

TranslateCall.prototype.validateDefault = function() {
  var defaultValue = this.defaultValue;
  if (typeof defaultValue === 'object') {
    var defaultKeys = Utils.keys(defaultValue);
    var dKeys;
    if ((dKeys = Utils.difference(defaultKeys, this.ALLOWED_PLURALIZATION_KEYS)).length > 0)
      throw new Errors.InvalidPluralizationKey(this.line, dKeys);
    if ((dKeys = Utils.difference(this.REQUIRED_PLURALIZATION_KEYS, defaultKeys)).length > 0)
      throw new Errors.MissingPluralizationKey(this.line, dKeys);

    for (var k in defaultValue) {
      if (defaultValue.hasOwnProperty(k)) {
        var v = defaultValue[k];
        if (typeof v !== 'string')
          throw new Errors.InvalidPluralizationDefault(this.line);
        this.validateInterpolationValues(k, v);
      }
    }
  }
  else {
    this.validateInterpolationValues(this.key, this.defaultValue);
  }
};

/**
 * Possible translate signatures:
 *
 * key [, options]
 * key, default_string [, options]
 * key, default_object, options
 * default_string [, options]
 * default_object, options
 **/
TranslateCall.prototype.normalizeArguments = function(args) {
  if (!args.length)
    throw new Errors.InvalidSignature(this.line, args);

  var others = this.inferArguments(args.slice(), this);
  var key = this.key = others.shift();
  var options = this.options = others.shift();

  if (others.length)
    throw new Errors.InvalidSignature(this.line, args);
  if (typeof key !== 'string')
    throw new Errors.InvalidSignature(this.line, args);
  if (options && !this.isObject(options))
    throw new Errors.InvalidSignature(this.line, args);
  if (options) {
    this.defaultValue = options.defaultValue;
    delete options.defaultValue;
  }
  if (!this.validDefault(true))
    throw new Errors.InvalidSignature(this.line, args);
};

TranslateCall.prototype.validateInterpolationValues = function(key, defaultValue) {
  var match;
  var pattern = /%\{([^\}]+)\}/g;
  var options = this.options;
  var placeholder;
  while ((match = pattern.exec(defaultValue)) !== null) {
    placeholder = match[1];
    if (!(placeholder in options))
      throw new Errors.MissingInterpolationValue(this.line, placeholder);
  }
};

TranslateCall.prototype.validateOptions = function() {
  var options = this.options;
  if (typeof this.defaultValue === 'object' && (!options || !options.count))
    throw new Errors.MissingCountValue(this.line);
  if (options) {
    for (var k in options) {
      if (typeof k !== 'string')
        throw new Errors.InvalidOptionKey(this.line);
    }
  }
};

module.exports = TranslateCall;

log.debug('Initialized ' + log.name);
