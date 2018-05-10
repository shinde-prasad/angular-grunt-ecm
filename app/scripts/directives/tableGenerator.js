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
 * includeParticipantNotesLink: if true a new column is added at the right side of the table including the link to the participant notes
 * */

searchApp.directive('tableGenerator', function($compile, $cookieStore, $filter, Environment, channelSelectionService) {
  return {
    restrict: 'AE',
    replace: 'true',
    scope: {
      tableData: '='
    },
    template: '<div></div>',
    link: function (scope, ele, attrs) {
      scope.$watch(scope.tableData, function(html) {
        ele.html(html);
        $compile()(scope);
      });
    },
    compile: function () {
      return function (scope, element) {
        var tdata = scope.tableData;
        scope = scope.$parent;
        if (tdata) {
          scope.tableData = tdata;
        }


        var tableStringCode   = '';

        //The content of each row is generated using the following string to avoid performance problems.
        //With this the ng-repeat is going to bind only the entire string instead of the different fields
        if (scope.tableData && scope.tableData[0]) { //Table data exist and has at least one element


          tableStringCode    += '<div class="col-md-12">';

          var currHeader;     //Current column header
          var headers;        //Full list of headers for a row
          var currValue;      //Current value in a row

          tableStringCode   += '<table class="table table-striped table-responsive table-hover rabo-text-top rabo-result-table">';
          tableStringCode   += '<thead>';
          tableStringCode   += '<tr>';

          //Populating the table column headers
          if (scope.addCheckbox) {
            tableStringCode += '<th> </th>';
          }
          for (var i = 0; i < Object.getOwnPropertyNames(scope.tableData[0]).length; i++) {
            currHeader = Object.getOwnPropertyNames(scope.tableData[0])[i];
            if (scope.discardedFields.indexOf(currHeader) === -1){    //If the header is not in the list of discarded fields, then add the header
              if (currHeader === 'employeeId'){
                tableStringCode   += '<th style=\'text-align: right;\'>{{\''+currHeader+'\' | translate}}';
              } else {
                tableStringCode   += '<th>{{\''+currHeader+'\' | translate}}';
              }
              if (scope.sortableFields.indexOf(currHeader) !== -1){
                tableStringCode   += '&nbsp;<a rel="#" href="" ng-click="setSort(undefined,\''+currHeader+'\',true)" class="rabo-sort-header"><span class="glyphicon" ng-class="{\'glyphicon-sort-by-alphabet\':currentSortDirection[\''+currHeader+'\']===\'asc\',\'glyphicon-sort-by-alphabet-alt\':currentSortDirection[\''+currHeader+'\']===\'desc\',\'glyphicon-sort\':currentSortDirection[\''+currHeader+'\']=== undefined}"></span></a>';
              }
              tableStringCode   += '</th>';
            }
          }
          if (scope.includeNotesLink) {
            tableStringCode += '<th> </th>';
          }
          if (scope.includeParticipantNotesLink) {
            tableStringCode += '<th> </th>';
          }
          tableStringCode   += '</tr>';
          tableStringCode   += '</thead>';

          //Populating the table body
          tableStringCode   += '<tbody>';

          for (var i = 0; i < scope.tableData.length; i++) {
            var isDeletedItem = scope.tableData[i]['is-deleted'];
            tableStringCode     += '<tr>';
            if (scope.addCheckbox) {
                if (isDeletedItem) {
                    tableStringCode += '<td class="deleted-item"><span class="glyphicon glyphicon-exclamation-sign" title="Deleted item"></span></td>';
                } else {
                    tableStringCode += '<td><label><input type="checkbox" checked="" ';
                    tableStringCode += 'ng-model="checkboxList[\'' + scope.tableData[i][scope.rowIdentifier] + '\']"';
                    tableStringCode += ' ' + scope.checkboxAttributes + '></label></td>';
                }
            }
            headers  = Object.getOwnPropertyNames(scope.tableData[i]);
            for (var j = 0; j < headers.length; j++) {
              if (scope.discardedFields.indexOf(headers[j]) === -1){    //If the header is not in the list of discarded fields, then add the data
                currValue   = scope.tableData[i][headers[j]];
                if (currValue === null){
                  currValue   = "N/A";
                }
                var rowId = scope.tableData[i].id ? scope.tableData[i].id : scope.tableData[i].uri;
                var rowClickEvent = '';
                var rowClasses = [];
                
                if (!isDeletedItem) {
                    rowClasses.push('clickable-item');                    
                    rowClickEvent = 'ng-click="rowClick(\'' + rowId + '\')" ';
                } else {
                    rowClasses.push('deleted-item');
                    scope.rowAttributes = scope.rowAttributes.replace('data-toggle', 'data-do-nothing');
                }
                if (scope.dataMaxWidth){
                  if (headers[j] === 'employeeId' || (headers[j] === 'call-duration')){
                    tableStringCode    += '<td style="text-align: right; word-wrap: break-word; max-width: 250px;" ' + rowClickEvent;
                  }
                  else if (headers[j] === 'has-attachment'){
                    tableStringCode    += '<td style="text-align: center; word-wrap: break-word; max-width: 250px;" ' + rowClickEvent;
                  }
                  else {
                    tableStringCode    += '<td style="word-wrap: break-word; max-width: 250px;" ' + rowClickEvent;
                  }
                }
                else{
                  if (headers[j] === 'employeeId'){
                    tableStringCode += '<td class="column-' + headers[j] + '" style="text-align: right;" ' + rowClickEvent;
                  }
                  else {
                    tableStringCode += '<td ' + rowClickEvent;
                  }
                }
                
                if (rowClasses.length > 0) {
                    tableStringCode += ' class="' + rowClasses.join(' ') + '" ';
                }

                tableStringCode    += scope.rowAttributes;

                if (headers[j] === 'email') {
                  tableStringCode += " title=\"" + currValue + "\"";
                }

                tableStringCode += ' selectable-text>';

                if (scope.specialFields.indexOf(headers[j]) === -1) {    //If the field does not require a translation
                    if (currValue !== null) {
                        if (headers[j] === 'email') {
                            tableStringCode += currValue.split("@")[0] + "@...";
                        } else {
                            if (currValue.length <= 200) {
                                tableStringCode += currValue.replace(/\|/gi, " ");
                            }
                            else if (typeof currValue !== 'string') {
                                tableStringCode += currValue;
                            }
                            else {
                                tableStringCode += currValue.replace(/\|/gi, " ").substring(0, 200) + '...';
                            }
                        }
                    }
                  else {
                    tableStringCode += 'null';
                  }
                }
                else{
                  if (currValue && currValue !== 'N/A' && ((headers[j] === 'validFrom')||(headers[j] === 'validTo')||(headers[j] === 'lastUpdate')||(headers[j] === 'dateAddedToGroup')||(headers[j] === 'startdate')||(headers[j] === 'enddate')||(headers[j] === 'timestamp')||(headers[j] === 'createdDate')||(headers[j] === 'modifiedDate')||(headers[j] === 'lastModifiedDate')||(headers[j] === 'lastExecutionDate'))){
                    var a   = currValue.split(" ");
                    var d   = a[0].split("-");
                    var t   = a[1].split(":");
                    var formattedDate = new Date(d[0],(d[1]-1),d[2],t[0],t[1]);
                    tableStringCode += $filter('date')(formattedDate, 'yyyy-MM-dd HH:mm');
                  } else {
                    if (headers[j] === 'namespace') {
                        var channel;
                        $.map(channelSelectionService.channels, function(ch) {
                            if (ch.getApiName().toLowerCase() === currValue) {
                                channel = ch;
                            }
                        });
                        if (channel) {
                            tableStringCode += '<span class="glyphicon ' + channel.getGlyph() + '"></span>';
                        } else {
                            tableStringCode += currValue + ' icon ??';
                        }
                    } else if (headers[j] === 'legal-hold') {
                      tableStringCode += '<p ng-if="tableData['+i+'][\'legal-hold\'] == \'false\'">Off</p>';
                      tableStringCode += '<p class="rabo-selected" ng-if="tableData['+i+'][\'legal-hold\'] == \'true\'"><strong>On</strong></p>';
                    } else if (headers[j] === 'status'){
                      tableStringCode += '<p ng-if="tableData['+i+'].status == 0">None</p>';
                      tableStringCode += '<p ng-if="tableData['+i+'].status == 1">Reviewed</p>';
                      tableStringCode += '<p ng-if="tableData['+i+'].status == 2">Escalated</p>';
                      tableStringCode += '<p ng-if="tableData['+i+'].status == 3">Pending Review</p>';
                    } else if (headers[j] === 'filter') {
                        switch (parseInt(currValue)) {
                            case 0: tableStringCode += 'Include'; break;
                            case 1: tableStringCode += 'Exclude'; break;
                            case 10: tableStringCode += 'Includes All'; break;
                            case 11: tableStringCode += 'Excludes All'; break;                                
                        }
                    }
                    else if (headers[j] === 'has-attachment') {
                      if (currValue !== '' && currValue !== 'N/A'){
                        tableStringCode += '<span class="glyphicon glyphicon-link"></span>';
                      } else {
                        if (currValue === 'N/A'){
                          tableStringCode += currValue;
                        }
                      }
                    } else {
                      tableStringCode += currValue === null ? "N/A" : currValue;
                    }
                  }
                }
                tableStringCode += '</td>';
              }
            }
            if (scope.includeNotesLink) {
                if (isDeletedItem) {
                    tableStringCode += '<td></td>';
                } else {
                
              var uriRow = scope.tableData[i].uri;
              var pencilColor = 'style="cursor: pointer;" ng-class="{\'rabo-selected\':tableData['+i+'].containsNote == \'1\'}"';
              tableStringCode += '<td><span class="glyphicon glyphicon-pencil" data-toggle="modal" data-target="#documentNotesModal" ' + pencilColor + ' ng-click="noteClick(';
              tableStringCode += '\''+uriRow+'\'';
              tableStringCode += ')"></span>';
              if (uriRow.indexOf('wav', uriRow.length - 'wav'.length) !== -1) { //endswith("wav")
                tableStringCode += '<audio id="a'+ i +'" preload="none" src="' + Environment.getRestapiHost() + '/restapi/services/document/audio?uri='+ encodeURIComponent(uriRow) +'&a=' + encodeURIComponent($cookieStore.get("searchApp_token")) + '"  ></audio>';
                tableStringCode += '<bgsound id="bgs'+ i +'" />';
                tableStringCode += "<span id=\"pbutton"+i+"\" class=\"glyphicon glyphicon-play\" style=\"cursor: pointer;\" onclick=\"if ($('#a"+i+"')[0].paused){$('#a"+i+"')[0].play();$('#bgs"+i+"')[0].src = $('#a"+i+"')[0].src;$(this).removeClass('glyphicon-play');$(this).addClass('glyphicon-pause');}else{ $('#a"+i+"')[0].pause();$('#bgs"+i+"')[0].src = '';$(this).removeClass('glyphicon-pause');$(this).addClass('glyphicon-play');}\"></span>";
                tableStringCode += "<span class=\"glyphicon glyphicon-stop\" style=\"cursor: pointer;\" onclick=\"$('#pbutton"+i+"').removeClass('glyphicon-pause');$('#pbutton"+i+"').addClass('glyphicon-play');$('#bgs"+i+"')[0].src = '';$('#a"+i+"')[0].pause();$('#a"+i+"')[0].currentTime = 0;\"></span>";
              }
              tableStringCode += '</td>';
                }
            }
            if (scope.includeParticipantNotesLink) {
                if (isDeletedItem) {
                    tableStringCode += '<td></td>';
                } else {
              var uriRow = scope.tableData[i].uri;
              var pencilColor = 'style="cursor: pointer;" ng-class="{\'rabo-selected\':tableData['+i+'].notes == true}"';
              tableStringCode += '<td><span class="glyphicon glyphicon-pencil" data-toggle="modal" data-target="#participantNotesModal2" ' + pencilColor  +' ng-click="loadParticipantNote(';
              tableStringCode += scope.tableData[i].id ;
              tableStringCode += ')"></span>';
              tableStringCode += '</td>';
                }
            }
            tableStringCode   += '</tr>';
          }

          tableStringCode   += '</tbody>';
          tableStringCode   += '</table>';
          tableStringCode   += '</div>';

        }

        var newRow = $compile(tableStringCode)(scope);
        element.append(newRow);
      };
    }
  };
});