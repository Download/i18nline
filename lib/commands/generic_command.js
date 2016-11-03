import fs from 'fs';
import Utils from '../utils';
import I18nline from '../i18nline';

function GenericCommand(options) {
  options.outputFile = options.o || options.outputFile;
  options = Utils.extend({}, I18nline.config, options);
  options.patterns = typeof options.patterns == 'string' ? options.patterns.split(',') : options.patterns || [];
  options.ignorePatterns = typeof options.ignorePatterns == 'string' ? options.ignorePatterns.split(',') : options.ignorePatterns || [];
  options.directories = typeof options.directories == 'string' ? options.directories.split(',') : options.directories;

  
  this.options = options;
  this.log = Utils.createLogger(
    'i18nline:' + this.constructor.name, 
    options.silent || options.s
  );
}

export default GenericCommand;
