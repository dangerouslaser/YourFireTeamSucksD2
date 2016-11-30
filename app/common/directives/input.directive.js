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
			template: '<input class="text" type="text" placeholder="#gamertag ex. (zincbeatr)" ng-model="inputModel.displayName"' +
							'tabindex="tabIndex" ng-class="{\'placeholder\' : inputModel.isPlaceHolder}" />',
			link: function(scope, element, attrs){

				$element = angular.element(element);		
				var inputValLength = 0;

				$element.on('keypress', function(e){
			        var regex = new RegExp(/^[a-zA-Z0-9._]+$/);
			        var key = String.fromCharCode(!e.charCode ? e.which : e.charCode);
			        if (!regex.test(key)) {
			           e.preventDefault();
			           return false;
			        }
				});

				$element.on('keyup', function(e){
					var inputValLength = scope.inputModel.displayName.length;
					if(inputValLength <= 1){
						scope.inputModel.isPlaceHolder = inputValLength < 1 ? true : false;
						scope.$apply();
					}
				});
			}		
		}
	};