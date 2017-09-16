// angular.module('fireTeam.common')
// 	.factory('PlayerBaseModelFactory', ['$q','PlayerOptionsService', function ($q, playerOptionsService) {
//     'use strict';

// 	var playerModel, playerPromises;

// 	var playerModelObject = {
// 		getPlayerInfo: function(memberType, userName) {
// 			return $q.when(playerModel || playerPromises || getPlayerInfo(memberType, userName));
// 		},
// 		clear: function(){
// 			playerModel = {};
// 			return playerModel;
// 		}
// 	};	

//     function getPlayerInfo(memberType, userName) {
// 		var deferred = $q.defer();

// 		playerOptionsService.getMembershipId({memberType: memberType, userName: userName}).then(function (response) {	
// 			var membershipModel = response;
// 			playerOptionsService.getBaseCharacterInfo({membershipId: response.membershipId}).then(function (response) {	
// 				response = response.Response.data
// 				response.membershipInfo = membershipModel;
// 				playerModel = playerModel || response;

// 				angular.forEach(playerModel.characters, function(character){
// 					switch(character.characterBase.classType){
// 						case 0:
// 							character.className = 'Titan';
// 							break;
// 						case 1:
// 							character.className = 'Hunter';
// 							break;
// 						case 2:
// 							character.className = 'Warlock';
// 							break;
// 						default:
// 							character.className = 'Unknown';
// 					}
// 				});
// 			});
// 		});
// 		return deferred.promise;
// 	};

// 	function getBaseCharacterInfo(membershipId){
// 		playerOptionsService.getBaseCharacterInfo({membershipId: membershipId}).then(function (response) {	
// 			return response.Response.data;
// 		});
// 	};		
// 	return playerModelObject;
// }]);