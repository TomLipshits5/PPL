import {BoolExp, Exp, Program, CExp, isProgram, isDefineExp, AppExp, parseL3Exp, parseL3} from '../imp/L3-ast';
import {Result, makeFailure, makeOk, isOk, mapResult, bind} from '../shared/result';
import {
    Binding,
    IfExp, isAppExp,
    isBoolExp, isCompoundExp, isIfExp, isLetExp, isLitExp,
    isNumExp,
    isPrimOp, isProcExp,
    isStrExp,
    isVarRef, LetExp, LitExp, makeAppExp, makeProcExp,
    NumExp,
    PrimOp, ProcExp,
    StrExp,
    VarDecl,
    VarRef
} from "./L31-ast";
import {isClosure, isEmptySExp, isSymbolSExp, SExpValue, valueToString} from "../imp/L3-value";
import {map, not, of} from "ramda";
import { parse as p, isSexpString, isToken } from "../shared/parser";

/*
Purpose: Transform L3 AST to JavaScript program string
Signature: l30ToJS(l2AST)
Type: [EXP | Program] => Result<string>
*/
export const l30ToJS = (exp: Exp | Program): Result<string>  =>
    makeOk(l30tojsString(exp))

const l30tojsString = (exp: Exp | Program): string =>
    isBoolExp(exp) ? convertBoolToJS(exp):
    isNumExp(exp) ? convertNumToJS(exp):
    isStrExp(exp) ? convertStringToJS(exp):
    isVarRef(exp) ? exp.var:
    isPrimOp(exp) ? convertPrimOpToJS(exp):
    isIfExp(exp) ? convertIfExpToJs(exp):
    isAppExp(exp) ? convertAppExpToJS(exp):
    isDefineExp(exp) ? `const ${exp.var.var} = ${l30tojsString(exp.val)}`:
    isLetExp(exp) ? l30tojsString(rewriteLet(exp)):
    isProcExp(exp) ? convertProcExpToJS(exp):
    isLitExp(exp) ? convertLitExpToJS(exp):
    isProgram(exp) ? convertLExpToJS(exp.exps).join(";\n"):
    "shit"


const convertBoolToJS = (bool: BoolExp): string => bool.val  ? "true" : "false";
const convertNumToJS = (num: NumExp): string => num.val.toString()
const convertStringToJS = (str: StrExp): string => `"${str.val}"`
const isSpecialPrimOp = (op: string):boolean => op === "boolean?"||op === "symbol?"||op === "string?"||op === "number?"||op === "not"
const handelPrimOp = (exp: AppExp):string =>isPrimOp(exp.rator) ?
    isSpecialPrimOp(exp.rator.op) ?
    exp.rator.op == "not" ? `(${convertPrimOpToJS(exp.rator)}${convertLExpToJS(exp.rands)})`:
    `(${convertPrimOpToJS(exp.rator)}(${convertLExpToJS(exp.rands)}))`:
    `(${convertLExpToJS(exp.rands).join(" "+convertPrimOpToJS(exp.rator)+" ")})`:
    ""


const convertPrimOpToJS = (op: PrimOp): string =>
    op.op === "boolean?" ? "((x) => (typeof(x) === boolean))" :
    op.op === "symbol?" ? "((x) => (typeof (x) === symbol))" :
    op.op === "string?" ? "((x) => (typeof (x) === string))" :
    op.op === "number?" ? "((x) => (typeof (x) === number))" :
    op.op === "=" || op.op === "eq?" || op.op === "string=?" ? "===" :
    op.op === "not" ? "!" :
    op.op === "and" ? "&&" :
    op.op === "or" ? "||" :
    op.op


// @ts-ignore
//TODO: remove amd solve ts ignore
const convertIfExpToJs = (exp: IfExp): string => `(${(l30tojsString(exp.test))} ? ${(l30tojsString(exp.then))} : ${(l30tojsString(exp.alt))})`
const convertResultToString = (res: Result<string>): string => isOk(res) ? res.value : res.message
const convertLExpToJS = (les: Exp[]): string[] => map(l30tojsString, les)
// @ts-ignore
//TODO: remove amd solve ts ignore
const convertProcExpToJS = (pe: ProcExp):string => `((${map((p:VarDecl)=>p.var,pe.args)}) => ${convertLExpToJS(pe.body)})`
const rewriteLet = (e: LetExp): AppExp => {
    const vars = map((b: Binding) => b.var, e.bindings);
    const vals = map((b: Binding) => b.val, e.bindings);
    return <AppExp>makeAppExp(makeProcExp(vars, e.body), vals);
}
const convertLitExpToJS = (exp: LitExp): string => `Symbol.for("${convertSExpValuetoJS(exp.val)}")`
const convertSExpValuetoJS = (exp: SExpValue): string =>
    isPrimOp(exp) ? convertPrimOpToJS(exp) :
    isSymbolSExp(exp) ? exp.val :
    typeof(exp) === "number" ||typeof(exp) === "string" ||typeof(exp) === "boolean" ? exp.toString(): ""



const convertAppExpToJS = (exp:AppExp):string => isPrimOp(exp.rator) ?
    handelPrimOp(exp):
    isProcExp(exp.rator) ? `${convertProcExpToJS(exp.rator)}(${convertLExpToJS(exp.rands)})`:
    isVarRef(exp.rator) ? `${exp.rator.var}(${convertLExpToJS(exp.rands)})`: "weird app expretion"


//TODO delete from here

// const convertToAst =  (x: string):Result<Exp> => bind(p(x), parseL3Exp);
// const convertToAstProg =  ():Result<Program> => parseL3(`(L3 (define b (> 3 4)) (define x 5) (define f (lambda (y) (+ x y))) (define g (lambda (y) (* x y))) (if (not b) (f 3) (g 4)) ((lambda (x) (* x x)) 7))`);
// function testCase(str: string){
//     let exp =convertToAst(str)
//     console.log(exp)
//     let res = isOk(exp) ? l30ToJS(exp.value):exp
//     console.log(isOk(res) ? `this is good: ${res.value}`:res)
// }
//
// let cases = [`'a`]
// for (let index in cases){
//     testCase(cases[index])
// }

// function testProg(){
//     let exp = convertToAstProg()
//     console.log(exp)
//     let res = isOk(exp) ? l30ToJS(exp.value):exp
//     console.log(isOk(res) ? `this is good: ${res.value}`:res)
// }
// testProg()