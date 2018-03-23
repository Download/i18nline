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
        // Chai handling of `throws` changed from 3.5 to 4.x
        // https://github.com/chaijs/chai/issues/1079
        try {extract("I18n.t(foo)");} 
        catch(e) {Assert.instanceOf(e, Errors.InvalidSignature); throw e}
      });
      assert.throws(function(){
        try {extract("I18n.t('foo', foo)");} 
        catch(e) {Assert.instanceOf(e, Errors.InvalidSignature); throw e}
      });
      assert.throws(function(){
        try {extract("I18n.t('foo', \"hello \" + man)");} 
        catch(e) {Assert.instanceOf(e, Errors.InvalidSignature); throw e}
      });
      assert.throws(function(){
        try {extract("I18n.t('a', \"a\", {}, {})");} 
        catch(e) {Assert.instanceOf(e, Errors.InvalidSignature); throw e}
      });
      assert.throws(function(){
        try {extract("I18n.t({one: '1', other: '2'})");} 
        catch(e) {Assert.instanceOf(e, Errors.MissingCountValue); throw e}
      });
    });
  });
});
