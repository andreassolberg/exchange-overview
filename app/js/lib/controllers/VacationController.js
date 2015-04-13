define(function(require, exports, module) {
	"use strict";	

	var 
		dust = require('dust'),
		Pane = require('./Pane'),
		EventEmitter = require('../EventEmitter'),
		utils = require('../utils'),
		$ = require('jquery'),

		SeasonSelector = require('../SeasonSelector'),
		GroupSelector = require('../GroupSelector'),
		UserCalendar = require('../UserCalendar'),

		moment = require('moment'),

		template = require('text!templates/freebusy.html')
		;

	/*
	 * This controller controls 
	 */
	var VacationController = Pane.extend({
		"init": function(app, feideconnect) {

			var that = this;
			this.app = app;
			this.feideconnect = feideconnect;


			this.fellesferieStart = moment("2015-07-05");
			this.fellesferieSlutt = moment("2015-07-25");


			this._super();
			dust.loadSource(dust.compile(template, "freebusy"));

			this.data = null;
			this.uc = {};
			this.users = {};
			this.resources = {};


			this.loaded = false;

			this.now = moment();

		},


		"setupPopover": function() {
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
					var week = $(this).data('week');
					var day = $(this).data('day');
					var user = $(this).closest('tr').data('user');
					var index = that.seasonselector.getIndex();
					var cachestr = index + ':' + user + ':' + day + ':' + week;
					// console.log("popover cache string", cachestr);
					if (that.popovercache.hasOwnProperty(cachestr)) {
						return that.popovercache[cachestr];
					}
					// console.log("popover with user [" + user+ "]", user, day, cell);
					var period = that.seasonselector.getPeriod(week, day);
					var periodend = that.seasonselector.getPeriod(week, day+1);
					var content = that.uc[user].getPopover(period, periodend, "season");
					// console.log("Getpopover for period", period.format('lll'));
					// that.popovercache[cachestr] = content;
					
					return content;
			    }
			};

			this.el.popover(popOverSettings);
		},


		"load": function(selectedGroup) {
			if (this.loaded) {
				this.activate();
				return;
			}

			this.loaded = true;

			var that = this;
			this.draw(true)
				.then(that.postLoad(selectedGroup));
		},

		"postLoad": function(selectedGroup) {
			var that = this;
			this.setupPopover();
			that.app.setTopLevelPane("vacation");
			that.app.setHash('/ferie');
			
			this.groupselector = new GroupSelector(this.el, false);
			this.groupselector.set(selectedGroup);
			this.groupselector.on(function(sel) {
				that.app.setHash('/ferie/group/' + sel);
				
				that.drawContent();

			});

			this.seasonselector = new SeasonSelector(this.el);
			this.seasonselector.on(function() {
				that.drawContent();
			});

			this.feideconnect._customRequest("https://calendar.gk.feideconnect.no/api/ferie", ["gk_calendar"], ["gk_calendar"])
				.then(function(data) {
					that.data = data;

					// console.error("Received data", data); return;

					var uid, i;
					for(i = 0; i < data.users.length; i++) {
						that.users[data.users[i].mail] = data.users[i];
					}

					for(uid in data.data ) {
						// if (!that.users.hasOwnProperty(uid)) continue;
						// console.error("Received data", data.data[uid]); return;
						that.uc[uid] = new UserCalendar(that.users[uid], data.data[uid]);

						// this.cal.CalendarEventArray.CalendarEvent

					}
					for(uid in data.resources) {
						if (!that.resources.hasOwnProperty(uid)) { continue; }
						that.uc[uid] = new UserCalendar(that.resources[uid], data.resources[uid]);
					}
					// console.error("Resources was", that.resources);

					that.groupselector.display(data.groups);
					that.drawContent();
					// that.debug();
				});
		},
		
		"draw": function(act) {
			var that = this;
			return new Promise(function(resolve, reject) {
				var view = {"season": true};
				dust.render("freebusy", view, function(err, out) {
					// console.error("Render freebusy", out);
					// console.log("that.el", that.el);
					that.el.empty().append(out);
					if (!err) { 
						resolve() 
					} else {
						reject(err); 
					}
				});
				if (act) {
					// console.error("ACTIVATE");
					that.activate();
				}
			});
		},

		"getUserFilter": function() {

			var filter = {};

			var group = this.groupselector.getSelected();
			if (group === null) {return null;}
			if (group === '_all') {return null;}
			if (group === '_me' && this.data.currentUser) {
				filter[this.data.currentUser] = true;
	 		}
	 		if (this.data.groups.hasOwnProperty(group)) {
	 			for(var i = 0; i < this.data.groups[group].users.length; i++) {
	 				filter[this.data.groups[group].users[i]] = true;
	 			}
	 		}
	 		return filter;
	 	},

		"getUserCell": function(cal, week, day) {
			var str = '';

			var period = this.seasonselector.getPeriod(week, day);
			var periodend = this.seasonselector.getPeriod(week, day+1);
			var check = cal.checkPeriod(period, periodend);

			// console.error("Period", period);
			// console.error("Period", periodend);
			// console.error("Check", check);
			// return;


			var even = (day % 2 === 0) ? 'even' : 'odd';
			var classes = ['a', even];

			if (period.isBefore(this.now, 'minute')) {
				classes.push('Past');
			}

			if (check === null) {

				classes.push('Avail');

				if (period.isAfter(this.fellesferieStart) && period.isBefore(this.fellesferieSlutt)) {
					classes.push('Lunch');
				}

				// if (day === 7 || day === 8) {
				// 	classes.push('Lunch');
				// } else if (day <= 1 || day >= 14) {
				// 	classes.push('Lunch');
				// }

			} else {
				classes.push('c');
				classes.push(UserCalendar.mergeEventClasses(check));
				// str += '<td data-day="' + day + '" data-cell="' + i + '" class="a c ' + even + ' ' + classes + '"></td>';
			}

			str += '<td data-week="' + week + '" data-day="' + day + '" class="' + classes.join(' ') + '"></td>';

			return str;
		},

		"getUserWeek": function(cal, week) {
			var str = '<td class="sep" style=""></td>';
			for(var day = 0; day < 5; day++) {
				str += this.getUserCell(cal, week, day);
			}
			return str;
		},

		"getUserRow": function(user) {
			var str = '<tr data-user="' + user.mail + '">' + 
				'<td class="user">' + user.name + '</td>';
			
			var week;

			if (this.uc.hasOwnProperty(user.mail)) {
				for(week = 0; week < 20; week++ ) {
					str += this.getUserWeek(this.uc[user.mail], week);
				}
			} else {
				str += '<td class="nodata" colspan="' + (5*17) + '">No data</td>';
				return '';
			}

			str += '</tr>';
			return str;
		},

		"drawContent": function() {

			var i;
			var mh = this.el.find('.mainheader').eq(0).empty();

			// console.error("Main header", mh);

			var str = '<tr><td>&nbsp;</td>';
			for(i = 0; i < 20; i++) {
				str += '<td class="daytitle" colspan="6" style="font-size: 75%; padding: 0px">' + this.seasonselector.getDayTitle(i) + '</td>';
			}
			str += '</tr>';
			mh.append(str);

			var group = this.groupselector.getSelected();
			var filter = this.getUserFilter();

			
			var targetlist = this.users;
			if (group === '_res') {
				targetlist = this.resources;
				filter = null;
			}

			var mv = this.el.find(".mainview").eq(0).empty();
			var key, item;
			var targetarray = [];

			for(key in targetlist) {
				targetarray.push(targetlist[key]);
			}
			targetarray.sort(function(a,b) {
				if (a.name > b.name) {return 1;}
				if (a.name < b.name) {return -1;}
				return 0;
			});

			// console.error("Filter is", filter);
			// console.error("group is", group);
			// console.error("Target array", targetarray);

			for(i = 0; i < targetarray.length; i++) {
				if (filter !== null && !filter.hasOwnProperty(targetarray[i].mail)) {continue;}
				item = targetarray[i];
				// console.error("About to process", item);
				// console.log("row", this.getUserRow(item));
				mv.append(this.getUserRow(item));
			}

		}


	}).extend(EventEmitter);

	return VacationController;

});
