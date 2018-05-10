searchApp.directive('hasPermission', function (loginService) {
    return {
        link: function (scope, element, attrs) {
            var disableOnly = angular.isString(attrs.hpDisableOnly);

            if (!angular.isString(attrs.hasPermission)) {
                throw 'hasPermission value must be a string';
            }
            var values = attrs.hasPermission.trim().split(',');

            function toggleVisibilityBasedOnPermission() {
                var hasPermission = false;
                angular.forEach(values, function(value) {
                    var notPermissionFlag = value[0] === '!';
                    if (notPermissionFlag) {
                        value = value.slice(1).trim();
                    }
                    if (loginService.hasPermission(value) && !notPermissionFlag || !loginService.hasPermission(value) && notPermissionFlag) {
                        hasPermission = true;
                    }
                });
                if (hasPermission) {
                    if (disableOnly) {
                        $(element[0]).find('input, select').each(function(i, e) {
                            e.disabled = false;
                        });
                    } else {
                        element[0].style.display = 'block';
                    }
                } else {
                    if (disableOnly) {
                        $(element[0]).find('input, select').each(function(i, e) {
                            e.disabled = true;
                        });
                    } else {
                        element[0].style.display = 'none';
                    }
                }
            }

            toggleVisibilityBasedOnPermission();
            scope.$on('permissionsChanged', toggleVisibilityBasedOnPermission);
        }
    };
});