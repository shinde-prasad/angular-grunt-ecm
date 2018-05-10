'use strict';

searchApp.directive('contextualHelp', function($compile) {
    return {
        restrict:       'AE',
        replace:        'false',
        templateUrl:    'views/directives/contextualHelp.html',        
        scope: {
            title: '=',
            contentPostponed: '=content'
        },
        link: function (scope, element, attrs) {
            scope.$on('load-help-content', function() {
                scope.content = scope.contentPostponed;
                console.log("Show");
            });  
        }        
    };
});
