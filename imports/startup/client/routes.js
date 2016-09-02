import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import '/imports/ui/layouts/body.js';

FlowRouter.route('/', {
	name: 'Home',
	action: function() {

	},
});
