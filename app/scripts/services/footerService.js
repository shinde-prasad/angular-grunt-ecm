'use strict';

searchApp.service('footerService', function ($cookieStore) {
    
    this.userInfo = 'Guest';
    this.connInfo = 'London, UK';
    this.resultInfo = {};

    this.resetResultInfo = function () {
        this.resultInfo = {};
    };
    
    this.setResultInfo = function (pageNumber, resultsPerPage, resultsCount) {
        if (resultsCount < 1) {
            this.resultInfo.firstPosition = 0;
        } else {
            this.resultInfo.firstPosition = pageNumber * resultsPerPage - (resultsPerPage - 1);
        }
        this.resultInfo.resultsCount = resultsCount;
        this.resultInfo.lastPosition = pageNumber * resultsPerPage;
        if (this.resultInfo.resultsCount < this.resultInfo.lastPosition) {
            this.resultInfo.lastPosition = this.resultInfo.resultsCount;
        }
    };
    
    this.getResultInfo = function() {
        return this.resultInfo;
    };
    
    this.reset = function() {
        this.resetResultInfo();
    };

    if($cookieStore.get('searchApp_user') && ($cookieStore.get('searchApp_user') !== '')){
        this.userInfo    = $cookieStore.get('searchApp_user');
    }
});
