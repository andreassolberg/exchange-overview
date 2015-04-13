define(function(require, exports, module) {

	"use strict";
	var 
		Class = require('./class');



	var parsed = null;

	var TemplateEngine = Class.extend({
		"init": function() {
			// if (parsed === null) {
			// 	parsed = JSON.parse(dict);
			// }
		},
		"get": function() {
			return parsed;
		}
	});

	return TemplateEngine;

});