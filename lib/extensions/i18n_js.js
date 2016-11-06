var CallHelpers = require('../call_helpers');
var Utils = require('../utils');

var extend = function(I18n) {
  var htmlEscape = Utils.htmlEscape;

  I18n.interpolateWithoutHtmlSafety = I18n.interpolate;
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

  I18n.translateWithoutI18nline = I18n.translate;
  I18n.translate = function() {
    var args = CallHelpers.inferArguments([].slice.call(arguments));
    var key = args[0];
    var options = args[1];
    key = CallHelpers.normalizeKey(key, options);
    var defaultValue = options.defaultValue;
    if (defaultValue)
      options.defaultValue = CallHelpers.normalizeDefault(defaultValue, options);

    return this.translateWithoutI18nline(key, options);
  };
  I18n.t = I18n.translate;
  return I18n;
};

module.exports = extend;
