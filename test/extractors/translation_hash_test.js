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
      assert.throws(function() {
        var hash = new TranslationHash();
        hash.set("foo.bar", "Foo", {});
        hash.set("foo.bar", "Bar", {});
      }, Errors.KeyInUse);
    });

    it("should not let you use a key as a scope", function() {
      assert.throws(function() {
        var hash = new TranslationHash();
        hash.set("foo", "Foo", {});
        hash.set("foo.bar", "Bar", {});
      }, Errors.KeyAsScope);
    });

    it("should not let you use a scope as a key", function() {
      assert.throws(function() {
        var hash = new TranslationHash();
        hash.set("foo.bar", "Bar", {});
        hash.set("foo", "Foo", {});
      }, Errors.KeyAsScope);
    });
  });
});

