angular
	.module('fireTeam.common')
	.directive('animatedGlow', animatedGlow);

	animatedGlow.$inject = ['$interval', '$timeout'];

	function animatedGlow($interval, $timeout) {
		return {
			restrict: 'A',
			scope: {
				isActive: '@',
				delay: '@',
				timeoutSeconds: '@'
			},
			transclude: false,
			replace: false,
			link: function(scope, element, attrs){

				var $element = angular.element(element);
				var interval;

				attrs.$observe('isActive', function(val){
					if(val === 'true'){
						startInterval();
					}
					else{
						stopInterval();
					}
				});

				function stopInterval(){
					$element.removeClass('glow');
					$interval.cancel(interval);
					interval = null;
				}

				function startInterval(){
					if(interval){
						return;
					}

					if(!$element.hasClass('glow')){
						$element.addClass('glow').addClass('on');
					}

					if(scope.timeoutSeconds){
						$timeout(function(){
							stopInterval();
						},scope.timeoutSeconds * 1000)
					}

					interval = $interval(function(){
						if($element.hasClass('on')){
							$element.removeClass('on');
						}
						else{
							$element.addClass('on');
						}
					},scope.delay);

					scope.$on('$destroy', function() {
				      stopInterval();
				    });
				}
			}		
		}
	};