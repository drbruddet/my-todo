import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// A prioris, sans les imports Lists et Taches c'est bon
//import { Lists } from '/imports/api/lists.js';
//import { Tasks } from '/imports/api/tasks.js';

import '../components/layout/navbar.js';
import '../components/task/taskComponent.js';
import '../components/list/listComponent.js';

import './body.styl';
import './body.jade';

Template.body.onCreated(function bodyOnCreated() {
 	Meteor.subscribe('lists');
	Meteor.subscribe('tasks');
});
