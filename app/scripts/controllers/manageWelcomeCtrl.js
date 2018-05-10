'use strict';

searchApp.controller('manageWelcomeCtrl', function ($scope, welcomeService, landingPageData, modelDomainService, $filter, $cookieStore, $location, communicationService, footerService, tableInteractionsService, messageService, Field, FieldTypeEnum) {
    
    $scope.modelDS = modelDomainService;
    
   
    var landingPageFields = {
        id: new Field({}),
        name: new Field({caption: {en: 'Name'}, initValue: 'default'}),
        published: new Field({caption: {en: 'Published'}, type: FieldTypeEnum.BOOLEAN, initValue: true}),
        content: new Field({caption: {en: ''}, type: FieldTypeEnum.RICHTEXT, settings: {
                height: 600,
                focus: true,
                buttons: {
                    messages: function (context) {
                        var ui = $.summernote.ui;
                        var button = ui.button({
                            contents: '<i class="fa fa-code"/> Shortcode',
                            tooltip: 'Insert widget with messages',
                            click: function () {
                                context.invoke('editor.insertText', ' [messages category="..." view="list|carousel" limit="10" width="300px" minpriority=3"] ');
                            }
                        });
                        return button.render();
                    }
                },
                toolbar: [
                    ['edit', ['undo', 'redo']],
                    ['headline', ['style']],
                    ['style', ['bold', 'italic', 'underline', 'superscript', 'subscript', 'strikethrough', 'clear']],
                    ['fontface', ['fontname']],
                    ['textsize', ['fontsize']],
                    ['fontclr', ['color']],
                    ['alignment', ['ul', 'ol', 'paragraph', 'lineheight']],
                    ['height', ['height']],
                    ['table', ['table']],
                    ['insert', ['link', 'picture', 'video', 'hr']],
                    ['view', ['fullscreen']],
                    ['shortcodes', ['messages']],
                    ['codeview', ['codeview']],                    
                    ['help', ['help']]
                ]
            }
        })
    };
    angular.forEach(landingPageFields, function (field, key) {
        angular.extend(field, {
            id: key
        });
    });
    $scope.landingPageFields  = landingPageFields;
    
    
    var messageFields = {
        id: new Field({}),        
        name: new Field({required: true, caption: {en: 'Name'}}),
        category: new Field({caption: {en: 'Category'}, type: FieldTypeEnum.TYPEAHEAD, initValue: 'alert',
            options: function () {
                return welcomeService.messagesPromise.then(
                        function (data) {
                            var seen = ['alert', 'feature', 'hint'];
                            angular.forEach(data.messages, function (message) {
                                if (message.category && seen.indexOf(message.category) < 0) {
                                    seen.push(message.category);
                                }
                            });
                            return seen.map(function(item) {
                                return {id: item, label: item};
                            });
                        });
            }
        }),
        priority: new Field({caption: {en: 'Priority'}, initValue: '1', type: FieldTypeEnum.OBJECT,
            options: [
                {id: '1', label: 'Low (1)'}, {id: '2', label: 'Medium (2)'}, {id: '3', label: 'High (3)'}, {id: '4', label: 'Critical (4)'}
            ]
        }),
        validFrom: new Field({caption: {en: 'Valid from'}, type: FieldTypeEnum.DATETIME}),
        validTo: new Field({caption: {en: 'Valid to'}, type: FieldTypeEnum.DATETIME_TO}),
        published: new Field({caption: {en: 'Published'}, type: FieldTypeEnum.BOOLEAN, initValue: true}),
        content: new Field({caption: {en: ''}, required: true, type: FieldTypeEnum.RICHTEXT, settings: {
                height: 200,
                dialogsInBody: false,
                focus: true,
                toolbar: [
                    ['edit', ['undo', 'redo']],
                    ['style', ['bold', 'italic', 'underline']],
                    ['textsize', ['fontsize']],
                    ['fontclr', ['color']],
                    ['alignment', ['ul', 'ol', 'paragraph', 'lineheight']],
                    ['insert', []]
                ]
            }
        })
    };
    angular.forEach(messageFields, function(field, key){
        angular.extend(field, {
            id: key
        });
    });
    
    $scope.dialogData = {
        title: "Message",
        fields: [messageFields.name, messageFields.category, messageFields.priority, messageFields.validFrom, messageFields.validTo, messageFields.published, messageFields.content]
    };
    
  //Table related fields. Check scripts/directives/tableGenerator.js for documentation
  $scope.tableData;
  $scope.discardedFields = ['id', 'group', 'ownerId', 'groupId', 'modifiedById', 'owner', 'content']; 
  $scope.rowAttributes = 'style="cursor: pointer;" ';
  $scope.checkboxList = {};
  $scope.addCheckbox = true;
  $scope.checkboxAttributes = 'ng-change="checkboxChange()"';
  $scope.rowIdentifier = 'id';
  $scope.specialFields = ['validFrom', 'validTo', 'createdDate', 'lastModifiedDate'];
  $scope.sortableFields = ['name', 'createdDate', 'modifiedDate', 'category', 'priority', 'validFrom', 'validTo', 'validNow', 'published'];
  $scope.sortBy               = "modifiedDate";
  $scope.currentSortDirection = {modifiedDate: 'desc'};    
  //End - Table related fields

  //Pagination variables. Required for the pagination plugin (angular-ui)
  $scope.itemsPerPage = $cookieStore.get("pageSizeManageWelcome") ? $cookieStore.get("pageSizeManageWelcome") : 50;
  $scope.maxSize = 4;
  $scope.currentPage = 1;
  $cookieStore.put('searchApp_ssCurrentPage', $scope.currentPage);
  $scope.itemsPerPageOptions = [10, 20, 30, 40, 50];
  //End - Pagination variables

  //Delete modal variables. Check scripts/directives/deleteModal.js for documentation
  $scope.deleteModalTitle = 'Delete message';
  $scope.countDeletedItems = '';
  $scope.deleteMessage1 = 'WARNING: You are about to delete';
  $scope.deleteMessage2 = 'messages!';
  $scope.namesToBeDeleted = '';
  $scope.returnVal = 'name'; // name of th field which should be returned in getNamesToDelete method
  //End - Delete modal variables
  
  //Enable or disable the delete button
  $scope.btnDisabled = true;

  /**********************/
  /* ELEMENTS SELECTION */
  /**********************/
  $scope.selectAllEnabled = false;
  $scope.checkedElements = {};
  $scope.uncheckedElements = {};

  //When a checkbox status change, this method is triggered
  $scope.checkboxChange = function () {
    if ($scope.selectAllEnabled) {
      $scope.uncheckedElements = tableInteractionsService.getNewElements($scope.tableData, $scope.checkboxList, $scope.selectAllEnabled, 'id', $scope.uncheckedElements);
    }
    else {
      $scope.checkedElements = tableInteractionsService.getNewElements($scope.tableData, $scope.checkboxList, $scope.selectAllEnabled, 'id', $scope.checkedElements);
    }
    getActionButtonStatus();
  };

  //Updates the checkboxes in the current page using the checked or unchecked element lists
  var updateCheckboxes = function () {
    if ($scope.selectAllEnabled) {
      $scope.checkboxList = tableInteractionsService.getCurrentPageList($scope.tableData, $scope.selectAllEnabled, 'id', $scope.uncheckedElements);
    }
    else {
      $scope.checkboxList = tableInteractionsService.getCurrentPageList($scope.tableData, $scope.selectAllEnabled, 'id', $scope.checkedElements);
    }
    getActionButtonStatus();
  };

  //When the user click on the select page button
  $scope.selectPage = function () {
    $scope.checkboxList = tableInteractionsService.getElementsFromSelectPage($scope.tableData, $scope.checkboxList, 'id');
    $scope.checkboxChange();
  };

  //Clear the tracking lists (checked and unchecked elements)
  var clearTrackingLists = function () {
    $scope.checkedElements = {};
    $scope.uncheckedElements = {};
    getActionButtonStatus();
  };

  //When the user click on the select all button
  $scope.selectAll = function () {
    if ($scope.selectAllEnabled) {
      $scope.selectAllEnabled = false;
      clearTrackingLists();
      $scope.checkboxList = tableInteractionsService.getAllCheckedUnchecked($scope.tableData, $scope.checkboxList, 'id', false);
    }
    else {
      $scope.selectAllEnabled = true;
      clearTrackingLists();
      $scope.checkboxList = tableInteractionsService.getAllCheckedUnchecked($scope.tableData, $scope.checkboxList, 'id', true);
    }
  };

  //Sets the status of the btnDisabled variable. This will enable or disable the action buttons on the page
  var getActionButtonStatus = function () {
    if ($scope.selectAllEnabled) {
      $scope.btnDisabled = tableInteractionsService.getIsDisabled($scope.tableData, $scope.selectAllEnabled, $scope.uncheckedElements, footerService.getResultInfo().resultsCount, 'id');
    }
    else {
      $scope.btnDisabled = tableInteractionsService.getIsDisabled($scope.tableData, $scope.selectAllEnabled, $scope.checkedElements, footerService.getResultInfo().resultsCount, 'id');
    }
  };

  $scope.updatePageSize = function () {
    $cookieStore.put("pageSizeManageWelcome", $scope.itemsPerPage);
    $scope.tableData = undefined;
    resetTableData();
  };
  
    var getLandingPage = function () {

        communicationService.getLandingPage.get({id: 1}).$promise
                .then(function (results) {
                    angular.forEach(landingPageFields, function (field, key) {
                        if (results.hasOwnProperty(key) && (results[key] || results[key] === false)) {
                            field.setValue(results[key]);
                        } else {
                            field.reset();
                        }
                    });
                }, function (errResponse) {
                    messageService.addError('Error loading landing page.')(errResponse);
                });
    };  

    var getMessages = function () {
        var params = {page: $scope.currentPage, resultsPerPage: $scope.itemsPerPage};
        if ($scope.sortBy.length > 0) {
            params.sortBy = $scope.sortBy + ":" + $scope.currentSortDirection[$scope.sortBy];
        }         
        communicationService.getMessages.get(params).$promise
                .then(function (results) {
                    $scope.tableData = results.messages;
                    footerService.setResultInfo($scope.currentPage, $scope.itemsPerPage, results.count);
                    updateCheckboxes();
                    if (results.count === 0) {
                        $scope.noResults = true;
                        $scope.noResultsMessage = "No results";
                    }
                }, function (errResponse) {
                    messageService.addError('Error getting messages.')(errResponse);
                });
    };
  
  var resetTableData = function () {
    $scope.tableData = undefined;
    $scope.btnDisabled = true;
    $scope.checkboxList = {};
    getMessages();
    messageFields.category.initOptions(true);

    $scope.newName = '';
    $scope.newDescription = '';
    $scope.allChecked = false;
  };
  
  var openMessageModal = function() {
      var modalDialog = angular.element('#messageModal');
      modalDialog.modal('show');
      $scope.summernoteActive = true;
      modalDialog.on('hidden.bs.modal', function(e) { 
        $(this).data('bs.modal', null);
        $scope.summernoteActive = false;
    });          
  };
  
    var closeMessageModal = function () {
        var modalDialog = angular.element('#messageModal');
        modalDialog.modal('toggle');
    };
    
    $scope.createNewMessage = function () {
        angular.forEach(messageFields, function (field, key) {
            field.reset();
        });
        openMessageModal();
    };
    
    $scope.prepareDeleteModal = function ($event) {
        welcomeService.messagesPromise
                .then(function (results) {
                    if ($scope.selectAllEnabled) {
                        $scope.namesToBeDeleted = tableInteractionsService.getElementsSelected(results.messages, $scope.selectAllEnabled, $scope.uncheckedElements, 'id', [$scope.returnVal]);
                        $scope.countDeletedItems = tableInteractionsService.getCountElementsSelected(results.messages, $scope.selectAllEnabled, $scope.uncheckedElements, 'id');
                    } else {
                        $scope.namesToBeDeleted = tableInteractionsService.getElementsSelected(results.messages, $scope.selectAllEnabled, $scope.checkedElements, 'id', [$scope.returnVal]);
                        $scope.countDeletedItems = tableInteractionsService.getCountElementsSelected(results.messages, $scope.selectAllEnabled, $scope.checkedElements, 'id');
                    }
                }, function (errResponse) {
                    messageService.addError('Error getting messages.')(errResponse);
                });

    };
    
    $scope.delete = function () {
        var idsToDelete = $.map(tableInteractionsService.getIdsToDelete($scope.checkboxList), function(item) {
            return item.id;
        });
        communicationService.deleteMessages.delete({ids: idsToDelete}).$promise
                .then(function (results) {
                    messageService.addSuccess('Messages successfully deleted.')();
                    resetTableData();
                }, function (errResponse) {
                    messageService.addError('Error deleting messages.')(errResponse);
                });
    };    


    $scope.setSort = function (key, field) {
        $scope.sortBy = field;
        if (!key) {
            if ($scope.currentSortDirection[field]) {
                if ($scope.currentSortDirection[field] === 'desc') {
                    $scope.currentSortDirection = tableInteractionsService.setSortingDirection($scope.currentSortDirection, field, 'asc');
                } else {
                    $scope.currentSortDirection = tableInteractionsService.setSortingDirection($scope.currentSortDirection, field, 'desc');
                }
            } else {
                $scope.currentSortDirection = tableInteractionsService.setSortingDirection($scope.currentSortDirection, field, 'asc');
            }

        }
        resetTableData();
    };  
    
    var saveLandingPage = function () {
        var contentObject = {};
        try {
            angular.forEach(landingPageFields, function (field, key) {
                if (!field.getValue() && field.isRequired()) {
                    throw new Error('Field ' + (field.getCaption() || key) + ' is required and cannot be empty');
                }
                contentObject[key] = field.getValue();
            });
        } catch (e) {
            messageService.addError(e.message, {timeout: 5000})();
            return false;
        }
        
        var action = landingPageFields.id.getValue() ? communicationService.updateLandingPage.put(contentObject) : communicationService.createLandingPage.post(contentObject);
        action.$promise.then(function (results) {
            getLandingPage();
            messageService.addSuccess('Landing page successfully ' + (landingPageFields.id.getValue() ? 'updated' : 'created'))();
        }, function (errResponse) {
            messageService.addError('Error ' + (landingPageFields.id.getValue() ? 'updating' : 'creating new') + ' landing page.')(errResponse);
        });
    };
    
    $scope.saveMessage = function () {
        var contentObject = {};
        try {
            angular.forEach(messageFields, function (field, key) {
                if (!field.getValue() && field.isRequired()) {
                    throw new Error('Field ' + (field.getCaption() || key) + ' is required and cannot be empty');
                }
                contentObject[key] = field.getValue();
            });
        } catch (e) {
            messageService.addError(e.message, {groups: 'messageDialog', timeout: 5000})();
            return false;
        }
        
        var action = messageFields.id.getValue() ? communicationService.updateMessage.put(contentObject) : communicationService.createMessage.post(contentObject);
        action.$promise.then(function (results) {
            closeMessageModal();
            messageService.addSuccess('Message successfully ' + (messageFields.id.getValue() ? 'updated' : 'created'))();
            welcomeService.initData(true);
            resetTableData();
        }, function (errResponse) {
            messageService.addError('Error ' + (messageFields.id.getValue() ? 'updating' : 'creating new') + '  message.', {groups: 'messageDialog'})(errResponse);
        });
    };

    $scope.rowClick = function (rowId) {
        var rows = $filter('filter')($scope.tableData, {id: parseInt(rowId)}, true);
        if (rows.length > 0) {
            var row = rows[0];
            angular.forEach(messageFields, function (field, key) {
                if (row.hasOwnProperty(key) && (row[key] || row[key] === false)) {
                    field.setValue(row[key]);
                } else {
                    field.reset();
                }
            });
            openMessageModal();
        }
    };
    

  //Checks or unchecks all checkboxes
  $scope.checkUncheckAll = function (isCheckAll) {
    var idsList = tableInteractionsService.getAllIdsInTableData($scope.tableData);
    for (var i = 0; i < idsList.length; i++) {
      if (isCheckAll) {
        $scope.checkboxList[idsList[i]] = true;
      }
      else {
        $scope.checkboxList[idsList[i]] = false;
      }
    }
  };

  $scope.setPage = function (pageNo) {
    $scope.currentPage = pageNo;
  };

  $scope.pageChanged = function () {
    //$cookieStore.put('searchApp_ssCurrentPage', $scope.currentPage);
    $location.search('page', $scope.currentPage);
    resetTableData();
  };
  //END - PAGINATION METHODS

  if ($location.search().page) {
    $scope.currentPage = parseInt($location.search().page);
  }
  else {
    $scope.currentPage = 1;
  }
  
  getLandingPage();
  resetTableData();

    $scope.save = function () {
        messageService.resetLocal();
        if (welcomeService.setPreviewData(landingPageFields.content.getValue())) {
            saveLandingPage();
            welcomeService.initData(true);
        }
    };
  
    $scope.showPreview = function () {
        messageService.resetLocal();        
        if (welcomeService.setPreviewData(landingPageFields.content.getValue())) {
            welcomeService.openWelcomeModal();
        }
    };

});    
