angular
	.module('fireTeam.common')
	.controller('numberPickerCtrl',numberPickerCtrl)
	.directive('numberPicker', numberPicker);

	numberPicker.$inject = ['$timeout', '$parse'];

	function numberPicker($timeout, $parse) {
		return {
			restrict: 'E',
			scope: {
				valuesArray: '=',
				inputModel:'=',
				valueKey: '@',
				onChange: '&'
			},
			replace: true,
			controller:numberPickerCtrl,
			template: '<div class="number-picker-container">' +
						'<div class="control-container">' +
							'<input class="number-picker-input" ng-keydown type="text" placeholder="0" ng-model="displayValue" />' +
							'<div class="up-down-buttons">' + 
								'<span class="plus" ng-click="changeValue(true)">+</span>' +
					  			'<span class="minus" ng-click="changeValue(false)">-</span>' + 
				  			'</div>' +
				  		'</div>' + 
			  			'<span class="error-message" ng-if="isErrorMessage">{{errorMessage}}</span>' +
					  '</div>',
			link: function(scope, element, attrs){
				scope.displayValue = scope.inputModel[scope.valueKey];
				scope.changeFn = $parse(attrs.onChange)(scope.$parent);
				scope.max =	Math.max.apply(Math, scope.valuesArray); 
				scope.min = Math.min.apply(Math, scope.valuesArray);
				scope.isErrorMessage = false;
				scope.errorMessage = 'Please enter a valid number between ' + scope.min + ' and ' + scope.max;

				var inputElement = element.find('input');
				element = angular.element(element);


				element.on('click', function(e){
					if(isValid(inputElement[0].value)){
						element.removeClass('is-error');
						scope.isErrorMessage = false;
					}
				});

				element.on('keypress', function(e){
					var regex = new RegExp(/^[0-9-]+$/);
			        var key = String.fromCharCode(!e.charCode ? e.which : e.charCode);

			        if (!regex.test(key)) {
			           e.preventDefault();
			        }
				});

				element.on('keyup', function (e) {
					
					element.removeClass('is-error');
					scope.isErrorMessage = false;
					scope.$apply();

					if(!isValid(inputElement[0].value)){
						element.addClass('is-error');
						scope.isErrorMessage = true;
						scope.$apply();
						e.preventDefault();
					};

					angular.element(element[0].getElementsByClassName('is-selected')).removeClass('is-selected');

					if(e.keyCode === 40){
						angular.element(element[0].getElementsByClassName('minus')).addClass('is-selected');
						scope.changeValue(false);
					}
					if(e.keyCode === 38){
						scope.changeValue(true);
						angular.element(element[0].getElementsByClassName('plus')).addClass('is-selected');
					}
					e.preventDefault();
				});

				inputElement.on('blur', function (e) {
					angular.element(element[0].getElementsByClassName('is-selected')).removeClass('is-selected');
				});

				inputElement.on('focus', function (e) {
					this.setSelectionRange(0, this.value.length);
				});

				function isValid(val){
					return val <= scope.max && val >= scope.min
				}
			}	
		}
	};

	numberPickerCtrl.inject = ['$scope'];

	function numberPickerCtrl($scope){
		$scope.changeValue = changeValue;

		function changeValue(isIncrease){

			var newVal = parseInt($scope.displayValue);

			if(isIncrease){
				newVal = newVal+=1;
			}else {
				newVal = newVal-=1;
			}

			if($scope.isErrorMessage){
				newVal = 0;
				$scope.isErrorMessage = false;
			}

			$scope.inputModel[$scope.valueKey] = $scope.displayValue = (newVal >= $scope.min) && (newVal <= $scope.max) ? newVal : $scope.displayValue;
			
			if($scope.changeFn){
				$scope.changeFn($scope.inputModel);
			}
		}
	};