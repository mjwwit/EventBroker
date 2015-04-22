'use strict';

describe('$$eventBroker', function () {
    var $$eventBroker;

    var callbacks = {
        cb1: function () {},
        cb2: function () {}
    };

    beforeEach(module('broker.io'));

    beforeEach(inject(function (_$$eventBroker_) {
        $$eventBroker = _$$eventBroker_;
    }));

    it('should allow you to register a listener for an event', function () {
        spyOn($$eventBroker, '$on');

        $$eventBroker.$on('a', 'SOME_EVENT', callbacks.cb1);

        expect($$eventBroker.$on).toHaveBeenCalledWith('a', 'SOME_EVENT', callbacks.cb1);
    });

    it('should allow you to emit an event', function () {
        spyOn(callbacks, 'cb1');

        $$eventBroker.$on('a', 'SOME_EVENT', callbacks.cb1);

        $$eventBroker.$emit('a', 'SOME_EVENT');

        expect(callbacks.cb1).toHaveBeenCalled();
    });

    it('should trigger the correct listener after emitting an event', function () {
        spyOn(callbacks, 'cb1');
        spyOn(callbacks, 'cb2');

        // Correct event, correct source
        $$eventBroker.$on('a', 'SOME_EVENT', callbacks.cb1);

        // Incorrect event, correct source
        $$eventBroker.$on('a', 'ANOTHER_EVENT', callbacks.cb2);

        // Correct event, incorrect source
        $$eventBroker.$on('b', 'SOME_EVENT', callbacks.cb2);

        $$eventBroker.$emit('a', 'SOME_EVENT');

        expect(callbacks.cb1).toHaveBeenCalled();
        expect(callbacks.cb2).not.toHaveBeenCalled();
    });

    it('should pass the correct data to the listener', function () {
        var data = {stuff: 'test'};

        spyOn(callbacks, 'cb1');

        $$eventBroker.$on('a', 'SOME_EVENT', callbacks.cb1);

        $$eventBroker.$emit('a', 'SOME_EVENT', data);

        expect(callbacks.cb1).toHaveBeenCalledWith(data);
    });

    it('should be able to trigger multiple listeners for one event', function () {
        spyOn(callbacks, 'cb1');
        spyOn(callbacks, 'cb2');

        $$eventBroker.$on('a', 'SOME_EVENT', callbacks.cb1);
        $$eventBroker.$on('a', 'SOME_EVENT', callbacks.cb2);

        $$eventBroker.$emit('a', 'SOME_EVENT');

        expect(callbacks.cb1).toHaveBeenCalled();
        expect(callbacks.cb2).toHaveBeenCalled();
    });

    it('should allow for async event processing', inject(['$rootScope', function ($rootScope) {
        spyOn(callbacks, 'cb1');
        spyOn(callbacks, 'cb2');

        $$eventBroker.$on('a', 'SOME_EVENT', callbacks.cb1);
        $$eventBroker.$emitAsync('a', 'SOME_EVENT').then(callbacks.cb2);

        $rootScope.$digest();

        expect(callbacks.cb1).toHaveBeenCalled();
        expect(callbacks.cb2).toHaveBeenCalled();
    }]));
});

describe('eventBroker', function () {
    var eventBroker;

    var callbacks = {
        cb1: function () {},
        cb2: function () {}
    };

    beforeEach(module('broker.io'));

    beforeEach(inject(function (_eventBroker_) {
        eventBroker = _eventBroker_;
    }));

    it('should return a custom broker for a given module', function () {
        expect(eventBroker.register('some.module')).toBeDefined();
    });

    it('should use an existing custom broker for a module, if one is available', function () {
        var customBroker = eventBroker.register('some.module');

        expect(customBroker).toBe(eventBroker.register('some.module'));
    });

    it('should pass event emits, ons, and emitAsyncs to the $$eventBroker service', inject(['$$eventBroker', function ($$eventBroker) {
        spyOn($$eventBroker, '$emit');
        spyOn($$eventBroker, '$on');
        spyOn($$eventBroker, '$emitAsync');

        var customBroker = eventBroker.register('some.module');

        customBroker.on('some.module', 'SOME_EVENT', callbacks.cb1);
        customBroker.emit('ANOTHER_EVENT');
        customBroker.emitAsync('ANOTHER_EVENT');

        expect($$eventBroker.$emit).toHaveBeenCalled();
        expect($$eventBroker.$on).toHaveBeenCalled();
        expect($$eventBroker.$emitAsync).toHaveBeenCalled();
    }]));

    it('should allow multiple modules to register the same event', function () {
        var sourceBroker = eventBroker.register('source.module');
        var broker1 = eventBroker.register('some.module');
        var broker2 = eventBroker.register('other.module');

        spyOn(callbacks, 'cb1');
        spyOn(callbacks, 'cb2');

        broker1.on('source.module', 'SOME_EVENT', callbacks.cb1);
        broker2.on('source.module', 'SOME_EVENT', callbacks.cb2);

        sourceBroker.emit('SOME_EVENT');

        expect(callbacks.cb1).toHaveBeenCalled();
        expect(callbacks.cb2).toHaveBeenCalled();
    });
});
