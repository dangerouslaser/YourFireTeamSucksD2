angular
	.module('fireTeam.common')
	.directive('disabledDiv', disabledDiv);

	disabledDiv.$inject = [];

	function disabledDiv() {
		return {
			restrict: 'A',
			scope: {},
			replace: true,
			template: '<div class="disabled-div"></div>',
			link: function(scope, element, attrs){
				
			}		
		}
	};