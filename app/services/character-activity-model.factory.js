angular.module('fireTeam.common')
	.factory('CharacterActivityModelFactory', ['$q','PlayerOptionsService', function ($q, playerOptionsService) {
    'use strict';

	var characterActivityModel, characterActivityPromise;

	var characterActivityModelObject = {
		getActivityHistoryData: function(membershipId, characterId) {
			return $q.when(characterActivityModel || characterActivityPromise || getActivityHistoryData(membershipId, characterId));
		}
	};	

	function getActivityHistoryData(membershipId, characterId){
		var deferred = $q.defer();
		characterActivityPromise = deferred.promise;

		playerOptionsService.getActivityHistoryData({membershipId: membershipId, characterId: characterId}).then(function (response) {
			characterActivityModel = characterActivityModel || response;
			console.log(response)
			deferred.resolve(response);
		});
		return deferred.promise;	
	}

	return characterActivityModelObject;
}]);

