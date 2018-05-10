'use strict';

searchApp.controller('testCtrl', function ($scope, dataFactory) {

  $scope.update = function() {
    var ss = {
      "id":35,
      "name":"2 Angular Saved Search Edited",
      "groupID":1,
      "searchCriteria":{"contentSourceFilters":
        [{"name":"Reuters from Angular Edited","filters":
        {"timestamp":"2014-01-24 12:12:12.000","from":"reutersAngular@search.com","type":"Voice Mail"}}
        ]}
    };

    dataFactory.call.update(ss).$promise
      .then(function (results) {
        console.log('success');
      }, function (errResponse) {
        console.log("failed");
      });
  };


  $scope.save = function() {
    var ss = {
      "name":"Angular Saved Search",
      "userID":1,"groupID":1,
      "searchCriteria":{"contentSourceFilters":
        [{"name":"Reuters from Angular","filters":
          {"timestamp":"2014-01-24 12:12:12.000","from":"reutersAngular@search.com","type":"Voice Mail"}}
        ]}
    };
    dataFactory.call.save(ss).$promise
      .then(function (results) {
        console.log(results);
      }, function (errResponse) {
        console.log("failed");
      });
  };

  $scope.get = function() {
    dataFactory.userApi.get({id:1}).$promise
      .then(function (results) {
        console.log(results);
      }, function (errResponse) {
        console.log("failed");
      });
  };

  function randomString(){
    return Math.random().toString(36).substring(10);
  }

  $scope.getAll = function() {
    dataFactory.userApi.query().$promise
      .then(function(results) {
        console.log(results);
      }, function(errResponse) {
        $scope.users = "failed call with resource";
      });
  };


  $scope.delete = function() {
    dataFactory.call.delete({id:35}).$promise
      .then(function(results) {
        console.log(results);
      }, function(errResponse) {
        $scope.users = "failed call with resource";
      });
  };

});

