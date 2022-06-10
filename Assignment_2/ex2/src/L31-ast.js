"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unparseL31 = exports.parseSExp = exports.makeDottedPair = exports.isDottedPair = exports.parseLitExp = exports.parseL31Atomic = exports.parseL31CExp = exports.parseDefine = exports.parseL31SpecialForm = exports.parseL31CompoundCExp = exports.parseL31CompoundExp = exports.parseL31Exp = exports.parseL31Program = exports.parseL31 = exports.isCExp = exports.isCompoundExp = exports.isAtomicExp = exports.isExp = exports.isLetPlusExp = exports.isLitExp = exports.isLetExp = exports.isBinding = exports.isProcExp = exports.isIfExp = exports.isAppExp = exports.isVarDecl = exports.isVarRef = exports.isPrimOp = exports.isStrExp = exports.isBoolExp = exports.isNumExp = exports.isDefineExp = exports.isProgram = exports.makeLetPlusExp = exports.makeLitExp = exports.makeLetExp = exports.makeBinding = exports.makeProcExp = exports.makeIfExp = exports.makeAppExp = exports.makeVarDecl = exports.makeVarRef = exports.makePrimOp = exports.makeStrExp = exports.makeBoolExp = exports.makeNumExp = exports.makeDefineExp = exports.makeProgram = void 0;
// ===========================================================
// AST type models
const ramda_1 = require("ramda");
const L3_value_1 = require("../imp/L3-value");
const list_1 = require("../shared/list");
const type_predicates_1 = require("../shared/type-predicates");
const result_1 = require("../shared/result");
const parser_1 = require("../shared/parser");
// Type value constructors for disjoint types
const makeProgram = (exps) => ({ tag: "Program", exps: exps });
exports.makeProgram = makeProgram;
const makeDefineExp = (v, val) => ({ tag: "DefineExp", var: v, val: val });
exports.makeDefineExp = makeDefineExp;
const makeNumExp = (n) => ({ tag: "NumExp", val: n });
exports.makeNumExp = makeNumExp;
const makeBoolExp = (b) => ({ tag: "BoolExp", val: b });
exports.makeBoolExp = makeBoolExp;
const makeStrExp = (s) => ({ tag: "StrExp", val: s });
exports.makeStrExp = makeStrExp;
const makePrimOp = (op) => ({ tag: "PrimOp", op: op });
exports.makePrimOp = makePrimOp;
const makeVarRef = (v) => ({ tag: "VarRef", var: v });
exports.makeVarRef = makeVarRef;
const makeVarDecl = (v) => ({ tag: "VarDecl", var: v });
exports.makeVarDecl = makeVarDecl;
const makeAppExp = (rator, rands) => ({ tag: "AppExp", rator: rator, rands: rands });
exports.makeAppExp = makeAppExp;
// L2
const makeIfExp = (test, then, alt) => ({ tag: "IfExp", test: test, then: then, alt: alt });
exports.makeIfExp = makeIfExp;
const makeProcExp = (args, body) => ({ tag: "ProcExp", args: args, body: body });
exports.makeProcExp = makeProcExp;
const makeBinding = (v, val) => ({ tag: "Binding", var: (0, exports.makeVarDecl)(v), val: val });
exports.makeBinding = makeBinding;
const makeLetExp = (bindings, body) => ({ tag: "LetExp", bindings: bindings, body: body });
exports.makeLetExp = makeLetExp;
// L3
const makeLitExp = (val) => ({ tag: "LitExp", val: val });
exports.makeLitExp = makeLitExp;
//L31
const makeLetPlusExp = (bindings, body) => ({ tag: "LetPlusExp", bindings: bindings, body: body });
exports.makeLetPlusExp = makeLetPlusExp;
// Type predicates for disjoint types
const isProgram = (x) => x.tag === "Program";
exports.isProgram = isProgram;
const isDefineExp = (x) => x.tag === "DefineExp";
exports.isDefineExp = isDefineExp;
const isNumExp = (x) => x.tag === "NumExp";
exports.isNumExp = isNumExp;
const isBoolExp = (x) => x.tag === "BoolExp";
exports.isBoolExp = isBoolExp;
const isStrExp = (x) => x.tag === "StrExp";
exports.isStrExp = isStrExp;
const isPrimOp = (x) => x.tag === "PrimOp";
exports.isPrimOp = isPrimOp;
const isVarRef = (x) => x.tag === "VarRef";
exports.isVarRef = isVarRef;
const isVarDecl = (x) => x.tag === "VarDecl";
exports.isVarDecl = isVarDecl;
const isAppExp = (x) => x.tag === "AppExp";
exports.isAppExp = isAppExp;
// L2
const isIfExp = (x) => x.tag === "IfExp";
exports.isIfExp = isIfExp;
const isProcExp = (x) => x.tag === "ProcExp";
exports.isProcExp = isProcExp;
const isBinding = (x) => x.tag === "Binding";
exports.isBinding = isBinding;
const isLetExp = (x) => x.tag === "LetExp";
exports.isLetExp = isLetExp;
// L3
const isLitExp = (x) => x.tag === "LitExp";
exports.isLitExp = isLitExp;
//L31
const isLetPlusExp = (x) => x.tag === "LetPlusExp";
exports.isLetPlusExp = isLetPlusExp;
// Type predicates for type unions
const isExp = (x) => (0, exports.isDefineExp)(x) || (0, exports.isCExp)(x);
exports.isExp = isExp;
const isAtomicExp = (x) => (0, exports.isNumExp)(x) || (0, exports.isBoolExp)(x) || (0, exports.isStrExp)(x) ||
    (0, exports.isPrimOp)(x) || (0, exports.isVarRef)(x);
