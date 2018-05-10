'use strict';

searchApp.directive('singleResult', function($compile, $filter) {
    return {
        restrict: 'AE',
        replace: 'true',
        template: '<div></div>',
        compile: function () {
            return function (scope, element) {

                var setHighlightMarkup    = function (text, highlights) {
                    var result = text;
                    var textExp = "";
                    for (var index = 0; index !== highlights.length;index++) {
                        textExp += "|" + highlights[index];
                    }

                    if (textExp.length > 0){
                        var keyText = textExp.substring(1);
                        if (keyText.indexOf("*") === -1 && keyText.indexOf("?") === -1 && keyText.indexOf(".") === -1) {
                            var exp = new RegExp(textExp.substring(1), 'gi');
                            result = result.replace(exp, function myFunction(x) {
                                return "<mark>" + x + "</mark>";
                            });
                        }
                    }
                    return result;
                };

                var tablesStringCode   = '';
                if (scope.preview) {
//                    var sourceContent   = "data:text/html;charset=utf-8,"+encodeURI(scope.preview);
                    tablesStringCode = '<iframe id="details" style="width: 100%;height:100%;min-height:300px;border:none"></iframe>';
                    tablesStringCode += "<script>var iframe = document.getElementById('details'),iframedoc = iframe.contentDocument || iframe.contentWindow.document;iframedoc.body.innerHTML = \"" + setHighlightMarkup(scope.preview, scope.highlights) +"\";</script>";
                }

                //The content of each row is generated using the following string to avoid performance problems.
                //With this the ng-repeat is going to bind only the entire string instead of the different fields
                else if(scope.resultData !== null && scope.resultData.lists !== null) {


                    tablesStringCode    += '<div class="col-md-12">';
                    var currList;       //Current list
                    var currHeader;     //Current column header
                    var currRow;        //Current row
                    var headers;        //Full list of headers for a row
                    var currValue;      //Current value in a row

                    for (var i = 0; i < Object.getOwnPropertyNames(scope.resultData.lists).length; i++) {
                        currList            = Object.getOwnPropertyNames(scope.resultData.lists)[i];

                        //Table title and header
                        tablesStringCode   += '<h3>'+currList+'</h3>';
                        //tablesStringCode   += '<table class="table table-striped table-responsive table-bordered table-hover">';
                        tablesStringCode   += '<table style="table-layout: fixed;word-wrap: break-word" class="table table-striped table-responsive table-hover rabo-text-top">';
                        tablesStringCode   += '<thead>';
                        tablesStringCode   += '<tr>';
                        //Populating the table column headers
                        for (var ir = 0; ir < Object.getOwnPropertyNames(scope.resultData.lists[currList][0]).length; ir++) {
                            currHeader          = Object.getOwnPropertyNames(scope.resultData.lists[currList][0])[ir];
                            currHeader = currHeader.replace("_", " ");
                            tablesStringCode   += '<td><b>'+currHeader+'</b></td>';
                        }
                        tablesStringCode   += '</tr>';
                        tablesStringCode   += '</thead>';

                        //Table body
                        tablesStringCode   += '<tbody>';
                        for (var ic = 0; ic < scope.resultData.lists[currList].length; ic++) {
                            currRow         = scope.resultData.lists[currList][ic];
                            //Getting the header names
                            headers          = Object.getOwnPropertyNames(scope.resultData.lists[currList][ic]);
                            tablesStringCode   += '<tr>';

                            //Populate the row
                            for (var j = 0; j < headers.length; j++) {
                                currValue   = scope.resultData.lists[currList][ic][headers[j]];
                                tablesStringCode    += '<td>'+setHighlightMarkup(currValue, scope.highlights)+'</td>';
                            }
                            tablesStringCode   += '</tr>';
                        }

                        tablesStringCode   += '</tbody>';
                        tablesStringCode   += '</table>';
                    }

                    tablesStringCode    += '</div>';


                } //else if(scope.resultData) {
                    //tablesStringCode
                //}

                var newRow = $compile(tablesStringCode)(scope);
                element.append(newRow);
            };
        }
    };
});
