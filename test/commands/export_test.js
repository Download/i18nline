/* global describe, it */

var Export = require('../../lib/commands/export');
var I18nline = require('../../lib/i18nline');
var assert = require('chai').assert;
var fs = require('fs');
var temp = require('temp');
var rimraf = require('rimraf');

describe('Export', function() {
  describe(".run", function() {
    it("should dump translations in utf8", function() {
      var tmpDir = temp.mkdirSync();
      I18nline.set('basePath', tmpDir, function() {
        var exporter = new Export({silent: true});
        exporter.checkFiles = function() {
          this.translations = {translations: {i18n: "Iñtërnâtiônàlizætiøn"}};
        };
        exporter.run();
        assert.deepEqual(
          {en: {i18n: "Iñtërnâtiônàlizætiøn"}},
          JSON.parse(fs.readFileSync(exporter.outputFile))
        );
      });
      rimraf.sync(tmpDir);
    });
  });
});

