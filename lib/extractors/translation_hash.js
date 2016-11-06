var Errors = require('../errors');

function TranslationHash() {
  this.translations = {};
}

TranslationHash.prototype.set = function(key, value, meta) {
  var parts = key.split('.');
  var context = this.getScope(parts.slice(0, -1), meta);
  var finalKey = parts[parts.length - 1];

  if (context[finalKey]) {
    if (typeof context[finalKey] === 'object') {
      throw new Errors.KeyAsScope(meta.line, key);
    } else if (context[finalKey] !== value) {
      throw new Errors.KeyInUse(meta.line, key);
    }
  }
  context[finalKey] = value;
};

TranslationHash.prototype.getScope = function(parts, meta) {
  var context = this.translations;
  var partsLen = parts.length;
  var key;
  var i;

  for (i = 0; i < partsLen; i++) {
    key = parts[i];
    if (typeof context[key] === 'string') {
      throw new Errors.KeyAsScope(meta.line, parts.slice(0, i + 1).join("."));
    }
    context = context[key] || (context[key] = {});
  }
  return context;
};

module.exports = TranslationHash;

