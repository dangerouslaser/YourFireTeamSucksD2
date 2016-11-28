angular
	.module('fireTeam.common')
	.directive('toggleSection', toggleSection);

	toggleSection.$inject = [];

	function toggleSection() {
		return {
			restrict: 'E',
			scope: {
				isOpen: '=',
				sectionTitle: '@'

			},
			transclude: true,
			replace: true,
			template: '<div class="section" ng-class="{\'closed\': !isOpen}">' +
							'<div class="toggle-button-container" ng-click="isOpen = !isOpen">' +
								'<button class="is-open" ng-hide="isOpen">+</button>' + 
								'<button class="is-close" ng-show="isOpen">-</button>' + 
								'<span class="section-title" ng-hide="isOpen">{{sectionTitle}}</span>' + 
					  		'</div>' + 
					  		'<div ng-transclude="" ng-show="isOpen"></div>' + 
				  		'</div>',
			link: function(scope, element, attrs){

			}		
		}
	};