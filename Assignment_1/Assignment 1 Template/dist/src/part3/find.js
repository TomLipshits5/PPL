"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnSquaredIfFoundEven_v3 = exports.returnSquaredIfFoundEven_v2 = exports.findResult = void 0;
const result_1 = require("../lib/result");
const R = require("ramda");
/* Library code */
const findOrThrow = (pred, a) => {
    for (let i = 0; i < a.length; i++) {
        if (pred(a[i]))
            return a[i];
    }
    throw "No element found.";
};
const findResult = (pred, arr) => R.filter(pred, arr).length === 0 ? (0, result_1.makeFailure)("NO such element exist") : (0, result_1.makeOk)(R.filter(pred, arr)[0]);
exports.findResult = findResult;
/* Client code */
const returnSquaredIfFoundEven_v1 = (a) => {
    try {
        const x = findOrThrow(x => x % 2 === 0, a);
        return x * x;
    }
    catch (e) {
        return -1;
    }
};
const isEven = x => x % 2 === 0;
const returnSquaredIfFoundEven_v2 = a => (0, result_1.bind)((0, exports.findResult)(isEven, a), x => (0, result_1.makeOk)(x * x));
exports.returnSquaredIfFoundEven_v2 = returnSquaredIfFoundEven_v2;
const anyWay = r => (0, result_1.isOk)(r) ? r.value * r.value : -1;
const returnSquaredIfFoundEven_v3 = a => (0, result_1.either)((0, exports.findResult)(isEven, a), x => x * x, str => -1);
exports.returnSquaredIfFoundEven_v3 = returnSquaredIfFoundEven_v3;
//# sourceMappingURL=find.js.map