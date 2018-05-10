'use strict';

searchApp.controller('manageExportsCtrl', function ($scope, $http, $cookieStore, $location, $timeout, communicationService, footerService, tableInteractionsService, messageService, Environment, Upload) {

  //Table related fields. Check scripts/directives/tableGenerator.js for documentation
  $scope.tableData;
  $scope.discardedFields = ['id', 'password', 'exportPassword', 'ownerId', 'groupId', 'criteria', 'exportPath', 'owner']; 
  $scope.rowAttributes = 'style="cursor: pointer;" ';
  $scope.checkboxList = {};
  $scope.addCheckbox = true;
  $scope.checkboxAttributes = 'ng-change="checkboxChange()"';
  $scope.rowIdentifier = 'id';
  $scope.specialFields = ['modifiedDate', 'createdDate', 'lastModifiedDate', 'lastExecutionDate', 'startdate', 'enddate'];
  $scope.sortableFields = [];
  //End - Table related fields

  //Pagination variables. Required for the pagination plugin (angular-ui)
  $scope.itemsPerPage = $cookieStore.get("pageSizeManageExports") ? $cookieStore.get("pageSizeManageExports") : 50;
  $scope.maxSize = 4;
  $scope.currentPage = 1;
  $cookieStore.put('searchApp_ssCurrentPage', $scope.currentPage);
  $scope.itemsPerPageOptions = [10, 20, 30, 40, 50];
  //End - Pagination variables

  //Delete modal variables. Check scripts/directives/deleteModal.js for documentation
  $scope.deleteModalTitle = 'Delete scheduled exports';
  $scope.countDeletedItems = '';
  $scope.deleteMessage1 = 'WARNING: You are about to delete';
  $scope.deleteMessage2 = 'scheduled exports!';
  $scope.namesToBeDeleted = '';
  $scope.returnVal = 'name'; // name of th field which should be returned in getNamesToDelete method
  //End - Delete modal variables

  $scope.selectedType = '';

  //Enable or disable the delete button
  $scope.btnDisabled = true;

  /**********************/
  /* ELEMENTS SELECTION */
  /**********************/
  $scope.selectAllEnabled = false;
  $scope.checkedElements = {};
  $scope.uncheckedElements = {};

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

  $scope.updatePageSize = function () {
    $cookieStore.put("pageSizeManageExports", $scope.itemsPerPage);
    $scope.tableData = undefined;
    $scope.getExports();

  };

  // Modal preparation
  $scope.prepareModal = function () {
    $scope.getAllExports();
  };

  //Gets all the users
  $scope.getAllExports = function () {
    communicationService.getExports.get({page: 1, resultsPerPage: $scope.itemsPerPage}).$promise //10000 is the limit?
      .then(function (results) {
        if ($scope.selectAllEnabled) {
          $scope.namesToBeDeleted = tableInteractionsService.getElementsSelected(results.exports, $scope.selectAllEnabled, $scope.uncheckedElements, 'id', [$scope.returnVal]);
          $scope.countDeletedItems = tableInteractionsService.getCountElementsSelected(results.exports, $scope.selectAllEnabled, $scope.uncheckedElements, 'id');
        }
        else {
          $scope.namesToBeDeleted = tableInteractionsService.getElementsSelected(results.exports, $scope.selectAllEnabled, $scope.checkedElements, 'id', [$scope.returnVal]);
          $scope.countDeletedItems = tableInteractionsService.getCountElementsSelected(results.exports, $scope.selectAllEnabled, $scope.checkedElements, 'id');
        }
      }, function (errResponse) {
        messageService.addError('Error getting scheduled exports.')(errResponse);
      });
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
    $scope.getExports();
    //End of table reload

    //Clear the name and description
    $scope.newName = '';
    $scope.newDescription = '';

    $scope.allChecked = false;
  };

  //When the user click on a row
  $scope.rowClick = function (exportId) {
    //To be implemented - Work in progress...
    $cookieStore.remove('searchApp_exportSavedSearchId');
    $cookieStore.put('searchApp_currentExport', exportId);
    $location.url('/exportDetails/' + exportId);
  };

  $scope.newExport = function () {
    $cookieStore.remove('searchApp_exportSavedSearchId');
    $cookieStore.put('searchApp_currentExport', null);
    $timeout(function () {
      $location.url('/exportDetails/' + $scope.selectedType);
    }, 250);

  };

  //Checks or unchecks all checkboxes
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


  $scope.$watch('files', function () {
    $scope.upload($scope.files);
  });

  $scope.upload = function (files) {
    if (files && files.length) {
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        Upload.upload({
          url: Environment.getRestapiHost() + '/restapi/services/export/upload',
          file: file
        }).progress(function (evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          $scope.log = 'progress: ' + progressPercentage + '% ' +
            evt.config.file.name + '\n' + $scope.log;
        }).then(function (response) {
          $scope.log = 'file ' + response.config.file.name + 'uploaded. Response: ' + JSON.stringify(response.data) + '\n' + $scope.log;
          resetTableData();
          messageService.addSuccess('Exports successfully imported')();
        }, function (errResponse) {
          var errorMessage = "Error uploading Exports";
          if ($.isArray(errResponse.data)) {
            for (var i = 0; i < errResponse.data.length; i++) {
              errorMessage = errorMessage + "\n" + errResponse.data[i];
            }
          }
          messageService.addError(errorMessage)();
          resetTableData();
        });
      }
    }
  };

  $scope.export = function () {
    $http({
      method: 'GET',
      url: Environment.getRestapiHost() + '/restapi/services/export/export',
      responseType: 'arraybuffer'
    }).then(function (response) {
      var anchor = angular.element('<a/>');

      var filename = response.headers("x-filename");
      var myBuffer = new Uint8Array(response.data);

      var data = new Blob([myBuffer], {type: 'application/octet-stream;charset=UTF-8'});
      saveAs(data, filename);
    });
  };

  $scope.setPage = function (pageNo) {
    $scope.currentPage = pageNo;
  };

  $scope.pageChanged = function () {
    //$cookieStore.put('searchApp_ssCurrentPage', $scope.currentPage);
    $location.search('page', $scope.currentPage);
    resetTableData();
  };
  //END - PAGINATION METHODS

  $scope.getSearchDefinition = function (exports, savedSearch) {
    if (savedSearch && savedSearch !== '') {
      return savedSearch;
    }
    return exports.definition;

  };

  $scope.getOrdinalNumber = function (dayNumber) {
    var firstNumber = dayNumber % 10,
      secondNumber = dayNumber % 100;
    if (firstNumber === 1 && secondNumber !== 11) {
      return dayNumber + "st";
    }
    if (firstNumber === 2 && secondNumber !== 12) {
      return dayNumber + "nd";
    }
    if (firstNumber === 3 && secondNumber !== 13) {
      return dayNumber + "rd";
    }
    return dayNumber + "th";
  };

  $scope.getMonthName = function (monthNumber) {
    var monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthName[monthNumber - 1];
  };

  $scope.updateScheduleText = function (type, monthNumber, dayNumber, hour, minutes, days) {

    var result = "";
    if (minutes < 10 && type !== 'later') {
      minutes = "0" + minutes;
    }

    switch (type) {
      case 'periodically':
        result = "Every " + hour + "h " + minutes + "m ";
        break;
      case 'daily':
        result = "Daily at " + " " + hour + ":" + minutes;
        break;
      case 'weekly':
        result = "Weekly " + (days === '*' ? 'day' : days) + " at " + hour + ":" + minutes;
        break;
      case 'monthly':
        if (dayNumber === 'L') {
          dayNumber = "last day";
        }
        else {
          dayNumber = $scope.getOrdinalNumber(dayNumber);
        }
        result = "Monthly on " + dayNumber + ", at " + hour + ":" + minutes;
        break;
      case 'advanced':
        result = $scope._data.value;
        break;
      case 'later':
        result = $scope.getOrdinalNumber(dayNumber) + " of " + $scope.getMonthName(monthNumber) + " at " + hour + ":" + minutes;
        break;
      case 'none':
        result = "Run now";
        break;
    }

    return result;
  };

  var SCHEDULE_PERIODIC = /^0 0(\/\d{1,2})? (0(\/\d{1,2})?|\*) \* \* \?$/;
  var SCHEDULE_DAILY = /^0 (\d{1,2}) (\d{1,2}) \? \* \*$/;
  var SCHEDULE_WEEKLY = /^0 (\d{1,2}) (\d{1,2}) \? \* ([MONTUEWDHFRISA,]+)$/;
  var SCHEDULE_MONTHLY = /^0 (\d{1,2}) (\d{1,2}) ([1-2][0-9]|3[0-1]|[0-9]|L) \* \?$/;

  $scope.makeReadable = function (schedule, startDate) {
    var scheduleType = 'none';
    var daysText = null;

    var dayNumber = null;
    var hourNumber = null;
    var minutesNumber = null;
    var monthNumber = null;
    if (schedule === null || schedule === '') {
      minutesNumber = 0;
      if (startDate && startDate !== '') {
        var dateTimeTokens = startDate.split(' ');
        var dateTokens = dateTimeTokens[0].split('-');
        dayNumber = dateTokens[2] ? dateTokens[2] : null;
        monthNumber = dateTokens[1] ? dateTokens[1] : null;

        var timeTokens = dateTimeTokens[1].split(':');
        hourNumber = timeTokens[0] ? timeTokens[0] : null;
        minutesNumber = timeTokens[1] ? timeTokens[1] : null;
        scheduleType = 'later';
      }

      return $scope.updateScheduleText(scheduleType, monthNumber, dayNumber, hourNumber, minutesNumber, daysText);
    }
    var values = schedule.split(" ");
    daysText = values[5];

    dayNumber = values[3];
    hourNumber = parseInt(values[2] && values[2] !== '*' ? values[2].replace('/', '') : "0");
    minutesNumber = parseInt(values[1] ? values[1].replace('/', '') : "0");
    monthNumber = null;

    if (SCHEDULE_PERIODIC.exec(schedule)) {
      scheduleType = 'periodically';
    }
    else if (SCHEDULE_DAILY.exec(schedule)) {
      scheduleType = 'daily';
    }
    else if (SCHEDULE_WEEKLY.exec(schedule)) {
      scheduleType = 'weekly';
    }
    else if (SCHEDULE_MONTHLY.exec(schedule)) {
      scheduleType = 'monthly';
    }

    return $scope.updateScheduleText(scheduleType, monthNumber, dayNumber, hourNumber, minutesNumber, daysText);

  };

  /*
    $scope.getExportType = function (savedSearch) {
    if (savedSearch && savedSearch !== '') {
      return "SavSearch";
    }

    return "Export";
  };
  */

  $scope.prepareExports = function (exports) {
    var results = [];
    for (var i = 0; (i < exports.length); i++) {
      var row = {};
      row.id = exports[i].id;
      row.name = exports[i].name;
      row.definition = $scope.getSearchDefinition(exports[i], exports[i].savedSearch);
      row.startdate = exports[i].startDate;
      row.enddate = exports[i].endDate;
      row.lastModifiedDate = exports[i].lastModifiedDate;
      row.lastExecutionDate = exports[i].lastExecutionDate;
      row.schedule = $scope.makeReadable(exports[i].schedule, exports[i].startDate);
      row.executionCount = exports[i].executionCount;
      row.type = exports[i].type;
      row.isRunningMesage = exports[i].isRunningMesage;

      results.push(row);
    }

    return results;
  };

  //API REQUEST METHODS//
  //Get all the exports to populate the table
  $scope.getExports = function () {
    communicationService.getExports.get({page: $scope.currentPage, resultsPerPage: $scope.itemsPerPage}).$promise
      .then(function (results) {
        $scope.tableData = $scope.prepareExports(results.exports);
        footerService.setResultInfo($scope.currentPage, $scope.itemsPerPage, results.count);
        updateCheckboxes();
      }, function (errResponse) {
        messageService.addError('Error getting scheduled exports.')(errResponse);
      });
  };

  //Delete a export
  $scope.delete = function () {
    $http({
      headers: {'Authorization': $cookieStore.get("searchApp_token"), "Content-Type": "application/json"},
      url: Environment.getRestapiHost() + '/restapi/services/export',
      method: 'DELETE',
      data: tableInteractionsService.getIdsToDelete($scope.checkboxList)
    }).then(function (res) {
      messageService.addSuccess('Scheduled exports deleted')();
      $scope.namesToBeDeleted = '';
      resetTableData();
      clearTrackingLists();
    }, function (errResponse) {
      messageService.addError('Delete scheduled exports failed.')(errResponse);
    });
  };

  if ($location.search().page) {
    $scope.currentPage = parseInt($location.search().page);
  }
  else {
    $scope.currentPage = 1;
  }
  //Populate the table with the exports retrieved from the API
  $scope.getExports();

});