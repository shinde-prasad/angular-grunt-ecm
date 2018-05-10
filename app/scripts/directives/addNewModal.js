'use strict';

/*
 * ADD NEW MODAL
 * Description: modal that is displayed when the user click on the "New" button in some pages of this application
 *
 * This modal requires the following variable in the scope:
 *  addNewModalTitle:       the title
 *  addNewMessage:          the message in the modal
 *  newName:                the name of the item that will be saved
 *  newDescription:         the description of the item that will be saved
 */

searchApp.directive('addNewModal', function() {
    return {
        restrict:       'AE',
        replace:        'true',
        templateUrl:    'views/directives/addNewModal.html'
    };
});
