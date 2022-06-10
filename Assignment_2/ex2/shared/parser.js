"use strict";
/// <reference path="s-expression.d.ts" />
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = exports.isCompoundSexp = exports.isToken = exports.isSexp = exports.isSexpString = void 0;
const s_expression_1 = __importDefault(require("s-expression"));
const result_1 = require("./result");
const type_predicates_1 = require("./type-predicates");
const list_1 = require("./list");
// s-expression returns strings quoted as "a" as [String: 'a'] objects
// to distinguish them from symbols - which are encoded as 'a'
// These are constructed using the new String("a") constructor
// and can be distinguished from regular strings based on the constructor.
const isSexpString = (x) => !(0, type_predicates_1.isString)(x) && x.constructor && x.constructor.name === "String";
exports.isSexpString = isSexpString;
const isSexp = (x) => (0, exports.isToken)(x) || (0, exports.isCompoundSexp)(x);
exports.isSexp = isSexp;
const isToken = (x) => (0, type_predicates_1.isString)(x) || (0, exports.isSexpString)(x);
exports.isToken = isToken;
const isCompoundSexp = (x) => (0, type_predicates_1.isArray)(x) && (0, list_1.allT)(exports.isSexp, x);
exports.isCompoundSexp = isCompoundSexp;
const parse = (x) => {
    const parsed = (0, s_expression_1.default)(x);
    return (0, type_predicates_1.isError)(parsed) ? (0, result_1.makeFailure)(parsed.message) : (0, result_1.makeOk)(parsed);
};
exports.parse = parse;
