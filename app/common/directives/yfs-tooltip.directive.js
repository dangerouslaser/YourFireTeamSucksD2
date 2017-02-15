angular
	.module('fireTeam.common')
	.directive('yfsTooltip', yfsTooltip);

	yfsTooltip.$inject = ['$window'];

	function yfsTooltip($window) {
		return {
			restrict: 'A',
			scope: {
			},
			replace: false,
			link: function(scope, element, attrs){

				//currently not in use, although there are references
				return;

				var $element = angular.element(element);	
				var $toolTipElement = angular.element($('body').find('#tooltip'));
				var appendClasses = attrs.appendClasses;
				var displayText = attrs.displayText;
				var xOffset = 100;
				var yOffset = 100;

				$element.on('mouseover', function(e){
					yOffset = $element.prop('offsetTop');

					var xPos = e.clientX - xOffset;
					var yPos = yOffset;

					$toolTipElement.css('left', xPos);
					$toolTipElement.css('top', yPos);

					$toolTipElement.addClass(appendClasses);
					$toolTipElement.html(displayText).show();
				});

				$element.on('mouseout', function(e){
					$toolTipElement.css('left', 0);
					$toolTipElement.css('top', 0);

					$toolTipElement.removeClass(appendClasses);
					$toolTipElement.html('').hide();
				});

				$element.on('mousemove', function(e){
					yOffset = $element.prop('offsetTop');


					var xPos = e.clientX - xOffset;
					var yPos = yOffset;

					$toolTipElement.css('left', xPos);
					$toolTipElement.css('top', yPos);
				});
			}		
		}
	};