'use strict';

import angular from 'angular';
import * as BrokrModule from './brokr.io/brokr.module';

console.log(angular.version);

angular.module('app1', ['brokr.io'])
    .service('broker1', ['Broker', function (Broker) {
        return new Broker('app1');
    }])
    .controller('ctrl1', ['$scope', 'broker1', function ($scope, myBroker) {
        function showMessage(msg) {
            alert('App1: ' + msg);
        }

        myBroker.on('app1', 'SOME_EVENT', showMessage);
        myBroker.on('app2', 'SOME_EVENT', showMessage);

        $scope.trigger = function () {
            myBroker.emit('SOME_EVENT', 'Event from app1!').then(function () {
                console.log('1: Async!')
            }, function (e) {
                console.log('1: ' + e.toString());
            });
        };
    }]);

angular.module('app2', ['brokr.io'])
    .service('broker2', ['Broker', function (Broker) {
        return new Broker('app2');
    }])
    .controller('ctrl2', ['$scope', 'broker2', function ($scope, myBroker) {
        function showMessage(msg) {
            alert('App2: ' + msg);
        }

        myBroker.on('app1', 'SOME_EVENT', showMessage);
        myBroker.on('app2', 'SOME_EVENT', showMessage);

        $scope.trigger = function () {
            myBroker.emit('SOME_EVENT', 'Event from app2!').then(function () {
                console.log('2: Async!')
            }, function (e) {
                console.log('2: ' + e.toString());
            });
        };
    }]);

angular.bootstrap(document.getElementById("app2"),['app2']);

/**
(function (){
    'use strict';

    angular.module('app1', ['brokr.io'])
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

    angular.module('app2', ['brokr.io'])
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
**/