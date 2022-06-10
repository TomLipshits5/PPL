"use strict";
// ========================================================
// Value type definition for L3
Object.defineProperty(exports, "__esModule", { value: true });
exports.valueToString = exports.compoundSExpToString = exports.compoundSExpToArray = exports.closureToString = exports.isSymbolSExp = exports.makeSymbolSExp = exports.isEmptySExp = exports.makeEmptySExp = exports.isCompoundSExp = exports.makeCompoundSExp = exports.isSExp = exports.isClosure = exports.makeClosure = exports.isFunctional = void 0;
const L3_ast_1 = require("./L3-ast");
const type_predicates_1 = require("../shared/type-predicates");
const ramda_1 = require("ramda");
const isFunctional = (x) => (0, L3_ast_1.isPrimOp)(x) || (0, exports.isClosure)(x);
exports.isFunctional = isFunctional;
const makeClosure = (params, body) => ({ tag: "Closure", params: params, body: body });
exports.makeClosure = makeClosure;
const isClosure = (x) => x.tag === "Closure";
exports.isClosure = isClosure;
const isSExp = (x) => typeof (x) === 'string' || typeof (x) === 'boolean' || typeof (x) === 'number' ||
    (0, exports.isSymbolSExp)(x) || (0, exports.isCompoundSExp)(x) || (0, exports.isEmptySExp)(x) || (0, L3_ast_1.isPrimOp)(x) || (0, exports.isClosure)(x);
exports.isSExp = isSExp;
const makeCompoundSExp = (val1, val2) => ({ tag: "CompoundSexp", val1: val1, val2: val2 });
exports.makeCompoundSExp = makeCompoundSExp;
const isCompoundSExp = (x) => x.tag === "CompoundSexp";
exports.isCompoundSExp = isCompoundSExp;
const makeEmptySExp = () => ({ tag: "EmptySExp" });
exports.makeEmptySExp = makeEmptySExp;
const isEmptySExp = (x) => x.tag === "EmptySExp";
exports.isEmptySExp = isEmptySExp;
const makeSymbolSExp = (val) => ({ tag: "SymbolSExp", val: val });
exports.makeSymbolSExp = makeSymbolSExp;
const isSymbolSExp = (x) => x.tag === "SymbolSExp";
exports.isSymbolSExp = isSymbolSExp;
// Printable form for values
const closureToString = (c) => 
// `<Closure ${c.params} ${L3unparse(c.body)}>`
`<Closure ${c.params} ${c.body}>`;
exports.closureToString = closureToString;
const compoundSExpToArray = (cs, res) => (0, exports.isEmptySExp)(cs.val2) ? (0, ramda_1.append)((0, exports.valueToString)(cs.val1), res) :
    (0, exports.isCompoundSExp)(cs.val2) ? (0, exports.compoundSExpToArray)(cs.val2, (0, ramda_1.append)((0, exports.valueToString)(cs.val1), res)) :
        ({ s1: (0, ramda_1.append)((0, exports.valueToString)(cs.val1), res), s2: (0, exports.valueToString)(cs.val2) });
exports.compoundSExpToArray = compoundSExpToArray;
const compoundSExpToString = (cs, css = (0, exports.compoundSExpToArray)(cs, [])) => (0, type_predicates_1.isArray)(css) ? `(${css.join(' ')})` :
    `(${css.s1.join(' ')} . ${css.s2})`;
exports.compoundSExpToString = compoundSExpToString;
const valueToString = (val) => (0, type_predicates_1.isNumber)(val) ? val.toString() :
    val === true ? '#t' :
        val === false ? '#f' :
            (0, type_predicates_1.isString)(val) ? `"${val}"` :
                (0, exports.isClosure)(val) ? (0, exports.closureToString)(val) :
                    (0, L3_ast_1.isPrimOp)(val) ? val.op :
                        (0, exports.isSymbolSExp)(val) ? val.val :
                            (0, exports.isEmptySExp)(val) ? "'()" :
                                (0, exports.isCompoundSExp)(val) ? (0, exports.compoundSExpToString)(val) :
                                    val;
exports.valueToString = valueToString;
