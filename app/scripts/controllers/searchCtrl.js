'use strict';

searchApp.controller('searchCtrl', function ($scope, $location, loginService, searchResultsService, savedSearchService, channelSelectionService, messageService) {
  
  $scope.savedSS = savedSearchService;
  $scope.searchRS = searchResultsService;
  $scope.channelSS = channelSelectionService;
  $scope.channels = channelSelectionService.channels;

    $scope.validate = function() {
        if ($scope.myForm.$invalid) {
            messageService.addWarning('Please fix form errors before submitting query', {timeout: 5000})();
            return false;
        }
        return true;
    };
    
    $scope.submit = function () {
        $location.path('/results');
    };

    $scope.reset = function () {
        savedSearchService.reset();
        channelSelectionService.reset();
        angular.forEach($scope.myForm, function (value, key) {
            if (typeof value === 'object' && value.hasOwnProperty('$modelValue') && value.$dirty) {
                value.$setValidity('editable', true); // typeahread editable error manual fix
            }
        });
        $scope.myForm.$setPristine();
    };
    
    loginService.openLandingPage();

});
