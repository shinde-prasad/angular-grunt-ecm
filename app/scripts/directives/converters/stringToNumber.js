searchApp.directive('stringToNumber', function() {
    return {
        require: 'ngModel',
        link: function(scope, ele, attr, ctrl) {
            ctrl.$parsers.unshift(function(value){
                return '' + value;
            });            
            ctrl.$formatters.push(function(value){
                return parseFloat(parseFloat(value).toFixed(2));
            });
        }
    };
});