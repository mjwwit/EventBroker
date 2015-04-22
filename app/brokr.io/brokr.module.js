'use strict';

import { Brokr } from './brokr.service';

let brokr = Brokr.factory;

angular.module('brokr.io', [])
    .provider('Broker', function BrokerProvider() {
        this.$get = [function (moduleName) {
            return function (moduleName) {
                return brokr(moduleName);
            };
        }];
    });

export { brokr };