
'use strict';

searchApp.controller('collaborationGroupCtrl', function ($scope, $location, $cookieStore, $route, $http, $timeout, $filter, footerService, communicationService, loginService) {

    $scope.groupInfo;
    $scope.groupId;
    $scope.groupName;
    $scope.loading      = false;

    $scope.tableData;                                   //Field necessary to create the table
    $scope.discardedFields  = ['id'];                   //Fields that are not going to be included in the table
    $scope.rowAttributes    = '';                       //Parameters that will be used in the rowClick method
    $scope.checkboxList     = {};                       //Parameters that will be used in the rowClick method
    $scope.addCheckbox      = false;                    //Parameters that will be used in the rowClick method
    $scope.checkboxAttributes   = '';                   //Parameters that will be used in the rowClick method
    $scope.rowIdentifier    = 'id';                                //Parameters that will be used in the rowClick method
    $scope.specialFields  = [];
    $scope.sortableFields = [];

    //Pagination variables. Required for the pagination plugin (angular-ui)
    $scope.itemsPerPage     = 50;
    $scope.maxSize          = 4;
    $scope.currentPage      = 1;
    $cookieStore.put('searchApp_ssCurrentPage',$scope.currentPage);
    //End - Pagination variables


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


    //TABLE METHODS
    var resetTableData  = function(){
        //To reload the table
        $scope.tableData        = undefined;
        $scope.btnDisabled      = true;
        $scope.checkboxList     = {};
        $scope.getMembers();
        //End of table reload
    };
    //END - TABLE METHODS

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function() {
        $cookieStore.put('searchApp_ssCurrentPage', $scope.currentPage);
        resetTableData();
    };

    $scope.pageChanged = function() {
        $cookieStore.put('searchApp_ssCurrentPage', $scope.currentPage);
        resetTableData();
    };
    //END - PAGINATION METHODS


    $scope.getInfo   = function(){
        communicationService.getCollaborationGroupInfo.get().$promise
            .then(function(results){
                console.log(results);
                $scope.groupInfo    = results;
                $scope.groupId      = results["id"];
                $scope.groupName    = results["name"];

                //Date formatting
                if(results.timestamp){
                    //$scope.groupInfo.timestamp  = $filter('date')(new Date(results.timestamp.replace(" ","T") + "Z"), 'yyyy-MM-dd HH:mm');
                    var a   = results.timestamp.split(" ");
                    var d   = a[0].split("-");
                    var t   = a[1].split(":");
                    var formattedDate = new Date(d[0],(d[1]-1),d[2],t[0],t[1]);
                    $scope.groupInfo.timestamp   = $filter('date')(formattedDate, 'yyyy-MM-dd HH:mm');
                }

                //Delete id and name to avoid show that info in the information section of the page
                delete $scope.groupInfo["id"];
                delete $scope.groupInfo["name"];
                $scope.getMembers();    //After loading the info, get the members. Required this way because the id is necessary to get the members info
            }, function(errResponse){
                $scope.showEventInfo('Error getting group info. Error status: '+errResponse.status, false);
                loginService.setAuth(false);
            });
    };


    $scope.getMembers   = function () {
        communicationService.getCollaborationGroupMembers.get({id:$scope.groupId, page:$scope.currentPage, resultsPerPage:$scope.itemsPerPage}).$promise    //Using the search criteria to do a post using the getResultsWithAPI method
            .then(function(results) {
                $scope.tableData = results["members"];
            }, function(errResponse) {
                $scope.showEventInfo('Error getting group members. Error status: '+errResponse.status, false);
                loginService.setAuth(false);
            });
    };

    $scope.getInfo();

});

