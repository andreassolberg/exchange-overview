define(function(require, exports, module) {

	var moment = require('moment');
	var WeekSelector = require('./WeekSelector');
	var GroupSelector = require('./GroupSelector');
	var UserCalendar = require('./UserCalendar');

	var JSO = require('bower/jso/src/jso');

	moment.locale("nb");

	JSO.enablejQuery($);




	var App = function() {
		var that = this;
		this.data = null;
		this.uc = {};
		this.users = {};
		this.resources = {};

		this.snapper = null;
		var mobile = false;
		if( screen.width <= 480 ) { mobile = true; }
		console.error("Screen width", screen.width);

		if (mobile) {

			this.snapper = new Snap({
				element: document.getElementById('allDrawers')
			});
			this.snapper.open('left');
			$('#sidebarToggle').on('click', function() {
				console.log("Sidebar state is ", that.snapper.state());
				if( that.snapper.state().state == "left" ){
					that.snapper.close();
				} else {
					that.snapper.open('left');
				}
			});

		} else {

			$("#grpbtn").hide();
			$("#weekdisplay").removeClass('col-sm-6').addClass('col-sm-9');
			$("#mainOuter").removeClass('col-sm-12').addClass('col-sm-9');
			$("#allContent").removeClass('allContent');
			$("#allDrawers").removeClass('allDrawers');
			$("#allDrawers")
				.removeClass('snap-drawer').removeClass('snap-drawer-left')
				.addClass('col-sm-3')
				.detach().prependTo("#mainOuterRow");

		}


		this.jso = new JSO({
			providerId: "feideconnect",
			client_id: "4810ff81-b2e0-4d9d-8123-3bf8fbb3cd9b",
			redirect_uri: "https://cal.uninett.no/",
			authorization: "https://auth.uwap.uninettlabs.no/oauth/authorization"
		});

	};

	App.prototype.filterUsers = function(user, allowed) {
		for(var i = 0; i < allowed.length; i++) {
			if (user.mail === allowed[i]) return true;
		}
		return false;
	};

	App.prototype.authcheck = function() {

		this.jso.callback();

		// window.location.hash = '!/';

		this.jso.ajax({
			url: "https://api.uwap.uninettlabs.no/userinfo",
			oauth: {
				scopes: {
					// request: ["userinfo", "longterm"],
					// require: ["userinfo", "rest_simonapi"]
				}
			},
			dataType: 'json',
			success: function(data) {
				console.log("Response (google):");
				console.log(data);
				$(".loader-hideOnLoad").hide();
				$('#out').empty().append('<pre>' + JSON.stringify(data, undefined, 4) + '</pre>');
			}
		});


	};

	App.prototype.init = function() {
		var that = this;
		this.setupPopover();

		this.now = moment();



		this.groupselector = new GroupSelector();
		this.groupselector.on(function() {
			if (that.snapper !== null) {
				console.error("Closing snapper", that.snapper);
				setTimeout(function() {
					that.snapper.close();
				}, 1000);
				
			}
			that.draw();
		});

		this.weekselector = new WeekSelector();
		this.weekselector.on(function() {
			that.draw();
		});


		this.jso.ajax({
			url: "https://uninettcalendar.gk.uwap.uninettlabs.no/",
			oauth: {
				scopes: {
					// request: ["userinfo", "longterm"],
					// require: ["userinfo", "rest_simonapi"]
				}
			},
			dataType: 'json',
			success: function(data) {
				that.data = data;

				// console.error("Received data", data); return;

				var uid, i;
				for(i = 0; i < data.users.length; i++) {
					that.users[data.users[i].mail] = data.users[i];
				}
				for(i = 0; i < data.resources.length; i++) {
					that.resources[data.resources[i].mail] = data.resources[i];
				}

				for(uid in data.data ) {
					// if (!that.users.hasOwnProperty(uid)) continue;
					that.uc[uid] = new UserCalendar(that.users[uid], data.data[uid]);
				}
				// for(uid in data.resources) {
				// 	if (!that.resources.hasOwnProperty(uid)) continue;
				// 	that.uc[uid] = new UserCalendar(that.resources[uid], data.resources[uid]);
				// }
				console.error("Resources was", that.resources);
				that.draw();
				that.groupselector.display(data.groups);
				that.debug();
			}
		});
		
	};



	App.prototype.debug = function() {
		console.log(" ----- DEBUG -----");
		var start = moment('2015-01-05 10:00');
		var end = moment('2015-01-05 10:30');
		var res = this.uc['andreas.solberg@uninett.no'].checkPeriod(start, end);
		console.log("Res", res);
	};

	App.prototype.setupPopover = function() {
		var that = this;
		this.popovercache = {};

		var popOverSettings = {
			animation: true,
		    placement: 'bottom',
		    container: 'body',
		    html: true,
		    trigger: "hover",
		    selector: 'td.a.c',
		    content: function () {
		    	var cell = $(this).data('cell');
		    	var day = $(this).data('day');
		    	var user = $(this).closest('tr').data('user');
		    	var index = that.weekselector.getIndex();
		    	var cachestr = index + ':' + user + ':' + day + ':' + cell;
		    	console.log("popover cache string", cachestr);
		    	if (that.popovercache.hasOwnProperty(cachestr)) {
		    		return that.popovercache[cachestr];
		    	}
		    	console.log("popover with user [" + user+ "]", user, day, cell);
		    	var period = that.weekselector.getPeriod(day, cell);
		    	var periodend = that.weekselector.getPeriod(day, cell+1);
		    	var content = that.uc[user].getPopover(period, periodend);
		    	// console.log("Getpopover for period", period.format('lll'));
		    	// that.popovercache[cachestr] = content;
		    	
		        return content;
		    }
		};

		$("#mainview").popover(popOverSettings);
	};



	App.prototype.getUserCell = function(cal, day, i) {
		var str = '';

		var period = this.weekselector.getPeriod(day, i);
		var periodend = this.weekselector.getPeriod(day, i+1);
		var check = cal.checkPeriod(period, periodend);

		var even = (i % 2 === 0) ? 'even' : 'odd';
		var classes = ['a', even];

		if (period.isBefore(this.now, 'minute')) {
			classes.push('Past');
		}

		if (check === null) {

			classes.push('Avail');
			if (i === 7 || i === 8) {
				classes.push('Lunch');
			} else if (i <= 1 || i >= 14) {
				classes.push('Lunch');
			}

		} else {
			classes.push('c');
			classes.push(UserCalendar.mergeEventClasses(check));
			// str += '<td data-day="' + day + '" data-cell="' + i + '" class="a c ' + even + ' ' + classes + '"></td>';
		}

		str += '<td data-day="' + day + '" data-cell="' + i + '" class="' + classes.join(' ') + '"></td>';

		return str;
	};

	App.prototype.getUserDay = function(cal, day) {
		var str = '<td class="sep"></td>';
		for(var i = 0; i < 16; i++) {
			str += this.getUserCell(cal, day, i);
		}
		return str;
	};


	App.prototype.getUserRow = function(user) {
		var str = '<tr data-user="' + user.mail + '">' + 
			'<td class="user">' + user.name + '</td>';
		var day;

		if (this.uc.hasOwnProperty(user.mail)) {
			for(day = 0; day < 5; day++ ) {
				str += this.getUserDay(this.uc[user.mail], day);
			}
		} else {
			str += '<td class="nodata" colspan="' + (5*17) + '">No data</td>';
		}

		str += '</tr>';
		return str;
	};


	App.prototype.getUserFilter = function() {

		var filter = {};

		var group = this.groupselector.getSelected();
		if (group === null) return null;
		if (group === '_all') return null;
		if (group === '_me' && this.data.currentUser) {
			filter[this.data.currentUser] = true;
 		}
 		if (this.data.groups.hasOwnProperty(group)) {
 			for(var i = 0; i < this.data.groups[group].users.length; i++) {
 				filter[this.data.groups[group].users[i]] = true;
 			}
 		}
 		return filter;
	};

	App.prototype.draw = function() {

		var mh = $('#mainheader').empty();

		var str = '<tr><td>&nbsp;</td>';
		for(var i = 0; i < 5; i++) {
			str += '<td class="daytitle" colspan="17">' + this.weekselector.getDayTitle(i) + '</td>';
		}
		str += '</tr>';
		mh.append(str);

		var group = this.groupselector.getSelected();
		var filter = this.getUserFilter();
		// console.error("Filter is", filter);
		
		var targetlist = this.users;
		if (group === '_res') {
			targetlist = this.resources;
			filter = null;
		}

		var mv = $("#mainview").empty();
		var key, item;
		for(key in targetlist) {
			if (filter !== null && !filter.hasOwnProperty(key)) continue;
			item = targetlist[key];
			console.error("About to process", item);
			mv.append(this.getUserRow(item));
		}


		// $("pre").empty().append(JSON.stringify(this.data.data['andreas.solberg@uninett.no'], undefined, 2));

	};


	$(document).ready(function() {

		var a = new App();
		a.authcheck();
		a.init();


	});

	return App;

});