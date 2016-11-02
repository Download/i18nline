/* global describe, it */

import Check from '../../lib/commands/check';
import I18nline from '../../lib/i18nline';
import {assert} from "chai";

describe('Check', function() {
  describe(".run", function() {
    it("should find errors", function() {
      I18nline.set('basePath', "test/fixtures", function() {
        var checker = new Check({silent: true});
        checker.run();
        assert.deepEqual(
          checker.translations.translations,
          {"welcome_name_4c6ebc3a": 'welcome, %{name}'}
        );
        assert.equal(checker.errors.length, 1);
        assert.match(checker.errors[0], /^invalid signature/);
      });
    });
  });
});
