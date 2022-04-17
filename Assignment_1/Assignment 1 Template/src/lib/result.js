"use strict";
exports.__esModule = true;
exports.either = exports.bind = exports.isFailure = exports.isOk = exports.makeFailure = exports.makeOk = void 0;
var makeOk = function (value) {
    return ({ tag: "Ok", value: value });
};
exports.makeOk = makeOk;
var makeFailure = function (message) {
    return ({ tag: "Failure", message: message });
};
exports.makeFailure = makeFailure;
var isOk = function (r) {
    return r.tag === "Ok";
};
exports.isOk = isOk;
var isFailure = function (r) {
    return r.tag === "Failure";
};
exports.isFailure = isFailure;
var bind = function (r, f) {
    return (0, exports.isOk)(r) ? f(r.value) : r;
};
exports.bind = bind;
var either = function (r, ifOk, ifFailure) {
    return (0, exports.isOk)(r) ? ifOk(r.value) : ifFailure(r.message);
};
exports.either = either;
