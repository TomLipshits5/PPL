"use strict";
exports.__esModule = true;
exports.returnSquaredIfFoundEven_v3 = exports.returnSquaredIfFoundEven_v2 = exports.findResult = void 0;
var result_1 = require("../lib/result");
var R = require("ramda");
/* Library code */
var findOrThrow = function (pred, a) {
    for (var i = 0; i < a.length; i++) {
        if (pred(a[i]))
            return a[i];
    }
    throw "No element found.";
};
var findResult = function (pred, arr) { return R.filter(pred, arr).length === 0 ? (0, result_1.makeFailure)("NO such element exist") : (0, result_1.makeOk)(R.filter(pred, arr)[0]); };
exports.findResult = findResult;
/* Client code */
var returnSquaredIfFoundEven_v1 = function (a) {
    try {
        var x = findOrThrow(function (x) { return x % 2 === 0; }, a);
        return x * x;
    }
    catch (e) {
        return -1;
    }
};
var isEven = function (x) { return x % 2 === 0; };
var returnSquaredIfFoundEven_v2 = function (a) { return (0, result_1.bind)((0, exports.findResult)(isEven, a), function (x) { return (0, result_1.makeOk)(x * x); }); };
exports.returnSquaredIfFoundEven_v2 = returnSquaredIfFoundEven_v2;
var anyWay = function (r) { return (0, result_1.isOk)(r) ? r.value * r.value : -1; };
var returnSquaredIfFoundEven_v3 = function (a) { return (0, result_1.either)((0, exports.findResult)(isEven, a), function (x) { return x * x; }, function (str) { return -1; }); };
exports.returnSquaredIfFoundEven_v3 = returnSquaredIfFoundEven_v3;
