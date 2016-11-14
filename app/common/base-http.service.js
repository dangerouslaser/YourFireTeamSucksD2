angular.module('fireTeam.common')
		.factory('BaseHttpService', baseHttpService);

	baseHttpService.$inject = ['$http'];

	function baseHttpService($http) {
		return {
			get: get,
		};

		function get(path, model) {
			var config = {};

			if (model) {
				config.params = model;
			}

			return $http.get(path, config)
				.success(function(data, status, headers) {
					
				})
				.error(function(data, status, headers) {
					
				});
		}
	};