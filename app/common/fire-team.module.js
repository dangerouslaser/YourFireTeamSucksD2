
angular.module('fireTeam', [
	'fireTeam.common',
    'ui.router'
])
.run(function ($rootScope) {
  $rootScope.const = {
	 bungieRoot: 'http://www.bungie.net'
  }
})
.config(['$stateProvider', function ($stateProvider) {
	    'use strict';

      $stateProvider
              .state('search', {
                url: '/search/:platform?members?mode?instanceId',
                templateUrl: 'search-results.html'
            }).state('about', {
                url: '/about',
                templateUrl: 'about.html'
            });
	}]);

var fireTeamApp = angular.module('fireTeam');