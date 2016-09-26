import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { Tasks } from '/imports/api/tasks.js';

export const Lists = new Mongo.Collection('lists');

// Schema of the list:
// Text(name) / CreatedAt / Private(public:private) / Owner / username(owner name)
ListsSchema = new SimpleSchema({
	text: {
		type: String,
		label: "ListName",
		max: 1000,
	},
	createdAt: {
		type: Date,
		label: "Date list added to the application",
		autoValue: function() {
			if (this.isInsert) {
				return new Date;
			}
		},
	},
	private: {
		type: Boolean,
		label: "List privacy",
	},
	owner: {
		type: String,
	},
	username: {
		type: String,
		optional: true
	}
});
Lists.attachSchema(ListsSchema);


if (Meteor.isServer) {
	Meteor.publish('lists', function listsPublication() {
		return Lists.find({
			$or: [
				{private: { $ne: true}},
				{owner: this.userId},
			],
		});
	});
}

Meteor.methods({

	// Insert a new List with a name field
	'lists.insert'(text) {
		check(text, String);

		if  (! this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		// Return because we need to know the ID of the list when we call the insert function
		return Lists.insert({
			text,
			createdAt: new Date(),
			private: false,
			owner: this.userId,
			username: Meteor.users.findOne(this.userId).username,
		});
	},

	// Delete a list by ListID with all its tasks
	'lists.remove'(listId) {
		check(listId, String);

		const list = Lists.findOne(listId);
		if (list.private && list.owner !== this.userId) {
			throw new Meteor.Error('not-authorized');
		}
		if (!this.isSimulation) { // Handle the Blaze exception Uncaught Error: Must be attached
        		Tasks.remove({"listId": listId});
			Lists.remove(listId);
    		}
	},

	// Set privacy of the list (Public / Private)
	'lists.setPrivate'(listId, setToPrivate) {
		check(listId, String);
		check(setToPrivate, Boolean);

		const list = Lists.findOne(listId);

		if (list.owner !== this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		Lists.update(listId, { $set: { private: setToPrivate } });
	},

	// Validate the field when editing the name
	'lists.validateInput'(listId, key) {
		check(listId, String);
		check(key, String);
		const list = Lists.findOne(listId);

		if (list.owner !== this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		Lists.update(listId, { $set: { text: key } });
	},

});
