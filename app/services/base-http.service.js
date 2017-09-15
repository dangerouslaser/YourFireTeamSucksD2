angular.module('fireTeam.common')
		.factory('BaseHttpService', baseHttpService);

	baseHttpService.$inject = ['$http'];

	function baseHttpService($http) {
		return {
			get: get,
			post: post
		};

		function get(path, model) {
			var config = {};

			if (model) {
				config.params = model;
			}

			return $http.get(path, config)
				.then(function(response) {
					return response.data;
				})
				.catch(function(response) {
					return response.data;
				});
		}

		function post(path, model) {
			var config = {};

			if (model) {
				config.params = model;
			}
			return $http.post(path, config)
				.then(function(response) {
					return response.data;
				})
				.catch(function(response) {
					return response.data;
				});
		}
	};