exports.isAtomicExp = isAtomicExp;
const isCompoundExp = (x) => (0, exports.isAppExp)(x) || (0, exports.isIfExp)(x) || (0, exports.isProcExp)(x) || (0, exports.isLitExp)(x) || (0, exports.isLetExp)(x) || (0, exports.isLetPlusExp)(x);
exports.isCompoundExp = isCompoundExp;
const isCExp = (x) => (0, exports.isAtomicExp)(x) || (0, exports.isCompoundExp)(x);
exports.isCExp = isCExp;
// ========================================================
// Parsing
const parseL31 = (x) => (0, result_1.bind)((0, parser_1.parse)(x), exports.parseL31Program);
exports.parseL31 = parseL31;
const parseL31Program = (sexp) => sexp === "" || (0, list_1.isEmpty)(sexp) ? (0, result_1.makeFailure)("Unexpected empty program") :
    (0, parser_1.isToken)(sexp) ? (0, result_1.makeFailure)("Program cannot be a single token") :
        (0, type_predicates_1.isArray)(sexp) ? parseL31GoodProgram((0, list_1.first)(sexp), (0, list_1.rest)(sexp)) :
            (0, result_1.makeFailure)("Unexpected type " + sexp);
exports.parseL31Program = parseL31Program;
const parseL31GoodProgram = (keyword, body) => keyword === "L31" && !(0, list_1.isEmpty)(body) ? (0, result_1.mapv)((0, result_1.mapResult)(exports.parseL31Exp, body), (exps) => (0, exports.makeProgram)(exps)) :
    (0, result_1.makeFailure)("Program must be of the form (L3 <exp>+)");
// Exp -> <DefineExp> | <Cexp>
const parseL31Exp = (sexp) => (0, list_1.isEmpty)(sexp) ? (0, result_1.makeFailure)("Exp cannot be an empty list") :
    (0, type_predicates_1.isArray)(sexp) ? (0, exports.parseL31CompoundExp)((0, list_1.first)(sexp), (0, list_1.rest)(sexp)) :
        (0, parser_1.isToken)(sexp) ? (0, exports.parseL31Atomic)(sexp) :
            sexp;
exports.parseL31Exp = parseL31Exp;
// Compound -> DefineExp | CompoundCExp
const parseL31CompoundExp = (op, params) => op === "define" ? (0, exports.parseDefine)(params) :
    (0, exports.parseL31CompoundCExp)(op, params);
exports.parseL31CompoundExp = parseL31CompoundExp;
// CompoundCExp -> IfExp | ProcExp | LetExp | LitExp | AppExp | LetPlusExp
const parseL31CompoundCExp = (op, params) => (0, type_predicates_1.isString)(op) && isSpecialForm(op) ? (0, exports.parseL31SpecialForm)(op, params) :
    parseAppExp(op, params);
