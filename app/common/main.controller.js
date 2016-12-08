angular.module('fireTeam.common')
	.controller('mainCtrl', MainCtrl);

	MainCtrl.$inject = ['$scope','PlayerBaseModelFactory', 'GameActivityModelFactory', 'FireTeamModelFactory', 'PlayerOptionsService', 'ActivityModelFactory', '$timeout', '$cookies'];

	function MainCtrl($scope, playerBaseModelFactory, gameActivityModelFactory, fireTeamModelFactory, playerOptionsService, activityModelFactory, $timeout, $cookies) {

		var m = $scope.m = {
			fireTeamActivityResults: [],
			playersArrays: [{
				displayName: '',
				isPlaceHolder: true
			}],
			fireTeamMembers: {},
			maxMembers: 6,
			gameModeArray:['None'],
			gameMode: 'None',
			platformTypes: {
				xbox: {
					id: 1,
					displayValue: 'xbox'
				},
				ps4: {
					id: 2,
					displayValue: 'ps4'
				}
			},
			selectedPlatform: null,
			errorMessage: null,
			initialSearchRun: false
		}
		m.pollingTimeout;
		m.activityLookupPerSearch = 10;
		m.hidePlaceHolder = false;
		m.isShowActivityList = true;
		m.showProgressMessage = false;
		m.showRecentSearches = false;
		m.activityListProgress = {};
		m.recentSearches = [];
		m.isNewSearch = false;

		m.testCaseSectionClosed = false;

		m.testObject = {};
		m.testObject.playerPostGameCarnageReport = {"dangerouslaser":{"playerInfo":{"membershipId":"4611686018428645058"},"characterInfo":{"characterId":"2305843009217549797","displayName":"dangerouslaser","characterClass":"Hunter","characterLevel":40,"lightLevel":394,"iconPath":"/common/destiny_content/icons/d326439b35da6a1b5de8f147a159b4cc.jpg"},"trueStats":{"assists":{"displayValue":"271","value":271},"completed":{"displayValue":"No","value":0},"deaths":{"displayValue":"19","value":19},"kills":{"displayValue":"352","value":352},"killsDeathsRatio":{"displayValue":"18.53","value":18.526315789473685},"killsDeathsAssists":{"displayValue":"25.66","value":25.657894736842106},"activityDurationSeconds":{"displayValue":"2h 14m","value":8040},"completionReason":{"displayValue":"255","value":255},"fireTeamId":{"displayValue":"-2147483648","value":552380975181287360},"playerCount":{"displayValue":"9","value":9},"leaveRemainingSeconds":{"displayValue":"0m 0s","value":0},"assistsAgainstR1S5RaidPromiseWelderUltraCaptain":{"displayValue":"1","value":1},"assistsAgainstSivaCaptain":{"displayValue":"8","value":8},"assistsAgainstSivaVandal":{"displayValue":"45","value":45},"assistsAgainstSivaDreg":{"displayValue":"87","value":87},"assistsAgainstSivaShank":{"displayValue":"129","value":129},"totalKillDistance":{"displayValue":"8259.0","value":8259},"averageKillDistance":{"displayValue":"23.5","value":23.463068181818183},"secondsPlayed":{"displayValue":"2h 13m","value":8024},"averageLifespan":{"displayValue":"6m 41s","value":401.2},"assistsAgainstFallenReaver":{"displayValue":"1","value":1},"precisionKillOfSivaVandal":{"displayValue":"9","value":9},"precisionKillOfSivaDreg":{"displayValue":"37","value":37},"deathsFromAiShankExploder":{"displayValue":"1","value":1},"deathsFromSivaVandal":{"displayValue":"1","value":1},"deathsFromSivaDreg":{"displayValue":"1","value":1},"deathsFromSivaShank":{"displayValue":"1","value":1},"killsOfSivaCaptain":{"displayValue":"26","value":26},"killsOfSivaVandal":{"displayValue":"71","value":71},"killsOfSivaDreg":{"displayValue":"116","value":116},"killsOfSivaShank":{"displayValue":"116","value":116},"killsOfSivaServitor":{"displayValue":"22","value":22},"killsOfSiva":{"displayValue":"351","value":351},"deathsFromSiva":{"displayValue":"3","value":3},"precisionKills":{"displayValue":"46","value":46},"resurrectionsPerformed":{"displayValue":"1","value":1},"suicides":{"displayValue":"9","value":9},"weaponPrecisionKillsAutoRifle":{"displayValue":"45","value":45},"weaponPrecisionKillsSniper":{"displayValue":"1","value":1},"weaponKillsAutoRifle":{"displayValue":"147","value":147},"weaponKillsGrenade":{"displayValue":"3","value":3},"weaponKillsMelee":{"displayValue":"2","value":2},"weaponKillsSniper":{"displayValue":"1","value":1},"weaponKillsSuper":{"displayValue":"1","value":1},"weaponKillsRelic":{"displayValue":"110","value":110},"weaponKillsSword":{"displayValue":"70","value":70},"weaponBestType":{"displayValue":"Auto Rifle","value":1},"weaponKillsPrecisionKillsAutoRifle":{"displayValue":"31%","value":0.30612244897959184},"weaponKillsPrecisionKillsSniper":{"displayValue":"100%","value":1},"allParticipantsCount":{"displayValue":"9","value":9},"allParticipantsTimePlayed":{"displayValue":"12h 3m","value":43432},"deathsFromUnknown":{"displayValue":"4","value":4},"killsOfUnknown":{"displayValue":"1","value":1},"longestKillSpree":{"displayValue":"51","value":51},"longestSingleLife":{"displayValue":"9m 59s","value":599},"orbsDropped":{"displayValue":"175","value":175},"orbsGathered":{"displayValue":"120","value":120},"remainingTimeAfterQuitSeconds":{"displayValue":"0m 15s","value":15},"totalActivityDurationSeconds":{"displayValue":"2h 14m","value":8040},"totalStats":{"displayValue":59,"value":59}},"extendedWeaponsStats":{"uniqueWeaponKills":{"displayValue":"1","value":1},"uniqueWeaponPrecisionKills":{"displayValue":"1","value":1},"uniqueWeaponKillsPrecisionKills":{"displayValue":"100%","value":1},"totalStats":{"displayValue":9,"value":9}}},"Zincbeatr":{"playerInfo":{"membershipId":"4611686018432896810"},"characterInfo":{"characterId":"2305843009219368949","displayName":"Zincbeatr","characterClass":"Warlock","characterLevel":40,"lightLevel":390,"iconPath":"/common/destiny_content/icons/b49e3befe53752f49881887bfbfda2ca.jpg"},"trueStats":{"assists":{"displayValue":"160","value":160},"completed":{"displayValue":"No","value":0},"deaths":{"displayValue":"28","value":28},"kills":{"displayValue":"303","value":303},"killsDeathsRatio":{"displayValue":"10.82","value":10.821428571428571},"killsDeathsAssists":{"displayValue":"13.68","value":13.678571428571429},"activityDurationSeconds":{"displayValue":"2h 14m","value":8040},"completionReason":{"displayValue":"255","value":255},"fireTeamId":{"displayValue":"-2147483648","value":552380975181287360},"playerCount":{"displayValue":"9","value":9},"leaveRemainingSeconds":{"displayValue":"0m 0s","value":0},"assistsAgainstSivaCaptain":{"displayValue":"10","value":10},"assistsAgainstSivaVandal":{"displayValue":"44","value":44},"assistsAgainstSivaDreg":{"displayValue":"57","value":57},"assistsAgainstSivaShank":{"displayValue":"48","value":48},"totalKillDistance":{"displayValue":"9142.0","value":9142},"averageKillDistance":{"displayValue":"30.2","value":30.17161716171617},"secondsPlayed":{"displayValue":"2h 4m","value":7461},"averageLifespan":{"displayValue":"4m 17s","value":257.2758620689655},"assistsAgainstFallenReaver":{"displayValue":"1","value":1},"precisionKillOfSivaCaptain":{"displayValue":"1","value":1},"precisionKillOfSivaVandal":{"displayValue":"6","value":6},"precisionKillOfSivaDreg":{"displayValue":"38","value":38},"deathsFromFallenReaver":{"displayValue":"2","value":2},"deathsFromFallenSkiff":{"displayValue":"1","value":1},"deathsFromR1S5RaidPromiseWelderUltraCaptain":{"displayValue":"2","value":2},"deathsFromSivaVandal":{"displayValue":"2","value":2},"deathsFromSivaDreg":{"displayValue":"3","value":3},"deathsFromSivaShank":{"displayValue":"1","value":1},"deathsFromFallen":{"displayValue":"3","value":3},"killsOfR1S5RaidPromiseWelderUltraCaptain":{"displayValue":"1","value":1},"killsOfSivaCaptain":{"displayValue":"17","value":17},"killsOfSivaVandal":{"displayValue":"55","value":55},"killsOfSivaDreg":{"displayValue":"139","value":139},"killsOfSivaShank":{"displayValue":"90","value":90},"killsOfSivaServitor":{"displayValue":"1","value":1},"killsOfSiva":{"displayValue":"302","value":302},"deathsFromSiva":{"displayValue":"6","value":6},"precisionKills":{"displayValue":"45","value":45},"suicides":{"displayValue":"7","value":7},"weaponPrecisionKillsAutoRifle":{"displayValue":"44","value":44},"weaponPrecisionKillsSniper":{"displayValue":"1","value":1},"weaponKillsAutoRifle":{"displayValue":"171","value":171},"weaponKillsGrenade":{"displayValue":"65","value":65},"weaponKillsMelee":{"displayValue":"11","value":11},"weaponKillsRocketLauncher":{"displayValue":"20","value":20},"weaponKillsScoutRifle":{"displayValue":"1","value":1},"weaponKillsSniper":{"displayValue":"3","value":3},"weaponKillsRelic":{"displayValue":"7","value":7},"weaponKillsSword":{"displayValue":"20","value":20},"weaponBestType":{"displayValue":"Auto Rifle","value":1},"weaponKillsPrecisionKillsAutoRifle":{"displayValue":"26%","value":0.2573099415204678},"weaponKillsPrecisionKillsSniper":{"displayValue":"33%","value":0.3333333333333333},"allParticipantsCount":{"displayValue":"9","value":9},"allParticipantsTimePlayed":{"displayValue":"12h 3m","value":43432},"deathsFromUnknown":{"displayValue":"3","value":3},"longestKillSpree":{"displayValue":"40","value":40},"longestSingleLife":{"displayValue":"26m 36s","value":1596},"orbsDropped":{"displayValue":"14","value":14},"orbsGathered":{"displayValue":"73","value":73},"remainingTimeAfterQuitSeconds":{"displayValue":"9m 36s","value":576},"totalActivityDurationSeconds":{"displayValue":"2h 14m","value":8040},"totalStats":{"displayValue":62,"value":62}},"extendedWeaponsStats":{"uniqueWeaponKills":{"displayValue":"1","value":1},"uniqueWeaponPrecisionKills":{"displayValue":"0","value":0},"uniqueWeaponKillsPrecisionKills":{"displayValue":"0%","value":0},"totalStats":{"displayValue":18,"value":18}}},"reacherboy19":{"playerInfo":{"membershipId":"4611686018428432859"},"characterInfo":{"characterId":"2305843009238378801","displayName":"reacherboy19","characterClass":"Warlock","characterLevel":40,"lightLevel":398,"iconPath":"/common/destiny_content/icons/a2613c4098ca622e1533c686e114488f.jpg"},"trueStats":{"assists":{"displayValue":"49","value":49},"completed":{"displayValue":"No","value":0},"deaths":{"displayValue":"11","value":11},"kills":{"displayValue":"159","value":159},"killsDeathsRatio":{"displayValue":"14.45","value":14.454545454545455},"killsDeathsAssists":{"displayValue":"16.68","value":16.681818181818183},"activityDurationSeconds":{"displayValue":"2h 14m","value":8040},"completionReason":{"displayValue":"255","value":255},"fireTeamId":{"displayValue":"-2147483648","value":552380975181287360},"playerCount":{"displayValue":"9","value":9},"leaveRemainingSeconds":{"displayValue":"0m 0s","value":0},"assistsAgainstR1S5RaidPromiseWelderUltraCaptain":{"displayValue":"1","value":1},"assistsAgainstSivaCaptain":{"displayValue":"7","value":7},"assistsAgainstSivaVandal":{"displayValue":"10","value":10},"assistsAgainstSivaDreg":{"displayValue":"29","value":29},"assistsAgainstSivaShank":{"displayValue":"1","value":1},"totalKillDistance":{"displayValue":"6106.0","value":6106},"averageKillDistance":{"displayValue":"38.4","value":38.40251572327044},"secondsPlayed":{"displayValue":"55m 28s","value":3328},"averageLifespan":{"displayValue":"4m 37s","value":277.3333333333333},"assistsAgainstFallenReaver":{"displayValue":"1","value":1},"precisionKillOfSivaVandal":{"displayValue":"7","value":7},"precisionKillOfSivaDreg":{"displayValue":"33","value":33},"deathsFromFallenReaver":{"displayValue":"1","value":1},"deathsFromAiShankExploder":{"displayValue":"1","value":1},"deathsFromSivaCaptain":{"displayValue":"1","value":1},"deathsFromFallen":{"displayValue":"1","value":1},"killsOfSivaCaptain":{"displayValue":"5","value":5},"killsOfSivaVandal":{"displayValue":"33","value":33},"killsOfSivaDreg":{"displayValue":"97","value":97},"killsOfSivaShank":{"displayValue":"24","value":24},"killsOfSiva":{"displayValue":"159","value":159},"deathsFromSiva":{"displayValue":"1","value":1},"precisionKills":{"displayValue":"40","value":40},"suicides":{"displayValue":"5","value":5},"weaponPrecisionKillsPulseRifle":{"displayValue":"40","value":40},"weaponKillsGrenade":{"displayValue":"30","value":30},"weaponKillsMelee":{"displayValue":"12","value":12},"weaponKillsPulseRifle":{"displayValue":"100","value":100},"weaponKillsRocketLauncher":{"displayValue":"10","value":10},"weaponKillsScoutRifle":{"displayValue":"1","value":1},"weaponKillsSniper":{"displayValue":"1","value":1},"weaponBestType":{"displayValue":"Pulse Rifle","value":2},"weaponKillsPrecisionKillsPulseRifle":{"displayValue":"40%","value":0.4},"allParticipantsCount":{"displayValue":"9","value":9},"allParticipantsTimePlayed":{"displayValue":"12h 3m","value":43432},"deathsFromUnknown":{"displayValue":"1","value":1},"longestKillSpree":{"displayValue":"49","value":49},"longestSingleLife":{"displayValue":"8m 37s","value":517},"orbsDropped":{"displayValue":"7","value":7},"orbsGathered":{"displayValue":"37","value":37},"remainingTimeAfterQuitSeconds":{"displayValue":"1h 18m","value":4709},"totalActivityDurationSeconds":{"displayValue":"2h 14m","value":8040},"totalStats":{"displayValue":53,"value":53}},"extendedWeaponsStats":{"uniqueWeaponKills":{"displayValue":"1","value":1},"uniqueWeaponPrecisionKills":{"displayValue":"0","value":0},"uniqueWeaponKillsPrecisionKills":{"displayValue":"0%","value":0},"totalStats":{"displayValue":12,"value":12}}},"Omittes":{"playerInfo":{"membershipId":"4611686018442925263"},"characterInfo":{"characterId":"2305843009263445215","displayName":"Omittes","characterClass":"Warlock","characterLevel":40,"lightLevel":398,"iconPath":"/common/destiny_content/icons/0043ad861d320f6787585249b26086be.jpg"},"trueStats":{"assists":{"displayValue":"123","value":123},"completed":{"displayValue":"No","value":0},"deaths":{"displayValue":"31","value":31},"kills":{"displayValue":"487","value":487},"killsDeathsRatio":{"displayValue":"15.71","value":15.709677419354838},"killsDeathsAssists":{"displayValue":"17.69","value":17.693548387096776},"activityDurationSeconds":{"displayValue":"2h 14m","value":8040},"completionReason":{"displayValue":"255","value":255},"fireTeamId":{"displayValue":"-2147483648","value":552380975181287360},"playerCount":{"displayValue":"9","value":9},"leaveRemainingSeconds":{"displayValue":"0m 0s","value":0},"assistsAgainstR1S5RaidPromiseWelderUltraCaptain":{"displayValue":"1","value":1},"assistsAgainstSivaCaptain":{"displayValue":"19","value":19},"assistsAgainstSivaVandal":{"displayValue":"33","value":33},"assistsAgainstSivaDreg":{"displayValue":"44","value":44},"assistsAgainstSivaShank":{"displayValue":"24","value":24},"assistsAgainstSivaServitor":{"displayValue":"2","value":2},"totalKillDistance":{"displayValue":"10326.0","value":10326},"averageKillDistance":{"displayValue":"21.2","value":21.20328542094456},"secondsPlayed":{"displayValue":"2h 4m","value":7457},"averageLifespan":{"displayValue":"3m 53s","value":233.03125},"precisionKillOfSivaVandal":{"displayValue":"3","value":3},"precisionKillOfSivaDreg":{"displayValue":"12","value":12},"deathsFromAiShankExploder":{"displayValue":"3","value":3},"deathsFromR1S5RaidPromiseWelderUltraCaptain":{"displayValue":"1","value":1},"deathsFromSivaCaptain":{"displayValue":"1","value":1},"deathsFromSivaVandal":{"displayValue":"3","value":3},"deathsFromSivaDreg":{"displayValue":"3","value":3},"killsOfFallenReaver":{"displayValue":"1","value":1},"killsOfFallen":{"displayValue":"1","value":1},"killsOfSivaCaptain":{"displayValue":"13","value":13},"killsOfSivaVandal":{"displayValue":"101","value":101},"killsOfSivaDreg":{"displayValue":"226","value":226},"killsOfSivaShank":{"displayValue":"126","value":126},"killsOfSivaServitor":{"displayValue":"20","value":20},"killsOfSiva":{"displayValue":"486","value":486},"deathsFromSiva":{"displayValue":"7","value":7},"precisionKills":{"displayValue":"15","value":15},"resurrectionsPerformed":{"displayValue":"1","value":1},"suicides":{"displayValue":"10","value":10},"weaponPrecisionKillsScoutRifle":{"displayValue":"14","value":14},"weaponPrecisionKillsSniper":{"displayValue":"1","value":1},"weaponKillsGrenade":{"displayValue":"47","value":47},"weaponKillsMelee":{"displayValue":"27","value":27},"weaponKillsRocketLauncher":{"displayValue":"128","value":128},"weaponKillsScoutRifle":{"displayValue":"124","value":124},"weaponKillsSniper":{"displayValue":"3","value":3},"weaponKillsSuper":{"displayValue":"60","value":60},"weaponKillsRelic":{"displayValue":"71","value":71},"weaponKillsSword":{"displayValue":"9","value":9},"weaponBestType":{"displayValue":"Rocket Launcher","value":9},"weaponKillsPrecisionKillsScoutRifle":{"displayValue":"11%","value":0.11290322580645161},"weaponKillsPrecisionKillsSniper":{"displayValue":"33%","value":0.3333333333333333},"allParticipantsCount":{"displayValue":"9","value":9},"allParticipantsTimePlayed":{"displayValue":"12h 3m","value":43432},"deathsFromUnknown":{"displayValue":"3","value":3},"longestKillSpree":{"displayValue":"47","value":47},"longestSingleLife":{"displayValue":"24m 50s","value":1490},"orbsDropped":{"displayValue":"40","value":40},"orbsGathered":{"displayValue":"76","value":76},"remainingTimeAfterQuitSeconds":{"displayValue":"9m 40s","value":580},"totalActivityDurationSeconds":{"displayValue":"2h 14m","value":8040},"totalStats":{"displayValue":62,"value":62}},"extendedWeaponsStats":{"uniqueWeaponKills":{"displayValue":"9","value":9},"uniqueWeaponPrecisionKills":{"displayValue":"0","value":0},"uniqueWeaponKillsPrecisionKills":{"displayValue":"0%","value":0},"totalStats":{"displayValue":12,"value":12}}},"JisforDinosaur":{"playerInfo":{"membershipId":"4611686018446331620"},"characterInfo":{"characterId":"2305843009273807564","displayName":"JisforDinosaur","characterClass":"Titan","characterLevel":40,"lightLevel":390,"iconPath":"/common/destiny_content/icons/fb6b9de16fac065c07507569646c5986.jpg"},"trueStats":{"assists":{"displayValue":"86","value":86},"completed":{"displayValue":"No","value":0},"deaths":{"displayValue":"21","value":21},"kills":{"displayValue":"342","value":342},"killsDeathsRatio":{"displayValue":"16.29","value":16.285714285714285},"killsDeathsAssists":{"displayValue":"18.33","value":18.333333333333332},"activityDurationSeconds":{"displayValue":"2h 14m","value":8040},"completionReason":{"displayValue":"255","value":255},"fireTeamId":{"displayValue":"-2147483648","value":552380975181287360},"playerCount":{"displayValue":"9","value":9},"leaveRemainingSeconds":{"displayValue":"0m 0s","value":0},"assistsAgainstR1S5RaidPromiseWelderUltraCaptain":{"displayValue":"1","value":1},"assistsAgainstSivaCaptain":{"displayValue":"8","value":8},"assistsAgainstSivaVandal":{"displayValue":"28","value":28},"assistsAgainstSivaDreg":{"displayValue":"36","value":36},"assistsAgainstSivaShank":{"displayValue":"12","value":12},"totalKillDistance":{"displayValue":"8225.0","value":8225},"averageKillDistance":{"displayValue":"24.0","value":24.049707602339183},"secondsPlayed":{"displayValue":"2h 10m","value":7843},"averageLifespan":{"displayValue":"5m 56s","value":356.5},"assistsAgainstFallenReaver":{"displayValue":"1","value":1},"precisionKillOfSivaCaptain":{"displayValue":"1","value":1},"precisionKillOfSivaVandal":{"displayValue":"2","value":2},"precisionKillOfSivaDreg":{"displayValue":"26","value":26},"deathsFromFallenReaver":{"displayValue":"1","value":1},"deathsFromSivaCaptain":{"displayValue":"3","value":3},"deathsFromSivaVandal":{"displayValue":"3","value":3},"deathsFromSivaDreg":{"displayValue":"2","value":2},"deathsFromFallen":{"displayValue":"1","value":1},"killsOfSivaCaptain":{"displayValue":"19","value":19},"killsOfSivaVandal":{"displayValue":"76","value":76},"killsOfSivaDreg":{"displayValue":"99","value":99},"killsOfSivaShank":{"displayValue":"127","value":127},"killsOfSivaServitor":{"displayValue":"21","value":21},"killsOfSiva":{"displayValue":"342","value":342},"deathsFromSiva":{"displayValue":"8","value":8},"precisionKills":{"displayValue":"29","value":29},"resurrectionsReceived":{"displayValue":"1","value":1},"suicides":{"displayValue":"9","value":9},"weaponPrecisionKillsPulseRifle":{"displayValue":"4","value":4},"weaponPrecisionKillsScoutRifle":{"displayValue":"23","value":23},"weaponPrecisionKillsShotgun":{"displayValue":"1","value":1},"weaponPrecisionKillsSniper":{"displayValue":"1","value":1},"weaponKillsAutoRifle":{"displayValue":"1","value":1},"weaponKillsGrenade":{"displayValue":"4","value":4},"weaponKillsMelee":{"displayValue":"5","value":5},"weaponKillsPulseRifle":{"displayValue":"12","value":12},"weaponKillsScoutRifle":{"displayValue":"112","value":112},"weaponKillsShotgun":{"displayValue":"5","value":5},"weaponKillsSniper":{"displayValue":"1","value":1},"weaponKillsRelic":{"displayValue":"136","value":136},"weaponKillsSword":{"displayValue":"62","value":62},"weaponBestType":{"displayValue":"Relic","value":12},"weaponKillsPrecisionKillsPulseRifle":{"displayValue":"33%","value":0.3333333333333333},"weaponKillsPrecisionKillsScoutRifle":{"displayValue":"21%","value":0.20535714285714285},"weaponKillsPrecisionKillsShotgun":{"displayValue":"20%","value":0.2},"weaponKillsPrecisionKillsSniper":{"displayValue":"100%","value":1},"allParticipantsCount":{"displayValue":"9","value":9},"allParticipantsTimePlayed":{"displayValue":"12h 3m","value":43432},"deathsFromUnknown":{"displayValue":"2","value":2},"longestKillSpree":{"displayValue":"49","value":49},"longestSingleLife":{"displayValue":"19m 15s","value":1155},"orbsDropped":{"displayValue":"47","value":47},"orbsGathered":{"displayValue":"124","value":124},"remainingTimeAfterQuitSeconds":{"displayValue":"3m 14s","value":194},"totalActivityDurationSeconds":{"displayValue":"2h 14m","value":8040},"totalStats":{"displayValue":66,"value":66}},"extendedWeaponsStats":{"uniqueWeaponKills":{"displayValue":"1","value":1},"uniqueWeaponPrecisionKills":{"displayValue":"1","value":1},"uniqueWeaponKillsPrecisionKills":{"displayValue":"100%","value":1},"totalStats":{"displayValue":18,"value":18}}},"prince_odraude":{"playerInfo":{"membershipId":"4611686018438158229"},"characterInfo":{"characterId":"2305843009331935018","displayName":"prince_odraude","characterClass":"Hunter","characterLevel":40,"lightLevel":388,"iconPath":"/common/destiny_content/icons/eea50ce163a062f184d695255466a1e7.jpg"},"trueStats":{"assists":{"displayValue":"268","value":268},"completed":{"displayValue":"No","value":0},"deaths":{"displayValue":"8","value":8},"kills":{"displayValue":"151","value":151},"killsDeathsRatio":{"displayValue":"18.88","value":18.875},"killsDeathsAssists":{"displayValue":"35.63","value":35.625},"activityDurationSeconds":{"displayValue":"2h 14m","value":8040},"completionReason":{"displayValue":"255","value":255},"fireTeamId":{"displayValue":"-2147483648","value":552380975181287360},"playerCount":{"displayValue":"9","value":9},"leaveRemainingSeconds":{"displayValue":"0m 0s","value":0},"assistsAgainstSivaCaptain":{"displayValue":"5","value":5},"assistsAgainstSivaVandal":{"displayValue":"13","value":13},"assistsAgainstSivaDreg":{"displayValue":"14","value":14},"assistsAgainstSivaShank":{"displayValue":"233","value":233},"assistsAgainstSivaServitor":{"displayValue":"3","value":3},"totalKillDistance":{"displayValue":"5733.0","value":5733},"averageKillDistance":{"displayValue":"38.0","value":37.966887417218544},"secondsPlayed":{"displayValue":"43m 33s","value":2613},"averageLifespan":{"displayValue":"4m 50s","value":290.3333333333333},"precisionKillOfSivaVandal":{"displayValue":"8","value":8},"precisionKillOfSivaDreg":{"displayValue":"20","value":20},"deathsFromSivaVandal":{"displayValue":"2","value":2},"deathsFromSivaShank":{"displayValue":"1","value":1},"killsOfSivaCaptain":{"displayValue":"3","value":3},"killsOfSivaVandal":{"displayValue":"33","value":33},"killsOfSivaDreg":{"displayValue":"48","value":48},"killsOfSivaShank":{"displayValue":"65","value":65},"killsOfSivaServitor":{"displayValue":"2","value":2},"killsOfSiva":{"displayValue":"151","value":151},"deathsFromSiva":{"displayValue":"3","value":3},"precisionKills":{"displayValue":"28","value":28},"suicides":{"displayValue":"3","value":3},"weaponPrecisionKillsPulseRifle":{"displayValue":"28","value":28},"weaponKillsGrenade":{"displayValue":"8","value":8},"weaponKillsMelee":{"displayValue":"4","value":4},"weaponKillsPulseRifle":{"displayValue":"102","value":102},"weaponKillsSniper":{"displayValue":"1","value":1},"weaponKillsRelic":{"displayValue":"2","value":2},"weaponKillsSword":{"displayValue":"13","value":13},"weaponBestType":{"displayValue":"Pulse Rifle","value":2},"weaponKillsPrecisionKillsPulseRifle":{"displayValue":"27%","value":0.27450980392156865},"allParticipantsCount":{"displayValue":"9","value":9},"allParticipantsTimePlayed":{"displayValue":"12h 3m","value":43432},"deathsFromUnknown":{"displayValue":"1","value":1},"longestKillSpree":{"displayValue":"25","value":25},"longestSingleLife":{"displayValue":"7m 9s","value":429},"orbsDropped":{"displayValue":"110","value":110},"orbsGathered":{"displayValue":"61","value":61},"remainingTimeAfterQuitSeconds":{"displayValue":"9m 55s","value":595},"totalActivityDurationSeconds":{"displayValue":"2h 14m","value":8040},"totalStats":{"displayValue":51,"value":51}},"extendedWeaponsStats":{"uniqueWeaponKills":{"displayValue":"1","value":1},"uniqueWeaponPrecisionKills":{"displayValue":"0","value":0},"uniqueWeaponKillsPrecisionKills":{"displayValue":"0%","value":0},"totalStats":{"displayValue":9,"value":9}}},"kilroy4":{"playerInfo":{"membershipId":"4611686018438283981"},"characterInfo":{"characterId":"2305843009343706612","displayName":"kilroy4","characterClass":"Titan","characterLevel":40,"lightLevel":389,"iconPath":"/common/destiny_content/icons/2847680c4b152c9f088211f3b09047e6.jpg"},"trueStats":{"assists":{"displayValue":"49","value":49},"completed":{"displayValue":"No","value":0},"deaths":{"displayValue":"13","value":13},"kills":{"displayValue":"161","value":161},"killsDeathsRatio":{"displayValue":"12.38","value":12.384615384615385},"killsDeathsAssists":{"displayValue":"14.27","value":14.26923076923077},"activityDurationSeconds":{"displayValue":"2h 14m","value":8040},"completionReason":{"displayValue":"255","value":255},"fireTeamId":{"displayValue":"-2147483648","value":552380975181287360},"playerCount":{"displayValue":"9","value":9},"leaveRemainingSeconds":{"displayValue":"0m 0s","value":0},"assistsAgainstR1S5RaidPromiseWelderUltraCaptain":{"displayValue":"1","value":1},"assistsAgainstSivaCaptain":{"displayValue":"8","value":8},"assistsAgainstSivaVandal":{"displayValue":"20","value":20},"assistsAgainstSivaDreg":{"displayValue":"12","value":12},"assistsAgainstSivaShank":{"displayValue":"7","value":7},"totalKillDistance":{"displayValue":"2727.0","value":2727},"averageKillDistance":{"displayValue":"16.9","value":16.937888198757765},"secondsPlayed":{"displayValue":"1h 5m","value":3939},"averageLifespan":{"displayValue":"4m 41s","value":281.35714285714283},"assistsAgainstFallenReaver":{"displayValue":"1","value":1},"precisionKillOfSivaVandal":{"displayValue":"6","value":6},"precisionKillOfSivaDreg":{"displayValue":"13","value":13},"deathsFromFallenReaver":{"displayValue":"1","value":1},"deathsFromAiShankExploder":{"displayValue":"2","value":2},"deathsFromFallenSkiff":{"displayValue":"1","value":1},"deathsFromR1S5RaidPromiseWelderUltraCaptain":{"displayValue":"1","value":1},"deathsFromSivaDreg":{"displayValue":"2","value":2},"deathsFromSivaShank":{"displayValue":"1","value":1},"deathsFromFallen":{"displayValue":"2","value":2},"killsOfSivaCaptain":{"displayValue":"3","value":3},"killsOfSivaVandal":{"displayValue":"48","value":48},"killsOfSivaDreg":{"displayValue":"79","value":79},"killsOfSivaShank":{"displayValue":"31","value":31},"killsOfSiva":{"displayValue":"161","value":161},"deathsFromSiva":{"displayValue":"3","value":3},"precisionKills":{"displayValue":"19","value":19},"resurrectionsReceived":{"displayValue":"1","value":1},"suicides":{"displayValue":"2","value":2},"weaponPrecisionKillsPulseRifle":{"displayValue":"17","value":17},"weaponPrecisionKillsScoutRifle":{"displayValue":"2","value":2},"weaponKillsGrenade":{"displayValue":"22","value":22},"weaponKillsMelee":{"displayValue":"6","value":6},"weaponKillsPulseRifle":{"displayValue":"59","value":59},"weaponKillsRocketLauncher":{"displayValue":"24","value":24},"weaponKillsScoutRifle":{"displayValue":"10","value":10},"weaponKillsShotgun":{"displayValue":"4","value":4},"weaponKillsSniper":{"displayValue":"3","value":3},"weaponKillsSword":{"displayValue":"4","value":4},"weaponBestType":{"displayValue":"Pulse Rifle","value":2},"weaponKillsPrecisionKillsPulseRifle":{"displayValue":"29%","value":0.288135593220339},"weaponKillsPrecisionKillsScoutRifle":{"displayValue":"20%","value":0.2},"allParticipantsCount":{"displayValue":"9","value":9},"allParticipantsTimePlayed":{"displayValue":"12h 3m","value":43432},"deathsFromUnknown":{"displayValue":"2","value":2},"longestKillSpree":{"displayValue":"87","value":87},"longestSingleLife":{"displayValue":"9m 35s","value":575},"orbsDropped":{"displayValue":"26","value":26},"orbsGathered":{"displayValue":"61","value":61},"remainingTimeAfterQuitSeconds":{"displayValue":"1h 8m","value":4098},"totalActivityDurationSeconds":{"displayValue":"2h 14m","value":8040},"totalStats":{"displayValue":61,"value":61}},"extendedWeaponsStats":{"uniqueWeaponKills":{"displayValue":"4","value":4},"uniqueWeaponPrecisionKills":{"displayValue":"0","value":0},"uniqueWeaponKillsPrecisionKills":{"displayValue":"0%","value":0},"totalStats":{"displayValue":18,"value":18}}},"lakasman":{"playerInfo":{"membershipId":"4611686018455242111"},"characterInfo":{"characterId":"2305843009361675580","displayName":"lakasman","characterClass":"Titan","characterLevel":40,"lightLevel":391,"iconPath":"/common/destiny_content/icons/a3cd13ec0dff19c9b38fe579ea88681a.jpg"},"trueStats":{"assists":{"displayValue":"33","value":33},"completed":{"displayValue":"No","value":0},"deaths":{"displayValue":"10","value":10},"kills":{"displayValue":"120","value":120},"killsDeathsRatio":{"displayValue":"12.00","value":12},"killsDeathsAssists":{"displayValue":"13.65","value":13.65},"activityDurationSeconds":{"displayValue":"2h 14m","value":8040},"completionReason":{"displayValue":"255","value":255},"fireTeamId":{"displayValue":"-2147483648","value":552380975181287360},"playerCount":{"displayValue":"9","value":9},"leaveRemainingSeconds":{"displayValue":"0m 0s","value":0},"assistsAgainstSivaCaptain":{"displayValue":"2","value":2},"assistsAgainstSivaVandal":{"displayValue":"19","value":19},"assistsAgainstSivaDreg":{"displayValue":"5","value":5},"assistsAgainstSivaShank":{"displayValue":"6","value":6},"assistsAgainstSivaServitor":{"displayValue":"1","value":1},"totalKillDistance":{"displayValue":"2204.0","value":2204},"averageKillDistance":{"displayValue":"18.4","value":18.366666666666667},"secondsPlayed":{"displayValue":"45m 37s","value":2737},"averageLifespan":{"displayValue":"4m 8s","value":248.8181818181818},"precisionKillOfSivaVandal":{"displayValue":"2","value":2},"precisionKillOfSivaDreg":{"displayValue":"10","value":10},"deathsFromSivaCaptain":{"displayValue":"2","value":2},"deathsFromSivaVandal":{"displayValue":"2","value":2},"deathsFromSivaDreg":{"displayValue":"2","value":2},"killsOfSivaCaptain":{"displayValue":"5","value":5},"killsOfSivaVandal":{"displayValue":"27","value":27},"killsOfSivaDreg":{"displayValue":"28","value":28},"killsOfSivaShank":{"displayValue":"60","value":60},"killsOfSiva":{"displayValue":"120","value":120},"deathsFromSiva":{"displayValue":"6","value":6},"precisionKills":{"displayValue":"12","value":12},"suicides":{"displayValue":"3","value":3},"weaponPrecisionKillsHandCannon":{"displayValue":"12","value":12},"weaponKillsGrenade":{"displayValue":"2","value":2},"weaponKillsHandCannon":{"displayValue":"81","value":81},"weaponKillsScoutRifle":{"displayValue":"7","value":7},"weaponKillsRelic":{"displayValue":"6","value":6},"weaponKillsSword":{"displayValue":"24","value":24},"weaponBestType":{"displayValue":"Hand Cannon","value":4},"weaponKillsPrecisionKillsHandCannon":{"displayValue":"15%","value":0.14814814814814814},"allParticipantsCount":{"displayValue":"9","value":9},"allParticipantsTimePlayed":{"displayValue":"12h 3m","value":43432},"longestKillSpree":{"displayValue":"26","value":26},"longestSingleLife":{"displayValue":"7m 7s","value":427},"orbsDropped":{"displayValue":"20","value":20},"orbsGathered":{"displayValue":"93","value":93},"remainingTimeAfterQuitSeconds":{"displayValue":"9m 6s","value":546},"totalActivityDurationSeconds":{"displayValue":"2h 14m","value":8040},"totalStats":{"displayValue":49,"value":49}},"extendedWeaponsStats":{"uniqueWeaponKills":{"displayValue":"7","value":7},"uniqueWeaponPrecisionKills":{"displayValue":"0","value":0},"uniqueWeaponKillsPrecisionKills":{"displayValue":"0%","value":0},"totalStats":{"displayValue":9,"value":9}}},"InternallyEvery":{"playerInfo":{"membershipId":"4611686018441371582"},"characterInfo":{"characterId":"2305843009412475733","displayName":"InternallyEvery","characterClass":"Titan","characterLevel":40,"lightLevel":0,"iconPath":"/common/destiny_content/icons/4ddc836fe272a8c377635fa6cfa1d7a9.jpg"},"trueStats":{"assists":{"displayValue":"0","value":0},"completed":{"displayValue":"No","value":0},"deaths":{"displayValue":"0","value":0},"kills":{"displayValue":"0","value":0},"killsDeathsRatio":{"displayValue":"0.00","value":0},"killsDeathsAssists":{"displayValue":"0.00","value":0},"activityDurationSeconds":{"displayValue":"2h 14m","value":8040},"completionReason":{"displayValue":"255","value":255},"fireTeamId":{"displayValue":"","value":0},"playerCount":{"displayValue":"9","value":9},"leaveRemainingSeconds":{"displayValue":"0m 0s","value":0},"secondsPlayed":{"displayValue":"0m 30s","value":30},"averageLifespan":{"displayValue":"0m 30s","value":30},"allParticipantsCount":{"displayValue":"9","value":9},"allParticipantsTimePlayed":{"displayValue":"12h 3m","value":43432},"remainingTimeAfterQuitSeconds":{"displayValue":"1h 8m","value":4127},"totalActivityDurationSeconds":{"displayValue":"2h 14m","value":8040},"totalStats":{"displayValue":17,"value":17}},"extendedWeaponsStats":{}}};

		$scope.selectActivity = selectActivity;
		$scope.getFireTeamModel = getFireTeamModel;
		$scope.getMoreResults = getMoreResults;
		$scope.formatDate = formatDate;
		$scope.addPlayer= addPlayer;
		$scope.keyDownEvt = keyDownEvt;
		$scope.loadRecentSearch = loadRecentSearch;
		$scope.cancelSearch = cancelSearch;

		m.selectedPlatform = m.platformTypes.ps4;

		$scope.$watch('m.playersArrays', function(newVal, oldVal){
			if(newVal.length <= 1 && newVal[0].isPlaceHolder){
				return;
			}

			if(newVal !== oldVal){
				m.isNewSearch = true;
				m.initialSearchRun = false;
			}

			$timeout(function(){
				inputDetectionFn(newVal);
			},10);
			

		}, true);

		init();

		function init(){
			checkRecentSearches();
		}

		function inputDetectionFn(model){
			var firstPlaceHolderIndex = null;
			var placeHolderCount = 0;

			angular.forEach(model, function(input, index){
				if(input.isPlaceHolder){
					placeHolderCount += 1;
			  		if(!firstPlaceHolderIndex){
						firstPlaceHolderIndex = index;
					}				
				}
			});

			if(placeHolderCount < 1){
				addPlayer();
			}

			if(placeHolderCount > 1 && firstPlaceHolderIndex){
				m.playersArrays.splice(firstPlaceHolderIndex, 1);
			}
		}

		function checkRecentSearches(){
			var recentSearchCookie = $cookies['recentSearches'];
			if(recentSearchCookie){
				m.recentSearches = angular.fromJson(recentSearchCookie);
			}
		}

		function loadRecentSearch(index){
			m.playersArrays = m.recentSearches[index].players;
			m.selectedPlatform = m.recentSearches[index].platformType;
		}

		function addPlayer(){
			if(m.playersArrays.length < m.maxMembers){
				m.playersArrays.push({displayName:'', isPlaceHolder: true});
			}
		}

		function getFireTeamModel(){
			if(m.isLoadingData){
				return;
			}

			if(m.playersArrays[0].isPlaceHolder){
				throwError({Error: 'Please enter a player name.'});
				return;
			}


			if(!m.isNewSearch){
				return;
			}

			var recentSearch = {
				players: m.playersArrays,
				platformType: m.selectedPlatform
			}

			updateRecentSearches(recentSearch);

			m.isLoadingData = true;
			m.isShowActivityList = true;
			m.errorMessage = null;

			m.fireTeamActivityResults = [];
			fireTeamModelFactory.clear();

			fireTeamModelFactory.getFireTeam(m.selectedPlatform.id, m.playersArrays).then(function(response){

				if((response[0].status && response[0].status !== 200) || (response[0].data && response[0].data.ErrorCode)){
					m.initialSearchRun = true;
					throwError(response[0].data);
					return;
				}

				m.fireTeamMembers = response;
				m.fireTeamMembers.gameMode = m.gameMode;
				m.fireTeamMembers.pageNum = 0;

				activityModelFactory.getPlayerInstanceList(m.fireTeamMembers).then(function(response){
					if(response.length > 0){
						getFireTeamInstanceData(compareInstances(response));
					}
					else{
						m.initialSearchRun = true;
						throwError({ErrorCode: 100, Error: 'No matching results found.'});
					}
				});
			}, function(error){
				console.log(error)
			});
		};

		function cancelSearch(){
			activityModelFactory.cancelAllPromises().then(function(response){
				m.isLoadingData = false;
				resetData();	
			});
		}

		function throwError(data){

			if(!data.ErrorCode){
				data.ErrorCode = 100;
			}

			//Custom Error Handling
			switch (data.ErrorCode){
				case 100:
					data.Error = 'A system error occurred. Please try again';
					break;		
				case 401:	
					data.Error = 'Failed to reach Destiny Servers. Please try again in a few minutes.';
					break;		
				case 500:	
					data.Error = 'A critical error occured. Please try again.';
					break;	
			}

			m.errorMessage = data.Error;
			m.isLoadingData = false;	
			resetProgressData();
		}

		function getMoreResults(){
			if(m.isLoadingData){
				return;
			}

			m.isLoadingData = true;
			m.fireTeamMembers.pageNum += 1;
			activityModelFactory.getPlayerInstanceList(m.fireTeamMembers).then(function(response){
				if(response.length > 0){
					getFireTeamInstanceData(compareInstances(response));
				}
				else{
					throwError({Error: 'No matching results found.'});
				}
			});
		}

		function getFireTeamInstanceData(instanceIdArray){
			if (instanceIdArray.length < 1){
				m.isLoadingData = false;
				getMoreResults();
				return;
			}

			var originalArrayLength = instanceIdArray.length;

			getActiviesPagination(instanceIdArray, m.activityLookupPerSearch);

			// activityModelFactory.getFireTeamActivities(instanceIdArray).then(function(response){
			// 	console.log('all instance arrays - lets try to page this');
			// 	if(response[0].ErrorCode && response[0].ErrorCode > 1){
			// 		throwError(response[0]);
			// 		return;
			// 	}

			// 	angular.merge(m.fireTeamActivityResults, response);

			// 	m.isLoadingData = false;
			// 	m.initialSearchRun = true;
			// });

			startPollingForProgress(100, originalArrayLength);
		}

		function getActiviesPagination(array, amountToProcess){

			if(array.length < amountToProcess){
				amountToProcess = array.length;
			}

			var arrayToProcess = array.splice(0, amountToProcess);
			var remainingLength = array.length;

			activityModelFactory.getFireTeamActivities(arrayToProcess).then(function(response){
				if(response[0].ErrorCode && response[0].ErrorCode > 1){
					throwError(response[0]);
					return;
				}

				angular.forEach(response, function(activity){
					m.fireTeamActivityResults.push(activity);
				});
			
				m.initialSearchRun = true;

				if(remainingLength > 0 && m.isLoadingData){
					getActiviesPagination(array, amountToProcess);
				}
				else{
					m.isLoadingData = false;
					resetProgressData();
				}

			});
		}

		function startPollingForProgress(delay, matches){
			if(delay < 500){
				delay += (delay * .2);
			}
			m.activityListProgress.totalActivities = matches;
			m.pollingTimeout = $timeout(function() {
				var progress = activityModelFactory.getProgress();
				m.activityListProgress = {
					totalActivities: matches,
					activitiesLoaded: progress,
					percentComplete: Math.round((progress / matches) * 100)
				}
				m.showProgressMessage = m.activityListProgress.percentComplete > 0 || m.activityListProgress.percentComplete < 100 ? true : false;
				if(m.isLoadingData){
					startPollingForProgress(delay, matches);
				}
			}, delay);
		}

		function compareInstances(charactersInstanceArrays){
			var checkArray = charactersInstanceArrays[0];
			var matchArray = [];

			for (var i = 0; i < checkArray.length; i++){
				var instanceId = checkArray[i];
				var instanceExistsInAll = true;
				for (var j = 1; j < charactersInstanceArrays.length; j++){
					instanceExistsInAll = recursiveInstanceMatch(instanceId, charactersInstanceArrays[j]);
				}
				if(instanceExistsInAll){
					matchArray.push(instanceId);
				}
			}

			return matchArray;
		}

		function recursiveInstanceMatch(val, array){
			var exists = false;

			for (var i = 0; i <= array.length; i++){
				if(array[i] === val){
					exists = true;
				}
			}
			return exists;
		}

		function selectActivity(activity){
			m.selectedActivity = activity;
			m.isShowActivityList = false;
		}

		function getGameActivitiesData(){
			gameActivityModelFactory.getActivityData().then(function(response){
				m.gameOptionsModel = response;
			})
		}

		function formatDate(inputDate){
			var outputDate = new Date(inputDate);
			return outputDate;
		}

		function keyDownEvt(e){
			switch(e.keyCode){
				case 13:
					e.preventDefault();
					getFireTeamModel();
				break;
			}
		}

		function updateRecentSearches(obj){
			if(m.recentSearches.length >= 10){
				m.recentSearches.splice(0,1);
			}

			m.recentSearches.push(obj);
			setCookie('recentSearches', m.recentSearches)
		}

		function setCookie(name, val, exp){
			$cookies[name] = JSON.stringify(val);
		}

		function resetData(){
			m.activityListProgress = {};
			m.showProgressMessage = false;

			if(m.pollingTimeout){
				$timeout.cancel(m.pollingTimeout);
			}

			m.activityListProgress = {
					totalActivities: 0,
					activitiesLoaded: 0,
					percentComplete: 0
				}
		}
	};


