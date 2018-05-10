
'use strict';

searchApp.controller('errorCtrl', function ($scope, $location, messageService) {
    
    $scope.tryAgain = function() {
        messageService.reset();
        if ($scope.failedRoute) {
            $location.url($scope.failedRoute.$$route.originalPath);            
        } else {
            $location.url("/");
        }
    };

});

