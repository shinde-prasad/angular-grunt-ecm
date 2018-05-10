'use strict';

searchApp.service('loginService', function ($q, $rootScope, $filter, $cookieStore, $location, communicationService, footerService, welcomeService) {
    var root = this;
    
    this.loginRoles = [{id: 'visitor', label: 'Visitor'}, {id: 'user', label: 'User'},{id: 'admin', label: 'Administrator'}];    
    
    this.setUser = function(user, token, role) {
        $cookieStore.put('searchApp_user', user);
        $cookieStore.put("searchApp_token", token);
        $cookieStore.remove("searchApp_landingPage");
        
        var userPermissions = [role];
        $cookieStore.put("searchApp_permissions", userPermissions);
        
//        var found = false;
//        angular.forEach(this.loginRoles, function(item) {
//            if (!found) {
//                userPermissions.push(item);
//                if (item.id === role.id) {
//                    found = true;
//                }
//            }
//        });
//        if (found) {
//            $cookieStore.put("searchApp_permissions", userPermissions);
//        } else {
//            $cookieStore.put("searchApp_permissions", []);            
//        }
    };
    
    this.getUser = function() {
        return $cookieStore.get("searchApp_user");       
    };

    this.isAuthenticated = function () {
        return (typeof $cookieStore.get("searchApp_token") === 'string');
    }; 

    this.hasPermission = function (role) {
        var permissionList = $cookieStore.get("searchApp_permissions");
        if (permissionList) {
            role = role.trim();
            return $filter('filter')(permissionList, {id: role}).length > 0;
        } else {
            return false;
        }
    };

    this.authenticate = function (forceLogin, inputUser, inputPassword, inputRole) {
        if ($cookieStore.get("searchApp_token") && !forceLogin) {
            return $q.defer().promise;
        }
        return communicationService.login.post({"user": inputUser, "password": inputPassword}).$promise
                .then(function (results) {
                    root.setUser(inputUser, results.token.token, inputRole);
                    footerService.userInfo = inputUser;
                    footerService.lastLogin = results.lastLogin;
                    footerService.showLastLogin = true;
                    welcomeService.reset();
                    $rootScope.$broadcast('permissionsChanged', {});                                    
                    return results;
                }, function (errResponse) {
                    return $q.reject(errResponse);
                });
    };

    this.logout = function () {
        communicationService.logout.post().$promise
                .then(function () {
                    $cookieStore.remove("searchApp_token");
                    $rootScope.$broadcast('permissionsChanged', {});            
                    $location.url('/login');
                }, function (errResponse) {}
            );
    };
    
    this.openLandingPage = function() {
        if (!$cookieStore.get("searchApp_landingPage") && welcomeService.isLandingPageAvailable()) {
            welcomeService.openWelcomeModal();
            $cookieStore.put("searchApp_landingPage", true);
        }
    };

});

