"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var htmlEntities = {
  "'": "&#39;",
  "&": "&amp;",
  '"': "&quot;",
  ">": "&gt;",
  "<": "&lt;"
};

function HtmlSafeString(string) {
  this.string = typeof string === 'string' ? string : "" + string;
}
HtmlSafeString.prototype.toString = function () {
  return this.string;
};

var Utils = {
  HtmlSafeString: HtmlSafeString,

  difference: function difference(a1, a2) {
    var result = [];
    for (var i = 0, len = a1.length; i < len; i++) {
      if (a2.indexOf(a1[i]) === -1) result.push(a1[i]);
    }
    return result;
  },

  keys: function keys(object) {
    var keys = [];
    for (var key in object) {
      if (object.hasOwnProperty(key)) keys.push(key);
    }
    return keys;
  },

  htmlEscape: function htmlEscape(string) {
    if (typeof string === 'undefined' || string === null) return '';
    if (string instanceof Utils.HtmlSafeString) return string.toString();
    return String(string).replace(/[&<>"']/g, function (m) {
      return htmlEntities[m];
    });
  },

  regexpEscape: function regexpEscape(string) {
    if (typeof string === 'undefined' || string === null) return '';
    return String(string).replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  },

  extend: function extend() {
    var args = [].slice.call(arguments);
    var target = args.shift();
    for (var i = 0, len = args.length; i < len; i++) {
      var source = args[i];
      for (var key in source) {
        if (source.hasOwnProperty(key)) target[key] = source[key];
      }
    }
  }
};

exports.default = Utils;
