define(function(require, exports, module) {


	var moment = require('moment');
	require('momentl');

	var GroupSelector = function() {
		var that = this;

		this.groups = null;
		this.selected = '_me';
		this.callback = null;

		this.selel = $("#groupselector");

		this.selel.on('click', '.group', function() {
			that.index += 1;
			var group = $(this).data('groupid');
			console.log("Selected group ", group);
			that.selected = group;
			that.updateDisplay();

			that.emit();
		});

	};

	GroupSelector.prototype.getSelected = function() {
		return this.selected;
	};
	GroupSelector.prototype.on = function(callback) {
		this.callback = callback;
	};
	GroupSelector.prototype.emit = function() {
		if (typeof this.callback === 'function') {
			this.callback();
		}
	};


	GroupSelector.prototype.display = function(groups) {

		this.groups = groups;
		var gs = $("#groupselector").empty();
		var icon;
		gs.append('<a class="list-group-item active group" data-groupid="_all"  href="#!/"><span class="fa fa-home"></span> Alle ansatte</a>');
		gs.append('<a class="list-group-item group" data-groupid="_me" href="#!/"><span class="fa fa-user"></span> Kun meg</a>');
		gs.append('<a class="list-group-item group" data-groupid="_res" href="#!/"><span style="color: #060" class="fa fa-building"></span> Møterom</a>');
		for(var key in this.groups) {
			icon = '<span class="fa fa-users"></span>';
			if (this.groups[key].member) {
				icon = '<span style="color: #900" class="fa fa-heart"></span>';
			}
			gs.append('<a class="list-group-item group" data-groupid="' + key + '" href="#!/group/' + key + '">' + icon + ' ' + this.groups[key].title + '</a>');
		}
		this.updateDisplay();

	};

	GroupSelector.prototype.updateDisplay = function() {
		var that = this;

		$("#groupselector a.group").each(function(i, item) {
			
			
			// console.log("comparing ", $(item),  $(item).data('groupid'), 'with ', that.selected);
			// console.log("Updating display for item ", li);
			if ($(item).data('groupid') === that.selected) {
				$(item).addClass('active');
			} else {
				$(item).removeClass('active');
			}
		});
	};

	return GroupSelector;

});