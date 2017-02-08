
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
            .state('home', {
                url: '/:platform?members?instanceId',
                templateUrl: 'index.html'
            });
	}]);

var fireTeamApp = angular.module('fireTeam');