import { Template } from 'meteor/templating';
import { Lists } from '/imports/api/lists.js';
import { Tasks } from '/imports/api/tasks.js';

import './list.jade';

Template.list.helpers({
 	isOwner() {
		return this.owner === Meteor.userId();
 	},

 	incompleteCount(listId) {
		return Tasks.find({ listId: listId, checked: { $ne: true } }).count();
	},

	activeItem() {
		return (this._id === Session.get('active')) ? true : false;
	}

});

Template.list.events({
 	'click .delete'() {
 		Meteor.call('lists.remove', this._id, function(error, result) {
			if (error) {
				Bert.alert( 'An error occured: ' + error + '! Only the creator of the list can delete it.', 'danger', 'growl-top-right' );
			} else {
				Bert.alert( 'List removed successfully!', 'success', 'growl-top-right' );
			}
		});
	},

	'click .list-selected' (event) {
		event.preventDefault();

		var list = $(event.currentTarget).attr('list-id');
		Session.set('listId', list);
		Session.set('active', list);
	},

	'click .toggle-private'() {
		Meteor.call('lists.setPrivate', this._id, !this.private, function(error, result) {
			if (error)
				Bert.alert( 'An error occured: ' + error + '! Only the creator of the list can do this action.', 'danger', 'growl-top-right' );
		});
	},

});
