import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Tasks } from '/imports/api/tasks.js';

import './task.jade';

Template.task.helpers({
	// Check if the user is the owner
 	isOwner() {
		return this.owner === Meteor.userId();
 	},
 	// Know if the list it's being editing
 	editing() {
 		return Session.get("target" + this._id);
 	},
 	// Formate the date field to get a more readable view (using moment.js)
 	dateFormate: function(time) {
		if ((moment().unix() - moment(time).unix()) < 3600) {
			return moment(time).fromNow();
		} else {
			return moment(time).format("DD-MM-YYYY HH:mm");
		}
	},
	// return the good color according to the priority
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

	// Click event for the checked task
	'click .toggle-checked'() {
		Meteor.call('tasks.setChecked', this._id, !this.checked, function(error, result) {
			if (result === false)
				Bert.alert( 'Good job, task done!', 'default', 'growl-top-right' );
		});
	},

	// Click to delete a task
 	'click .delete'() {
		Meteor.call('tasks.remove', this._id, function(error, result) {
			if (error) {
				Bert.alert( 'An error occured: ' + error + '! Only the creator of the task can delete it.', 'danger', 'growl-top-right' );
			} else {
				Bert.alert( 'Task removed successfully!', 'success', 'growl-top-right' );
			}
		});
	},

	// Click to set a task Private / Public
	'click .toggle-private'() {
		Meteor.call('tasks.setPrivate', this._id, !this.private, function(error, result) {
			if (error)
				Bert.alert( 'An error occured: ' + error + '! Only the creator of list can set it', 'danger', 'growl-top-right' );
		});
	},

	// Click to edit a task
	'click #edit'() {
		return Session.set("target" + this._id, true);
	},

	// Using keydown to validate / escape the edition mode
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
