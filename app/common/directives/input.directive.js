angular
	.module('fireTeam.common')
	.directive('inputDirective', inputDirective);

	inputDirective.$inject = ['$timeout'];

	function inputDirective($timeout) {
		return {
			restrict: 'E',
			scope: {
				inputModel: '=',
				tabIndex: '@'
			},
			replace: true,
			template: '<input class="text" type="text" placeholder="#gamertag" ng-model="inputModel.displayName"' +
							'tabindex="tabIndex" ng-class="{\'placeholder\' : inputModel.isPlaceHolder}" />',
			link: function(scope, element, attrs){

				$element = angular.element(element);

				$element.on('change', function(e){
					scope.inputModel.isPlaceHolder = scope.inputModel.displayName.length < 1 ? true : false;
					scope.$apply();
				})

				$timeout(function() {
					$element[0].focus();
				}, 10);
			}		
		}
	};