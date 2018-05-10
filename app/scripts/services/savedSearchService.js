'use strict';

searchApp.service('savedSearchService', function ($q, $cookieStore, $filter, $http, searchResultsService, channelSelectionService, communicationService, Environment, messageService) {

    this.isActive = function() {
        return this.getId() ? true : false;
    };
    
    this.getId = function () {
        if (this.ssData) {
            return this.ssData.id;
        }
    };
    
    this.setData = function(data) {
        this.ssData = data;
    };
    
    this.getName = function () {
        if (this.ssData) {
           return this.ssData.name;
        };
    };

    this.loadQuery = function (id) {
        if (!this.getId() || this.getId() !== id) {
            this.reset();
            var t = this;
            return communicationService.getQuery.get({id: id}).$promise.then(function (results) {
                t.setData(results);
                try {
                    searchResultsService.populateFromSearchCriteria(results.searchCriteria);
//                    messageService.addSuccess("Saved search \"" + t.getName() + "\" successfully loaded", {targetViews: ['search']})(); 
                } catch (e) {
                    messageService.addError("Saved search data parsing failed")(e);
                    channelSelectionService.reset();
                    t.reset();                    
                    return $q.reject(e);                    
                }
                return results;
            }, function (errResponse) {
                messageService.addError("Error loading saved search")(errResponse);
                return $q.reject(errResponse);
            });
        }
        ;
        return $q.when(this.ssData);
    };
    
    this.saveQuery = function (name) {
        var contentObject = {};
        contentObject.name = name;
        contentObject.searchCriteria = searchResultsService.prepareSearchCriteriaWithInfo().criteria;
        var t = this;
        return communicationService.saveQuery.post(contentObject).$promise
                .then(function (results) {
                    contentObject.id = results.savedSearchId;
                    t.ssData = contentObject;
                    messageService.addSuccess("Search \"" + t.getName() + "\" successfully saved")();                    
                    return $q.when(true);
                }, function (errResponse) {
                    messageService.addError("Error saving search")(errResponse);
                    return $q.reject(errResponse);
                });
    };
    
    this.updateQuery = function () {
        var contentObject = {};
        contentObject.name = this.getName();
        contentObject.searchCriteria = searchResultsService.prepareSearchCriteriaWithInfo().criteria;
        var t = this;
        return communicationService.updateQuery.put({id: t.getId()}, contentObject).$promise
                .then(function (results) {
                    contentObject.id = t.getId();                    
                    t.ssData = contentObject;
                    messageService.addSuccess("Search \"" + t.getName() + "\" successfully updated")();                    
                    return $q.when(true);
                }, function (errResponse) {
                    messageService.addError("Error updating saved search")(errResponse);
                    return $q.reject(errResponse);
                });
    };    

    this.getQueries = function (requestParams) {
        return communicationService.getQueries.get(requestParams).$promise
                .then(function (results) {
                    return results;
                }, function (errResponse) {
                    messageService.addError("Error getting saved searches")(errResponse);                    
                    return $q.reject(errResponse);
                });
    };
    
    this.deleteQueries = function (idsToDelete) {
        if (this.isActive() && $filter("filter")(idsToDelete, {id: this.getId()}).length > 0) {
            this.reset();
        }
        return $http({headers: {'Authorization': $cookieStore.get("searchApp_token"), "Content-Type": "application/json"}, url: Environment.getRestapiHost() + '/restapi/services/document/saved/', method: 'DELETE', data: idsToDelete}).then(function (res) {
            messageService.addSuccess("Sucessfully removed \"" + idsToDelete.length + "\" saved searches")();                                
            return $q.when(true);
        }, function (errResponse) {
            messageService.addError("Error removing saved searches")(errResponse);                    
            return $q.reject(errResponse);
        });
    };
    
    this.reset = function () {
        delete this.ssData;
    };
    
});
