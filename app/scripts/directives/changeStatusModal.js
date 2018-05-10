'use strict';

/* Change status modal
 * */

searchApp.directive('changeStatusModal', function() {
    return {
        restrict:       'AE',
        replace:        'true',
        templateUrl:    'views/directives/changeStatusModal.html'
    }
});