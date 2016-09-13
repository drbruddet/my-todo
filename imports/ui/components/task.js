import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Tasks } from '/imports/api/tasks.js';

import './task.jade';

Template.task.helpers({
 	isOwner() {
		return this.owner === Meteor.userId();
 	},
 	editing() {
 		return Session.get("target" + this._id);
 	},
 	dateFormate: function(time) {
		if ((moment().unix() - moment(time).unix()) < 3600) {
			return moment(time).fromNow();
		} else {
			return moment(time).format("DD-MM-YYYY HH:mm");
		}
	},
	priorityColor: function(priority) {
		switch(priority) {
			case 0:
				return "green";
				break;
			case 1:
				return "orange";
				break;
			case 2:
				return "red";
				break;
		}
		return "white";
	},
});

Template.task.events({
	'click .toggle-checked'() {
		Meteor.call('tasks.setChecked', this._id, !this.checked);
		Bert.alert( 'Good job, task done!', 'default', 'growl-top-right' );
	},

 	'click .delete'() {
		Meteor.call('tasks.remove', this._id);
		Bert.alert( 'Task removed successfully!', 'danger', 'growl-top-right' );
	},

	'click .toggle-private'() {
		Meteor.call('tasks.setPrivate', this._id, !this.private);
	},

	'click #edit'() {
		return Session.set("target" + this._id, true);
	},

	'keydown input'(event) {
		// Enter key -> Validate the content
		if (event.keyCode === 13) {
			Meteor.call('tasks.validateInput', this._id, event.currentTarget.value);
			Bert.alert( 'Task updated successfully!', 'warning', 'growl-top-right' );
			return Session.set("target" + this._id, false);

		}
		// Escape key -> Ignore the Changes
		if (event.keyCode === 27) {
			Bert.alert( 'Task updated successfully!', 'warning', 'growl-top-right' );
			return Session.set("target" + this._id, false);
		}
	},

});
