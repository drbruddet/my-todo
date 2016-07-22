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
});

Template.task.events({
	'click .toggle-checked'() {
		Meteor.call('tasks.setChecked', this._id, !this.checked);
	},

 	'click .delete'() {
		Meteor.call('tasks.remove', this._id);
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
			return Session.set("target" + this._id, false);
		}
		// Escape key -> Ignore the Changes
		if (event.keyCode === 27) {
			return Session.set("target" + this._id, false);
		}

	},

});
