import { Template } from 'meteor/templating';
import { Lists } 	from '/imports/api/lists/lists.js';
import { Tasks } 	from '/imports/api/tasks/tasks.js';

import './list.jade';

Template.list.helpers({
	// Check if the user is the owner
 	isOwner() {
		return this.owner === Meteor.userId();
 	},
 	// Know if the list it's being editing
 	 editing() {
 		return Session.get("targetlist" + this._id);
 	},
 	// Count the number of incomplete tasks for each lists
 	incompleteCount(listId) {
		return Tasks.find({ listId: listId, checked: { $ne: true } }).count();
	},
	// Know which list is selected
	activeItem() {
		return (this._id === Session.get('active')) ? true : false;
	}

});

Template.list.events({

	// Call the Delete Method
 	'click .delete'() {
 		Meteor.call('lists.remove', this._id, (error) => {
			if (error) {
				Bert.alert( 'An error occured: ' + error + '! Only the creator of the list can delete it.', 'danger', 'growl-top-right' );
			} else {
				Bert.alert( 'List removed successfully!', 'success', 'growl-top-right' );
				FlowRouter.go('/');
			}
		});
	},

	// Set the selected List
	'click .list-selected' (event) {
		event.preventDefault();

		var list = $(event.currentTarget).attr('list-id');
		Session.set('listId', list);
		Session.set('active', list);
		FlowRouter.go('/list/'+ list);
	},

	// Set public / private icon
	'click .toggle-list-private'() {
		let setPrivate = {
			listId: 		this._id,
			setToPrivate: 	!this.private,
		}

		Meteor.call('lists.setPrivate', setPrivate, (error) => {
			if (error)
				Bert.alert( error.reason, 'danger', 'growl-top-right' );
		});
	},

	// Set the edition mode
	'click #editlist'() {
		return Session.set("targetlist" + this._id, true);
	},

	// Validate or escape the editing mode
	'keydown input'(event) {
		let inputKey = {
			listId: this._id,
			key: 	event.currentTarget.value,
		}

		// Enter key -> Validate the content
		if (event.keyCode === 13) {
			Meteor.call('lists.validateInput', inputKey, (error) => {
				if (error)
					Bert.alert( error.reason, 'danger', 'growl-top-right' );
				else
					Bert.alert( 'List updated successfully!', 'success', 'growl-top-right' );
			});
			return Session.set("targetlist" + this._id, false);
		}
		// Escape key -> Ignore the Changes
		else if (event.keyCode === 27) {
			return Session.set("targetlist" + this._id, false);
		}
	},

});
