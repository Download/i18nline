var extend = require('extend');

module.exports = function(name, silent) {
	return (factory || (factory = createFactory()))(name)

	function createFactory() {
		function nop(){}
		var nopLog = {trace:nop, debug:nop, log:nop, info:nop, warn:nop, error:nop}
		var con = typeof console == 'object' ? console : nopLog
		if (silent) return function(name){return extend({name: name}, nopLog)}
		try {return require('ulog')}
		catch(e) {return function(name) {return extend({name: name}, con, {trace:nop, debug:nop, log:nop})}}
	}
}

var factory
