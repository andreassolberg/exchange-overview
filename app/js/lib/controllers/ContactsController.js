define(function(require, exports, module) {
	"use strict";	

	var 
		dust = require('dust'),
		Pane = require('./Pane'),
		EventEmitter = require('../EventEmitter'),
		utils = require('../utils'),
		$ = require('jquery'),

		template = require('text!templates/contacts.html')
		;

	/*
	 * This controller controls 
	 */
	var ContactsController = Pane.extend({
		"init": function() {
			this._super();
			dust.loadSource(dust.compile(template, "contacts"));
		},


		"load": function() {
			this.draw(true);
		},
		
		"draw": function(act) {
			var that = this;
			var view = {};
			dust.render("contacts", view, function(err, out) {
				console.log("Got this", out);
				that.el.empty().append(out);
			});
			if (act) {
				this.activate();
			}

		}
	}).extend(EventEmitter);

	return ContactsController;

});
