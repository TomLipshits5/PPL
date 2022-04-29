import {
    AppExp,
    Binding,
    CExp, DefineExp,
    Exp, IfExp, isAppExp, isAtomicExp, isCExp, isDefineExp,
    isExp, isIfExp, isLetExp,
    isLetPlusExp, isLitExp, isProcExp, isProgram,
    LetExp,
    LetPlusExp, makeAppExp, makeDefineExp, makeIfExp,
    makeLetExp,
    makeLetPlusExp, makeProcExp, makeProgram,
    parseL31, ProcExp,
    Program, unparseL31
} from "./L31-ast";
import {Result, makeFailure, makeOk, bind} from "../shared/result";
import {map} from "ramda"




/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/
export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> =>
    makeOk(L31toL3Program(exp));

const L31toL3Program = (exp: Exp | Program): Exp | Program =>
    isExp(exp) ? reWriteAllLetExp(exp) :
    isProgram(exp) ? makeProgram(map(reWriteAllLetExp, exp.exps)):
    exp


const reWriteAllLetExp = (exp: Exp):Exp =>
    isCExp(exp) ? reWriteAllLetCExp(exp):
    isDefineExp(exp) ? reWriteAllLetDefine(exp):
    exp

const reWriteAllLetDefine = (exp: DefineExp): DefineExp => makeDefineExp(exp.var, reWriteAllLetCExp(exp.val))
const reWriteAllLetIfExp = (exp: IfExp): IfExp => makeIfExp(reWriteAllLetCExp(exp.test),reWriteAllLetCExp(exp.then),reWriteAllLetCExp(exp.alt))
const reWriteAllLetAppExp = (exp: AppExp):AppExp => makeAppExp(reWriteAllLetCExp(exp.rator), map(reWriteAllLetCExp, exp.rands))
const reWriteAllLetProc = (exp: ProcExp):ProcExp => makeProcExp(exp.args, map(reWriteAllLetCExp, exp.body))
const reWriteAllLetCExp = (exp: CExp): CExp =>
    isAtomicExp(exp) ? exp:
    isLitExp(exp) ? exp:
    isIfExp(exp) ? reWriteAllLetIfExp(exp):
    isAppExp(exp) ? reWriteAllLetAppExp(exp):
    isProcExp(exp) ? reWriteAllLetProc(exp):
    isLetPlusExp(exp) ? convertLetPlusExpToLetExp(exp.bindings, exp.body):
    exp


const convertLetPlusExpToLetExp = (bindings:Binding[], body: CExp[]):LetExp =>
    bindings.length == 1 ? makeLetExp(bindings,body) :
    makeLetExp([bindings[0]], [convertLetPlusExpToLetExp(bindings.slice(1), body)])


