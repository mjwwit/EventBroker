(function () {
    'use strict';

    function EventBroker(moduleName, $$eventBroker) {
        if ($$eventBroker === undefined) {
            $$eventBroker = __eventBroker;
        }
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
    }

    angular.module('brokr', [])
        .provider('EventBrokerFactory', function EventBrokerFactoryProvider() {
            this.useGlobalBroker = function(value) {
                window.__useGlobalBroker = !!value;
            };

            this.$get = ['$$eventBroker', function EventBrokerFactoryBuilder($$eventBroker, moduleName) {
                if (window.__useGlobalBroker) {
                    defineGlobalEventBroker();
                    return function (moduleName) {
                        return new EventBroker(moduleName);
                    };
                }

                return function (moduleName) {
                    return new EventBroker(moduleName, $$eventBroker);
                };
            }];
        })
        .service('$$eventBroker', ['$q', function ($q) {
            var $$listeners = {};
            return {
                $on: function (source, event, listener) {
                    var e = [source, event].join('_');
                    if ($$listeners[e] === undefined) {
                        $$listeners[e] = [];
                    }
                    $$listeners[e].push(listener);
                },
                $emit: function (source, event, data) {
                    var src = [source, event].join('_');
                    if (!$$listeners[src]) {
                        return;
                    }
                    $$listeners[src].forEach(function (listener) {
                        listener(data);
                    });
                },
                $emitAsync: function (source, event, data) {
                    var src = [source, event].join('_');
                    var promises = [];
                    if ($$listeners[src]) {
                        if ($$listeners) {
                            $$listeners[src].forEach(function (listener) {
                                promises.push($q(function (resolve, reject) {
                                    try {
                                        listener(data);
                                        resolve();
                                    } catch (e) {
                                        reject(e);
                                    }
                                }));
                            });
                        }
                    }

                    return $q.all(promises);
                }
            };
        }])
    ;

    function defineGlobalEventBroker(){
        if (!window.__listeners) {
            window.__listeners = {};
        }
        if (!window.__eventBroker) {
            window.__eventBroker = {
                $on: function (source, event, listener) {
                    var e = [source, event].join('_');
                    if (__listeners[e] === undefined) {
                        __listeners[e] = [];
                    }
                    __listeners[e].push(listener);
                },
                $emit: function (source, event, data) {
                    var src = [source, event].join('_');
                    if (!__listeners[src]) {
                        return;
                    }
                    __listeners[src].forEach(function (listener) {
                        listener(data);
                    });
                },
                $emitAsync: function (source, event, data) {
                    var promises = [];
                    var src = [source, event].join('_');
                    if (__listeners[src]) {
                        __listeners[[source, event].join('_')].forEach(function (listener) {
                            promises.push(Q.async(function () {
                                try {
                                    listener(data);
                                } catch (e) {
                                    throw e;
                                }
                            }));
                        });
                    }

                    return Q.all(promises.map(function (async) { async(); }));
                }
            };
        }
    }
})();
