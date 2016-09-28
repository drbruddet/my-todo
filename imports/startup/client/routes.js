import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import '/imports/ui/layouts/body.js';

FlowRouter.route('/', {
	name: 'Home',
	action: function() {
		BlazeLayout.render("body", {header:"navbar", content: "todo"});
	},
});

FlowRouter.route('/list/:listId', {
	name: 'List',
	action: function(params, queryParams) {
		BlazeLayout.render("body", {header:"navbar", content: "todo"});
	},
});

FlowRouter.notFound = {
	action: function() {
		BlazeLayout.render("body", {header:"navbar", content: "404"});
	},
}
