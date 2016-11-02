/* global process */

import fs from 'fs';
import path from 'path';

import Utils from "./utils";
import Check from "./commands/check";
import Export from "./commands/export";
import Help from "./commands/help";

var log = Utils.createLogger('i18nline');

function capitalize(string) {
  return typeof string === "string" && string ?
    string.slice(0, 1).toUpperCase() + string.slice(1) :
    string;
}

var Commands = {
  run: function(name, options) {
    options = options || {};
    if (! name) {name = 'help';}
    var Command = this[capitalize(name)];
    if (Command) {
      if (name != 'help' && !options.directories && !options.directory) {
        log.warn(log.name + ': WARN: No directories set in options', options);
        log.warn(log.name + ': WARN: Either configure the default search directories in .i18nrc,'); 
        log.warn(log.name + ': WARN: or pass the --directories command line option.');

        var directories = [];
        var defaultDirs = ['src', 'lib'];
        defaultDirs.forEach(function(dir){
          try {
            var stats = fs.lstatSync(dir);
            if (stats && stats.isDirectory()) {
              directories.push(dir);
            }
          }
          catch(e) {
            log.debug(log.name + ': Directory not found: ' + dir);
          }
        }); 
        if (! directories.length) {
          log.warn(log.name + ': WARN: None of the default directories found', defaultDirs);
          log.warn(log.name + ': WARN: Falling back to using project root directory');
          log.warn(log.name + ': WARN: This may take a long time. CTRL+C to abort');
          log.warn('');
        } else {
          log.warn(log.name + ': WARN: Using default directories', directories);
          options.directories = directories;
        } 
      }
      
      try {
        return (new Command(options)).run();
      } catch (e) {
        log.error(log.name + ': ERROR: ' + e.message + "\n");
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

export default Commands;
