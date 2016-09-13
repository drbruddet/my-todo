import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Lists } from '/imports/api/lists.js';
import { Tasks } from '/imports/api/tasks.js';

import '../components/navbar.js';
import '../components/task.js';
import '../components/list.js';
import './body.styl';
import './body.jade';

Template.body.onCreated(function bodyOnCreated() {
 	this.state = new ReactiveDict();
 	Meteor.subscribe('lists');
	Meteor.subscribe('tasks');
	Session.set("sort_order", {createdAt: -1 });
});

Template.body.onRendered(function() {
	this.$('.ui.dropdown').dropdown();
});

Template.body.helpers({
	// HELPER TASKS: Cache les taches complètées
	tasks() {
		const instance = Template.instance();

		if (instance.state.get('hideCompleted')) {
			return Tasks.find({
				listId: Session.get('listId'),
				checked: { $ne: true },
			}, { sort: Session.get("sort_order") });
		}
		return Tasks.find({listId: Session.get('listId')}, { sort: Session.get("sort_order")});
	},

	lists() {
		return Lists.find({}, { sort: { createdAt: -1 } });
	},

});

Template.body.events({

	// Submit a new task with the form button
	'submit .new-task' (event) {
		event.preventDefault();

		const target = event.target;
		const text = target.text.value;
		const privacy = $('.ui.dropdown.privacy').dropdown("get text") === "Public" ? false : true;
		const priority = Number($('.ui.dropdown.priority').dropdown("get value"));
		const listId = Session.get('listId');

		if (listId) {
			Meteor.call('tasks.insert', text, privacy, priority, listId);
			Bert.alert( 'Task inserted successfully!', 'success', 'growl-top-right' );
		} else {
			Bert.alert( 'You must select a list before create a task!', 'danger', 'growl-top-right' );
		}

		target.text.value = '';
		$('.ui.dropdown.priority').dropdown('restore defaults');
		$('.ui.dropdown.privacy').dropdown('restore defaults');
	},

	// Submit a new list in the list form
	'submit .new-list' (event) {
		event.preventDefault();

		const target = event.target;
		const list = target.text.value;

		// Callback to get the Id of the list just created
		Meteor.call('lists.insert', list, function(error, listId) {
			Session.set('listId', listId);
		});

		Bert.alert( 'List inserted successfully!', 'success', 'growl-top-right' );

		target.text.value = '';
	},

	// Hide completed tasks with the radio button in header
	'change .hide-completed input'(event, instance) {
		instance.state.set('hideCompleted', event.target.checked);
	},

	'click .sorting'(event) {
		event.preventDefault();

		const value = $('.ui.dropdown.sorting').dropdown("get value");

		switch(value) {
			case "Recent":
				Session.set("sort_order", {createdAt: -1 });
				break;
			case "Older":
				Session.set("sort_order", {createdAt: 0 });
				break;
			case "Alpha":
				Session.set("sort_order", {lowerText : 0 });
				break;
			case "Pending":
				Session.set("sort_order", {checked: 0 });
				break;
			case "Finished":
				Session.set("sort_order", {checked: -1 });
				break;
			case "Public":
				Session.set("sort_order", {private: 0 });
				break;
			case "Private":
				Session.set("sort_order", {private: -1 });
				break;
			case "Priority":
				Session.set("sort_order", {priority: -1 });
				break;
		}
	},
});
