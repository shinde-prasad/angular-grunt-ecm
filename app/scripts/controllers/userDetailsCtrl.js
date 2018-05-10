
'use strict';

searchApp.controller('userDetailsCtrl', function ($scope, $http, $cookieStore, $location, messageService, $timeout, $filter, communicationService, footerService, tableInteractionsService, channelSelectionService, Environment) {

    $scope.channelSS = channelSelectionService;
    
    $scope.filterGroupFlag = communicationService;
    //Table related fields. Check scripts/directives/tableGenerator.js for documentation
    $scope.tableData;
    $scope.discardedFields      = ['id', 'participantID', 'lastModifiedByID', 'ownerID', 'lastUpdate', 'identifiers'];

    $scope.rowAttributes        = '';
    $scope.checkboxList         = {};
    $scope.addCheckbox          = true;
    $scope.checkboxAttributes   = 'ng-change="checkboxChange()"';
    $scope.rowIdentifier        = 'id';
    $scope.specialFields        = ['timestamp'];
    $scope.sortableFields       = [];
    //End - Table related fields

    //Pagination variables. Required for the pagination plugin (angular-ui)
    $scope.itemsPerPage     = $cookieStore.get("pageSizeUserDetails") ? $cookieStore.get("pageSizeUserDetails") : 50;
    $scope.maxSize          = 4;
    $scope.currentPage      = 1;
    $scope.itemsPerPageOptions    = [10, 20, 30, 40, 50];
    //$cookieStore.put('searchApp_ssCurrentPage',$scope.currentPage);
    //End - Pagination variables

    //Delete modal variables. Check scripts/directives/deleteModal.js for documentation
    $scope.countDeletedItems = '';
    $scope.deleteModalTitle = 'Delete Content Sources';
    $scope.deleteMessage1 = 'WARNING: You are about to delete';
    $scope.deleteMessage2 = 'content sources!';
    $scope.namesToBeDeleted = '';
    $scope.returnVal = 'contentSourceName'; // name of th field which should be returned in getNamesToDelete method

    $scope.deleteDetailModalTitle = 'Delete user';
    $scope.deleteDetailMessage = 'user';
    $scope.deteteDetailName = '';
    //End - Delete modal variables

    //Enable or disable the delete button
    $scope.btnDisabled = true;

    //Page variables
    $scope.editMode = false;
    $scope.readMode = true;

    // Add new content source variables
    //$scope.contentSourceName = '';
    $scope.identifierName = '';


    /**********************/
    /* ELEMENTS SELECTION */
    /**********************/
    $scope.selectAllEnabled     = false;
    $scope.checkedElements      = {};
    $scope.uncheckedElements    = {};

    //When a checkbox status change, this method is triggered
    $scope.checkboxChange   = function(){
        if($scope.selectAllEnabled){
            $scope.uncheckedElements    = tableInteractionsService.getNewElements($scope.tableData, $scope.checkboxList, $scope.selectAllEnabled, 'id', $scope.uncheckedElements);
        }
        else{
            $scope.checkedElements      = tableInteractionsService.getNewElements($scope.tableData, $scope.checkboxList, $scope.selectAllEnabled, 'id', $scope.checkedElements);
        }
        getActionButtonStatus();
    };

    $scope.updatePageSize   = function() {
        $cookieStore.put("pageSizeUserDetails", $scope.itemsPerPage);
        $scope.getContentSources();

    };

    //Updates the checkboxes in the current page using the checked or unchecked element lists
    var updateCheckboxes = function () {
        if($scope.selectAllEnabled){
            $scope.checkboxList = tableInteractionsService.getCurrentPageList($scope.tableData, $scope.selectAllEnabled, 'id', $scope.uncheckedElements);
        }
        else{
            $scope.checkboxList = tableInteractionsService.getCurrentPageList($scope.tableData, $scope.selectAllEnabled, 'id', $scope.checkedElements);
        }
        getActionButtonStatus();
    };

    //When the user click on the select page button
    $scope.selectPage    = function () {
        $scope.checkboxList = tableInteractionsService.getElementsFromSelectPage($scope.tableData, $scope.checkboxList, 'id');
        $scope.checkboxChange();
    };

    //Clear the tracking lists (checked and unchecked elements)
    var clearTrackingLists  = function(){
        $scope.checkedElements      = {};
        $scope.uncheckedElements    = {};
        getActionButtonStatus();
    };

    //When the user click on the select all button
    $scope.selectAll    = function(){
        if($scope.selectAllEnabled){
            $scope.selectAllEnabled = false;
            clearTrackingLists();
            $scope.checkboxList = tableInteractionsService.getAllCheckedUnchecked($scope.tableData, $scope.checkboxList, 'id', false);
        }
        else{
            $scope.selectAllEnabled = true;
            clearTrackingLists();
            $scope.checkboxList = tableInteractionsService.getAllCheckedUnchecked($scope.tableData, $scope.checkboxList, 'id', true);
        }
    };

    //Sets the status of the btnDisabled variable. This will enable or disable the action buttons on the page
    var getActionButtonStatus   = function(){
        if($scope.selectAllEnabled){
            $scope.btnDisabled  = tableInteractionsService.getIsDisabled($scope.tableData, $scope.selectAllEnabled, $scope.uncheckedElements, footerService.getResultInfo().resultsCount, 'id');
        }
        else{
            $scope.btnDisabled  = tableInteractionsService.getIsDisabled($scope.tableData, $scope.selectAllEnabled, $scope.checkedElements, footerService.getResultInfo().resultsCount, 'id');
        }
    };

    // Modal preparation
    $scope.prepareModal = function(){
        $scope.getAllIdentifiers();
    };

    //Gets all the users
    $scope.getAllIdentifiers    = function(){
        communicationService.getContentSources.get({id:$cookieStore.get('searchApp_currentUser'), page:1, resultsPerPage:10000}).$promise //10000 is the limit?
            .then(function(results){
                if($scope.selectAllEnabled){
                    $scope.namesToBeDeleted = tableInteractionsService.getElementsSelected(results.identifiers, $scope.selectAllEnabled, $scope.uncheckedElements, 'id', ['identifierName', $scope.returnVal]);
                    $scope.countDeletedItems= tableInteractionsService.getCountElementsSelected(results.identifiers, $scope.selectAllEnabled, $scope.uncheckedElements, 'id');
                }
                else{
                    $scope.namesToBeDeleted = tableInteractionsService.getElementsSelected(results.identifiers, $scope.selectAllEnabled, $scope.checkedElements, 'id', ['identifierName', $scope.returnVal]);
                    $scope.countDeletedItems= tableInteractionsService.getCountElementsSelected(results.identifiers, $scope.selectAllEnabled, $scope.checkedElements, 'id');
                }
            }, function(errResponse){
                messageService.addError('Error getting all content sources identifiers.')(errResponse);
            });
    };
    /****************************/
    /* END - ELEMENTS SELECTION */
    /****************************/


    //TABLE RELATED METHODS//
    var resetTableData  = function(){
        //To reload the table
        $scope.tableData        = undefined;
        $scope.btnDisabled      = true;
        $scope.checkboxList     = {};
        $scope.getContentSources();
        if (communicationService.filterGroup == 0){
          $scope.getParticipantGroupHistory($cookieStore.get('searchApp_currentUser'),-1);
        }
        else{
          $scope.getParticipantGroupHistory($cookieStore.get('searchApp_currentUser'),$cookieStore.get('searchApp_currentGroup'));
        }

        $scope.newName          = '';
        $scope.newDescription   = '';
    };

    // Checks or unchecks all checkboxes
    $scope.checkUncheckAll  = function(isCheckAll){
        var idsList = tableInteractionsService.getAllIdsInTableData($scope.tableData);
        for(var i = 0; i < idsList.length; i++){
            if(isCheckAll){
                $scope.checkboxList[idsList[i]] = true;
            }
            else{
                $scope.checkboxList[idsList[i]] = false;
            }
        }
    };


    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function() {
        $cookieStore.put('searchApp_ssCurrentPage', $scope.currentPage);
        resetTableData();
        //$route.reload();
    };

    //INFO SECTION METHODS
    var removeUnnecessaryInfoFields = function(){
        delete $scope.userInfo["id"];
        delete $scope.userInfo["lastModifiedBy"];
        delete $scope.userInfo["lastModifiedByID"];
        delete $scope.userInfo["ownerID"];
        delete $scope.userInfo["owner"];
        delete $scope.userInfo["lastUpdate"];
        delete $scope.userInfo["identifiers"];
    };
    //END - INFO SECTION METHODS

    // API REQUEST METHODS//
    // Get the user information
    $scope.getUserInfo = function(){
        communicationService.getUserInfo.get({id:$cookieStore.get('searchApp_currentUser')}).$promise
            .then(function(results){
                $scope.userFirsName = results["firstName"];  //Extracting the name to set the page title
                $scope.userFirsName = results["lastName"];
                $scope.deleteDetailName = results["fistName"]; //Value for name of delete item
                $scope.userInfo = results;

                //Date formatting
                if(results.timestamp){
                    var a   = results.timestamp.split(" ");
                    var d   = a[0].split("-");
                    var t   = a[1].split(":");
                    var formattedDate = new Date(d[0],(d[1]-1),d[2],t[0],t[1]);
                    $scope.userInfo.timestamp   = $filter('date')(formattedDate, 'yyyy-MM-dd HH:mm');
                }
                removeUnnecessaryInfoFields();
                //Get the sources of the user to populate the table
                $scope.getContentSources();
                //Get the history group information to populate the table
                if(communicationService.filterGroup == 0){
                  $scope.getParticipantGroupHistory($cookieStore.get('searchApp_currentUser'),-1);
                }
                else{
                  $scope.getParticipantGroupHistory($cookieStore.get('searchApp_currentUser'),$cookieStore.get('searchApp_currentGroup'));
                }
            }, function(errResponse){
                messageService.addError('Error getting custodian info.')(errResponse);
            });
    };


    // Get content sources (identifiers)
    $scope.getContentSources = function(){
        communicationService.getContentSources.get({id:$cookieStore.get('searchApp_currentUser'), page:$scope.currentPage, resultsPerPage:$scope.itemsPerPage}).$promise
            .then(function(results){
                $scope.tableData    = results.identifiers;
                footerService.setResultInfo($scope.currentPage, $scope.itemsPerPage, results.count);
                updateCheckboxes();
            }, function(errResponse){
                messageService.addError('Error getting content sources from custodian.')(errResponse);
            });
    };

  $scope.isEmpty = function(obj){
    return !(typeof obj === "undefined" || Object.keys(obj).length === 0);
  };


    //Get User Group History
    $scope.getParticipantGroupHistory = function(user,group){
      communicationService.getParticipantGroupHistory.get({userId:user,groupId:group}).$promise
        .then(function(results){
          $scope.participantGroupHistory = results.history;
        }, function(errResponse){
            messageService.addError('Error getting participand group history.')(errResponse);            
        });
    };

    if(communicationService.filterGroup === 0){
      $scope.getParticipantGroupHistory($cookieStore.get('searchApp_currentUser'),-1);
    }
    
    //When the user click on a row
    $scope.rowClick = function(itemId) {
        $scope.editedTableDataRow = $filter('filter')($scope.tableData, { id: parseInt(itemId) }, true)[0];
        var contentSourceName = $scope.editedTableDataRow["contentSourceName"].trim().toLowerCase();
        var foundContentSources = channelSelectionService.getChannelsAsArray().filter(function(channel) {
            return (channel.getApiName() === contentSourceName && !channel.subChannels);
        });
        if (foundContentSources.length !== 1) {
            messageService.addWarning('Original content source name "' + contentSourceName + '" is not valid, please select another one',{groups: ['addContentSource']})();
            delete $scope.contentSourceName;
        } else {
            $scope.contentSourceName = contentSourceName;     
        }
        $scope.identifierName = $scope.editedTableDataRow["identifierName"].trim();
        var modalId = angular.element('#addContentSourcePopup');
        modalId.modal('show');        
     };
    
    
    $scope.updateContentSource = function() {

        var contentObject = {
            id: parseInt(parseInt($scope.editedTableDataRow["id"])),
            contentSourceName: $scope.contentSourceName,
            identifierName: $scope.identifierName,
            timestamp: $scope.editedTableDataRow["timestamp"]
        };

        communicationService.updateContentSource.put({id: $cookieStore.get('searchApp_currentUser'), iid: contentObject.id}, contentObject).$promise
                .then(function (results) {
                    messageService.addSuccess('Content source ID updated')();
                    resetTableData();
                    // $scope.resetModalDialog();
                }, function (errResponse) {
                    messageService.addError('Error updating content source ID.')(errResponse);
                });

    };  

    $scope.addContentSource = function () {
        if (!$scope.contentSourceName || !$scope.identifierName) {
            messageService.addError('Error adding content source. Name and id fields are required')();
        }
        var contentObject = {contentSourceName: $scope.contentSourceName, identifierName: $scope.identifierName};
        communicationService.addContentSource.post({id: $cookieStore.get('searchApp_currentUser')}, contentObject).$promise
                .then(function (results) {
                    messageService.addSuccess('Content source added successfully')();
                    resetTableData();
                }, function (errResponse) {
                    messageService.addError('Error adding content source.')(errResponse);
                });
    };

    $scope.delete = function(){
        $http({headers: {
            'Authorization': $cookieStore.get("searchApp_token"),
            "Content-Type":"application/json"},
            url: Environment.getRestapiHost() + '/restapi/services/participant/'+$cookieStore.get('searchApp_currentUser')+'/identifier',
            method: 'DELETE',
            data: tableInteractionsService.getIdsToDelete($scope.checkboxList)//,
        }).then(function(res) {
            messageService.addSuccess('Content source deleted from custodian')();            
            $scope.namesToBeDeleted = ''; //Clears the names of the deleted elements
            resetTableData();
            clearTrackingLists();
        }, function(error) {
            messageService.addError('Error deleting content sources from custodian')(error);            
        });
    };
    //END - API REQUEST METHODS

    // Delete page/record
    $scope.pageDelete = function(){
        $http({headers:{
            'Authorization': $cookieStore.get("searchApp_token"),
            "Content-Type":"application/json"},
            url: Environment.getRestapiHost() + '/restapi/services/participant',
            method: 'DELETE',
            data: [{id:$cookieStore.get('searchApp_currentUser')}]
        }).then(function(res) {
            resetTableData();
            $timeout(function(){$location.path('/manageUsers');}, 250);
        }, function(error) {
            messageService.addError('Error deleting custodian')(error);            
        });
    };


    // Edit toggle to edit user
    $scope.editToggle = function(){
        if($scope.readMode){
            $scope.editMode = true;
            $scope.readMode = false;
        }
        else{
            $scope.editMode = false;
            $scope.readMode = true;
        }
    };

    // Save edited fields
    $scope.saveName = function(){
        var contentObject = {};
        contentObject.firstName = $scope.userInfo["firstName"];
        contentObject.lastName = $scope.userInfo["lastName"];
        contentObject.email = $scope.userInfo["email"];
        contentObject.department = $scope.userInfo["department"];
        contentObject.country = $scope.userInfo["country"];
        contentObject.location = $scope.userInfo["location"];
        contentObject.employeeId = $scope.userInfo["employeeId"];
        contentObject.job = $scope.userInfo["job"];

        communicationService.updateUser.put({id:$cookieStore.get('searchApp_currentUser')}, contentObject).$promise
            .then(function(results) {
                messageService.addSuccess('Custodian updated')();
                $scope.editToggle();
            }, function(errResponse) {
                messageService.addError('Error updating custodian')(errResponse);                            
            });
    };

    //ON PAGE LOAD
    //Check if the page was stored in a cookie
    if($cookieStore.get('searchApp_ssCurrentPage') && ($cookieStore.get('searchApp_ssCurrentPage') != '')){
        $scope.currentPage   = $cookieStore.get('searchApp_ssCurrentPage');
    }
    else{
        //If the page was not stored, then load the table from the first page
        $cookieStore.put('searchApp_ssCurrentPage', 1);
    }

    //Populate the keyword information section
    $scope.getUserInfo();

});
