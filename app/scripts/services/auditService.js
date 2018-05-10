
'use strict';

/*
 Collection Service
 */


searchApp.service('auditService', function () {
    this.currentAuditObject = {};

    this.setCurrentAuditObject  = function(cAuditObject){
        this.currentAuditObject = cAuditObject;
    };

    this.getCurrentAuditObject  = function(){
        return this.currentAuditObject;
    };
});
