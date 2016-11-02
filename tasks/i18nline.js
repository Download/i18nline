module.exports = function(grunt) {
  var Commands = require('../dist/lib/main').Commands;
  grunt.registerTask('i18nline', function(command) {
    Commands.run(command) || grunt.fail.fatal(command + " command encountered 1 or more errors");
  });
};
