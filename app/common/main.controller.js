angular.module('fireTeam.common')
	.controller('mainCtrl', MainCtrl);

	MainCtrl.$inject = ['$scope','PlayerBaseModelFactory', 'GameActivityModelFactory', 'FireTeamModelFactory', 'PlayerOptionsService', 'ActivityModelFactory', '$timeout', '$cookies'];

	function MainCtrl($scope, playerBaseModelFactory, gameActivityModelFactory, fireTeamModelFactory, playerOptionsService, activityModelFactory, $timeout, $cookies) {

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

		$scope.selectActivity = selectActivity;
		$scope.getFireTeamModel = getFireTeamModel;
		$scope.getMoreResults = getMoreResults;
		$scope.formatDate = formatDate;
		$scope.addPlayer= addPlayer;
		$scope.keyDownEvt = keyDownEvt;
		$scope.loadRecentSearch = loadRecentSearch;
		$scope.cancelSearch = cancelSearch;


		$scope.$watch('m.playersArrays', function(newVal, oldVal){
			if(newVal.length <= 1 && newVal[0].isPlaceHolder){
				return;
			}

			if(newVal !== oldVal){
				m.isNewSearch = true;
				m.initialSearchRun = false;
			}

			$timeout(function(){
				console.log('input detection fn')
				inputDetectionFn(newVal);
			},10);
			

		}, true);

		init();

		function init(){
			checkRecentSearches();
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
			m.selectedPlatform = m.recentSearches[index].platformType;
		}

		function addPlayer(){
			if(m.playersArrays.length < m.maxMembers){
				m.playersArrays.push({displayName:'', isPlaceHolder: true});
			}
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

			var recentSearch = {
				players: m.playersArrays,
				platformType: m.selectedPlatform
			}

			updateRecentSearches(recentSearch);

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
				console.log(response)
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

			// activityModelFactory.getFireTeamActivities(instanceIdArray).then(function(response){
			// 	console.log('all instance arrays - lets try to page this');
			// 	if(response[0].ErrorCode && response[0].ErrorCode > 1){
			// 		throwError(response[0]);
			// 		return;
			// 	}

			// 	angular.merge(m.fireTeamActivityResults, response);

			// 	m.isLoadingData = false;
			// 	m.initialSearchRun = true;
			// });

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
			m.selectedActivity = activity;
			m.isShowActivityList = false;
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
					getFireTeamModel();
				break;
			}
		}

		function updateRecentSearches(obj){
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


