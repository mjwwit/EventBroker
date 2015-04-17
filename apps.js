(function (){
    'use strict';

    angular.module('app1', ['brokr'])
        .service('AppBroker', ['EventBrokerFactory', function (EventBroker) {
            return new EventBroker('app1');
        }])
        .controller('ctrl1', ['$scope', 'AppBroker', function ($scope, AppBroker) {
            AppBroker.on('app2', 'SOME_EVENT', alert);

            $scope.trigger = function () {
                AppBroker.emitAsync('SOME_EVENT', 'Hello 1!').then(function () {
                    console.log('Async promise resolved!');
                });
                console.log('Should come first!');
            }
        }]);

    angular.module('app2', ['brokr'])
        .config(['EventBrokerFactoryProvider', function (EventBrokerFactoryProvider) {
            EventBrokerFactoryProvider.useGlobalBroker(false);
        }])
        .service('AppBroker', ['EventBrokerFactory', function (EventBroker) {
            return new EventBroker('app2');
        }])
        .controller('ctrl2', ['$scope', 'AppBroker', function ($scope, AppBroker) {
            AppBroker.on('app1', 'SOME_EVENT', alert);

            $scope.trigger = function () {
                AppBroker.emit('SOME_EVENT', 'Hello 2!');
            }
        }]);
})();

angular.bootstrap(document.getElementById("app2"),['app2']);
