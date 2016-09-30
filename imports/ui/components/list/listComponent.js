import { Meteor } 	from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Lists } 	from '/imports/api/lists/lists.js';

import './list.js';
import './listComponent.jade';
import './listComponent.styl';

Template.listComponent.onCreated(function listComponentOnCreated() {
 	Meteor.subscribe('lists');
});

Template.listComponent.helpers({
	// get the lists
	lists() {
		return Lists.find({}, { sort: { createdAt: -1 } });
	},

});

Template.listComponent.events({

	// Submit a new list by the form and select it automaticaly
	'submit .new-list' (event) {
		event.preventDefault();

		let list = {
			text: event.target.text.value,
		}

		// Callback to get the Id of the list just created
		Meteor.call('lists.insert', list, (error, listId) => {
			if (error)
				Bert.alert( error.reason, 'danger', 'growl-top-right' );
			else {
				Session.set('listId', listId);
				Session.set('active', listId);
				FlowRouter.go('/list/' + listId);
				Bert.alert( 'List inserted successfully!', 'success', 'growl-top-right' );
			}
		});
		event.target.text.value = '';
	},

});