exports.parseL31CompoundCExp = parseL31CompoundCExp;
const parseL31SpecialForm = (op, params) => (0, list_1.isEmpty)(params) ? (0, result_1.makeFailure)("Empty args for special form") :
    op === "if" ? parseIfExp(params) :
        op === "lambda" ? parseProcExp((0, list_1.first)(params), (0, list_1.rest)(params)) :
            op === "let" ? parseLetExp((0, list_1.first)(params), (0, list_1.rest)(params)) :
                op === "let*" ? parseLetPlusExp((0, list_1.first)(params), (0, list_1.rest)(params)) :
                    op === "quote" ? (0, exports.parseLitExp)((0, list_1.first)(params)) :
                        (0, result_1.makeFailure)("Never");
exports.parseL31SpecialForm = parseL31SpecialForm;
// DefineExp -> (define <varDecl> <CExp>)
const parseDefine = (params) => (0, list_1.isEmpty)(params) ? (0, result_1.makeFailure)("define missing 2 arguments") :
    (0, list_1.isEmpty)((0, list_1.rest)(params)) ? (0, result_1.makeFailure)("define missing 1 arguments") :
        !(0, list_1.isEmpty)((0, list_1.rest)((0, list_1.rest)(params))) ? (0, result_1.makeFailure)("define has too many arguments") :
            parseGoodDefine((0, list_1.first)(params), (0, list_1.second)(params));
exports.parseDefine = parseDefine;
const parseGoodDefine = (variable, val) => !(0, type_predicates_1.isIdentifier)(variable) ? (0, result_1.makeFailure)("First arg of define must be an identifier") :
    (0, result_1.mapv)((0, exports.parseL31CExp)(val), (value) => (0, exports.makeDefineExp)((0, exports.makeVarDecl)(variable), value));
const parseL31CExp = (sexp) => (0, list_1.isEmpty)(sexp) ? (0, result_1.makeFailure)("CExp cannot be an empty list") :
    (0, type_predicates_1.isArray)(sexp) ? (0, exports.parseL31CompoundCExp)((0, list_1.first)(sexp), (0, list_1.rest)(sexp)) :
        (0, parser_1.isToken)(sexp) ? (0, exports.parseL31Atomic)(sexp) :
            sexp;
exports.parseL31CExp = parseL31CExp;
// Atomic -> number | boolean | primitiveOp | string
const parseL31Atomic = (token) => token === "#t" ? (0, result_1.makeOk)((0, exports.makeBoolExp)(true)) :
    token === "#f" ? (0, result_1.makeOk)((0, exports.makeBoolExp)(false)) :
        (0, type_predicates_1.isString)(token) && (0, type_predicates_1.isNumericString)(token) ? (0, result_1.makeOk)((0, exports.makeNumExp)(+token)) :
            (0, type_predicates_1.isString)(token) && isPrimitiveOp(token) ? (0, result_1.makeOk)((0, exports.makePrimOp)(token)) :
                (0, type_predicates_1.isString)(token) ? (0, result_1.makeOk)((0, exports.makeVarRef)(token)) :
                    (0, result_1.makeOk)((0, exports.makeStrExp)(token.toString()));
exports.parseL31Atomic = parseL31Atomic;
/*
    ;; <prim-op>  ::= + | - | * | / | < | > | = | not | and | or | eq? | string=?
    ;;                  | cons | car | cdr | pair? | number? | list
    ;;                  | boolean? | symbol? | string?      ##### L3
*/
const isPrimitiveOp = (x) => ["+", "-", "*", "/", ">", "<", "=", "not", "and", "or",
    "eq?", "string=?", "cons", "car", "cdr", "list", "pair?",
    "number?", "boolean?", "symbol?", "string?"].includes(x);
