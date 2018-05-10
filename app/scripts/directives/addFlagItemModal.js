'use strict';

searchApp.directive('addFlagItemModal', function($compile) {
    return {
        restrict:       'AE',
        replace:        'true',
        templateUrl:    'views/directives/addFlagItemModal.html'
    };
});