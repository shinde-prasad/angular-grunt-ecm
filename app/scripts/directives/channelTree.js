'use strict';

searchApp.directive('channelTree', function (channelSelectionService, modelDomainService) {
    return {
        restrict: 'AE',
        replace: 'true',
        templateUrl: 'views/directives/channelTree.html',
        scope: {
            active: '@chtActive'
        },
        link: function($scope, element, attrs) {
            $scope.modelDS =modelDomainService;
            if (!$scope.active) {
                $scope.active = 'global';
            }
            $scope.channelHierarchy = channelSelectionService.channelHierarchy;            
        }

    };
});

