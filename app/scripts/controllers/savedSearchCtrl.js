
'use strict';

searchApp.controller('savedSearchCtrl', function ($scope, $location, $cookieStore, $route, $http, messageService, footerService, communicationService, savedSearchService, searchResultsService, tableInteractionsService, Environment) {

  $scope.enddate_detail = {};
  $scope.startdate_detail = {};
  $scope.currentName      = '';
  $scope.responseStatus   = '';
  $scope.allChecked       = false;
  $scope.btnDisabled      = true;

  //List of fields necessary to generate the table
  //The rowClick method is a requirement
  $scope.tableData;                                   //Field necessary to create the table
  $scope.discardedFields  = ['id','searchCriteria'];  //Fields that are not going to be included in the table
  $scope.rowAttributes    = 'style="cursor: pointer;" ';                       //Parameters that will be used in the rowClick method
  $scope.checkboxList     = {};                       //Parameters that will be used in the rowClick method
  $scope.addCheckbox      = true;                     //Parameters that will be used in the rowClick method
  $scope.checkboxAttributes   = 'ng-change="checkboxChange()"';               //Parameters that will be used in the rowClick method
  $scope.rowIdentifier    = 'id';                                //Parameters that will be used in the rowClick method
  $scope.specialFields    = ['timestamp'];
  $scope.sortableFields   = [];

  //Delete modal variables. Check scripts/directives/deleteModal.js for documentation
  $scope.deleteModalTitle = 'Delete Search';
  $scope.namesToBeDeleted = '';
  $scope.countDeletedItems = '';
  $scope.deleteMessage1 = 'WARNING: You are about to delete';
  $scope.deleteMessage2 = 'saved searches!';
  $scope.returnVal = 'name'; // name of th field which should be returned in getNamesToDelete method
  //End - Delete modal variables

  //Pagination variables. Required for the pagination plugin (angular-ui)
  $scope.itemsPerPage     = $cookieStore.get("pageSizeSavedSearch") ? $cookieStore.get("pageSizeSavedSearch") : 50;
  $scope.maxSize          = 3;
  $scope.bigCurrentPage   = 1;
  //HIT-285
  $cookieStore.put('searchApp_ssCurrentPage',$scope.bigCurrentPage);
  $scope.itemsPerPageOptions    = [10, 20, 30, 40, 50];

  //Download modal variables
  $scope.selectDirectoryMode  = true;         //Defines if the download modal is in select directory mode or not (new folder mode)
  $scope.newDirectoryName     = '';
  $scope.downloadModalTitle   = 'Download';
  $scope.downloadModalMessage = 'Select the directory, filename and password you want to use for the export.';
  $scope.downloadModalMessage2 = 'When no value is chosen for filename, a standard value will be used.'; 
  $scope.directoryOptions     = [];
  $scope.selectedDirectory    = {};
  $scope.zipPassword          = '';
  $scope.zipFilename          = '';  
  $scope.loadingDirectories   = false;
  $scope.loadingPath   = false;

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
      $scope.countCheckedItems = tableInteractionsService.getCountElementsSelected($scope.tableData, $scope.selectAllEnabled, $scope.uncheckedElements, 'id');    
    }
    else{
      $scope.btnDisabled  = tableInteractionsService.getIsDisabled($scope.tableData, $scope.selectAllEnabled, $scope.checkedElements, footerService.getResultInfo().resultsCount, 'id');
      $scope.countCheckedItems = tableInteractionsService.getCountElementsSelected($scope.tableData, $scope.selectAllEnabled, $scope.checkedElements, 'id');
    }
  };

    $scope.updatePageSize   = function() {
        $cookieStore.put("pageSizeSavedSearch", $scope.itemsPerPage);
        $scope.tableData        = undefined;
        $scope.bigCurrentPage   = 1;
        $scope.getQueries();

    };

  // Modal preparation
  $scope.prepareDeleteModal = function($event) {
    savedSearchService.getQueries({page:1, resultsPerPage:10000}).then(function(results) {
        if($scope.selectAllEnabled){
          $scope.namesToBeDeleted = tableInteractionsService.getElementsSelected(results.searches, $scope.selectAllEnabled, $scope.uncheckedElements, 'id', [$scope.returnVal]);
          $scope.countDeletedItems= tableInteractionsService.getCountElementsSelected(results.searches, $scope.selectAllEnabled, $scope.uncheckedElements, 'id');
        }
        else{
          $scope.namesToBeDeleted = tableInteractionsService.getElementsSelected(results.searches, $scope.selectAllEnabled, $scope.checkedElements, 'id', [$scope.returnVal]);
          $scope.countDeletedItems= tableInteractionsService.getCountElementsSelected(results.searches, $scope.selectAllEnabled, $scope.checkedElements, 'id');
        }
    });
  };

  $scope.save = function() {
    savedSearchService.saveQuery($scope.currentName).then(function(results) {
      });
      return true;      
  };

  $scope.update = function() {
    savedSearchService.updateQuery().then(function(results) {
      });
  };

  $scope.getQueries   = function() {
      return savedSearchService.getQueries({page:$scope.bigCurrentPage, resultsPerPage:$scope.itemsPerPage}).then(function(results) {
        $scope.tableData            = results.searches;
        footerService.setResultInfo($scope.bigCurrentPage, $scope.itemsPerPage, results.count);
      });
  };

  //Method executed when a row is clicked in the table
    $scope.rowClick = function (savedSearchId) {
        searchResultsService.reset();
        savedSearchService.loadQuery(savedSearchId).then(function () {
            $location.path('/');
        });
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

  //To delete a list of queries
  //The delete method in the resource service does not support a body content, using http service instead
  //http://stackoverflow.com/questions/22186671/angular-resource-delete-wont-send-body-to-express-js-server
  $scope.delete = function(){
    $scope.clearNamesToBeDeleted();
    var idsToDelete = tableInteractionsService.getIdsToDelete($scope.checkboxList);
    return savedSearchService.deleteQueries(idsToDelete).then(function(result) {
      $scope.tableData    = undefined;
      $scope.btnDisabled  = true;
      $scope.checkboxList = {};
      $scope.getQueries();
    });
  };

  // Download query
  $scope.download = function(){
    var firstId =+ tableInteractionsService.getFirstCheckedId($scope.checkboxList);
    $http.post(Environment.getRestapiHost() + '/restapi/services/document/saved/export', {id: firstId}, { responseType: 'arraybuffer', params:{folder:$scope.selectedDirectory.name, zipPassword:$scope.zipPassword, zipFilename:$scope.zipFilename}})
      .then(function(data) {
        messageService.addSuccess('Download process started. Please check your download folder in a couple of minutes')();
      }, function (errResponse) {
          messageService.addError('Download failed')(errResponse);
    });
    $scope.zipPassword = '';
  };

  $scope.addItem  = function () {
    if(($scope.selectedDirectory.name)&&($scope.selectedDirectory.name.length > 0)){
      $scope.download();
    } else {
       messageService.addError('You need to select a directory to download.')();
    }
  };

    //Gets the directory names
    $scope.getDirectoryNames = function () {
        $scope.directoryOptions = [];
        $scope.loadingDirectories = true;
        communicationService.getDirectoryNames.get().$promise
                .then(function (results) {
                    $scope.exportPath = results.exportPath;
                    var folders = results.folders;
                    for (var i = 0; i < folders.length; i++) {
                        $scope.directoryOptions.push({name: folders[i]});
                    }
                    $scope.loadingDirectories = false;
                }, function (errResponse) {
                    messageService.addError('Get directory names failed.')(errResponse);
                }
                );
    };

    //API REQUEST METHODS//
    $scope.getExportPath = function(){
        $scope.loadingPath   = true;
        communicationService.getExportPath.get().$promise
            .then(function(results) {
                $scope.exportInfo["path"] = results.exportPath;
                $scope.exportPath = results.exportPath;
                $scope.loadingPath   = false;
            }, function (errResponse) {
                $scope.loadingPath   = false;
                messageService.addError('Get export paths failed.')(errResponse);                
            });
    };

  //Gets the directory names
  $scope.createNewDirectory = function(){
    communicationService.addDirectory.post($scope.newDirectoryName).$promise
      .then(function(res) {
          //Successfully created
          $scope.switchToSelectDirectoryMode();
          $scope.newDirectoryName     = '';
        }, function(errResponse) {
          messageService.addError('Create new directory failed.')(errResponse);            
        }
      );
  };

  //Switch the download modal to the new directory mode
  $scope.switchToNewDirectoryMode = function () {
    $scope.downloadModalTitle   = 'New Directory';
    $scope.downloadModalMessage = 'Type the new directory name';
    $scope.downloadModalMessage2 = '';     
    $scope.selectDirectoryMode  = false;
  };

  //Tries to add a new directory based on the newDirectoryName variable
  $scope.addDirectory = function () {
    if($scope.newDirectoryName === ''){
      messageService.addWarning('You need to type the new directory name')();
    }
    else{
      $scope.createNewDirectory();
    }
  };

  //Switch the download modal to the select directory mode
  $scope.switchToSelectDirectoryMode  = function () {
    $scope.downloadModalTitle   = 'Download';
    $scope.downloadModalMessage = 'Select the directory, filename and password you want to use for the export.';
    $scope.downloadModalMessage2 = 'When no value is chosen for filename, a standard value will be used.'; 
    $scope.getDirectoryNames();
    $scope.selectDirectoryMode  = true;
  };

  //Prepares the download modal before open it
  $scope.prepareDownloadModal = function () {
    $scope.getDirectoryNames();
      $scope.exportPath = "";
  };

    //Prepares the export modal before open it
    $scope.prepareExportModal = function () {
        $scope.getExportPath();
    };

  $scope.clearNamesToBeDeleted    = function(){
    $scope.namesToBeDeleted = '';
  };

  //If the controller is executed because the user is in the manageSearches page then gets the queries to populate the table
  if($route.current.activetab === 'manageSearches'){
    //Saved searches current page
    if($cookieStore.get('searchApp_ssCurrentPage') && ($cookieStore.get('searchApp_ssCurrentPage') !== '')){
      $scope.bigCurrentPage   = $cookieStore.get('searchApp_ssCurrentPage');
    }
    else{
      $cookieStore.put('searchApp_ssCurrentPage', 1);
    }
    $scope.getQueries();
  }

  $scope.setPage = function (pageNo) {
    $scope.bigCurrentPage = pageNo;
  };

  $scope.pageChanged = function() {
    $cookieStore.put('searchApp_ssCurrentPage', $scope.bigCurrentPage);
    $scope.tableData    = undefined;
    $scope.getQueries();
  };
  
  $scope.newExportFromSavedSearch = function() {
    var ssId = tableInteractionsService.getFirstCheckedId($scope.checkboxList)[0];
    $cookieStore.put('searchApp_currentExport', null);
    $cookieStore.put('searchApp_exportSavedSearchId', ssId);    
    $location.url('/exportDetails/SSEXP');
  };

});