const isSpecialForm = (x) => ["if", "lambda", "let", "let*", "quote"].includes(x);
const parseAppExp = (op, params) => (0, result_1.bind)((0, exports.parseL31CExp)(op), (rator) => (0, result_1.mapv)((0, result_1.mapResult)(exports.parseL31CExp, params), (rands) => (0, exports.makeAppExp)(rator, rands)));
const parseIfExp = (params) => params.length !== 3 ? (0, result_1.makeFailure)("Expression not of the form (if <cexp> <cexp> <cexp>)") :
    (0, result_1.mapv)((0, result_1.mapResult)(exports.parseL31CExp, params), (cexps) => (0, exports.makeIfExp)(cexps[0], cexps[1], cexps[2]));
const parseProcExp = (vars, body) => (0, type_predicates_1.isArray)(vars) && (0, list_1.allT)(type_predicates_1.isString, vars) ? (0, result_1.mapv)((0, result_1.mapResult)(exports.parseL31CExp, body), (cexps) => (0, exports.makeProcExp)((0, ramda_1.map)(exports.makeVarDecl, vars), cexps)) :
    (0, result_1.makeFailure)(`Invalid vars for ProcExp`);
const isGoodBindings = (bindings) => (0, type_predicates_1.isArray)(bindings) &&
    (0, list_1.allT)(type_predicates_1.isArray, bindings) &&
    (0, list_1.allT)(type_predicates_1.isIdentifier, (0, ramda_1.map)(list_1.first, bindings));
const parseLetExp = (bindings, body) => {
    if (!isGoodBindings(bindings)) {
        return (0, result_1.makeFailure)('Malformed bindings in "let" expression');
    }
    // Given (letrec ( (var <val>) ...) <cexp> ...)
    // Return makeLetExp( [makeBinding(var, parse(<val>)) ...], [ parse(<cexp>) ...] )
    // After isGoodBindings, bindings has type [string, Sexp][]
    const vars = (0, ramda_1.map)(b => b[0], bindings);
    const valsResult = (0, result_1.mapResult)(exports.parseL31CExp, (0, ramda_1.map)(list_1.second, bindings));
    const bindingsResult = (0, result_1.mapv)(valsResult, (vals) => (0, ramda_1.zipWith)(exports.makeBinding, vars, vals));
    return (0, result_1.bind)(bindingsResult, (bindings) => (0, result_1.mapv)((0, result_1.mapResult)(exports.parseL31CExp, body), (body) => (0, exports.makeLetExp)(bindings, body)));
};
const parseLetPlusExp = (bindings, body) => {
    if (!isGoodBindings(bindings)) {
        return (0, result_1.makeFailure)('Malformed bindings in "let" expression');
    }
    // Given (letrec ( (var <val>) ...) <cexp> ...)
    // Return makeLetExp( [makeBinding(var, parse(<val>)) ...], [ parse(<cexp>) ...] )
    // After isGoodBindings, bindings has type [string, Sexp][]
    const vars = (0, ramda_1.map)(b => b[0], bindings);
    const valsResult = (0, result_1.mapResult)(exports.parseL31CExp, (0, ramda_1.map)(list_1.second, bindings));
    const bindingsResult = (0, result_1.mapv)(valsResult, (vals) => (0, ramda_1.zipWith)(exports.makeBinding, vars, vals));
    return (0, result_1.bind)(bindingsResult, (bindings) => (0, result_1.mapv)((0, result_1.mapResult)(exports.parseL31CExp, body), (body) => (0, exports.makeLetPlusExp)(bindings, body)));
};
// sexps has the shape (quote <sexp>)
const parseLitExp = (param) => (0, result_1.mapv)((0, exports.parseSExp)(param), (sexp) => (0, exports.makeLitExp)(sexp));
exports.parseLitExp = parseLitExp;
const isDottedPair = (sexps) => sexps.length === 3 &&
    sexps[1] === ".";
