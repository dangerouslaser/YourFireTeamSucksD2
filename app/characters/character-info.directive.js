	angular
		.module('fireTeam.common')
		.directive('characterInfo', characterInfo)
		.controller('CharacterInfoCtrl', CharacterInfoCtrl);

	function characterInfo() {
		return {
			restrict: 'E',
			scope: {
				characterInfo: '='
			},
			template: 	'<div id="CharacterContainer">' + 
							'{{m.character}}' +
						'</div>',
			controller: 'CharacterInfoCtrl',
			controllerAs: 'characterInfoCtrl',
			transclude: true,
			replace: true
		};
	}

	CharacterInfoCtrl.$inject = ['$scope','CharacterModelFactory'];

	function CharacterInfoCtrl($scope, characterModelFactory) {
		var m = $scope;
		activate();

		function activate(){
			getCharacterStatData(m.characterInfo);
		}

		function getCharacterStatData(character){
			console.log(character)
			characterModelFactory.getCharacterStatsData(character.characterBase.membershipId, character.characterBase.characterId).then(function(response){
				m.characterStatistics = response;
				console.log(response)
			});
		}
	};