angular.module('fireTeam.common')
	.factory('GameActivityModelFactory', ['$q','GameOptionsService', function ($q, gameOptionsService) {
    'use strict';

 	var gameActivityModel, gamePromise;

	var gameActivityModelObject = {
		getActivityData: function() {
			return $q.when(gameActivityModel || gamePromise || getActivityData());
		}
	};

	function getActivityData(){
		var deferred = $q.defer();
		playerPromise = deferred.promise;

			gameOptionsService.getActivityData().then(function (response) {
			gameActivityModel = response;
			deferred.resolve(response);
		});	
	};

	return gameActivityModelObject;

}]);