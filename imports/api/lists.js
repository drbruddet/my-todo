import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { Tasks } from '/imports/api/tasks.js';

export const Lists = new Mongo.Collection('lists');

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

	'lists.insert'(text) {
		check(text, String);

		if  (! this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		Lists.insert({
			text,
			createdAt: new Date(),
			owner: this.userId,
			username: Meteor.users.findOne(this.userId).username,
		});
	},

	'lists.remove'(listId) {
		check(listId, String);

		const list = Lists.findOne(listId);
		if (list.owner !== this.userId) {
			throw new Meteor.Error('not-authorized');
		}
		Tasks.remove({"listId": listId});
		Lists.remove(listId);
	},

	'lists.setPrivate'(listId, setToPrivate) {
		check(listId, String);
		check(setToPrivate, Boolean);

		const list = Lists.findOne(listId);

		if (list.owner !== this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		Lists.update(listId, { $set: { private: setToPrivate } });
	},

});
