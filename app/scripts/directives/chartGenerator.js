'use strict';

/*
* To generate a table 5 things are necessary:
* tableData:        the variable should contain the data that will be contained in the table. The "id" field is required
*   The content of the variable should be an array of objects similar to the following example (any amount of object, and same amount of fields in objects):
*       [
*           {
*               "id":15468
*               "name":"the sample name"
*           },
*           {
*               "id":9425
*               "name":"second"
*           }
*       ]
* discardedFields:  a list of field names that are not going to be displayed in the table
* rowClickParams:   an array of parameters that are going to be used to extract the content of certain column value
* rowAttributes:    additional attributes for the table rows (checkboxes excluded)
* checkboxAttributes:    additional attributes for the table rows (checkboxes excluded)
* checkboxList:     an object with a list of checkboxes
*   The content should look like this (and could be an empty object):
*       {
*           id1: true,
*           id2: false
*       }
* rowClick():       a method that will be executed when a user perform a click over a row
* addCheckbox:      if true the table is going to have checkboxes
* rowIdentifier:    the attribute that is going to identify a row as unique. Example: "id" or "uri"
* iconFields:       an array of strings with the name of the fields that needs a translation. This fields are going to be formatted
* includeNotesLink: if true a new column is added at the right side of the table including the link to the notes
* */

searchApp.directive('chartGenerator', function($compile, $filter) {
    return {
        restrict: 'AE',
        replace: 'false',
        scope: {
            startDate: '=',
            endDate: '=',
            chartTitle: '=',
            dashboardData: '='
        },
        templateUrl:    'views/directives/chartGenerator.html',
        compile: function () {
            return function (scope, element) {

                var dataToLineChart = function(responseData, displayField, axisTitle){
                    var chartObject          = {};
                    chartObject.type        = 'LineChart';
//                    chartObject.displayed   = true;
                    chartObject.options      = {
                        title: scope.title,
                        animation: {
                            duration: 1000,
                            easing: 'linear',
                            startup: true
                        },
//                        tooltip: { trigger: 'selection' },
//                        "isStacked": "true",
//                        "fill": 20,
//                        displayExactValues: true,
                        explorer: {actions:['dragToPan', 'rightClickToReset'],
                            axis: 'horizontal',
                            keepInBounds: true
                        },
                        vAxis: {
                            title: "Documents",
                            gridlines: {
                                "count": 10
                            }
                        },
                        hAxis: {
                            title: "Indexing Date"
                        }
                    };

//                    chartObject.formatters  = {};

                    if(responseData){
                        chartObject.data    = {
                            'cols':[
                                {
                                    'id':   'day',
                                    'label':'Day',
                                    'type': 'string',
                                    'p':    {}
                                }
                            ],
                            'rows':[]
                        };

                            chartObject.data.cols.push(
                                {
                                    'id':       responseData.name,
//                        'label':    responseData.data[i].name,
                                    'label':    axisTitle,
                                    'type':     'number',
//                                    'title':    'Documents',
                                    'p':        {}
                                }
                            );

                            chartObject.data.rows.push({'c':[]});

                                for(var j = 0; j < responseData.data.length; j++){
                                    var a   = responseData.data[j].date.split(" ");
                                    var d   = a[0].split("-");
                                    var formattedDate = new Date(d[0],(d[1]-1),d[2]);
                                    var dateValue = $filter('date')(formattedDate, 'yyyy-MM-dd');

                                    chartObject.data.rows.push({
                                        'c':[

                                            {v:dateValue},
                                            {
                                                v:responseData.data[j][displayField]//,
//                                                f:'Success: '+responseData.data[j].success
                                            }
                                        ]
                                    });
                                }


                    }

                    return chartObject;
                };

                var dataToChart = function(responseData, rows){
                    var chartObj    = {};
                    chartObj.data   = {};

                    var cols = [
                        {id:"codeName", label:"Name",   type:"string"},
                        {id:"count",    label:"Count",  type:"number"},
                        {type: 'string', role: "tooltip", p: {role: "tooltip",html: true}}
                    ]; //Column values
                    chartObj.data.cols   = cols;

                    if (rows == null) {
                        rows = [];
                        for(var i = 0; i < responseData.length; i++){
                            if (responseData[i].details == null) {
                                rows.push({c: [
                                    {v: responseData[i].codeName},
                                    {v: responseData[i].count}
                                ]});
                            }
                            else {
                                rows.push({c: [
                                    {v: responseData[i].codeName},
                                    {v: responseData[i].count},{v:responseData[i].details}
                                ]});
                            }
                        }
                    }


                    chartObj.data.rows   = rows;

                    chartObj.type       = 'PieChart';
                    chartObj.options    = {
                        pieSliceText:   'value',
//                        tooltip: { isHtml: true },
                        is3D: true,
                        animation: {
                            duration: 1000,
                            easing: 'linear',
                            startup: true
                        }
//                        legend:         'none'
                    };

                    return chartObj;
                };

                /** NEW TABLE DATA **/
                scope.tableData;
                scope.discardedFields      = [];
                scope.sortableFields      = [];
                scope.rowClickParams       = [];
                scope.rowAttributes        = '';
                scope.checkboxList         = {};
                scope.addCheckbox          = false;
                scope.checkboxAttributes   = '';
                scope.rowIdentifier        = '';
                scope.specialFields        = [];
                scope.includeNotesLink     = false;
                scope.dataMaxWidth         = true;

                scope.allChecked           = false;
                scope.btnDisabled          = false;
                scope.returnVal            = '';    //Field that is going to be extracted from the selected documents to show before the status change
                scope.subjectsToUpdate     = 'empty';
                scope.selectedStatus       = '';
                /** END NEW TABLE DATA **/

                scope.showTable            = false;
                scope.showSuccessChart     = true;
                scope.hasFailureDetails    = false;

                scope.successTitle         = 'Success of last index run';
                scope.detailsText         = 'Show failure details';

                scope.tableData = scope.dashboardData.data;

                scope.showdetails = function() {
                    if (scope.showSuccessChart) {
                        scope.successTitle = 'Error messages of last index run';
                        scope.latestChart = dataToChart(scope.dashboardData.errorDetails.data, null);
                        scope.detailsText = 'Back';
                    }
                    else {
                        var rows = [];
                        rows.push({c:[{v:"Success"},{v:latestData.success}]});
                        rows.push({c:[{v:"Failure"},{v:latestData.failure}]});

                        scope.latestChart = dataToChart(latestData, rows);
                        scope.successTitle = 'Success of last index run';
                        scope.detailsText = 'Show failure details';
                    }

                    scope.showSuccessChart = !scope.showSuccessChart;
                };

                if(scope.dashboardData && scope.dashboardData.data){

                    var latestData = scope.dashboardData.data[scope.dashboardData.data.length - 1];
                    var rows = [];
                    rows.push({c:[{v:"Success"},{v:latestData.success}]});
                    rows.push({c:[{v:"Failure"},{v:latestData.failure}]});

                    scope.latestChart = dataToChart(latestData, rows);
                    scope.failureChart = dataToLineChart(scope.dashboardData, "failure", "Failures");
                    scope.successChart = dataToLineChart(scope.dashboardData, "success", "Success");
                    scope.totalChart = dataToLineChart(scope.dashboardData, "total", "Total");

                    if (scope.dashboardData.errorDetails != null) {
                        scope.hasFailureDetails = true;
                        scope.chartDetails = dataToChart(scope.dashboardData.errorDetails.data, null);
                    }
                }
            }
        }
    }
});
