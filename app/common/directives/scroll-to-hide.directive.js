angular
	.module('fireTeam.common')
	.directive('scrollHide', scrollHide);

	scrollHide.$inject = ['$timeout', '$window'];

	function scrollHide($timeout, $window) {
		return {
			restrict: 'A',
			scope: {
				isActive: '='
			},
			link: function(scope, element, attrs){
				var $element = angular.element(element);
				var timeout;

				function whenScrolling(){
					$element.removeClass('visible');
					clearTimeout(timeout);
					timeout = $timeout(function() {
						$element.addClass('visible');
					}, 500);
				}

				angular.element($window).bind('scroll', function() {
					if(scope.isActive){
						whenScrolling();
					}	
				});
			}		
		}
	};