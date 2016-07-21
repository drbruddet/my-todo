import { Template } from 'meteor/templating';
import { Lists } from '/imports/api/lists.js';

import './list.jade';

Template.list.helpers({
 	isOwner() {
		return this.owner === Meteor.userId();
 	},
});

Template.list.events({

 	'click .delete'() {
		Meteor.call('lists.remove', this._id);
	},

	'click .toggle-private'() {
		Meteor.call('lists.setPrivate', this._id, !this.private);
	},

});
