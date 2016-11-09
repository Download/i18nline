var log = require('./log')('i18nline:errors');

var CallHelpers = require('./call_helpers');

function wordify(string) {
  return string.replace(/[A-Z]/g, function(s) {
    return " " + s.toLowerCase();
  }).trim();
}

var Errors = {
  register: function(name) {
    this[name] = function(line, details) {
      this.line = line;
      if (details) {
        var parts = [];
        var part;
        if (typeof details === "string" || !details.length) details = [details];
        for (var i = 0; i < details.length; i++) {
          part = details[i];
          part = part === CallHelpers.UNSUPPORTED_EXPRESSION ?
            "<unsupported expression>" :
            JSON.stringify(part);
          parts.push(part);
        }
        details = parts.join(', ');
      }
      this.name = name;
      this.message = wordify(name) + " on line " + line + (details ? ": " + details : "");
    };
  }
};

Errors.register('InvalidSignature');
Errors.register('InvalidPluralizationKey');
Errors.register('MissingPluralizationKey');
Errors.register('InvalidPluralizationDefault');
Errors.register('MissingInterpolationValue');
Errors.register('MissingCountValue');
Errors.register('InvalidOptionKey');
Errors.register('KeyAsScope');
Errors.register('KeyInUse');

module.exports = Errors;

log.debug('Initialized ' + log.name);
