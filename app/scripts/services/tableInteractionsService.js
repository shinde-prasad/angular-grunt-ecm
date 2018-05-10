'use strict';

/*
 Utility service that handles the interactions with the tables
 */

searchApp.service('tableInteractionsService', function () {

    this.getNamesToDelete = function(tableData, checkboxList, returnVal){
        var namesToDelete   = [];
        var idsToDelete     = this.getIdsArray(this.getIdsToDelete(checkboxList));
        for(var i = 0; i < tableData.length; i++){
            if(idsToDelete.indexOf(tableData[i]["id"].toString()) !== -1){ //Found
                namesToDelete.push(tableData[i][returnVal]);
            }
        }
        return namesToDelete;
    };

    this.getFullNamesToDelete = function(tableData, checkboxList){
        var namesToDelete   = [];
        var idsToDelete     = this.getIdsArray(this.getIdsToDelete(checkboxList));
        for(var i = 0; i < tableData.length; i++){
            if(idsToDelete.indexOf(tableData[i]["id"].toString()) !== -1){ //Found
                namesToDelete.push(tableData[i]["firstName"] + " " + tableData[i]["lastName"]);
            }
        }
        return namesToDelete;
    };

    this.getTermsToDelete = function(tableData, checkboxList){
        var namesToDelete   = [];
        var idsToDelete     = this.getIdsArray(this.getIdsToDelete(checkboxList));
        for(var i = 0; i < tableData.length; i++){
            if(idsToDelete.indexOf(tableData[i]["id"].toString()) !== -1){ //Found
                namesToDelete.push(tableData[i]["term"]);
            }
        }
        return namesToDelete;
    };


    this.getValuesToDelete = function(tableData, checkboxList){
        var namesToDelete   = [];
        var idsToDelete     = this.getIdsArray(this.getIdsToDelete(checkboxList));
        for(var i = 0; i < tableData.length; i++){
            if(idsToDelete.indexOf(tableData[i]["id"].toString()) !== -1){ //Found
                namesToDelete.push(tableData[i]["value"]);
            }
        }
        return namesToDelete;
    };


    this.getIdsToDelete   = function(checkboxList){
        var idsToDelete = [];
        for (var property in checkboxList) {
            if (checkboxList[property]) {
                idsToDelete.push({"id":property});
            }
        }
        return idsToDelete;
    };

    this.getIdsAndTypesToDelete   = function(tableData, checkboxList){
        var itemsToDelete   = [];
        var idsToDelete     = this.getIdsArray(this.getIdsToDelete(checkboxList));
        for(var i = 0; i < tableData.length; i++){
            if(idsToDelete.indexOf(tableData[i]["id"].toString()) !== -1){ //Found
                itemsToDelete.push({type:tableData[i]["type"], id:tableData[i]["id"]});
            }
        }
        return itemsToDelete;
    };


    this.extractId    = function(composedId){
        return composedId.split('-')[0];
    };

    this.getExtractedIdsAndTypesToDelete   = function(tableData, checkboxList){
        var itemsToDelete   = [];
        var idsToDelete     = this.getIdsArray(this.getIdsToDelete(checkboxList));
        for(var i = 0; i < tableData.length; i++){
            if(idsToDelete.indexOf(tableData[i]["id"].toString()) !== -1){ //Found
                itemsToDelete.push({type:tableData[i]["type"], id:this.extractId(tableData[i]["id"])});
            }
        }
        return itemsToDelete;
    };


    this.getIdsArray  = function(arrayOfObjects){
        var idsArray    = [];
        for(var i = 0; i < arrayOfObjects.length; i++){
            idsArray.push(arrayOfObjects[i]["id"]);
        }
        return idsArray;
    };

    // get first item id from table
    this.getFirstId  = function(arrayOfObjects){
        var idsArray    = [];
        for(var i = 0; i < 1; i++){
            idsArray.push(arrayOfObjects[i]["id"]);
        }
        return idsArray;
    };

    // get first checked item id from table
    this.getFirstCheckedId  = function(checkboxes){
        var idsArray            = [];
        var firstCheckedFound   = false;

        for(var i = 0; (i < Object.getOwnPropertyNames(checkboxes).length)&&(!firstCheckedFound); i++){
            if(checkboxes[Object.getOwnPropertyNames(checkboxes)[i]]){
                idsArray.push(Object.getOwnPropertyNames(checkboxes)[i]);
            }
        }

        return idsArray;
    };

    //Get all the ids in the tableData received as parameter
    //The tableData should be a list of objects, with each object having a property called 'id'
    this.getAllIdsInTableData = function(tableData){
        var idsArray    = [];
        for(var i = 0; i < tableData.length; i++){
            idsArray.push(tableData[i].id);
        }
        return idsArray;
    };


    this.getAllUrisInTableData = function(tableData){
        var urisArray    = [];
        for(var i = 0; i < tableData.length; i++){
            urisArray.push(tableData[i].uri);
        }
        return urisArray;
    };

    // get documents to delete (collection detail)
    this.getDocumentsToDelete = function(tableData, checkboxList){
        var namesToDelete   = [];
        var urisToDelete     = this.getUrisArray(this.getUrisToDelete(checkboxList));
        for(var i = 0; i < tableData.length; i++){
            if(urisToDelete.indexOf(tableData[i]["uri"].toString()) !== -1){ //Found
                namesToDelete.push(tableData[i]["uri"]); // now subject is epmty till time, when hitachi will fix it
            }
        }
        return namesToDelete;
    };

    // get uri array
    this.getUrisArray  = function(arrayOfObjects){
        var urisArray    = [];
        for(var i = 0; i < arrayOfObjects.length; i++){
            urisArray.push(arrayOfObjects[i]["uri"]);
        }
        return urisArray;
    };

    // get uri to delete
    this.getUrisToDelete   = function(checkboxList){
        var urisToDelete = [];
        for (var property in checkboxList) {
            if (checkboxList[property]) {
                urisToDelete.push({"uri":property});
            }
        }
        return urisToDelete;
    };

    // get collection to merge
    this.getCollectionsToMerge = function(tableData, checkboxList){
        var itemsToMerge = [];
        var idsToMerge = this.getIdsArray(this.getIdsToDelete(checkboxList));
        for(var i = 0; i < tableData.length; i++){
            if(idsToMerge.indexOf(tableData[i]["id"].toString()) !== -1){ //Found
                itemsToMerge.push({name:tableData[i]["name"], id:tableData[i]["id"]});
            }
        }
        return itemsToMerge;
    };

    // get list of users to add to a group
    this.getUsersToAddToGroup = function(tableData){
        var itemsToAdd = [];
        for(var i = 0; i < tableData.length; i++){
            itemsToAdd.push({name:tableData[i]["firstName"] + " " + tableData[i]["lastName"], id:tableData[i]["id"]});
        }
        return itemsToAdd;
    };


    /**********************/
    /* ELEMENTS SELECTION */
    /**********************/
    // Update the checked or unchecked list
    // If is select all then returns a list with unchecked values
    // If is not select all then returns a list with checked values
    this.getNewElements = function(table, pageCheckedElem, isSelectAll, identifier, trackingList){
        for(var i = 0; i < table.length; i++){
            if((table[i][identifier] in pageCheckedElem)&&(pageCheckedElem[table[i][identifier]])){
                //Checked
                if(isSelectAll){
                    delete trackingList[table[i][identifier]];  //Remove from checked list
                }
                else{
                    trackingList[table[i][identifier]]  = true; //Add to unchecked list
                }
            }
            else{
                //Not checked
                if(isSelectAll){
                    trackingList[table[i][identifier]]  = true; //Add to unchecked list
                }
                else{
                    delete trackingList[table[i][identifier]];  //Remove from checked list
                }
            }
        }
        return trackingList;
    };

    //Return the list of elements that are checked or unchecked in the page based in the tracking list and the select all status
    this.getCurrentPageList = function(table, isSelectAll, identifier, trackingList){
        //Traverse through the current page elements
        var pageElements = {};
        for(var i = 0; i < table.length; i++){
            if(table[i][identifier] in trackingList){//unchecked list
                if(isSelectAll){
                    pageElements[table[i][identifier]]  = false;
                }
                else{
                    pageElements[table[i][identifier]]  = true;
                }
            }
            else{
                if(isSelectAll){
                    pageElements[table[i][identifier]]  = true;
                }
                else{
                    pageElements[table[i][identifier]]  = false;
                }
            }
        }
        return pageElements;
    };

    //If the user click the select page button then the checkboxes in the page are checked
    //If all the checkboxes in the page are checked then unchecks all the checkboxes, otherwise checks all the checkboxes in the page
    this.getElementsFromSelectPage  = function(table, pageCheckboxes, identifier){
        var anyUnchecked    = false;
        for(var i = 0; (i < table.length)&&(!anyUnchecked); i++){
            if(!((table[i][identifier] in pageCheckboxes)&&(pageCheckboxes[table[i][identifier]]))){
                anyUnchecked    = true;
            }
        }

        for(var i = 0; i < table.length; i++){
            if(anyUnchecked){
                pageCheckboxes[table[i][identifier]]    = true;
            }
            else{
                pageCheckboxes[table[i][identifier]]    = false;
            }
        }
        return pageCheckboxes;
    };

    //Get all the current page checkboxes checked or unchecked based on the "allChecked" parameter
    this.getAllCheckedUnchecked = function(table, pageCheckboxes, identifier, allChecked){
        for(var i = 0; i < table.length; i++){
            if(allChecked){
                pageCheckboxes[table[i][identifier]]    = true;
            }
            else{
                pageCheckboxes[table[i][identifier]]    = false;
            }
        }
        return pageCheckboxes;
    };

    //Get if the actions buttons should be disabled
    this.getIsDisabled  = function(table, isSelectAll, trackingList, resultsCount, identifier){
        var btnDisabled = true;
        if(isSelectAll){
            if(Object.keys(trackingList).length >= resultsCount){
                btnDisabled  = true;
            }
            else{
                btnDisabled  = false;
            }
        }
        else{
            if(Object.keys(trackingList).length > 0){
                btnDisabled = false;
            }
            else{
                btnDisabled = true;
            }
        }
        return btnDisabled;
    };

    //Retrieve the retrieveFields (parameter) fields from the table row received as parameter
    this.getFields    = function(tableRow, retrieveFields){
        var fields  = '';
        for(var i = 0; i < retrieveFields.length; i++){
            if(i > 0){
                fields += ' '; //space
            }
            fields  += tableRow[retrieveFields[i]];
        }
        return fields;
    };

    //Get the name of the first five selected elements
    this.getElementsSelected    = function(table, isSelectAll, trackingList, identifier, retrieveFields){
        var selectedNames   = '';
        var selectedCount   = 0;
        if(!(((isSelectAll)&&(table.length <= Object.keys(trackingList).length))||((!(isSelectAll))&&(Object.keys(trackingList).length <= 0)))) {
            for (var i = 0; (i < table.length)&&(selectedCount < 6); i++) {
                if (isSelectAll) {//Unchecked list
                    if (!(table[i][identifier] in trackingList)) {
                        if((selectedCount > 0)&&(selectedCount < 5)){
                            selectedNames   += ', ';
                        }
                        if(selectedCount < 5) {
                            selectedNames += this.getFields(table[i], retrieveFields);
                        }
                        selectedCount++;
                    }
                }
                else {//Checked list
                    if (table[i][identifier] in trackingList) {
                        if((selectedCount > 0)&&(selectedCount < 5)){
                            selectedNames   += ', ';
                        }
                        if(selectedCount < 5){
                            selectedNames   += this.getFields(table[i], retrieveFields);
                        }
                        selectedCount++;
                    }
                }
                //if(table[i][identifier] in trackingList){}
            }
            if(selectedCount >= 6){
                selectedNames += ', ...';
            }
        }
        return selectedNames;
    };

    //Get the amount of selected elements
    this.getCountElementsSelected   = function(table, isSelectAll, trackingList, identifier){
        var selectedCount   = 0;
        for(var i = 0; i < table.length; i++){
            if(isSelectAll){
                if(!(table[i][identifier] in trackingList)){
                    selectedCount++;
                }
            }
            else{
                if(table[i][identifier] in trackingList){
                    selectedCount++;
                }
            }
        }
        return selectedCount;
    };
    /***************************/
    /* END - ELEMENTS SELECTION*/
    /***************************/


    this.getContentSourceFromUri    = function (table, uri) {
        var found           = false;
        var namespace   = '';

        for(var i = 0; (i < table.length)&&(!found); i++){
            if(table[i].uri === uri){
                namespace   = table[i].namespace;
                found           = true;
            }
        }

        return namespace;
    };

    this.getFullDocument    = function (table, uri) {
        var found           = false;
        var docValue   = '';

        for(var i = 0; (i < table.length)&&(!found); i++){
            if(table[i].uri === uri){
                docValue   = table[i];
                found           = true;
            }
        }

        return docValue;
    };



  this.setSortingDirection = function(currentSortDirection,field,dir){
    if(currentSortDirection[field] === undefined){
      currentSortDirection = {};
    }
    currentSortDirection[field] = dir;

    return currentSortDirection;
  };

});
