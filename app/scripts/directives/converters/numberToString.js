searchApp.directive('numberToString', function() {
    return {
        require: 'ngModel',
        link: function(scope, ele, attr, ctrl) {
            ctrl.$parsers.unshift(function(value){
                return parseInt(value);
            });            
            ctrl.$formatters.push(function(value){
                return '' + value;
            });
        }
    };
});