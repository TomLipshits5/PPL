"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.l30ToJS = void 0;
const result_1 = require("../shared/result");
const L31_ast_1 = require("./L31-ast");
const L3_value_1 = require("../imp/L3-value");
const ramda_1 = require("ramda");
/*
Purpose: Transform L3 AST to JavaScript program string
Signature: l30ToJS(l2AST)
Type: [EXP | Program] => Result<string>
*/
const l30ToJS = (exp) => (0, result_1.makeOk)(l30ToJSString(exp));
exports.l30ToJS = l30ToJS;
const l30ToJSString = (exp) => (0, L31_ast_1.isBoolExp)(exp) ? convertBoolToJS(exp) :
    (0, L31_ast_1.isNumExp)(exp) ? convertNumToJS(exp) :
        (0, L31_ast_1.isStrExp)(exp) ? convertStringToJS(exp) :
            (0, L31_ast_1.isVarRef)(exp) ? exp.var :
                (0, L31_ast_1.isPrimOp)(exp) ? convertPrimOpToJS(exp) :
                    (0, L31_ast_1.isIfExp)(exp) ? convertIfExpToJs(exp) :
                        (0, L31_ast_1.isAppExp)(exp) ? convertAppExpToJS(exp) :
                            (0, L31_ast_1.isDefineExp)(exp) ? `const ${exp.var.var} = ${l30ToJSString(exp.val)}` :
                                (0, L31_ast_1.isLetExp)(exp) ? l30ToJSString(rewriteLet(exp)) :
                                    (0, L31_ast_1.isProcExp)(exp) ? convertProcExpToJS(exp) :
                                        (0, L31_ast_1.isLitExp)(exp) ? convertLitExpToJS(exp) :
                                            (0, L31_ast_1.isProgram)(exp) ? convertLExpToJS(exp.exps).join(";\n") :
                                                "";
const convertBoolToJS = (bool) => bool.val ? "true" : "false";
const convertNumToJS = (num) => num.val.toString();
const convertStringToJS = (str) => `"${str.val}"`;
const isSpecialPrimOp = (op) => op === "boolean?" || op === "symbol?" || op === "string?" || op === "number?" || op === "not";
const handelPrimOp = (exp) => (0, L31_ast_1.isPrimOp)(exp.rator) ?
    isSpecialPrimOp(exp.rator.op) ?
        exp.rator.op == "not" ? `(${convertPrimOpToJS(exp.rator)}${convertLExpToJS(exp.rands)})` :
            `(${convertPrimOpToJS(exp.rator)}(${convertLExpToJS(exp.rands)}))` :
        `(${convertLExpToJS(exp.rands).join(" " + convertPrimOpToJS(exp.rator) + " ")})` :
    "";
const convertPrimOpToJS = (op) => op.op === "boolean?" ? "((x) => (typeof(x) === boolean))" :
    op.op === "symbol?" ? "((x) => (typeof (x) === symbol))" :
        op.op === "string?" ? "((x) => (typeof (x) === string))" :
            op.op === "number?" ? "((x) => (typeof (x) === number))" :
                op.op === "=" || op.op === "eq?" || op.op === "string=?" ? "===" :
                    op.op === "not" ? "!" :
                        op.op === "and" ? "&&" :
                            op.op === "or" ? "||" :
                                op.op;
const convertIfExpToJs = (exp) => `(${l30ToJSString(exp.test)} ? ${l30ToJSString(exp.then)} : ${l30ToJSString(exp.alt)})`;
const convertLExpToJS = (les) => (0, ramda_1.map)(l30ToJSString, les);
const convertProcExpToJS = (pe) => `((${(0, ramda_1.map)((p) => p.var, pe.args)}) => ${convertLExpToJS(pe.body)})`;
const rewriteLet = (e) => {
    const vars = (0, ramda_1.map)((b) => b.var, e.bindings);
    const vals = (0, ramda_1.map)((b) => b.val, e.bindings);
    return (0, L31_ast_1.makeAppExp)((0, L31_ast_1.makeProcExp)(vars, e.body), vals);
};
const convertLitExpToJS = (exp) => `Symbol.for("${convertSExpValuetoJS(exp.val)}")`;
const convertSExpValuetoJS = (exp) => (0, L31_ast_1.isPrimOp)(exp) ? convertPrimOpToJS(exp) :
    (0, L3_value_1.isSymbolSExp)(exp) ? exp.val :
        typeof (exp) === "number" || typeof (exp) === "string" || typeof (exp) === "boolean" ? exp.toString() : "";
const convertAppExpToJS = (exp) => (0, L31_ast_1.isPrimOp)(exp.rator) ?
    handelPrimOp(exp) :
    (0, L31_ast_1.isProcExp)(exp.rator) ? `${convertProcExpToJS(exp.rator)}(${convertLExpToJS(exp.rands)})` :
        (0, L31_ast_1.isVarRef)(exp.rator) ? `${exp.rator.var}(${convertLExpToJS(exp.rands)})` : "never";
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
