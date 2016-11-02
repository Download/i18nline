import fs from 'fs';
import Utils from '../utils';
import I18nline from '../i18nline';

function GenericCommand(options) {
  this.options = options;
  this.log = Utils.createLogger(
    'i18nline:' + this.constructor.name, 
    options.silent || options.s
  );
}

export default GenericCommand;
