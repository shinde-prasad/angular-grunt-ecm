
'use strict';

searchApp.controller('loginCtrl', function ($scope, $location, footerService, loginService, messageService) {

    $scope.user;
    $scope.password;
    $scope.loginRoles = loginService.loginRoles;

    $scope.login = function () {
        loginService.authenticate(true, $scope.user, $scope.password, $scope.role).then(
                function () {
                    footerService.showLastLoginCount = -1;
                    $location.url('/');                        
                },
                function (err) {
                    switch (err.status) {
                        case 401: messageService.addError("Incorrect user and/or password", {groups: ['login'], timeout: 5000, details: false})(err); break;
                        // case 403: messageService.addError("Incorrect user and/or password", {groups: ['login'], timeout: 5000, details: false})(err); break;                        
                        case 423: messageService.addError("Account is locked", {groups: ['login'], details: false})(err); break;
                        case 404: messageService.addError("Login service not avilable")(err); break;                                                
                        case 500: messageService.addError("Server error")(err); break;                        
                        default: messageService.addError("Login failed")(err); break;
                    }
                });
    };

});

