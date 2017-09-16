angular.module('fireTeam.common')
	.factory('ActivityModelFactory', ['$q','PlayerOptionsService', function ($q, playerOptionsService) {
    'use strict';

    var currentDeferred;
	var activityModel;
	var progress = 0;
	var activityPromises;
	var activityMatchModel;
	var membersActivityMatchPromises;

	const statsToExcludeArray = [
		'fireTeamId',
		'playerCount'
	]

	var activityModelObject = {
		// getFireTeamActivities: function(instanceArray) {
		// 	//return $q.when(activityModel || getFireTeamActivities(instanceArray));
		// 	return getFireTeamActivities(instanceArray);
		// },
		getPlayerInstanceList: function(fireTeamObject) {
			return getPlayerInstanceList(fireTeamObject);
		},
		// getProgress: function(){
		// 	return progress;
		// },
		// clearProgress: function(){
		// 	progress = 0;
		// },
		cancelAllPromises: function(){
			progress = 0;
			if(currentDeferred){
				currentDeferred.resolve({Message: 'user cancelled'});
			}
			else{
				currentDeferred = $q.defer();
				currentDeferred.resolve({Message: 'nothing to resolve'});
			}

			return currentDeferred.promise;
		},
		clear: clearActivityModel
	};

	function clearActivityModel() {
		activityModel = null;
	}

	// function getFireTeamActivities(instanceArray) {
	// 	activityPromises = [];

	// 	angular.forEach(instanceArray, function(Id){
	// 		activityPromises.push(getPostGameCarnageReport(Id));
	// 	});

	//  	return activityModel = $q.all(activityPromises);
	// };

    // function getPostGameCarnageReport(Id) {
	// 	var deferred = currentDeferred = $q.defer();

	// 	playerOptionsService.getPostGameCarnageReport({instanceId: Id}).then(function (response) {	
	// 		if(response.ErrorCode && response.ErrorCode > 1){
	// 			deferred.resolve(response);
	// 			return deferred.promise;
	// 		}

	// 		var postGameCarnageReport = {
	// 			activityDetails: response.Response.activityDetails,
	// 			dateTime: response.Response.period,
	// 			playerPostGameCarnageReport: response.Response
	// 			//playerPostGameCarnageReport: buildCarnageReport(response.Response),
	// 			//definitions: buildActivityDetailsModel(response.Response.definitions)
	// 		}
	// 		deferred.resolve(postGameCarnageReport);
			
	// 	});
	// 	return deferred.promise;
	// };	

	// function buildActivityDetailsModel(data){
	// 	angular.forEach(data, function(activityVal, activityKey){
	// 		var tempModel = [];

	// 		angular.forEach(data[activityKey], function(activityDetail){
	// 			tempModel.push(activityDetail);
	// 		});

	// 		data[activityKey] = tempModel;
	// 	});
	// 	progress +=1;
	// 	return data;
	// }

	// function buildCarnageReport(data){
	// 	var playerPostGameCarnageReport = {};

	// 	angular.forEach(data.entries, function(entry){
	// 		var trueStatsObj = entry.values;
	// 		var eventStatsObj = entry.extended ? entry.extended.values : undefined;
	// 		var weaponStatsObj = entry.extended ? entry.extended.weapons : undefined;
	// 		angular.extend(trueStatsObj, eventStatsObj);

	// 		playerPostGameCarnageReport[entry.player.destinyUserInfo.displayName] = {
	// 			playerInfo: {
	// 				membershipId: entry.player.destinyUserInfo.membershipId
	// 			},
	// 			characterInfo: {
	// 				characterId: entry.characterId,
	// 				displayName: entry.player.destinyUserInfo.displayName,
	// 				characterClass: entry.player.characterClass,
	// 				characterLevel: entry.player.characterLevel,
	// 				lightLevel: entry.player.lightLevel,
	// 				iconPath: entry.player.destinyUserInfo.iconPath
	// 			},
	// 			trueStats: getStats(trueStatsObj),
	// 			extendedWeaponsStats: getEventWeaponStats(weaponStatsObj)
	// 		}			
	// 	});

	// 	function getStats(statsObject){
	// 		var statsDisplayObject = {};
	// 		if(statsObject){
	// 			var count = 0;
	// 			angular.forEach(statsObject, function(val, key){
	// 				if(statsToExcludeArray.indexOf(key) === -1){
	// 					count++;
	// 					statsDisplayObject[key] = {
	// 						displayValue: val.basic.displayValue,
	// 						value: val.basic.value
	// 					};
	// 				}
	// 			});
	// 			statsDisplayObject.totalStats = {
	// 					displayValue: count,
	// 					value: count
	// 				};
	// 		}
	// 		return statsDisplayObject;
	// 	}

	// 	function getEventWeaponStats(statsObject){
	// 		var statsDisplayObject = {};
	// 		if(statsObject){
	// 			var count = 0;
	// 			angular.forEach(statsObject, function(item){
	// 				angular.forEach(item.values, function(val, key){
	// 					count++;
	// 					statsDisplayObject[key] = {
	// 						displayValue: val.basic.displayValue,
	// 						value: val.basic.value
	// 					};
	// 				});
	// 				statsDisplayObject.totalStats = {
	// 					displayValue: count,
	// 					value: count
	// 				};
	// 			});
	// 		}
	// 		return statsDisplayObject;
	// 	}

	// 	return playerPostGameCarnageReport;
	// }

	// function getWeaponDefinitionById(referenceId) {
	// 	var deferred = $q.defer();

	// 	playerOptionsService.getWeaponDefinitionById({referenceId: referenceId}).then(function(response){
	// 		deferred.resolve(response);
	// 	});	
	// 	return deferred.promise;
	// };

	function getPlayerInstanceList(fireTeamObject) {
		//membersActivityMatchPromises = [];
		var activitySearchOptions = {
			mode: null,
			page: 0,
			activityMembers: []
		};

		angular.forEach(fireTeamObject.players, function(member){
			var memberInfo = {
				membershipId: member.profile.data.userInfo.membershipId,
				characterIds: member.profile.data.characterIds
			}
			activitySearchOptions.mode = fireTeamObject.gameMode;
			activitySearchOptions.page = fireTeamObject.pageNum;
			activitySearchOptions.activityMembers.push(memberInfo);
		});

		membersActivityMatchPromises = getMembersActivityMatches(activitySearchOptions);
		return activityMatchModel = $q.resolve(membersActivityMatchPromises);

		// return $q.all(membersActivityMatchPromises).then(function(response){
		// 	debugger;
		// 	if(response.ErrorCode > 1){
		// 		return response;
		// 	}

		// 	var resolutionObject = {};
		// 	var resolutionArray = [];

		// 	angular.forEach(response, function(promise){
		// 		var key = Object.keys(promise);
		// 		var valArray = promise[key];
		// 		if(!resolutionObject[key]){
		// 			resolutionObject[key] = [];
		// 		}
		// 		resolutionObject[key] = resolutionObject[key].concat(valArray);
		// 	});

		// 	angular.forEach(resolutionObject, function(val, key){
		// 		resolutionArray.push(val);
		// 	});

		// 	return resolutionArray;
		// });
	};


    function getMembersActivityMatches(request) {
		var deferred = currentDeferred = $q.defer();
		var playerInstanceArray = [];
		var playerObject = {};

		playerOptionsService.getCharacterActivityHistoryData({data: request}).then(function(response){
			if(response.ErrorCode > 1){
				deferred.resolve(response);
				return deferred.promise;
			}
			deferred.resolve(response);
		});	
		return deferred.promise;
	};

	return activityModelObject;
}]);