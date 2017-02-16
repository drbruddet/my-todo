import { Meteor } 	from 'meteor/meteor';
import { Session } 	from 'meteor/session';
import { Mongo } 	from 'meteor/mongo';
import { check } 	from 'meteor/check';

export const Tasks = new Mongo.Collection('tasks');

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
	'tasks.insert'(task) {
		check(task, {
			text: 		String,
			priority: 	Number,
			private: 	Boolean,
			listId: 	String,
			lowerText: 	String, 
		});

		try {
			if (!this.userId)
				throw new Meteor.Error('500', 'Must be logged in to add new tasks.');
			
			Tasks.insert({
				text: 		task.text,
				lowerText: 	task.lowerText,
				priority: 	task.priority,
				private: 	task.private,
				listId: 	task.listId,
				createdAt: 	new Date(),
				owner: 		this.userId,
				username: 	Meteor.users.findOne(this.userId).username,
				checked: 	false,
			});
		} catch (exception) {
			throw new Meteor.Error('500', exception.message);
		}
	},

	// Delete a task with taskId
	'tasks.remove'(taskId) {
		check(taskId, String);

		try {
			const task = Tasks.findOne(taskId);
			if (task.private && task.owner !== this.userId)
				throw new Meteor.Error('500', 'Must own the task to delete.');
			if (!this.isSimulation) {
				Tasks.remove(taskId);
			}
		} catch (exception) {
			throw new Meteor.Error('500', exception.message);
		}
	},

	// Set the fild checked when the task is done
	'tasks.setChecked'(checked) {
		check(checked, {
			taskId: 	String,
			setChecked: Boolean,
		});	

		try {
			const task = Tasks.findOne(checked.taskId);
			if (task.private && task.owner !== this.userId)
				throw new Meteor.Error('500', 'Must own the task to do this action.');
			var isAlreadySelected = Tasks.findOne(checked.taskId, {fields: {'checked':true}});
			Tasks.update(checked.taskId, { $set: { checked: checked.setChecked} });
			return isAlreadySelected.checked;
		} catch (exception) {
			throw new Meteor.Error('500', exception.message);
		}
	},

	// Set privacy to the task (public / private)
	'tasks.setPrivate'(private) {
		check(private, {
			taskId: 		String,
			setToPrivate: 	Boolean,
		});

		try {
			const task = Tasks.findOne(private.taskId);
			if (task.owner !== this.userId)
				throw new Meteor.Error('500', 'Must own the task to do this action.');
			Tasks.update(private.taskId, { $set: { private: private.setToPrivate } });
		} catch (exception) {
			throw new Meteor.Error('500', exception.message);
		}
	},

	// validate input of an editing task
	'tasks.validateInput'(updateName) {
		check(updateName, {
			taskId: String,
			key: 	String,
		})

		try {
			const task = Tasks.findOne(updateName.taskId);
			if (task.owner !== this.userId)
				throw new Meteor.Error('500', 'Must own the task to do this action.');
			Tasks.update(updateName.taskId, { $set: { text: updateName.key } });
		} catch (exception) {
			throw new Meteor.Error('500', exception.message);
		}
	},

});

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