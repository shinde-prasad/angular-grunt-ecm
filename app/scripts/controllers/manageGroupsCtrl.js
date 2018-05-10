
'use strict';

searchApp.controller('manageGroupsCtrl', function ($scope, $http, $cookieStore, $location, messageService, communicationService, footerService, tableInteractionsService, Environment, Upload) {

  $scope.titlePage = "Manage Custodian Groups";

  //Table related fields. Check scripts/directives/tableGenerator.js for documentation
  $scope.tableData;
  $scope.discardedFields      = ['id', 'lastModifiedBy', 'lastModifiedByID', 'ownerID','timestamp'];
  $scope.specialFields        = ['lastUpdate'];  
  $scope.rowAttributes        = 'style="cursor: pointer;" ';
  $scope.checkboxList         = {};
  $scope.addCheckbox          = true;
  $scope.checkboxAttributes   = 'ng-change="checkboxChange()"';
  $scope.rowIdentifier        = 'id';
          //$scope.specialFields        = ['timestamp'];
  $scope.sortBy               = "";
  $scope.sortableFields       = ['lastUpdate','name','owner','description'];
  $scope.currentSortDirection = {};  

  //End - Table related fields

  //Pagination variables. Required for the pagination plugin (angular-ui)
  $scope.itemsPerPage     = $cookieStore.get("pageSizeManageGroups") ? $cookieStore.get("pageSizeManageGroups") : 50;
  $scope.maxSize          = 4;
  $scope.currentPage   = 1;
  $scope.itemsPerPageOptions    = [10, 20, 30, 40, 50];
  //$cookieStore.put('searchApp_ssCurrentPage',$scope.currentPage);
  //End - Pagination variables

  //Delete modal variables. Check scripts/directives/deleteModal.js for documentation
  $scope.deleteModalTitle = 'Delete Groups';
  $scope.countDeletedItems = '';
  $scope.deleteMessage1 = 'WARNING: You are about to delete';
  $scope.deleteMessage2 = 'groups!';
  $scope.namesToBeDeleted = '';
  $scope.returnVal = 'name'; // name of th field which should be returned in getNamesToDelete method
  //End - Delete modal variables

  //Add new modal variables.
  $scope.addNewModalTitle = 'Add new group';
  $scope.addNewMessage    = 'Enter the group information';
  $scope.newName          = '';
  $scope.newDescription   = '';
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
  
  /**
   * Do the sorting by the given field. The sorting is toggled between the values 'desc' and 'asc'
   * @param field Field name to be sorted.
   */
  $scope.setSort = function(key,field){
    $scope.sortBy = field;
    if(!key){
      if($scope.currentSortDirection[field]){
        if ($scope.currentSortDirection[field] === 'desc') {
          $scope.currentSortDirection = tableInteractionsService.setSortingDirection($scope.currentSortDirection,field,'asc');
        }
        else {
          $scope.currentSortDirection = tableInteractionsService.setSortingDirection($scope.currentSortDirection,field,'desc');
        }
      }
      else{
        $scope.currentSortDirection = tableInteractionsService.setSortingDirection($scope.currentSortDirection,field,'desc');
      }

    }
    $scope.getGroups();
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
        $cookieStore.put("pageSizeManageGroups", $scope.itemsPerPage);
        $scope.tableData        = undefined;
        $scope.currentPage   = 1;
        $scope.getGroups();

    };

  // Modal preparation
  $scope.prepareModal = function(){
    $scope.getAllGroups();
  };

  $scope.addNote  = function(){
    $scope.nodeText = '1 2 3 Probando.. ';
    communicationService.addComplianceNote.post({noteText:$scope.nodeText, ownerId: 4, userId:1053,groupId:25}).$promise
      .then(function(results){
        $scope.notesData    = undefined;
        $scope.getNotes();
        $scope.$emit('noteAdded', $scope.currentUri);
        $scope.noteText = "";
      }, function(errResponse){
         messageService.addError("AddNote failed.")(errResponse);
      });
  };

    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });

    $scope.upload = function (files) {
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                Upload.upload({
                    url: Environment.getRestapiHost() + '/restapi/services/participantgroup/upload',
                    file: file
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    $scope.log = 'progress: ' + progressPercentage + '% ' +
                        evt.config.file.name + '\n' + $scope.log;
                }).then(function (response) {
                    $scope.log = 'file ' + response.config.file.name + 'uploaded. Response: ' + JSON.stringify(response.data) + '\n' + $scope.log;
                    resetTableData();
                    messageService.addSuccess('Custodians Groups successfully imported')();
                }, function(errResponse){
                    var errorMessage    = "Error uploading custodians groups";
                    if($.isArray(errResponse.data)){
                        for(var i = 0; i < errResponse.data.length; i++){
                            errorMessage = errorMessage + "\n" + errResponse.data[i];
                        }
                    }
                    messageService.addError(errorMessage)(errResponse.data);
                    resetTableData();
                });
            }
        }
    };


    $scope.export    = function () {
        $http({
            method: 'GET',
            url: Environment.getRestapiHost() + '/restapi/services/participantgroup/export',
            responseType: 'arraybuffer'
        }).then(function (response) {
            var anchor = angular.element('<a/>');

            var filename = response.headers("x-filename");
            var myBuffer= new Uint8Array( response.data );

            var data = new Blob([myBuffer], {type: 'application/zip;charset=UTF-8'});
            saveAs(data, filename);
        });
    };

  //Gets all the groups
  $scope.getAllGroups = function(){
    communicationService.getGroups.get({page:1, resultsPerPage:10000}).$promise //10000 is the limit?
      .then(function(results){
        if($scope.selectAllEnabled){
          $scope.namesToBeDeleted = tableInteractionsService.getElementsSelected(results.groups, $scope.selectAllEnabled, $scope.uncheckedElements, 'id', [$scope.returnVal]);
          $scope.countDeletedItems= tableInteractionsService.getCountElementsSelected(results.groups, $scope.selectAllEnabled, $scope.uncheckedElements, 'id');
        }
        else{
          $scope.namesToBeDeleted = tableInteractionsService.getElementsSelected(results.groups, $scope.selectAllEnabled, $scope.checkedElements, 'id', [$scope.returnVal]);
          $scope.countDeletedItems= tableInteractionsService.getCountElementsSelected(results.groups, $scope.selectAllEnabled, $scope.checkedElements, 'id');
        }
      }, function(errResponse){
         messageService.addError('Get all failed.')(errResponse);
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
    $scope.getGroups();
    //End of table reload

    //Clear the name and description
    $scope.newName          = '';
    $scope.newDescription   = '';

    $scope.allChecked   = false;
  };

  //When the user click on a row
  $scope.rowClick = function(groupId){
    //To be implemented - Work in progress...
    $cookieStore.put('searchApp_currentGroup', groupId);
    $location.url('/groupDetails');
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
    $cookieStore.put('searchApp_ssCurrentPage', $scope.currentPage);
    resetTableData();
  };
  //END - PAGINATION METHODS


  // API REQUEST METHODS//
  // Get all the users to populate the table
  $scope.getGroups = function(){
    $scope.tableData        = undefined;
    $scope.noResults        = false;      
    var params = {page:$scope.currentPage, resultsPerPage:$scope.itemsPerPage};
    if($scope.sortBy.length > 0){
      params.sortby = $scope.sortBy +":"+$scope.currentSortDirection[$scope.sortBy];
    }         
    communicationService.getGroups.get(params).$promise
      .then(function(results){
        $scope.tableData = results.groups;
        footerService.setResultInfo($scope.currentPage, $scope.itemsPerPage, results.count);
        updateCheckboxes();
      }, function(errResponse){
        messageService.addError('Error getting groups.')(errResponse);
      });
  };


  // Add a new group
    $scope.save = function () {
        var contentObject = {};
        contentObject.name = $scope.newName;
        contentObject.description = $scope.newDescription;
        if ((contentObject.name.length === 0) || (contentObject.description.length === 0)) {
            messageService.addSuccess('Error creating group. Name and description fields are required')();
        } else {
            $http.post(Environment.getRestapiHost() + '/restapi/services/participantgroup', contentObject)
                    .then(function (result) {
                        messageService.addSuccess('Group created')();
                        $cookieStore.put('searchApp_currentGroup', result.data);
                        resetTableData();
                    }, function (errResponse) {
                messageService.addError('Error creating group.')(errResponse);
            });
        }
    };

  // Delete a group
  $scope.delete = function(){
    $http({headers:{'Authorization': $cookieStore.get("searchApp_token"), "Content-Type":"application/json"}, url: Environment.getRestapiHost() + '/restapi/services/participantgroup', method: 'DELETE', data: tableInteractionsService.getIdsToDelete($scope.checkboxList)}).then(function(res) {
      messageService.addSuccess('Group deleted')();
      $scope.namesToBeDeleted = ''; //Clears the names of the deleted elements
      resetTableData();
      clearTrackingLists();
    }, function(errResponse) {
      messageService.addError('Error deleting group.')(errResponse);
    });

  };

  //ON PAGE LOAD
  //Check if the page was stored in a cookie
  if($cookieStore.get('searchApp_ssCurrentPage') && ($cookieStore.get('searchApp_ssCurrentPage') != '')){
    $scope.setPage(parseInt($cookieStore.get('searchApp_ssCurrentPage')));
  }
  else{
    //If the page was not stored, then load the table from the first page
    $cookieStore.put('searchApp_ssCurrentPage', 1);
  }
 
  // Call get users method
  $scope.getGroups();
});

