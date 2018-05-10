
'use strict';

searchApp.controller('auditDetailsCtrl', function ($scope, $http, $cookieStore, $timeout, $location, $route, communicationService, footerService, tableInteractionsService, auditService) {

    $scope.auditInfo                = {};
    $scope.interactionObjectInfo    = {};
    $scope.sortableFields           = [];

    //Table related fields. Check scripts/directives/tableGenerator.js for documentation
    $scope.tableData            = [];
    $scope.discardedFields      = [];
    $scope.rowAttributes        = '';
    $scope.checkboxList         = {};
    $scope.addCheckbox          = false;
    $scope.checkboxAttributes   = '';
    $scope.rowIdentifier        = 'id';
    $scope.specialFields        = ['timestamp', 'createdDate', 'modifiedDate'];
    //End - Table related fields

    $scope.tableNames           = [];
    $scope.hasInteractionObject = false;


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


    //INFO SECTION METHODS
    var removeUnnecessaryInfoFields = function(){
        delete $scope.auditInfo["id"];
        delete $scope.auditInfo["interactionObject"];
        delete $scope.auditInfo["formattedInteractionObject"];
    };
    //END - INFO SECTION METHODS

    $scope.rowClick = function(){
        
    };

    //API REQUEST METHODS//
    //Get the keyword information
    $scope.getAuditInfo  = function(){
        //$scope.auditInfo        = $cookieStore.get('searchApp_currentAuditObject');
        $scope.auditInfo        = auditService.getCurrentAuditObject();
        var interactionObject   = eval("(" + $scope.auditInfo["interactionObject"] + ")");

        var tmpTableArray       = [];

        //Generating the interaction object tables:
        if(interactionObject) {
            $scope.hasInteractionObject = true;
            if ($.isArray(interactionObject)) {
                $scope.tableNames.push("Items");
                tmpTableArray.push(interactionObject);
            }
            else {
                for (var i = 0; i < Object.getOwnPropertyNames(interactionObject).length; i++) {
                    //Traverse through the properties of the interaction object
                    var currentProperty = Object.getOwnPropertyNames(interactionObject)[i];
                    if ($.isArray(interactionObject[currentProperty])) {
                        if (typeof interactionObject[currentProperty][0]  == 'object') {
                            $scope.tableNames.push(currentProperty);
                            tmpTableArray.push(interactionObject[currentProperty]);
                        }
                        else if (interactionObject[currentProperty].length == 1) {
                            $scope.interactionObjectInfo[currentProperty] = interactionObject[currentProperty];
                        }
                    }
                    else {
                        if (typeof interactionObject[currentProperty] == 'object') {
                            //console.log("Interaction object: "+currentProperty);
                            if (isNaN(currentProperty)) {
                                $scope.interactionObjectInfo[currentProperty] = interactionObject[currentProperty];
                            }
                            else {   //Is a number
                                $scope.interactionObjectInfo["[" + currentProperty + "]"] = JSON.stringify(interactionObject[currentProperty]); //1 -> [1]
                            }
                        }
                        else {
                            $scope.interactionObjectInfo[currentProperty] = interactionObject[currentProperty];
                        }
                    }
                }
            }

            //If there is at least one element in the new array of tables
            if(tmpTableArray.length > 0){
                for(var index = 0; index < tmpTableArray.length; index++) {
                    for(var i = 0; i < tmpTableArray[index].length; i++){   //Traverse through the elements
                        //Traverse through list of tables
                        for(var j = 0; j < Object.getOwnPropertyNames(tmpTableArray[index][i]).length; j++){
                            //Traverse through columns of each table
                            if((typeof tmpTableArray[index][i][Object.getOwnPropertyNames(tmpTableArray[index][i])[j]] == 'object')||($.isArray(tmpTableArray[index][i][Object.getOwnPropertyNames(tmpTableArray[index][i])[j]]))){
                                //Transform it to string when necessary
                                tmpTableArray[index][i][Object.getOwnPropertyNames(tmpTableArray[index][i])[j]] = JSON.stringify(tmpTableArray[index][i][Object.getOwnPropertyNames(tmpTableArray[index][i])[j]]);
                            }
                        }
                    }

                    var tableInfo = {};
                    tableInfo.name = $scope.tableNames[index];
                    tableInfo.data = tmpTableArray[index];
                    $scope.tableData.push(tableInfo)
                }
//                $scope.tableData    = tmpTableArray[0];
//                $scope.tablesData    = tmpTableArray;
            }

        }

        removeUnnecessaryInfoFields();
    };


    //Populate the rule information section
    $scope.getAuditInfo();

});

