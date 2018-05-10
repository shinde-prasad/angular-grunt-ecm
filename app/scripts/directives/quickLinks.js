'use strict';

searchApp.directive('quickLinks', function() {
    return {
        restrict:       'AE',
        replace:        'true',
        templateUrl:    'views/directives/quickLinks.html'
    }
});
