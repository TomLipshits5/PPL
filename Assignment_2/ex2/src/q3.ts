import {
    AppExp, ProcExp,
    Binding, LetExp,
    CExp, DefineExp,
    Exp, IfExp, Program,
    isAppExp, isAtomicExp, isCExp, isDefineExp, isExp,
    isIfExp, isLetPlusExp, isLitExp, isProcExp, isProgram,
    makeAppExp, makeDefineExp, makeIfExp,
    makeLetExp, makeProcExp, makeProgram,
} from "./L31-ast";
import {Result, makeOk} from "../shared/result";
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
    isDefineExp(exp) ? reWriteAllLetPlusDefineExp(exp):
    exp

const reWriteAllLetPlusDefineExp = (exp: DefineExp): DefineExp => makeDefineExp(exp.var, reWriteAllLetCExp(exp.val))
const reWriteAllLetPlusIfExp = (exp: IfExp): IfExp => makeIfExp(reWriteAllLetCExp(exp.test),reWriteAllLetCExp(exp.then),reWriteAllLetCExp(exp.alt))
const reWriteAllLetPlusAppExp = (exp: AppExp):AppExp => makeAppExp(reWriteAllLetCExp(exp.rator), map(reWriteAllLetCExp, exp.rands))
const reWriteAllLetPlusProcExp = (exp: ProcExp):ProcExp => makeProcExp(exp.args, map(reWriteAllLetCExp, exp.body))

const reWriteAllLetCExp = (exp: CExp): CExp =>
    isAtomicExp(exp) ? exp:
    isLitExp(exp) ? exp:
    isIfExp(exp) ? reWriteAllLetPlusIfExp(exp):
    isAppExp(exp) ? reWriteAllLetPlusAppExp(exp):
    isProcExp(exp) ? reWriteAllLetPlusProcExp(exp):
    isLetPlusExp(exp) ? reWriteAllLetPlusExp(exp.bindings, exp.body):
    exp



const reWriteAllLetPlusExp = (bindings:Binding[], body: CExp[]):LetExp =>
    bindings.length == 1 ? makeLetExp(bindings,body) :
    makeLetExp([bindings[0]], [reWriteAllLetPlusExp(bindings.slice(1), body)])


