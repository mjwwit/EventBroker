'use strict';

class Brokr {
    constructor(moduleName) {
        this.moduleName = moduleName;

        if(window.__listeners === undefined) {
            window.__listeners = {};
            window.__broker = {
                emit: function emit(source, event, data) {
                    let promises = [];
                    let src = [source, event].join('_');
                    if (__listeners[src]) {
                        __listeners[[source, event].join('_')].forEach(function (listener) {
                            promises.push(new Promise(function (resolve, reject) {
                                try {
                                    listener(data);
                                    resolve();
                                } catch (e) {
                                    reject(e);
                                }
                            }));
                        });
                    }

                    return Promise.all(promises);
                },

                emitSync: function emitSync(source, event, data) {
                    let src = [source, event].join('_');
                    if (!__listeners[src]) {
                        return;
                    }
                    __listeners[src].forEach(function (listener) {
                        listener(data);
                    });
                },

                on: function on(source, event, listener) {
                    let src = [source, event].join('_');
                    if (__listeners[src] === undefined) {
                        __listeners[src] = [];
                    }
                    __listeners[src].push(listener);
                }
            }
        }
    }

    static factory(moduleName) {
        return new Brokr(moduleName);
    }

    emit(event, data) {
        return __broker.emit(this.moduleName, event, data);
    }

    on(source, event, listener) {
        __broker.on(source, event, listener);
    }

    emitSync(event, data) {
        __broker.emitSync(this.moduleName, event, data);
    }
}

export { Brokr };