'use strict';

searchApp.factory('dataFactory', function($resource, $q, $timeout, $http, Environment) {
//var dataModule = angular.module('dataModule');
//
//dataModule.factory('dataFactory', function($resource, $q, $timeout, $http) {

  var dataFactory = {};

  dataFactory.sayHello = function(text){
    return 'Hello ' + text;
  };

  dataFactory.getApi = function(name){
    return $http.get(Environment.getRestapiHost() + '/restapi/services/data?name=' + name).then(
      function (results) {
        return results.data;
      },
      function(err){
        console.log('failed from api.');
        return;
      }
    )

  };

  dataFactory.getWtf = function(name) {
    var tmp =  $resource(Environment.getRestapiHost() + '/restapi/services/data?name=' + name, {},
      {
        getJson: {
          method: 'GET', params: {}
        }
      }
    );

    return new tmp().$getJson({},function(data){
      console.log(data);
      return data;
    }, function(err){console.log(err);});
  };




  dataFactory.resourceCall = $resource(Environment.getRestapiHost() + '/restapi/services/data/:name');


  return dataFactory;
});
