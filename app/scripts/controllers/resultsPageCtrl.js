'use strict';

searchApp.controller('resultsPageCtrl', function ($scope, $http, $filter, messageService, modelDomainService, savedSearchService, channelSelectionService, searchResultsService, communicationService, footerService, tableInteractionsService, Environment, ngAudio) {

  $scope.channelSS = channelSelectionService;
  $scope.channels = channelSelectionService.channels;  
  $scope.searchRS = searchResultsService;
  $scope.savedSS = savedSearchService;
  $scope.footerData = footerService; 
  $scope.modelDS = modelDomainService;
  $scope.ngAudio = ngAudio;
  
  //To pause the background sound when the user changes page in IE (https://searchtechnologies.atlassian.net/browse/HIT-163)
  $scope.$on('$routeChangeStart', function(next, current) {
    var bgsoundElems = document.getElementsByTagName('bgsound');
    for(var i = 0; i < bgsoundElems.length; i++){
      bgsoundElems[i].src = '';
    }
  });

  $scope.status           = false;
  
    /** NEW TABLE DATA **/
  $scope.tableData;
  $scope.discardedFields      = ['is-deleted', 'uri', 'retention-class', 'roomId', 'containsNote', 'tenant', 'hcp-system-name', 'participantsRaw'];
  $scope.sortableFields       = ['title', 'change-time', 'participants', 'legal-hold', 'call-duration', 'namespace'];
  $scope.rowAttributes        = 'data-toggle="modal" data-target="#resultModal" ';
  $scope.checkboxList         = {};
  $scope.addCheckbox          = true;
  $scope.checkboxAttributes   = 'ng-change="checkboxChange()"';
  $scope.rowIdentifier        = 'uri';
  $scope.specialFields        = ['namespace', 'status', 'legal-hold','has-attachment'];
  $scope.includeNotesLink     = true;
  $scope.dataMaxWidth         = true;

  $scope.allChecked           = false;
  $scope.btnDisabled          = true;
  $scope.returnVal            = 'title';    //Field that is going to be extracted from the selected documents to show before the status change
  $scope.subjectsToUpdate     = 'empty';
  $scope.selectedStatus       = '';
  /** END NEW TABLE DATA **/

  $scope.internalLoading      = false;        //Pagination change, download, change status, etc
  $scope.loading              = true;         //Page loading by default, when the results are retrieved the status change
  $scope.loadingMessage       = 'Loading...';

  //Download modal variables
  $scope.selectDirectoryMode  = true;         //Defines if the download modal is in select directory mode or not (new folder mode)
  $scope.newDirectoryName     = '';
  $scope.downloadModalTitle   = 'Download';
  $scope.downloadModalMessage = 'Select the directory, filename and password you want to use for the export.';
  $scope.downloadModalMessage2 = 'When no value is chosen for filename, a standard value will be used.';
  $scope.directoryOptions     = [];
  $scope.zipPassword          = '';
  $scope.downloadUri = null;
  $scope.attachmentUri = null;
  $scope.loadingDirectories   = false;
  
  var setSortDirection = function() {
      var components = channelSelectionService.channels.global.fields.sortBy.getValue().split(':');
      $scope.currentSortDirection = {};
      $scope.currentSortDirection[components[0]] = components[1];
  };
  setSortDirection();


  /**********************/
  /* ELEMENTS SELECTION */
  /**********************/
  $scope.selectAllEnabled     = false;
  $scope.checkedElements      = {};
  $scope.uncheckedElements    = {};
  
  //Clear the tracking lists (checked and unchecked elements)
  var clearTrackingLists  = function(){
    $scope.checkedElements      = {};
    $scope.uncheckedElements    = {};
    getActionButtonStatus();
  };  

  //When a checkbox status change, this method is triggered
    $scope.checkboxChange = function () {
        if ($scope.selectAllEnabled) {
            $scope.uncheckedElements = tableInteractionsService.getNewElements($scope.tableData, $scope.checkboxList, $scope.selectAllEnabled, 'uri', $scope.uncheckedElements);
        } else {
            $scope.checkedElements = tableInteractionsService.getNewElements($scope.tableData, $scope.checkboxList, $scope.selectAllEnabled, 'uri', $scope.checkedElements);
        }
        getActionButtonStatus();
    };
    

  //Updates the checkboxes in the current page using the checked or unchecked element lists
    var updateCheckboxes = function () {
        if ($scope.selectAllEnabled) {
            $scope.checkboxList = tableInteractionsService.getCurrentPageList($scope.tableData, $scope.selectAllEnabled, 'uri', $scope.uncheckedElements);
        } else {
            $scope.checkboxList = tableInteractionsService.getCurrentPageList($scope.tableData, $scope.selectAllEnabled, 'uri', $scope.checkedElements);
        }
        getActionButtonStatus();
    };

  //When the user click on the select page button
    $scope.selectPage = function () {
        $scope.checkboxList = tableInteractionsService.getElementsFromSelectPage($scope.tableData, $scope.checkboxList, 'uri');
        $scope.checkboxChange();
    };

    //When the user click on the select all button
    $scope.selectAll = function () {
        if ($scope.selectAllEnabled) {
            $scope.selectAllEnabled = false;
            clearTrackingLists();
            $scope.checkboxList = tableInteractionsService.getAllCheckedUnchecked($scope.tableData, $scope.checkboxList, 'uri', false);
        } else {
            $scope.selectAllEnabled = true;
            clearTrackingLists();
            $scope.checkboxList = tableInteractionsService.getAllCheckedUnchecked($scope.tableData, $scope.checkboxList, 'uri', true);
        }
    };

    //Sets the status of the btnDisabled variable. This will enable or disable the action buttons on the page
    var getActionButtonStatus = function () {
        if ($scope.selectAllEnabled) {
            $scope.btnDisabled = tableInteractionsService.getIsDisabled($scope.tableData, $scope.selectAllEnabled, $scope.uncheckedElements, searchResultsService.getCount(), 'uri');
        } else {
            $scope.btnDisabled = tableInteractionsService.getIsDisabled($scope.tableData, $scope.selectAllEnabled, $scope.checkedElements, searchResultsService.getCount(), 'uri');
        }
    };

  // Modal preparation
  $scope.prepareChangeStatus = function(){
    $scope.subjectsToUpdate         = 'Updating...';
    var searchCriteria              = searchResultsService.searchResultsService.prepareSearchCriteriaWithInfo().criteria;

    searchCriteria.page             = 1;
    searchCriteria.resultsPerPage   = 10000; //10000 is the HDDS limit?

    communicationService.getResultsWithAPI.post(searchCriteria).$promise
      .then(function(results) {
        if($scope.selectAllEnabled){
          $scope.subjectsToUpdate = tableInteractionsService.getElementsSelected(results.results, $scope.selectAllEnabled, $scope.uncheckedElements, 'uri', [$scope.returnVal]);
        }
        else{
          $scope.subjectsToUpdate = tableInteractionsService.getElementsSelected(results.results, $scope.selectAllEnabled, $scope.checkedElements, 'uri', [$scope.returnVal]);
        }
      }, function(errResponse){
          messageService.addError("Error getting custodians")(errResponse);
      });
  };

  /****************************/
  /* END - ELEMENTS SELECTION */
  /****************************/

  //TABLE RELATED METHODS//
  var resetTableData  = function(){
    $scope.tableData    = undefined;
    $scope.btnDisabled  = true;
    $scope.checkboxList = {};
    $scope.getResults();
  };
  
  var getSelectedDocuments = function() {
    var documents = [];
    if($scope.selectAllEnabled){
      for(var i = 0; i < Object.getOwnPropertyNames($scope.uncheckedElements).length; i++){
        documents.push({uri:(Object.getOwnPropertyNames($scope.uncheckedElements)[i])});
      }
    }
    else{
      for(var i = 0; i < Object.getOwnPropertyNames($scope.checkedElements).length; i++){
        documents.push({uri:Object.getOwnPropertyNames($scope.checkedElements)[i]});
      }
    }
    return documents;
  };

  $scope.changeStatus = function(){
    var searchCriteria  = searchResultsService.prepareSearchCriteriaWithInfo().criteria;
    var documents = getSelectedDocuments();

    communicationService.updateStatus.put({selectAll: $scope.selectAllEnabled, status: $scope.selectedStatus}, {criteria: searchCriteria, documents: documents}).$promise
        .then(function (results) {
            messageService.addSuccess('Status changed')();
            var tmpTable = $scope.tableData;
            var selectedUris = tableInteractionsService.getUrisArray(tableInteractionsService.getUrisToDelete($scope.checkboxList));

            for (var i = 0; i < $scope.tableData.length; i++) {
                if (selectedUris.indexOf($scope.tableData[i].uri) !== -1) { //Is in the list of selected uris
                    tmpTable[i].status = $scope.selectedStatus;
                }
            }
            $scope.allChecked = false;

        }, function (errResponse) {
            messageService.addError('Change status failed')(errResponse);
        }
        );
    };

  $scope.changeRetention = function(){
    var searchCriteria = searchResultsService.prepareSearchCriteriaWithInfo().criteria;
    var documents = getSelectedDocuments();
    
    communicationService.updateRetention.put({selectAll:$scope.selectAllEnabled, retention:$scope.selectedRetention}, {criteria:searchCriteria, documents: documents}).$promise
      .then(function(results) {
          messageService.addSuccess('egal Hold status changed. Changes to legal hold may take several minutes to sync up')();
            var tmpTable = $scope.tableData;
            if(results && results.length) {
              for (var i = 0; i < $scope.tableData.length; i++) {
                if (results.indexOf($scope.tableData[i].uri) !== -1 ||
                  results.indexOf($scope.tableData[i].uri.replace("+", "%2b").replace(" ", "%20")) !== -1) { //IsS in the list of selected uris
                  tmpTable[i]["legal-hold"] = $scope.selectedRetention;
                }
              }
            }
            $scope.allChecked   = false;
        }, function(errResponse) {
          messageService.addError('Change legal hold status failed')(errResponse);
        }
      );
  };

  $scope.toHHMMSS = function(secs) {
    var sec_num = parseInt(secs, 10);
    var hours   = Math.floor(sec_num / 3600) % 24;
    var minutes = Math.floor(sec_num / 60) % 60;
    var seconds = sec_num % 60;
    return [hours,minutes,seconds].map(function(v){
        return v < 10 ? "0" + v : v;
    }).filter(function(v,i) {
        return v !== "00" || i > 0;
    }).join(":");
  };

    $scope.getResults = function () {

        $scope.$emit("countStatusChange", false); //Hide the count section in the footer
        
        searchResultsService.getResults().then(function (results) {
            $scope.loading = false;
            $scope.tableData = results.results;
            footerService.setResultInfo(1, channelSelectionService.channels.global.fields.resultsPerPage.getValue(), searchResultsService.getCount());          
            angular.forEach(results.results, function (value) {
                var temp = value['change-time'];
                temp = $filter('date')(temp, 'yyyy-MM-dd HH:mm', 'UTC');
                value['change-time'] = temp + " UTC";
                var callDuration = value['call-duration'];
                value['call-duration'] = (callDuration === null || callDuration === 'N/A' ? 'N/A' : $scope.toHHMMSS(callDuration));
            });    
            if (searchResultsService.getCount() < 1) {
                $scope.noResultsMessage = 'No results';
                $scope.noResults = true;
            } else {
                $scope.noResultsMessage = '';
                $scope.noResults = false;
            }
            if ($scope.tableData) {
                updateCheckboxes();
            }
            $scope.loading = false;               
        }, function (errResponse) {
            if (errResponse.status === 400) {
                $scope.noResultsMessage = errResponse.data.message;
            } else if (errResponse.status === 413) {
                if (errResponse.data.size) {
                    $scope.noResultsMessage = "Query limit exceeded please reduce search size and re-try. Number of query clauses " + errResponse.data.size + ", number allowed 1001";
                } else {
                    $scope.noResultsMessage = "Query size exceeded, (1MB) please remove some filters from your query or flagging rule";
                }
            } else {
                $scope.noResultsMessage = 'No results. Search error';
            }
            $scope.loading = false;
        });
    };

  $scope.setSort = function(key, field) {
    var sortControl = channelSelectionService.channels.global.fields.sortBy;
    var lastSort = sortControl.getValue().split(':');
    if (lastSort[0] === field) {
        sortControl.setValue(field + (lastSort[1] === 'desc' ? ':asc' : ':desc'));
    } else {
        sortControl.setValue(field + ':desc');
    }
    setSortDirection();
  };

  //Move this to an independent js file - Can we do this using Angular?
  $scope.selectPageCheckboxes = function(){
    var count   = 0; //To count how many checkboxes are checked
    $('tbody tr td input[type="checkbox"]').each(function () {
      if(($(this)).is(':checked')){
        count=count+1;
      }
    });

    $('tbody tr td input[type="checkbox"]').each(function () {
      if(count > 0) {
        $(this).prop('checked', false);
      }
      else{
        $(this).prop('checked', true);
      }
    });
  };

    $scope.rowClick = function (rowId) {
        var rows = $filter('filter')($scope.tableData, {uri: rowId}, true);
        if (rows.length > 0) {
            $scope.$broadcast("documentMeta", rows[0].uri, rows[0].namespace, searchResultsService.getHighlights());
        }
    };

    $scope.addItem = function () {
        if ($scope.selectedDirectory && $scope.selectedDirectory.name && $scope.selectedDirectory.name.length > 0) {
            if ($scope.attachmentUri === null) {
                $scope.download($scope.downloadUri);
            } else {
                $scope.downloadAttachment();
            }
        } else {
            messageService.addWarning('You need to select a directory to download',{groups: ['download']})();
        }
    };

    $scope.downloadAttachment = function () {

        $http.post(Environment.getRestapiHost() + '/restapi/services/document/attachment', {filename: $scope.attachmentUri.filename, path: $scope.attachmentUri.path}, {responseType: 'arraybuffer', params: {uri: $scope.attachmentUri.currentURI, contentSource: $scope.attachmentUri.currentContentSource, folder: $scope.selectedDirectory.name, zipPassword: $scope.zipPassword, zipFilename: $scope.zipFilename}})
                .then(function (data) {
                    messageService.addSuccess('Download process started. Please check your download folder in a couple of minutes')();
                }, function (data) {
                    messageService.addError('Download attachment failed')(data);
        }
        );
        $scope.attachmentUri = null;
    };

  // Download results
  $scope.download = function(jsonData){

    var searchCriteria  = searchResultsService.prepareSearchCriteriaWithInfo().criteria;
    var documents = [];

    if($scope.selectAllEnabled){
      if (jsonData === null) {
        jsonData = Object.getOwnPropertyNames($scope.uncheckedElements);
      }
      for(var i = 0; i < jsonData.length; i++){
        documents.push(tableInteractionsService.getFullDocument($scope.tableData, jsonData[i]));
      }
    }
    else{
      if (jsonData === null) {
        jsonData = Object.getOwnPropertyNames($scope.checkedElements);
      }
      for(var i = 0; i < jsonData.length; i++){
        documents.push(tableInteractionsService.getFullDocument($scope.tableData, jsonData[i]));
      }
    }

    $scope.downloadUri = null;

    $http.post(Environment.getRestapiHost() + '/restapi/services/document/export', {criteria:searchCriteria, documents: documents}, {params:{selectAll:$scope.selectAllEnabled, folder:$scope.selectedDirectory.name, zipPassword:$scope.zipPassword, zipFilename:$scope.zipFilename}})
      .then(function(res) {
        messageService.addSuccess('Download process started. Please check your download folder in a couple of minutes')();          
      }, function (data) {
        messageService.addError('Download failed')(data);          
      }
    );
  };

  $scope.$on('simpleDownload', function (event, currentUri) {
    $scope.prepareDownloadModal();
    $scope.dismiss();
    $scope.downloadUri = [currentUri];
    $scope.exportPath = "";
  });

  $scope.$on('attachmentDownload', function (event, attachmentInfo) {
    $scope.prepareDownloadModal();
    $scope.dismiss();
    $scope.attachmentUri = attachmentInfo;
  });

  // Add new collection
  $scope.addCollection = function(){

    var searchCriteria  = searchResultsService.prepareSearchCriteriaWithInfo().criteria;

    var contentObject   = {};
    contentObject.name  = $scope.collectionName;
    contentObject.notes = $scope.collectionNotes;
    contentObject.documents = [];

    if($scope.selectAllEnabled){
      for(var i = 0; i < Object.getOwnPropertyNames($scope.uncheckedElements).length; i++){
        contentObject.documents.push({uri:(Object.getOwnPropertyNames($scope.uncheckedElements)[i])});
      }
    }
    else{
      for(var i = 0; i < Object.getOwnPropertyNames($scope.checkedElements).length; i++){
        contentObject.documents.push({uri:Object.getOwnPropertyNames($scope.checkedElements)[i], namespace:tableInteractionsService.getContentSourceFromUri($scope.tableData, Object.getOwnPropertyNames($scope.checkedElements)[i])});
      }
    }

    communicationService.addCollection.post({selectAll:$scope.selectAllEnabled}, {criteria:searchCriteria, collection:contentObject}).$promise
      .then(function(results) {
          messageService.addSuccess('Collection saved')();          
          $scope.loading = false;
          $scope.responseStatus   = 'Collection added successfully';
          $scope.$emit("addCollection", $scope.responseStatus); //Emit dispatches an event traversing upwards toward the root scope
        }, function(errResponse) {
          messageService.addError('Add collection failed')(errResponse);          
          $scope.loading = false;
          $scope.responseStatus   = 'Add collection failed';
          $scope.$emit("addCollection", $scope.responseStatus); //Emit dispatches an event traversing upwards toward the root scope
        }
      );
  };

  //Gets the directory names
  $scope.getDirectoryNames = function(){
    $scope.directoryOptions = [];
    $scope.loadingDirectories = true;
    communicationService.getDirectoryNames.get().$promise
      .then(function(results) {
          $scope.exportPath = results.exportPath;
          var folders = results.folders;
          for(var i = 0; i < folders.length; i++){
            $scope.directoryOptions.push({name:folders[i]});
          }
          $scope.loadingDirectories = false;
        }, function(errResponse) {
          messageService.addError('Get directory names failed',{groups: ['download']})(errResponse);          
        }
      );
  };

  $scope.createNewDirectory = function(){
    communicationService.addDirectory.post($scope.newDirectoryName).$promise
      .then(function(res) {
          $scope.switchToSelectDirectoryMode();
          $scope.newDirectoryName     = '';
        }, function(errResponse) {
          messageService.addError('Create new directory failed', {groups: ['download']})(errResponse);          
        }
      );
  };

  //Switch the download modal to the new directory mode
  $scope.switchToNewDirectoryMode = function () {
    $scope.downloadModalTitle   = 'New Directory';
    $scope.downloadModalMessage = 'Type the new directory name';
    $scope.downloadModalMessage2 = '';
    $scope.selectDirectoryMode  = false;
    console.log('select directory mode changed');
  };

  //Tries to add a new directory based on the newDirectoryName variable
  $scope.addDirectory = function () {
    if($scope.newDirectoryName === ''){
      messageService.addWarning('You need to type the new directory name', {groups: ['download']})();                  
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

  $scope.noteClick = function(selectedDocument){
    $scope.$broadcast('noteClick', selectedDocument);
  };

    //Change the containsNote status when a note is added
    $scope.$on('noteAdded', function (event, addedDocument) {
        var found = false;
        for (var i = 0; (i < $scope.tableData.length) && (!found); i++) {
            if ($scope.tableData[i].uri === addedDocument) {
                $scope.tableData[i].containsNote = '1';
                found = true;
            }
        }
    });

  //Change the status
    $scope.$on('statusChanged', function (event, addedDocument) {
        var found = false;
        for (var i = 0; (i < $scope.tableData.length) && (!found); i++) {
            if ($scope.tableData[i].uri === addedDocument) {
                $scope.tableData[i].containsNote = '1';
                found = true;
            }
        }
    });
    
    $scope.$watch(function() {
        return {
            criteria: searchResultsService.prepareSearchCriteriaWithInfo()
        };
    }, function(newItem, oldItem) {
        resetTableData();
    }, true);    

});