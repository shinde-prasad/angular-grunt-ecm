
'use strict';

searchApp.controller('flagDetailsCtrl', function ($scope, $http, messageService, $cookieStore, $location, $timeout, $filter, communicationService, footerService, tableInteractionsService, Environment) {

    //Table related fields. Check scripts/directives/tableGenerator.js for documentation
    $scope.tableData;
    $scope.discardedFields      = ['id', 'createdById', 'valueId', 'type'];
    $scope.rowAttributes        = '';
    $scope.checkboxList         = {};
    $scope.addCheckbox          = true;
    $scope.checkboxAttributes   = 'ng-change="checkboxChange()"';
    $scope.rowIdentifier        = 'id';
    $scope.specialFields        = ['filter', 'createdDate'];
    $scope.sortableFields       = [];
    //End - Table related fields

    //Pagination variables. Required for the pagination plugin (angular-ui)
    $scope.itemsPerPage     = $cookieStore.get("pageSizeFlagDetails") ? $cookieStore.get("pageSizeFlagDetails") : 50;
    $scope.maxSize          = 4;
    $scope.bigCurrentPage   = 1;
    $scope.itemsPerPageOptions    = [10, 20, 30, 40, 50];
    $cookieStore.put('searchApp_ssCurrentPage',$scope.bigCurrentPage);
    //End - Pagination variables

    //Delete modal variables. Check scripts/directives/deleteModal.js for documentation
    $scope.deleteModalTitle = 'Delete flagging rule items';
    $scope.countDeletedItems = '';
    $scope.deleteMessage1 = 'WARNING: You are about to delete';
    $scope.deleteMessage2 = 'flagging rule items!';
    $scope.namesToBeDeleted = '';

    $scope.deleteDetailModalTitle = 'Delete flagging rule';
    $scope.deleteDetailMessage = 'flagging rule';
    $scope.deteteDetailName = '';
    //End - Delete modal variables

    //Enable or disable the delete button
    $scope.btnDisabled = true;

    //Page variables
    $scope.ruleName;
    $scope.newItems;
    $scope.editMode = false;
    $scope.editedTableDataRow = false;
    $scope.readMode = true;
    
    $scope.resetModalDialog = function () {
        delete $scope.selectedCriteria;
        delete $scope.textValue;        
        delete $scope.selectedFilter;        
        $scope.selectedValue = {};
        $scope.formValues = [];   
    };    
    $scope.resetModalDialog();

    //Add rule item form
    $scope.criteriaFields   = [];
    $scope.filterDropdownSettings = {
        showUncheckAll: false,
        selectionLimit: 1, 
        enableSearch: true,
        scrollable: true,
        smartButtonMaxItems:1,
        closeOnSelect: true,
        smartButtonTextConverter: function(itemText, originalItem) { return itemText; },
        buttonClasses: "form-control rabo-input-220 selector-button-text"
    };

    $scope.translations = {
        buttonDefaultText: ""
    };

    var composeId   = function(items){
        var itemsWithComposedId = [];
        for(var i = 0; i< items.length; i++){
            var newComposedId           = ""+items[i].id+"-"+items[i].field;
            itemsWithComposedId[i]      = items[i];
            itemsWithComposedId[i].id   = newComposedId;
        }
        return itemsWithComposedId;
    };

    /**********************/
    /* ELEMENTS SELECTION */
    /**********************/
    $scope.selectAllEnabled     = false;
    $scope.checkedElements      = {};
    $scope.uncheckedElements    = {};

    //When a checkbox status change, this method is triggered
    $scope.checkboxChange   = function(){
        if($scope.selectAllEnabled){
            $scope.uncheckedElements = tableInteractionsService.getNewElements($scope.tableData, $scope.checkboxList, $scope.selectAllEnabled, 'id', $scope.uncheckedElements);
        }
        else{
            $scope.checkedElements = tableInteractionsService.getNewElements($scope.tableData, $scope.checkboxList, $scope.selectAllEnabled, 'id', $scope.checkedElements);
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

    $scope.updatePageSize   = function() {
        $cookieStore.put("pageSizeFlagDetails", $scope.itemsPerPage);
        $scope.getItems();

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

    // Modal preparation
    $scope.prepareModal = function(){
        $scope.getAllItems();
    };

    //Gets all the flagging rules
    $scope.getAllItems  = function(){
        communicationService.getRuleItems.get({id:$cookieStore.get('searchApp_currentFlagRule'), page:1, resultsPerPage:10000}).$promise //10000 is the limit?
            .then(function(results){
                results.items   = composeId(results.items);
                if($scope.selectAllEnabled){
                    $scope.namesToBeDeleted = tableInteractionsService.getElementsSelected(results.items, $scope.selectAllEnabled, $scope.uncheckedElements, 'id', ['value']);
                    $scope.countDeletedItems= tableInteractionsService.getCountElementsSelected(results.items, $scope.selectAllEnabled, $scope.uncheckedElements, 'id');
                }
                else{
                    $scope.namesToBeDeleted = tableInteractionsService.getElementsSelected(results.items, $scope.selectAllEnabled, $scope.checkedElements, 'id', ['value']);
                    $scope.countDeletedItems= tableInteractionsService.getCountElementsSelected(results.items, $scope.selectAllEnabled, $scope.checkedElements, 'id');
                }
            }, function(errResponse){
                messageService.addError('Error getting all flagging rule items.')(errResponse);
            });
    };
    /****************************/
    /* END - ELEMENTS SELECTION */
    /****************************/


    $scope.criteriaFieldUpdate  = function(){
        if($scope.selectedCriteria.value === "1"){         //Keywords
            return $scope.getKeywords();
        }
        else if($scope.selectedCriteria.value === "2"){    //Participants
            return $scope.getParticipants();
        }
    };
    
    $scope.validateNewItem = function() {
        var contentObject = {};

        var valid   = true;

        if ($scope.selectedCriteria && $scope.selectedCriteria.name && $scope.selectedCriteria.value) {
            contentObject.field = $scope.selectedCriteria.name;
            if ($scope.selectedCriteria.value === "0") {         //Text
                contentObject.value = $scope.textValue;
                if (contentObject.value.length === 0) {
                    valid = false;
                }
            } else if ($scope.selectedCriteria.value === "1" || $scope.selectedCriteria.value === "2") {   //Keywords or participants
                if ($scope.selectedFilter === '0' || $scope.selectedFilter === '1') {
                    contentObject.valueId = $scope.selectedValue.id;
                    if (contentObject.valueId === undefined) {
                        valid = false;
                    }
                }
            }
        } else {
            valid = false;
        }
        if ($scope.selectedFilter) {
            contentObject.filter = $scope.selectedFilter;
        } else {
            valid   = false;
        }
        if(!valid){
            messageService.addError('Error adding flagging rule item. All fields are required to create flagging rule')();
            return false;
        } 
        return contentObject;
    };

    $scope.updateItem = function(){

        var contentObject = $scope.validateNewItem();
        contentObject.id = parseInt($scope.editedTableDataRow["id"]);
        contentObject.createdDate = $scope.editedTableDataRow["createdDate"];
        var originalFlagType = parseInt($scope.editedTableDataRow["type"]);

        if (contentObject) {
            communicationService.updateRuleItem.put({id:$cookieStore.get('searchApp_currentFlagRule'), originalFlagRuleItemType: originalFlagType}, contentObject).$promise
                .then(function(results){
                    messageService.addSuccess('Flagging rule item updated')();
                    resetTableData();
                    $scope.resetModalDialog();
                }, function(errResponse){
                    messageService.addError('Error updating flagging rule item.')(errResponse);
                });
        }
    };  

    $scope.addItem = function(){

        var contentObject = $scope.validateNewItem();
        if (contentObject) {
            communicationService.addRuleItem.post({id:$cookieStore.get('searchApp_currentFlagRule')}, contentObject).$promise
                .then(function(results){
                    messageService.addSuccess('Added flagging rule item')();
                    resetTableData();
                    $scope.resetModalDialog();
                }, function(errResponse){
                    messageService.addError('Error adding flagging rule item.')(errResponse);
                });
        }
    };


    $scope.getRuleDefinition    = function(){
        $scope.criteriaFields   = [];
        var promise = communicationService.getRuleDefinition.get().$promise
            .then(function(results){
                for (var p in results) {
                    if( results.hasOwnProperty(p) ) {
                        if((p !== "$promise") && (p !== "$resolved")){ //Properties added in the response that are not part of the response
                            var singleObject    = {name:p, value:results[p]};
                            $scope.criteriaFields.push(singleObject);
                        }
                    }
                }
            }, function(errResponse){
                messageService.addError('Error getting flagging rule definition.')(errResponse);
            });
            return promise;
    };


    $scope.getParticipants  = function(){

        var promise = communicationService.getGroups.get().$promise
            .then(function(results){
                $scope.formValues   = [];
                for(var i = 0; i < results.groups.length; i++){
                    var singleObject    = {label:results.groups[i].name, id:results.groups[i].id};
                    $scope.formValues.push(singleObject);
                }
            }, function(errResponse){
                messageService.addError('Error getting custodians.')(errResponse);
            });
            return promise;
    };

    $scope.getKeywords  = function(){
        var promise = communicationService.getKeywords.get().$promise
            .then(function(results){

                $scope.formValues   = [];
                for(var i = 0; i < results.keywords.length; i++){
                    var singleObject    = {label:results.keywords[i].name, id:results.keywords[i].id};
                    $scope.formValues.push(singleObject);
                }
            }, function(errResponse){
                messageService.addError('Error getting keyrowCds.')(errResponse);
            });
            return promise;
    };

    //TABLE RELATED METHODS//
    var resetTableData  = function(){
        //To reload the table
        $scope.tableData        = undefined;
        $scope.btnDisabled   = true;
        $scope.checkboxList     = {};
        $scope.getItems();
        //End of table reload

        //Clear the name and description
        $scope.newName          = '';
        $scope.newDescription   = '';
    };

    //When the user click on a row
    $scope.rowClick = function(itemId){
        $scope.editedTableDataRow = $filter('filter')($scope.tableData, { id: itemId }, true)[0];
        $scope.getRuleDefinition().then(function() {
            $scope.selectedCriteria = $filter('filter')($scope.criteriaFields, { name: $scope.editedTableDataRow.field }, true)[0];    
            if ($scope.selectedCriteria.value === "0"){ //Text
                $scope.textValue = $scope.editedTableDataRow.value;
            } else {
                $scope.criteriaFieldUpdate().then(function() {
                    $scope.selectedValue.id = $scope.editedTableDataRow.valueId;    
                });
            }            
        });
        $scope.selectedFilter = $scope.editedTableDataRow.filter;
        var elementImage = angular.element('#addKeywordBatchPopup');
        elementImage.modal('show');
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
        $scope.bigCurrentPage = pageNo;
    };

    $scope.pageChanged = function() {
        $cookieStore.put('searchApp_ssCurrentPage', $scope.bigCurrentPage);
        resetTableData();
        //$route.reload();
    };
    //END - PAGINATION METHODS


    //INFO SECTION METHODS
    var removeUnnecessaryInfoFields = function(){
        delete $scope.ruleInfo["id"];
        delete $scope.ruleInfo["groupId"];
        delete $scope.ruleInfo["modifiedById"];
        delete $scope.ruleInfo["userId"];

    };
    //END - INFO SECTION METHODS


    //API REQUEST METHODS//
    //Get the keyword information
    $scope.getRuleInfo  = function(){
        communicationService.getRuleInfo.get({id:$cookieStore.get('searchApp_currentFlagRule')}).$promise
            .then(function(results){
                $scope.ruleName  = results["name"];  //Extracting the name to set the page title
                $scope.ruleInfo  = results;

                //Date formatting
                if(results.createdDate && results.modifiedDate){
                    var a1   = results.createdDate.split(" ");
                    var d1   = a1[0].split("-");
                    var t1   = a1[1].split(":");
                    var formattedDate1 = new Date(d1[0],(d1[1]-1),d1[2],t1[0],t1[1]);
                    $scope.ruleInfo.createdDate   = $filter('date')(formattedDate1, 'yyyy-MM-dd HH:mm');
                    var a2   = results.createdDate.split(" ");
                    var d2   = a2[0].split("-");
                    var t2   = a2[1].split(":");
                    var formattedDate2 = new Date(d2[0],(d2[1]-1),d2[2],t2[0],t2[1]);
                    $scope.ruleInfo.modifiedDate   = $filter('date')(formattedDate2, 'yyyy-MM-dd HH:mm');
                }

                removeUnnecessaryInfoFields();
                //Get the items of the keyword to populate the table
                $scope.getItems();
            }, function(errResponse){
                messageService.addError('Error getting flagging rule info.')(errResponse);
            });
    };


    //getKeywordItems
    $scope.getItems = function(){
        communicationService.getRuleItems.get({id:$cookieStore.get('searchApp_currentFlagRule'), page:$scope.bigCurrentPage, resultsPerPage:$scope.itemsPerPage}).$promise
            .then(function(results){
                $scope.tableData    = composeId(results.items);
                footerService.setResultInfo($scope.bigCurrentPage, $scope.itemsPerPage, results.count);
                updateCheckboxes();
            }, function(errResponse){
                messageService.addError('Error getting flagging rule items.')(errResponse);
            });
    };

    //Delete a list of items
    $scope.delete       = function(){
        $http({headers: {
            'Authorization': $cookieStore.get("searchApp_token"),
            "Content-Type":"application/json"},
            url: Environment.getRestapiHost() + '/restapi/services/rule/'+$cookieStore.get('searchApp_currentFlagRule')+'/item',
            method: 'DELETE',
            data: tableInteractionsService.getExtractedIdsAndTypesToDelete($scope.tableData, $scope.checkboxList)
        }).then(function(res) {
            messageService.addSuccess('Flagging rule item deleted')();
            $scope.namesToBeDeleted = ''; //Clears the names of the deleted elements
            resetTableData();
            clearTrackingLists();
        }, function(errResponse) {
            messageService.addError('Error deleting flagging rule item.')(errResponse);
        });
    };
    //END - API REQUEST METHODS

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

    $scope.saveName     = function(){
        var contentObject               = {};
        contentObject.name              = $scope.ruleInfo["name"];
        contentObject.description       = $scope.ruleInfo["description"];

      if(contentObject.name === "" || contentObject.description === ""){
        messageService.addSuccess('Name and Description values must be fill out.')();
        return;
      }

        communicationService.updateRule.put({id:$cookieStore.get('searchApp_currentFlagRule')}, contentObject).$promise
            .then(function(results) {
                messageService.addSuccess('Flagging rule updated')();
                $scope.editToggle();
            }, function(errResponse) {
                messageService.addError('Error updating flagging rule.')(errResponse);
            });
    };

    $scope.pageDelete   = function(){
        $http({headers:{
            'Authorization': $cookieStore.get("searchApp_token"),
            "Content-Type":"application/json"},
            url: Environment.getRestapiHost() + '/restapi/services/rule',
            method: 'DELETE',
            data: [{id:$cookieStore.get('searchApp_currentFlagRule')}]
        }).then(function(res) {
            $timeout(function(){$location.path('/manageFlagRules');}, 250);
        }, function(errResponse) {
            messageService.addError('Error deleting flagging rule.')(errResponse);
        });
    };

    //ON PAGE LOAD
    //Check if the page was stored in a cookie
    if($cookieStore.get('searchApp_ssCurrentPage') && ($cookieStore.get('searchApp_ssCurrentPage') !== '')){
        $scope.bigCurrentPage   = $cookieStore.get('searchApp_ssCurrentPage');
    }
    else{
        //If the page was not stored, then load the table from the first page
        $cookieStore.put('searchApp_ssCurrentPage', 1);
    }

    $scope.getRuleInfo();

});