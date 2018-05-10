'use strict';

searchApp.directive('addContentSourceModal', function($compile) {
    return {
        restrict:       'AE',
        replace:        'true',
        templateUrl:    'views/directives/addContentSourceModal.html'
    };
});
