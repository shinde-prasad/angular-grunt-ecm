searchApp.directive('datetimeValidate', function (ValidationMethods) {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            scope.ctrl = ctrl;
            ctrl.$validators.datetimeValidator = function(modelValue, viewValue) {
                if (ctrl.$isEmpty(modelValue)) {
                    return true;
                }
                if (ValidationMethods.datetimeRegexp.test(modelValue.trim()) === false) {
                    return false;
                } else {
                    return true;
                }
            }; 
        }
    };
});