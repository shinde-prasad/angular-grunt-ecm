
'use strict';

searchApp.controller('auditSearchCtrl', function ($scope, $http, $cookieStore, $location, $route, $timeout, communicationService, loginService, footerService, tableInteractionsService, auditService) {

    //Table related fields. Check scripts/directives/tableGenerator.js for documentation
    $scope.tableData;
    $scope.discardedFields      = ['id', 'interactionObject', 'destinationIP', 'severity', 'signatureCode', 'receiptTime'];
    $scope.rowAttributes        = 'style="cursor: pointer;" ';
    $scope.checkboxList         = {};
    $scope.addCheckbox          = false;
    $scope.checkboxAttributes   = 'ng-change="checkboxChange()"';
    $scope.rowIdentifier        = 'id';
    $scope.specialFields        = ['timestamp'];
    $scope.sortableFields       = [];
    //End - Table related fields

    //Pagination variables. Required for the pagination plugin (angular-ui)
    $scope.itemsPerPage     = $cookieStore.get("pageSizeAuditSearch") ? $cookieStore.get("pageSizeAuditSearch") : 50;
    $scope.maxSize          = 4;
    $scope.currentPage      = 1;
    $cookieStore.put('searchApp_ssCurrentPage',$scope.currentPage);
    $scope.itemsPerPageOptions    = [10, 20, 30, 40, 50];
    //End - Pagination variables

    //Form variables
    $scope.form = {};
    $scope.form.minDate     = '';
    $scope.form.maxDate     = '';
    $scope.form.user;
    $scope.form.group;
    $scope.form.action;



    /********************************/
    /* ERROR AND SUCCESS MANAGEMENT */
    /********************************/
    //$timeout service required
    $scope.eventFound       = false;        //When true, an error is displayed in the UI
    $scope.eventMessage     = '';           //The message that will be displayed in the UI when the error section is displayed
    $scope.eventIsSuccess   = true;         //If true then the event is a success event. If false is an error event

    //Method used to show a message
    // @param eventMessage  The message to be displayed
    // @param isSuccess     If true the event is a success event, otherwise is an error event
    $scope.showEventInfo    = function (eventMessage, isSuccess) {
        $scope.eventMessage     = eventMessage;
        $scope.eventIsSuccess   = isSuccess;
        $scope.eventFound       = true;
//        $timeout(function(){
//            $scope.eventFound   = false
//        }, 3000);
    };
    /* END - ERROR AND SUCCESS MANAGEMENT */

    //TABLE RELATED METHODS//
    var resetTableData  = function(){
        //To reload the table
        $scope.tableData        = undefined;
    };

    //When the user click on a row
    $scope.rowClick = function(auditResultId){

        var result = $.grep($scope.tableData, function(e){ return e.id == auditResultId; });

        auditService.setCurrentAuditObject(result[0]);
        $location.path('/auditDetails');
    };
    //END - TABLE RELATED METHODS//

    $scope.updatePageSize   = function() {
        $cookieStore.put("pageSizeAuditSearch", $scope.itemsPerPage);
        $scope.search();
    };

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function() {
        $cookieStore.put('searchApp_ssCurrentPage', $scope.currentPage);
        resetTableData();
        $scope.search();
    };
    //END - PAGINATION METHODS


    var interactionObjectFormatting = function(interactionObject){
        var formatted = '';
        if( Object.prototype.toString.call( interactionObject ) === '[object Object]' ) {
            for (var i = 0; i < Object.getOwnPropertyNames(interactionObject).length; i++) {
                if (interactionObject[Object.getOwnPropertyNames(interactionObject)[i]]) {
                    formatted += '<strong>' + Object.getOwnPropertyNames(interactionObject)[i] + ':</strong>';
                    if (angular.isArray(interactionObject[Object.getOwnPropertyNames(interactionObject)[i]])) {
                        formatted += '[';
                        var currentArray = interactionObject[Object.getOwnPropertyNames(interactionObject)[i]]
                        for (var innerObjectIndex = 0; innerObjectIndex < currentArray.length; innerObjectIndex++) {
                            formatted += interactionObjectFormatting(currentArray[innerObjectIndex]);
                        }
                        formatted += ']';
                    }
                    else if (angular.isObject(interactionObject[Object.getOwnPropertyNames(interactionObject)[i]])) {
                        formatted += ' ' + interactionObjectFormatting(interactionObject[Object.getOwnPropertyNames(interactionObject)[i]]);
                    }
                    else {
                        formatted += ' ' + interactionObject[Object.getOwnPropertyNames(interactionObject)[i]];
                    }
                    if (i < Object.getOwnPropertyNames(interactionObject).length - 1) {
                        formatted += ', ';
                    }
                }
            }
        }
        else if (interactionObject.constructor === Array) {
            formatted += '[';
            for (var i = 0; i < interactionObject.length; i++) {
                formatted +=  interactionObjectFormatting(interactionObject[i]) + ', ';
            }
            formatted += ']';
        }
        else {
            formatted = interactionObject;
        }

        if(formatted.length > 180){
            formatted   = formatted.substring(0, 177)+'...';
        }

        return formatted;
    };

    var objectsFormatting   = function (resultLogs) {
        for(var i = 0; i < resultLogs.length; i++){
            if(resultLogs[i].interactionObject && (resultLogs[i].interactionObject.length > 1)){        //Interaction object exists and is an object (should have at least 2 characters "{}")
                var json = null;
                try {
                    json = eval("(" + resultLogs[i].interactionObject + ")");
                }
                catch (e) {
                    json = resultLogs[i].interactionObject;
                }
                if(json){
                    resultLogs[i].formattedInteractionObject  = interactionObjectFormatting(json);
                }
            }
        }
        return resultLogs;
    };


    //API REQUEST METHODS//
    // set select options
    $scope.options = [
        { label: 'View', value: 'View' },
        { label: 'Create', value: 'Create' },
        { label: 'Append', value: 'Append' },
        { label: 'Edit', value: 'Edit' },
        { label: 'Delete', value: 'Delete' },
        { label: 'Remove', value: 'Remove' },
        { label: 'View All', value: 'View All' },
        { label: 'Special', value: 'Special' },
        { label: 'Login', value: 'Login' },
        { label: 'Login Failure', value: 'Login Failure' },
        { label: 'Logout', value: 'Logout' },
        { label: 'Search', value: 'Search' }
    ];

    // set select options
    $scope.sourceObjects = [
        { label: 'Document', value: 'Document' },
        { label: 'Saved Search', value: 'Saved Search' },
        { label: 'Collection', value: 'Collection' },
        { label: 'Collection Document', value: 'Collection Document' },
        { label: 'FlaggingRule', value: 'FlaggingRule' },
        { label: 'FlaggingRule item', value: 'FlaggingRule item' },
        { label: 'User', value: 'User' },
        { label: 'Group', value: 'Group' },
        { label: 'Custodian Group', value: 'Participant Group' },
        { label: 'Custodian Group Member', value: 'Participant Group Member' },
        { label: 'Group Member', value: 'Group Member' },
        { label: 'Keyword', value: 'Keyword' },
        { label: 'Keyword term', value: 'Keyword term' },
        { label: 'Note', value: 'Note' },
        { label: 'Custodian', value: 'Participant' },
        { label: 'Index', value: 'Index' }
    ];

    //$scope.form.interactionType = $scope.options[1];

    //Perform a search with the values in the form
    $scope.search   = function(){

        resetTableData();

        var formToSubmit    = {};

        $scope.form.page            = $scope.currentPage;
        $scope.form.resultsPerPage  = $scope.itemsPerPage;

        //Filters the empty properties
        for (var i = 0; i < Object.getOwnPropertyNames($scope.form).length; i++) {
            if($scope.form[Object.getOwnPropertyNames($scope.form)[i]]){
                formToSubmit[Object.getOwnPropertyNames($scope.form)[i]]    = $scope.form[Object.getOwnPropertyNames($scope.form)[i]];
            }
        }

        $cookieStore.put('searchApp_ssAuditForm', formToSubmit); //Set the search criteria in a cookie

        communicationService.getAuditResults.post(formToSubmit).$promise
            .then(function(results) {
                results.logs    = objectsFormatting(results.logs);
                if(results.logs.length > 0){
                    $scope.tableData    = results.logs;
                }
                footerService.setResultInfo($scope.currentPage, $scope.itemsPerPage, results.count);
            }, function(errResponse) {
                $scope.showEventInfo('Error getting the results. Error status: '+errResponse.status, false);
            });
    };
    //END - API REQUEST METHODS

    //ON PAGE LOAD - Pagination
    //Check if the page was stored in a cookie
    if($cookieStore.get('searchApp_ssCurrentPage') && ($cookieStore.get('searchApp_ssCurrentPage') != '')){
        $scope.setPage(parseInt($cookieStore.get('searchApp_ssCurrentPage')));
    }

    //ON PAGE LOAD - Form
    //Check if the form was stored in a cookie and do the search
    if($cookieStore.get('searchApp_ssAuditForm') && ($cookieStore.get('searchApp_ssAuditForm') != '')){
        var tmpForm = $cookieStore.get('searchApp_ssAuditForm');

        if(tmpForm.maxDate){
            $scope.form.maxDate = tmpForm.maxDate;
        }
        if(tmpForm.minDate){
            $scope.form.minDate = tmpForm.minDate;
        }
        if(tmpForm.user){
            $scope.form.user    = tmpForm.user;
        }
        if(tmpForm.group){
            $scope.form.group   = tmpForm.group;
        }
        if(tmpForm.action){
            $scope.form.action  = tmpForm.action;
        }

        $scope.search();
    }


});

