"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameExps = exports.makeVarGen = exports.substitute = void 0;
const ramda_1 = require("ramda");
const L3_ast_1 = require("./L3-ast");
const L3_ast_2 = require("./L3-ast");
const list_1 = require("../shared/list");
// For applicative eval - the type of exps should be ValueExp[] | VarRef[];
// where ValueExp is an expression which directly encodes a value:
// export type ValueExp = LitExp | NumExp | BoolExp | StrExp | PrimOp;
// In order to support normal eval as well - we generalize the types to CExp.
// @Pre: vars and exps have the same length
const substitute = (body, vars, exps) => {
    const subVarRef = (e) => {
        const pos = (0, ramda_1.indexOf)(e.var, vars);
        return ((pos > -1) ? exps[pos] : e);
    };
    const subProcExp = (e) => {
        const argNames = (0, ramda_1.map)((x) => x.var, e.args);
        const subst = (0, ramda_1.zip)(vars, exps);
        const freeSubst = (0, ramda_1.filter)((ve) => !(0, ramda_1.includes)((0, list_1.first)(ve), argNames), subst);
        return (0, L3_ast_2.makeProcExp)(e.args, (0, exports.substitute)(e.body, (0, ramda_1.map)((x) => x[0], freeSubst), (0, ramda_1.map)((x) => x[1], freeSubst)));
    };
    const sub = (e) => (0, L3_ast_1.isNumExp)(e) ? e :
        (0, L3_ast_1.isBoolExp)(e) ? e :
            (0, L3_ast_1.isPrimOp)(e) ? e :
                (0, L3_ast_1.isLitExp)(e) ? e :
                    (0, L3_ast_1.isStrExp)(e) ? e :
                        (0, L3_ast_1.isVarRef)(e) ? subVarRef(e) :
                            (0, L3_ast_1.isIfExp)(e) ? (0, L3_ast_2.makeIfExp)(sub(e.test), sub(e.then), sub(e.alt)) :
                                (0, L3_ast_1.isProcExp)(e) ? subProcExp(e) :
                                    (0, L3_ast_1.isAppExp)(e) ? (0, L3_ast_2.makeAppExp)(sub(e.rator), (0, ramda_1.map)(sub, e.rands)) :
                                        e;
    return (0, ramda_1.map)(sub, body);
};
exports.substitute = substitute;
/*
    Purpose: create a generator of new symbols of the form v__n
    with n incremented at each call.
*/
const makeVarGen = () => {
    let count = 0;
    return (v) => {
        count++;
        return `${v}__${count}`;
    };
};
exports.makeVarGen = makeVarGen;
/*
Purpose: Consistently rename bound variables in 'exps' to fresh names.
         Start numbering at 1 for all new var names.
*/
const renameExps = (exps) => {
    const varGen = (0, exports.makeVarGen)();
    const replace = (e) => (0, L3_ast_1.isIfExp)(e) ? (0, L3_ast_2.makeIfExp)(replace(e.test), replace(e.then), replace(e.alt)) :
        (0, L3_ast_1.isAppExp)(e) ? (0, L3_ast_2.makeAppExp)(replace(e.rator), (0, ramda_1.map)(replace, e.rands)) :
            (0, L3_ast_1.isProcExp)(e) ? replaceProc(e) :
                e;
    // Rename the params and substitute old params with renamed ones.
    //  First recursively rename all ProcExps inside the body.
    const replaceProc = (e) => {
        const oldArgs = (0, ramda_1.map)((arg) => arg.var, e.args);
        const newArgs = (0, ramda_1.map)(varGen, oldArgs);
        const newBody = (0, ramda_1.map)(replace, e.body);
        return (0, L3_ast_2.makeProcExp)((0, ramda_1.map)(L3_ast_2.makeVarDecl, newArgs), (0, exports.substitute)(newBody, oldArgs, (0, ramda_1.map)(L3_ast_2.makeVarRef, newArgs)));
    };
    return (0, ramda_1.map)(replace, exps);
};
exports.renameExps = renameExps;
