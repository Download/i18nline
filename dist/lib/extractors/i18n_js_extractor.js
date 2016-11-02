"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _recast = require("recast");

var _recast2 = _interopRequireDefault(_recast);

var _translate_call = require("./translate_call");

var _translate_call2 = _interopRequireDefault(_translate_call);

var _utils = require("../utils");

var _utils2 = _interopRequireDefault(_utils);

var _call_helpers = require("../call_helpers");

var _call_helpers2 = _interopRequireDefault(_call_helpers);

var _translation_hash = require("./translation_hash");

var _translation_hash2 = _interopRequireDefault(_translation_hash);

var _i18nline = require("../i18nline");

var _i18nline2 = _interopRequireDefault(_i18nline);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function I18nJsExtractor(options) {
  this.source = options.source;
  this.ast = options.ast;
}

_utils2.default.extend(I18nJsExtractor.prototype, _call_helpers2.default);

I18nJsExtractor.prototype.forEach = function (handler) {
  this.handler = handler;
  this.run();
  delete this.handler;
};

I18nJsExtractor.prototype.run = function () {
  if (!this.handler) {
    this.translations = new _translation_hash2.default();
    this.handler = this.translations.set.bind(this.translations);
  }

  var ast = this.ast || _recast2.default.parse(this.source, _i18nline2.default.config.recastOptions);
  var self = this;
  _recast2.default.visit(ast, {
    visitCallExpression: function visitCallExpression(path) {
      self.processCall(path.value, this.traverse.bind(this, path));
    }
  });
};

I18nJsExtractor.prototype.isExtractableCall = function (node, receiver, method) {
  return node.type === "MemberExpression" && !node.computed && receiver.type === "Identifier" && receiver.name === "I18n" && method.type === "Identifier" && (method.name === "t" || method.name === "translate");
};

I18nJsExtractor.prototype.processCall = function (node, traverse) {
  var callee = node.callee;
  var receiver = callee.object;
  var method = callee.property;

  if (this.isExtractableCall(callee, receiver, method)) {
    var line = receiver.loc.start.line;
    receiver = receiver.name;
    method = method.name;

    // convert nodes to literals where possible
    var args = this.processArguments(node.arguments);
    this.processTranslateCall(line, receiver, method, args);
  }

  traverse();
};

I18nJsExtractor.prototype.processArguments = function (args) {
  var result = [];
  for (var i = 0, len = args.length; i < len; i++) {
    result.push(this.evaluateExpression(args[i]));
  }
  return result;
};

I18nJsExtractor.prototype.evaluateExpression = function (node, identifierToString) {
  if (node.type === "Literal") return node.value;
  if (node.type === "Identifier" && identifierToString) return node.name;
  if (node.type === "ObjectExpression") return this.objectFrom(node);
  if (node.type === "BinaryExpression" && node.operator === "+") return this.stringFromConcatenation(node);
  return this.UNSUPPORTED_EXPRESSION;
};

I18nJsExtractor.prototype.buildTranslateCall = function (line, method, args) {
  return new _translate_call2.default(line, method, args);
};

I18nJsExtractor.prototype.processTranslateCall = function (line, receiver, method, args) {
  var call = this.buildTranslateCall(line, method, args);
  var translations = call.translations();
  for (var i = 0, len = translations.length; i < len; i++) {
    this.handler(translations[i][0], translations[i][1], call);
  }
};

I18nJsExtractor.prototype.objectFrom = function (node) {
  var object = {};
  var props = node.properties;
  var prop;
  var key;
  for (var i = 0, len = props.length; i < len; i++) {
    prop = props[i];
    key = this.evaluateExpression(prop.key, true);
    if (typeof key !== 'string') return this.UNSUPPORTED_EXPRESSION;
    object[key] = this.evaluateExpression(prop.value);
  }
  return object;
};

I18nJsExtractor.prototype.stringFromConcatenation = function (node) {
  var left = this.evaluateExpression(node.left);
  var right = this.evaluateExpression(node.right);
  if (typeof left !== "string" || typeof right !== "string") return this.UNSUPPORTED_EXPRESSION;
  return left + right;
};

exports.default = I18nJsExtractor;
