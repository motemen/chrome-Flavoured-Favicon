/// <reference path="../../DefinitelyTyped/angularjs/angular.d.ts" />

import sk = require('../lib/storage-key');

interface OptionsCtrlScope extends ng.IScope {
    rulesJSON: string;
    save();
    state: string;
    jsonInvalid: boolean;
}

angular.module('optionsApp', [])

.controller('OptionsCtrl', function ($scope: OptionsCtrlScope) {
    function getParsedRulesJSON () {
        try {
            return JSON.parse($scope.rulesJSON)
        } catch (e) {
            return null;
        }
    }

    var storedRules = new sk.StorageKey('options.rules');

    $scope.rulesJSON = JSON.stringify(
        storedRules.get() || {}, null, 2
    );

    $scope.$watch('rulesJSON', function () {
        $scope.state = 'dirty';

        if (getParsedRulesJSON()) {
            $scope.jsonInvalid = false;
        } else {
            $scope.jsonInvalid = true;
        }
    });

    $scope.save = function () {
        var rules = getParsedRulesJSON();
        if (rules) {
            storedRules.set(rules);
            $scope.state = 'saved';
        }
    };
});
