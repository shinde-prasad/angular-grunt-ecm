'use strict';

searchApp.directive('errorMessage', function(messageService) {
    return {
        restrict:       'AE',
        replace:        'true',
        templateUrl:    'views/directives/errorMessage.html',
        scope: {
            messages: '=emMessages',
            groups: '@?emGroups',
            targetViews: '@?emTargetViews'
        }, link: function($scope, element, attrs) {
            $scope.brief = attrs.hasOwnProperty('emBrief');
            
            var filterOptions = {};
            if ($scope.groups) {
                filterOptions.groups = $scope.groups.split('|');
            }
            if ($scope.targetViews) {
                filterOptions.targetViews = $scope.targetViews.split('|');
            }
            
            $scope.filterMessages = function() {
                return messageService.getByOptions(filterOptions);
            };
            
            $scope.$watch(function() {
                return $scope.filterMessages().length;
            }, function(newValue, oldValue) { });
        }
    };
});