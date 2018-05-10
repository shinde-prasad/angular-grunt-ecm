
'use strict';

searchApp.controller('manageUsersCtrl', function ($scope, $http, $cookieStore, $location, $route, $timeout, messageService, communicationService, footerService, tableInteractionsService, loginService, Upload, Environment) {

  $scope.titlePage = "User Directory";

  //Table related fields. Check scripts/directives/tableGenerator.js for documentation
  $scope.tableData;
  $scope.discardedFields      = ['id', 'lastModifiedBy', 'lastModifiedByID', 'ownerID', 'owner', 'timestamp', 'identifiers','reason','email','startdate','dateAddedToGroup','notes' ];
  $scope.rowAttributes        = 'style="cursor: pointer;" ';
  $scope.checkboxList         = {};
  $scope.addCheckbox          = true;
  $scope.checkboxAttributes   = 'ng-change="checkboxChange()"';
  $scope.rowIdentifier        = 'id';
  $scope.specialFields        = ['lastUpdate'];
  $scope.sortableFields       = [];
  $scope.noResults            = false;
  $scope.noResultsMessage     = "";
  //End - Table related fields

  //Pagination variables. Required for the pagination plugin (angular-ui)
  $scope.itemsPerPage     = $cookieStore.get("pageSizeUserManagement") ? $cookieStore.get("pageSizeUserManagement") : 50;
  $scope.maxSize          = 4;
  $scope.currentPage      = 1;
  $scope.itemsPerPageOptions    = [10, 20, 30, 40, 50];

    //End - Pagination variables

  //Delete modal variables. Check scripts/directives/deleteModal.js for documentation
  $scope.deleteModalTitle = 'Delete Users';
  $scope.countDeletedItems = '';
  $scope.deleteMessage1 = 'WARNING: You are about to delete';
  $scope.deleteMessage2 = 'users!';
  $scope.namesToBeDeleted = '';
  $scope.returnVal = ''; // name of th field which should be returned in getNamesToDelete method
  //End - Delete modal variables

  //Add new modal variables.
  $scope.addNewModalTitle = 'Add new user';
  $scope.addNewMessage    = 'Enter the user information';
  $scope.newFirstName;
  $scope.newLastName;
  $scope.newEmail;
  $scope.newDepartment;
  $scope.newCountry;
  $scope.newJob;
  $scope.newEmployeeId;
  //End - Add new modal variables

  //Enable or disable the delete button
  $scope.btnDisabled = true;

  $scope.keywords = "";

  /**********************/
  /* ELEMENTS SELECTION */
  /**********************/
  $scope.selectAllEnabled     = false;
  $scope.checkedElements      = {};
  $scope.uncheckedElements    = {};
  $scope.sortBy               = "";
  $scope.sortableFields       = ['department','country','lastUpdate'];
  $scope.currentSortDirection = {};


  //Filter bar
  $scope.currentCountryValue    = [];
  $scope.currentDeparmentValue  = [];
  $scope.departmentList         = [];
  $scope.countryList            = [];
  $scope.filterDropdownSettings       = {idProp: 'label',smartButtonMaxItems: 2,searchField: 'label',enableSearch:true,scrollableHeight: '300px',scrollable:true};

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

   $scope.updatePageSize   = function() {
       $cookieStore.put("pageSizeUserManagement", $scope.itemsPerPage);
       $scope.getUsers();
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

  //Apply filters
  $scope.filter   = function(){
    $scope.getUsers();
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
    $scope.getUsers();
  };

  // Modal preparation
  $scope.prepareModal = function(){
    $scope.getAllCustodians();
  };

  //Gets all the users
  $scope.getAllCustodians = function(){
    communicationService.getUsers.get({page:1, resultsPerPage:10000}).$promise //10000 is the limit?
      .then(function(results){
        if($scope.selectAllEnabled){
          $scope.namesToBeDeleted = tableInteractionsService.getElementsSelected(results.participants, $scope.selectAllEnabled, $scope.uncheckedElements, 'id', ['firstName', 'lastName']);
          $scope.countDeletedItems= tableInteractionsService.getCountElementsSelected(results.participants, $scope.selectAllEnabled, $scope.uncheckedElements, 'id');
        }
        else{
          $scope.namesToBeDeleted = tableInteractionsService.getElementsSelected(results.participants, $scope.selectAllEnabled, $scope.checkedElements, 'id', ['firstName', 'lastName']);
          $scope.countDeletedItems= tableInteractionsService.getCountElementsSelected(results.participants, $scope.selectAllEnabled, $scope.checkedElements, 'id');
        }
      }, function(errResponse){
        messageService.addError('Error getting custodians.')(errResponse);
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
    $scope.getUsers();
    //End of table reload

    //Clear the name and description
    $scope.newFirstName     = '';
    $scope.newLastName      = '';
    $scope.newEmail         = '';
    $scope.newDepartment    = '';
    $scope.newCountry       = '';
    $scope.newJob           = '';
    $scope.newEmployeeId    = '';
    $scope.allChecked       = false;
  };

  //When the user click on a row
  //manageUsersCtrl
  $scope.rowClick = function(userId){
    //To be implemented - Work in progress...
    communicationService.filterGroup = 0;
    $scope.filterGroupFlag = communicationService;
    $cookieStore.put('searchApp_currentUser', userId);
    $location.url('/userDetails');

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
  //END - TABLE RELATED METHODS//


  $scope.setPage = function (pageNo) {
    $scope.currentPage = pageNo;
  };

  $scope.pageChanged = function(value) {
    if($scope.currentPage !== parseInt($location.search.page)) {
      $location.search('page',$scope.currentPage);
      $location.search('total',footerService.getResultInfo().resultsCount);
      resetTableData();
    }
  };
  //END - PAGINATION METHODS


  // API REQUEST METHODS//

  //Get all the countries and departments in order to populate the filters
  $scope.getFilters = function(){
    communicationService.getFilters.get().$promise.then(function (filters){
      if(filters.countries && filters.countries.length > 0){
        $scope.countryList = filters.countries;
      }
      if(filters.departments && filters.departments.length > 0){
        $scope.departmentList = filters.departments;
      }
    },function(errResponse){
        messageService.addError('Error getting filters values for Country and departments.')(errResponse);
    });
  };


  // Get all the users to populate the table
  $scope.getUsers = function(){
    $scope.tableData        = undefined;
    $scope.noResults        = false;
    var params = {page:$scope.currentPage, resultsPerPage:$scope.itemsPerPage, keywords:$scope.keywords};

    if($scope.currentCountryValue.length > 0){
      params.country = "";
      for(var c=0;c < $scope.currentCountryValue.length; c++){
        if(c > 0){
          params.country += ",";
        }
        params.country += $scope.currentCountryValue[c].id;
      }
      $location.search('country',params.country);
    }
    else{
      $location.search('country',undefined);
    }

    if($scope.currentDeparmentValue.length > 0){
      params.department = "";
      for(var d=0;d < $scope.currentDeparmentValue.length; d++){
        if(d > 0){
          params.department += ",";
        }
        params.department += $scope.currentDeparmentValue[d].id;
      }
      $location.search('department',params.department);
    }
    else{
      $location.search('department',undefined);
    }

    if($scope.sortBy.length > 0){
      params.sortby = $scope.sortBy +":"+$scope.currentSortDirection[$scope.sortBy];
    }

    communicationService.getUsers.get(params).$promise
      .then(function(results){
        $scope.tableData = results.participants;
        footerService.setResultInfo($scope.currentPage, $scope.itemsPerPage, results.count);
        updateCheckboxes();
        if(results.count === 0){
          $scope.noResults = true;
          $scope.noResultsMessage = "No results";
        }
      }, function(errResponse){
        messageService.addError('Error getting custodians.')(errResponse);          
      });
  };


  // Add a new user
  $scope.save = function(){
    var contentObject = {};
    contentObject.firstName = $scope.newFirstName;
    contentObject.lastName = $scope.newLastName;
    contentObject.email = $scope.newEmail;
    contentObject.department = $scope.newDepartment;
    contentObject.country = $scope.newCountry;
    contentObject.job = $scope.newJob;
    contentObject.employeeId = $scope.newEmployeeId;
    contentObject.location = $scope.newLocation;

        if (((contentObject.firstName && (contentObject.firstName.length > 0)) || (contentObject.lastName && (contentObject.lastName.length > 0))) && (contentObject.email && (contentObject.email.length > 0))) {
            $http.post(Environment.getRestapiHost() + '/restapi/services/participant', contentObject)
                    .then(function (result) {
                        messageService.addSuccess('Added new custodian')();
                        $cookieStore.put('searchApp_currentUser', result.data);
                        $timeout(function () {
                            $location.path('/userDetails');
                        }, 250);
                    }, function (errResponse) {
                        messageService.addError('Error adding new custodian.')(errResponse);
                    });
        } else {
            messageService.addError('Error creating custodian. Name and description fields are required')();
        }
    };


  // Delete a user
  $scope.delete = function(){
    $http({headers:{'Authorization': $cookieStore.get("searchApp_token"), "Content-Type":"application/json"}, url: Environment.getRestapiHost() + '/restapi/services/participant', method: 'DELETE', data: tableInteractionsService.getIdsToDelete($scope.checkboxList)}).then(function(res) {
      messageService.addSuccess('Custodian deleted')();
      $scope.namesToBeDeleted = '';
      resetTableData();
        clearTrackingLists();
    }, function(errResponse) {
      messageService.addError('Error deleting custodian.')(errResponse);
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
          url: Environment.getRestapiHost() + '/restapi/services/participant/upload',
          file: file
        }).progress(function (evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          $scope.log = 'progress: ' + progressPercentage + '% ' +
            evt.config.file.name + '\n' + $scope.log;
        }).then(function (response) {
          $scope.log = 'file ' + response.config.file.name + 'uploaded. Response: ' + JSON.stringify(response.data) + '\n' + $scope.log;
          resetTableData();
          messageService.addSuccess('Custodians successfully imported')();
        }, function(errResponse){
          var errorMessage = "Error uploading custodians";
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

  if($route.current.activetab === 'manageUsers'){
    //ON PAGE LOAD
    if($location.search().page){
      $scope.currentPage = parseInt($location.search().page);
    }
    else{
      $scope.currentPage = 1;
    }

    if($location.search().country){
      var ids = $location.search().country.split(',');
      for(var id=0;id < ids.length;id++){
        var obj = {};
        obj.id = ids[id];
        $scope.currentCountryValue.push(obj);
      }
    }

    if($location.search().department){
      var ids = $location.search().department.split(',');
      for(var id=0;id < ids.length;id++){
        var obj = {};
        obj.id = ids[id];
        $scope.currentDeparmentValue.push(obj);
      }
    }

    $scope.getFilters();
    $scope.getUsers();
  }

});

