import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Tasks = new Mongo.Collection('tasks');

// Schema of the task
// Text / lowerText (copy of the text in lower caractere to be able to sort by Alpha)
// Priority (Set a degre of priority to the task) / Private (public, Private task) / CreatedAt
//Owner / username / ListId (which list the task is from) / checked (if the task is done)
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
	listId: {
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

	// Insert a new task taking some parameters from the form + associate list
	'tasks.insert'(text, privacy, priority, listId) {
		check(text, String);
		check(priority, Number);
		check(privacy, Boolean);

		// copy of the text to be able to sort it by Alpha
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
			listId: listId,
			owner: this.userId,
			username: Meteor.users.findOne(this.userId).username,
			checked: false,
		});
	},

	// Delete a task with taskId
	'tasks.remove'(taskId) {
		check(taskId, String);

		const task = Tasks.findOne(taskId);
		if (task.private && task.owner !== this.userId) {
			throw new Meteor.Error('not-authorized');
		}
		if (!this.isSimulation) {
			Tasks.remove(taskId);
		}
	},

	// Set the fild checked when the task is done
	'tasks.setChecked'(taskId, setChecked) {
		check(taskId, String);
		check(setChecked, Boolean);

		const task = Tasks.findOne(taskId);
		if (task.private && task.owner !== this.userId) {
			throw new Meteor.Error('not-authorized');
		}
		var isAlreadySelected = Tasks.findOne(taskId, {fields: {'checked':true}});
		Tasks.update(taskId, { $set: { checked: setChecked} });
		return isAlreadySelected.checked;
	},

	// Set privacy to the task (public / private)
	'tasks.setPrivate'(taskId, setToPrivate) {
		check(taskId, String);
		check(setToPrivate, Boolean);

		const task = Tasks.findOne(taskId);

		if (task.owner !== this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		Tasks.update(taskId, { $set: { private: setToPrivate } });
	},

	// validate input of an editing task
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
