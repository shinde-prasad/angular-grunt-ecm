'use strict';

searchApp.directive('channelField', function (modelDomainService, FieldTypeEnum) {
    return {
        restrict: 'AE',
        replace: 'true',
        templateUrl: 'views/directives/channelField.html',
        scope: {
            field: '=channelField',
            labelSize: '@?chfLabelSize'
        },
        link: function($scope, element, attrs) {
            $scope.modelDS = modelDomainService;

            if (attrs.hasOwnProperty('chfTypeahead') || $scope.field.getType() === FieldTypeEnum.TYPEAHEAD) {
                $scope.typeahead = true;
            }
            if ($scope.labelSize && $scope.field.getCaption()) {
                $scope.inputSize = 12 - $scope.labelSize;                
            } else {
                $scope.labelSize = 12;
                $scope.inputSize = 12;
            }
        }

    };
});

