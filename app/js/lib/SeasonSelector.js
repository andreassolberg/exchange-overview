define(function(require, exports, module) {


	var moment = require('moment');
	require('momentl');

	var SeasonSelector = function(container) {
		var that = this;

		this.max = 2;
		this.index = 1;

		this.container = container;

		this.periodCache = {};

		this.callback = null;

		this.datebox = this.container.find(".datebox").eq(0);
		this.thisWeek = moment().startOf('week');		
		this.display();

		this.datebox.on('click', '.pick1', function(e) {
			e.preventDefault();
			var ct = $(e.currentTarget);
			var cc = $(e.currentTarget).parent("#seasonpicker");
			cc.children().removeClass("active");
			ct.addClass("active");

			that.index = 0;
			that.display();
			that.emit();
		});
		this.datebox.on('click', '.pick2', function(e) {
			e.preventDefault();
			var ct = $(e.currentTarget);
			var cc = $(e.currentTarget).parent("#seasonpicker");
			cc.children().removeClass("active");
			ct.addClass("active");

			that.index = 1;
			that.display();
			that.emit();
		});
		this.datebox.on('click', '.pick3', function(e) {
			e.preventDefault();
			var ct = $(e.currentTarget);
			var cc = $(e.currentTarget).parent("#seasonpicker");
			cc.children().removeClass("active");
			ct.addClass("active");
			
			that.index = 2;
			that.display();
			that.emit();
		});

	};

	SeasonSelector.prototype.getIndex = function() {
		return this.index;
	};
	SeasonSelector.prototype.on = function(callback) {
		this.callback = callback;
	};
	SeasonSelector.prototype.emit = function() {
		if (typeof this.callback === 'function') {
			this.callback();
		}
	};

	SeasonSelector.prototype.getDayTitle = function(day) {
		var p = this.getPeriod(day, 0);
		return 'uke ' + p.format('w') + '<br />' + p.format('D. MMM');
	};

	SeasonSelector.prototype.getPeriod = function(week, day) {


		if (this.periodCache.hasOwnProperty(this.index)) {

			if (this.periodCache[this.index].hasOwnProperty(week)) {
				if (this.periodCache[this.index][week].hasOwnProperty(day)) {
					return this.periodCache[this.index][week][day];
				}
			} else {
				this.periodCache[this.index][week] = {};			
			}


		} else {
			this.periodCache[this.index] = {};
			this.periodCache[this.index][week] = {};
		}


		var x = moment().startOf('year')
			.startOf('week')
			.add(this.index*16, 'weeks')
			.add(week, 'weeks')
			.add(day, 'days');
		// console.log("Period index " + this.index + " week " + week + " day " + day, x);

		this.periodCache[this.index][week][day] = x;
		return x;

		
	};

	SeasonSelector.prototype.display = function() {
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
		this.container.find(".weeknow").eq(0).empty().append(
			'<div class="week">Uke ' + p.format('W') + '</div>'
			// '<div class="days">' + p.format('dddd LL') + ' til ' + 
			// 	p.add(4, 'days').format('dddd LL') + '</div>'
			);
	};

	return SeasonSelector;

});