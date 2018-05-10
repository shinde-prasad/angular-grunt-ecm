'use strict';

searchApp.controller('keywordDetailsCtrl', function ($scope, $http, $cookieStore, $location, $timeout, $filter, messageService, communicationService, footerService, tableInteractionsService, Environment) {

    //Table related fields. Check scripts/directives/tableGenerator.js for documentation
    $scope.tableData;
    $scope.discardedFields      = ['id', 'modifiedById', 'terms', 'groupId', 'userId'];
    $scope.rowAttributes        = '';
    $scope.checkboxList         = {};
    $scope.addCheckbox          = true;
    $scope.checkboxAttributes   = 'ng-change="checkboxChange()"';
    $scope.rowIdentifier        = 'id';
    $scope.specialFields        = ['createdDate'];
    $scope.sortableFields       = [];
    //End - Table related fields

    //Pagination variables. Required for the pagination plugin (angular-ui)
    $scope.itemsPerPage     = $cookieStore.get("pageSizeKeywordDetails") ? $cookieStore.get("pageSizeKeywordDetails") : 50;
    $scope.maxSize          = 4;
    $scope.bigCurrentPage   = 1;
    $cookieStore.put('searchApp_ssCurrentPage', $scope.bigCurrentPage);
    $scope.itemsPerPageOptions    = [10, 20, 30, 40, 50];
    //End - Pagination variables

    //Delete modal variables. Check scripts/directives/deleteModal.js for documentation
    $scope.countDeletedItems = '';
    $scope.deleteModalTitle = 'Delete Terms';
    $scope.deleteMessage1 = 'WARNING: You are about to delete';
    $scope.deleteMessage2 = 'keyword terms!';
    $scope.namesToBeDeleted = '';

    $scope.deleteDetailModalTitle = 'Delete keyword';
    $scope.deleteDetailMessage = 'keyword';
    $scope.deteteDetailName = '';
    //End - Delete modal variables

    //Enable or disable the delete button
    $scope.btnDisabled = true;

    //Page variables
    $scope.keywordName;
    $scope.newTerms;
    $scope.editMode = false;
    $scope.readMode = true;

    /**********************/
    /* ELEMENTS SELECTION */
    /**********************/
    $scope.selectAllEnabled     = false;
    $scope.checkedElements      = {};
    $scope.uncheckedElements    = {};

    //When a checkbox status change, this method is triggered
    $scope.checkboxChange   = function(){
        if($scope.selectAllEnabled){
            $scope.uncheckedElements      = tableInteractionsService.getNewElements($scope.tableData, $scope.checkboxList, $scope.selectAllEnabled, 'id', $scope.uncheckedElements);
        } else {
            $scope.checkedElements    = tableInteractionsService.getNewElements($scope.tableData, $scope.checkboxList, $scope.selectAllEnabled, 'id', $scope.checkedElements);
        }
        getActionButtonStatus();
    };

    //Updates the checkboxes in the current page using the checked or unchecked element lists
    var updateCheckboxes = function () {
        if ($scope.selectAllEnabled){
            $scope.checkboxList = tableInteractionsService.getCurrentPageList($scope.tableData, $scope.selectAllEnabled, 'id', $scope.uncheckedElements);
        } else {
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
    $scope.selectAll = function(){
        if($scope.selectAllEnabled){
            $scope.selectAllEnabled = false;
            clearTrackingLists();
            $scope.checkboxList = tableInteractionsService.getAllCheckedUnchecked($scope.tableData, $scope.checkboxList, 'id', false);
        } else {
            $scope.selectAllEnabled = true;
            clearTrackingLists();
            $scope.checkboxList = tableInteractionsService.getAllCheckedUnchecked($scope.tableData, $scope.checkboxList, 'id', true);
        }
    };

    //Sets the status of the btnDisabled variable. This will enable or disable the action buttons on the page
    var getActionButtonStatus   = function(){
        if($scope.selectAllEnabled){
            $scope.btnDisabled  = tableInteractionsService.getIsDisabled($scope.tableData, $scope.selectAllEnabled, $scope.uncheckedElements, footerService.getResultInfo().resultsCount, 'id');
        } else {
            $scope.btnDisabled  = tableInteractionsService.getIsDisabled($scope.tableData, $scope.selectAllEnabled, $scope.checkedElements, footerService.getResultInfo().resultsCount, 'id');
        }
    };

    $scope.updatePageSize   = function() {
        $cookieStore.put("pageSizeKeywordDetails", $scope.itemsPerPage);
        $scope.tableData        = undefined;
        $scope.bigCurrentPage   = 1;
        $scope.getTerms();

    };

    // Modal preparation
    $scope.prepareModal = function(){
        $scope.getAllTerms();
    };

    //Gets all the users
    $scope.getAllTerms = function(){
        communicationService.getKeywordTerms.get({id:$cookieStore.get('searchApp_currentKeyword'), page:1, resultsPerPage:10000}).$promise //10000 is the limit?
            .then(function(results){
                if($scope.selectAllEnabled){
                    $scope.namesToBeDeleted = tableInteractionsService.getElementsSelected(results.terms, $scope.selectAllEnabled, $scope.uncheckedElements, 'id', ['term']);
                    $scope.countDeletedItems= tableInteractionsService.getCountElementsSelected(results.terms, $scope.selectAllEnabled, $scope.uncheckedElements, 'id');
                }
                else{
                    $scope.namesToBeDeleted = tableInteractionsService.getElementsSelected(results.terms, $scope.selectAllEnabled, $scope.checkedElements, 'id', ['term']);
                    $scope.countDeletedItems= tableInteractionsService.getCountElementsSelected(results.terms, $scope.selectAllEnabled, $scope.checkedElements, 'id');
                }
            }, function(errResponse){
                messageService.addError('Error getting terms.')(errResponse);
            });
    };
    /****************************/
    /* END - ELEMENTS SELECTION */
    /****************************/

    //TABLE RELATED METHODS//
    var resetTableData  = function(){
        $scope.tableData        = undefined;
        $scope.btnDisabled   = true;
        $scope.checkboxList     = {};
        $scope.getTerms();
        $scope.newName          = '';
        $scope.newDescription   = '';
    };

    //When the user click on a row
    $scope.rowClick = function(termId){
        //No actions
    };

    //Checks or unchecks all checkboxes
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
        $scope.bigCurrentPage = pageNo;
    };

    $scope.pageChanged = function() {
        $cookieStore.put('searchApp_ssCurrentPage', $scope.bigCurrentPage);
        resetTableData();
    };
    //END - PAGINATION METHODS


    //INFO SECTION METHODS
    var removeUnnecessaryInfoFields = function(){
        delete $scope.keywordInfo["id"];
        delete $scope.keywordInfo["userId"];
        delete $scope.keywordInfo["modifiedById"];
        delete $scope.keywordInfo["groupId"];
        delete $scope.keywordInfo["terms"];
    };
    //END - INFO SECTION METHODS

    //INFO SECTION METHODS
    var getArrayOfTerms = function() {
        var arrayOfTerms = [];
        if ($scope.newTerms) {
            var splitted = $scope.newTerms.split("\n");
            for (var i = 0; i < splitted.length; i++) {
                arrayOfTerms.push({term: splitted[i]});
            }
        }
        return arrayOfTerms;
    };
    //END - INFO SECTION METHODS

    //API REQUEST METHODS//
    //Get the keyword information
    $scope.getKeywordInfo  = function(){
        communicationService.getKeywordInfo.get({id:$cookieStore.get('searchApp_currentKeyword')}).$promise
            .then(function(results){
                $scope.keywordName      = results["name"];  //Extracting the name to set the page title
                $scope.deleteDetailName = results["name"]; //Value for name of delete item
                $scope.keywordInfo      = results;
                if(results.createdDate && results.modifiedDate){
                    var a1   = results.createdDate.split(" ");
                    var d1   = a1[0].split("-");
                    var t1   = a1[1].split(":");
                    var formattedDate1 = new Date(d1[0],(d1[1]-1),d1[2],t1[0],t1[1]);
                    $scope.keywordInfo.createdDate   = $filter('date')(formattedDate1, 'yyyy-MM-dd HH:mm');
                    var a2   = results.createdDate.split(" ");
                    var d2   = a2[0].split("-");
                    var t2   = a2[1].split(":");
                    var formattedDate2 = new Date(d2[0],(d2[1]-1),d2[2],t2[0],t2[1]);
                    $scope.keywordInfo.modifiedDate   = $filter('date')(formattedDate2, 'yyyy-MM-dd HH:mm');
                }

                removeUnnecessaryInfoFields();
                //Get the terms of the keyword to populate the table
                $scope.getTerms();
            }, function(errResponse){
                messageService.addError('Error getting keyword info.')(errResponse);
            });
    };

    //getKeywordTerms
    $scope.getTerms = function(){
        communicationService.getKeywordTerms.get({id:$cookieStore.get('searchApp_currentKeyword'), page:$scope.bigCurrentPage, resultsPerPage:$scope.itemsPerPage}).$promise
            .then(function(results){
                $scope.tableData    = results.terms;
                footerService.setResultInfo($scope.bigCurrentPage, $scope.itemsPerPage, results.count);
                updateCheckboxes();
            }, function(errResponse){
                messageService.addError('Error getting the keyword terms.')(errResponse);
            });
    };

    //Add a list of terms
    $scope.addTerms = function(){
        if(getArrayOfTerms().length === 0){
            messageService.addError('Error adding term. List of terms required.')();
        }
        else{
            communicationService.addTermsToKeyword.post({id:$cookieStore.get('searchApp_currentKeyword')}, getArrayOfTerms()).$promise
                .then(function(results){
                    resetTableData();
                }, function(errResponse){
                    messageService.addError('Error adding term.')(errResponse);
                });
        }
    };

    //Delete a list of terms
    $scope.delete       = function(){
        $http({headers: {
                    'Authorization': $cookieStore.get("searchApp_token"),
                    "Content-Type":"application/json"},
                    url: Environment.getRestapiHost() + '/restapi/services/keyword/'+$cookieStore.get('searchApp_currentKeyword')+'/term',
                    method: 'DELETE',
                    data: tableInteractionsService.getIdsToDelete($scope.checkboxList)
                }).then(function(res) {
            messageService.addSuccess('Terms deleted')();
            $scope.namesToBeDeleted = ''; //Clears the names of the deleted elements
            resetTableData();
            clearTrackingLists();
        }, function(errResponse) {
            messageService.addError('Terms delete error.')(errResponse);
        });
    };
    //END - API REQUEST METHODS

    $scope.pageDelete   = function(){

        $http({headers:{
                    'Authorization': $cookieStore.get("searchApp_token"),
                    "Content-Type":"application/json"},
                    url: Environment.getRestapiHost() + '/restapi/services/keyword',
                    method: 'DELETE',
                    data: [{id:$cookieStore.get('searchApp_currentKeyword')}]
                }).then(function(res) {
            resetTableData();
            $timeout(function(){$location.path('/manageKeywords');}, 250);
        }, function(errResponse) {
            messageService.addError('Keyword delete error.')(errResponse);
        });
    };

    $scope.editToggle   = function(){
        if($scope.readMode){
            $scope.editMode = true;
            $scope.readMode = false;
        }
        else{
            $scope.editMode = false;
            $scope.readMode = true;
        }
    };

    $scope.saveName     = function(){
        var contentObject               = {};
        contentObject.name              = $scope.keywordInfo["name"];
        contentObject.description       = $scope.keywordInfo["description"];

        if(contentObject.name === "" || contentObject.description === ""){
          messageService.addError('Name and Description values must be fill out.')();
          return;
        }

        communicationService.updateKeyword.put({id:$cookieStore.get('searchApp_currentKeyword')}, contentObject).$promise
            .then(function(results) {
                messageService.addSuccess('Keyword updated')();
                $scope.editToggle();
            }, function(errResponse) {
                messageService.addError('Error updating keyword.')(errResponse);
            });
    };

    //ON PAGE LOAD
    //Check if the page was stored in a cookie
    if($cookieStore.get('searchApp_ssCurrentPage') && ($cookieStore.get('searchApp_ssCurrentPage') != '')){
        $scope.bigCurrentPage   = $cookieStore.get('searchApp_ssCurrentPage');
    }
    else{
        //If the page was not stored, then load the table from the first page
        $cookieStore.put('searchApp_ssCurrentPage', 1);
    }

    $scope.getKeywordInfo();
});

