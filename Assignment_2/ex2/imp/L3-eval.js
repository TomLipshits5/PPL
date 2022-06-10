"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evalParse = exports.evalL3program = exports.evalSequence = exports.isTrueValue = void 0;
// L3-eval.ts
const ramda_1 = require("ramda");
const L3_ast_1 = require("./L3-ast");
const L3_ast_2 = require("./L3-ast");
const L3_ast_3 = require("./L3-ast");
const L3_ast_4 = require("./L3-ast");
const L3_env_1 = require("./L3-env");
const L3_value_1 = require("./L3-value");
const list_1 = require("../shared/list");
const type_predicates_1 = require("../shared/type-predicates");
const result_1 = require("../shared/result");
const substitute_1 = require("./substitute");
const evalPrimitive_1 = require("./evalPrimitive");
const parser_1 = require("../shared/parser");
// ========================================================
// Eval functions
const L3applicativeEval = (exp, env) => (0, L3_ast_2.isNumExp)(exp) ? (0, result_1.makeOk)(exp.val) :
    (0, L3_ast_2.isBoolExp)(exp) ? (0, result_1.makeOk)(exp.val) :
        (0, L3_ast_2.isStrExp)(exp) ? (0, result_1.makeOk)(exp.val) :
            (0, L3_ast_2.isPrimOp)(exp) ? (0, result_1.makeOk)(exp) :
                (0, L3_ast_2.isVarRef)(exp) ? (0, L3_env_1.applyEnv)(env, exp.var) :
                    (0, L3_ast_2.isLitExp)(exp) ? (0, result_1.makeOk)(exp.val) :
                        (0, L3_ast_2.isIfExp)(exp) ? evalIf(exp, env) :
                            (0, L3_ast_2.isProcExp)(exp) ? evalProc(exp, env) :
                                (0, L3_ast_2.isAppExp)(exp) ? (0, result_1.bind)(L3applicativeEval(exp.rator, env), (rator) => (0, result_1.bind)((0, result_1.mapResult)(param => L3applicativeEval(param, env), exp.rands), (rands) => L3applyProcedure(rator, rands, env))) :
                                    (0, L3_ast_1.isLetExp)(exp) ? (0, result_1.makeFailure)('"let" not supported (yet)') :
                                        exp;
const isTrueValue = (x) => !(x === false);
exports.isTrueValue = isTrueValue;
const evalIf = (exp, env) => (0, result_1.bind)(L3applicativeEval(exp.test, env), (test) => (0, exports.isTrueValue)(test) ? L3applicativeEval(exp.then, env) :
    L3applicativeEval(exp.alt, env));
const evalProc = (exp, env) => (0, result_1.makeOk)((0, L3_value_1.makeClosure)(exp.args, exp.body));
const L3applyProcedure = (proc, args, env) => (0, L3_ast_2.isPrimOp)(proc) ? (0, evalPrimitive_1.applyPrimitive)(proc, args) :
    (0, L3_value_1.isClosure)(proc) ? applyClosure(proc, args, env) :
        (0, result_1.makeFailure)("Bad procedure " + JSON.stringify(proc));
// Applications are computed by substituting computed
// values into the body of the closure.
// To make the types fit - computed values of params must be
// turned back in Literal Expressions that eval to the computed value.
const valueToLitExp = (v) => (0, type_predicates_1.isNumber)(v) ? (0, L3_ast_3.makeNumExp)(v) :
    (0, type_predicates_1.isBoolean)(v) ? (0, L3_ast_3.makeBoolExp)(v) :
        (0, type_predicates_1.isString)(v) ? (0, L3_ast_3.makeStrExp)(v) :
            (0, L3_ast_2.isPrimOp)(v) ? v :
                (0, L3_value_1.isClosure)(v) ? (0, L3_ast_3.makeProcExp)(v.params, v.body) :
                    (0, L3_ast_3.makeLitExp)(v);
const applyClosure = (proc, args, env) => {
    const vars = (0, ramda_1.map)((v) => v.var, proc.params);
    const body = (0, substitute_1.renameExps)(proc.body);
    const litArgs = (0, ramda_1.map)(valueToLitExp, args);
    return (0, exports.evalSequence)((0, substitute_1.substitute)(body, vars, litArgs), env);
};
// Evaluate a sequence of expressions (in a program)
const evalSequence = (seq, env) => (0, list_1.isEmpty)(seq) ? (0, result_1.makeFailure)("Empty sequence") :
    (0, L3_ast_2.isDefineExp)((0, list_1.first)(seq)) ? evalDefineExps((0, list_1.first)(seq), (0, list_1.rest)(seq), env) :
        evalCExps((0, list_1.first)(seq), (0, list_1.rest)(seq), env);
exports.evalSequence = evalSequence;
const evalCExps = (first, rest, env) => (0, L3_ast_1.isCExp)(first) && (0, list_1.isEmpty)(rest) ? L3applicativeEval(first, env) :
    (0, L3_ast_1.isCExp)(first) ? (0, result_1.bind)(L3applicativeEval(first, env), _ => (0, exports.evalSequence)(rest, env)) :
        (0, result_1.makeFailure)("Never");
// Eval a sequence of expressions when the first exp is a Define.
// Compute the rhs of the define, extend the env with the new binding
// then compute the rest of the exps in the new env.
const evalDefineExps = (def, exps, env) => (0, L3_ast_2.isDefineExp)(def) ? (0, result_1.bind)(L3applicativeEval(def.val, env), (rhs) => (0, exports.evalSequence)(exps, (0, L3_env_1.makeEnv)(def.var.var, rhs, env))) :
    (0, result_1.makeFailure)("Unexpected " + def);
// Main program
const evalL3program = (program) => (0, exports.evalSequence)(program.exps, (0, L3_env_1.makeEmptyEnv)());
exports.evalL3program = evalL3program;
const evalParse = (s) => (0, result_1.bind)((0, parser_1.parse)(s), (sexp) => (0, result_1.bind)((0, L3_ast_4.parseL3Exp)(sexp), (exp) => (0, exports.evalSequence)([exp], (0, L3_env_1.makeEmptyEnv)())));
exports.evalParse = evalParse;
