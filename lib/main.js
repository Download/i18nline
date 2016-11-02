import I18nline from './i18nline';
import CallHelpers from './call_helpers';
import Errors from './errors';
import TranslateCall from './extractors/translate_call';
import TranslationHash from './extractors/translation_hash';
import Commands from './commands';

I18nline.CallHelpers = CallHelpers;
I18nline.Errors = Errors;
I18nline.TranslateCall = TranslateCall;
I18nline.TranslationHash = TranslationHash;
I18nline.Commands = Commands;

I18nline.loadConfig();

export default I18nline;
