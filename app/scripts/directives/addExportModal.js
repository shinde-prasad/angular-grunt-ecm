'use strict';

searchApp.directive('addExportModal', function($compile) {
    return {
        restrict:       'AE',
        replace:        'true',
        templateUrl:    'views/directives/addExportModal.html'
    };
});