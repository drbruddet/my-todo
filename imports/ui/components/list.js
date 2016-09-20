import { Template } from 'meteor/templating';
import { Lists } from '/imports/api/lists.js';
import { Tasks } from '/imports/api/tasks.js';

import './list.jade';

Template.list.helpers({
 	isOwner() {
		return this.owner === Meteor.userId();
 	},

 	incompleteCount() {
		return Tasks.find({ listId: Session.get('listId'), checked: { $ne: true } }).count();
	},

	activeItem() {
		var actualItem = this._id;
		var clickedItem = Session.get('active');

		if (actualItem === clickedItem)
			return true;
		else
			return false;
	}

});

Template.list.events({
 	'click .delete'() {
		Meteor.call('lists.remove', this._id);
		Bert.alert( 'List removed successfully!', 'danger', 'growl-top-right' );
	},

	'click .list-selected' (event) {
		event.preventDefault();

		var list = $(event.currentTarget).attr('list-id');
		Session.set('listId', list);
		Session.set('active', list);
	},

	'click .toggle-private'() {
		Meteor.call('lists.setPrivate', this._id, !this.private);
	},

});
