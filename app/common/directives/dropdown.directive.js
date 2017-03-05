angular
	.module('fireTeam.common')
	.directive('dropDownDirective', dropDownDirective)
	.controller('dropDownDirectiveCtrl', dropDownDirectiveCtrl);

	dropDownDirective.$inject = ['$timeout','$parse'];

	function dropDownDirective($timeout,$parse) {
		return {
			restrict: 'E',
			scope: {
				inputModel: '=',
				tabIndex: '@',
				onClick: '&',
				defaultValue: '=',
				selectedItem: '='
			},
			controller:dropDownDirectiveCtrl,
			replace: true,
			template: '<div class="dropdown-container" tabIndex="{{tabIndex}}" ng-click="toggleDropDown()">' +
							'<div class="selected-option" >{{selectedItem}}</div>' +
							'<div class="dropdown-select" ng-show="showDropDown">' +
								'<ul class="select-category" ng-repeat="(key, val) in inputModel track by $index">' +
									'<li class="category">' +
										'<span>{{key.toUpperCase()}}:</span>'  +
									'<li>' +
									'<li class="option" ng-repeat="option in inputModel[key] track by $index" ng-click="select(option)">{{option.displayName}}</li>' +
								'</ul>' +
							'</div>' +
							'<div class="dropdown-button">+</div>' +
						'</div>',
			link: function(scope, element, attrs){
				scope.clickFn = $parse(attrs.onClick)(scope.$parent);
				scope.showDropDown = false;
				$element = angular.element(element);

				scope.$watch('showDropDown', function(newVal){
					if(newVal){
						$timeout(function() {
							$element.focus();
						}, 0);	
					}
				})

				$element.on('blur', function(e){
					scope.showDropDown = false;
					scope.$apply();
				});

				$element.on('keydown', function(e){
					if(e.keyCode === 13 || e.keyCode === 27 || e.keyCode === 9){
		        		this.blur();
			        };
				});

				scope.select = function(item){
					$element.blur();
					scope.selectItem(item);
				};
			}		
		}
	};

	dropDownDirectiveCtrl.inject = ['$scope'];

	function dropDownDirectiveCtrl($scope){
		$scope.selectItem = selectItem;
		$scope.toggleDropDown = toggleDropDown;
		$scope.selectedObject = $scope.defaultValue;
		$scope.selectedItem = $scope.selectedObject.displayName;

		function toggleDropDown(){
			$scope.showDropDown = !$scope.showDropDown;
		}

		function selectItem(item){
			$scope.selectedObject = item;
			$scope.selectedItem = item.value;
			if($scope.clickFn){
				$scope.clickFn(item);
			}
		}
	}