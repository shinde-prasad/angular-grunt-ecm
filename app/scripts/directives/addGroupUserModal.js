'use strict';

searchApp.directive('addGroupUserModal', function($compile) {
    return {
        restrict:       'AE',
        replace:        'true',
        templateUrl:    'views/directives/addGroupUserModal.html'
    };
});
