
define(function (require, exports, module) {

	"use strict";

	var
		FeideConnect = require('bower/feideconnectjs/src/FeideConnect').FeideConnect,
		AppController = require('./controllers/AppController'),

		FreeBusyController = require('./controllers/FreeBusyController'),
		ContactsController = require('./controllers/ContactsController'),
		VacationController = require('./controllers/VacationController'),




		PaneController = require('./controllers/PaneController'),
		dust = require('dust'),
		utils  = require('./utils'),
		rawconfig = require('text!../../etc/config.js'),
		moment = require('moment'),
		$ = require('jquery');

	moment.locale("nb");

	var tmpHeader = require('text!templates/header.html');
	var tmpFooter = require('text!templates/footer.html');

	require('../../bower_components/bootstrap/dist/js/bootstrap.min.js');

	/**
	 * Here is what happens when the page loads:
	 *
	 * Check for existing authentication.
	 * When authenticated setup clientpool.
	 * After that, check routing...
	 * Load frontpage
	 * 
	 * 
	 */

	var App = AppController.extend({
		
		"init": function() {
			var that = this;

			var config = JSON.parse(rawconfig);
			console.log("Feide Connect config", config);
			this.feideconnect = new FeideConnect(config);

			dust.loadSource(dust.compile(tmpHeader, "header"));
			dust.loadSource(dust.compile(tmpFooter, "footer"));

			// Call contructor of the AppController(). Takes no parameters.
			this._super();


			this.topLevelPane = null;

			// this.snapper = null;
			// var mobile = false;
			// if( screen.width <= 480 ) { mobile = true; }
			// // console.error("Screen width", screen.width);

			// if (mobile) {

			// 	this.snapper = new Snap({
			// 		element: document.getElementById('allDrawers')
			// 	});
			// 	this.snapper.open('left');
			// 	$('#sidebarToggle').on('click', function() {
			// 		console.log("Sidebar state is ", that.snapper.state());
			// 		if( that.snapper.state().state == "left" ){
			// 			that.snapper.close();
			// 		} else {
			// 			that.snapper.open('left');
			// 		}
			// 	});

			// } else {



			// }


			$("body").on("click", ".actPaneSelector", function(e) {
				e.preventDefault();
				var ct = $(e.currentTarget);
				var cp = ct.parent();
				var t = ct.attr("id");

				// cp.children().removeClass("active");
				// ct.addClass("active");

				if (t === 'contacts') {
					that.setTopLevelPane("contacts");
					that.contacts.load();
				} else if (t === 'vacation') {
					that.setTopLevelPane("vacation");
					that.vacation.load();
				} else {
					that.setTopLevelPane("freebusy");
					that.freebusy.load();
				}

			});


			this.pc = new PaneController(this.el.find('#panecontainer'));

			this.freebusy = new FreeBusyController(this, this.feideconnect);
			this.pc.add(this.freebusy);

			this.vacation = new VacationController(this, this.feideconnect);
			this.pc.add(this.vacation);

			this.contacts = new ContactsController(this.feideconnect);
			this.pc.add(this.contacts);


			this.setupRoute(/^\/$/, "routeMainlisting");
			this.setupRoute(/^\/freebusy\/group\/([a-zA-Z0-9_\-:]+)$/, "routeMainlisting");
			this.setupRoute(/^\/ferie\/group\/([a-zA-Z0-9_\-:]+)$/, "routeVacationListing");
			this.setupRoute(/^\/ferie$/, "routeVacationListing");

			// this.setupRoute(/^\/clients\/([a-zA-Z0-9_\-:]+)\/edit\/([a-zA-Z]+)$/, "routeEditClient");
			// this.setupRoute(/^\/apigk\/([a-zA-Z0-9_\-:]+)\/edit\/([a-zA-Z]+)$/, "routeEditAPIGK");
			// this.setupRoute(/^\/clients\/([a-zA-Z0-9_\-:]+)$/, "viewclient");
			// this.setupRoute(/^\/new$/, "newGroup");

			// this.feideconnect.authenticate();


			this.pc.debug();

			// this.route();


			this.draw();	

			that.feideconnect.authenticate();

			// this.el.on("click", ".login", function(e) {
			// 	e.preventDefault();
			// 	that.feideconnect.authenticate();
			// 	console.log("Initiating login...!");
			// });
			this.el.on("click", "#logout", function() {
				that.feideconnect.logout();
				setTimeout(function() {

					var c = that.feideconnect.getConfig();
					var url = c.apis.auth + '/logout';
					console.error("Redirect to " + url);
					window.location = url;

				}, 200);
			});



			this.feideconnect.onStateChange(function(authenticated, user) {

				that.onLoaded()
					.then(function() {

						that.updateTopLevelPane();
						that.route();

						if (authenticated) {

							$("body").addClass("stateLoggedIn");
							$("body").removeClass("stateLoggedOut");

							$("#username").empty().text(user.name);
							$("#profilephoto").html('<img style="margin-top: -28px; max-height: 48px; max-width: 48px; border: 0px solid #b6b6b6; border-radius: 32px; box-shadow: 1px 1px 4px #aaa;" src="https://auth.dev.feideconnect.no/user/media/' + user.profilephoto + '" alt="Profile photo" />');

							$(".loader-hideOnLoad").hide();
							$(".loader-showOnLoad").show();

							// that.postinit();

						} else {

							$("body").removeClass("stateLoggedIn");
							$("body").addClass("stateLoggedOut");

							$(".loader-hideOnLoad").show();
							$(".loader-showOnLoad").hide();

						}


					});

			});


		},

		"updateTopLevelPane": function() {
			var x = this.topLevelPane;
			$("#topLevelNavBar .actPaneSelector").each(function(i, item) {
				var c = $(item).attr("id");
				// console.error("Comparing ", c, x);
				if (c === x) {
					$(item).addClass("active");
				} else {
					$(item).removeClass("active");
				}
			});
		},

		"setTopLevelPane": function(x) {
			// console.error("setTopLevelPane", x);
			this.topLevelPane = x;
			this.updateTopLevelPane();
		},



		/**
		 * A draw function that draws the header and footer template.
		 * Supports promises
		 * @return {[type]} [description]
		 */
		"draw": function() {
			var that = this;

			var view = {
			};

			this.loaded = false;
			return Promise.all([
				new Promise(function(resolve, reject) {
					dust.render("header", view, function(err, out) {
						if (err) { return reject(err); }
						that.el.find("#header").append(out);
						resolve();
					});
				}),
				new Promise(function(resolve, reject) {
					dust.render("footer", view, function(err, out) {
						if (err) { return reject(err); }
						that.el.find("#footer").append(out);
						resolve();
					});
				})
			]).then(function() {
				that.loaded = true;
				if (that._onloadedCallback && typeof that._onloadedCallback === 'function') {
					that._onloadedCallback();
				}
			});
		},



		"onLoaded": function() {
			var that = this;
			return new Promise(function(resolve, reject) {
				if (that.loaded) {
					resolve();
				} else {
					that._onloadedCallback = resolve;
				}
			});
		},





		"setErrorMessage": function(title, type, msg) {

			var that = this;
			type = (type ? type : "danger");

			// console.error("Error ", title, type, typeof msg, msg);

			var pmsg = '';
			if (typeof msg === 'object' && msg.hasOwnProperty("message")) {
				pmsg = '<p>' + utils.escape(msg.message, false).replace("\n", "<br />") + '</p>';
			} else if (typeof msg === 'string') {
				pmsg = '<p>' + utils.escape(msg, false).replace("\n", "<br />") + '</p>';
			}

			var str = '<div class="alert alert-' + type + ' alert-dismissible" role="alert">' +  
				' <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
				(title ? '<strong>' + utils.escape(title, false).replace("\n", "<br />")  + '</strong>' : '') +
				pmsg + 
				'</div>';

			if (this.hasOwnProperty("errorClearCallback")) {
				clearTimeout(this.errorClearCallback);
			}

			this.errorClearCallback = setTimeout(function() {
				$("#errorcontainer").empty();
			}, 10000);

			$("#errorcontainer").empty().append(str);

		},


		// "routeEditClient": function(clientid, tabid) {
		// 	var that = this;
		// 	console.log("Route edit client", clientid);
		// 	this.clientpool.ready(function() {
		// 		var client = that.clientpool.getClient(clientid);
		// 		that.clienteditor.edit(client, tabid);
		// 	});


		// },
		// "routeEditAPIGK": function(apigkid, tabid) {
		// 	var that = this;
		// 	console.log("Route edit apigkid", apigkid);

		// 	this.feideconnect.authenticated()
		// 		.then(function() {
		// 			that.clientpool.ready(function() {
		// 				var apigk = that.clientpool.getAPIGK(apigkid);
		// 				that.apigkeditor.edit(apigk, tabid);
		// 			});
		// 		});

		// },

		"routeVacationListing": function(x) {
			this.vacation.load(x);
		},

		"routeMainlisting": function(x) {
			// console.log("ABOUT");
			// this.setHash('/');
			this.freebusy.load(x);
		}



	});


	return App;
});
