# Brokr.io
AngularJS Event Broker. Event listeners can be processed asynchronously.

Local event broker AngularJS module uses Angular's $q service.

Global event broker uses [kriskowal's q][1].
It registers on window so it can be accessed from other AngularJS apps on the same page.

## Local usage
```javascript
angular.module('some.module', ['brokr'])
    .service('ModuleBroker', ['EventBrokerFactory', function (EventBroker) {
        return new EventBroker('some.module');
    }])
    .controller('SomeCtrl', ['ModuleBroker', function (ModuleBroker) {
        ModuleBroker.on('some.module', 'SOME_EVENT', alert);
        ModuleBroker.emit('SOME_EVENT', 'Hello, World!');
        
        ModuleBroker.emitAsync('SOME_EVENT', 'Hello, Async!').then(function () {
            console.log('This should log last');
        });
        console.log('This should log first');
    }]);
```

## Global usage
```javascript
angular.module('some.module', ['brokr'])
    .config(['EventBrokerFactoryProvider', function (EventBrokerFactoryProvider) {
        EventBrokerFactoryProvider.useGlobalBroker(true);
    }])
    .service('ModuleBroker', ['EventBrokerFactory', function (EventBroker) {
        return new EventBroker('some.module');
    }])
    .controller('SomeCtrl', ['ModuleBroker', function (ModuleBroker) {
        ModuleBroker.on('some.module', 'SOME_EVENT', alert);
        ModuleBroker.emit('SOME_EVENT', 'Hello, World!');
        
        ModuleBroker.emitAsync('SOME_EVENT', 'Hello, Async!').then(function () {
            console.log('This should log last');
        });
        console.log('This should log first');
    }]);
```
For a more advanced global example, check the Angular based demo in [index.html][2] and [app.js][3]

[1]: https://github.com/kriskowal/q
[2]: https://github.com/mjwwit/EventBroker/blob/master/index.html
[3]: https://github.com/mjwwit/EventBroker/blob/master/app.js
