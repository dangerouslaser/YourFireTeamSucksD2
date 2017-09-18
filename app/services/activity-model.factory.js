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
		getPostGameCarnageReportForActivityById: function(instanceId) {
			return getPostGameCarnageReportForActivityById(instanceId);
		},
		getPostGameCarnageReportActivitiesForFireteam: function(fireTeamObject) {
			return getPostGameCarnageReportActivitiesForFireteam(fireTeamObject);
		},
		getUpdatedManifest: function(){
			return getUpdatedManifest();
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

	function getUpdatedManifest(){
		var deferred = currentDeferred = $q.defer();
		playerOptionsService.getUpdatedManifest().then(function (response) {
			deferred.resolve(response);	
		});
		return deferred.promise;
	}

	function getPostGameCarnageReportForActivityById(Id) {
		var deferred = currentDeferred = $q.defer();

		playerOptionsService.getPostGameCarnageReport({instanceId: Id}).then(function (response) {	
			if(response.ErrorCode && response.ErrorCode > 1){
				deferred.resolve(response);
				return deferred.promise;
			}

			var postGameCarnageReport = response;
			deferred.resolve(postGameCarnageReport);
			
		});
		return deferred.promise;
	};	

	function getPostGameCarnageReportActivitiesForFireteam(fireTeamObject) {
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