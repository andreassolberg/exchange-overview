/**
 * This utility object contains a few function that is used in various placed, and is more generic functions.
 */
define(function(require, exports, module) {

	"use strict";
	/* jslint bitwise: true */
	/* jshint ignore:start */


	var utils = {
		"guid": function() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random()*16|0;
				var v = c === 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		},

		// Credits to 
		// http://shebang.brandonmintern.com/foolproof-html-escaping-in-javascript/
		"escape": function(s, forAttribute) {
			var r = ((forAttribute !== false) ? 
				new RegExp('[&<>\'"]', 'g') : 
				new RegExp('[&<>]', 'g'));
			var MAP = { '&': '&amp;',
						'<': '&lt;',
						'>': '&gt;',
						'"': '&quot;',
						"'": '&#39;'};
			var p = s.replace(r, function(c) {
				return MAP[c];
			});
			return p;
		},
		"getKeys": function(obj) {
			var list = [];
			if (typeof obj !== "object") {
				return list;
			}
			for(var key in obj) {
				if (obj.hasOwnProperty(key)) {
					list.push(key);
				}
			}
			return list;
		}
	};



	return utils;
	/* jshint ignore:end */
});