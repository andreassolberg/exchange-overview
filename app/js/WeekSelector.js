define(function(require, exports, module) {


	var moment = require('moment');
	require('momentl');

	var WeekSelector = function() {
		var that = this;
		this.max = 7;
		this.index = 0;

		this.periodCache = {};

		this.callback = null;

		this.datebox = $("#datebox");
		this.thisWeek = moment().startOf('week');		
		this.display();

		this.datebox.on('click', '.nextWeek', function() {
			that.index += 1;
			that.display();
			that.emit();
		});
		this.datebox.on('click', '.prevWeek', function() {
			that.index -= 1;
			that.display();
			that.emit();
		});
		this.datebox.on('click', '.thisWeek', function() {
			that.index = 0;
			that.display();
			that.emit();
		});

	};

	WeekSelector.prototype.getIndex = function() {
		return this.index;
	};
	WeekSelector.prototype.on = function(callback) {
		this.callback = callback;
	};
	WeekSelector.prototype.emit = function() {
		if (typeof this.callback === 'function') {
			this.callback();
		}
	};

	WeekSelector.prototype.getDayTitle = function(day) {
		var p = this.getPeriod(day, 0);
		return p.format('dddd D. MMM');
	};

	WeekSelector.prototype.getPeriod = function(day, i) {


		if (this.periodCache.hasOwnProperty(this.index)) {

			if (this.periodCache[this.index].hasOwnProperty(day)) {
				if (this.periodCache[this.index][day].hasOwnProperty(i)) {
					return this.periodCache[this.index][day][i];
				}
			} else {
				this.periodCache[this.index][day] = {};			
			}


		} else {
			this.periodCache[this.index] = {};
			this.periodCache[this.index][day] = {};
		}

		var p = this.thisWeek.clone().add(this.index, 'weeks')
			.add(day, 'days').hour(8)
			.add(i*30, 'minutes');
		this.periodCache[this.index][day][i] = p;
		return p;
	};

	WeekSelector.prototype.display = function() {
		var p = this.thisWeek.clone().add(this.index, 'weeks');

		if (this.index <= 0) {
			$(".prevWeek").attr('disabled', 'disabled');
			$(".thisWeek").attr('disabled', 'disabled');
			$(".nextWeek").removeAttr('disabled');
		} else if (this.index < this.max) {
			$(".prevWeek").removeAttr('disabled');
			$(".thisWeek").removeAttr('disabled');
			$(".nextWeek").removeAttr('disabled');

		} else {
			$(".prevWeek").removeAttr('disabled');
			$(".thisWeek").removeAttr('disabled');
			$(".nextWeek").attr('disabled', 'disabled');


		}

		$("#weeknow").empty().append(
			'<div class="week">Uke ' + p.format('W') + '</div>'
			// '<div class="days">' + p.format('dddd LL') + ' til ' + 
			// 	p.add(4, 'days').format('dddd LL') + '</div>'
			);
	};

	return WeekSelector;

});