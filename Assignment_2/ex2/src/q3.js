"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.L31ToL3 = void 0;
const L31_ast_1 = require("./L31-ast");
const result_1 = require("../shared/result");
const ramda_1 = require("ramda");
/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/
const L31ToL3 = (exp) => (0, result_1.makeOk)(L31toL3Program(exp));
exports.L31ToL3 = L31ToL3;
const L31toL3Program = (exp) => (0, L31_ast_1.isExp)(exp) ? reWriteAllLetExp(exp) :
    (0, L31_ast_1.isProgram)(exp) ? (0, L31_ast_1.makeProgram)((0, ramda_1.map)(reWriteAllLetExp, exp.exps)) :
        exp;
const reWriteAllLetExp = (exp) => (0, L31_ast_1.isCExp)(exp) ? reWriteAllLetCExp(exp) :
    (0, L31_ast_1.isDefineExp)(exp) ? reWriteAllLetPlusDefineExp(exp) :
        exp;
const reWriteAllLetPlusDefineExp = (exp) => (0, L31_ast_1.makeDefineExp)(exp.var, reWriteAllLetCExp(exp.val));
const reWriteAllLetPlusIfExp = (exp) => (0, L31_ast_1.makeIfExp)(reWriteAllLetCExp(exp.test), reWriteAllLetCExp(exp.then), reWriteAllLetCExp(exp.alt));
const reWriteAllLetPlusAppExp = (exp) => (0, L31_ast_1.makeAppExp)(reWriteAllLetCExp(exp.rator), (0, ramda_1.map)(reWriteAllLetCExp, exp.rands));
const reWriteAllLetPlusProcExp = (exp) => (0, L31_ast_1.makeProcExp)(exp.args, (0, ramda_1.map)(reWriteAllLetCExp, exp.body));
const reWriteAllLetCExp = (exp) => (0, L31_ast_1.isAtomicExp)(exp) ? exp :
    (0, L31_ast_1.isLitExp)(exp) ? exp :
        (0, L31_ast_1.isIfExp)(exp) ? reWriteAllLetPlusIfExp(exp) :
            (0, L31_ast_1.isAppExp)(exp) ? reWriteAllLetPlusAppExp(exp) :
                (0, L31_ast_1.isProcExp)(exp) ? reWriteAllLetPlusProcExp(exp) :
                    (0, L31_ast_1.isLetPlusExp)(exp) ? reWriteAllLetPlusExp(exp.bindings, exp.body) :
                        exp;
const reWriteAllLetPlusExp = (bindings, body) => bindings.length == 1 ? (0, L31_ast_1.makeLetExp)(bindings, body) :
    (0, L31_ast_1.makeLetExp)([bindings[0]], [reWriteAllLetPlusExp(bindings.slice(1), body)]);
