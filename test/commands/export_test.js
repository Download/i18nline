/* global describe, it */

import Export from '../../lib/commands/export';
import I18nline from '../../lib/i18nline';
import {assert} from "chai";
import fs from "fs";
import temp from "temp";
import rimraf from "rimraf";

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

