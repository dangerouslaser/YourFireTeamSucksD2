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
			gameModeArray:['None'],
			gameMode: 'None',
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

		$scope.selectActivity = selectActivity;
		$scope.getFireTeamModel = getFireTeamModel;
		$scope.getMoreResults = getMoreResults;
		$scope.formatDate = formatDate;
		$scope.addPlayer= addPlayer;
		$scope.keyDownEvt = keyDownEvt;
		$scope.loadRecentSearch = loadRecentSearch;
		$scope.cancelSearch = cancelSearch;
		$scope.search = search;

		$rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
			var membersArray = toParams.members.split(';');

			if(toParams.platform && membersArray.length > 0){
				m.selectedPlatform = m.platformTypes[toParams.platform];

				var searchCriteria = {
					members: membersArray,
					platform: m.selectedPlatform
				};
				
				m.playersArrays = [];

				angular.forEach(membersArray, function(player){
					m.playersArrays.push({displayName: player, isPlaceHolder : false});
				});

				if(!angular.equals(searchCriteria, angular.fromJson($cookies['searchCriteria'])) || m.fireTeamActivityResults.length < 1){
					$timeout(function(){
						getFireTeamModel();
					},10);
				};

				if (toParams.instanceId){
					m.instanceInterval = setInterval(function(){
						if(!m.isLoadingData){
							clearInterval(m.instanceInterval);
							angular.forEach(m.fireTeamActivityResults, function(activity){
								if (activity.activityDetails.instanceId == toParams.instanceId){
									selectActivity(activity);
									$scope.$apply();
								}
							})
						}
					},100);
				}
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
				platform: m.selectedPlatform
			};
			setCookie('searchCriteria', m.searchCriteria);
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
			m.playersArrays = m.recentSearches[index].players
			
			m.selectedPlatform = m.recentSearches[index].platformType;
			$scope.$apply();
		}

		function addPlayer(){
			if(m.playersArrays.length < m.maxMembers){
				m.playersArrays.push({displayName:'', isPlaceHolder: true});
			}
		}

		function search(){
			var membersString = '';
			angular.forEach(m.playersArrays, function(p){
				if(!p.isPlaceHolder){
					membersString = membersString + p.displayName + ';'
			 	}
			});

			var recentSearch = {
				players: m.playersArrays,
				platformType: m.selectedPlatform
			}

			updateRecentSearches(recentSearch);

			membersString = membersString.replace(/;+$/, "");
			$state.go('home', {platform: m.selectedPlatform.displayValue, members: membersString});
		}

		function getFireTeamModel(){
			if(m.isLoadingData){
				return;
			}

			if(m.playersArrays[0].isPlaceHolder){
				throwError({Error: 'Please enter a player name.'});
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
				if((response[0].status && response[0].status !== 200) || (response[0].data && response[0].data.ErrorCode)){
					m.initialSearchRun = true;
					throwError(response[0].data);
					return;
				}

				m.fireTeamMembers = response;
				m.fireTeamMembers.gameMode = m.gameMode;
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

			if(!data.ErrorCode){
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
				m.isLoadingData = false;
				getMoreResults();
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

			m.showProgressMessage = false;
			m.activityListProgress = {
					totalActivities: 0,
					activitiesLoaded: 0,
					percentComplete: 0
				}

			activityModelFactory.clearProgress();
		}
	};


