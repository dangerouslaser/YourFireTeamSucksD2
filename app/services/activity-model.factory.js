angular.module('fireTeam.common')
	.factory('ActivityModelFactory', ['$q','PlayerOptionsService', function ($q, playerOptionsService) {
    'use strict';

    var currentDeferred;
	var activityModel;
	var progress = 0;
	var activityPromises;
	var playerInstancePromises;

	const statsToExcludeArray = [
		'fireTeamId',
		'playerCount'
	]

	var activityModelObject = {
		getFireTeamActivities: function(instanceArray) {
			//return $q.when(activityModel || getFireTeamActivities(instanceArray));
			return getFireTeamActivities(instanceArray);
		},
		getPlayerInstanceList: function(fireTeamObject) {
			return getPlayerInstanceList(fireTeamObject);
		},
		getProgress: function(){
			return progress;
		},
		clearProgress: function(){
			progress = 0;
		},
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

	function getFireTeamActivities(instanceArray) {
		activityPromises = [];

		angular.forEach(instanceArray, function(Id){
			activityPromises.push(getPostGameCarnageReport(Id));
		});

	 	return activityModel = $q.all(activityPromises);
	};

    function getPostGameCarnageReport(Id) {
		var deferred = currentDeferred = $q.defer();

		playerOptionsService.getPostGameCarnageReport({instanceId: Id}).then(function (response) {	
			if(response.data.ErrorCode && response.data.ErrorCode > 1){
				deferred.resolve(response.data);
				return deferred.promise;
			}

			var postGameCarnageReport = {
				activityDetails: response.data.Response.data.activityDetails,
				dateTime: response.data.Response.data.period,
				playerPostGameCarnageReport: buildCarnageReport(response.data.Response.data),
				definitions: buildActivityDetailsModel(response.data.Response.definitions)
			}
			deferred.resolve(postGameCarnageReport);
			
		});
		return deferred.promise;
	};	

	function buildActivityDetailsModel(data){
		angular.forEach(data, function(activityVal, activityKey){
			var tempModel = [];

			angular.forEach(data[activityKey], function(activityDetail){
				tempModel.push(activityDetail);
			});

			data[activityKey] = tempModel;
		});
		progress +=1;
		return data;
	}

	function buildCarnageReport(data){
		var playerPostGameCarnageReport = {};

		angular.forEach(data.entries, function(entry){
			var trueStatsObj = entry.values;
			var eventStatsObj = entry.extended ? entry.extended.values : undefined;
			var weaponStatsObj = entry.extended ? entry.extended.weapons : undefined;
			angular.extend(trueStatsObj, eventStatsObj);

			playerPostGameCarnageReport[entry.player.destinyUserInfo.displayName] = {
				playerInfo: {
					membershipId: entry.player.destinyUserInfo.membershipId
				},
				characterInfo: {
					characterId: entry.characterId,
					displayName: entry.player.destinyUserInfo.displayName,
					characterClass: entry.player.characterClass,
					characterLevel: entry.player.characterLevel,
					lightLevel: entry.player.lightLevel,
					iconPath: entry.player.destinyUserInfo.iconPath
				},
				trueStats: getStats(trueStatsObj),
				extendedWeaponsStats: getEventWeaponStats(weaponStatsObj)
			}			
		});

		function getStats(statsObject){
			var statsDisplayObject = {};
			if(statsObject){
				var count = 0;
				angular.forEach(statsObject, function(val, key){
					if(statsToExcludeArray.indexOf(key) === -1){
						count++;
						statsDisplayObject[key] = {
							displayValue: val.basic.displayValue,
							value: val.basic.value
						};
					}
				});
				statsDisplayObject.totalStats = {
						displayValue: count,
						value: count
					};
			}
			return statsDisplayObject;
		}

		function getEventWeaponStats(statsObject){
			var statsDisplayObject = {};
			if(statsObject){
				var count = 0;
				angular.forEach(statsObject, function(item){
					angular.forEach(item.values, function(val, key){
						count++;
						statsDisplayObject[key] = {
							displayValue: val.basic.displayValue,
							value: val.basic.value
						};
					});
					statsDisplayObject.totalStats = {
						displayValue: count,
						value: count
					};
				});
			}
			return statsDisplayObject;
		}

		return playerPostGameCarnageReport;
	}

	function getWeaponDefinitionById(referenceId) {
		var deferred = $q.defer();

		playerOptionsService.getWeaponDefinitionById({referenceId: referenceId}).then(function(response){
			deferred.resolve(response);
		});	
		return deferred.promise;
	};

	function getPlayerInstanceList(fireTeamObject) {
		playerInstancePromises = [];	

		angular.forEach(fireTeamObject, function(player){
			angular.forEach(player.characters, function(character){
				var data = {membershipId: player.membershipId, characterId: character.characterBase.characterId, mode:fireTeamObject.gameMode, page: fireTeamObject.pageNum};
				playerInstancePromises.push(getPlayerInstance(data));
			});
		});

		return $q.all(playerInstancePromises).then(function(response){
			if(response.ErrorCode > 1){
				return response;
			}

			var resolutionObject = {};
			var resolutionArray = [];

			angular.forEach(response, function(promise){
				var key = Object.keys(promise);
				var valArray = promise[key];
				if(!resolutionObject[key]){
					resolutionObject[key] = [];
				}
				resolutionObject[key] = resolutionObject[key].concat(valArray);
			});

			angular.forEach(resolutionObject, function(val, key){
				resolutionArray.push(val);
			});

			return resolutionArray;
		});
	};


    function getPlayerInstance(request) {
		var deferred = currentDeferred = $q.defer();
		var playerInstanceArray = [];
		var playerObject = {};

		playerOptionsService.getCharacterActivityHistoryData(request).then(function(response){
			if(response.data.ErrorCode > 1){
				deferred.resolve(response.data);
				return deferred.promise;
			}
			var activities = response.data.Response.data.activities;
			angular.forEach(activities, function(event){
				playerInstanceArray.push(event.activityDetails.instanceId);
			});
			playerObject[request.membershipId] = playerInstanceArray;
			deferred.resolve(playerObject);
		});	
		return deferred.promise;
	};

	return activityModelObject;
}]);