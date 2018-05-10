'use strict';

searchApp.service('welcomeService', function ($q, $rootScope, Shortcodes, communicationService, messageService, $route) {
    
    var root = this;
    
    this.getContent = function() {
        if ($route.current.$$route.activetab === 'manageWelcome' && root.landingPageData) {
            return root.landingPageData.parsedContent4Preview;            
        } else if (root.landingPageData) {
            return root.landingPageData.parsedContent;
        }
    };
    
    this.setPreviewData = function(content) {
        try {
            root.landingPageData.parsedContent4Preview = Shortcodes.parser.parse(content, root.messagesData);
            return true;
        } catch (e) {
            return false;
        }
    };

    this.openWelcomeModal = function () {
        var modalContainer = angular.element('#welcomeModal');
        $rootScope.currentModal = modalContainer;
        modalContainer.modal('show', {backdrop: 'static', keyboard: false});
    };

    this.getLandingPageData = function() {
        return communicationService.getLandingPage.get({id: 1}).$promise
            .then(function (result) {
                root.landingPageData = result;
                return result;
            }, function (errResponse) {
                messageService.addError('Error loading landing page.')(errResponse);
            });
        };
    
    this.getMessagesData = function () {
        return communicationService.getMessages.get({page: 1, resultsPerPage: 10000, sortBy: 'priority:desc'}).$promise
                .then(function (result) {
                    root.messagesData = result.messages;                    
                    return result;
                }, function (errResponse) {
                    messageService.addError('Error loading landing page messages.')(errResponse);
                });
    };
    
    this.initData = function(force) {
        if (!this.landingPagePromise || force) {
            this.landingPagePromise = this.getLandingPageData();
        }
        if (!this.messagesPromise || force) {
            this.messagesPromise = this.getMessagesData();
        }
        return $q.all([ this.landingPagePromise, this.messagesPromise]).then(function() {
            if (root.landingPageData) {
                try {
                    if ((!root.landingPageData.parsedContent || force) && !root.landingPageData.invalid) {
                        root.landingPageData.parsedContent = Shortcodes.parser.parse(root.landingPageData.content, root.messagesData);
                    }
                } catch (e) {
                    root.landingPageData.invalid = true;
                }
            }
        });
    };
    
    this.isLandingPageAvailable = function() {
        return root.landingPageData && root.landingPageData.parsedContent && root.landingPageData.published;
    };
    
    this.reset = function() {
        delete this.landingPagePromise;
        delete this.messagesPromise;        
    };

});