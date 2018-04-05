var log = require('../log')('i18nline:extensions:i18n');
var EventEmitter = require('uevents');
var CallHelpers = require('../call_helpers');
var Utils = require('../utils');

var extend = function(I18n) {
  function changed(locale) {
    return function() {
      I18n.emit('change', locale || I18n.locale);
    };
  }

  if (!I18n.on) EventEmitter(I18n);
  
  /**
   * Changes the current locale, loading the translations if needed.
   * If I18n has an emit method, emits a 'change' event with the given locale.
   * Returns a Promise that resolves with the locale when the change is completed.
   *
   * @param {string} locale
   * @return {PromiseLike<object>}
   */
  I18n.changeLocale = function(locale) {
    return Promise.all(
      I18n.locales.get(I18n.locale = locale).map(function(locale){
        return I18n.load(locale)
      })
    ).then(changed())
  };

  /**
   * Loads the translations for locale, from cache (unless bypassCache == true)
   * or by calling I18n.import with the given locale. Returns a Promise.
   *
   * @param {string} locale
   * @param {boolean} bypassCache
   * @return {PromiseLike<object>}
   */
  I18n.load = function(locale, bypassCache) {
    return new Promise(function(resolve) {
      return I18n.translations[locale] && !bypassCache
        ? resolve(I18n.translations[locale])
        : I18n.import(locale).then(function(x) {resolve(I18n.translations[locale] = x[locale]);});
    });
  };

  /**
   * Returns a function that reloads the translations for the given locale.
   * The reload function bypasses the cache, making it ideal for HMR.
   *
   * @param {string} locale
   * @return {function}
   */
  I18n.reload = function(locale) {
    return function() { 
      I18n.load(locale, true).then(changed(locale));
    }
  };

  I18n.import = function(locale) {
    return Promise.reject('Implement I18n.import');
  };

  var htmlEscape = Utils.htmlEscape;

  if (!I18n.interpolateWithoutHtmlSafety) I18n.interpolateWithoutHtmlSafety = I18n.interpolate;
  I18n.interpolate = function(message, options) {
    var needsEscaping = false;
    var matches = message.match(this.PLACEHOLDER) || [];
    var len = matches.length;
    var match;
    var keys = [];
    var key;
    var i;
    var wrappers = options.wrappers || options.wrapper;

    if (wrappers) {
      needsEscaping = true;
      message = htmlEscape(message);
      message = CallHelpers.applyWrappers(message, wrappers);
    }

    for (i = 0; i < len; i++) {
      match = matches[i];
      key = match.replace(this.PLACEHOLDER, "$1");
      keys.push(key);
      if (!(key in options)) continue;
      if (match[1] === 'h')
        options[key] = new Utils.HtmlSafeString(options[key]);
      if (options[key] instanceof Utils.HtmlSafeString)
        needsEscaping = true;
    }

    if (needsEscaping) {
      if (!wrappers)
        message = htmlEscape(message);
      for (i = 0; i < len; i++) {
        key = keys[i];
        if (!(key in options)) continue;
        options[key] = htmlEscape(options[key]);
      }
    }
    message = this.interpolateWithoutHtmlSafety(message, options);
    return needsEscaping ? new Utils.HtmlSafeString(message) : message;
  };

  // add html-safety hint, i.e. "%h{...}"
  I18n.PLACEHOLDER = /(?:\{\{|%h?\{)(.*?)(?:\}\}?)/gm;

  I18n.CallHelpers = CallHelpers;
  I18n.Utils = Utils;

  if (!I18n.translateWithoutI18nline) I18n.translateWithoutI18nline = I18n.translate;
  I18n.translate = function() {
    var args = CallHelpers.inferArguments([].slice.call(arguments));
    var key = args[0];
    var options = args[1];
    key = CallHelpers.normalizeKey(key, options);
    var defaultValue = options.defaultValue;

    if (defaultValue) {
      options.defaultValue = CallHelpers.normalizeDefault(defaultValue, options);
    }

    return this.translateWithoutI18nline(key, options);
  };

  I18n.t = I18n.translate;
  return I18n;
};

module.exports = extend;

log.debug('Initialized ' + log.name);
