(function (){
    'use strict';

    window.$$listeners = {};
    window.$$eventBroker = {
        $on: function (source, event, listener) {
            var e = [source, event].join('_');
            if ($$listeners[e] === undefined) {
                $$listeners[e] = [];
            }
            $$listeners[e].push(listener);
        },
        $emit: function (source, event, data) {
            $$listeners[[source, event].join('_')].forEach(function (listener) {
                listener(data);
            });
        },
        $emitAsync: function (source, event, data) {
            var promises = [];
            $$listeners[[source, event].join('_')].forEach(function (listener) {
                promises.push(Q.async(function () {
                    try {
                        listener(data);
                    } catch (e) {
                        throw e;
                    }
                }));
            });

            return Q.all(promises.map(function (async) { async(); }));
        }
    };

    window.EventBroker = function (moduleName) {
        return {
            on: function (source, event, listener) {
                $$eventBroker.$on(source, event, listener);
            },
            emit: function (event, data) {
                $$eventBroker.$emit(moduleName, event, data);
            },
            emitAsync: function (event, data) {
                return $$eventBroker.$emitAsync(moduleName, event, data);
            }
        };
    };
})();