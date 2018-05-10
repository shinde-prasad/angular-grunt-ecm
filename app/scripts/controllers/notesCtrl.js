
'use strict';

searchApp.controller('notesCtrl', function ($scope, $cookieStore, communicationService, messageService) {

    //Table related fields.
    $scope.notesData;
    $scope.discardedFields      = ['documentId', 'id', 'group_ID', 'user_ID', 'timestamp'];
    $scope.sortableFields       = [];
    //End - Table related fields

    //Controller's variables
    $scope.currentUri;
    $scope.noteText;

    //Pagination variables. Required for the pagination plugin (angular-ui)
    $scope.itemsPerPage     = 50;
    $scope.maxSize          = 4;
    $scope.currentPage   = 1;
    //HIT-285: Fixing pagination issue.
    $cookieStore.put('searchApp_notesCurrentPage', $scope.currentPage);
    //End - Pagination variables


    //Pagination methods
    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.addNote  = function(){
        communicationService.addNote.post({documentId:$scope.currentUri, noteText:$scope.noteText}).$promise
            .then(function(results){
                $scope.notesData    = undefined;
                $scope.getNotes();
                $scope.$emit('noteAdded', $scope.currentUri);
                $scope.noteText = "";
            }, function(errResponse) {
                messageService.addError('Note adding failed')(errResponse);
            });
    };


    $scope.getNotes  = function(){
        communicationService.getNotes.get({documentId:$scope.currentUri, page:$scope.currentPage, resultsPerPage:$scope.itemsPerPage}).$promise
            .then(function(results){
                $scope.notesData    = results.notes;
            }, function(errResponse){
                messageService.addError('Reading notes failed')(errResponse);
            });
    };

    $scope.$on('noteClick', function (event, uri) {
        $scope.currentUri   = uri;
        $scope.notesData    = undefined;
        $scope.getNotes();
    });

    $scope.pageChanged = function() {
        $cookieStore.put('searchApp_notesCurrentPage', $scope.currentPage);
        $scope.notesData    = undefined;
        $scope.getNotes();
    };

    //ON PAGE LOAD
    //Check if the page was stored in a cookie
    if($cookieStore.get('searchApp_notesCurrentPage') && ($cookieStore.get('searchApp_notesCurrentPage') != '')){
        $scope.setPage(parseInt($cookieStore.get('searchApp_notesCurrentPage')));
    }
    else{
        //If the page was not stored, then load the table from the first page
        $cookieStore.put('searchApp_notesCurrentPage', 1);
    }

});

