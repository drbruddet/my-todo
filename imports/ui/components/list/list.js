import { Template } from 'meteor/templating';
import { Lists } from '/imports/api/lists.js';
import { Tasks } from '/imports/api/tasks.js';

import './list.jade';

Template.list.helpers({
 	isOwner() {
		return this.owner === Meteor.userId();
 	},

 	 editing() {
 		return Session.get("targetlist" + this._id);
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

	'click .toggle-list-private'() {
		Meteor.call('lists.setPrivate', this._id, !this.private, function(error, result) {
			if (error)
				Bert.alert( 'An error occured: ' + error + '! Only the creator of list can set it', 'danger', 'growl-top-right' );
		});
	},

	'click #editlist'() {
		return Session.set("targetlist" + this._id, true);
	},

	'keydown input'(event) {
		// Enter key -> Validate the content
		if (event.keyCode === 13) {
			Meteor.call('lists.validateInput', this._id, event.currentTarget.value, function(error, result) {
				if (error) {
					Bert.alert( 'An error occured: ' + error + '! Only the creator of list can update it', 'danger', 'growl-top-right' );
				} else {
					Bert.alert( 'List updated successfully!', 'success', 'growl-top-right' );
				}
			});
			return Session.set("targetlist" + this._id, false);
		}
		// Escape key -> Ignore the Changes
		if (event.keyCode === 27) {
			return Session.set("targetlist" + this._id, false);
		}
	},

});
