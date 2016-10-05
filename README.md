# my-todo
TODO with Meteor

Taken from the Meteor Todo App tutorial and add packages:
- Semantic UI
- Stylus
- Jade
- Moment.js
- PostCSS
- Flow Router
- Blaze Layout
- Collection-Helpers
- Collection2
- Bert (handle errors and displays alerts)

Add some new features:

- Lists (each lists own many tasks) 
     Only logged user can create a list
     The lists are created private and only owner can delete/ edit name / set private or public
     Only the owner can see the list if it's set private

- Edit mode:
     Can edit task name and list name (if user own the list/task)
     
- Set in form Priority status to the list (Low / normal / High)
- Set in form if the task should be private or public

- The tasks can be sorted by:
     Private/Public first
     Priority (High -> Low)
     Alphabetical
     Most recent or older ones
     
- Semantic UI components to make it nicer and responsive

- Manage router with list ids params and 404 pages

- Events with Bert to make appear a modal when actions are past or errors are throw



     
