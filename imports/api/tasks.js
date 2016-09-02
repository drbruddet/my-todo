import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Tasks = new Mongo.Collection('tasks');

TasksSchema = new SimpleSchema({
	text: {
		type: String,
		label: "Task Name",
		max: 1000,
	},
	lowerText: {
		type: String,
		label: "Task Name in Loawer Case",
		max: 1000,
	},
	priority: {
		type: Number,
		label: "Task priority",
		allowedValues: [0, 1, 2],
	},
	private: {
		type: Boolean,
		label: "Task privacy",
	},
	createdAt: {
		type: Date,
		label: "Date task added to the list",
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
	},
	checked: {
		type: Boolean,
	}
});
Tasks.attachSchema(TasksSchema);

if (Meteor.isServer) {
	Meteor.publish('tasks', function tasksPublication() {
		return Tasks.find({
			$or: [
				{private: { $ne: true}},
				{owner: this.userId},
			],
		});
	});
}

Meteor.methods({

	'tasks.insert'(text, privacy, priority) {
		check(text, String);
		check(priority, Number);
		check(privacy, Boolean);

		const lowerText = text.toLowerCase();

		if  (! this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		Tasks.insert({
			text,
			lowerText,
			private: privacy,
			priority,
			createdAt: new Date(),
			owner: this.userId,
			username: Meteor.users.findOne(this.userId).username,
			checked: false,
		});
	},

	'tasks.remove'(taskId) {
		check(taskId, String);

		const task = Tasks.findOne(taskId);
		if (task.private && task.owner !== this.userId) {
			throw new Meteor.Error('not-authorized');
		}
		Tasks.remove(taskId);
	},

	'tasks.setChecked'(taskId, setChecked) {
		check(taskId, String);
		check(setChecked, Boolean);

		const task = Tasks.findOne(taskId);
		if (task.private && task.owner !== this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		Tasks.update(taskId, { $set: { checked: setChecked} });
	},

	'tasks.setPrivate'(taskId, setToPrivate) {
		check(taskId, String);
		check(setToPrivate, Boolean);

		const task = Tasks.findOne(taskId);

		if (task.owner !== this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		Tasks.update(taskId, { $set: { private: setToPrivate } });
	},

	'tasks.validateInput'(taskId, key) {
		check(taskId, String);
		check(key, String);
		const task = Tasks.findOne(taskId);

		if (task.owner !== this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		Tasks.update(taskId, { $set: { text: key } });
	},

});
