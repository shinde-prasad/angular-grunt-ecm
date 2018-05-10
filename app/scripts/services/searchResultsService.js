'use strict';

searchApp.service('searchResultsService', function ($q, channelSelectionService, communicationService, messageService) {
    
    this.setResults = function (data, criteria) {
        this.usedCriteria = criteria;
        this.data = data;
   };
    this.getSearchCriteria = function() {
        return this.usedCriteria ? this.usedCriteria.criteria : null;
    };
    this.getSearchInfo = function() {
        return this.usedCriteria ? this.usedCriteria.info : null;
    };    
    this.getCount = function () {
        return this.data ? this.data.total : 0;
    };
    this.getFacets = function () {
        return this.data ? this.data.facets : null;
    };
    this.getHighlights = function () {
        return this.data ? this.data.highlights : null;
    };
    this.hasResults = function() {
        return this.data;
    };
    this.validateResults = function() {
        if (this.usedCriteria && !angular.equals(this.prepareSearchCriteriaWithInfo().criteria, this.usedCriteria.criteria)) {
            this.reset();
        }
    };
    this.reset = function () {
        delete this.data;
        delete this.usedCriteria;
    };
    
    this.prepareSearchCriteriaWithInfo = function () {
        var collectedData = channelSelectionService.channels.global.collectCriteriaWithInfo();
        var criteria = {activeTab: channelSelectionService.getActiveTab().id};
        angular.extend(criteria, collectedData.query);                      
        criteria.contentSourceFilters = collectedData.csFilters;
        if (collectedData.filters) {
            criteria.filters = $.map(collectedData.filters, function(value, key) { var o = {}; o[key]=value; return o;});
        }
        return {criteria: criteria, info: collectedData.info};
    };
    
    this.populateFromSearchCriteria = function (criteria) {
        channelSelectionService.reset();
        channelSelectionService.setActiveTab(criteria.activeTab ? criteria.activeTab : 'global', false);
        channelSelectionService.channels.global.populateFromContentSourceFilters(criteria.contentSourceFilters);
        if (criteria.sortBy) {
            channelSelectionService.channels.global.fields.sortBy.setValue(criteria.sortBy);
        }
        if (criteria.resultsPerPage) {
            channelSelectionService.channels.global.fields.resultsPerPage.setValue(criteria.resultsPerPage);
        }
    };
  
    this.getResults = function (parameters) {

        var searchCriteriaWithInfo = this.prepareSearchCriteriaWithInfo();
        if (parameters) {
            angular.extend(searchCriteriaWithInfo.criteria, parameters);
        }
        if (this.getSearchCriteria() && this.data) {
            if (angular.equals(this.getSearchCriteria(), searchCriteriaWithInfo.criteria)) {
                return $q.when(this.data);
            }
        }
        var t = this;
        return communicationService.getResultsWithAPI.post(searchCriteriaWithInfo.criteria).$promise
                .then(function (data) {
                    t.setResults(data, searchCriteriaWithInfo);
                    return data;
                }, function (errResponse) {
                    if (errResponse.status === 400) {
                        messageService.addError("Error getting results")(errResponse);
                    } else {
                        messageService.addError("Error getting results")(errResponse);
                    }
                    return $q.reject(errResponse);
                });
    };
});