
'use strict';

/*
 Communication Service
 */


searchApp.service('communicationService', function ($resource, Environment) {

    /********************/
    /** SEARCH RESULTS **/
    /********************/

    //Search results
    this.getResultsWithAPI = $resource(Environment.getRestapiHost() + '/restapi/services/document',{},{
        post:{
            method:"POST",
            headers:{"Content-Type":"application/json"}
        }
    });

    //Result details
    this.getSearchItem = $resource(Environment.getRestapiHost() + '/restapi/services/document',{},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });

    //Update status
    this.updateStatus = $resource(Environment.getRestapiHost() + '/restapi/services/document',{},{
        put:{
            method:"PUT",
            headers:{"Content-Type":"application/json"}
        }
    });

    //Update legal hold
    this.updateRetention = $resource(Environment.getRestapiHost() + '/restapi/services/document/retention',{},{
        put:{
            method:"PUT",
            headers:{"Content-Type":"application/json"},
            isArray:true
        }
    });

    //Get attachments name
    this.getAttachmentsName     = $resource(Environment.getRestapiHost() + '/restapi/services/document/attachment',{},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"},
            isArray:true
        }
    });

    this.downloadDocuments      = $resource(Environment.getRestapiHost() + '/restapi/services/document/export',{},{
        post:{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            responseType:"arrayBuffer"
        }
    });

    //Download an attachment
    /*this.downloadAttachment = $resource(Environment.getRestapiHost() + '/restapi/services/document/attachment/download',{},{
        post:{
            method:"POST",
            headers:{"Content-Type":"application/json"}
        }
    });*/

    /********************/
    /** SAVED SEARCHES **/
    /********************/

    //Save search/query
    this.saveQuery = $resource(Environment.getRestapiHost() + '/restapi/services/document/saved',{},{
        post:{
            method:"POST",
            headers:{"Content-Type":"application/json"}
        }
    });

    //Get saved searches
    this.getQueries = $resource(Environment.getRestapiHost() + '/restapi/services/document/saved',{},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });

    this.getQuery   = $resource(Environment.getRestapiHost() + '/restapi/services/document/saved/:id',{id:"@id"},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });

    this.updateQuery   = $resource(Environment.getRestapiHost() + '/restapi/services/document/saved/:id', {id:"@id"},{
        put:{
            method:"PUT",
            headers:{"Content-Type":"application/json"},
            params:{param:"@content"}
        }
    });


    /*************************/
    /** COLLABORATION GROUP **/
    /*************************/

    //Get collaboration group information
    this.getCollaborationGroupInfo = $resource(Environment.getRestapiHost() + '/restapi/services/group/collaboration',{},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });

    //Get collaboration group members
    ///restapi/services/group/:id/member?page=1&resultsPerPage=20
    this.getCollaborationGroupMembers = $resource(Environment.getRestapiHost() + '/restapi/services/group/:id/member',{id:"@id"},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });


    /*****************/
    /** COLLECTIONS **/
    /*****************/

    //Get managed collections
    this.getCollections = $resource(Environment.getRestapiHost() + '/restapi/services/collection',{},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });

    //Get collections document
    this.getCollectionDocuments = $resource(Environment.getRestapiHost() + '/restapi/services/collection/:id/document',{id:"@id"},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });

    // Add new collection
    this.addCollection = $resource(Environment.getRestapiHost() + '/restapi/services/collection',{},{
        post:{
            method:"POST",
            headers:{"Content-Type":"application/json"}
        }
    });

    // Add new collection
    this.mergeCollection = $resource(Environment.getRestapiHost() + '/restapi/services/collection/:id/document',{id:"@id"},{
        post:{
            method:"POST",
            headers:{"Content-Type":"application/json"}
        }
    });

    // Get collection information
    this.getCollectionInfo = $resource(Environment.getRestapiHost() + '/restapi/services/collection/:id',{id:"@id"},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });

    // Update collection
    this.updateCollection = $resource(Environment.getRestapiHost() + '/restapi/services/collection/:id',{id:"@id"},{
        put:{
            method:"PUT",
            headers:{"Content-Type":"application/json"}
        }
    });


    /***********/
    /** USERS **/
    /***********/

    //Logout
    this.logout = $resource(Environment.getRestapiHost() + '/restapi/services/user/logout',{},{
        post:{
            method:"POST",
            headers:{"Content-Type":"application/json"}
        }
    });

    this.login = $resource(Environment.getRestapiHost() + '/restapi/services/user/login',{}, {
        post: {
            method: "POST",
            headers: {'Content-Type': 'application/json'}
        }
    });

    /**************/
    /** EXPORTS **/
    /**************/

    //Exports
    this.addExport = $resource(Environment.getRestapiHost() + '/restapi/services/export',{},{
        post:{
            method:"POST",
            headers:{"Content-Type":"application/json"}
        }
    });

    this.getExports = $resource(Environment.getRestapiHost() + '/restapi/services/export',{},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });

    this.getExport = $resource(Environment.getRestapiHost() + '/restapi/services/export/:id',{id:"@id"},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });

  this.getExport = $resource(Environment.getRestapiHost() + '/restapi/services/export/:id',{id:"@id"},{
    get:{
      method:"GET",
      headers:{"Content-Type":"application/json"}
    }
  });


    this.updateExport = $resource(Environment.getRestapiHost() + '/restapi/services/export/:id',{id:"@id"},{
        put:{
            method:"PUT",
            headers:{"Content-Type":"application/json"}
        }
    });

    /**************/
    /** KEYWORDS **/
    /**************/

    //Keywords
    this.addKeyword = $resource(Environment.getRestapiHost() + '/restapi/services/keyword',{},{
        post:{
            method:"POST",
            headers:{"Content-Type":"application/json"}
        }
    });

    this.getKeywords = $resource(Environment.getRestapiHost() + '/restapi/services/keyword',{},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });

    //Get keyword information
    this.getKeywordInfo = $resource(Environment.getRestapiHost() + '/restapi/services/keyword/:id',{id:"@id"},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });

    //Add terms to keyword
    this.addTermsToKeyword  = $resource(Environment.getRestapiHost() + '/restapi/services/keyword/:id/term',{id:"@id"},{
        post:{
            method:"POST",
            headers:{"Content-Type":"application/json"}
        }
    });

    //Get terms of keywords
    this.getKeywordTerms  = $resource(Environment.getRestapiHost() + '/restapi/services/keyword/:id/term',{id:"@id"},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });

    //Update keyword
    this.updateKeyword = $resource(Environment.getRestapiHost() + '/restapi/services/keyword/:id',{id:"@id"},{
        put:{
            method:"PUT",
            headers:{"Content-Type":"application/json"}
        }
    });


    /********************/
    /** FLAGGING RULES **/
    /********************/

    //Participant rules
    this.getRules = $resource(Environment.getRestapiHost() + '/restapi/services/rule',{},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });

    this.addRule = $resource(Environment.getRestapiHost() + '/restapi/services/rule',{},{
        post:{
            method:"POST",
            headers:{"Content-Type":"application/json"}
        }
    });

    //Get rule information
    this.getRuleInfo = $resource(Environment.getRestapiHost() + '/restapi/services/rule/:id',{id:"@id"},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });

    //Get items of rule
    this.getRuleItems  = $resource(Environment.getRestapiHost() + '/restapi/services/rule/:id/item',{id:"@id"},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });

    //Add rule item
    this.addRuleItem  = $resource(Environment.getRestapiHost() + '/restapi/services/rule/:id/item',{id:"@id"},{
        post:{
            method:"POST",
            headers:{"Content-Type":"application/json"}
        }
    });
    
    //Add rule item
    this.updateRuleItem  = $resource(Environment.getRestapiHost() + '/restapi/services/rule/:id/item',{id:"@id"},{
        put:{
            method:"PUT",
            headers:{"Content-Type":"application/json"}
        }
    });    

    //Update rule
    this.updateRule = $resource(Environment.getRestapiHost() + '/restapi/services/rule/:id',{id:"@id"},{
        put:{
            method:"PUT",
            headers:{"Content-Type":"application/json"}
        }
    });

    this.getRuleDefinition = $resource(Environment.getRestapiHost() + '/restapi/services/rule/definition',{},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });


    /******************/
    /** AUDIT SEARCH **/
    /******************/

    //AUDIT SEARCH
    this.getAuditResults = $resource(Environment.getRestapiHost() + '/restapi/services/audit/search',{},{
        post:{
            method:"POST",
            headers:{"Content-Type":"application/json"}
        }
    });

    this.getAuditItemInfo   = $resource(Environment.getRestapiHost() + '/restapi/services/audit/:id',{id:"@id"},{
        get:{
            method:"get",
            headers:{"Content-Type":"application/json"}
        }
    });


    /******************/
    /** PARTICIPANTS **/
    /******************/

    // Get users
    this.getUsers = $resource(Environment.getRestapiHost() + '/restapi/services/participant',{},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });

  // Add user
  this.getUsersbyId = $resource(Environment.getRestapiHost() + '/restapi/services/participant/ids',{},{
    post:{
      method:"POST",
      headers:{"Content-Type":"application/json"}
    }
  });

    // Add user
    this.addUser = $resource(Environment.getRestapiHost() + '/restapi/services/participant',{},{
        post:{
            method:"POST",
            headers:{"Content-Type":"application/json"}
        }
    });

    // Get users
    this.getUserInfo = $resource(Environment.getRestapiHost() + '/restapi/services/participant/:id',{id:"@id"},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });

    // Update user
    this.updateUser = $resource(Environment.getRestapiHost() + '/restapi/services/participant/:id',{id:"@id"},{
        put:{
            method:"PUT",
            headers:{"Content-Type":"application/json"}
        }
    });

    // Get content sources (identifiers)
    this.getContentSources = $resource(Environment.getRestapiHost() + '/restapi/services/participant/:id/identifier',{id:"@id"},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });

    // Add content source (identifier)
    this.addContentSource = $resource(Environment.getRestapiHost() + '/restapi/services/participant/:id/identifier',{id:"@id"},{
        post:{
            method:"POST",
            headers:{"Content-Type":"application/json"}
        }
    });
    
    this.updateContentSource  = $resource(Environment.getRestapiHost() + '/restapi/services/participant/:id/identifier/:iid',{id:"@id", iid:"@iid"},{
        put:{
            method:"PUT",
            headers:{"Content-Type":"application/json"}
        }
    });      

  // Get Participant group history
  this.getParticipantGroupHistory = $resource(Environment.getRestapiHost() + '/restapi/services/participant/history',{},{
    get:{
      method:"GET",
      headers:{"Content-Type":"application/json"}
    }
  });

  // Add content source (identifier)
  this.getFilters = $resource(Environment.getRestapiHost() + '/restapi/services/participant/filters',{},{
    post:{
      method:"GET",
      headers:{"Content-Type":"application/json"}
    }
  });

    /************************/
    /** Config             **/
    /************************/

    // Get groups
    this.getCountries = $resource(Environment.getRestapiHost() + '/restapi/services/config/country',{},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });


    /************************/
    /** PARTICIPANT GROUPS **/
    /************************/

    // Get groups
    this.getGroups = $resource(Environment.getRestapiHost() + '/restapi/services/participantgroup',{},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });

    // Get group info
    this.getGroupInfo = $resource(Environment.getRestapiHost() + '/restapi/services/participantgroup/:id',{id:"@id"},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });

    // Update group
    this.updateGroup = $resource(Environment.getRestapiHost() + '/restapi/services/participantgroup/:id',{id:"@id"},{
        put:{
            method:"PUT",
            headers:{"Content-Type":"application/json"}
        }
    });

    // Get group users
    this.getGroupUsers = $resource(Environment.getRestapiHost() + '/restapi/services/participantgroup/:id/member',{id:"@id"},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });

  // Get group users
  this.getGroupFilters = $resource(Environment.getRestapiHost() + '/restapi/services/participantgroup/:id/filters',{id:"@id"},{
    get:{
      method:"GET",
      headers:{"Content-Type":"application/json"}
    }
  });

  // Add user to group
  this.addUserToGroup = $resource(Environment.getRestapiHost() + '/restapi/services/participantgroup/:id/member',{id:"@id"},{
    post:{
      method:"POST",
      headers:{"Content-Type":"application/json"}
    }
  });


    /***********/
    /** NOTES **/
    /***********/

    // Get notes
    this.getNotes   = $resource(Environment.getRestapiHost() + '/restapi/services/note',{},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });

    // Get notes
    this.addNote   = $resource(Environment.getRestapiHost() + '/restapi/services/note',{},{
        post:{
            method:"POST",
            headers:{"Content-Type":"application/json"}
        }
    });

    /*********************/
    /** COMPLIANCE NOTES **/
    /*********************/

  this.addComplianceNote   = $resource(Environment.getRestapiHost() + '/restapi/services/compliancenote',{},{
    post:{
      method:"POST",
      headers:{"Content-Type":"application/json"}
    }
  });

  // Get notes
  this.getParticipantNotes   = $resource(Environment.getRestapiHost() + '/restapi/services/compliancenote',{},{
    get:{
      method:"GET",
      headers:{"Content-Type":"application/json"}
    }
  });

    /*********************/
    /** INDEX DASHBOARD **/
    /*********************/

    this.getAllIndex    = $resource(Environment.getRestapiHost() + '/restapi/services/indexstatus/status',{},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });

    // Get Namespaces
    this.getNamespaces  = $resource(Environment.getRestapiHost() + '/restapi/services/indexstatus/namespace',{},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });

    // Get VerGBIndexing
    this.getVerGBIndexing   = $resource(Environment.getRestapiHost() + '/restapi/services/indexstatus/namespace/VerGBIndexing',{},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });

    // Get VerNLIndexing
    this.getVerNLIndexing   = $resource(Environment.getRestapiHost() + '/restapi/services/indexstatus/namespace/VerNLIndexing',{},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });

    // Get EmlGBIndexing
    this.getEmlGBIndexing   = $resource(Environment.getRestapiHost() + '/restapi/services/indexstatus/namespace/EmlGBIndexing',{},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });

    // Get EmlNLIndexing
    this.getEmlNLIndexing   = $resource(Environment.getRestapiHost() + '/restapi/services/indexstatus/namespace/EmlNLIndexing',{},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });

    // Get ReuGBIndexing
    this.getReuGBIndexing   = $resource(Environment.getRestapiHost() + '/restapi/services/indexstatus/namespace/ReuGBIndexing',{},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });

    // Get ReuNLIndexing
    this.getReuNLIndexing   = $resource(Environment.getRestapiHost() + '/restapi/services/indexstatus/namespace/ReuNLIndexing',{},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        }
    });


    /*************/
    /** FOLDERS **/
    /*************/
    // Get directory names
    this.getDirectoryNames  = $resource(Environment.getRestapiHost() + '/restapi/services/folder',{},{
        get:{
            method:"GET",
            headers:{"Content-Type":"application/json"},
            isArray:false
        }
    });

    //Get export path
    this.getExportPath = $resource(Environment.getRestapiHost() + '/restapi/services/folder/exportpath', {},{
        get:{
          method: "GET",
          headers:{"Content-Type":"application/json"},
          isArray:false
        }
    });

    // Add a new directory
    this.addDirectory  = $resource(Environment.getRestapiHost() + '/restapi/services/folder',{},{
        post:{
            method:"POST",
            headers:{"Content-Type":"application/json"}
        }
    });
    
    /**************/
    /** LANDING PAGE **/
    /**************/
    
    this.createLandingPage = $resource(Environment.getRestapiHost() + '/restapi/services/landingpages',{},{
        post:{
            method:"POST",
            headers:{"Content-Type":"application/json"}
        }
    });    

    this.updateLandingPage = $resource(Environment.getRestapiHost() + '/restapi/services/landingpages/:id',{id:"@id"},{
        put:{
            method:"PUT",            
            headers:{"Content-Type":"application/json"}
        }
    });
    
    this.getLandingPage = $resource(Environment.getRestapiHost() + '/restapi/services/landingpages/:id',{id:"@id"},{
        get:{
            method:"GET",            
            headers:{"Content-Type":"application/json"}
        }
    });    
    
    this.deleteLandingPage = $resource(Environment.getRestapiHost() + '/restapi/services/landingpages/:id',{id:"@id"},{
        delete:{
            method:"DELETE",            
            headers:{"Content-Type":"application/json"}
        }
    });    
    
    this.createMessage = $resource(Environment.getRestapiHost() + '/restapi/services/landingpages/messages',{},{
        post:{
            method:"POST",            
            headers:{"Content-Type":"application/json"}
        }
    });
    
    this.updateMessage = $resource(Environment.getRestapiHost() + '/restapi/services/landingpages/messages/:id', {id:"@id"},{
        put:{
            method:"PUT",            
            headers:{"Content-Type":"application/json"}
        }
    });    

    this.getMessages = $resource(Environment.getRestapiHost() + '/restapi/services/landingpages/messages',{},{
        get:{
            method:"GET",            
            headers:{"Content-Type":"application/json"}
        }
    });
    
    this.deleteMessages = $resource(Environment.getRestapiHost() + '/restapi/services/landingpages/messages',{},{
        delete:{
            method:"DELETE",            
            headers:{"Content-Type":"application/json"}
        }
    });    

});