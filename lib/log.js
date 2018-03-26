var ulog = require('ulog');

module.exports = function(name, silent) {
	if (silent) ulog.level = ulog.NONE;
	return ulog(name);
}
