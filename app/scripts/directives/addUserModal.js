'use strict';

searchApp.directive('addUserModal', function($compile) {
    return {
        restrict:       'AE',
        replace:        'true',
        templateUrl:    'views/directives/addUserModal.html'
    }
});
