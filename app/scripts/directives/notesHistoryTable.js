'use strict';

searchApp.directive('notesHistoryTable', function($compile, $filter) {
    return {
        restrict: 'AE',
        replace: 'true',
        template: '<div></div>',
        compile: function () {
            return function (scope, element) {


                var tablesStringCode   = '';

                //The content of each row is generated using the following string to avoid performance problems.
                //With this the ng-repeat is going to bind only the entire string instead of the different fields
                if((scope.notesData) && (scope.notesData.length > 0)) {

                    tablesStringCode += '<div class="col-md-12">';
                    tablesStringCode += '<div ><hr></div>';
                    tablesStringCode += '<h3 style="padding-top: 18px">Notes History</h3>';
                    var currRow;       //Current list
                    var currHeader;     //Current column header
                    var currRow;        //Current row
                    var headers;        //Full list of headers for a row
                    var currValue;      //Current value in a row


                    tablesStringCode += '<table class="table table-striped table-responsive table-hover">';
                    tablesStringCode += '<thead>';
                    tablesStringCode += '<tr>';
                    //Populating the table column headers
                    for (var i = 0; i < Object.getOwnPropertyNames(scope.notesData[0]).length; i++) {
                        currHeader = Object.getOwnPropertyNames(scope.notesData[0])[i];
                        if(scope.discardedFields.indexOf(currHeader) === -1) {    //If the header is not in the list of discarded fields, then add the data
                            tablesStringCode   += '<th>{{\''+currHeader+'\' | translate}}</th>';
                        }
                    }
                    tablesStringCode += '</tr>';
                    tablesStringCode += '</thead>';

                    //Table body
                    tablesStringCode += '<tbody>';
                    for (var i = 0; i < scope.notesData.length; i++) {
                        currRow = scope.notesData[i];
                        //Getting the header names
                        headers = Object.getOwnPropertyNames(scope.notesData[i]);
                        tablesStringCode += '<tr>';

                        //Populate the row
                        for (var j = 0; j < headers.length; j++) {
                            if(scope.discardedFields.indexOf(headers[j]) === -1) {    //If the header is not in the list of discarded fields, then add the data
                                currValue = scope.notesData[i][headers[j]];
                                tablesStringCode += '<td>' + currValue + '</td>';
                            }
                        }
                        tablesStringCode += '</tr>';
                    }

                    tablesStringCode += '</tbody>';
                    tablesStringCode += '</table>';


                    tablesStringCode += '</div>';

                    tablesStringCode    += '<nav class="text-center rabo-color-orange">';
                    tablesStringCode    +=      '<ul uib-pagination ng-show="itemsPerPage<footerData.getResultInfo().resultsCount" total-items="footerData.getResultInfo().resultsCount" ng-model="currentPage" max-size="maxSize" class="pagination rabo-color-blue rabo-clear-border rabo-clear-bg" boundary-links="true" ng-click="pageChanged()" previous-text="&lsaquo;" next-text="&rsaquo;" first-text="&laquo;" last-text="&raquo" items-per-page="itemsPerPage"></ul>';
                    tablesStringCode    += '</nav>';

                }

                var newRow = $compile(tablesStringCode)(scope);
                element.append(newRow);
            }
        }
    }
});
