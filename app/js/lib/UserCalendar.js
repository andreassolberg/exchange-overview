define(function(require, exports, module) {


	var debug = 2;

	var moment = require('moment');
	require('momentl');



	var escapeHTML = (function() {
		var MAP = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&#34;',
			"'": '&#39;'
		};
		var repl = function(c) { return MAP[c]; };
		return function(s) {
			return s.replace(/[&<>'"]/g, repl);
		};
	})();

	var Event = function(data) {
		this.data = data;
		this.start = moment(data.StartTime, moment.ISO_8601);
		this.end = moment(data.EndTime, moment.ISO_8601);

		// console.log(data.StartTime, this.start.format('lll'));
		// console.log("Parsed end", data.EndTime, this.end.format('lll'));
	};

	Event.prototype.getStr = function(type) {

		var str = '<p>';
		// console.log("get string of this event", this);

		if (type === 'season') {
			str += this.start.format('Do MMMM') + ' - ' + 
				this.end.clone().subtract(5, 'minutes').format('Do MMMM') + ' ';

		} else {
			str += this.start.format('HH:mm') + '-' + 
				this.end.format('HH:mm') + ' ';

		}


		if (this.data.CalendarEventDetails && this.data.CalendarEventDetails.Subject) {
			str += escapeHTML(this.data.CalendarEventDetails.Subject);
		}
		if (this.data.CalendarEventDetails && this.data.CalendarEventDetails.Location) {
			str += '<br/>(<span style="font-size: 90%">' + escapeHTML(this.data.CalendarEventDetails.Location) + '</span>)';
		}
		if (this.data.BusyType) {
			str += ' ' + escapeHTML(this.data.BusyType);
		}
		str += '</p>';
		return str;

	};

	Event.prototype.getBusyType = function() {
		if (this.data.CalendarEventDetails && this.data.CalendarEventDetails.Location && 
				this.data.CalendarEventDetails.Location === 'Norge') {
			return 'Red';

		}
		if (this.data.BusyType) {
			return this.data.BusyType;
		}
		return 'Error';
	};

	Event.prototype.overlapTimeslot = function(period, resolution) {
		if (this.start.isAfter(period, resolution)) return false; // Event is starting after the period end
		if (this.end.isBefore(period, resolution)) return false; // Event is ending before period start
		return true;

	};

	Event.prototype.overlap = function(periodstart, periodend) {
		// var periodend = periodstart.clone().add(30, 'minutes');
		if (this.start.isAfter(periodend, 'minute') || 
			this.start.isSame(periodend, 'minute')
			) return false; // Event is starting after the period end
		if (this.end.isBefore(periodstart, 'minute') || 
			this.end.isSame(periodstart, 'minute')
			) return false; // Event is ending before period start
		return true;
	};




	var UserCalendar = function(user, cal) {
		this.user = user;
		this.cal = cal;
		this.events = [];
		this.eventDayCache = {};

		// if (this.cal.FreeBusyViewType) {
		// 	console.log("Calendar data ", this.user.name, this.cal.FreeBusyViewType, this.cal);
		// } else {
		// 	console.log("Calendar data type not reckognized", this.user.name);
		// }

		if (this.cal) {
			for(var i = 0; i < this.cal.length; i++) {
				this.events.push(new Event(this.cal[i]));
			}
		} else {
			console.log("Could not find calendar event array for " + this.user.name);
		}

	};

	UserCalendar.mergeEventClasses = function(events) {

		var levels = {
			'Free': 0,
			'OOF': 8,
			'Tentative': 10,
			'Red': 15,
			'Busy': 20
		};
		var max = 0;
		for(var i = 0; i < events.length; i++) {
			if (levels[events[i].getBusyType()] > max) max = levels[events[i].getBusyType()];
		}
		for(var key in levels) {
			if (levels[key] === max) return key;
		}
		return 'Error';
	};

	UserCalendar.prototype.getPopover = function(period, periodend, type) {

		var str = '';
		// console.log("Get popover for period ", period.format('lll'), periodend.format('lll'));
		var res = this.checkPeriod(period, periodend);
		if (res === null) return 'Ingen hendelser';

		for(var i = 0; i < res.length; i++) {
			str += '<p>' + res[i].getStr(type) + '</p>';
		}
		return str;

	};


	UserCalendar.prototype.getDayEvents = function(period) {
		var daystr = period.format('L');
		if(this.eventDayCache.hasOwnProperty(daystr)) {
			return this.eventDayCache[daystr];
		}
		var matches = [];

		for(var i = 0; i < this.events.length; i++) {
			if (this.events[i].overlapTimeslot(period, 'day')) {
				matches.push(this.events[i]);
			} 
		}

		this.eventDayCache[daystr] = matches;
		return matches;
	};

	UserCalendar.prototype.checkPeriod = function(period, periodend) {

		var matches = [];
		var dayevents = this.getDayEvents(period);
		for(var i = 0; i < dayevents.length; i++ ) {
			if (dayevents[i].overlap(period, periodend)) {
				matches.push(dayevents[i]);
			}
		}

		if (matches.length > 0) {
			return matches;	
		}
		

		if (--debug > 0) {
			console.log("Check period ", period.format('lll') );
			console.log("For this user ", this.user);
			console.log("With this calendar ", this.cal);
			console.log("MAtches ", matches);
		}
		return null;

	};


	return UserCalendar;
});