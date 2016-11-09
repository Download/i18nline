var log = require('./log')('i18nline:commands');

var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var wb = chalk.white.bold, gr = chalk.gray, grb = chalk.gray.bold, g=chalk.green, gb=chalk.green.bold;

var Utils = require('./utils');
var Check = require('./commands/check');
var Export = require('./commands/export');
var Help = require('./commands/help');

function capitalize(string) {
  return typeof string === "string" && string ?
    string.slice(0, 1).toUpperCase() + string.slice(1) :
    string;
}

var Commands = {
  run: function(name, options) {
    name = name || 'help';
    options = options || {};
    log.log(log.name + ': ' + name, options);
    if (name != 'help' && !options.directories) {
      options.directories = autoConfigureDirectories(options);
    }
    var Command = this[capitalize(name)];
    if (Command) {
      try {
        log.info('');
        log.info(gr('  ██╗   ███╗   ██╗██╗     ██╗███╗   ██╗███████╗ '));    
        log.info(gr('  ██║   ████╗  ██║██║     ██║████╗  ██║██╔════╝ '));    
        log.info(gr('  ██║') + wb('18') + gr(' ██╔██╗ ██║██║     ██║██╔██╗ ██║█████╗   '));  
        log.info(gr('  ██║   ██║╚██╗██║██║     ██║██║╚██╗██║██╔══╝   '));  
        log.info(gr('  ██║   ██║ ╚████║███████╗██║██║ ╚████║███████╗ '));    
        log.info(gr('  ╚═╝   ╚═╝  ╚═══╝╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝ '));    
        log.info(grb('         keep your translations in line         '));
        log.info('');
        return (new Command(options)).run();
      } catch (e) {
        log.error(log.name + ': ERROR: ' + name + ' failed', e);
      }
    } else {
      log.error(log.name + ": ERROR: unknown command " + name + "\n");
    }
    return false;
  },

  Check: Check,
  Export: Export,
  Help: Help,
};

function autoConfigureDirectories(options) {
  var base = path.resolve(process.cwd(), options.basePath);
  return fs.readdirSync(base).filter(function(file) {
    return (
      fs.statSync(path.resolve(base, file)).isDirectory() &&
      options.ignoreDirectories.indexOf(file) === -1
    )
  });
}

module.exports = Commands;

log.debug('Initialized ' + log.name);
