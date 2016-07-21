import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Lists } from '/imports/api/lists.js';
import { Tasks } from '/imports/api/tasks.js';

import '../components/task.js';
import '../components/list.js';
import './body.css';
import './body.jade';

Template.body.onCreated(function bodyOnCreated() {
 	this.state = new ReactiveDict();
 	Meteor.subscribe('lists');
	Meteor.subscribe('tasks');
});

Template.body.helpers({
	// HELPER TASKS: Cache les taches complètées
	tasks() {
		const instance = Template.instance();

		if (instance.state.get('hideCompleted')) {
			return Tasks.find({ checked: { $ne: true } }, { sort: { createdAt: -1 } });
		}
		return Tasks.find({}, { sort: { createdAt: -1 } });
	},

	lists() {
		return Lists.find({}, { sort: { createdAt: -1 } });
	},

	// HELPER TASKS: Compte le nombre de taches
	incompleteCount() {
		return Tasks.find({ checked: { $ne: true } }).count();
	},

});

Template.body.events({
	'submit .new-task' (event) {
		event.preventDefault();

		const target = event.target;
		const text = target.text.value;

		Meteor.call('tasks.insert', text);
		target.text.value = '';
	},
	'submit .new-list' (event) {
		event.preventDefault();

		const target = event.target;
		const list = target.text.value;

		Meteor.call('lists.insert', list);
		target.text.value = '';
	},
	'change .hide-completed input'(event, instance) {
		instance.state.set('hideCompleted', event.target.checked);
	},
});
