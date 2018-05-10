'use strict';

searchApp.controller('manageKeywordsCtrl', function ($scope, $http, $cookieStore, $location, communicationService, footerService, tableInteractionsService, messageService, Environment) {

  $scope.titlePage            = "Manage Keyword Groups";

  //Table related fields. Check scripts/directives/tableGenerator.js for documentation
  $scope.tableData;
  $scope.discardedFields      = ['id', 'modifiedById', 'terms', 'groupId', 'userId'];
  $scope.rowAttributes        = 'style="cursor: pointer;" ';
  $scope.checkboxList         = {};
  $scope.addCheckbox          = true;
  $scope.checkboxAttributes   = 'ng-change="checkboxChange()"';
  $scope.rowIdentifier        = 'id';
  $scope.specialFields        = ['modifiedDate', 'createdDate'];
  $scope.sortableFields       = [];
  //End - Table related fields

  //Pagination variables. Required for the pagination plugin (angular-ui)
  $scope.itemsPerPage     = $cookieStore.get("pageSizeManageKeywords") ? $cookieStore.get("pageSizeManageKeywords") : 50;
  $scope.maxSize          = 4;
  $scope.currentPage   = 1;
  $cookieStore.put('searchApp_ssCurrentPage', $scope.currentPage);
  $scope.itemsPerPageOptions    = [10, 20, 30, 40, 50];
  //End - Pagination variables

  //Delete modal variables. Check scripts/directives/deleteModal.js for documentation
  $scope.deleteModalTitle = 'Delete Keyword groups';
  $scope.countDeletedItems = '';
  $scope.deleteMessage1 = 'WARNING: You are about to delete';
  $scope.deleteMessage2 = 'keyword groups!';
  $scope.namesToBeDeleted = '';
  $scope.returnVal = 'name'; // name of th field which should be returned in getNamesToDelete method
  //End - Delete modal variables

  //Add new modal variables.
  $scope.addNewModalTitle = 'Add new keyword group';
  $scope.addNewMessage    = 'Enter the keyword group information';
  $scope.newName;
  $scope.newDescription;
  //End - Add new modal variables

  //Enable or disable the delete button
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
        $cookieStore.put("pageSizeManageKeywords", $scope.itemsPerPage);
        $scope.tableData        = undefined;
        $scope.currentPage   = 1;
        $scope.getKeywords();
    };

  // Modal preparation
  $scope.prepareModal = function(){
    $scope.getAllKeywords();
  };

  //Gets all the users
  $scope.getAllKeywords = function(){
    communicationService.getKeywords.get({page:1, resultsPerPage:10000}).$promise //10000 is the limit?
      .then(function(results){
        if($scope.selectAllEnabled){
          $scope.namesToBeDeleted = tableInteractionsService.getElementsSelected(results.keywords, $scope.selectAllEnabled, $scope.uncheckedElements, 'id', [$scope.returnVal]);
          $scope.countDeletedItems= tableInteractionsService.getCountElementsSelected(results.keywords, $scope.selectAllEnabled, $scope.uncheckedElements, 'id');
        }
        else{
          $scope.namesToBeDeleted = tableInteractionsService.getElementsSelected(results.keywords, $scope.selectAllEnabled, $scope.checkedElements, 'id', [$scope.returnVal]);
          $scope.countDeletedItems= tableInteractionsService.getCountElementsSelected(results.keywords, $scope.selectAllEnabled, $scope.checkedElements, 'id');
        }
      }, function(errResponse){
        messageService.addError('Error getting keywords.')(errResponse);
      });
  };
  /****************************/
  /* END - ELEMENTS SELECTION */
  /****************************/


  //TABLE RELATED METHODS//
  var resetTableData  = function(){
    //To reload the table
    $scope.tableData        = undefined;
    $scope.btnDisabled   = true;
    $scope.checkboxList     = {};
    $scope.getKeywords();
    //End of table reload

    //Clear the name and description
    $scope.newName          = '';
    $scope.newDescription   = '';

    $scope.allChecked   = false;
  };

  //When the user click on a row
  $scope.rowClick = function(keywordId){
    //To be implemented - Work in progress...
    $cookieStore.put('searchApp_currentKeyword', keywordId);
    $location.url('/keywordDetails');
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
    $scope.currentPage = pageNo;
  };

  $scope.pageChanged = function() {
    $location.search('page',$scope.currentPage);
    resetTableData();
  };
  //END - PAGINATION METHODS

  //API REQUEST METHODS//
  $scope.getKeywords  = function(){
    communicationService.getKeywords.get({page:$scope.currentPage, resultsPerPage:$scope.itemsPerPage}).$promise
      .then(function(results){
        $scope.tableData = results.keywords;
        footerService.setResultInfo($scope.currentPage, $scope.itemsPerPage, results.count);
        updateCheckboxes();
      }, function(errResponse){
        messageService.addError('Error getting keywords.')(errResponse);
      });
  };

  //Add a new keyword
  $scope.save = function(){
    var contentObject               = {};
    contentObject.name              = $scope.newName;
    contentObject.description       = $scope.newDescription;

    if((contentObject.name.length === 0)||(contentObject.description.length === 0)){
      messageService.addError('Error creating keyword. Name and description fields are required')();                  
    }
    else{
      communicationService.addKeyword.post(contentObject).$promise
        .then(function(results) {
          messageService.addSuccess('Keywords created')();            
          resetTableData();
        }, function(errResponse) {
          messageService.addError('Error creating keyword.')(errResponse);          
        });
    }
  };

  //Delete a keyword
  $scope.delete       = function(){
    $http({headers:{'Authorization': $cookieStore.get("searchApp_token"), "Content-Type":"application/json"}, url: Environment.getRestapiHost() + '/restapi/services/keyword', method: 'DELETE', data: tableInteractionsService.getIdsToDelete($scope.checkboxList)}).then(function(res) {
      messageService.addSuccess('Keywords deleted')();
      $scope.namesToBeDeleted = '';
      resetTableData();
      clearTrackingLists();
    }, function(errResponse) {
      messageService.addError('Delete keywords failed.')(errResponse);
    });

  };
  //END - API REQUEST METHODS

  //ON PAGE LOAD
  //Check if the page was stored in a cookie
  if($location.search().page){
    $scope.currentPage = parseInt($location.search().page);
  }
  else{
    $scope.currentPage = 1;
  }

  $scope.getKeywords();

});