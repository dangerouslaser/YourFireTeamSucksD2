angular
	.module('fireTeam.common')
	.controller('activityInfoCtrl', activityInfoCtrl)
	.directive('activityInfo', activityInfo);

	activityInfo.$inject = ['$rootScope', '$timeout', '$window','$filter'];

	function activityInfo($rootScope, $timeout, $window, $filter) {
		return {
			restrict: 'E',
			scope: {
				activityInfo: '='
			},
			templateUrl: '/activities/activity-info.html',
			controller: activityInfoCtrl,
			controllerAs: 'ctrl',
			transclude: true,
			replace: true,
			link: function(scope, element, attrs, ctrl){
				scope.isLoadingCarnageReport = false;
				scope.showLegand = false;

				angular.element($window).on('click', function(e){
					if(scope.legandIsOpen){
						e.stopPropagation();
						scope.toggleLegend();
						return;
					}
					scope.$apply();
				});

				scope.$watch('activityInfo', function(newVal){
					if(newVal){
						getFireTeam();
					}
				});

				function getFireTeam(){
					scope.activityMembers = {};
					scope.isLoadingCarnageReport = true;
					generateStatRanks();
					updateActivityInfoWithOrderedValues(scope.activityInfo.playerStatsByOrderedList);
					scope.activityInfo.medalLegend = buildMedalLegend(scope.activityInfo);
					console.log('scope log')
					console.log(scope.activityInfo);
				}

				function generateStatRanks(){
					//console.log(JSON.stringify(scope.activityInfo));
					var entriesArray = scope.activityInfo.entries;
					var statsObject = {};

					angular.forEach(entriesArray, function(entryValue, entryKey){
						angular.forEach(entryValue.values, function(statValue, statKey){
							if(!statsObject[statKey]){
								statsObject[statKey] = [];
							}
							var playerValue = {
								characterId: entryValue.characterId,
								destinyUserInfo: entryValue.player.destinyUserInfo,
								basic: {
									value: statValue.basic.value,
									rank: 0,
									displayName: capitalizeFirstLetter(statKey),
									displayValue: statValue.basic.displayValue,
								}
							}
							statsObject[statKey].push(playerValue);
						});
					});

					scope.activityInfo.playerStatsByOrderedList = orderStats(statsObject);
				}

				function orderStats(unOrderedStatRanksObject){
					var orderedList = {};
					angular.forEach(unOrderedStatRanksObject, function(val, key){
						if(isReverseOrder(key)){
							val.ordered = $filter('orderBy')(val, 'basic.value');
						}else{
							val.ordered = $filter('orderBy')(val, '-basic.value');
						}
						val = buildOrderedObject(val);
					});	

					return unOrderedStatRanksObject;
				}

				function buildOrderedObject(entriesObject){
					var rankIndex = 1;
					var totalMembers = entriesObject.ordered.length;
					var prevValue = null;
					entriesObject.hasMedal = false;
					angular.forEach(entriesObject.ordered, function(player){
						player.basic.rank = rankIndex;
						player.basic.outOf = totalMembers;
						player.basic.className = scope.getDisplayValue(rankIndex, totalMembers)
						rankIndex++;
						prevValue = prevValue == null ? player.basic.value : prevValue;
						if(entriesObject.hasMedal === false){
							entriesObject.hasMedal = !areSameValues(prevValue, player.basic.value)
						}
						prevValue = player.basic.value;
					});
					return entriesObject;

					function areSameValues(check1, check2){
						return check1 == check2;
					}
				}

				function updateActivityInfoWithOrderedValues(orderedStatsObject){
					angular.forEach(scope.activityInfo.entries, function(entry){
						var currentCharacterId = entry.characterId;
						angular.forEach(entry.values, function(entryValue, entryKey){
							angular.forEach(orderedStatsObject, function(statValue, statKey){
								if(entryKey.toLowerCase() === statKey.toLowerCase()){
									entryValue.hasMedal = statValue.hasMedal;
									angular.forEach(statValue.ordered, function(player){
										if(currentCharacterId == player.characterId){
											angular.extend(entryValue.basic, player.basic);
										}
									});
								}
							});
						});
					});
					console.log('updateActivityInfoWithOrderedValues')
				}

				function isReverseOrder(val){
					var comparisonEnum = [
						'deaths'
					]

					return comparisonEnum.indexOf(val.toLowerCase()) != -1;
				}

				function capitalizeFirstLetter(string) {
					return string.charAt(0).toUpperCase() + string.slice(1);
				}

				function buildMedalLegend(activityInfoObj){
					var medalLegend = [];
					angular.forEach(activityInfoObj.entries, function(playerEntry){
						var characterObject = {
							player: playerEntry.player.destinyUserInfo.displayName,
							medals:{
								gold: {
									count: 0,
									stats: []
								},
								silver: {
									count: 0,
									stats: []
								},
								bronze: {
									count: 0,
									stats: []
								},
								last: {
									count: 0,
									stats: []
								},
							}
						}

						angular.forEach(playerEntry.values, function(statValue){
							if(statValue.hasMedal){
								var statObject = {
									displayName: statValue.basic.displayName,
									value: statValue.basic.displayValue
								}
								switch(statValue.basic.rank){
									case 1:
										characterObject.medals.gold.count += 1;
										characterObject.medals.gold.stats.push(statObject);
									break;
									case 2:
										characterObject.medals.silver.count += 1;
										characterObject.medals.silver.stats.push(statObject);
									break;
									case 3:
										characterObject.medals.bronze.count += 1;
										characterObject.medals.bronze.stats.push(statObject);
									break;
									case (activityInfoObj.entries.length):
										characterObject.medals.last.count += 1;
										characterObject.medals.last.stats.push(statObject);
									break;
									default:
								}
							}
						});
						medalLegend.push(characterObject);
					});
					
					var topMedalList = [];
					var medalEnum = [
						'gold', 'silver', 'bronze', 'last'
					];

					var index = 0;
					angular.forEach(medalEnum, function(medalType){
						index++;
						var newMedalObject = {
							name: medalType,
							playerName: null,
							stats:[],
							displayValue: index
						}
						var highestMedalTypeCount = 0;
						angular.forEach(medalLegend, function(playerMedals){
							if(playerMedals.medals[medalType].count > highestMedalTypeCount){
								highestMedalTypeCount = playerMedals.medals[medalType].count;
								newMedalObject.playerName = playerMedals.player;
								newMedalObject.stats = playerMedals.medals[medalType].stats;
							}
						});
						topMedalList.push(newMedalObject);
					});

					return topMedalList;
				}
			}
		};
};

activityInfoCtrl.$inject = ['$scope','$anchorScroll'];

function activityInfoCtrl($scope, $anchorScroll){
	var self = this;
	self.m = $scope;
	self.m.selectedStat = null;
	self.m.selectedView = 'stats';
	self.m.showLegend = false;
	$scope.goToPlayer = goToPlayer;
	$scope.getDisplayValue = getDisplayValue;
	$scope.orderByRank = orderByRank;
	$scope.selectStat = selectStat;
	$scope.toggleLegend = toggleLegend;
	$scope.selectView = selectView;
	
	function toggleLegend(){
		self.m.showLegend = !self.m.showLegend;
	}

	function goToPlayer(val){
		$anchorScroll(val);
	}

	function orderByRank(item) {
		return item.basic.rank;
	};

	function selectStat(statIndex){
		self.m.selectedStat = statIndex; 
	}

	function selectView(view){
		self.m.selectedView = view;
	}

	function getDisplayValue(rank, total){
	
		switch(rank){
			case 1:
				return 'gold';
			break;
			case 2:
				return 'silver';
			break;
			case 3:
				return 'bronze';
			break;
			case total:
				return 'last';
			break;
			default:
				return 'average'
		}
	}
}

