angular.module('fireTeam.common')
	.controller('mainCtrl', MainCtrl);

	MainCtrl.$inject = ['$rootScope','$scope', '$state', '$location', 'GameActivityModelFactory', 'FireTeamModelFactory', 'ActivityModelFactory', '$timeout', '$cookies'];

	function MainCtrl($rootScope, $scope, $state, $location, gameActivityModelFactory, fireTeamModelFactory, activityModelFactory, $timeout, $cookies) {

		var m = $scope.m = {
			fireTeamActivityResults: [],
			playersArrays: [{
				displayName: '',
				isPlaceHolder: true
			}],
			fireTeamMembers: {},
			maxMembers: 6,
			gameModes:{},
			selectedGameMode:'None',
			platformTypes: {
				xbox: {
					id: 1,
					displayValue: 'xbox'
				},
				ps4: {
					id: 2,
					displayValue: 'ps4'
				}
			},
			selectedPlatform: null,
			errorMessage: null,
			initialSearchRun: false
		}
		m.showDropDown = false;
		m.pollingTimeout;
		m.activityLookupPerSearch = 10;
		m.hidePlaceHolder = false;
		m.isShowActivityList = true;
		m.showProgressMessage = false;
		m.showRecentSearches = false;
		m.activityListProgress = {};
		m.recentSearches = [];
		m.isNewSearch = false;
		m.selectedPlatform = m.platformTypes.ps4;
		m.pageInitialized = false;
		m.instanceInterval;
		m.searchCriteria = null;
		m.maxMatchAttempts = 10;
		m.matchAttempts = 0;

		$scope.selectActivity = selectActivity;
		$scope.getFireTeamModel = getFireTeamModel;
		$scope.getMoreResults = getMoreResults;
		$scope.formatDate = formatDate;
		$scope.addPlayer= addPlayer;
		$scope.keyDownEvt = keyDownEvt;
		$scope.loadRecentSearch = loadRecentSearch;
		$scope.cancelSearch = cancelSearch;
		$scope.search = search;
		$scope.selectMode = selectMode;
		$scope.toggleGameMode = toggleGameMode;

		$rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
			var membersArray = toParams.members.split(';');

			if(toParams.platform && membersArray.length > 0){
				m.selectedPlatform = m.platformTypes[toParams.platform];
				if(toParams.mode){
					m.selectedGameMode = toParams.mode; 
				}

				var searchCriteria = {
					members: membersArray,
					platform: m.selectedPlatform,
					mode: m.selectedGameMode
				};
				
				m.playersArrays = [];

				angular.forEach(membersArray, function(player){
					m.playersArrays.push({displayName: player, isPlaceHolder : false});
				});

				if(!angular.equals(searchCriteria, angular.fromJson($cookies['searchCriteria'])) || m.fireTeamActivityResults.length < 1){
					if(toParams.instanceId){
						loadActivityByIdParameter(toParams.instanceId);
					}
					$timeout(function(){
						getFireTeamModel();
					},10);
				};
			}
		});

		$scope.$watch('m.selectedPlatform', function(newVal, oldVal){
			if(newVal !== oldVal){
				m.initialSearchRun = false;
				m.isNewSearch = true;
			}
		})

		$scope.$watch('m.playersArrays', function(newVal, oldVal){
			if(newVal.length <= 1 && newVal[0].isPlaceHolder){
				return;
			}

			if(newVal !== oldVal){
				m.isNewSearch = true;
				m.initialSearchRun = false;
			}

			$timeout(function(){
				inputDetectionFn(newVal);
			},10);
			
		}, true);

		init();

		function init(){
			buildGameModeObj();
			checkRecentSearches();
			m.pageInitialized = true;
		}

		function setSearchCriteria(){
			var membersNameArray = [];
			angular.forEach(m.playersArrays, function(players){
				if(!players.isPlaceHolder){
					membersNameArray.push(players.displayName);
				}
			});

			m.searchCriteria = {
				members: membersNameArray,
				platform: m.selectedPlatform,
				mode: m.selectedGameMode
			};
			setCookie('searchCriteria', m.searchCriteria);
		}

		function buildGameModeObj(){
			m.gameModes = {
					generic:[
						{
							value: 'None',
							displayName: 'Any'
						}
					],
					pve:[
						{
							value: 'AllPvE',
							displayName: 'PvE (Any)'
						},{
							value: 'Story',
							displayName: 'Story'
						},{
							value: 'Strike',
							displayName: 'Strike'
						},{
							value: 'Raid',
							displayName: 'Raid'
						},{
							value: 'Nightfall',
							displayName: 'Nightfall'
						},{
							value: 'Heroic',
							displayName: 'Heroic'
						},{
							value: 'AllStrikes',
							displayName: 'Strikes (All)'
						},{
							value: 'Arena',
							displayName: 'Arena'
						},{
							value: 'AllArena',
							displayName: 'All Arena'
						},{
							value: 'ArenaChallenge',
							displayName: 'Arena Challenge'
						},{
							value: 'None',
							displayName: 'Any'
						}
					],
					pvp: [
						{
							value: 'AllPvP',
							displayName: 'PvP (Any)'
						}
						,{
							value: 'ThreeVsThree',
							displayName: '3 v 3'
						},{
							value: 'Control',
							displayName: 'Control'
						},{
							value: 'Lockdown',
							displayName: 'Lockdown'
						},{
							value: 'Team',
							displayName: 'Team'
						},{
							value: 'FreeForAll',
							displayName: 'Free For All'
						},{
							value: 'IronBanner',
							displayName: 'Iron Banner'
						},{
							value: 'TrialsOfOsiris',
							displayName: 'Trials Of Osiris'
						},{
							value: 'Elimination',
							displayName: 'Elimination'
						},{
							value: 'Rift',
							displayName: 'Rift'
						},{
							value: 'ZoneControl',
							displayName: 'Control'
						},{
							value: 'Racing',
							displayName: 'Sparrow Racing'
						},{
							value: 'Supremacy',
							displayName: 'Supremacy'
						},{
							value: 'Mayhem',
							displayName: 'Mayhem'
						},{
							value: 'PrivateMatchesAll',
							displayName: 'Private Matches (All)'
						}
					]
				}
		}

		function selectMode(mode){
			m.selectedGameMode = mode;
			m.isNewSearch = true;
			toggleGameMode();
		}

		function toggleGameMode(){
			m.showDropDown = !m.showDropDown;
		}

		function inputDetectionFn(model){
			var firstPlaceHolderIndex = null;
			var placeHolderCount = 0;

			angular.forEach(model, function(input, index){
				if(input.isPlaceHolder){
					placeHolderCount += 1;
			  		if(!firstPlaceHolderIndex){
						firstPlaceHolderIndex = index;
					}				
				}
			});

			if(placeHolderCount < 1){
				addPlayer();
			}

			if(placeHolderCount > 1 && firstPlaceHolderIndex){
				m.playersArrays.splice(firstPlaceHolderIndex, 1);
			}
		}

		function checkRecentSearches(){
			var recentSearchCookie = $cookies['recentSearches'];
			if(recentSearchCookie){
				m.recentSearches = angular.fromJson(recentSearchCookie);
			}
		}

		function loadRecentSearch(index){
			m.playersArrays = m.recentSearches[index].players;
			
			m.selectedPlatform = m.recentSearches[index].platformType || m.selectedPlatform;
			m.selectedGameMode = m.recentSearches[index].mode || m.selectedGameMode;
			$scope.$apply();
		}

		function addPlayer(){
			if(m.playersArrays.length < m.maxMembers){
				m.playersArrays.push({displayName:'', isPlaceHolder: true});
			}
		}

		function search(){

			if(m.playersArrays[0].isPlaceHolder){
				throwError({ErrorCode: 101, Error: 'Please enter a player name.'});
				return;
			}

			var membersString = '';
			angular.forEach(m.playersArrays, function(p){
				if(!p.isPlaceHolder){
					membersString = membersString + p.displayName + ';'
			 	}
			});

			var recentSearch = {
				players: m.playersArrays,
				platformType: m.selectedPlatform,
				mode: m.selectedGameMode
			}

			updateRecentSearches(recentSearch);

			membersString = membersString.replace(/;+$/, "");
			$state.go('home', {platform: m.selectedPlatform.displayValue, members: membersString, mode: m.selectedGameMode});
		}

		function getFireTeamModel(){
			if(m.isLoadingData){
				return;
			}

			if(!m.isNewSearch){
				return;
			}


			m.isLoadingData = true;
			m.isShowActivityList = true;
			m.errorMessage = null;

			m.fireTeamActivityResults = [];
			fireTeamModelFactory.clear();

			fireTeamModelFactory.getFireTeam(m.selectedPlatform.id, m.playersArrays).then(function(response){
				m.isNewSearch = false;

				var playerResponseError = false;
				angular.forEach(response, function(playerResponse){
					if((playerResponse.status && playerResponse.status !== 200) || (playerResponse.data && playerResponse.data.ErrorCode)){
						m.initialSearchRun = true;
						playerResponseError = true;
						throwError(playerResponse.data);
					}
				});

				if(playerResponseError){
					return;
				}

				m.fireTeamMembers = response;
				m.fireTeamMembers.gameMode = m.selectedGameMode;
				m.fireTeamMembers.pageNum = 0;

				setSearchCriteria();

				activityModelFactory.getPlayerInstanceList(m.fireTeamMembers).then(function(response){
					if(response.length > 0){
						getFireTeamInstanceData(compareInstances(response));
					}
					else{
						m.initialSearchRun = true;
						throwError({ErrorCode: 100, Error: 'No matching results found.'});
					}
				});
			}, function(error){
				throwError(error);
			});
		};

		function cancelSearch(){
			activityModelFactory.cancelAllPromises().then(function(response){
				m.isLoadingData = false;
				clearData();	
			});
		}

		function throwError(data){

			if(!data.Error && !data.Error){
				data.ErrorCode = 100;
			}

			//Custom Error Handling
			switch (data.ErrorCode){
				case 100:
					data.Error = 'A system error occurred. Please try again';
					break;		
				case 401:	
					data.Error = 'Failed to reach Destiny Servers. Please try again in a few minutes.';
					break;		
				case 500:	
					data.Error = 'A critical error occured. Please try again.';
					break;	
			}

			m.errorMessage = data.Error;
			m.isLoadingData = false;	
			m.isNewSearch = true;
			m.initialSearchRun = false;
			clearData();
		}

		function getMoreResults(){
			if(m.isLoadingData){
				return;
			}

			m.isLoadingData = true;
			m.fireTeamMembers.pageNum += 1;
			activityModelFactory.getPlayerInstanceList(m.fireTeamMembers).then(function(response){
				if(response.length > 0){
					getFireTeamInstanceData(compareInstances(response));
				}
				else{
					throwError({Error: 'No matching results found.'});
				}
			});
		}

		function getFireTeamInstanceData(instanceIdArray){
			if (instanceIdArray.length < 1){
				m.matchAttempts += 1;
				m.isLoadingData = false;

				if(m.matchAttempts <= m.maxMatchAttempts){
					getMoreResults();
				}
				return;
			}

			m.activityListProgress = {
					totalActivities: 0,
					activitiesLoaded: 0,
					percentComplete: 0
				}

			var originalArrayLength = instanceIdArray.length;

			getActiviesPagination(instanceIdArray, m.activityLookupPerSearch);

			startPollingForProgress(100, originalArrayLength);
		}

		function getActiviesPagination(array, amountToProcess){

			if(array.length < amountToProcess){
				amountToProcess = array.length;
			}

			var arrayToProcess = array.splice(0, amountToProcess);
			var remainingLength = array.length;

			activityModelFactory.getFireTeamActivities(arrayToProcess).then(function(response){
				if(response[0].ErrorCode && response[0].ErrorCode > 1){
					throwError(response[0]);
					return;
				}

				angular.forEach(response, function(activity){
					m.fireTeamActivityResults.push(activity);
				});
			
				m.initialSearchRun = true;

				if(remainingLength > 0 && m.isLoadingData){
					getActiviesPagination(array, amountToProcess);
				}
				else{
					m.isLoadingData = false;
					clearData();
				}

			});
		}

		function loadActivityByIdParameter(id){
			var array = [id];

			activityModelFactory.getFireTeamActivities(array).then(function(response){
				if(response[0].ErrorCode && response[0].ErrorCode > 1){
					throwError(response[0]);
					return;
				}
				var activity = response[0];

				m.fireTeamActivityResults.push(activity);
				selectActivity(activity);
			})
		}

		function startPollingForProgress(delay, matches){
			if(delay < 500){
				delay += (delay * .2);
			}
			m.activityListProgress.totalActivities = matches;
			m.pollingTimeout = $timeout(function() {
				var progress = activityModelFactory.getProgress();
				m.activityListProgress = {
					totalActivities: matches,
					activitiesLoaded: progress,
					percentComplete: Math.round((progress / matches) * 100)
				}
				m.showProgressMessage = m.activityListProgress.percentComplete > 0 || m.activityListProgress.percentComplete < 100 ? true : false;
				if(m.isLoadingData){
					startPollingForProgress(delay, matches);
				}
			}, delay);
		}

		function compareInstances(charactersInstanceArrays){
			var checkArray = charactersInstanceArrays[0];
			var matchArray = [];

			for (var i = 0; i < checkArray.length; i++){
				var instanceId = checkArray[i];
				var instanceExistsInAll = true;
				for (var j = 1; j < charactersInstanceArrays.length; j++){
					instanceExistsInAll = recursiveInstanceMatch(instanceId, charactersInstanceArrays[j]);
				}
				if(instanceExistsInAll){
					matchArray.push(instanceId);
				}
			}

			return matchArray;
		}

		function recursiveInstanceMatch(val, array){
			var exists = false;

			for (var i = 0; i <= array.length; i++){
				if(array[i] === val){
					exists = true;
				}
			}
			return exists;
		}

		function selectActivity(activity){
			clearInterval(m.instanceInterval);
			$location.search('instanceId', activity.activityDetails.instanceId);
			m.selectedActivity = activity;
			m.isShowActivityList = false;
			clearInterval(m.instanceInterval);
		}

		function getGameActivitiesData(){
			gameActivityModelFactory.getActivityData().then(function(response){
				m.gameOptionsModel = response;
			})
		}

		function formatDate(inputDate){
			var outputDate = new Date(inputDate);
			return outputDate;
		}

		function keyDownEvt(e){
			switch(e.keyCode){
				case 13:
					e.preventDefault();
					search();
				break;
			}
		}

		function updateRecentSearches(obj){
			var recentMatch = false;
			angular.forEach(m.recentSearches, function(item){
				if(angular.equals(item, obj)){
					recentMatch = true;
				}
			});
			
			if(recentMatch){
				return;
			}

			if(m.recentSearches.length >= 10){
				m.recentSearches.splice(0,1);
			}

			m.recentSearches.push(obj);
			setCookie('recentSearches', m.recentSearches)
		}

		function setCookie(name, val, exp){
			$cookies[name] = JSON.stringify(val);
		}

		function clearData(){
			if(m.pollingTimeout){
				$timeout.cancel(m.pollingTimeout);
			}

			m.matchAttempts = m.maxMatchAttempts;
			m.showProgressMessage = false;
			m.activityListProgress = {
					totalActivities: 0,
					activitiesLoaded: 0,
					percentComplete: 0
				}

			activityModelFactory.clearProgress();
		}
	};


