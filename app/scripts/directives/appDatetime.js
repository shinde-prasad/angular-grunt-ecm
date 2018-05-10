searchApp.directive('appDatetime', function ($window) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                var moment = $window.moment;

                ngModel.$formatters.push(formatter);
                ngModel.$parsers.push(parser);

                element.on('change', function (e) {
                    var element = e.target;
                    element.value = formatter(ngModel.$modelValue);
                });

                function parser(value) {
                    var m = moment(value);
                    var valid = m.isValid();
                    ngModel.$setValidity('datetime', valid);
                    if (valid) return m.valueOf();
                    else return value;
                }

                function formatter(value) {
                    var m = moment(value);
                    var valid = m.isValid();

                    if (valid) return m.format("YYYY-MM-DD HH:mm");
                    else return value;

                }

            } //link
        };

    }); //appDatetime