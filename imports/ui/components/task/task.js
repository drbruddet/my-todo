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
		Meteor.call('tasks.setChecked', this._id, !this.checked, function(error, result) {
			if (result === false)
				Bert.alert( 'Good job, task done!', 'default', 'growl-top-right' );
		});
	},

 	'click .delete'() {
		Meteor.call('tasks.remove', this._id, function(error, result) {
			if (error) {
				Bert.alert( 'An error occured: ' + error + '! Only the creator of the task can delete it.', 'danger', 'growl-top-right' );
			} else {
				Bert.alert( 'Task removed successfully!', 'success', 'growl-top-right' );
			}
		});
	},

	'click .toggle-private'() {
		Meteor.call('tasks.setPrivate', this._id, !this.private, function(error, result) {
			if (error)
				Bert.alert( 'An error occured: ' + error + '! Only the creator of list can set it', 'danger', 'growl-top-right' );
		});
	},

	'click #edit'() {
		return Session.set("target" + this._id, true);
	},

	'keydown input'(event) {
		// Enter key -> Validate the content
		if (event.keyCode === 13) {
			Meteor.call('tasks.validateInput', this._id, event.currentTarget.value, function(error, result) {
				if (error) {
					Bert.alert( 'An error occured: ' + error + '! Only the creator of list can update it', 'danger', 'growl-top-right' );
				} else {
					Bert.alert( 'Task updated successfully!', 'success', 'growl-top-right' );
				}
			});
			return Session.set("target" + this._id, false);
		}
		// Escape key -> Ignore the Changes
		if (event.keyCode === 27) {
			return Session.set("target" + this._id, false);
		}
	},

});
