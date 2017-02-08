angular
	.module('fireTeam.common')
	.controller('activityInfoCtrl', activityInfoCtrl)
	.directive('activityInfo', activityInfo);

	activityInfo.$inject = ['$rootScope', 'FireTeamModelFactory', '$timeout', '$window'];

	function activityInfo($rootScope, fireTeamModelFactory, $timeout) {
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
				scope.chartModel = {};
				scope.activityMembers = {};
				scope.isShowRankings = true;
				scope.isShowTable = true;
				scope.const = $rootScope.const;

				scope.$watch('activityInfo', function(newVal){
					if(newVal){
						getFireTeam();
						// $timeout(function() {
						// 	var $tableElement = angular.element(element[0].querySelector('#stats-table-container'));
						// 	var scrollToTablePos = $tableElement[0].getBoundingClientRect().top;
						// 	$("body").animate({scrollTop: scrollToTablePos}, "fast");
						// }, 500);
					}
				});

				function getFireTeam(){
					scope.activityMembers = {};
					scope.isLoadingCarnageReport = true;
					scope.chartModel = createChartModel();
				}

				function createChartModel(){
					var tableObj = {};
					var activityMembers = Object.keys(scope.activityInfo.playerPostGameCarnageReport);

					angular.forEach(activityMembers, function(player){
						var object = scope.activityInfo.playerPostGameCarnageReport[player].characterInfo;
						angular.extend(object, scope.activityInfo.playerPostGameCarnageReport[player].playerInfo)
						scope.activityMembers[player] = object;
					});

					angular.forEach(scope.activityInfo.playerPostGameCarnageReport, function(player){
						angular.forEach(player, function(statTopicVal, statTopicKey){
							if(statTopicKey !== 'playerInfo' && statTopicKey !== 'characterInfo'){
								if(!tableObj[statTopicKey]){
									tableObj[statTopicKey] = {};
								}
								angular.forEach(statTopicVal, function(val, key){
									if(!tableObj[statTopicKey][key]){
										tableObj[statTopicKey][key] = {};
									}
									tableObj[statTopicKey][key][player.characterInfo.displayName] = {
										displayValue: val.displayValue,
										value: val.value
									};
									tableObj[statTopicKey][key].displayName = ctrl.m.camelCaseToString(key);
								});
							}
						});
					});

					angular.forEach(scope.activityMembers, function(val, key){
						angular.forEach(tableObj, function(statObj){
							angular.forEach(statObj, function(stat){
								if (!stat.hasOwnProperty(key)){
									stat[key] = {
										displayValue: null,
										value: null
									};
								}
							});
						});
					});

					return calculateRatingValues(tableObj);
				};
			
				function calculateRatingValues(modelObj){
					angular.forEach(modelObj, function(statObj){
						angular.forEach(statObj, function(stat){
							stat.ratingValues = {};
							var highestVal = 0;
							var lowestVal = null;
							var statArray = [];

							angular.forEach(stat, function(playerValue, playerKey){
								var intDisplayVal = parseInt(playerValue.value);
								highestVal = intDisplayVal > highestVal ? intDisplayVal : highestVal;
								lowestVal = (intDisplayVal < lowestVal || !lowestVal) ? intDisplayVal : lowestVal;

								if(intDisplayVal){
									statArray.push(intDisplayVal);
								}
							});	

							stat.ratingValues.highestVal = isNaN(highestVal) ? 0 : highestVal;
							stat.ratingValues.lowestVal = isNaN(lowestVal) ? 0 : lowestVal;
							stat.ratingValues.avgVal = getAvg(statArray);

						});
					});

					return calculatePlayerRatings(modelObj);
				}

				function calculatePlayerRatings(ratingObj){

					angular.forEach(ratingObj, function(statCat){
						angular.forEach(statCat, function(stat){
							var leastDifferential = null;
							var avgPlayer;
							angular.forEach(stat, function(playerVal, playerKey){
								var intDisplayVal = parseInt(stat[playerKey].value);
								var avgDifferential = Math.abs(stat.ratingValues.avgVal - intDisplayVal);

								leastDifferential = (avgDifferential < leastDifferential || !leastDifferential) ? avgDifferential : leastDifferential;

								if (intDisplayVal === stat.ratingValues.highestVal && stat.ratingValues.highestVal !== stat.ratingValues.avgVal){
								 	playerVal.isGreatest = true;
								}

								if (intDisplayVal === stat.ratingValues.lowestVal && stat.ratingValues.lowestVal !== stat.ratingValues.avgVal){
								 	playerVal.isLeast = true;
								}
					
								if (avgDifferential === leastDifferential && stat.ratingValues.avgVal !== 0){
									avgPlayer = playerKey;
								}
							});

							if(avgPlayer){
								stat[avgPlayer].isMostAvg = true;
							}
						});
					});

					scope.isLoadingCarnageReport = false;
					return ratingObj;
				}
			}
		};

		function getAvg(array){
			var avg = 0;
			var sum = 0;

			angular.forEach(array, function(item){
				sum += item;
			});

			avg = sum / array.length;

			return isNaN(avg) ? 0 : Math.round(avg * 100) / 100;
		}
};

activityInfoCtrl.$inject = ['$scope'];

