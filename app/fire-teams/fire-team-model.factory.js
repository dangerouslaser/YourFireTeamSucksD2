angular.module('fireTeam.common')
	.factory('FireTeamModelFactory', ['$q','PlayerOptionsService', function ($q, playerOptionsService) {
    'use strict';

	var fireTeamModel, playerPromises;

	var fireTeamModelObject = {
		getFireTeam: function(memberType, userNames) {
			return $q.when(fireTeamModel || playerPromises || getFireTeamMembers(memberType, userNames));
		},
		clear: clear
	};	

	function clear() {
			fireTeamModel = null;
			playerPromises = null;
		}

	function getFireTeamMembers(memberType, userNames) {
		var deferred = $q.defer();
		var playerPromises = [];

		angular.forEach(userNames, function(user){
			if(user.displayName && user.displayName !== ''){
				playerPromises.push(getPlayerData(memberType, user.displayName));
			}
		});

		return fireTeamModel = $q.all(playerPromises);
	};

    function getPlayerData(memberType, userName) {
		var deferred = $q.defer();

		playerOptionsService.getMembershipId({memberType: memberType, userName: userName}).then(function (response) {	
			var membershipModel = response.data;
			if(!membershipModel && membershipModel === ""){
				var customErrorObject = {
											ErrorCode: 100, 
											data: {
												Message: 'User "' + userName + '" not found.'
											}
										};
				deferred.resolve(customErrorObject);
				return deferred.promise;
			}
			playerOptionsService.getBaseCharacterInfo({membershipId: response.data.membershipId}).then(function (response) {
				if(response.data.ErrorCode > 1){
					deferred.resolve(response.data);
					return deferred.promise;
				}

				response = response.data.Response.data
				response.membershipInfo = membershipModel;

				angular.forEach(response.characters, function(character){
					switch(character.characterBase.classType){
						case 0:
							character.className = 'Titan';
							break;
						case 1:
							character.className = 'Hunter';
							break;
						case 2:
							character.className = 'Warlock';
							break;
						default:
							character.className = 'Unknown';
					}
				});
				deferred.resolve(response);
			});
		});
		return deferred.promise;
	};

	function getBaseCharacterInfo(membershipId){
		playerOptionsService.getBaseCharacterInfo({membershipId: membershipId}).then(function (response) {	
			return response.data.Response.data;
		});
	};		

	return fireTeamModelObject;
}]);