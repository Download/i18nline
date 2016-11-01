"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _check = require("./commands/check");

var _check2 = _interopRequireDefault(_check);

var _export = require("./commands/export");

var _export2 = _interopRequireDefault(_export);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* global process */

var error = process.stderr.write.bind(process.stderr);

function capitalize(string) {
  return typeof string === "string" && string ? string.slice(0, 1).toUpperCase() + string.slice(1) : string;
}

var Commands = {
  run: function run(name, options) {
    options = options || {};
    var Command = this[capitalize(name)];
    if (Command) {
      try {
        return new Command(options).run();
      } catch (e) {
        error(e.message + "\n");
      }
    } else {
      error("unknown command " + name + "\n");
    }
    return false;
  },

  Check: _check2.default,
  Export: _export2.default
};

exports.default = Commands;
