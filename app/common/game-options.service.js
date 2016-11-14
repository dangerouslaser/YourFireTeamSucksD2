angular.module('fireTeam.common')
	.factory('GameOptionsService', ['BaseHttpService', function (baseHttpService) {
    'use strict';

    return {
        getActivityData: baseHttpService.get.bind(this, '../api/getActivityData')
    };
}]);