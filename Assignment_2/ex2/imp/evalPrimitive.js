"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPrim = exports.applyPrimitive = void 0;
const ramda_1 = require("ramda");
const L3_value_1 = require("./L3-value");
const list_1 = require("../shared/list");
const type_predicates_1 = require("../shared/type-predicates");
const result_1 = require("../shared/result");
const applyPrimitive = (proc, args) => proc.op === "+" ? ((0, list_1.allT)(type_predicates_1.isNumber, args) ? (0, result_1.makeOk)((0, ramda_1.reduce)((x, y) => x + y, 0, args)) : (0, result_1.makeFailure)("+ expects numbers only")) :
    proc.op === "-" ? minusPrim(args) :
        proc.op === "*" ? ((0, list_1.allT)(type_predicates_1.isNumber, args) ? (0, result_1.makeOk)((0, ramda_1.reduce)((x, y) => x * y, 1, args)) : (0, result_1.makeFailure)("* expects numbers only")) :
            proc.op === "/" ? divPrim(args) :
                proc.op === ">" ? (0, result_1.makeOk)(args[0] > args[1]) :
                    proc.op === "<" ? (0, result_1.makeOk)(args[0] < args[1]) :
                        proc.op === "=" ? (0, result_1.makeOk)(args[0] === args[1]) :
                            proc.op === "not" ? (0, result_1.makeOk)(!args[0]) :
                                proc.op === "and" ? (0, type_predicates_1.isBoolean)(args[0]) && (0, type_predicates_1.isBoolean)(args[1]) ? (0, result_1.makeOk)(args[0] && args[1]) : (0, result_1.makeFailure)('Arguments to "and" not booleans') :
                                    proc.op === "or" ? (0, type_predicates_1.isBoolean)(args[0]) && (0, type_predicates_1.isBoolean)(args[1]) ? (0, result_1.makeOk)(args[0] || args[1]) : (0, result_1.makeFailure)('Arguments to "or" not booleans') :
                                        proc.op === "eq?" ? (0, result_1.makeOk)(eqPrim(args)) :
                                            proc.op === "string=?" ? (0, result_1.makeOk)(args[0] === args[1]) :
                                                proc.op === "cons" ? (0, result_1.makeOk)(consPrim(args[0], args[1])) :
                                                    proc.op === "car" ? carPrim(args[0]) :
                                                        proc.op === "cdr" ? cdrPrim(args[0]) :
                                                            proc.op === "list" ? (0, result_1.makeOk)((0, exports.listPrim)(args)) :
                                                                proc.op === "pair?" ? (0, result_1.makeOk)(isPairPrim(args[0])) :
                                                                    proc.op === "number?" ? (0, result_1.makeOk)(typeof (args[0]) === 'number') :
                                                                        proc.op === "boolean?" ? (0, result_1.makeOk)(typeof (args[0]) === 'boolean') :
                                                                            proc.op === "symbol?" ? (0, result_1.makeOk)((0, L3_value_1.isSymbolSExp)(args[0])) :
                                                                                proc.op === "string?" ? (0, result_1.makeOk)((0, type_predicates_1.isString)(args[0])) :
                                                                                    (0, result_1.makeFailure)("Bad primitive op " + proc.op);
exports.applyPrimitive = applyPrimitive;
const minusPrim = (args) => {
    // TODO complete
    const x = args[0], y = args[1];
    if ((0, type_predicates_1.isNumber)(x) && (0, type_predicates_1.isNumber)(y)) {
        return (0, result_1.makeOk)(x - y);
    }
    else {
        return (0, result_1.makeFailure)(`Type error: - expects numbers ${args}`);
    }
};
const divPrim = (args) => {
    // TODO complete
    const x = args[0], y = args[1];
    if ((0, type_predicates_1.isNumber)(x) && (0, type_predicates_1.isNumber)(y)) {
        return (0, result_1.makeOk)(x / y);
    }
    else {
        return (0, result_1.makeFailure)(`Type error: / expects numbers ${args}`);
    }
};
const eqPrim = (args) => {
    const x = args[0], y = args[1];
    if ((0, L3_value_1.isSymbolSExp)(x) && (0, L3_value_1.isSymbolSExp)(y)) {
        return x.val === y.val;
    }
    else if ((0, L3_value_1.isEmptySExp)(x) && (0, L3_value_1.isEmptySExp)(y)) {
        return true;
    }
    else if ((0, type_predicates_1.isNumber)(x) && (0, type_predicates_1.isNumber)(y)) {
        return x === y;
    }
    else if ((0, type_predicates_1.isString)(x) && (0, type_predicates_1.isString)(y)) {
        return x === y;
    }
    else if ((0, type_predicates_1.isBoolean)(x) && (0, type_predicates_1.isBoolean)(y)) {
        return x === y;
    }
    else {
        return false;
    }
};
const carPrim = (v) => (0, L3_value_1.isCompoundSExp)(v) ? (0, result_1.makeOk)(v.val1) :
    (0, result_1.makeFailure)(`Car: param is not compound ${v}`);
const cdrPrim = (v) => (0, L3_value_1.isCompoundSExp)(v) ? (0, result_1.makeOk)(v.val2) :
    (0, result_1.makeFailure)(`Cdr: param is not compound ${v}`);
const consPrim = (v1, v2) => (0, L3_value_1.makeCompoundSExp)(v1, v2);
const listPrim = (vals) => vals.length === 0 ? (0, L3_value_1.makeEmptySExp)() :
    (0, L3_value_1.makeCompoundSExp)((0, list_1.first)(vals), (0, exports.listPrim)((0, list_1.rest)(vals)));
exports.listPrim = listPrim;
const isPairPrim = (v) => (0, L3_value_1.isCompoundSExp)(v);
