define(function(require, exports, module) {
	"use strict";	

	var 
		$ = require('jquery'),

		Controller = require('./Controller'),
		Pane = require('./Pane')
		;


	/*
	 * This controller controls 
	 */
	var PaneController = Controller.extend({
		"init": function(el) {
			this._super(el);

			this.panelist = {};
			this.current = null;

			this.panesEl = $('<div id="panes"></div>').appendTo(el);
		},

		"add": function(pane) {

			if (!(pane instanceof Pane)) {
				throw new Error('Cannot add items to a pane controller that is not a Pane instance');
			}
			var paneID = pane.identifier;
			// var paneEl = $('<div class="pane"></div>')
			// 	.data('paneID', paneID)
			// 	.appendTo(this.panesEl);

			pane.el.hide().appendTo(this.panesEl);

			pane.registerPaneController(this);
			this.panelist[paneID] = pane;

		},

		"debug": function() {
			console.log("debug PaneController instance");
			console.log(this.panelist);
		},

		"activate": function(paneID) {
			if (paneID === this.current) {return;}

			if (!this.panelist[paneID]) {throw new Error('Cannot activate this pane: Not Found');}

			if (this.current !== null) {
				this.panelist[this.current].deactivate();
				this.panelist[this.current].el.hide();
			}

			console.log("About to activate pane", this.panelist[paneID].el);
			this.panelist[paneID].el.show();

			this.current = paneID;
		}



	});


	return PaneController;

});