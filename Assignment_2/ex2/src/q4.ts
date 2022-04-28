import {BoolExp, Exp, Program, CExp, isProgram, isDefineExp, AppExp} from '../imp/L3-ast';
import {Result, makeFailure, makeOk, isOk, mapResult} from '../shared/result';
import {
    Binding,
    IfExp, isAppExp,
    isBoolExp, isIfExp, isLetExp,
    isNumExp,
    isPrimOp, isProcExp,
    isStrExp,
    isVarRef, LetExp, makeAppExp, makeProcExp,
    NumExp,
    PrimOp, ProcExp,
    StrExp,
    VarDecl,
    VarRef
} from "./L31-ast";
import {valueToString} from "../imp/L3-value";
import {map, not} from "ramda";

/*
Purpose: Transform L3 AST to JavaScript program string
Signature: l30ToJS(l2AST)
Type: [EXP | Program] => Result<string>
*/
export const l30ToJS = (exp: Exp | Program): Result<string>  => 
    isBoolExp(exp) ? makeOk(convertBoolToJS(exp)):
    isNumExp(exp) ? makeOk(convertNumToJS(exp)):
    isStrExp(exp) ? makeOk(convertStringToJS(exp)):
    isVarRef(exp) ? makeOk(exp.var):
    isPrimOp(exp) ? makeOk(convertPrimOpToJS(exp)):
    isIfExp(exp) ? makeOk(convertIfExpToJs(exp)):
    isAppExp(exp) ? makeOk(`(${l30ToJS(exp.rator)} ${convertLExpToJS(exp.rands)})`):
    isDefineExp(exp) ? makeOk(`const ${exp.var.var} = ${l30ToJS(exp.val)}`):
    isLetExp(exp) ? l30ToJS(rewriteLet(exp)):
    isProcExp(exp) ? makeOk(convertProcExpToJS(exp)):
    isProgram(exp) ? makeOk(convertLExpToJS(exp.exps)): //TODO: ask about progrm in js formation
    makeFailure("shit")


const convertBoolToJS = (bool: BoolExp): string => bool.val  ? "true" : "false";
const convertNumToJS = (num: NumExp): string => num.val.toString()
const convertStringToJS = (str: StrExp): string => str.val
const convertPrimOpToJS = (op: PrimOp): string =>
    op.op === "boolean?" ? "((x) => (typeof(x) === boolean))" :
    op.op === "symbol?" ? "((x) => (typeof (x) === symbol))" :
    op.op === "string?" ? "((x) => (typeof (x) === string))" :
    op.op === "number?" ? "((x) => (typeof (x) === number))" :
    op.op === "string=?" ? "((x, y) => (typeof (x) === string && typeof(y) === string ? x.localCompare(y) === 0 : false)" :
    op.op === "=" || op.op === "eq?" ? "===" :
    op.op === "not" ? "not" :
    op.op === "and" ? "&&" :
    op.op === "or" ? "||" :
    op.op


// @ts-ignore
//TODO: remove amd solve ts ignore
const convertIfExpToJs = (exp: IfExp): string => `(${convertResultToString(l30ToJS(exp.test))} ? ${convertResultToString(l30ToJS(exp.then))} : ${convertResultToString(l30ToJS(exp.alt))}`
const convertResultToString = (res: Result<string>): string => isOk(res) ? res.value : res.message
const convertLExpToJS = (les: Exp[]): string => map(l30ToJS, les).join(" ")
// @ts-ignore
//TODO: remove amd solve ts ignore
const convertProcExpToJS = (pe: ProcExp):string => `(${map((p:VarDecl)=>p.var,pe.args)}) => ${convertLExpToJS(pe.body)}`
const rewriteLet = (e: LetExp): AppExp => {
    const vars = map((b: Binding) => b.var, e.bindings);
    const vals = map((b: Binding) => b.val, e.bindings);
    return <AppExp>makeAppExp(makeProcExp(vars, e.body), vals);
}

