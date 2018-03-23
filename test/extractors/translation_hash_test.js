/* global describe, it */
var assert = require('chai').assert;
var TranslationHash = require('../../lib/extractors/translation_hash');
var Errors = require('../../lib/errors');

describe("TranslationHash", function() {
  describe(".set", function() {
    it("should accept identical key/values", function() {
      var hash = new TranslationHash();
      hash.set("foo.bar", "Foo", {});
      hash.set("foo.bar", "Foo", {});
      assert.deepEqual(hash.translations, {foo: {bar: "Foo"}});
    });

    it("should reject mismatched values", function() {
      // Chai handling of `throws` changed from 3.5 to 4.x
      // https://github.com/chaijs/chai/issues/1079
      assert.throws(function() {
        try {
          var hash = new TranslationHash();
          hash.set("foo.bar", "Foo", {});
          hash.set("foo.bar", "Bar", {});
        }
        catch(e) {
          assert.instanceOf(e, Errors.KeyInUse)
          throw e
        }
      });
    });

    it("should not let you use a key as a scope", function() {
      assert.throws(function() {
        try {
          var hash = new TranslationHash();
          hash.set("foo", "Foo", {});
          hash.set("foo.bar", "Bar", {});
        }
        catch(e) {
          assert.instanceOf(e, Errors.KeyAsScope)
          throw e
        }
      });
    });

    it("should not let you use a scope as a key", function() {
      assert.throws(function() {
        try {
          var hash = new TranslationHash();
          hash.set("foo.bar", "Bar", {});
          hash.set("foo", "Foo", {});
        }
        catch(e) {
          assert.instanceOf(e, Errors.KeyAsScope)
          throw e
        }
      });
    });
  });
});

