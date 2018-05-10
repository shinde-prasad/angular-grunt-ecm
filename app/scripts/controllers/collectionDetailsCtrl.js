'use strict';

/*** Controller for Help Page ***/

searchApp.controller('collectionDetailsCtrl', function ($scope, $location, $cookieStore, $http, $timeout, $filter, footerService, messageService, communicationService, tableInteractionsService, Environment) {

  //List of fields necessary to generate the table
  $scope.tableData;                                               //Field necessary to create the table
  $scope.includeNotesLink = true;
  $scope.discardedFields  = ['uri', 'retention-class', 'roomId', 'containsNote', 'tenant', 'hcp-system-name', 'participantsRaw'];                              //Fields that are not going to be included in the table
  $scope.rowAttributes    = 'style="cursor: pointer" data-toggle="modal" data-target="#resultModal" ';                                   //Parameters that will be used in the rowClick method
  $scope.checkboxList     = {};                                   //Parameters that will be used in the rowClick method
  $scope.addCheckbox      = true;                                 //Parameters that will be used in the rowClick method
  $scope.checkboxAttributes   = 'ng-change="checkboxChange()"';   //Parameters that will be used in the rowClick method
  $scope.rowIdentifier    = 'uri';                                 //Parameters that will be used in the rowClick method
  $scope.iconFields       = [];
  $scope.specialFields    = ['namespace', 'status', 'legal-hold','has-attachment'];
  $scope.sortableFields   = ['title', 'change-time', 'participants', 'legal-hold', 'call-duration', 'namespace'];  
  $scope.allChecked       = false;

  //Pagination variables. Required for the pagination plugin (angular-ui)
  $scope.itemsPerPage     = $cookieStore.get("pageSizeCollectionDetails") ? $cookieStore.get("pageSizeCollectionDetails") : 50;
  $scope.maxSize          = 3;
  $scope.bigCurrentPage   = 1;
  $scope.dataMaxWidth     = true;
  $cookieStore.put('searchApp_ssCurrentPage',$scope.bigCurrentPage);
  $scope.itemsPerPageOptions    = [10, 20, 30, 40, 50];

  //Delete modal variables. Check scripts/directives/deleteModal.js for documentation
  $scope.deleteModalTitle = 'Delete Documents';
  $scope.deleteMessage1 = 'WARNING: You are about to delete';
  $scope.deleteMessage2 = 'collection documents!';
  $scope.namesToBeDeleted = '';

  $scope.deleteDetailModalTitle = 'Delete collection';
  $scope.deleteDetailMessage = 'collection';
  $scope.deteteDetailName = '';
  $scope.returnVal = 'title'; // name of the field which should be returned in getNamesToDelete method
  //End - Delete modal variables

  $scope.btnDisabled = true;
  $scope.collectionName;
  $scope.editMode = false;
  $scope.readMode = true;

  //Download modal variables
  $scope.selectDirectoryMode  = true;         //Defines if the download modal is in select directory mode or not (new folder mode)
  $scope.newDirectoryName     = '';
  $scope.downloadModalTitle   = 'Download';
  $scope.downloadModalMessage = 'Select the directory, filename and password you want to use for the export.';
  $scope.downloadModalMessage2 = 'When no value is chosen for filename, a standard value will be used.'; 
  $scope.directoryOptions     = [];
  $scope.selectedDirectory    = {};
  $scope.zipPassword          = '';
  $scope.downloadUri = null;
  $scope.attachmentUri = null;
  $scope.loadingDirectories   = false;

  /**********************/
  /* ELEMENTS SELECTION */
  /**********************/
  $scope.selectAllEnabled     = false;
  $scope.checkedElements      = {};
  $scope.uncheckedElements    = {};

  //When a checkbox status change, this method is triggered
  $scope.checkboxChange   = function(){
    if($scope.selectAllEnabled){
      $scope.uncheckedElements      = tableInteractionsService.getNewElements($scope.tableData, $scope.checkboxList, $scope.selectAllEnabled, 'uri', $scope.uncheckedElements);
    }
    else{
      $scope.checkedElements    = tableInteractionsService.getNewElements($scope.tableData, $scope.checkboxList, $scope.selectAllEnabled, 'uri', $scope.checkedElements);
    }
    getActionButtonStatus();
  };

  //Updates the checkboxes in the current page using the checked or unchecked element lists
  var updateCheckboxes = function () {
    if($scope.selectAllEnabled){
      $scope.checkboxList = tableInteractionsService.getCurrentPageList($scope.tableData, $scope.selectAllEnabled, 'uri', $scope.uncheckedElements);
    }
    else{
      $scope.checkboxList = tableInteractionsService.getCurrentPageList($scope.tableData, $scope.selectAllEnabled, 'uri', $scope.checkedElements);
    }
    getActionButtonStatus();
  };

  //When the user click on the select page button
  $scope.selectPage    = function () {
    $scope.checkboxList = tableInteractionsService.getElementsFromSelectPage($scope.tableData, $scope.checkboxList, 'uri');
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
      $scope.checkboxList = tableInteractionsService.getAllCheckedUnchecked($scope.tableData, $scope.checkboxList, 'uri', false);
    }
    else{
      $scope.selectAllEnabled = true;
      clearTrackingLists();
      $scope.checkboxList = tableInteractionsService.getAllCheckedUnchecked($scope.tableData, $scope.checkboxList, 'uri', true);
    }
  };

  //Sets the status of the btnDisabled variable. This will enable or disable the action buttons on the page
  var getActionButtonStatus   = function(){
    if($scope.selectAllEnabled){
      $scope.btnDisabled  = tableInteractionsService.getIsDisabled($scope.tableData, $scope.selectAllEnabled, $scope.uncheckedElements, footerService.getResultInfo().resultsCount, 'uri');
    }
    else{
      $scope.btnDisabled  = tableInteractionsService.getIsDisabled($scope.tableData, $scope.selectAllEnabled, $scope.checkedElements, footerService.getResultInfo().resultsCount, 'uri');
    }
  };

    $scope.updatePageSize   = function() {
        $cookieStore.put("pageSizeCollectionDetails", $scope.itemsPerPage);
        $scope.tableData        = undefined;
        $scope.getCollectionDocuments();

    };

  // Modal preparation
  $scope.prepareModal = function(){
    $scope.getAllDocuments();
  };

  //Gets all the users
  $scope.getAllDocuments  = function(){
    communicationService.getCollectionDocuments.get({id:$cookieStore.get('searchApp_currentCollection'), page:1, resultsPerPage:10000}).$promise //10000 is the limit?
      .then(function(results){
        if($scope.selectAllEnabled){
          $scope.namesToBeDeleted = tableInteractionsService.getElementsSelected(results.documents, $scope.selectAllEnabled, $scope.uncheckedElements, 'uri', [$scope.returnVal]);
          $scope.countDeletedItems= tableInteractionsService.getCountElementsSelected(results.documents, $scope.selectAllEnabled, $scope.uncheckedElements, 'uri');
        }
        else{
          $scope.namesToBeDeleted = tableInteractionsService.getElementsSelected(results.documents, $scope.selectAllEnabled, $scope.checkedElements, 'uri', [$scope.returnVal]);
          $scope.countDeletedItems= tableInteractionsService.getCountElementsSelected(results.documents, $scope.selectAllEnabled, $scope.checkedElements, 'uri');
        }
      }, function(errResponse){
        messageService.addError('Error getting documents.')(errResponse);
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
    $scope.getCollectionDocuments();
    //End of table reload

    //Clear the name and description
    $scope.newName          = '';
    $scope.newDescription   = '';

    $scope.allChecked       = false;
  };

  //Executed when the select page button is clicked in the manage searches page
  $scope.selectPage     = function () {
    if($scope.allChecked){
      //uncheck all
      $scope.checkUncheckAll(false);   //With true check all
      $scope.allChecked   = false;
    }
    else{
      //check all
      $scope.checkUncheckAll(true);   //With false uncheck all
      $scope.allChecked   = true;
    }
    $scope.checkboxChange();
  };

  //Checks or unchecks all checkboxes
  $scope.checkUncheckAll  = function(isCheckAll){
    var urisList = tableInteractionsService.getAllUrisInTableData($scope.tableData);
    for(var i = 0; i < urisList.length; i++){
      if(isCheckAll){
        $scope.checkboxList[urisList[i]] = true;
      }
      else{
        $scope.checkboxList[urisList[i]] = false;
      }
    }
  };

  $scope.setPage = function (pageNo) {
    $scope.bigCurrentPage = pageNo;
  };

  $scope.pageChanged = function() {
    $cookieStore.put('searchApp_ssCurrentPage', $scope.bigCurrentPage);
    resetTableData();
    //$route.reload();
  };
  //END - PAGINATION METHODS


  // Remove unnercessary info fields
  var removeUnnecessaryInfoFields = function(){
    delete $scope.collectionInfo["id"];
    delete $scope.collectionInfo["groupId"];
    delete $scope.collectionInfo["documents"];
  };

  //Get the collection information
  $scope.getCollectionInfo  = function(){
    communicationService.getCollectionInfo.get({id:$cookieStore.get('searchApp_currentCollection')}).$promise
      .then(function(results){
        $scope.collectionName   = results["name"];  //Extracting the name to set the page title
        $scope.deleteDetailName = results["name"]; //Value for name of delete item
        $scope.collectionInfo   = results;

        //Date formatting
        if(results.createdDate){
          //$scope.collectionInfo.createdDate  = $filter('date')(new Date(results.createdDate.replace(" ","T") + "Z"), 'yyyy-MM-dd HH:mm');
          var a   = results.createdDate.split(" ");
          var d   = a[0].split("-");
          var t   = a[1].split(":");
          var formattedDate = new Date(d[0],(d[1]-1),d[2],t[0],t[1]);
          $scope.collectionInfo.createdDate   = $filter('date')(formattedDate, 'yyyy-MM-dd HH:mm');
        }

        removeUnnecessaryInfoFields();
        //Get the terms of the keyword to populate the table
        $scope.getCollectionDocuments();
      }, function(errResponse){
        messageService.addError('Error getting collection info.')(errResponse);
      });
  };

  $scope.toHHMMSS = function(secs) {
    var sec_num = parseInt(secs, 10);
    var hours   = Math.floor(sec_num / 3600) % 24;
    var minutes = Math.floor(sec_num / 60) % 60;
    var seconds = sec_num % 60;
    return [hours,minutes,seconds].map(function(v){return v < 10 ? "0" + v : v; }).filter(function(v,i) { return v !== "00" || i > 0; }).join(":");
  };


  // Get documents from collection
  $scope.getCollectionDocuments  = function(){
    communicationService.getCollectionDocuments.get({id:$cookieStore.get('searchApp_currentCollection'), page:$scope.bigCurrentPage, resultsPerPage:$scope.itemsPerPage}).$promise
      .then(function(results){

            angular.forEach(results.documents, function(value) {
                var temp = value['change-time'];
                temp = $filter('date')(temp, 'yyyy-MM-dd HH:mm');
                value['change-time'] =temp;
                var callDuration = value['call-duration'];
                value['call-duration'] = (callDuration === null || callDuration === 'N/A' ? 'N/A' : $scope.toHHMMSS(callDuration));
            });

        $scope.tableData = results.documents;
        footerService.setResultInfo($scope.bigCurrentPage, $scope.itemsPerPage, results.count);
        if($scope.tableData){
          updateCheckboxes();
        }
      }, function(errResponse){
        messageService.addError('Error getting collection documents.')(errResponse);
      });
  };


  //Delete a list of documents
  $scope.delete       = function(){
    $http({headers: {
      'Authorization': $cookieStore.get("searchApp_token"),
      "Content-Type":"application/json"},
      url: Environment.getRestapiHost() + '/restapi/services/collection/'+$cookieStore.get('searchApp_currentCollection')+'/document',
      method: 'DELETE',
      data: tableInteractionsService.getUrisToDelete($scope.checkboxList)
    }).then(function(res) {
      messageService.addSuccess('Documents deleted')();
      $scope.namesToBeDeleted = ''; //Clears the names of the deleted elements
      resetTableData();
        clearTrackingLists();
    }, function(errResponse) {
      messageService.addError('Documents delete error.')(errResponse);
    });
  };
  //END - API REQUEST METHODS

  // DELETE PAGE
  $scope.pageDelete = function(){
    $http({headers:{
      'Authorization': $cookieStore.get("searchApp_token"),
      "Content-Type":"application/json"},
      url: Environment.getRestapiHost() + '/restapi/services/collection',
      method: 'DELETE',
      data: [{id:$cookieStore.get('searchApp_currentCollection')}]
    }).then(function(res) {
      resetTableData();
        $timeout(function(){$location.path('/manageCollections');}, 250);
    }, function(errResponse) {
      messageService.addSuccess('Collection delete error.')(errResponse);
    });

  };

  // EDIT INFO
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

  // SAVE EDITED INFO
  $scope.saveName     = function(){
    var contentObject               = {};

    if($scope.collectionInfo["name"].trim() !== ""){
      if($scope.collectionInfo["notes"].trim() !== ""){
        contentObject.name              = $scope.collectionInfo["name"];
        contentObject.notes              = $scope.collectionInfo["notes"];
        contentObject.ownerId              = $scope.collectionInfo["ownerId"];

      }
      else{
        messageService.addSuccess('Collection notes cannot be empty')();
        return;
      }
    }
    else{
      messageService.addError('Collection name cannot be empty')();
      return;
    }

    communicationService.updateCollection.put({id:$cookieStore.get('searchApp_currentCollection')}, contentObject).$promise
      .then(function(results) {
        messageService.addSuccess('Collection updated')();
        $scope.editToggle();
      }, function(errResponse) {
        messageService.addError('Collection update error.')(errResponse);
      });

  };

  $scope.downloadAttachment = function(){

    $http.post(Environment.getRestapiHost() + '/restapi/services/document/attachment', {filename:$scope.attachmentUri.filename, path:$scope.attachmentUri.path}, {responseType: 'arraybuffer', params:{uri:$scope.attachmentUri.currentURI, contentSource:$scope.attachmentUri.currentContentSource, folder:$scope.selectedDirectory.name}})
      .then(function(data) {
        messageService.addSuccess('Download process started. Please check your download folder in a couple of minutes')();
      }, function (errResponse) {
        messageService.addError('Download attachment failed.')(errResponse);
      }
    );
    $scope.attachmentUri = null;
  };

  // Download results
  $scope.download = function(jsonData){
    if (jsonData === null) {
      jsonData = tableInteractionsService.getUrisToDelete($scope.checkboxList);
    }
    var documentsList   = [];
    for(var i = 0; i < jsonData.length; i++){
      documentsList.push(tableInteractionsService.getFullDocument($scope.tableData, jsonData[i].uri));
    }
    $scope.downloadUri = null;
    $http.post(Environment.getRestapiHost() + '/restapi/services/document/export', {documents:documentsList}, { params:{selectAll:false, folder:$scope.selectedDirectory.name, zipPassword:$scope.zipPassword} })
      .then(function(response) {
        messageService.addSuccess('Download process started. Please check your download folder in a couple of minutes')();
      }, function (errResponse) {
      messageService.addError('Documents download error.')(errResponse);
    });
    $scope.zipPassword = '';
  };

  $scope.$on('simpleDownload', function (event, currentUri) {
    $scope.prepareDownloadModal();
    $scope.dismiss();
    $scope.downloadUri = [{uri:currentUri}];
  });

  $scope.$on('attachmentDownload', function (event, attachmentInfo) {
    $scope.prepareDownloadModal();
    $scope.dismiss();
    $scope.attachmentUri = attachmentInfo;
  });

  //ON PAGE LOAD
  //Check if the page was stored in a cookie
  if($cookieStore.get('searchApp_ssCurrentPage') && ($cookieStore.get('searchApp_ssCurrentPage') != '')){
    $scope.bigCurrentPage   = $cookieStore.get('searchApp_ssCurrentPage');
  }
  else{
    //If the page was not stored, then load the table from the first page
    $cookieStore.put('searchApp_ssCurrentPage', 1);
  }

  $scope.getCollectionInfo();


  /************/
  /* DOWNLOAD */
  /************/

  $scope.addItem  = function () {
    if(($scope.selectedDirectory.name)&&($scope.selectedDirectory.name.length > 0)){
      if ($scope.attachmentUri === null) {
        $scope.download($scope.downloadUri);
      }
      else{
        $scope.downloadAttachment();
      }
    }
    else{
      messageService.addError('You need to select a directory to download')();
    }
  };

  //Gets the directory names
  $scope.getDirectoryNames = function(){
    $scope.directoryOptions = [];
    $scope.loadingDirectories   = true;
    communicationService.getDirectoryNames.get().$promise
      .then(function(results) {
            $scope.exportPath  = results.exportPath;
          var folders = results.folders;
          for(var i = 0; i < folders.length; i++){
            $scope.directoryOptions.push({name:folders[i]});
          }
          $scope.loadingDirectories   = false;
        }, function(errResponse) {
          messageService.addError('Get directory names failed.')(errResponse);
        }
      );
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
      messageService.addSuccess('You need to type the new directory name')();
    }
    else{
      //Add a new directory
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

  /******************/
  /* END - DOWNLOAD */
  /******************/

  $scope.rowClick = function (rowId) {
        var rows = $filter('filter')($scope.tableData, {id: parseInt(rowId)}, true);
        if (rows.length > 0) {
            $scope.$broadcast("myEvent", rows[0].uri, rows[0].contentSource, []);
        }
  };

  // Modal preparation
  $scope.prepareChangeStatus = function(){
    $scope.getAllResults();
  };

  //Gets all the users
  $scope.getAllResults    = function(){
    $scope.subjectsToUpdate         = 'Updating...';

    communicationService.getCollectionDocuments.get({id:$cookieStore.get('searchApp_currentCollection'), page:1, resultsPerPage:10000}).$promise //10000 is the limit?
      .then(function(results) {
        if($scope.selectAllEnabled){
          $scope.subjectsToUpdate = tableInteractionsService.getElementsSelected(results.documents, $scope.selectAllEnabled, $scope.uncheckedElements, 'uri', [$scope.returnVal]);
        }
        else{
          $scope.subjectsToUpdate = tableInteractionsService.getElementsSelected(results.documents, $scope.selectAllEnabled, $scope.checkedElements, 'uri', [$scope.returnVal]);
        }
      }, function(errResponse){
        messageService.addError('Error getting custodians.')(errResponse);
      });
  };

  $scope.changeStatus = function(){

    var contentObject               = {};
    contentObject.documents = [];

    if($scope.selectAllEnabled){
      for(var i = 0; i < Object.getOwnPropertyNames($scope.uncheckedElements).length; i++){
        contentObject.documents.push({uri:(Object.getOwnPropertyNames($scope.uncheckedElements)[i])});
      }
    }
    else{
      for(var i = 0; i < Object.getOwnPropertyNames($scope.checkedElements).length; i++){
        contentObject.documents.push({uri:Object.getOwnPropertyNames($scope.checkedElements)[i]});
      }
    }

    communicationService.updateStatus.put({selectAll:$scope.selectAllEnabled, status:$scope.selectedStatus}, {documents:contentObject.documents}).$promise
      .then(function(results) {
          messageService.addSuccess('Status changed')();
          $scope.changeStatusInTable();
        }, function(errResponse) {
          messageService.addSuccess('Change status failed.')(errResponse);
        }
      );
  };


  //Change the status of the table locally (no API calls)
  $scope.changeStatusInTable  = function(){
    var tmpTable        = $scope.tableData;
    var selectedUris    = tableInteractionsService.getUrisArray(tableInteractionsService.getUrisToDelete($scope.checkboxList));

    for(var i = 0; i < $scope.tableData.length; i++){
      if(selectedUris.indexOf($scope.tableData[i].uri) !== -1){ //Is in the list of selected uris
        tmpTable[i].status  = $scope.selectedStatus;
      }
    }

    $scope.allChecked   = false;
    //resetTableData();
  };

  //Change the status of the table locally (no API calls)
  $scope.changeRetentionInTable  = function(){
    var tmpTable        = $scope.tableData;
    var selectedUris    = tableInteractionsService.getUrisArray(tableInteractionsService.getUrisToDelete($scope.checkboxList));

    for(var i = 0; i < $scope.tableData.length; i++){
      if(selectedUris.indexOf($scope.tableData[i].uri) !== -1){ //Is in the list of selected uris
        tmpTable[i]["legal-hold"]  = $scope.selectedRetention;
      }
    }

    $scope.allChecked   = false;
  };

  $scope.changeRetention = function(){

    var contentObject               = {};
    contentObject.documents = [];

    if($scope.selectAllEnabled){
      for(var i = 0; i < Object.getOwnPropertyNames($scope.uncheckedElements).length; i++){
        contentObject.documents.push({uri:(Object.getOwnPropertyNames($scope.uncheckedElements)[i])});
      }
    }
    else{
      for(var i = 0; i < Object.getOwnPropertyNames($scope.checkedElements).length; i++){
        contentObject.documents.push({uri:Object.getOwnPropertyNames($scope.checkedElements)[i]});
      }
    }

    communicationService.updateRetention.put({selectAll:$scope.selectAllEnabled, retention:$scope.selectedRetention}, {documents:contentObject.documents}).$promise
      .then(function(results) {
          messageService.addSuccess('Legal Hold status changed. Changes to legal hold may take several minutes to sync up')();
          $scope.changeRetentionInTable();
        }, function(errResponse) {
          messageService.addError('Change legal hold status failed.')(errResponse);
        }
      );
  };


  $scope.noteClick    = function(selectedDocument){
    $scope.$broadcast('noteClick', selectedDocument);
  };

  //Change the containsNote status when a note is added
  $scope.$on('noteAdded', function (event, addedDocument) {
    var found   = false;
    for(var i = 0; (i < $scope.tableData.length)&&(!found); i++){
      if($scope.tableData[i].uri === addedDocument){
        $scope.tableData[i].containsNote    = '1';
        found   = true;
      }
    }
  });

  //Change the status
  $scope.$on('statusChanged', function (event, addedDocument) {
    var found   = false;
    for(var i = 0; (i < $scope.tableData.length)&&(!found); i++){
      if($scope.tableData[i].uri === addedDocument){
        $scope.tableData[i].containsNote    = '1';
        found   = true;
      }
    }
  });
});