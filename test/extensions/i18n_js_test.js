/* global describe, context, it */
import {assert} from "chai";
import sinon from "sinon";
import extend from "../../lib/extensions/i18n_js";
import Utils from "../../lib/utils";

describe("I18nJs extension", function() {
  var I18n = {
    translate: function(key, options) {
      var defaultValue = options.defaultValue;
      if (typeof options.count === "number") {
        defaultValue = options.count === 1 ? defaultValue.one : defaultValue.other;
      }
      return this.interpolate(defaultValue, options);
    },

    interpolate: function(string, options) {
      var matches = string.match(this.PLACEHOLDER);
      var placeholder;
      if (!matches)
        return string;
      for (var i = 0, len = matches.length; i < len; i++) {
        placeholder = matches[i];
        var name = placeholder.replace(this.PLACEHOLDER, "$1");
        string = string.replace(placeholder, options[name]);
      }
      return string;
    }
  };
  extend(I18n);

  describe("translate", function() {
    it("should should normalize the arguments passed into the original translate", function() {
      var spy = sinon.spy(I18n, "translateWithoutI18nline");
      assert.equal(
        I18n.translate("Hello %{name}", {name: "bob"}),
        "Hello bob"
      );
      assert.deepEqual(
        ["hello_name_84ff273f", {defaultValue: "Hello %{name}", name: "bob"}],
        spy.args[0]
      );
      spy.restore();
    });

    it("should infer pluralization objects", function() {
      var spy = sinon.spy(I18n, "translateWithoutI18nline");
      I18n.translate("light", {count: 1});
      assert.deepEqual(
        ["count_lights_58339e29", {defaultValue: {one: "1 light", other: "%{count} lights"}, count: 1}],
        spy.args[0]
      );
      spy.restore();
    });

    context("with wrappers", function() {
      it("should apply a single wrapper", function() {
        var result = I18n.translate("Hello *bob*.", {wrapper: '<b>$1</b>'});
        assert.equal(result, "Hello <b>bob</b>.");
      });

      it("should be html-safe", function() {
        var result = I18n.translate("Hello *bob*.", {wrapper: '<b>$1</b>'});
        assert(result instanceof Utils.HtmlSafeString);
      });

      it("should apply multiple wrappers", function() {
        var result = I18n.translate("Hello *bob*. Click **here**", {wrappers: ['<b>$1</b>', '<a href="/">$1</a>']});
        assert.equal(result, "Hello <b>bob</b>. Click <a href=\"/\">here</a>");
      });

      it("should apply multiple wrappers with arbitrary delimiters", function() {
        var result = I18n.translate("Hello !!!bob!!!. Click ???here???", {wrappers: {'!!!': '<b>$1</b>', '???': '<a href="/">$1</a>'}});
        assert.equal(result, "Hello <b>bob</b>. Click <a href=\"/\">here</a>");
      });

      it("should html-escape the default when applying wrappers", function() {
        var result = I18n.translate("*bacon* > narwhals", {wrappers: ['<b>$1</b>']});
        assert.equal(result, "<b>bacon</b> &gt; narwhals");
      });

      it("should interpolate placeholders in the wrapper", function() {
        var result = I18n.translate("ohai *click here*", {wrapper: '<a href="%{url}">$1</a>', url: "about:blank"});
        assert.equal(result, 'ohai <a href="about:blank">click here</a>');
      });
    });
  });

  describe("interpolate", function() {
    it("should not escape anything if none of the components are html-safe", function() {
      var result = I18n.interpolate("hello & good day, %{name}", {name: "<script>"});
      assert.equal(
        result,
        "hello & good day, <script>"
      );
      assert.equal(typeof result, "string");
    });

    it("should html-escape the string and other values if any placeholder is flagged as html-safe", function() {
      var markup = "<input>";
      var result = I18n.interpolate("type %{input} & you get this: %h{output}", {input: markup, output: markup});
      assert.equal(
        result,
        "type &lt;input&gt; &amp; you get this: <input>"
      );
      assert(result instanceof Utils.HtmlSafeString);
    });

    it("should html-escape the string and other values if any value is an HtmlSafeString", function() {
      var markup = "<input>";
      var result = I18n.interpolate("type %{input} & you get this: %{output}", {input: markup, output: new I18n.Utils.HtmlSafeString(markup)});
      assert.equal(
        result,
        "type &lt;input&gt; &amp; you get this: <input>"
      );
      assert(result instanceof Utils.HtmlSafeString);
    });
  });
});
