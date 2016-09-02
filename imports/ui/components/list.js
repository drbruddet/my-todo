import { Template } from 'meteor/templating';
import { Lists } from '/imports/api/lists.js';
import { Tasks } from '/imports/api/tasks.js';

import './list.jade';

Template.list.helpers({
 	isOwner() {
		return this.owner === Meteor.userId();
 	},

 	incompleteCount() {
		return Tasks.find({ checked: { $ne: true } }).count();
	},
});

Template.list.events({

 	'click .delete'() {
 		console.log(this._id);
		Meteor.call('lists.remove', this._id);
	},

	'click .toggle-private'() {
		Meteor.call('lists.setPrivate', this._id, !this.private);
	},

});
