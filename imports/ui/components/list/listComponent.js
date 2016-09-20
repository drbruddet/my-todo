import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Lists } from '/imports/api/lists.js';

import './list.js';
import './listComponent.jade';
import './listComponent.styl';

Template.listComponent.helpers({

	lists() {
		return Lists.find({}, { sort: { createdAt: -1 } });
	},

});

Template.listComponent.events({

	// Submit a new list in the list form
	'submit .new-list' (event) {
		event.preventDefault();

		const target = event.target;
		const list = target.text.value;

		// Callback to get the Id of the list just created
		Meteor.call('lists.insert', list, function(error, listId) {
			Session.set('listId', listId);
			Session.set('active', listId);
		});
		Bert.alert( 'List inserted successfully!', 'success', 'growl-top-right' );

		target.text.value = '';
	},

});

