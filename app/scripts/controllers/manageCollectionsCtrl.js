'use strict';

/*** Controller for Manage Collection ***/

searchApp.controller('manageCollectionsCtrl', function ($scope, $http, $cookieStore, $route, communicationService, footerService, tableInteractionsService, $location, messageService, Environment) {

  $scope.titlePage = "Manage Collections";

  // List of fields necessary to generate the table
  $scope.tableData;
  $scope.discardedFields  = ['id','ownerId','notes','groupId', 'documents'];
  $scope.rowAttributes    = 'style="cursor: pointer;" ';
  $scope.checkboxList     = {};
  $scope.addCheckbox      = true;
  $scope.checkboxAttributes   = 'ng-change="checkboxChange()"';
  $scope.rowIdentifier    = 'id';
  $scope.iconFields       = [];
  $scope.specialFields    = ['createdDate'];
  $scope.sortableFields   = [];

  // Pagination variables. Required for the pagination plugin (angular-ui)
  $scope.itemsPerPage     = $cookieStore.get("pageSizeManageCollections") ? $cookieStore.get("pageSizeManageCollections") : 50;
  $scope.maxSize          = 4;
  $scope.bigCurrentPage   = 1;
  $cookieStore.put('searchApp_ssCurrentPage', $scope.bigCurrentPage);
  $scope.itemsPerPageOptions    = [10, 20, 30, 40, 50];

  //Delete modal variables. Check scripts/directives/deleteModal.js for documentation
  $scope.deleteModalTitle = 'Delete Collection';
  $scope.countDeletedItems = '';
  $scope.deleteMessage1 = 'WARNING: You are about to delete';
  $scope.deleteMessage2 = 'collections!';
  $scope.namesToBeDeleted = '';
  $scope.returnVal = 'name'; // name of th field which should be returned in getNamesToDelete method

  // Variables for request
  $scope.collectionName = '';
  $scope.collectionNotes = '';
  $scope.responseStatus   = '';
  $scope.collectionId = '';

  // To disable button when no item is choosen by checkbox
  $scope.btnDisabled = true;

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
    }
    else{
      $scope.checkedElements    = tableInteractionsService.getNewElements($scope.tableData, $scope.checkboxList, $scope.selectAllEnabled, 'id', $scope.checkedElements);
    }
    getActionButtonStatus();
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

    $scope.updatePageSize   = function() {
        $cookieStore.put("pageSizeManageCollections", $scope.itemsPerPage);
        $scope.tableData        = undefined;
        $scope.getCollections();

    };

  // Modal preparation
  $scope.prepareModal = function(){
    $scope.getAllCollections();
  };

  //Gets all the users
  $scope.getAllCollections = function(){
    communicationService.getCollections.get({page:1, resultsPerPage:10000}).$promise //10000 is the limit?
      .then(function(results){
        if($scope.selectAllEnabled){
          $scope.namesToBeDeleted = tableInteractionsService.getElementsSelected(results.collections, $scope.selectAllEnabled, $scope.uncheckedElements, 'id', [$scope.returnVal]);
          $scope.countDeletedItems= tableInteractionsService.getCountElementsSelected(results.collections, $scope.selectAllEnabled, $scope.uncheckedElements, 'id');
        }
        else{
          $scope.namesToBeDeleted = tableInteractionsService.getElementsSelected(results.collections, $scope.selectAllEnabled, $scope.checkedElements, 'id', [$scope.returnVal]);
          $scope.countDeletedItems= tableInteractionsService.getCountElementsSelected(results.collections, $scope.selectAllEnabled, $scope.checkedElements, 'id');
        }
      }, function(errResponse){
        messageService.addError('Error getting collections.')(errResponse);
      });
  };
  /****************************/
  /* END - ELEMENTS SELECTION */
  /****************************/


  var setupFooterCount = function(pageNumber, resultsPerPage, resultsCount){
    if(resultsCount < 1){
      footerService.firstPosition = 0;
    }
    else{
      footerService.firstPosition = pageNumber * resultsPerPage - (resultsPerPage - 1);   //Example: Second page with 10 results per page. 2 * 10 - 9 = 20 - 9 = 11
    }
    footerService.getResultInfo().resultsCount  = resultsCount;
    footerService.lastPosition  = pageNumber * resultsPerPage;                              //Example: Second page with 10 results per page. 2 * 10 = 20 = 11
    if(footerService.getResultInfo().resultsCount < footerService.lastPosition){
      footerService.lastPosition  = footerService.getResultInfo().resultsCount;
    }
  };

  //TABLE RELATED METHODS//
  var resetTableData  = function(){
    //To reload the table
    $scope.tableData        = undefined;
    $scope.btnDisabled   = true;
    $scope.checkboxList     = {};
    $scope.getCollections();
    //End of table reload

    //Clear the name and description
    $scope.newName          = '';
    $scope.newDescription   = '';

    $scope.allChecked       = false;
  };


  //When the user click on a row
  $scope.rowClick = function(collectionId){
    //To be implemented - Work in progress...
    $cookieStore.put('searchApp_currentCollection', collectionId);
    $location.url('/collectionDetails');
  };


  // method to delete items from table
  $scope.delete = function(){
    $http({headers:{'Authorization': $cookieStore.get("searchApp_token"), "Content-Type":"application/json"}, url: Environment.getRestapiHost() + '/restapi/services/collection', method: 'DELETE', data: tableInteractionsService.getIdsToDelete($scope.checkboxList)}).then(function(res) {
      messageService.addSuccess('Collections deleted')();
      $scope.namesToBeDeleted = ''; //Clears the names of the deleted elements
      resetTableData();
        clearTrackingLists();
    }, function(errResponse) {
      messageService.addError('Collections delete error.')(errResponse);
    });

  };

  //Checks or unchecks all checkboxes
  $scope.checkUncheckAll = function(isCheckAll){
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

  // method to return table result
  $scope.getCollections  = function(){
    communicationService.getCollections.get({page:$scope.bigCurrentPage, resultsPerPage:$scope.itemsPerPage}).$promise
      .then(function(results){
        $scope.tableData = results.collections;
        footerService.setResultInfo($scope.bigCurrentPage, $scope.itemsPerPage, results.count);
        updateCheckboxes();
      }, function(errResponse){
        messageService.addError('Error retrieving collections.')(errResponse);
      });
  };

  // Merge collection
  $scope.mergeCollections = function(){

    var contentObject   = [];

    if($scope.selectAllEnabled){
      for(var i = 0; i < Object.getOwnPropertyNames($scope.uncheckedElements).length; i++){
        contentObject.push({id:(Object.getOwnPropertyNames($scope.uncheckedElements)[i])});
      }
    }
    else{
      for(var i = 0; i < Object.getOwnPropertyNames($scope.checkedElements).length; i++){
        contentObject.push({id:Object.getOwnPropertyNames($scope.checkedElements)[i]});
      }
    }

    $cookieStore.put('searchApp_collectionId', $scope.collectionId);
    communicationService.mergeCollection.post({id:$scope.collectionId, selectAll:$scope.selectAllEnabled},contentObject).$promise
      .then(function(results) {
        messageService.addSuccess('Collections merged')();
        $scope.responseStatus   = 'Collection merged successfully';
        $scope.$emit("addCollection", $scope.responseStatus); //Emit dispatches an event traversing upwards toward the root scope
        resetTableData();
      }, function(errResponse) {
        messageService.addError('Error merging collections.')(errResponse);
        $scope.responseStatus   = 'Merge colletion failed';
        $scope.$emit("addCollection", $scope.responseStatus); //Emit dispatches an event traversing upwards toward the root scope
      });
  };

  // Prepare modal dialog to merge collection
  $scope.prepareMergeModal = function(){
    var mergeDestination = tableInteractionsService.getCollectionsToMerge($scope.tableData, $scope.checkboxList);
    $scope.mergeDestination = mergeDestination;

    var namesToDelete = tableInteractionsService.getNamesToDelete($scope.tableData, $scope.checkboxList, $scope.returnVal);
    $scope.namesToBeDeleted = '';

    for(var i = 0; (i < namesToDelete.length)&&(i < 5); i++){
      $scope.namesToBeDeleted += namesToDelete[i] + "<br />";
      $scope.countDeletedItems = i + 1;
      if(i !== (namesToDelete.length-1)){
        if(i === 10){
          $scope.namesToBeDeleted += "...";
        }
      }
    }
  };

  //If the controller is executed because the user is in the manageSearches page then gets the queries to populate the table
  if($route.current.activetab === 'manageCollections'){

    if($location.search().page){
      $scope.bigCurrentPage = parseInt($location.search().page);
    }
    else{
      $scope.bigCurrentPage = 1;
    }
    $scope.getCollections();
  }

  $scope.setPage = function (pageNo) {
    $scope.bigCurrentPage = pageNo;
  };

  $scope.pageChanged = function() {
    $location.search('page',$scope.bigCurrentPage);
    resetTableData();
  };
});

