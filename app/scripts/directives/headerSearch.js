'use strict';

searchApp.directive('headerSearch', function (savedSearchService, $route) {
    return {
        restrict: 'AE',
        replace: 'true',
        templateUrl: 'views/directives/headerSearch.html',
        link: function (scope, element, attrs) {
            scope.savedSS = savedSearchService;
            scope.title = $route.current.tabtitle;
            
            scope.showSS = function() {
                return (savedSearchService.isActive() && $route.current.activetab === 'search');
            };
        }
    };
});
