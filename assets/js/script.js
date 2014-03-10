var pail = angular.module('pail', ['ngRoute', 'ngSanitize'])
    .config(['$routeProvider', function($routeProvider) {
      $routeProvider
        .when('/', {templateUrl: 'partials/home.html', controller: Home})
        .when('/mail', {templateUrl: 'partials/mail.html', controller: Mail})
        .when('/compose', {templateUrl: 'partials/compose.html', controller: Compose})
        .otherwise({redirectTo: '/'});
  }])
  .run(function($rootScope) {
      $rootScope.$on('$viewContentLoaded', function () {
          $(document).foundation();
      });
  });

function AppController( $scope, $http ) {
  // Init methods
}

function Home($scope, $http, $location) {
  if(typeof macgap !== 'undefined') {
    macgap.growl.notify({title: 'MacGap', content: 'Hello World'});
  }
}

function Mail($scope, $http, $location) {
  
}

function Compose($scope, $http, $location) {
  
}
