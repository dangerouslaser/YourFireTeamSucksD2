angular
	.module('fireTeam.common')
	.directive('stickyContainer', stickyContainer);

	stickyContainer.$inject = ['$window'];

	function stickyContainer($window) {
		return {
			restrict: 'A',
			scope: {
				stickyClass: '@',
				isSticky: '='
			},
			link: function(scope, element, attrs){
				var $element = angular.element(element);
				var $stickyHeader = angular.element($element[0].querySelector('.' + attrs.stickyClass));

				function whenScrolling(){
					var elementTop = $element[0].getBoundingClientRect().top;
					var addSticky = elementTop <= 0 ? true : false;
					var isSticky = scope.isSticky;//$stickyHeader.hasClass('is-fixed');
					var pushHeight = $stickyHeader[0].scrollHeight;

					if(addSticky && !isSticky){
						isSticky = true;
						//$stickyHeader.addClass('is-fixed');
					}

					if (!addSticky){
						isSticky = false;
						//$stickyHeader.removeClass('is-fixed');
					}

					return isSticky;
				}

				angular.element($window).bind('scroll', function() {
					scope.isSticky = whenScrolling();
					scope.$apply();
				});
			}		
		}
	};