'use strict';

/* Change status modal
 * */

searchApp.directive('retentionModal', function() {
    return {
        restrict:       'AE',
        replace:        'true',
        templateUrl:    'views/directives/retentionModal.html'
    }
});