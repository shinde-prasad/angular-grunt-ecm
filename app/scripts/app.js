'use strict';

var searchApp = angular.module('searchApp', ['ngRoute','ngResource', 'ngSanitize', 'ngCookies', 'ngMessages', 'ui.bootstrap', 'pascalprecht.translate', 'googlechart', 'angular-loading-bar', 'ngFileUpload', 'ADM-dateTimePicker', 'angularjs-dropdown-multiselect', 'LZW', 'ngAudio', 'summernote']);
searchApp.config(function ($routeProvider, $locationProvider, $qProvider) {
    
    $qProvider.errorOnUnhandledRejections(false);
    $locationProvider.hashPrefix('');
    
    var originalWhen = $routeProvider.when;
    
    $routeProvider.when = function(path, route) {
        if (route.templateUrl) {
            route.activetab = route.activetab || route.templateUrl.replace(/^.+\/(\w+).html$/, '$1');
        }
        route.resolve || (route.resolve = {});
        angular.extend(route.resolve, {
              auth: ["$q", "$location", "loginService", function($q, $location, loginService) {
                  if ($location.$$path === "/login") {
                      return $q.when(true);
                  }
                  var authenticated = loginService.isAuthenticated();
                  if (authenticated) {
                      return $q.when(true);
                  } else {
                      return $q.reject('Your session has expired, please log in again.');                      
                      //$location.url('/login');
                  }
              }],
            landingPageData: function ($q, welcomeService) {
                return welcomeService.initData(false).then(function (value) {
                    return $q.when(value);
                });
            }
                   
        });
        return originalWhen.call($routeProvider, path, route);
    };    
    
  $routeProvider
    .when('/', {
        templateUrl: 'views/partials/search.html',
        controller: 'searchCtrl',
        tabtitle: 'New Search',
        resolve: {
            formControlData: function ($q, channelSelectionService, loginService) {
                if (loginService.isAuthenticated()) {
                    return channelSelectionService.initFields(false).then(function (value) {
                        return $q.when(value);
                    });
                }
            }
        }
    })
    .when('/results', {
      templateUrl:    'views/partials/searchResults.html',
      controller:     'resultsPageCtrl',
      tabtitle:       'Search results',
      resolve: {   
          formControlData: function($q, channelSelectionService, loginService) {
              if (loginService.isAuthenticated()) {
                  return channelSelectionService.initFields(false).then(function (value) {
                        return $q.when(value);
                  });
              }
          }
        }
     })
    .when('/test', {
      templateUrl: '../views/partials/test/test.html',
      controller: 'testCtrl'
    })
    .when('/login', {
      templateUrl: 'views/partials/login.html',
      controller: 'loginCtrl',
      tabtitle:   'Login'      
    })
    .when('/help', {
      templateUrl: 'views/partials/help.html',
      controller: 'helpCtrl',
      tabtitle:   'Help'      
    })
    .when('/manageSearches', {
      templateUrl: 'views/partials/manageSearches.html',
      controller: 'savedSearchCtrl',
      tabtitle:   'Manage Searches'
    })
    .when('/manageCollections', {
      templateUrl: 'views/partials/manageCollections.html',
      controller: 'manageCollectionsCtrl',
      tabtitle:   'Manage Collections'      
    })
    .when('/collectionDetails', {
      templateUrl: 'views/partials/collectionDetails.html',
      controller: 'collectionDetailsCtrl',
      tabtitle:   'Collection Details'      
    })
    .when('/collaborationGroup', {
      templateUrl: 'views/partials/collaborationGroup.html',
      controller: 'collaborationGroupCtrl',
      tabtitle:   'Collaboration Group'      
    })
    .when('/manageFlagRules', {
      templateUrl:  'views/partials/manageFlagRules.html',
      controller:   'manageFlagRulesCtrl',
      tabtitle:     'Manage Flagging Rules'
    })
    .when('/flagDetails', {
      templateUrl:  'views/partials/flagDetails.html',
      controller:   'flagDetailsCtrl',
      tabtitle:     'Flagging Rule details'      
    })
    .when('/manageKeywords', {
      templateUrl:  'views/partials/manageKeywords.html',
      controller:   'manageKeywordsCtrl',
      tabtitle:     'Manage Keywords'      
    })
    .when('/keywordDetails', {
      templateUrl:  'views/partials/keywordDetails.html',
      controller:   'keywordDetailsCtrl'
      })    
    .when('/manageExports', {
      templateUrl:  'views/partials/manageExports.html',
      controller:   'manageExportsCtrl',
      tabtitle:     'Manage Exports',
      resolve: {   
          formControlData: function($q, channelSelectionService, loginService) {
              if (loginService.isAuthenticated()) {
                  return channelSelectionService.initFields(false).then(function (value) {
                        return $q.when(value);
                  });
              }
          }
      }
      })
    .when('/exportDetails/:export', {
      templateUrl:  'views/partials/exportDetails.html',
      controller:   'exportDetailsCtrl',
      tabtitle:     'Export Details',      
      resolve: {   
          formControlData: function($q, channelSelectionService, loginService) {
              if (loginService.isAuthenticated()) {
                  return channelSelectionService.initFields(false).then(function (value) {
                        return $q.when(value);
                  });
              }
          }
      }
      })
    .when('/auditSearch', {
      templateUrl:  'views/partials/auditSearch.html',
      controller:   'auditSearchCtrl',
      tabtitle:     'Audit Search'            
    })
    .when('/auditDetails', {
      templateUrl:  'views/partials/auditDetails.html',
      controller:   'auditDetailsCtrl',
      tabtitle:     'Audit Details'
    })
    .when('/manageUsers', {
      templateUrl:  'views/partials/manageUsers.html',
      controller:   'manageUsersCtrl',
      tabtitle:     'Manage Users',         
      reloadOnSearch: false
    })
    .when('/userDetails', {
      templateUrl:  'views/partials/userDetails.html',
      controller:   'userDetailsCtrl',
      tabtitle:     'User Details'            
    })
    .when('/manageGroups', {
      templateUrl:  'views/partials/manageGroups.html',
      controller:   'manageGroupsCtrl',
      tabtitle:     'Manage Groups'            
    })
    .when('/groupDetails', {
      templateUrl:  'views/partials/groupDetails.html',
      controller:   'groupDetailsCtrl',
      tabtitle:     'Group Details'            
    })
    .when('/userGroupDetails', {
      templateUrl:  'views/partials/userDetails.html',
      controller:   'mainPageCtrl',
      tabtitle:     'User Group Details'
    })
    .when('/indexDashboard', {
      templateUrl:  'views/partials/indexDashboard.html',
      controller:   'indexDashboardCtrl',
      tabtitle:     'Index Dashboard'            
    })
   .when('/error', {
        templateUrl: 'views/partials/error.html',
        controller:  'errorCtrl',
        tabtitle:    'Error'            
    })    
   .when('/manageWelcome', {
        templateUrl: 'views/partials/manageWelcome.html',
        controller:  'manageWelcomeCtrl',
        tabtitle:    'Manage Welcome Page'
    })    
    
    .otherwise({
      redirectTo: '/',
      title: ''
    });
});

