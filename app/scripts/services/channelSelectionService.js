'use strict';

searchApp.service('modelDomainService', function () {
    
    this.modelAttribute = 'global';
    this.set = function(att) { this.modelAttribute = att; };
    this.get = function() { return this.modelAttribute; };
   
})

/* Data structures inside this service are used as a model for channel selection checkboxes - property "checked" is added to nodes */
.service('channelSelectionService', function ($q, $filter, $timeout, communicationService, messageService, Channel, Field, FieldScopeEnum, FieldTypeEnum) {

    var _s = this;
    
    var parentChannels = {
        
        global: new Channel({caption: {en: 'Global'}, glyph: 'glyphicon-globe', hasTab: true}, {
            startdate: new Field({caption: {en: 'Start Date'}, type: FieldTypeEnum.DATETIME}), enddate: new Field({caption: {en: 'End Date'}, type: FieldTypeEnum.DATETIME_TO}),
            keywords: new Field({caption: {en: 'Keywords'}}),
            deleted: new Field({apiName: '-deleted', caption: {en: 'Deleted'}, type: FieldTypeEnum.BOOLEAN, scope: FieldScopeEnum.FILTER, initValue: 'true'}),        
            participants: new Field({caption: {en: 'Custodian'}, type: FieldTypeEnum.OBJECT, options: function() {return communicationService.getUsers.get({page: 1, resultsPerPage: 10000}).$promise.then(
                function (data) {
                    return data.participants.map(function (item) {
                        var n = item.firstName + " " + item.lastName;
                        return {label: n + " (" + item.email + ")", id: item.id};
                    });               
                }, function (errResponse) {
                    messageService.addError("Loading of participants failed")(errResponse);
                    return $q.reject(errResponse);
                });
            }}),
            content: new Field({caption: {en: 'Content'}}), 
            flaggingRule: new Field({apiName: 'flag', caption: {en: 'Flagging Rule'}, initValue: '', type: FieldTypeEnum.OBJECT, options: function() {return communicationService.getRules.get({page: 1, resultsPerPage: 100}).$promise.then(
                function (data) {
                    var rules = [];
                    rules.push({label: '-- Select flagging rule --', id: ''});
                    angular.forEach(data.rules, function (item) {
                        rules.push({label: item.name, id: item.id});
                    });
                    return rules;
                }, function (errResponse) {
                    messageService.addError("Loading of flagging rules failed")(errResponse);
                    return $q.reject(errResponse);
                });
            }}),
            country: new Field({caption: {en: 'Country / LE'}, type: FieldTypeEnum.OBJECTARRAY, scope: FieldScopeEnum.FILTER | FieldScopeEnum.CHANNEL, initValue: [], settings: {smartButtonMaxItems: 2}, options: function() {return communicationService.getCountries.get().$promise.then(
                function (data) {
                    return data.countries.map(function (item) {   
                        return {id: item.id, label: item.name};
                    });
                }, function (errResponse) {
                    messageService.addError("Loading of countries failed")(errResponse);
                    return $q.reject(errResponse);
                });
            }}),
            sortBy: new Field({caption: {en: 'Sort by'}, type: FieldTypeEnum.OBJECT, scope: FieldScopeEnum.QUERY, initValue: 'relevancy:desc',
                options: [
                    {id: 'relevancy:desc', label: 'Relevancy DESC', dir: 'desc'},
                    {id: 'change-time:desc', label: 'Date DESC', dir: 'desc'},
                    {id: 'change-time:asc', label: 'Date ASC', dir: 'asc'},                    
                    {id: 'legal-hold:desc', label: 'Legal Hold DESC', dir: 'desc'},
                    {id: 'legal-hold:asc', label: 'Legal Hold ASC', dir: 'asc'},
                    {id: 'title:desc', label: 'Title DESC', dir: 'desc'},
                    {id: 'title:asc', label: 'Title ASC', dir: 'asc'},                    
                    {id: 'participants:desc', label: 'Participants DESC', dir: 'desc'},
                    {id: 'participants:asc', label: 'Participants ASC', dir: 'asc'},                    
                    {id: 'namespace:desc', label: 'Content Type DESC', dir: 'desc'},
                    {id: 'namespace:asc', label: 'Content Type ASC', dir: 'asc'},                  
                    {id: 'call-duration:desc', label: 'Call duration DESC', dir: 'desc'},
                    {id: 'call-duration:asc', label: 'Call duration ASC', dir: 'asc'},                    
                    {id: 'has-attachment:desc', label: 'Has attachment DESC', dir: 'desc'},
                    {id: 'has-attachment:asc', label: 'Has attachment ASC', dir: 'asc'},                    
                    {id: 'attachment-size:desc', label: 'Size of Attachment DESC', dir: 'desc'},
                    {id: 'attachment-size:asc', label: 'Size of Attachment ASC', dir: 'asc'}                    
                ]
            }),
            resultsPerPage: new Field({caption: {en: 'Page size'}, type: FieldTypeEnum.OBJECT, scope: FieldScopeEnum.QUERY, initValue: '50',
                options: [
                    {id: '10', label: '10'}, {id: '20', label: '20'}, {id: '30', label: '30'}, {id: '40', label: '40'}, {id: '50', label: '50'}, {id: '100', label: '100'}
                ]
            }),
            namespace: new Field({caption: {en: 'Channel'}, type: FieldTypeEnum.OBJECT, scope: FieldScopeEnum.FILTER, initValue: 'global',
                options: function() {return $timeout(function() {
                    var tabs = $filter('filter')(_s.getChannelsAsArray(), {config: {hasTab:true}});
                    return $.map(tabs, function(tab) {
                        return {id: tab.getApiName(), label: tab.getCaption(), glyph: tab.getGlyph()};
                    });
                }, 100);
            }}),
            page: new Field({caption: {en: 'Page'}, type: FieldTypeEnum.NUMBER, scope: FieldScopeEnum.QUERY, initValue: '1'})
        }),
//        icechat: new Channel({caption: {en: 'ICE Chat'}, glyph: 'glyphicon-comment', hasTab: true}),
//        skype: new Channel({caption: {en: 'Skype'}, glyph: 'fa fa-skype fa-lg', hasTab: true}), 
        voice: new Channel({apiName: 'verint', caption: {en: 'Voice'}, glyph: 'glyphicon-headphones', hasTab: true}, {
            duration: new Field({caption: {en: 'Duration from (sec)'}, type: FieldTypeEnum.NUMBER}), endduration: new Field({caption: {en: 'Duration to (sec)'}, type: FieldTypeEnum.NUMBER})
        }),  
        bloomberg: new Channel({caption: {en: 'Bloomberg'}, glyph: 'glyphicon-bold', hasTab: true}),
        reuters: new Channel({caption: {en: 'Reuters'}, glyph: 'glyphicon-comment', hasTab: true}),
        algomi: new Channel({caption: {en: 'Algomi'}, glyph: 'glyphicon-font', hasTab: true}, {
            isincode: new Field({caption: {en: 'ISIN Code'}}), orderid: new Field({caption: {en: 'Order ID'}}), clientdescription: new Field({caption: {en: 'Client'}})
        })
    };
    
    // childChannels can link - share search fields from parentChannels
    var childChannels = {
        
        email: new Channel({apiName: 'email', hasTab: true, caption: {en: 'Email'}, glyph:'glyphicon-envelope'}, {
            from: new Field({caption: {en: 'From'}, type: FieldTypeEnum.EMAIL}), to: new Field({caption: {en: 'To'}, type: FieldTypeEnum.EMAIL}), subject: new Field({caption: {en: 'Subject'}}),
            globalFields: parentChannels.global.fields
        }),
        voiceMobile: new Channel({apiName: 'mobile', caption: {en: 'Mobile'}, glyph: 'glyphicon-phone'}, {
            phonenumber: new Field({caption: {en: 'Phone Number'}}), participants: new Field({caption: {en: '???'}}),
            duration: parentChannels.voice.fields.duration, endduration: parentChannels.voice.fields.endduration,
            globalFields: parentChannels.global.fields
        }),
        voiceDealerboard: new Channel({apiName: 'dealerboard', caption: {en: 'Dealer Board'}, glyph: 'glyphicon-earphone'}, {
            // participants: new Field({caption: {en: 'Participants'}}),
            phoneid: new Field({caption: {en: 'Phone ID'}}),
            traderId: new Field({caption: {en: 'Trader ID'}}),
            duration: parentChannels.voice.fields.duration, endduration: parentChannels.voice.fields.endduration,
            globalFields: parentChannels.global.fields            
        }),
        voiceDesktopPhone: new Channel({apiName: 'desktopphone', caption: {en: 'Desktop Phone'}, glyph: 'glyphicon-phone-alt'}, {
            calltype: new Field({caption: {en: 'Call Type'}, type: FieldTypeEnum.OBJECT, initValue: [], settings: {smartButtonMaxItems: 2}, 
                options: [
                    {id: 'inbound outbound', label: 'All'},
                    {id: 'inbound' , label: 'Inbound'},
                    {id: 'outbound', label: 'Outbound'}                    
                ]
            }), 
            phoneid: new Field({caption: {en: 'Extension'}}),
            // calledpartyid: new Field({caption: {en: 'Called Party'}}), callingpartyid: new Field({caption: {en: 'Calling Party'}}),
            duration: parentChannels.voice.fields.duration, endduration: parentChannels.voice.fields.endduration,
            globalFields: parentChannels.global.fields            
        }),
        skypeVoice: new Channel({apiName: 'skype', caption: {en: 'Skype'}, glyph: 'fa fa-skype fa-lg', hasTab: true}, {
            duration: new Field({caption: {en: 'Duration from (sec)'}, type: FieldTypeEnum.NUMBER}), endduration: new Field({caption: {en: 'Duration to (sec)'}, type: FieldTypeEnum.NUMBER}),
            from: new Field({caption: {en: 'From'}}), to: new Field({caption: {en: 'To'}}), type: new Field({caption: {en: 'Type'}}),
            globalFields: parentChannels.global.getFields().filter(function(f) {return f !== parentChannels.global.fields.keywords;})
        }),
        bloombergInstant: new Channel({apiName: 'instant', caption: {en: 'Instant'}, glyph: 'glyphicon-bold'}, {
            globalFields: parentChannels.global.fields
        }),
        bloombergMessaging: new Channel({apiName: 'messaging', caption: {en: 'Messaging'}, glyph: 'glyphicon-bold'}, {
            from: new Field({caption: {en: 'From'}}), to: new Field({caption: {en: 'To'}}), subject: new Field({caption: {en: 'Subject'}}),
            globalFields: parentChannels.global.fields            
        }),
        reutersMessenger: new Channel({apiName: 'messenger', caption: {en: 'Messenger'}, glyph: 'glyphicon-comment'}, {
            globalFields: parentChannels.global.fields
        }),
        reutersRcd: new Channel({apiName: 'rcd', caption: {en: 'RCD'}, glyph: 'glyphicon-comment'}, {
            from: new Field({caption: {en: 'From'}}), to: new Field({caption: {en: 'To'}}), tui: new Field({caption: {en: 'Transaction Code'}}),
            globalFields: parentChannels.global.fields            
        }),
        algomiHoneycomb: new Channel({apiName: 'honeycomb', caption: {en: 'Honeycomb'}, glyph: 'glyphicon-font'}, {
            isincode: parentChannels.algomi.fields.isincode, orderid: parentChannels.algomi.fields.orderid, clientdescription: parentChannels.algomi.fields.clientdescription,
            globalFields: parentChannels.global.fields            
        }), 
        algomiSynchronicity: new Channel({apiName: 'synchronicity', caption: {en: 'Synchronicity'}, glyph: 'glyphicon-font'}, {
            isincode: parentChannels.algomi.fields.isincode, orderid: parentChannels.algomi.fields.orderid, clientdescription: parentChannels.algomi.fields.clientdescription,
            globalFields: parentChannels.global.fields            
        }),
        icechatChat: new Channel({apiName: 'icechat', caption: {en: 'ICE Chat'}, glyph: 'glyphicon-comment', hasTab: true}, {
            from: new Field({caption: {en: 'From'}}), to: new Field({caption: {en: 'To'}}), subject: new Field({caption: {en: 'Subject'}}),
            globalFields: parentChannels.global.fields            
        })
    };
    
    var ch = angular.extend({}, parentChannels, childChannels);
    
    var channelHierarchy = {
        all: angular.extend(ch.global, {subChannels: [
                ch.email,                
                ch.icechatChat,
                ch.skypeVoice,
                angular.extend(ch.voice, {subChannels: [ch.voiceMobile, ch.voiceDealerboard, ch.voiceDesktopPhone]}),
                angular.extend(ch.bloomberg, {subChannels: [ch.bloombergInstant, ch.bloombergMessaging]}),
                angular.extend(ch.reuters, {subChannels: [ch.reutersMessenger, ch.reutersRcd]}),
                angular.extend(ch.algomi, {subChannels: [ch.algomiHoneycomb, ch.algomiSynchronicity]})
            ]})
    };
    
    angular.forEach(ch, function(channel, key){
        angular.extend(channel, {
            id: key,
            channelHierarchy: channelHierarchy,            
            getId: function() {
                return this.id;
            },
            isActiveTab: function() {
                return this === _s.getActiveTab();
            }
        });
    });
    
    this.channelHierarchy = channelHierarchy;
    this.channels = ch;
    
    this.reset = function() {
       this.channels.global.reset(true);
    };
    
    this.getChannelsAsArray = function () {
        return $.map(this.channels, function (val) {
            return val;
        });
    };
    
    this.initFields = function(forceInit) {
        var deferredFields = [];
        angular.forEach(this.channels.global.getFields(), function(field) {
            if (field.initOptions && (!field.options || forceInit)) {
                deferredFields.push(field.initOptions(forceInit));
                console.debug("Loading optons for: " + field.getCaption());                
            }
        });
        return $q.all(deferredFields);
    };
    
    this.setActiveTab = function (activeChannel, selectChannels) {
        this.channels.global.reset(false);
        if (!(activeChannel instanceof Channel)) {
            activeChannel = this.channels[activeChannel];
        }
        this.activeTab = activeChannel;
        if (selectChannels && activeChannel !== this.channels.global) {
            activeChannel.setChecked(true);
        }
        activeChannel.click();
    };

    this.getActiveTab = function () {
        return this.activeTab || this.channels.global;
    };     

});

searchApp.filter('contentSourcesOnly', function () {
  return function (items) {
    return items.filter(function (item) {
      return !(angular.isDefined(item.subChannels));
    });      
  };
});