import recast from "recast";
import TranslateCall from "./translate_call";
import Utils from "../utils";
import CallHelpers from "../call_helpers";
import TranslationHash from "./translation_hash";
import I18nline from "../i18nline";

function I18nJsExtractor(options) {
  this.source = options.source;
  this.ast = options.ast;
}

Utils.extend(I18nJsExtractor.prototype, CallHelpers);

I18nJsExtractor.prototype.forEach = function(handler) {
  this.handler = handler;
  this.run();
  delete this.handler;
};

I18nJsExtractor.prototype.run = function() {
  if (!this.handler) {
    this.translations = new TranslationHash();
    this.handler = this.translations.set.bind(this.translations);
  }

  var ast = this.ast || recast.parse(this.source, I18nline.config.recastOptions);
  var self = this;
  recast.visit(ast, {
    visitCallExpression: function(path) {
      self.processCall(path.value, this.traverse.bind(this, path));
    }
  });
};

I18nJsExtractor.prototype.isExtractableCall = function(node, receiver, method) {
  return node.type === "MemberExpression" &&
    !node.computed &&
    receiver.type === "Identifier" &&
    receiver.name === "I18n" &&
    method.type === "Identifier" &&
    (method.name === "t" || method.name === "translate");
};

I18nJsExtractor.prototype.processCall = function(node, traverse) {
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

I18nJsExtractor.prototype.processArguments = function(args) {
  var result = [];
  for (var i = 0, len = args.length; i < len; i++) {
    result.push(this.evaluateExpression(args[i]));
  }
  return result;
};

I18nJsExtractor.prototype.evaluateExpression = function(node, identifierToString) {
  if (node.type === "Literal")
    return node.value;
  if (node.type === "Identifier" && identifierToString)
    return node.name;
  if (node.type === "ObjectExpression")
    return this.objectFrom(node);
  if (node.type === "BinaryExpression" && node.operator === "+")
    return this.stringFromConcatenation(node);
  return this.UNSUPPORTED_EXPRESSION;
};

I18nJsExtractor.prototype.buildTranslateCall = function(line, method, args) {
  return new TranslateCall(line, method, args);
};

I18nJsExtractor.prototype.processTranslateCall = function(line, receiver, method, args) {
  var call = this.buildTranslateCall(line, method, args);
  var translations = call.translations();
  for (var i = 0, len = translations.length; i < len; i++)
    this.handler(translations[i][0], translations[i][1], call);
};

I18nJsExtractor.prototype.objectFrom = function(node) {
  var object = {};
  var props = node.properties;
  var prop;
  var key;
  for (var i = 0, len = props.length; i < len; i++) {
    prop = props[i];
    key = this.evaluateExpression(prop.key, true);
    if (typeof key !== 'string')
      return this.UNSUPPORTED_EXPRESSION;
    object[key] = this.evaluateExpression(prop.value);
  }
  return object;
};

I18nJsExtractor.prototype.stringFromConcatenation = function(node) {
  var left = this.evaluateExpression(node.left);
  var right = this.evaluateExpression(node.right);
  if (typeof left !== "string" || typeof right !== "string")
    return this.UNSUPPORTED_EXPRESSION;
  return left + right;
};

export default I18nJsExtractor;
