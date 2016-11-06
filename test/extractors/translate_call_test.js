/* global describe, it */
var assert = require('chai').assert;
var TranslateCall = require('../../lib/extractors/translate_call');
var Errors = require('../../lib/errors');
var I18nline = require('../../lib/i18nline');

describe("TranslateCall", function() {
  function call() {
    return new TranslateCall(null, 't', [].slice.call(arguments));
  }

  describe("signature", function() {
    it("should reject extra arguments", function() {
      assert.throws(function() {
        call("key", "value", {}, "wat");
      }, Errors.InvalidSignature);
    });

    it("should accept a valid key or default", function() {
      assert.doesNotThrow(function() {
        call("key", "value", {});
      });

      assert.doesNotThrow(function() {
        call("key_or_value", {});
      });
    });

    it("should require at least a key or default", function() {
      assert.throws(function() {
        call();
      }, Errors.InvalidSignature);
    });

    it("should require a literal default", function() {
      assert.throws(function() {
        call("key.key", TranslateCall.prototype.UNSUPPORTED_EXPRESSION);
      }, Errors.InvalidSignature);
    });

    // for legacy calls, e.g. I18n.t("key", {defaultValue: "foo"})
    it("should allow the default to be specified in the options object", function() {
      var c = call("key", {defaultValue: "foo"});
      assert.equal(c.defaultValue, "foo");
    });

    it("should ensure options is an object literal, if provided", function() {
      assert.throws(function() {
        call("key", "value", TranslateCall.prototype.UNSUPPORTED_EXPRESSION);
      }, Errors.InvalidSignature);
    });
  });

  describe("key inference", function() {
    it("should generate literal keys", function() {
      I18nline.set('inferredKeyFormat', 'literal', function() {
        assert.deepEqual(
          call("zomg key").translations(),
          [["zomg key", "zomg key"]]
        );
      });
    });

    it("should generate underscored keys", function() {
      I18nline.set('inferredKeyFormat', 'underscored', function() {
        assert.deepEqual(
          call("zOmg -- key!!").translations(),
          [["zomg_key", "zOmg -- key!!"]]
        );
      });
    });

    it("should truncate long keys", function() {
      var longString = new Array(100).join("trolololo");

      I18nline.set('inferredKeyFormat', 'underscored', function() {
        assert(
          call(longString).translations()[0][0].length < 100
        );
      });
    });

    it("should generate underscored + crc32 keys", function() {
      I18nline.set('inferredKeyFormat', 'underscored_crc32', function() {
        assert.deepEqual(
          call("zOmg key!!").translations(),
          [["zomg_key_90a85b0b", "zOmg key!!"]]
        );
      });
    });
  });

  describe("pluralization", function() {
    describe("keys", function() {
      it("should be inferred from a word", function() {
        var result = call("person", {count: 1}).translations();
        assert.equal(result[0][0], "count_people_489946e7.one");
        assert.equal(result[1][0], "count_people_489946e7.other");
      });

      it("should be inferred from an object", function() {
        var result = call({one: "just you", other: "lotsa peeps"}, {count: 1}).translations();
        assert.equal(result[0][0], "lotsa_peeps_41499c40.one");
        assert.equal(result[1][0], "lotsa_peeps_41499c40.other");
      });
    });

    describe("defaults", function() {
      it("should be inferred", function() {
        var result = call("person", {count: 1}).translations();
        assert.equal(result[0][1], "1 person");
        assert.equal(result[1][1], "%{count} people");
      });

      it("should not be inferred if given multiple words", function() {
        assert.deepEqual(
          call("happy person", {count: 1}).translations()[0][1],
          "happy person"
        );
      });
    });

    it("should accept valid objects", function() {
      assert.deepEqual(
        call({one: "asdf", other: "qwerty"}, {count: 1}).translations(),
        [["qwerty_98185351.one", "asdf"], ["qwerty_98185351.other", "qwerty"]]
      );
      assert.deepEqual(
        call("some_stuff", {one: "asdf", other: "qwerty"}, {count: 1}).translations(),
        [["some_stuff.one", "asdf"], ["some_stuff.other", "qwerty"]]
      );
    });

    it("should reject invalid keys", function() {
      assert.throws(function() {
        call({one: "asdf", twenty: "qwerty"}, {count: 1});
      }, Errors.InvalidPluralizationKey);
    });

    it("should require essential keys", function() {
      assert.throws(function() {
        call({one: "asdf"}, {count: 1});
      }, Errors.MissingPluralizationKey);
    });

    it("should reject invalid count defaults", function() {
      assert.throws(function() {
        call({one: "asdf", other: TranslateCall.prototype.UNSUPPORTED_EXPRESSION}, {count: 1});
      }, Errors.InvalidPluralizationDefault);
    });

    it("should complain if no :count is provided", function() {
      assert.throws(function() {
        call({one: "asdf", other: "qwerty"});
      }, Errors.MissingCountValue);
    });
  });

  describe("validation", function() {
    it("should require all interpolation values", function() {
      assert.throws(function() {
        call("asdf %{bob}");
      }, Errors.MissingInterpolationValue);

      // only throw if it's not set
      assert.doesNotThrow(function() {
        call("asdf %{bob}", {bob: ""});
      });
    });

    it("should require all interpolation values in count defaults", function() {
      assert.throws(function() {
        call({one: "asdf %{bob}", other: "querty"});
      }, Errors.MissingInterpolationValue);
    });
  });
});
