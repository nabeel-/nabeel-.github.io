(function(){
  'use strict';

  var app = angular.module('attend', ['ngRoute', 'firebase']);

  app.value('fbURL', 'https://arkanum-signin.firebaseio.com/');

  app.factory('dataFactory', function($firebase, fbURL) {

    var session = moment().day(6).format("YYYY-MM-DD").concat("_", moment().day(7).format("YYYY-MM-DD"));

    var kids = $firebase(new Firebase(fbURL+"kids")),
        dataFactory = {};

    dataFactory.kids = function() { return kids; };

    dataFactory.toggle = function(kid, mode, obj) {
      var id = kid.$id, wrapper = {};
      wrapper[session] = obj;
      switch (mode) {
        case "in":
          exists(id, mode) ?
            kids.$remove(id+"/"+session) :
            kids.$update(id, wrapper);
          break;
        case "out":
          exists(id, mode) ?
            kids.$remove(id+"/"+session+"/"+mode) :
            kids.$update(id+"/"+session, obj);
          break;
      }
    }

    dataFactory.isPresent = function(id, mode) {
      return exists(id, mode);
    }

    function exists(id, mode) {
      var ex = kids.$asArray().$getRecord(id)[session];
      return (ex) ? ex[mode] : false;
    }

    return dataFactory;
  });

  app.config(function($routeProvider) {
    $routeProvider
      .when('/', {
        controller:'InCtrl',
        templateUrl:'in.html'
      })
      .when('/out', {
        controller:'OutCtrl',
        templateUrl:'out.html'
      })
      .otherwise({
        redirectTo:'/'
      });
  });

  app.controller('MainCtrl',
    function($scope, $route, dataFactory) {

      $scope.kids = dataFactory.kids().$asArray();

      $scope.toggle = function(kid, mode) {
        var time = {};
        time[mode] = new Date().toISOString();
        dataFactory.toggle(kid, mode, time);
      }

      $scope.isPresent = function(kid, mode) {
        return dataFactory.isPresent(kid.$id, mode);
      }

      $scope.shouldShow = function(kid) {
        return (dataFactory.isPresent(kid.$id, 'in')) ? true : false;
      }
    }
  );

  app.controller('InCtrl',
    function($scope, dataFactory) {

      document.getElementById('mode').innerHTML = 'Sign <a href="#out">In</a>';
    }
  );

  app.controller('OutCtrl',
    function($scope, dataFactory) {

      document.getElementById('mode').innerHTML = 'Sign <a href="#in">Out</a>';
    }
  );

})();
