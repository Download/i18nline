var log = require('./log')('i18nline:main');

var I18nline = require('./i18nline');
var CallHelpers = require('./call_helpers');
var Errors = require('./errors');
var TranslateCall = require('./extractors/translate_call');
var TranslationHash = require('./extractors/translation_hash');
var Commands = require('./commands');
var loadConfig = require('./load-config');

I18nline.CallHelpers = CallHelpers;
I18nline.Errors = Errors;
I18nline.TranslateCall = TranslateCall;
I18nline.TranslationHash = TranslationHash;
I18nline.Commands = Commands;

module.exports = I18nline.configure(loadConfig());

log.debug('Initialized ' + log.name);
