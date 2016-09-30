import { Meteor } 		from 'meteor/meteor';
import { Template } 	from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Tasks } 		from '/imports/api/tasks/tasks.js';

import '../list/listComponent.js';
import './task.js';

import './taskComponent.styl';
import './taskComponent.jade';

Template.taskComponent.onCreated(function taskComponentOnCreated() {
	 // Create a reactiveDict to get the task completed
	 // Give the name "hideCompletedTasks" to save it when hot code push.
 	this.state = new ReactiveDict('hideCompletedTasks');
	Session.setDefault("sort_order", {createdAt: -1 }); // Set the task sorting from newer to older task
	Meteor.subscribe('tasks');
});

// Initialize SemanticUI features (Dropdown, Accordeons ...)
Template.privacyDropdown.onRendered(function() {
	this.$('.ui.dropdown').dropdown();
});

Template.priorityDropdown.onRendered(function() {
	this.$('.ui.dropdown').dropdown();
});

Template.sortingDropdown.onRendered(function() {
	this.$('.ui.dropdown').dropdown();
});
// SemanticUI END

Template.taskComponent.helpers({
	// Get the tasks completed only or not depending of the reactiveVar
	tasks() {
		const instance = Template.instance();

		if (instance.state.get('hideCompleted')) {
			return Tasks.find({
				listId: Session.get('listId'),
				checked: { $ne: true },
			}, { sort: Session.get("sort_order") });
		}
		return Tasks.find({
			listId: Session.get('listId')
		}, { sort: Session.get("sort_order")});
	},

	activeList() {
		return (this._id === Session.get('active')) ? false : true;
	},

});

Template.taskComponent.events({

	// Submit a new task
	'submit .new-task' (event) {
		event.preventDefault();

		let task = {
			text: 		event.target.text.value,
			lowerText: 	event.target.text.value.toLowerCase(),
			private: 	$('.ui.dropdown.privacy').dropdown("get text") === "Public" ? false : true,
			priority: 	Number($('.ui.dropdown.priority').dropdown("get value")),
			listId: 	Session.get('listId'),
		};

		if (task.listId) {
			Meteor.call('tasks.insert', task, (error) => {
				if (error)
					Bert.alert( error.reason, 'danger', 'growl-top-right' );
				else
					Bert.alert( 'Task inserted successfully!', 'success', 'growl-top-right' );
			});
		} else
			Bert.alert( 'You must select a list before create a task!', 'warning', 'growl-top-right' );

		event.target.text.value = '';
		$('.ui.dropdown.priority').dropdown('restore defaults');
		$('.ui.dropdown.privacy').dropdown('restore defaults');
	},

	// Hide completed tasks with the radio button
	'change .hide-completed input'(event, instance) {
		instance.state.set('hideCompleted', event.target.checked);
	},

	// Sorting button. Can sort in many way:
	// Alpha / newer / Older / Pending tasks / finished tasks / Public first / Private first / Priority (Urgent first)
	'click .sorting'(event) {
		event.preventDefault();

		const value = $('.ui.dropdown.sorting').dropdown("get value");

		switch(value) {
			case "Recent": 		return Session.set("sort_order", {createdAt: -1 });
			case "Older": 		return Session.set("sort_order", {createdAt: 0 });
			case "Alpha": 		return Session.set("sort_order", {lowerText : 0 });
			case "Pending": 	return Session.set("sort_order", {checked: 0 });
			case "Finished": 	return Session.set("sort_order", {checked: -1 });
			case "Public": 		return Session.set("sort_order", {private: 0 });
			case "Private": 	return Session.set("sort_order", {private: -1 });
			case "Priority": 	return Session.set("sort_order", {priority: -1 });
		};
	}
});
