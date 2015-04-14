(function (){
    'use strict';

    angular.module('app1', []).controller('ctrl1', ['$scope', function ($scope) {
        var myBroker = new EventBroker('app1');

        myBroker.on('app2', 'SOME_EVENT', alert);

        $scope.trigger = function () {
            myBroker.emitAsync('SOME_EVENT', 'Hello 1!').then(function () {
                console.log('Async promise resolved!');
            });
            console.log('Should come first!');
        }
    }]);

    angular.module('app2', []).controller('ctrl2', ['$scope', function ($scope) {
        var myBroker = new EventBroker('app2');

        myBroker.on('app1', 'SOME_EVENT', alert);

        $scope.trigger = function () {
            myBroker.emit('SOME_EVENT', 'Hello 2!');
        }
    }]);

    angular.bootstrap(document.getElementById("app2"),['app2']);
})();
