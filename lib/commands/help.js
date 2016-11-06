var fs = require('fs');
var mkdirp = require('mkdirp');
var chalk = require('chalk');
var wb = chalk.white.bold, gr = chalk.gray, grb = chalk.gray.bold, g=chalk.green, gb=chalk.green.bold;

var GenericCommand = require('./generic_command');
var I18nline = require('../../lib/i18nline');


function Help(options) {
  GenericCommand.call(this, options);
}

Help.prototype = Object.create(GenericCommand.prototype);
Help.prototype.constructor = Help;

Help.prototype.run = function() {
  var log = this.log;
  log.info('');
  log.info(gr('  ██╗   ███╗   ██╗██╗     ██╗███╗   ██╗███████╗ '));    
  log.info(gr('  ██║   ████╗  ██║██║     ██║████╗  ██║██╔════╝ '));    
  log.info(gr('  ██║') + wb('18') + gr(' ██╔██╗ ██║██║     ██║██╔██╗ ██║█████╗   '));  
  log.info(gr('  ██║   ██║╚██╗██║██║     ██║██║╚██╗██║██╔══╝   '));  
  log.info(gr('  ██║   ██║ ╚████║███████╗██║██║ ╚████║███████╗ '));    
  log.info(gr('  ╚═╝   ╚═╝  ╚═══╝╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝ '));    
  log.info(grb('         keep your translations in line         '));
  log.info('');
  log.info(wb('Usage'));
  log.info('');
  log.info(gb('i18nline <command> [options]'))
  log.info('');
  log.info(wb('Commands'))
  log.info('');
  log.info('check     ' + gr('Performs a dry-run with all checks, but does not write any files'));
  log.info('export    ' + gr('Performs a check, then writes the default translation file'));
  log.info('help      ' + gr('Prints this help screen'));
  log.info('');
  log.info(wb('Options'));
  log.info('');
  log.info(gr('You can set/override all of i18nline\'s configuration options on the command line.'));
  log.info(grb('SEE: ') + g('https://github.com/download/i18nline#configuration'));
  log.info(gr('In addition these extra options are available in the CLI:'));
  log.info('-o             ' + gr('Alias for --outputFile (SEE config docs)'));
  log.info('--only         ' + gr('Only process a single file/directory/pattern'));
  log.info('--silent       ' + gr('Don\'t log any messages'));
  log.info('-s             ' + gr('Alias for --silent'));
  log.info('');
  log.info(wb('Examples'));
  log.info('');
  log.info(gr('$ ') + 'i18nline check --only=src/some-file.js');
  log.info(gr('> Only check the given file for errors'));
  log.info('');
  log.info(gr('$ ') + 'i18nline export --directory=src --patterns=**/*.js,**/*.jsx');
  log.info(gr('> Export all translations in `src` directory from .js and .jsx files'));
  log.info(gr('> to default output file i18n/en.json'));
  log.info('');
  log.info(gr('$ ') + 'i18nline export -o=translations/en.json');
  log.info(gr('> Export all translations in any directory but the ignored ones, from'));
  log.info(gr('> .js and .jsx files to the given output file translations/en.json'));
  log.info('');
  log.info(wb('See what\'s happening'));
  log.info('');
  log.info(gr('i18nline uses ') + wb('ulog') + gr(' for it\'s logging, when available. To use it:'));
  log.info(gr('$ ') + 'npm install --save-dev ulog');
  log.info(gr('$ ') + 'LOG=debug  ' + gr(' (or log, info, warn, error)'));
  log.info(gr('Now, i18nline will log any messages at or above the set level'));
  log.info('');
  return 0;
};

module.exports = Help;
