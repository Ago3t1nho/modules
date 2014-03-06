// MIT License
// Copyright Peter Širka (www.petersirka.sk)
// Version 1.02

global.jade = require('jade');

var definition = (function() {
	Controller.prototype.view = function (name, model, headers, isPartial) {

		var self = this;
		var skip = name[0] === '~';

		if (!self.isLayout && !skip)
			name = self._currentView + name;

		if (skip)
			name = name.substring(1);

		if (typeof(isPartial) === UNDEFINED && typeof(headers) === BOOLEAN) {
			isPartial = headers;
			headers = null;
		}

		var filename = name;
		var prefix = self.prefix;
		var key = 'jade_' + name + '#' + prefix;

		var fn = self.cache.read(key);

		if (fn === null) {

			var fs = require('fs');
			var ext = '.jade';
			var isPrefix = prefix.length > 0;

			var exists = fs.existsSync(self.path.views(filename + (isPrefix ? '#' + prefix : '') + ext));

			if (!exists) {
				if (isPrefix)
					exists = fs.existsSync(self.path.views(filename + ext));
			} else
				filename += (isPrefix ? '#' + prefix : '');

			if (!exists) {
				self.view500('View "' + name + '" not found.');
				return;
			}
			
			var path = self.path.views(filename + ext);
			var options = utils.extend({ filename: path }, exports.options);

			var fn = jade.compile(fs.readFileSync(path).toString('utf8'), options);

			if (!self.config.debug && fn !== null)
				self.cache.add(key, fn, new Date().add('m', 4));

			if (fn === null) {
				self.view500('View "' + name + '" not found.');
				return;
			}
		}

		if (isPartial)
			return fn(model);

		self.subscribe.success();

		if (self.isConnected) {
			self.framework.responseContent(self.req, self.res, self.status, fn(model), 'text/html', true, headers);
			self.framework.stats.response.view++;
		}

		return self;
	};
});

setTimeout(function() {
	framework.eval(definition);
}, 100);