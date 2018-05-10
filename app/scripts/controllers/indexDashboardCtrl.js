'use strict';

searchApp.controller('indexDashboardCtrl', function ($scope, $filter, $cookieStore, $location, $timeout, communicationService, loginService) {

    $scope.startDate    = '';
    $scope.endDate      = '';
    $scope.dashboardData   = {};
    $scope.parentDetail     = {};
    $scope.header     = '';

    $scope.selectedOption1;
    $scope.selectedOption2;
    $scope.selectedOption3;

    $scope.hasLessDetails   = false;
    $scope.hasMoreDetails   = true;

    $scope.loadingChart1    = false;
    $scope.loadingChart2    = false;
    $scope.loadingChart3    = false;
    $scope.loadingMessage   = 'Loading...';


    /********************************/
    /* ERROR AND SUCCESS MANAGEMENT */
    /********************************/
    //$timeout service required
    $scope.eventFound       = false;        //When true, an error is displayed in the UI
    $scope.eventMessage     = '';           //The message that will be displayed in the UI when the error section is displayed
    $scope.eventIsSuccess   = true;         //If true then the event is a success event. If false is an error event

    //Method used to show a message
    // @param eventMessage  The message to be displayed
    // @param isSuccess     If true the event is a success event, otherwise is an error event
    $scope.showEventInfo    = function (eventMessage, isSuccess) {
        $scope.eventMessage     = eventMessage;
        $scope.eventIsSuccess   = isSuccess;
        $scope.eventFound       = true;
//        $timeout(function(){
//            $scope.eventFound   = false
//        }, 3000);
    };
    /* END - ERROR AND SUCCESS MANAGEMENT */

    $scope.filter   = function(){
//        $scope.parentDetail = null;
//        $scope.currentDetail = null;
        $scope.getInformation($scope.currentDetail);
    }

    $scope.moreDetails  = function(nspace){
        $scope.parentDetail = $scope.currentDetail;
        $scope.currentDetail = nspace;
        $scope.hasLessDetails = true;
        $scope.hasMoreDetails = !($scope.parentDetail != null && $scope.currentDetail != null);
        $scope.getInformation($scope.currentDetail);

    }

    $scope.lessDetails  = function(){
        $scope.currentDetail = $scope.parentDetail;
        $scope.parentDetail = null;
        $scope.hasLessDetails = !($scope.parentDetail == null && $scope.currentDetail == null);
        $scope.hasMoreDetails = true;
        $scope.getInformation($scope.currentDetail);
    }

    //Get all
    $scope.getInformation  = function(nspace){

        communicationService.getAllIndex.get({startDate:$scope.startDate, endDate:$scope.endDate, namespace:nspace}).$promise
            .then(function(results){
                console.log("Get All Index Success");
                console.log(results);
                if(results.data){
                    $scope.dashboardData = results;
                    for (var index = 0; index != $scope.dashboardData.data.length; index++){
                        var chartName = $scope.dashboardData.data[index].name.toUpperCase();
                        if (chartName.length != 3 && chartName != "ALL TENANTS") {
                            chartName = "Namespace: " + $scope.dashboardData.data[index].name;
                        }

                        $scope.dashboardData.data[index].titleName = chartName;
                    }

                }
            }, function(errResponse){
                $scope.showEventInfo('Error getting the chart info. Error status: '+errResponse.status, false);
                console.log(errResponse);
                console.log("GetAll failed !!!"); // pedro
                if(errResponse.status == 403){ // pedro
                    console.log("GetAll -> error 403"); // pedro
                    loginService.setAuth(false);
                    $location.url('/login');
                }
            });
    };

    $scope.getInformation($cookieStore.get("searchApp_currentDashboard"));
});

