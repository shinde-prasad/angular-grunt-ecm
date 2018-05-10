'use strict';

searchApp.controller('exportDetailsCtrl', function ($scope, $routeParams, messageService, modelDomainService, $http, $cookieStore, $location, $timeout, $filter, communicationService, channelSelectionService, searchResultsService, Environment) {
    
  $scope.modelDS = modelDomainService;
  
  $scope.flagValues = [];
  $scope.flagRuleId;

  $scope.searchRS = searchResultsService;
  $scope.channelSS = channelSelectionService; 
  //Delete modal variables. Check scripts/directives/deleteModal.js for documentation
  $scope.enddate_detail = {};
  $scope.startdate_detail = {};
  $scope.exportInffo = {};
  $scope.deleteDetailModalTitle = 'Delete scheduled export';
  $scope.deleteDetailMessage = 'scheduled export';
  $scope.deteteDetailName = '';
  //End - Delete modal variables

  //Enable or disable the delete button
  $scope.btnDisabled = true;
  
  $scope.newMode = /^SSEXP|TREXP|EXP$/.test($routeParams.export);

  $scope.formatDates = function (date) {
      
    if (date instanceof Date) {
        return date.toISOString().replace(/^(\d{4})-(\d{2})-(\d{2}).(\d{2}):(\d{2}):(\d{2}).*$/,'$1-$2-$3 $4:$5');
    }

    var a1 = date.split(" ");
    var d1 = a1[0].split("-");
    var t1 = a1[1].split(":");
    var formattedDate1 = new Date(d1[0], (d1[1] - 1), d1[2], t1[0], t1[1]);
    return $filter('date')(formattedDate1, 'yyyy-MM-dd HH:mm');
  };  
 
  //Get all the flagging rules to fill the flags select input
  $scope.getRules = function () {
      var promise = communicationService.getRules.get({page: 1, resultsPerPage: 100}).$promise.then(function (results) {
        $scope.flagValues = [{name: '', value: null}];
        for (var i = 0; i < results.rules.length; i++) {
          var singleObject = {name: results.rules[i].name, value: results.rules[i].id};
          $scope.flagValues.push(singleObject);
          if (singleObject.value === $scope.flagRuleId) {
            $scope.exportInfo["flaggingRule"] = singleObject;
          }
        }
      }, function (errResponse) {
        messageService.addError('Error getting flagging rules.')(errResponse);
      });
      return promise;
  };

  //API REQUEST METHODS//
  $scope.getExportPath = function () {
    var promise = communicationService.getExportPath.get().$promise
      .then(function (results) {
        $scope.exportPath = results.exportPath;

      }, function (errResponse) {
        messageService.addError('Error getting export path.')(errResponse);
      });
      return promise;
  };

  $scope.getExportPath();
  
  //Get the keyword information
  $scope.getExportInfo = function () {
    if (!$scope.newMode) {
      communicationService.getExport.get({id: $routeParams.export}).$promise
        .then(function (results) {
          $scope.exportInfo = {};
          $scope.exportInfo["startdate"] = "";
          $scope.exportInfo["enddate"] = "";
          
          if (results.type !== 'SSEXP') {
            $scope.flagRuleId = results.criteria.contentSourceFilters[0].filters["flag"];
            if ($scope.flagRuleId) {
              angular.forEach($scope.flagValues, function (flag) {
                if (flag.value === parseInt($scope.flagRuleId)) {
                  $scope.exportInfo.flaggingRule = flag;
                }
              });
            }
            
            var startDate = results.criteria.contentSourceFilters[0].filters["startdate"];
            if (startDate) {
              startDate = startDate.replace('T', ' ');
              $scope.exportInfo["startdate"] = startDate;
            }
            var endDate = results.criteria.contentSourceFilters[0].filters["enddate"];
            if (endDate) {
              endDate = endDate.replace('T', ' ');
              $scope.exportInfo["enddate"] = endDate;
            }

            $scope.setCustoDianGroupOption(results.criteria.contentSourceFilters[0].filters["custodianGroupId"]);
            channelSelectionService.channels.global.populateFromContentSourceFilters(results.criteria.contentSourceFilters);
          } else {
            $scope.setSavedSearchOption(results.savedSearchId);
          }

          results["schedule"] = angular.isString(results["schedule"]) ? results["schedule"].replace(/[ ]+/g, ' ') : '';
          $scope.exportType = results["type"];
          $scope.exportName = results["name"];
          $scope.deleteDetailName = results["name"];
          $scope.exportInfo["type"] = results["type"];
          $scope.exportInfo["name"] = results["name"];
          $scope.exportInfo["password"] = results["exportPassword"];
          $scope.exportInfo["cpassword"] = results["exportPassword"];
          $scope.exportInfo["description"] = results["description"];
          $scope.exportInfo["schedule"] = results["schedule"];
          $scope._data.value = results["schedule"];
          $scope.initDaysValues(results["schedule"].split(' ')[5]);
          $scope.exportInfo["user"] = results["owner"];
          $scope.exportPath = results["exportPath"];
          if (results.shiftingWindow) {
            $scope._data.shifting = results.shiftingWindow;
            $scope.toggleShifting();
          }

          if(results["isRunningMesage"] !== null && results["isRunningMesage"] !== "Not Running"){
              messageService.addSuccess('Search under execution')();
          }

          if (results.startDate) {
            $scope.exportInfo["scheduleStartDate"] = results.startDate.replace('T', ' ');
            $scope._data.startDate = $scope.formatDates($scope.exportInfo["scheduleStartDate"]);
          }
          if (results.endDate) {
            $scope.exportInfo["scheduleEndDate"] = results.endDate.replace('T', ' ');
            $scope._data.endDate = $scope.formatDates($scope.exportInfo["scheduleEndDate"]);
          }
      
          if (results.createdDate) {
            $scope.exportInfo.createdDate = $scope.formatDates(results.createdDate);
          }

          if (results.lastModifiedDate) {
            $scope.exportInfo.lastModifiedDate = $scope.formatDates(results.lastModifiedDate);
          }

          if (results.lastExecutionDate) {
            $scope.exportInfo.lastExecutionDate = $scope.formatDates(results.lastExecutionDate);
          }

          if (($scope._data.value === null || $scope._data.value === '') && results.endDate === null && results.startDate === null) {
            $scope._data.scheduleType = $scope.scheduleType[1];
          }
          else if (SCHEDULE_PERIODIC.exec($scope._data.value)) {
            $scope._data.scheduleType = $scope.scheduleType[2];
          }
          else if (SCHEDULE_DAILY.exec($scope._data.value)) {
            $scope._data.scheduleType = $scope.scheduleType[3];
          }
          else if (SCHEDULE_WEEKLY.exec($scope._data.value)) {
            if ($scope._data.shifting) {
              $scope._data.scheduleType = $scope.scheduleType[4];
            } else {
              $scope._data.scheduleType = $scope.scheduleType[4];
            }
          }
          else if (SCHEDULE_MONTHLY.exec($scope._data.value)){
              if ($scope._data.shifting) {
                  $scope._data.scheduleType = $scope.scheduleType[5];
              } else {
                  $scope._data.scheduleType = $scope.scheduleType[5];
              }
          }

          $scope.makeReadable($scope._data.scheduleType.value, $scope._data.value);

        }, function (errResponse) {
          messageService.addError('Error getting scheduled export info.')(errResponse);
        });
    }
    else {
      channelSelectionService.reset();
      $scope.exportName = "";
      $scope.scheduleText = "Not set";      
      $scope.exportType = $routeParams.export;
      $scope.deleteDetailName = "";
      $scope.exportInfo = {};
      $scope.exportInfo["name"] = "";
      $scope.exportInfo["type"] = $scope.exportType;      
      $scope.exportInfo["description"] = "";
      $scope.exportInfo["createdDate"] = "";
      $scope.exportInfo["group"] = "";
      $scope.exportInfo["modifiedBy"] = "";
      $scope.exportInfo["modifiedDate"] = "";
      $scope.exportInfo["startdate"] = "";
      $scope.exportInfo["enddate"] = "";
      $scope.exportInfo["custodianGroup"] = "";
      $scope.exportInfo["password"] = "";
      $scope.exportInfo["cpassword"] = "";
      $scope.exportInfo["schedule"] = "";
      $scope.exportInfo["flaggingRule"] = "";
      $scope.exportInfo.createdDate = "";
      $scope.exportInfo.modifiedDate = "";
    }
  };

  $scope.setSavedSearchOption = function (savedSearchId) {
    if (savedSearchId !== undefined) {
      communicationService.getQuery.get({id: savedSearchId}).$promise.then(function (results) {
        var result = {name: results["name"], value: results["id"]};
        $scope.exportInfo["savedSearch"] = result;
      }, function (errResponse) {
          messageService.addError("Error loading data for saved search ID=" + savedSearchId)();
      });
    }
  };

  $scope.setCustoDianGroupOption = function (custodianGroupId) {
    if (custodianGroupId !== undefined) {
      communicationService.getGroupInfo.get({id: custodianGroupId}).$promise.then(function (results) {
        var result = {name: results["name"], value: results["id"]};
        $scope.exportInfo["custodianGroup"] = result;
      }, function (errResponse) {
          messageService.addError("Error loading custodian group ID=" + custodianGroupId)();          
      });
    }
  };

  $scope.cancel = function () {
    $cookieStore.put('searchApp_currentExport', null);
    history.go(-1);
  };

    $scope.pageDelete = function () {

        $http({
            headers: {
                'Authorization': $cookieStore.get("searchApp_token"),
                "Content-Type": "application/json"
            },
            url: Environment.getRestapiHost() + '/restapi/services/export',
            method: 'DELETE',
            data: [{id: $cookieStore.get('searchApp_currentExport')}]
        }).then(function (res) {
            resetTableData();
            $timeout(function () {
                $location.path('/manageExports');
            }, 250);
        }, function (errResponse) {
            messageService.addError('Scheduled export delete error.')(errResponse);
        });
    };

  $scope.editToggle = function () {
    $scope.newMode = !$scope.newMode;
  };

  $scope.alreadyClicked = false;
  
  $scope.saveName = function () {
    $scope.alreadyClicked = true;
    var contentObject = {};
    contentObject.type = $scope.exportInfo["type"];
    contentObject.name = $scope.exportInfo["name"];
    contentObject.description = $scope.exportInfo["description"];
    contentObject.exportPassword = $scope.exportInfo["password"];
    contentObject.criteria = $scope.createCriteria();
    contentObject.schedule = $scope.exportInfo["schedule"];
    contentObject.shiftingWindow = $scope._data.shifting;
  
    if ($scope.exportInfo["savedSearch"]) {
      contentObject.savedSearchId = $scope.exportInfo["savedSearch"].value;
    }
    if ($scope.exportInfo["scheduleStartDate"] && $scope._data.scheduleType.value !== 'none') {
      contentObject.startDate = $scope.exportInfo["scheduleStartDate"].replace(' ', 'T') + ":00";
    }
    if ($scope.exportInfo["scheduleEndDate"] && $scope._data.scheduleType.value !== 'none' && $scope._data.scheduleType.value !== 'later') {
      contentObject.endDate = $scope.exportInfo["scheduleEndDate"].replace(' ', 'T') + ":00";
    }

    if ($scope.isValidObject(contentObject)) {

      if ($scope.newMode) {
        communicationService.addExport.post(contentObject).$promise
          .then(function (results) {
            $scope.alreadyClicked = false;
            messageService.addSuccess('Scheduled export created')();
            $scope.editToggle();
            $scope.newMode = false;
            $cookieStore.put('searchApp_currentExport', results.id);
          }, function (errResponse) {
            $scope.alreadyClicked = false;
            if (errResponse.status === 400 && errResponse.data.code === "-1") {
              messageService.addError('Warning creating scheduled export. Some custodians in the Custodian Group selected do not contain an ID for the content source: ' + errResponse.data.message)(errResponse);
            } else if (errResponse.status === 400 && errResponse.data.code === "-2") {
              messageService.addError('The export will never trigger because the schedule entered is older than the current date')(errResponse);
            } else if (errResponse.status === 400 && errResponse.data.code === "-3") {
              messageService.addError('The provided Saved Search can not be found')(errResponse);
            } else {
              messageService.addError('Error creating scheduled export.')(errResponse);
            }
          });
      } else {
        communicationService.updateExport.put({id: $cookieStore.get('searchApp_currentExport')}, contentObject).$promise
          .then(function (results) {
            $scope.alreadyClicked = false;
            messageService.addSuccess('Scheduled export updated.')();    
            console.log(results);
          }, function (errResponse) {
            $scope.alreadyClicked = false;
            if (errResponse.status === 400 && errResponse.data.code === "-1") {
              messageService.addError('Warning updating scheduled export. Some custodians in the Custodian Group selected do not contain an ID for the content source: ' + errResponse.data.message)(errResponse);
            } else if (errResponse.status === 400 && errResponse.data.code === "-2") {
              messageService.addError('The export will never trigger because the schedule entered is older than the current date')(errResponse);
            } else if (errResponse.status === 400 && errResponse.data.code === "-3") {
              messageService.addError('The provided Saved Search can not be found')(errResponse);
            } else {
              messageService.addError('Error creating scheduled export.')(errResponse);
            }

          });
      }
    }
  };

  $scope.isValidObject = function (contentObject) {
    var result = true;

    if (contentObject.name === "") {
      messageService.addError('The name field is mandatory. Please enter a valid name.')();        
      result = false;
    }
    if (contentObject.description === "") {
      messageService.addError('The description field is mandatory. Please enter a valid description.')();
      result = false;
    }

    if (contentObject.type !== 'TREXP') {
        if (contentObject.exportPassword === "") {
          messageService.addError('The password field is mandatory. Please enter a valid password.')();        
          result = false;
        }
        if ($scope.exportInfo["password"] !== $scope.exportInfo["cpassword"]) {
          messageService.addError('Passwords entered do not match.')();          
          result = false;
        }
    }
    
    if (contentObject.type === 'SSEXP') {    
        if (contentObject.savedSearchId === null && $scope.isSavedSearchExport) {
          messageService.addError('The saved search can not be foud.')();
          result = false;
        }
    } else {
        if (contentObject.criteria.contentSourceFilters.length === 0) {
          messageService.addError('Please select at least one channel.')();
          result = false;
        }
    }

    if($scope.exportInfo["startdate"] !== '' && !checkValidDate($scope.exportInfo["startdate"])){
      messageService.addError('Search Period Start value is invalid.')();
      result = false;
    }

    if($scope.exportInfo["enddate"] !== '' && !checkValidDate($scope.exportInfo["enddate"])){
      messageService.addError('Search Period End value is invalid.')();
      result = false;
    }
    
    if ((contentObject.startDate === null && $scope._data.scheduleType.value !== 'none') ||
      (contentObject.endDate === null && $scope._data.scheduleType.value !== 'none' && $scope._data.scheduleType.value !== 'later')) {
      messageService.addError('Schedule start date and end date are mandatory. Please enter a valid schedule start and end date.')();  
      result = false;
    }    

    if (result === false) {
      $scope.alreadyClicked = false;
    }
   
    return result;
  };

  $scope.createCriteria = function () {
    var filters = {};

    var startDateName = "startdate";
    var endDateName = "enddate";

    if ($scope.exportInfo["startdate"]) {
      filters[startDateName] = $filter('date')($scope.exportInfo["startdate"], 'yyyy-MM-ddTHH:mm:ss');
      filters[startDateName] = filters[startDateName].replace(' ', 'T') + ":00";
    }
    if ($scope.exportInfo["enddate"]) {
      filters[endDateName] = $filter('date')($scope.exportInfo["enddate"], 'yyyy-MM-ddTHH:mm:ss');
      filters[endDateName] = filters[endDateName].replace(' ', 'T') + ":00";
    }
    if ($scope.exportInfo["custodianGroup"]) {
      filters.custodianGroupId = $scope.exportInfo["custodianGroup"].value;
    }
    if ($scope.exportInfo["flaggingRule"]) {
      filters.flag = $scope.exportInfo["flaggingRule"].value;
    }

    var country = channelSelectionService.channels.global.fields.country.getValue();
    if (country && country.length > 0) {
        filters.country = channelSelectionService.channels.global.fields.country.getValue();
    }
    
    var emptyChannelFilters = channelSelectionService.channels.global.collectCriteriaWithInfo();
    angular.forEach(emptyChannelFilters.csFilters, function(f) {
        f.filters = filters;
    });
    
    return {"contentSourceFilters": emptyChannelFilters.csFilters};    
  };
  
  $scope.getCustodianGroupTypeAhead = function (val) {
    return $http.get(Environment.getRestapiHost() + '/restapi/services/participantgroup', {
      params: {
        page: 1,
        resultsPerPage: 8,
        keywords: val
      }
    }).then(function (response) {
      return response.data.groups.map(function (item) {
        var fullName = item.name;
        return {name: fullName, value: item.id};
      });
    });
  };

  $scope.getSavedSearchTypeAhead = function (val) {
    return $http.get(Environment.getRestapiHost() + '/restapi/services/document/saved', {
      params: {
        page: 1,
        resultsPerPage: 8,
        keywords: val
      }
    }).then(function (response) {
      return response.data.searches.map(function (item) {
        return {name: item.name, value: item.id};
      });
    });
  };

  $scope.toggleShifting = function () {
  };

  $scope.submitCheck = function () {
      if ($scope._data.scheduleType.value === 'none' || $scope._data.scheduleType.value === 'later') {
          $scope._data.shifting = false;
      };
  };

  var SCHEDULE_PERIODIC = /^0 0(\/\d{1,2})? (0(\/\d{1,2})?|\*) \* \* \?$/;
  var SCHEDULE_DAILY = /^0 (\d{1,2}) (\d{1,2}) \? \* \*$/;
  var SCHEDULE_WEEKLY = /^0 (\d{1,2}) (\d{1,2}) \? \* ([MONTUEWDHFRISA,]+)$/;
  var SCHEDULE_MONTHLY = /^0 (\d{1,2}) (\d{1,2}) ([1-2][0-9]|3[0-1]|[0-9]|L) \* \?$/;

  $scope.scheduleType = [
    {label: 'Run Later', value: 'later'},
    {label: 'Run Now', value: 'none'},
    {label: 'Periodically', value: 'periodically'},
    {label: 'Daily', value: 'daily'},
    {label: 'Weekly', value: 'weekly'},
    {label: 'Monthly', value: 'monthly'},
    {label: 'Advanced', value: 'advanced'}
  ];

  $scope.startDate_detail = {
    calType: "gregorian"
  };

  $scope.endDate_detail = {
    calType: "gregorian"
  };

  $scope.scheduleDays = [
    {
      name: 'Monday',
      value: 'MON',
      active: false
    }, {
      name: 'Tuesday',
      value: 'TUE',
      active: false
    },
    {
      name: 'Wednesday',
      value: 'WED',
      active: false
    },
    {
      name: 'Thursday',
      value: 'THU',
      active: false
    },
    {
      name: 'Friday',
      value: 'FRI',
      active: false
    },
    {
      name: 'Saturday',
      value: 'SAT',
      active: false
    },
    {
      name: 'Sunday',
      value: 'SUN',
      active: false
    }
  ];

  $scope.monthDayRange = function (start, end) {
    var result = [];
    for (var i = start; i <= end; i++) {
      result.push(i);
    }
    return result;
  };

  $scope._data = {};
  $scope._data.shifting = false;
  $scope._data.selectedDay = 1;
  $scope._data.lastDay = false;
  // $scope._data.startDate = new Date().toISOString().replace('T', ' ').replace('Z', '');
  $scope._data.startDate = $scope.formatDates(new Date());
  $scope._data.endDate = "";
  $scope._data.selectedHour = {name: '00 (Midnight)', value: '0'};
  $scope._data.selectedHourNumber = 0;
  $scope._data.selectedMinutes = 0;
  $scope._data.scheduleType = {label: 'Run Later', value: 'later'};
  $scope.scheduleHours = [];
  $scope.noDays = false;
  $scope.change = 0;

  $scope.syncHour = function (to) {

    if (to === 'string') {
      $scope._data.selectedHour = $scope._data.selectedHourNumber.toString();
    } else {
      $scope._data.selectedHourNumber = parseInt($scope._data.selectedHour.value);
      if (isNaN($scope._data.selectedHourNumber)){
        $scope._data.selectedHourNumber = 0;
      }
    }
    $scope.change++;
  };

  $scope.changed = function (type) {
    $scope.change++;
    if (type === 'day') {
      var check = false;
      angular.forEach($scope.scheduleDays, function (opt) {
        check = check || opt.active;
      });
      $scope.noDays = !check;
    }
  };

  $scope.makeReadable = function (scheduleType, schedule) {

    schedule = angular.isString(schedule) ? schedule.replace(/[ ]+/g, ' ') : '';
    var values = schedule.split(' ');
    var prefixText = "Every";
    var daysText = values[5];

    if (scheduleType !== 'none' && scheduleType !== 'later') {
      $scope._data.selectedHourNumber = parseInt(values[2] && values[2] !== '*' ? values[2].replace('/', '') : "0");
      $scope._data.selectedHour = $filter('filter')($scope.scheduleHours, {value: String($scope._data.selectedHourNumber)})[0];
      $scope._data.selectedMinutes = parseInt(values[1] ? values[1].replace('/', '') : "0");
    }

    var dayNumber = $scope._data.selectedDay;
    var hourNumber = $scope._data.selectedHourNumber;
    var minutesNumber = $scope._data.selectedMinutes;
    var monthNumber = null;

    switch (scheduleType) {
      case 'periodically':
        //$scope._data.selectedHourNumber = values[2] ? values[2] : "0";
        $scope._data.scheduleType = {label: 'Periodically', value: 'periodically'};
        break;

      case 'daily':
        prefixText = "Every day";
        $scope._data.scheduleType = {label: 'Daily', value: 'daily'};
        if ($scope._data.selectedMinutes % 5 !== 0) {
          $scope._data.selectedMinutes = Math.round($scope._data.selectedMinutes / 5) * 5;
          minutesNumber = $scope._data.selectedMinutes;
        }
        break;

      case 'weekly':
        if ($scope._data.selectedMinutes % 5 !== 0) {
          $scope._data.selectedMinutes = Math.round($scope._data.selectedMinutes / 5) * 5;
          minutesNumber = $scope._data.selectedMinutes;
        }

        if (values[5] === '*' || values[5] === '?') {
          angular.forEach($scope.scheduleDays, function (sdate) {
            sdate.active = true;
          });
        }
        else {
          angular.forEach($scope.scheduleDays, function (sdate) {
            sdate.active = false;
          });

          if (values[5] === 'L') {
            $scope.scheduleDays[5].active = true;
          }
          else {
            angular.forEach(values[5].trim().split(','), function (date) {
              angular.forEach($scope.scheduleDays, function (sdate) {
                if (date === sdate.value)
                  sdate.active = true;
              });
            });
          }
        }

        $scope._data.scheduleType = {label: 'Weekly', value: 'weekly'};
        break;

      case 'monthly':
          if (values[3] === 'L') {
              dayNumber = 1;
              $scope._data.lastDay = true;
          } else {
            dayNumber = !isNaN(parseInt(values[3])) ? parseInt(values[3]) : 1;
        }
        $scope._data.selectedDay = dayNumber;
        prefixText = "On the ";
        break;

      case 'advanced':
        $scope._data.value = schedule;
        $scope._data.scheduleType = {label: 'Advanced', value: 'advanced'};
        break;

      case 'later':
        $scope._data.scheduleType = {label: 'Run Later', value: 'later'};
        if ($scope._data.startDate !== '') {
          prefixText = "On the ";
          var dateTimeTokens = $scope._data.startDate.split(' ');
          var dateTokens = dateTimeTokens[0].split('-');
          dayNumber = dateTokens[2] ? dateTokens[2] : null;
          monthNumber = dateTokens[1] ? dateTokens[1] : null;

          var timeTokens = dateTimeTokens[1].split(':');
          hourNumber = timeTokens[0] ? timeTokens[0] : null;
          minutesNumber = timeTokens[1] ? timeTokens[1] : null;
        } else {
          return "Invalid schedule";
        }

        break;
      case 'none':
        $scope._data.scheduleType = {label: 'Run Now', value: 'none'};
        break;
    }
    $scope.updateScheduleText(scheduleType, prefixText, monthNumber, dayNumber, hourNumber, minutesNumber, daysText);
  };


  for (var i = 0; i < 24; i++) {

    var suffix = (i >= 12) ? 'pm' : 'am';
    var twelve = (i > 12) ? i - 12 : i;
    var military = (i.toString().length === 1 ? '0' + i : '' + i);

    if (i == 0) {
      suffix = 'Midnight';
    }

    if (i === 12) {
      suffix = 'Noon';
    }

    var tt = twelve + '' + suffix;

    if (i === 0 || i === 12) {
      tt = suffix;
    }

    var hour = {
      value: '' + i,
      name: military + ' (' + tt + ')'
    };

    $scope.scheduleHours.push(hour);
  }
  /****************************************************************
   *  Cron Creation                                               *
   ****************************************************************/

  /**
   * Parse a schedule to display on the UI popup.
   *
   * @param {String} type Type of schedule (periodically | daily | weekly)
   * @param {String} hour
   * @param {String} minute
   **/
  $scope.parseSchedule = function (type, hour, minute, days, daynumber) {

    var cron = '0';
    // Represents seconds;

    if (type === 'periodically') {
      //e.g. 0 0/15 0/1 * * ? Every 1 hour : 15 minutes

      // minute field
      //Every X Minutes   0 0/X * * * ?
      cron += ' 0';
      if (minute !== '' && minute > 0) {
        cron += '/' + minute;
      }

      // hour field
      // Every X Hours  0 0 0/X * * ?
      if (hour !== '' && hour > 0) {
        cron += ' 0/' + hour;
      } else {
        cron += ' *';
      }
      cron += ' * * ?';
      return cron;
    }

    if (type === 'daily') {
      //e.g. 0 15 10 ? * *  Every Day: At 10:15am
      cron += ' ' + minute + ' ' + hour + ' ? * *';

      return cron;
    }

    if (type === 'weekly') {
      //e.g. 0 15 10 ? * MON,WED,FRI  Every Week: At 10:15am on Monday, Wednesday, and Friday
      cron += ' ' + minute + ' ' + hour;

      var first = true;
      var activeDays = 0;
      var dayString = '';

      angular.forEach(days, function (day) {
        if (day.active) {
          activeDays += 1;
          if (!first)
            dayString += ',';

          first = false;
          dayString += day.value;
        }
      });
      if (activeDays === 7 || activeDays === 0) {
        cron += ' ? * *';
      } else {
        cron += ' ? * '+ dayString;
      }
      return cron;
    }

    if (type === 'monthly') {
      //e.g. 0 15 10 ? * *  Every Day: At 10:15am
      cron += ' ' + minute + ' ' + hour + ' ' + daynumber + ' * ?';

      return cron;
    }
  };

  $scope.$watch('change', function (change) {

    var dayNumber = $scope._data.selectedDay;
    if ($scope._data.lastDay) {
      dayNumber = "L";
    }

    if (($scope._data.scheduleType.value !== 'none') && ($scope._data.scheduleType.value !== 'later') && ($scope._data.scheduleType.value !== 'advanced')) {
      $scope._data.value = $scope.parseSchedule($scope._data.scheduleType.value, $scope._data.selectedHourNumber, $scope._data.selectedMinutes, $scope.scheduleDays, dayNumber);
    } else if ($scope._data.scheduleType.value !== 'advanced') {
      $scope._data.value = '';
    }
  });

  $scope.addSchedule = function () {

    var dayNumber = $scope._data.selectedDay;
    if ($scope._data.lastDay) {
      dayNumber = "L";
    }

    if ($scope._data.scheduleType.value === 'periodically') {
      $scope.syncHour('string');
      $scope._data.value = $scope.parseSchedule($scope._data.scheduleType.value, $scope._data.selectedHourNumber, $scope._data.selectedMinutes, $scope.scheduleDays, dayNumber);
    }
    else {
      $scope.syncHour();
      if (($scope._data.scheduleType.value !== 'none') && ($scope._data.scheduleType.value !== 'later') && ($scope._data.scheduleType.value !== 'advanced')) {
        $scope._data.value = $scope.parseSchedule($scope._data.scheduleType.value, $scope._data.selectedHourNumber, $scope._data.selectedMinutes, $scope.scheduleDays, dayNumber);
      } else if ($scope._data.scheduleType.value !== 'advanced') {
        $scope._data.value = '';
      }
    }
    $scope.exportInfo["schedule"] = angular.isString($scope._data.value) ? $scope._data.value.replace(/[ ]+/g, ' ') : '';
    $scope.exportInfo["scheduleStartDate"] = $scope._data.startDate;
    $scope.exportInfo["scheduleEndDate"] = $scope._data.endDate;
    $scope.makeReadable($scope._data.scheduleType.value, $scope._data.value);
  };

  $scope.updateSchedule = function (type, newType) {

    if ($scope._data.startDate === '') {
      $scope._data.startDate = $scope.formatDates(new Date());
    }

    if ($scope._data.scheduleType.value === 'later') {
      $scope._data.endDate = '';
      $scope.endDate_detail = {
        calType: "gregorian"
      };
    }
    else if ($scope._data.endDate === '' || (new Date($scope._data.startDate).getTime() > new Date($scope._data.endDate).getTime())) {
      $scope._data.endDate = $scope._data.startDate;
    }
    $scope.makeReadable(newType, $scope._data.value);
  };

  $scope.updateCron = function (hour, minutes, days) {

    var cron = angular.isString($scope._data.value) ? $scope._data.value.replace(/[ ]+/g, ' ').split(" ") : [];
    var first = true;
    var activeDays = 0;

    if (cron.length === 0) {
      return '';
    }
    cron[1] = minutes;
    cron[2] = hour;
    cron[5] = '';
    for (var d = 0; d < days.length; d++) {
        var day = days[d];
        if (day && day.active) {
          activeDays += 1;
          if (!first) {
            cron[5] += ',';
          }
          first = false;
          cron[5] += day.value;
        }
      }
    if (activeDays === 7) {
      cron[5] = '*';
      cron[3] = cron[3] === '*' ? '?': cron[3];
    } else if (activeDays === 0) {
      cron[5] = '?';
      cron[3] = cron[3] === '?' ? '*': cron[3];
    }
    return cron.join(" ");
  };

  $scope.initDaysValues = function (days) {
    if (days !== undefined) {
      if (days === '*' || days === '?') {
        angular.forEach($scope.scheduleDays, function (sdate) {
          sdate.active = true;
        });
      }
      else {
        var daysValue = days.split(',');
        for (var d = 0; d < daysValue.length; d++) {
          for (var day in $scope.scheduleDays) {
            if (daysValue[d] === $scope.scheduleDays[day].value) {
              $scope.scheduleDays[day].active = true;
            }
          }
        }
      }
    }
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

  $scope.updateScheduleText = function (type, prefixText, monthNumber, dayNumber, hour, minutes, days) {

    $scope.scheduleText = "";
    if (minutes < 10 && type !== 'later') {
      minutes = "0" + minutes;
    };

    switch (type) {
      case 'periodically':
        $scope.scheduleText = prefixText + " " + hour + "h " + minutes + "m ";
        break;
      case 'daily':
        $scope.scheduleText = prefixText + " at " + hour + ":" + minutes;
        break;
      case 'weekly':
        $scope.scheduleText = prefixText + " " + (days === '*' || days === '?' ? 'day' : days) + " at " + hour + ":" + minutes;
        break;
      case 'monthly':
        if ($scope._data.lastDay) {
          dayNumber = "last day";
        }
        else {
          dayNumber = $scope.getOrdinalNumber(dayNumber);
        }
        $scope.scheduleText = prefixText + dayNumber + " of every month at " + hour + ":" + minutes;
        break;
      case 'advanced':
        $scope.scheduleText = $scope._data.value;
        break;
      case 'later':
        $scope.scheduleText = prefixText + $scope.getOrdinalNumber(dayNumber) + " of " + $scope.getMonthName(monthNumber) + " at " + hour + ":" + minutes;
        break;
      case 'none':
        $scope.scheduleText = "Run now";
        break;
    }
  };
  
  var checkValidDate = function(datetime){
    const regex = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s([01]{0,1}[0-9]|2[0-3]):([0-5]{1}[0-9])$/g;
    var re = new RegExp(regex);
    return re.test(datetime);
  };  

  //Populate the keyword information section
    $scope.getRules().then(function () {
        $scope.getExportInfo();
        if ($cookieStore.get('searchApp_exportSavedSearchId')) {
            $scope.setSavedSearchOption($cookieStore.get('searchApp_exportSavedSearchId'));
        }
    });
    
    $scope.inputLock = {
        isTrafficExport: function() {
            return $scope.exportType === 'TREXP';
        }
    };
  
});