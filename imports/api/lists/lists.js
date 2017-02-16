import { Meteor } 	from 'meteor/meteor';
import { Mongo } 	from 'meteor/mongo';
import { check } 	from 'meteor/check';

import { Tasks } 	from '/imports/api/tasks/tasks.js';

export const Lists = new Mongo.Collection('lists');

if (Meteor.isServer) {

	Meteor.publish('lists', function listsPublication() {
		return Lists.find({
			$or: [
				{private: { $ne: true}},
				{owner: this.userId},
			],
		});
	});

Meteor.methods({

	// Insert a new List with a name field
	'lists.insert'(list) {
		check(list, {
			text: String,
		});

		try {
			if (! this.userId)
				throw new Meteor.Error('500', 'Must be logged in to add new lists.');
			return Lists.insert({
				text: 		list.text,
				private: 	true,
				createdAt: 	new Date(),
				owner: 		this.userId,
				username: 	Meteor.users.findOne(this.userId).username,
			});
		} catch (exception) {
			throw new Meteor.Error('500', exception.message);
		}
	},

	// Delete a list by ListID with all its tasks
	'lists.remove'(listId) {
		check(listId, String);

		try {
			const list = Lists.findOne(listId);
			if (list.private && list.owner !== this.userId)
				throw new Meteor.Error('500', 'Must own the list to delete.');
			if (!this.isSimulation) {
        		Tasks.remove({"listId": listId});
				Lists.remove(listId);
			}
		} catch (exception) {
			throw new Meteor.Error('500', exception.message);
		}
	},

	// Set privacy of the list (Public / Private)
	'lists.setPrivate'(setPrivate) {
		check(setPrivate, {
			listId: 		String,
			setToPrivate: 	Boolean,
		});

		try {
			const list = Lists.findOne(setPrivate.listId);
			if (list.private && list.owner !== this.userId)
				throw new Meteor.Error('500', 'Must own the list to set it Private.');
			Lists.update(setPrivate.listId, { $set: { private: setPrivate.setToPrivate } });
		} catch (exception) {
			throw new Meteor.Error('500', exception.message);
		}
	},

	// Validate the field when editing the name
	'lists.validateInput'(inputKey) {
		check(inputKey, {
			listId: String,
			key: 	String,
		})

		try {
			const list = Lists.findOne(inputKey.listId);
			if (list.owner !== this.userId)
				throw new Meteor.Error('500', 'Must be logged in to update the list name.');
			Lists.update(inputKey.listId, { $set: { text: inputKey.key } });
		} catch (exception) {
			throw new Meteor.Error('500', exception.message);
		}
	},

});
}

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
