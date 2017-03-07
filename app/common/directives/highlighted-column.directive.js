angular
	.module('fireTeam.common')
	.directive('highlightedColumn', highlightedColumn);

	function highlightedColumn() {
		return {
			restrict: 'E',
			scope: {
				selectorId: '@',
				onClick: '&'
			},
			replace: true,
			template:'<div class="selected-column-highlight"' +
						 'ng-click="onClick()">' +
					   '</div>',
			link: function(scope, element, attrs){
				var $element = angular.element(element);
				var id = '#' + scope.selectorId;
				var $containerElement = angular.element(document.querySelector(id));
				var height = $containerElement[0].offsetHeight - 7;

				$element.css('height', height + 'px');
			}		
		}
	};