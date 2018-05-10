'use strict';

searchApp.directive('updateQueryModal', function() {
    return {
        restrict:       'AE',
        replace:        'true',
        templateUrl:    'views/directives/updateQueryModal.html'
    };
});
