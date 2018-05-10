'use strict';

searchApp.directive('results', function($compile, $filter, searchResultsService) {
  return {
      restrict: 'AE',
      replace: 'true',
      template: '<tr></tr>',
      compile: function () {
          return function (scope, element) {

              var singleResultRow   = '';

              var singleResultAttrs;
              //The content of each row is generated using the following string to avoid performance problems.
              //With this the ng-repeat is going to bind only the entire string instead of the different fields
              if(scope.result) {

                  singleResultAttrs = 'ng-click="rowClick(\''+scope.result.uri+'\',\''+scope.result.namespace+'\')" data-toggle="modal" data-target="#resultModal"';

/*
                  singleResultRow += '<td><label><input type="checkbox" checked="" ';
                  singleResultRow += 'ng-model="checkboxList[\'' + scope.tableData[i]["id"] + '\']"';
                  singleResultRow += ' '+scope.checkboxAttributes+'></label></td>';
*/

                  singleResultRow   += '<td><label><input id="hover" type="checkbox" checked=""></label></td>';
                  singleResultRow   += '<td '+singleResultAttrs+'>'+ scope.result.subject +'</td>';
                  singleResultRow   += '<td '+singleResultAttrs+'><span class="glyphicon glyphicon-comment"></span></td>';
                  singleResultRow   += '<td '+singleResultAttrs+'>'+ scope.result.status +'</td>';
                  singleResultRow   += '<td '+singleResultAttrs+'>'+ $filter('date')(new Date(scope.result["change-time"]), 'yyyy-MM-dd') +'</td>';
                  singleResultRow   += '<td '+singleResultAttrs+'>'+ scope.result["retention-class"] +'</td>';

              }

              var newRow = $compile(singleResultRow)(scope);
              element.append(newRow);

          }
      }
  }
});
