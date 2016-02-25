app.controller('TabRulesController', ['$scope', '$mdDialog', '$mdMedia', '$mdToast', 'Rule', 'TabModifier', 'Analytics', '$http', function ($scope, $mdDialog, $mdMedia, $mdToast, Rule, TabModifier, Analytics, $http) {

    var tab_modifier = new TabModifier(), icon_list = [];

    // Avoid BC break
    if (localStorage.settings !== undefined) {
        tab_modifier.migrateOldSettings(localStorage.settings);

        localStorage.removeItem('settings');

        tab_modifier.setLocalData();
    }

    // Load saved data
    tab_modifier.getLocalData();

    $scope.tab_modifier = tab_modifier;

    // Load icon list
    $http.get('/js/icons.min.json').then(function (request) {
        icon_list = request.data;
    });

    // Show modal form
    $scope.showForm = function (evt, rule) {
        var index = (rule === undefined) ? null : tab_modifier.rules.indexOf(rule);

        $mdDialog.show({
            controller: 'FormModalController',
            templateUrl: '../html/form.min.html',
            targetEvent: evt,
            clickOutsideToClose: true,
            fullscreen: $mdMedia('xs'),
            resolve: {
                icon_list: function () {
                    return icon_list;
                },
                rule: function () {
                    return (index === null) ? new Rule() : rule;
                }
            }
        }).then(function (rule) {
            // Save a rule
            tab_modifier.save(rule, index);

            tab_modifier.setLocalData();

            $mdToast.show(
                $mdToast.simple()
                    .textContent('Your rule has been successfully saved')
                    .position('top right')
            );
        }, function () {
            Analytics.trackEvent('tab-rules', 'close-form');
        });
    };

    // Duplicate a rule
    $scope.duplicate = function (rule) {
        tab_modifier.save(new Rule(angular.copy(rule)));

        tab_modifier.setLocalData();

        $mdToast.show(
            $mdToast.simple()
                .textContent('Your rule has been successfully duplicated')
                .position('top right')
        );
    };

    // Delete a rule
    $scope.delete = function (evt, rule) {
        var confirm = $mdDialog
            .confirm()
            .clickOutsideToClose(false)
            .title('Delete rule')
            .textContent('Do you really want to delete this rule?')
            .ariaLabel('Delete rule')
            .targetEvent(evt)
            .ok('Delete')
            .cancel('Cancel');

        $mdDialog.show(confirm).then(function () {
            tab_modifier.removeRule(rule);

            tab_modifier.setLocalData();

            $mdToast.show(
                $mdToast.simple()
                    .textContent('Your rule has been successfully deleted')
                    .position('top right')
            );
        });
    };

}]);

app.controller('FormModalController', ['$scope', '$mdDialog', 'rule', 'icon_list', function ($scope, $mdDialog, rule, icon_list) {

    $scope.rule      = rule;
    $scope.icon_list = icon_list;

    $scope.$watch('rule.url_fragment', function () {
        if (rule.url_fragment === '' || rule.url_fragment === undefined) {
            rule.setModel({ url_fragment: null });
        }
    });

    $scope.$watch('rule.tab.title', function () {
        if (rule.tab.title === '' || rule.tab.title === undefined) {
            rule.tab.title = null;
        }
    });

    $scope.$watch('rule.tab.icon', function () {
        if (rule.tab.icon === '' || rule.tab.title === undefined) {
            rule.tab.icon = null;
        }
    });

    $scope.$watch('rule.tab.url_matcher', function () {
        if (rule.tab.url_matcher === '' || rule.tab.url_matcher === undefined) {
            rule.tab.url_matcher = null;
        }
    });

    $scope.closeForm = function () {
        $mdDialog.cancel();
    };

    $scope.save = function (rule) {
        $mdDialog.hide(rule);
    };

}]);