exports.isDottedPair = isDottedPair;
const makeDottedPair = (sexps) => (0, result_1.bind)((0, exports.parseSExp)(sexps[0]), (val1) => (0, result_1.mapv)((0, exports.parseSExp)(sexps[2]), (val2) => (0, L3_value_1.makeCompoundSExp)(val1, val2)));
exports.makeDottedPair = makeDottedPair;
// x is the output of p (sexp parser)
const parseSExp = (sexp) => sexp === "#t" ? (0, result_1.makeOk)(true) :
    sexp === "#f" ? (0, result_1.makeOk)(false) :
        (0, type_predicates_1.isString)(sexp) && (0, type_predicates_1.isNumericString)(sexp) ? (0, result_1.makeOk)(+sexp) :
            (0, parser_1.isSexpString)(sexp) ? (0, result_1.makeOk)(sexp.toString()) :
                (0, type_predicates_1.isString)(sexp) ? (0, result_1.makeOk)((0, L3_value_1.makeSymbolSExp)(sexp)) :
                    sexp.length === 0 ? (0, result_1.makeOk)((0, L3_value_1.makeEmptySExp)()) :
                        (0, exports.isDottedPair)(sexp) ? (0, exports.makeDottedPair)(sexp) :
                            (0, type_predicates_1.isArray)(sexp) ? (
                            // fail on (x . y z)
                            sexp[0] === '.' ? (0, result_1.makeFailure)("Bad dotted sexp: " + sexp) :
                                (0, result_1.bind)((0, exports.parseSExp)((0, list_1.first)(sexp)), (val1) => (0, result_1.mapv)((0, exports.parseSExp)((0, list_1.rest)(sexp)), (val2) => (0, L3_value_1.makeCompoundSExp)(val1, val2)))) :
                                sexp;
exports.parseSExp = parseSExp;
// ==========================================================================
// Unparse: Map an AST to a concrete syntax string.
const L3_value_2 = require("../imp/L3-value");
// Add a quote for symbols, empty and compound sexp - strings and numbers are not quoted.
const unparseLitExp = (le) => (0, L3_value_2.isEmptySExp)(le.val) ? `'()` :
    (0, L3_value_2.isSymbolSExp)(le.val) ? `'${(0, L3_value_1.valueToString)(le.val)}` :
        (0, L3_value_2.isCompoundSExp)(le.val) ? `'${(0, L3_value_1.valueToString)(le.val)}` :
            `${le.val}`;
const unparseLExps = (les) => (0, ramda_1.map)(exports.unparseL31, les).join(" ");
const unparseProcExp = (pe) => `(lambda (${(0, ramda_1.map)((p) => p.var, pe.args).join(" ")}) ${unparseLExps(pe.body)})`;
const unparseLetExp = (le) => `(let (${(0, ramda_1.map)((b) => `(${b.var.var} ${(0, exports.unparseL31)(b.val)})`, le.bindings).join(" ")}) ${unparseLExps(le.body)})`;
const unparseLetPlusExp = (le) => `(let* (${(0, ramda_1.map)((b) => `(${b.var.var} ${(0, exports.unparseL31)(b.val)})`, le.bindings).join(" ")}) ${unparseLExps(le.body)})`;
const unparseL31 = (exp) => (0, exports.isBoolExp)(exp) ? (0, L3_value_1.valueToString)(exp.val) :
    (0, exports.isNumExp)(exp) ? (0, L3_value_1.valueToString)(exp.val) :
        (0, exports.isStrExp)(exp) ? (0, L3_value_1.valueToString)(exp.val) :
            (0, exports.isLitExp)(exp) ? unparseLitExp(exp) :
                (0, exports.isVarRef)(exp) ? exp.var :
                    (0, exports.isProcExp)(exp) ? unparseProcExp(exp) :
                        (0, exports.isIfExp)(exp) ? `(if ${(0, exports.unparseL31)(exp.test)} ${(0, exports.unparseL31)(exp.then)} ${(0, exports.unparseL31)(exp.alt)})` :
                            (0, exports.isAppExp)(exp) ? `(${(0, exports.unparseL31)(exp.rator)} ${unparseLExps(exp.rands)})` :
                                (0, exports.isPrimOp)(exp) ? exp.op :
                                    (0, exports.isLetExp)(exp) ? unparseLetExp(exp) :
                                        (0, exports.isLetPlusExp)(exp) ? unparseLetPlusExp(exp) :
                                            (0, exports.isDefineExp)(exp) ? `(define ${exp.var.var} ${(0, exports.unparseL31)(exp.val)})` :
                                                (0, exports.isProgram)(exp) ? `(L31 ${unparseLExps(exp.exps)})` :
                                                    exp;
exports.unparseL31 = unparseL31;
