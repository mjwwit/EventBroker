/**
 * # Brokr.io Angular Module #
 * @description This module contains the Brokr.io event broker.
 * @author Michael de Wit
 */
(function () {
    'use strict';

    /**
     * Event broker interface.
     * @param moduleName
     * @param $$eventBroker
     * @returns {{on: Function, emit: Function, emitAsync: Function}}
     * @constructor
     */
    function EventBroker(moduleName, $$eventBroker) {
        if ($$eventBroker === undefined) {
            $$eventBroker = __eventBroker;
        }
        return {
            /**
             * Event listener register function. Registers a callback for the specified event.
             * @param source
             * @param event
             * @param listener Callback function
             */
            on: function (source, event, listener) {
                $$eventBroker.$on(source, event, listener);
            },
            /**
             * Emit event function.
             * @param event
             * @param data
             */
            emit: function (event, data) {
                $$eventBroker.$emit(moduleName, event, data);
            },
            /**
             * Asynchronous emit event function.
             * @param event
             * @param data
             * @returns {Promise}
             */
            emitAsync: function (event, data) {
                return $$eventBroker.$emitAsync(moduleName, event, data);
            }
        };
    }

    /**
     * Brokr.io AngularJS module.
     */
    angular.module('brokr.io', [])
    /**
     * EventBrokerFactoryProvider. Adds functionality which lets you switch between a module wide event broker
     * or a window wide event broker.
     */
        .provider('EventBrokerFactory', function EventBrokerFactoryProvider() {
            /**
             * Function offering the ability to switch between a global and a module wide event broker.
             * @param value Boolean indicating if a global broker should be used.
             */
            this.useGlobalBroker = function(value) {
                window.__useGlobalBroker = !!value;
            };

            /**
             * AngularJS Provider $get function. Provides the EventBrokerFactory, which instantiates a new event broker
             * based on a module name (for event name spacing).
             */
            this.$get = ['$$eventBroker', function EventBrokerFactoryBuilder($$eventBroker, moduleName) {
                // If a global broker should be used
                if (window.__useGlobalBroker) {
                    // Define the event broker on the window
                    defineGlobalEventBroker();

                    // Return window wide event broker factory
                    return function (moduleName) {
                        return new EventBroker(moduleName);
                    };
                }

                // Return module wide event broker factory
                return function (moduleName) {
                    return new EventBroker(moduleName, $$eventBroker);
                };
            }];
        })
    /**
     * Private event broker implementation service. Should not be used directly.
     */
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
                /**
                 * Asynchronous emit event function. Uses AngularJS' $q service to provide Promises.
                 * @param source
                 * @param event
                 * @param data
                 * @returns {Promise}
                 */
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

    /**
     * Function that loads the event broker on the window object. This makes sure it is globally available.
     */
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
                /**
                 * Asynchronous emit event function. Uses kriskowal's Q library to provide Promises.
                 * @param source
                 * @param event
                 * @param data
                 * @returns {Promise}
                 */
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
