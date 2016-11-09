var log = require('./log')('i18nline:i18n');

var I18n = require('i18n-js');
var extend = require('./extensions/i18n_js');

module.exports = extend(I18n)

log.debug('Initialized ' + log.name);
