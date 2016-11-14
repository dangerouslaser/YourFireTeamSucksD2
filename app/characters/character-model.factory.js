angular.module('fireTeam.common')
	.factory('CharacterModelFactory', ['$q','PlayerOptionsService', function ($q, playerOptionsService) {
    'use strict';

	var characterModel, characterPromise;

	var characterModelObject = {
		getCharacterStatsData: function(membershipId, characterId) {
			return $q.when(characterModel || characterPromise || getCharacterStatsData(membershipId, characterId));
		}
	};	

	function getCharacterStatsData(membershipId, characterId){
		var deferred = $q.defer();
		characterPromise = deferred.promise;

		playerOptionsService.getCharacterStatsData({membershipId: membershipId, characterId: characterId}).then(function (response) {
			characterModel = characterModel || response;
			console.log(response)
			deferred.resolve(response);
		});
		return deferred.promise;	
	}

	return characterModelObject;
}]);

