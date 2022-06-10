"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resultToOptional = exports.safe2 = exports.zipWithResult = exports.mapResult = exports.isOkT = exports.either = exports.rmap = exports.rbind = exports.mapv = exports.bind = exports.isFailure = exports.isOk = exports.makeFailure = exports.makeOk = void 0;
const list_1 = require("./list");
const optional_1 = require("./optional");
const makeOk = (value) => ({ tag: "Ok", value: value });
exports.makeOk = makeOk;
const makeFailure = (message) => ({ tag: "Failure", message: message });
exports.makeFailure = makeFailure;
const isOk = (r) => r.tag === "Ok";
exports.isOk = isOk;
const isFailure = (r) => r.tag === "Failure";
exports.isFailure = isFailure;
// bind a result value into a happy path function that could fail
const bind = (r, f) => (0, exports.isOk)(r) ? f(r.value) : r;
exports.bind = bind;
// bind a result value into a happy path function that could fail
const mapv = (r, f) => (0, exports.isOk)(r) ? (0, exports.makeOk)(f(r.value)) : r;
exports.mapv = mapv;
// Traditional Result.bind(f) from diagonal T->R<U> to R<T>->R<U>
// Also known as flatmap
const rbind = (f) => (r) => (0, exports.isOk)(r) ? f(r.value) : r;
exports.rbind = rbind;
// Traditional Result.map(f) from T->U to R<T>->R<U>
const rmap = (f) => (r) => (0, exports.isOk)(r) ? (0, exports.makeOk)(f(r.value)) : r;
exports.rmap = rmap;
// Traditionally called Result.fold(result, onOk, onFailure)
const either = (r, ifOk, ifFailure) => (0, exports.isOk)(r) ? ifOk(r.value) : ifFailure(r.message);
exports.either = either;
// Purpose: Test whether a result is Ok and of a
//          specified type (using a given type predicate)
// Example:
//     const r: Result<Exp> = bind(p("(+ x 1)"), parseL3Exp);
//     isOkT(isAppExp)(r) ? [here "r" is Ok<AppExp>]
const isOkT = (pred) => (r) => (0, exports.isOk)(r) && pred(r.value);
exports.isOkT = isOkT;
// Purpose: Like map on an array - but when the transformer function applied returns a Result<T>
//          With f: T=>Result<U> and list: T[] return a Result<U[]> 
//          If one of the items of the list fails on f - returns the Failure on the first item that fails.
// Example: 
// mapResult((x) => x === 0 ? makeFailure("div by 0") : makeOk(1/x), [1,2]) ==> {tag:"Ok", value:[1, 0.5]}
// mapResult((x) => x === 0 ? makeFailure("div by 0") : makeOk(1/x), [1,0,2]) ==> {tag:"Failure", message:"div by 0"}
const mapResult = (f, list) => (0, list_1.isEmpty)(list) ? (0, exports.makeOk)([]) :
    (0, exports.bind)(f((0, list_1.first)(list)), (fa) => (0, exports.bind)((0, exports.mapResult)(f, (0, list_1.rest)(list)), (fas) => (0, exports.makeOk)((0, list_1.cons)(fa, fas))));
exports.mapResult = mapResult;
const zipWithResult = (f, xs, ys) => xs.length === 0 || ys.length === 0 ? (0, exports.makeOk)([]) :
    (0, exports.bind)(f((0, list_1.first)(xs), (0, list_1.first)(ys)), (fxy) => (0, exports.bind)((0, exports.zipWithResult)(f, (0, list_1.rest)(xs), (0, list_1.rest)(ys)), (fxys) => (0, exports.makeOk)((0, list_1.cons)(fxy, fxys))));
exports.zipWithResult = zipWithResult;
const safe2 = (f) => (xr, yr) => (0, exports.bind)(xr, (x) => (0, exports.bind)(yr, (y) => f(x, y)));
exports.safe2 = safe2;
const resultToOptional = (r) => (0, exports.either)(r, optional_1.makeSome, _ => (0, optional_1.makeNone)());
exports.resultToOptional = resultToOptional;
