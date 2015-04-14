# EventBroker
Global JavaScript event broker using [kriskowal's q][1].
Event listenters can be processed asynchronously.

## Usage
```javascript
var myBroker = new EventBroker('my.module.name');
myBroker.on('my.module.name', 'SOME_EVENT', alert);
myBroker.emit('SOME_EVENT', 'Hello world!');
```
For more advanced examples, check the Angular based demo in [index.html][2] and [apps.js][3]

[1]: https://github.com/kriskowal/q
[2]: https://github.com/mjwwit/EventBroker/blob/master/index.html
[3]: https://github.com/mjwwit/EventBroker/blob/master/apps.js