searchApp.config(['ADMdtpProvider', function(ADMdtp) {
  ADMdtp.setOptions({
    calType: 'gregorian',
    format: 'YYYY-MM-DD hh:mm',
    multiple: false,
    zIndex: 10001,
    autoClose:true
  });
}]);

searchApp.run(function ($rootScope, savedSearchService, channelSelectionService, searchResultsService, $cookieStore, $route, $location, messageService, lzw, loginService, modelDomainService, footerService) {

    $rootScope.$on("$routeChangeStart", function (event, current, previous, rejection) {
        if (previous && (/^manage(Keywords|FlagRules|Users|Groups)$/.test(previous.$$route.activetab) || /^(keyword|flag|user|group)Details$/.test(previous.$$route.activetab))) {
            channelSelectionService.initFields(true);
            searchResultsService.reset();
        }
    });
    
    $rootScope.$on("$routeChangeError", function (event, current, previous, rejection) {
        if (!loginService.isAuthenticated()) {
            messageService.addWarning('Your session has expired, please log in again.', {groups: ['login'], targetViews: ['login']})();  
            $location.url("/login");
        } else {
            messageService.addWarning("Cannot route to \"" + current.$$route.tabtitle + "\" page because of errors.")(rejection);
            $rootScope.failedRoute = current; 
            $location.url("/error");
        }
    });
    
    $rootScope.$on("$routeChangeSuccess", function (event, current, previous, rejection) {
        footerService.reset();
        if ($rootScope.currentModal) {
            $rootScope.currentModal.modal("hide");
            delete $rootScope.currentModal;
        }
        if (current.$$route.activetab !== 'error') {
            messageService.filterByOptions({targetViews: [$route.current.$$route.activetab]});
        }
        if (current.$$route.activetab === 'exportDetails') {
            modelDomainService.set("export");
            channelSelectionService.reset();
        } else {
           modelDomainService.set("global");
        }
        delete $rootScope.failedRoute;
    });    
    
    
    var collectCookieData = function () {
        return {
            activeTab: channelSelectionService.getActiveTab().getId(),
            fields: channelSelectionService.channels.global.collectCriteriaWithInfo().fields,
            savedSearch: {id: savedSearchService.getId(), name: savedSearchService.getName()}
        };
    };
    
    $rootScope.$watch(collectCookieData, function(newItem, oldItem) {
        var COOKIE = 'ecm_fields-' + modelDomainService.get() + '-' + loginService.getUser();
        if (!$route.current) {
            if ($cookieStore.get(COOKIE) !== 'undefined') {
                channelSelectionService.initFields(false).then(function() {
                    try {                    
                        var uncompressed = lzw.decompress($cookieStore.get(COOKIE));
                        var data = JSON.parse(uncompressed);
                    } catch (e) {
                        console.log("Error parsing compressed cookie: " + uncompressed);
                    }
                    channelSelectionService.setActiveTab(data.activeTab, false);
                    channelSelectionService.channels.global.populateFromFields(channelSelectionService.channels, data.fields);                
                    savedSearchService.setData(data.savedSearch);
                    // console.log("Page reload. Loaded criteria: " + JSON.stringify(channelSelectionService.channels.global.collectCriteriaWithInfo().fields));
                });
            }
        } else {
            var plain = JSON.stringify(newItem);
            var compressed = lzw.compress(plain);
//            console.log("Model change: " + plain);
            $cookieStore.put(COOKIE, compressed);
            if ($route.current.$$route.activetab === 'search') {
                searchResultsService.validateResults();
            }
        }
    }, true); 
    
});
