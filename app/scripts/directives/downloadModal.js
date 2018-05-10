'use strict';

/*
 * DOWNLOAD MODAL
 * Description: modal that is displayed when the user click on the "Download" button in some pages of this application
 *
 * This modal requires the following variables in the scope:
 *   deleteModalTitle:       the title
 *   deleteMessage:          the delete message
 *   namesToBeDeleted:       a string with the names that are going to be deleted. This usually uses the method prepareModal() that is executed when the user click on the "Delete" button
 */

searchApp.directive('downloadModal', function() {
    return {
        restrict:       'AE',
        //replace:        'true',
        templateUrl:    'views/directives/downloadModal.html',
        link: function(scope, element, attr) {
            scope.dismiss = function() {
                element.modal("show");
            };
        }
    };
});
