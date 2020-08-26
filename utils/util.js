'use strict';

module.exports = {
    getNonceStr() {
        return Math.random().toString(36).substr(2, 15);
    },
};
