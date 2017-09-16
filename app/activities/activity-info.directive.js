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

				angular.element($window).on('click', function(e){
					if(scope.tableClickEvnt){
						e.stopPropagation();
						scope.tableClickEvnt = null;
						return;
					}
					scope.$apply();
				});

				scope.$watch('activityInfo', function(newVal){
					if(newVal){
						console.log(newVal);
						getFireTeam();
					}
				});

				function getFireTeam(){
					scope.activityMembers = {};
					scope.isLoadingCarnageReport = true;
					generateStatRanks();
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
								value: statValue.basic.value
							}
							statsObject[statKey].push(playerValue);
						});
					});
					angular.forEach(statsObject, function(item){
						item.ordered = $filter('orderBy')(item, 'value');
					});					
					function checkOrder(statsObject){
						angular.forEach(statsObject, function(item){
							item.hasMedal = false;
							var allTheSame = true;
							var prevCheck = null;
							angular.forEach(item.ordered, function(ordered){
								if(prevCheck == null){
									prevCheck = ordered.value;
								}
								item.hasMedal = prevCheck != ordered.value;
							});
						});

						return statsObject;
					}
					
					updateActivityInfoWithOrderedValues(checkOrder(statsObject), function(updatedActivityInfo){
						scope.isLoadingCarnageReport = false;
						//console.log(scope.activityInfo.entries);
						scope.medalLegend = buildMedalLegend(updatedActivityInfo);
					});
				}

				function updateActivityInfoWithOrderedValues(orderedStatsObject, nextFn){
					var totalMembers = scope.activityInfo.entries.length;

					angular.forEach(scope.activityInfo.entries, function(entry){
						var currentCharacterId = entry.characterId;
						angular.forEach(entry.values, function(entryValue, entryKey){
							angular.forEach(orderedStatsObject, function(statValue, statKey){
								if(entryKey === statKey){
									entryValue.basic.displayName = capitalizeFirstLetter(statKey);
									entryValue.basic.className = '';
									entryValue.hasMedal = statValue.hasMedal;
									var rankOrderReverse = statKey == 'deaths' ? totalMembers : null;
									if(statValue.hasMedal){
										for (var i = 0; i < statValue.ordered.length; i++){
											if(rankOrderReverse){
												rankOrderReverse--;
											}
											if(currentCharacterId == statValue.ordered[i].characterId){
												entryValue.basic.rank = !rankOrderReverse ? (i+1) : rankOrderReverse;
												entryValue.basic.outOf = totalMembers;
												entryValue.basic.className = scope.getDisplayValue(statKey, entryValue.basic.rank, totalMembers);
											}
										}
									}
								}
							});
						});
					});
					nextFn(scope.activityInfo);

					function capitalizeFirstLetter(string) {
						return string.charAt(0).toUpperCase() + string.slice(1);
					}
				}

				function buildMedalLegend(activityInfoObj){
					var medalLegend = [];
					angular.forEach(activityInfoObj.entries, function(playerEntry){
						console.log(playerEntry.player.destinyUserInfo.displayName)
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
								switch(statValue.basic.rank){
									case 1:
										characterObject.medals.gold.count += 1;
										characterObject.medals.gold.stats.push(statValue.basic.displayName);
									break;
									case 2:
										characterObject.medals.silver.count += 1;
										characterObject.medals.silver.stats.push(statValue.basic.displayName);
									break;
									case 3:
										characterObject.medals.bronze.count += 1;
										characterObject.medals.bronze.stats.push(statValue.basic.displayName);
									break;
									case (activityInfoObj.entries.length):
										characterObject.medals.last.count += 1;
										characterObject.medals.bronze.stats.push(statValue.basic.displayName);
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
	self.m.showLegend = true;
	$scope.goToPlayer = goToPlayer;
	$scope.getDisplayValue = getDisplayValue;
	$scope.orderByRank = orderByRank;
	$scope.selectStat = selectStat;
	$scope.toggleLegend = toggleLegend;
	
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

	function getDisplayValue(statKey, rank, total){
	
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

