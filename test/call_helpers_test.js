/* global describe, it */
var assert = require('chai').assert;
var CallHelpers = require('../lib/call_helpers');

describe("CallHelpers", function() {
  describe("applyWrappers", function() {
    it("should apply array wrappers", function() {
      assert.equal(
        CallHelpers.applyWrappers(
          "*hello* ***bob*** **lol**",
          ["<b>$1</b>", "<em>$1</em>", "<i>$1</i>"]
        ),
        "<b>hello</b> <i>bob</i> <em>lol</em>"
      );
    });

    it("should apply object wrappers", function() {
      assert.equal(
        CallHelpers.applyWrappers(
          "*hello* ***bob*** **lol**",
          {"*": "<b>$1</b>", "**": "<em>$1</em>", "***": "<i>$1</i>"}
        ),
        "<b>hello</b> <i>bob</i> <em>lol</em>"
      );
    });
  });
});


