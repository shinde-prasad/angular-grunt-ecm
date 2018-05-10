'use strict';

angular.module('searchApp')
  .controller('mainPageCtrl', function ($scope, messageService, $route, savedSearchService, channelSelectionService, searchResultsService, communicationService, footerService, loginService, welcomeService) {
      
   $scope.messageService = messageService;
    
    $scope.$route   = $route; //Exposing route to get the active tab
    $scope.searchRS = searchResultsService;
    $scope.welcomeService = welcomeService;
    $scope.footerData = footerService;
    $scope.rowAttributes        = 'style="cursor: pointer;"';

    $scope.showCount    = true; //True if the count should broadcaste showed in the footer

    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    $scope.logout   = function() {
        loginService.logout();
        savedSearchService.reset();
        channelSelectionService.reset(); 
        $scope.$broadcast("applogout");
    };

    $scope.$on("countStatusChange", function (event, newShowCount) {
        $scope.showCount    = newShowCount;
    });

    $scope.changeUserFlag = function(flag){
      communicationService.filterGroup = flag;
    };
    

  });
