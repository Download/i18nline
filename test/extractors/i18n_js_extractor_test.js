/* global describe, it */
var assert = require('chai').assert;
var I18nJsExtractor = require('../../lib/extractors/i18n_js_extractor');
var Errors = require('../../lib/errors');

describe("I18nJsExtractor", function() {
  describe(".translations", function() {
    function extract(source) {
      var extractor = new I18nJsExtractor({source: source});
      extractor.run();
      return extractor.translations.translations;
    }

    it("should ignore non-t calls", function() {
      assert.deepEqual(
        extract("foo('Foo')"),
        {}
      );
    });

    it("should not extract t calls with no default", function() {
      assert.deepEqual(
        extract("I18n.t('foo.foo')"),
        {}
      );
    });

    it("should extract valid t calls", function() {
      assert.deepEqual(
        extract("I18n.t('Foo')"),
        {"foo_f44ad75d": "Foo"}
      );
      assert.deepEqual(
        extract("I18n.t('Foo ' + 'Bar')"),
        {"foo_bar_6c8e5736": "Foo Bar"}
      );
      assert.deepEqual(
        extract("I18n.t('bar', 'Baz')"),
        {bar: "Baz"}
      );
      assert.deepEqual(
        extract("I18n.translate('one', {one: '1', other: '2'}, {count: 1})"),
        {one: {one: "1", other: "2"}}
      );
      assert.deepEqual(
        extract("I18n.t({one: 'just one', other: 'zomg lots'}, {count: 1})"),
        {"zomg_lots_a54248c9": {one: "just one", other: "zomg lots"}}
      );
    });

    it("should support jsx and es6", function() {
      assert.deepEqual(
        extract("let foo = () => <b>{I18n.t('Foo', {bar})}</b>"),
        {"foo_f44ad75d": "Foo"}
      );
    });

    it("should bail on invalid t calls", function() {
      assert.throws(function(){
        extract("I18n.t(foo)");
      }, Errors.InvalidSignature);
      assert.throws(function(){
        extract("I18n.t('foo', foo)");
      }, Errors.InvalidSignature);
      assert.throws(function(){
        extract("I18n.t('foo', \"hello \" + man)");
      }, Errors.InvalidSignature);
      assert.throws(function(){
        extract("I18n.t('a', \"a\", {}, {})");
      }, Errors.InvalidSignature);
      assert.throws(function(){
        extract("I18n.t({one: '1', other: '2'})");
      }, Errors.MissingCountValue);
    });
  });
});
