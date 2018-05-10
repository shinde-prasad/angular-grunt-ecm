'use strict';

searchApp.controller('groupDetailsCtrl', function ($scope, $http, $cookieStore, $location, $timeout, $filter, messageService, communicationService, footerService, tableInteractionsService, Environment) {

  $scope.title = "Group Details";
  $scope.participantIds = [];
  $scope.participants = [];
  $scope.sortableFields = [];
  $scope.includeParticipantNotesLink = true;
  $scope.data = {singleSelect: 1};
  $scope.requestDeleteReason = true;

  //Table related fields. Check scripts/directives/tableGenerator.js for documentation
  $scope.tableData;
  $scope.discardedFields = ['addReason', 'id', 'lastUpdate', 'lastModifiedBy', 'lastModifiedByID', 'ownerID', 'owner', 'identifiers', 'Xemail', 'timestamp', 'notes'];
  $scope.notesDiscardedFields = ['active', 'groupId', 'ownerId', 'userId', 'id', 'userName'];
  $scope.rowAttributes = '';
  $scope.checkboxList = {};
  $scope.addCheckbox = true;
  $scope.checkboxAttributes = 'ng-change="checkboxChange()"';
  $scope.rowIdentifier = 'id';
  $scope.specialFields = ['dateAddedToGroup'];
  $scope.sortableFields = ['employeeId', 'firstName', 'lastName', 'email', 'dateAddedToGroup','owner', 'department', 'country', 'job', 'reason', 'location'];

  $scope.noResults = false;
  $scope.noResultsMessage = "";
  //End - Table related fields

  //Pagination variables. Required for the pagination plugin (angular-ui)
  $scope.itemsPerPage     = $cookieStore.get("pageSizeGroupDetails") ? $cookieStore.get("pageSizeGroupDetails") : 50;
  $scope.maxSize = 4;
  $scope.currentPage = 1;
  $scope.itemsPerPageOptions    = [10, 20, 30, 40, 50];
  $cookieStore.put('searchApp_ssCurrentPage', $scope.currentPage);
  //End - Pagination variables

  //Delete modal variables. Check scripts/directives/deleteModal.js for documentation
  $scope.countDeletedItems = '';
  $scope.deleteModalTitle = 'Delete Group users';
  $scope.deleteMessage1 = 'WARNING: You are about to delete';
  $scope.deleteMessage2 = 'group users!';
  $scope.namesToBeDeleted = '';
  $scope.returnVal = ''; // name of th field which should be returned in getNamesToDelete method

  $scope.deleteDetailModalTitle = 'Delete group';
  $scope.deleteDetailMessage = 'group';
  $scope.deteteDetailName = '';
  //End - Delete modal variables

  //Enable or disable the delete button
  $scope.btnDisabled = true;

  //Page variables
  $scope.editMode = false;
  $scope.readMode = true;

  // Add new group user variables
  $scope.groupUserId = {name: "", value: ""};

  //Filter bar
  $scope.currentCountryValue = [];
  $scope.currentDeparmentValue = [];
  $scope.currentReasonValue = [];
  $scope.departmentList = [];
  $scope.countryList = [];
  $scope.reasonList = [];
  $scope.filterDropdownSettings = {idProp: 'label', smartButtonMaxItems: 2,searchField: 'label',enableSearch:true,scrollableHeight: '300px',scrollable:true};
  $scope.filterReasonDropdownSettings = {idProp: 'label', smartButtonMaxItems: 2};

  /**********************/
  /* ELEMENTS SELECTION */
  /**********************/
  $scope.selectAllEnabled = false;
  $scope.checkedElements = {};
  $scope.uncheckedElements = {};
  $scope.sortBy = "";
  $scope.currentSortDirection = {};

  //When a checkbox status change, this method is triggered
  $scope.checkboxChange = function () {
    if ($scope.selectAllEnabled) {
      $scope.uncheckedElements = tableInteractionsService.getNewElements($scope.tableData, $scope.checkboxList, $scope.selectAllEnabled, 'id', $scope.uncheckedElements);
    }
    else {
      $scope.checkedElements = tableInteractionsService.getNewElements($scope.tableData, $scope.checkboxList, $scope.selectAllEnabled, 'id', $scope.checkedElements);
    }
    getActionButtonStatus();
  };

  //Updates the checkboxes in the current page using the checked or unchecked element lists
  var updateCheckboxes = function () {
    if ($scope.selectAllEnabled) {
      $scope.checkboxList = tableInteractionsService.getCurrentPageList($scope.tableData, $scope.selectAllEnabled, 'id', $scope.uncheckedElements);
    }
    else {
      $scope.checkboxList = tableInteractionsService.getCurrentPageList($scope.tableData, $scope.selectAllEnabled, 'id', $scope.checkedElements);
    }
    getActionButtonStatus();
  };

  //When the user click on the select page button
  $scope.selectPage = function () {
    $scope.checkboxList = tableInteractionsService.getElementsFromSelectPage($scope.tableData, $scope.checkboxList, 'id');
    $scope.checkboxChange();
  };

  //Clear the tracking lists (checked and unchecked elements)
  var clearTrackingLists = function () {
    $scope.checkedElements = {};
    $scope.uncheckedElements = {};
    getActionButtonStatus();
  };

    $scope.updatePageSize   = function() {
        $cookieStore.put("pageSizeGroupDetails", $scope.itemsPerPage);
        $scope.tableData = undefined;
        $scope.getGroupUsers();
    };

  //When the user click on the select all button
  $scope.selectAll = function () {
    if ($scope.selectAllEnabled) {
      $scope.selectAllEnabled = false;
      clearTrackingLists();
      $scope.checkboxList = tableInteractionsService.getAllCheckedUnchecked($scope.tableData, $scope.checkboxList, 'id', false);
    }
    else {
      $scope.selectAllEnabled = true;
      clearTrackingLists();
      $scope.checkboxList = tableInteractionsService.getAllCheckedUnchecked($scope.tableData, $scope.checkboxList, 'id', true);
    }
  };

  //Sets the status of the btnDisabled variable. This will enable or disable the action buttons on the page
  var getActionButtonStatus = function () {
    if ($scope.selectAllEnabled) {
      $scope.btnDisabled = tableInteractionsService.getIsDisabled($scope.tableData, $scope.selectAllEnabled, $scope.uncheckedElements, footerService.getResultInfo().resultsCount, 'id');
    }
    else {
      $scope.btnDisabled = tableInteractionsService.getIsDisabled($scope.tableData, $scope.selectAllEnabled, $scope.checkedElements, footerService.getResultInfo().resultsCount, 'id');
    }
  };

  // Modal preparation
  $scope.prepareModal = function () {
    $scope.getAllMembers();
  };

  //Gets all the users
  $scope.getAllMembers = function () {
    communicationService.getGroupUsers.get({
      id: $cookieStore.get('searchApp_currentGroup'),
      page: 1,
      resultsPerPage: 10000
    }).$promise //10000 is the limit?
      .then(function (results) {
        if ($scope.selectAllEnabled) {
          $scope.namesToBeDeleted = tableInteractionsService.getElementsSelected(results.members, $scope.selectAllEnabled, $scope.uncheckedElements, 'id', ['firstName', 'lastName']);
          $scope.countDeletedItems = tableInteractionsService.getCountElementsSelected(results.members, $scope.selectAllEnabled, $scope.uncheckedElements, 'id');
        }
        else {
          $scope.namesToBeDeleted = tableInteractionsService.getElementsSelected(results.members, $scope.selectAllEnabled, $scope.checkedElements, 'id', ['firstName', 'lastName']);
          $scope.countDeletedItems = tableInteractionsService.getCountElementsSelected(results.members, $scope.selectAllEnabled, $scope.checkedElements, 'id');
        }
      }, function (errResponse) {
        messageService.addError('Error getting all custodians.')(errResponse);
      });
  };

  //Apply filters
  $scope.filter = function () {
    $scope.getGroupUsers();
  };

  $scope.setSort = function (key, field) {
    $scope.sortBy = field;
    if (!key) {
      if ($scope.currentSortDirection[field]) {
        if ($scope.currentSortDirection[field] === 'desc') {
          $scope.currentSortDirection = tableInteractionsService.setSortingDirection($scope.currentSortDirection, field, 'asc');
        }
        else {
          $scope.currentSortDirection = tableInteractionsService.setSortingDirection($scope.currentSortDirection, field, 'desc');
        }
      }
      else {
        $scope.currentSortDirection = tableInteractionsService.setSortingDirection($scope.currentSortDirection, field, 'desc');
      }

    }
    $scope.getGroupUsers();
  };

  /****************************/
  /* END - ELEMENTS SELECTION */
  /****************************/

  //TABLE RELATED METHODS//
  var resetTableData = function () {
    //To reload the table
    $scope.tableData = undefined;
    $scope.btnDisabled = true;
    $scope.checkboxList = {};
    $scope.getGroupInfo();
    //End of table reload

    //Clear the name and description
    $scope.newName = '';
    $scope.newDescription = '';
  };

  // Checks or unchecks all checkboxes
  $scope.checkUncheckAll = function (isCheckAll) {
    var idsList = tableInteractionsService.getAllIdsInTableData($scope.tableData);
    for (var i = 0; i < idsList.length; i++) {
      if (isCheckAll) {
        $scope.checkboxList[idsList[i]] = true;
      }
      else {
        $scope.checkboxList[idsList[i]] = false;
      }
    }
  };

  $scope.setPage = function (pageNo) {
    $scope.currentPage = pageNo;
  };

  $scope.pageChanged = function () {
    $cookieStore.put('searchApp_ssCurrentPage', $scope.currentPage);
    resetTableData();
  };
  //END - PAGINATION METHODS


  // API REQUEST METHODS//
  //Get all the countries and departments in order to populate the filters
  $scope.getFilters = function (groupId) {
    communicationService.getGroupFilters.get({id: groupId}).$promise.then(function (filters) {
      if (filters.country && filters.country.length > 0) {
        $scope.countryList = filters.country;
      }
      if (filters.department && filters.department.length > 0) {
        $scope.departmentList = filters.department;
      }
      if (filters.reason && filters.reason.length > 0) {
        $scope.reasonList = filters.reason;
      }
    }, function (errResponse) {
      messageService.addError('Error getting filters values for Country and departments.')(errResponse);
    });
  };

  // Get the user information
  $scope.getGroupInfo = function () {
    communicationService.getGroupInfo.get({id: $cookieStore.get('searchApp_currentGroup')}).$promise
      .then(function (results) {
        $scope.name = results["name"];  //Extracting the name to set the page title
        $scope.groupInfo = results;

        //Date formatting
        if (results.lastUpdate && results.timestamp) {
          var a1 = results.lastUpdate.split(" ");
          var d1 = a1[0].split("-");
          var t1 = a1[1].split(":");
          var formattedDate1 = new Date(d1[0], (d1[1] - 1), d1[2], t1[0], t1[1]);
          $scope.groupInfo.lastUpdate = $filter('date')(formattedDate1, 'yyyy-MM-dd HH:mm');
          var a2 = results.timestamp.split(" ");
          var d2 = a2[0].split("-");
          var t2 = a2[1].split(":");
          var formattedDate2 = new Date(d2[0], (d2[1] - 1), d2[2], t2[0], t2[1]);
          $scope.groupInfo.timestamp = $filter('date')(formattedDate2, 'yyyy-MM-dd HH:mm');
        }
        $scope.getFilters($cookieStore.get('searchApp_currentGroup'));
        $scope.getGroupUsers();
      }, function (errResponse) {
        messageService.addError('Error getting group info.')(errResponse);
      });
  };


  // Get group users
  $scope.getGroupUsers = function () {
    $scope.tableData = undefined;
    $scope.noResults = false;
    var params = {
      id: $cookieStore.get('searchApp_currentGroup'),
      page: $scope.currentPage,
      resultsPerPage: $scope.itemsPerPage
    };

    if ($scope.currentCountryValue.length > 0) {
      params.country = "";
      for (var c = 0; c < $scope.currentCountryValue.length; c++) {
        if (c > 0) {
          params.country += ",";
        }
        params.country += $scope.currentCountryValue[c].id;
      }
      $location.search('country',params.country);
    } else {
        $location.search('country',undefined);
    }

    if ($scope.currentDeparmentValue.length > 0) {
      params.department = "";
      for (var d = 0; d < $scope.currentDeparmentValue.length; d++) {
        if (d > 0) {
          params.department += ",";
        }
        params.department += $scope.currentDeparmentValue[d].id;
      }
      $location.search('department',params.department);
    }
    else{
      $location.search('department',undefined);
    }

    if ($scope.currentReasonValue.length > 0) {
      params.reason = "";
      for (var d = 0; d < $scope.currentReasonValue.length; d++) {
        if (d > 0) {
          params.reason += ",";
        }
        params.reason += $scope.currentReasonValue[d].id;
      }
      $location.search('reason',params.reason);
    } else {
      $location.search('reason',undefined);
    }

    if ($scope.sortBy.length > 0) {
      params.sortby = $scope.sortBy + ":" + $scope.currentSortDirection[$scope.sortBy];
    }

    communicationService.getGroupUsers.get(params).$promise
      .then(function (results) {
        $scope.tableData = results.members;
        $scope.groupUserDetails = results.members;
        footerService.setResultInfo($scope.currentPage, $scope.itemsPerPage, results.count);
        updateCheckboxes();
        if (results.count === 0) {
          $scope.noResults = true;
          $scope.noResultsMessage = "No results";
        }
      }, function (errResponse) {
        messageService.addError('Error getting custodians from group.')(errResponse);
      });
  };

  $scope.getCustodianTypeAhead = function (val) {
    return $http.get(Environment.getRestapiHost() + '/restapi/services/participant', {
      params: {
        page: 1,
        resultsPerPage: 8,
        keywords: val,
        nameOnly: true
      }
    }).then(function (response) {
      return response.data.participants.map(function (item) {
        var value = item.firstName + " " + item.lastName;
        var email = item.email;
        if (email) {
            value += " (" + email + ")";
        }
        return {name: value, value: item.id};
      });
    });
  };

  $scope.hideModal = function (participantModal) {
    if (participantModal === undefined) {
      $("#participantNotesModal").modal("hide");
    }
    else {
      $("#participantNotesModal2").modal("hide");
    }
  };

  $scope.addNote = function (index, ComesFromAddUserModal) {
    var participant = $scope.participants[index];
    participant.notes.push($scope.noteText);
    $scope.participants[index] = participant;
    $scope.notesData = undefined;

    if (ComesFromAddUserModal) {
      var newEntry = {};
      newEntry.createDate = $filter('date')(Date.now(), 'yyyy-MM-dd HH:mm');
      newEntry.createdBy = $cookieStore.get('searchApp_user');
      newEntry.noteText = $scope.noteText;
      $scope.tempNotesData.push(newEntry);
      $timeout(function () {
        $scope.notesData = $scope.tempNotesData;
      });
    }
    else {
      $scope.getNotes();
    }
    $scope.noteText = '';

  };

  $scope.getNotes = function () {

    communicationService.getParticipantNotes.get({
      page: $scope.currentPage,
      participantId: $scope.userIdToAppendNote,
      groupId: $cookieStore.get('searchApp_currentGroup'),
      resultsPerPage: $scope.itemsPerPage
    }).$promise
      .then(function (results) {
        $scope.notesData = results.notes;
      }, function (errResponse) {
        messageService.addError("Get notes data failed.")(errResponse);
      });
  };

  $scope.addNoteToParticipant = function (text) {
    communicationService.addComplianceNote.post({
      noteText: text,
      userId: $scope.userIdToAppendNote,
      groupId: $cookieStore.get('searchApp_currentGroup')
    }).$promise
      .then(function (results) {
        $scope.notesData = undefined;
        $scope.getNotes();
        resetTableData();
      }, function (errResponse) {
        messageService.addError("Add note failed.")(errResponse);          
      });
  };

  $scope.prepareNote = function (index) {
    $scope.noteText = '';
    $scope.notesData = undefined;
    $scope.tempNotesData = [];
    $scope.index = index;
  };

  $scope.loadParticipantNote = function (userId) {
    $scope.noteText = '';
    $scope.notesData = undefined;
    $scope.userIdToAppendNote = userId;
    $scope.getNotes();
  };
  $scope.data.singleSelect = [];
  
  $scope.addParticipant = function () {
    if ($scope.groupUserId) {
      messageService.resetLocal();
      var isRepeated = $scope.isRepeated($scope.groupUserId.value);
      var alreadyAddedToArray = $filter('filter')($scope.participants, {value: $scope.groupUserId.value}, true);
      if (isRepeated === false && alreadyAddedToArray.length === 0) {
        var collectionLength = $scope.participants.length;
        var index = collectionLength === 0 ? 0 : collectionLength - 1;
        if (index >= 0) {
          $scope.participants.push({
            'name': $scope.groupUserId.name,
            'value': $scope.groupUserId.value,
            'reason': $scope.data.singleSelect[index],
            'notes': []
          });
        }
      } else {
        if (isRepeated === true) {
          messageService.addError('The participant already exists in the group', {groups: ['addUser']})();
        } else {
          messageService.addError('You already selected this participant.',{groups: ['addUser']})();
        }
      }
    }
  };

  //includeParticipantNotesLink

  $scope.isRepeated = function (id) {
    var result = false;
    angular.forEach($scope.groupUserDetails, function (value) {
      if (value.id == id) {
        result = true;
      }
    });
    return result;
  };

  $scope.updateReasonSelection = function(index){
    var participant = $scope.participants[index];
    participant.reason = $scope.data.singleSelect[index];
  };
  // Add group user
  $scope.addGroupUser = function () {
    if (($scope.participants)) {
      if ($scope.participants.length === 0) {
        messageService.addError('Error user to group. ID field is required.')();
      }
      else {
        angular.forEach($scope.participants, function (value) {
          $scope.participantIds.push({id: value.value, reason: value.reason, notes: value.notes});
        });

        communicationService.addUserToGroup.post({id: $cookieStore.get('searchApp_currentGroup')}, $scope.participantIds).$promise
          .then(function (results) {
            messageService.addSuccess('User added')();
            resetTableData();
          }, function (errResponse) {
            messageService.addError('Error adding user.')(errResponse);
          });
      }
    }
    else {
      messageService.addError('Error user to group. ID field is required.')();
    }
  };

  // Prepare modal dialog to add user
  $scope.prepareGroupUserModal = function () {
    $scope.participantIds = [];
    $scope.participants = [];
    $scope.groupUserId = null;

//    communicationService.getUsers.get({page: 1, resultsPerPage: 1000}).$promise //Maximum 1000 in the drop down
//      .then(function (results) {
//        var tableData = results.participants;
//        var groupUsers = tableInteractionsService.getUsersToAddToGroup(tableData);
//        $scope.groupUsers = groupUsers;
//      }, function (errResponse) {
//        messageService.addError('Error getting groups.')(errResponse);
//      });
  };

  //Delete users from group
  $scope.delete = function () {
    $http({
      headers: {
        'Authorization': $cookieStore.get("searchApp_token"),
        "Content-Type": "application/json"
      },
      url: Environment.getRestapiHost() + '/restapi/services/participantgroup/' + $cookieStore.get('searchApp_currentGroup') + '/member',
      method: 'DELETE',
      data: tableInteractionsService.getIdsToDelete($scope.checkboxList),
      params: {removeReason: $scope.data.removeReason}
    }).then(function (res) {
      messageService.addSuccess('Custodian deleted')();
      $scope.namesToBeDeleted = ''; //Clears the names of the deleted elements
      resetTableData();
      clearTrackingLists();
    }, function (errResponse) {
      messageService.addError('Error deleting custodian.')(errResponse);
    });
  };
  //END - API REQUEST METHODS

  // Delete page/record
  $scope.pageDelete = function () {
    $http({
      headers: {
        'Authorization': $cookieStore.get("searchApp_token"),
        "Content-Type": "application/json"
      },
      url: Environment.getRestapiHost() + '/restapi/services/participantgroup',
      method: 'DELETE',
      data: [{id: $cookieStore.get('searchApp_currentGroup')}]
    }).then(function (res) {
      resetTableData();
        $timeout(function(){$location.path('/manageGroups');}, 250);
    }, function (errResponse) {
      messageService.addError('Error deleting group.')(errResponse);
    });
  };

  // Edit toggle to edit user
  $scope.editToggle = function () {
    if ($scope.readMode) {
      $scope.editMode = true;
      $scope.readMode = false;
    }
    else {
      $scope.editMode = false;
      $scope.readMode = true;
    }
  };

  // Save edited fields
  $scope.saveName = function () {
    var contentObject = {};
    contentObject.name = $scope.groupInfo["name"];
    contentObject.description = $scope.groupInfo["description"];

    communicationService.updateGroup.put({id: $cookieStore.get('searchApp_currentGroup')}, contentObject).$promise
      .then(function (results) {
        messageService.addSuccess('Group updated')();
        $scope.editToggle();
      }, function (errResponse) {
        messageService.addError('Error updating group.')(errResponse);
      });
  };

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

  if($location.search().reason){
    var ids = $location.search().reason.split(',');
    for(var id=0;id < ids.length;id++){
      var obj = {};
      obj.id = ids[id];
      $scope.currentReasonValue.push(obj);
    }
  }

  if($location.search().page){
    $scope.currentPage = parseInt($location.search().page);
  }
  else{
    $scope.currentPage = 1;
  }

  $scope.getGroupInfo();

});