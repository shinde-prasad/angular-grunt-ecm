'use strict';

/*
* DELETE MODAL
* Description: modal that is displayed when the user click on the "Delete" button in some pages of this application
*
* This modal requires the following variable in the scope:
*   deleteModalTitle:       the title
*   deleteMessage:          the delete message
*   namesToBeDeleted:       a string with the names that are going to be deleted. This usually uses the method prepareModal() that is executed when the user click on the "Delete" button
*/

searchApp.directive('deleteModal', function() {
    return {
        restrict:       'AE',
        replace:        'true',
        templateUrl:    'views/directives/deleteModal.html'
    }
});
