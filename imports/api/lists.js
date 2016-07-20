import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

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
