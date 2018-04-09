angular.module('routes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

$routeProvider

    // home page
    .when('/', {
        templateUrl: 'catalog.html',
        controller: 'mainController'
    })

    .when('/adminPanel/:id', {
      templateUrl: "admin.html",
      controller: "adminController"
    })

    .when('/sword/:id', {
      templateUrl: "sword.html",
      controller: "swordViewController"
    })

    .when('/login', {
      templateUrl : "login.html",
      controller: "loginController"
    })

$locationProvider.html5Mode(true);

}]);
