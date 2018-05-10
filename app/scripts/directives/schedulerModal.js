'use strict';

/*
 * This directive require two variables in the scope:
 * newQuery:  if the value returned is true, then the modal will show the new query content,
  * else a confirmation message for query update is shown
 * searchName:  a variable with the current search name
 * */

searchApp.directive('schedulerModal', function($compile) {
    return {
        restrict:       'AE',
        replace:        'true',
        templateUrl:    'views/directives/schedulerModal.html'
    }
});