function activityInfoCtrl($scope){
	var self = this;
	self.m = $scope;
	self.m.isRankLoaded = false;
	self.m.isSticky = false;
	self.m.isShowUnusedRankings = false;
	self.m.isRankNeedsUpdate = true;

	self.m.tableSelectionObject = {
			selectedCell: {},
			selectedRow: null,
			selectedColumn: null
	}
	self.m.rankingCategories = {};
	self.m.suggestedRankingCategories = {
			kills: {
				displayName: 'Kills',
				weight: 9,
				isUse: true,
				isNew: true
			},
			assists: {
				displayName: 'Assists',
				weight: 8,
				isUse: true,
				isNew: true
			},
			precisionKills: {
				displayName: 'Precision Kills',
				weight: 10,
				isUse: true,
				isNew: true
			},
			averageLifespan: {
				displayName: 'Average Lifespan',
				weight: 7,
				isUse: true,
				isNew: true
			},
			totalStats: {
				displayName: 'Total Stats',
				weight: 1,
				isUse: true,
				isNew: true
			},
			suicides: {
				displayName: 'Suicides',
				weight: -1,
				isUse: true,
				isNew: true
			},
			deaths: {
				displayName: 'Deaths',
				weight: -8,
				isUse: true,
				isNew: true
			},
			longestKillSpree: {
				displayName: 'Longest Kill Spree',
				weight: 10,
				isUse: true,
				isNew: true
			},
			resurrectionsPerformed: {
				displayName: 'Resurrections Performed',
				weight: 3,
				isUse: true,
				isNew: true
			},
			longestSingleLife: {
				displayName: 'Longest Single Life',
				weight: 5,
				isUse: true,
				isNew: true
			}
	};

	self.m.weightValueArray = setupValueArray();
	self.m.calculatePlayerStandings = calculatePlayerStandings;
	self.m.camelCaseToString = camelCaseToString;
	self.m.addNewItem = addNewItem;
	self.m.removeNewItem = removeNewItem;
	self.m.selectCell = selectCell;
	self.m.selectColumn = selectColumn;
	self.m.selectRow = selectRow;
	self.m.changedRankValue = changedRankValue;

	$scope.$watch('chartModel', function(newVal){
		if(newVal.trueStats){
			activate();
		}
	});

	function activate(){
		getPossibleRankingOptions();
	}

	function setupValueArray(){
		var array = [];
		for (var i = -10; i <= 10; i++){
			array.push(i);
		}

		return array;
	}

	function getPossibleRankingOptions(){
		self.m.rankingCategories = {};
		angular.forEach(self.m.chartModel.trueStats, function(val, key){
			var weight = self.m.suggestedRankingCategories[key] ? self.m.suggestedRankingCategories[key].weight : 0;
			self.m.rankingCategories[key] = {
				displayName: val.displayName,
				weight: weight,
				isUse: weight === 0 ? false : true,
				isNew: true
			}
		});
	}

	function calculatePlayerStandings(){

		angular.forEach(self.m.activityMembers, function(playerVal, playerKey){
			playerVal.rank = {
				totalScore: 0
			};

			 angular.forEach(self.m.rankingCategories, function(rankVal, rankKey){
			 	var weight = rankVal.weight;
			 	var avgValue = self.m.chartModel.trueStats[rankKey].ratingValues.avgVal;
			 	var playerStatValue = self.m.chartModel.trueStats[rankKey][playerKey].value;
			 	var differential = playerStatValue - avgValue;			
			 	var statRankScore = differential * weight;

			 	removeNewItem(rankVal);
			 	if(weight === 0){
			 		rankVal.isUse = false;
			 	}

			 	self.m.chartModel.trueStats[rankKey].weight = weight;		 
			 	playerVal.rank[rankKey] = statRankScore;		
		 		playerVal.rank.totalScore += statRankScore;
			 });

		 	var maxActivityDuration = self.m.chartModel.trueStats.secondsPlayed.ratingValues.highestVal;
		 	var thisPlayerActivityDuration = self.m.chartModel.trueStats.secondsPlayed[playerKey].value;
		 	var timePlayedPercentage = thisPlayerActivityDuration / maxActivityDuration;
		 	var finalRankScore = (timePlayedPercentage * playerVal.rank.totalScore) / 100;

		 	playerVal.rank.timePlayedPercentage = timePlayedPercentage;
		 	playerVal.rank.totalScore = Math.round(finalRankScore * 100)/100;
		});		

		self.m.isRankLoaded = true;
		self.m.isRankNeedsUpdate = false;
		$scope.isShowRankings = false;
	}

	function selectCell(columnIndex, rowIndex, cellValue){		
		self.m.tableSelectionObject.selectedCell = {
			row: rowIndex,
			column: columnIndex
		};
	}

	function selectColumn(columnId){
		self.m.tableSelectionObject.selectedCell = {
			row : null,
			column: columnId
		}
	}

	function selectRow(rowId){
		self.m.tableSelectionObject.selectedCell = {
			row : rowId,
			column: null
		}
	}

	function camelCaseToString(val){
		var newString = val.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ 
			return str.toUpperCase(); 
		});

		return newString;
	}

	function removeNewItem(rank){
		rank.isNew = false;
	}

	function changedRankValue(rank){
		rank.isNew = true;
		self.m.isRankNeedsUpdate = true;
	}

	function addNewItem(rank){
		rank.isNew = false;
		if(rank.weight !== 0){
			rank.isUse = true;
			rank.isNew = true;
			self.m.isRankLoaded = false;
		}
	}

}

