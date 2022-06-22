// L5-typecheck
// ========================================================
import {equals, filter, flatten, init, intersection, map, reduce, zipWith} from 'ramda';
import {
    AppExp,
    BoolExp,
    CaseExp,
    DefineExp,
    DefineTypeExp,
    Exp,
    IfExp,
    isAppExp,
    isBoolExp,
    isDefineExp,
    isDefineTypeExp,
    isIfExp,
    isLetExp,
    isLetrecExp,
    isLitExp,
    isNumExp,
    isPrimOp,
    isProcExp,
    isProgram,
    isSetExp,
    isStrExp,
    isTypeCaseExp,
    isVarRef,
    LetExp,
    LetrecExp,
    LitExp, makeAppExp,
    NumExp,
    Parsed,
    parseL51,
    PrimOp,
    ProcExp,
    Program,
    SetExp,
    StrExp,
    TypeCaseExp,
    unparse,
    VarDecl
} from "./L5-ast";
import {applyTEnv, makeEmptyTEnv, makeExtendTEnv, TEnv} from "./TEnv";
import {
    BoolTExp,
    Field,
    isAnyTExp,
    isBoolTExp,
    isNumTExp,
    isProcTExp,
    isRecord,
    isStrTExp,
    isUserDefinedNameTExp,
    isUserDefinedTExp,
    isVoidTExp,
    makeAnyTExp,
    makeBoolTExp,
    makeNumTExp,
    makeProcTExp,
    makeStrTExp,
    makeUserDefinedNameTExp,
    makeVoidTExp,
    NumTExp,
    parseTE,
    Record,
    StrTExp,
    TExp,
    UDTExp,
    unparseTExp,
    UserDefinedTExp,
    VoidTExp
} from "./TExp";
import {allT, cons, first, isEmpty, rest} from '../shared/list';
import {
    bind,
    either,
    isFailure,
    isOk,
    makeFailure,
    makeOk,
    mapResult,
    mapv,
    Result,
    zipWithResult
} from '../shared/result';
import {Closure, CompoundSExp, isClosure, isEmptySExp, isSymbolSExp, SExpValue, valueToString} from "./L5-value";
import {isCompoundSexp} from "../shared/parser";

// L51
export const getTypeDefinitions = (p: Program): UserDefinedTExp[] => {
    const iter = (head: Exp, tail: Exp[]): UserDefinedTExp[] =>
        isEmpty(tail) && isDefineTypeExp(head) ? [head.udType] :
        isEmpty(tail) ? [] :
        isDefineTypeExp(head) ? cons(head.udType, iter(first(tail), rest(tail))) :
        iter(first(tail), rest(tail));
    return isEmpty(p.exps) ? [] :
        iter(first(p.exps), rest(p.exps));
}

// L51
export const getDefinitions = (p: Program): DefineExp[] => {
    const iter = (head: Exp, tail: Exp[]): DefineExp[] =>
        isEmpty(tail) && isDefineExp(head) ? [head] :
        isEmpty(tail) ? [] :
        isDefineExp(head) ? cons(head, iter(first(tail), rest(tail))) :
        iter(first(tail), rest(tail));
    return isEmpty(p.exps) ? [] :
        iter(first(p.exps), rest(p.exps));
}

// L51
export const getRecords = (p: Program): Record[] =>
    flatten(map((ud: UserDefinedTExp) => ud.records, getTypeDefinitions(p)));

// L51
export const getItemByName = <T extends {typeName: string}>(typeName: string, items: T[]): Result<T> =>
    isEmpty(items) ? makeFailure(`${typeName} not found`) :
    first(items).typeName === typeName ? makeOk(first(items)) :
    getItemByName(typeName, rest(items));

// L51
export const getUserDefinedTypeByName = (typeName: string, p: Program): Result<UserDefinedTExp> =>
    getItemByName(typeName, getTypeDefinitions(p));

// L51
export const getRecordByName = (typeName: string, p: Program): Result<Record> =>
    getItemByName(typeName, getRecords(p));

// L51
// Given the name of record, return the list of UD Types that contain this record as a case.
export const getRecordParents = (typeName: string, p: Program): UserDefinedTExp[] =>
    filter((ud: UserDefinedTExp): boolean => map((rec: Record) => rec.typeName, ud.records).includes(typeName),
        getTypeDefinitions(p));


// L51
// Given a user defined type name, return the Record or UD Type which it names.
// (Note: TS fails to type check either in this case)
export const getTypeByName = (typeName: string, p: Program): Result<UDTExp> => {
    const ud = getUserDefinedTypeByName(typeName, p);
    if (isFailure(ud)) {
        return getRecordByName(typeName, p);
    } else {
        return ud;
    }
}

// TODO L51
// Is te1 a subtype of te2?
const isSubType = (te1: TExp, te2: TExp, p: Program): boolean => {
    if(isAnyTExp(te2)) return true
    if (isUserDefinedNameTExp(te2) && isUserDefinedNameTExp(te1)) {
        const userTypeRes = getUserDefinedTypeByName(te2.typeName, p);
        if (isOk(userTypeRes)){
            const userType = userTypeRes.value
            for (const parent of getRecordParents(te1.typeName, p)){
                if (parent.typeName == userType.typeName){
                    return true
                }
            }
        }
    }
    return equals(te1, te2)
}




// TODO L51: Change this definition to account for user defined types
// Purpose: Check that the computed type te1 can be accepted as an instance of te2
// test that te1 is either the same as te2 or more specific
// Deal with case of user defined type names 
// Exp is only passed for documentation purposes.
// p is passed to provide the context of all user defined types
export const checkEqualType = (te1: TExp, te2: TExp, exp: Exp, p: Program): Result<TExp> =>
  equals(te1, te2) ? makeOk(te2) :
  isSubType(te1, te2, p) ?  makeOk(te2) :
  makeFailure(`Incompatible types: ${te1} and ${te2} in ${exp}`);


// L51
// Return te and its parents in type hierarchy to compute type cover
// Return type names (not their definition)
export const getParentsType = (te: TExp, p: Program): TExp[] =>
    (isNumTExp(te) || isBoolTExp(te) || isStrTExp(te) || isVoidTExp(te) || isAnyTExp(te)) ? [te] :
    isProcTExp(te) ? [te] :
    isUserDefinedTExp(te) ? [te] :
    isRecord(te) ? getParentsType(makeUserDefinedNameTExp(te.typeName), p) :
    isUserDefinedNameTExp(te) ?
        either(getUserDefinedTypeByName(te.typeName, p),
                (ud: UserDefinedTExp) => [makeUserDefinedNameTExp(ud.typeName)],
                (_) => either(getRecordByName(te.typeName, p),
                            (rec: Record) => cons(makeUserDefinedNameTExp(rec.typeName), 
                                                  map((ud) => makeUserDefinedNameTExp(ud.typeName), 
                                                      getRecordParents(rec.typeName, p))),
                            (_) => [])) : 
    [];


// L51
// Get the list of types that cover all ts in types.
export const coverTypes = (types: TExp[], p: Program): TExp[] =>  {
    // [[p11, p12], [p21], [p31, p32]] --> types in intersection of all lists
    const parentsList : TExp[][] = map((t) => getParentsType(t,p), types);
    return reduce<TExp[], TExp[]>(intersection, first(parentsList), rest(parentsList));
}

// Return the most specific in a list of TExps
// For example given UD(R1, R2):
// - mostSpecificType([R1, R2, UD]) = R1 (choses first out of record level)
// - mostSpecificType([R1, number]) = number  
export const mostSpecificType = (types: TExp[], p: Program): TExp =>
    reduce((min: TExp, element: TExp) => isSubType(element, min, p) ? element : min, 
            makeAnyTExp(),
            types);

// L51
// Check that all t in types can be covered by a single parent type (not by 'any')
// Return most specific parent
export const checkCoverType = (types: TExp[], p: Program): Result<TExp> => {
    const cover = coverTypes(types, p);
    return isEmpty(cover) ? makeFailure(`No type found to cover ${map((t) => JSON.stringify(unparseTExp(t), null, 2), types).join(" ")}`) :
    makeOk(mostSpecificType(cover, p));
}


// Compute the initial TEnv given user defined types
// =================================================
// TODO L51
// Construct type environment for the user-defined type induced functions
// Type constructor for all records
// Type predicate for all records
// Type predicate for all user-defined-types
// All globally defined variables (with define)

// TODO: Define here auxiliary functions for TEnv computation

const getRecordTypeFields = (fields: Field[]):TExp[] =>
    map((field: Field) => field.te, fields)

// TOODO L51
// Initialize TEnv with:
// * Type of global variables (define expressions at top level of p)
// * Type of implicitly defined procedures for user defined types (define-type expressions in p)

export const initTEnv = (p: Program): TEnv =>
        makeExtendTEnv(map((define: DefineExp): string =>
        define.var.var, getDefinitions(p)).concat(map((userDefine: UserDefinedTExp): string =>
        userDefine.typeName, getTypeDefinitions(p)), map((record: Record): string =>
        record.typeName, getRecords(p)), map((userDefineType: UserDefinedTExp): string =>
        userDefineType.typeName + "?", getTypeDefinitions(p)).concat(map((record: Record): string =>
        record.typeName + "?", getRecords(p)), map((record: Record): string =>
        "make-" + record.typeName, getRecords(p)))), map((define: DefineExp): TExp =>
        define.var.texp, getDefinitions(p)).concat(map((userDefine: UserDefinedTExp): TExp =>
        userDefine, getTypeDefinitions(p)), map((record: Record): TExp =>
        record, getRecords(p)), map((): TExp =>
        makeProcTExp([makeAnyTExp()], makeBoolTExp()), getTypeDefinitions(p)).concat(map((): TExp =>
        makeProcTExp([makeAnyTExp()], makeBoolTExp()), getRecords(p)), map((record: Record): TExp =>
        makeProcTExp(getRecordTypeFields(record.fields), makeUserDefinedNameTExp(record.typeName)), getRecords(p)))), makeEmptyTEnv())


const isRecursiveUserDefinedType = (userDefineType: UserDefinedTExp) =>
    filter((record: Record) => filter((field: Field) => isUserDefinedNameTExp(field.te) ? field.te.typeName === userDefineType.typeName : false, record.fields).length > 0, userDefineType.records).length > 0

const isThereBaseCase = (userDefinedType: UserDefinedTExp):boolean =>
    filter((record: Record) => record.fields.length == 0, userDefinedType.records).length > 0

const compareFields =  (f1:Field, f2:Field):boolean =>
    f1.fieldName === f2.fieldName ?
        isUserDefinedNameTExp(f1.te) && isUserDefinedNameTExp(f2.te) || isRecord(f1.te) && isRecord(f2.te) ? f1.te.typeName === f2.te.typeName :
            f1.te.tag === f2.te.tag : false

const compareRecords = (record1: Record, record2:Record):boolean =>
    (record1.fields.length == record2.fields.length) ? filter((field1:Field) => filter((field2:Field) => compareFields(field1, field2) ,record2.fields).length === 1  ,record1.fields).length === record1.fields.length : false

const checkDuplicateRecords = (p: Program):boolean => {
    for (const record1 of getRecords(p)){
        for(const record2 of getRecords(p)){
            if(record1.typeName === record2.typeName){
                if (!compareRecords(record1, record2)){
                    return false
                }
            }
        }
    }
    return true
}

const checkUserDefinedType = (userDefineType: UserDefinedTExp):boolean =>
    isRecursiveUserDefinedType(userDefineType) ?
        isThereBaseCase(userDefineType) : true

// Verify that user defined types and type-case expressions are semantically correct
// =================================================================================
// TODO L51
const checkAllUserDefinedTexp = (p: Program):boolean[] =>
    map((userDefineType: UserDefinedTExp) => checkUserDefinedType(userDefineType), getTypeDefinitions(p))

export const checkUserDefinedTypes = (p: Program): Result<true> =>
    // If the same type name is defined twice with different definitions
    // If a recursive type has no base case
    filter((bool: boolean) => !bool, checkAllUserDefinedTexp(p)).length === 0  && checkDuplicateRecords(p) ?
        makeOk(true) : makeFailure("not all user defined types are properly defined")

const checkTypeCaseRecordsCount = (mainType: Result<UserDefinedTExp>, cases: CaseExp[]):boolean =>
     isOk(mainType) ? filter((record: Record) => !map((caseExp: CaseExp) => caseExp.typeName, cases).includes(record.typeName), mainType.value.records).length == 0 : false


const isInCases = (typeName: string, cases: CaseExp[]):boolean =>
    map((caseExp: CaseExp) => caseExp.typeName, cases).includes(typeName)

const handleClassicTypeCase = (tc: TExp, p: Program, cases: CaseExp[]): Result<true> =>
    isUserDefinedTExp(tc) ? checkTypeCaseRecordsCount(getUserDefinedTypeByName(tc.typeName, p), cases) && checkAllRecords(getUserDefinedTypeByName(tc.typeName, p), cases) ?
            makeOk(true) : makeFailure("userDefined is not coverd") :
    isUserDefinedNameTExp(tc) ?
        isInCases(tc.typeName, cases) ?
            makeOk(true) :
            checkTypeCaseRecordsCount(getUserDefinedTypeByName(tc.typeName, p), cases) && checkAllRecords(getUserDefinedTypeByName(tc.typeName, p), cases) ?
                makeOk(true) :
                makeFailure(tc.typeName)  :
    makeFailure("")



const handleStupidRecordCase = (covers: TExp[], p: Program, cases:CaseExp[]):Result<true> =>
    filter((res: Result<true>) => isOk(res), map((ud: TExp) => handleClassicTypeCase(ud, p, cases), covers)).length === covers.length ?
        makeOk(true) : makeFailure("stupid record case failed")



const checkVarDecForRecord = (record: Record, caseExp: CaseExp):boolean =>
    record.fields.length == caseExp.varDecls.length

const checkAllRecords = (mainType: Result<UserDefinedTExp>, caseExps: CaseExp[]):boolean =>
    isOk(mainType) ? map((record: Record) => filter((cexp:CaseExp) => cexp.varDecls.length != record.fields.length , filter((caseExp: CaseExp) => caseExp.typeName === record.typeName, caseExps)) , mainType.value.records).flat().length == 0 : false

// TODO L51
const checkTypeCase = (tc: TypeCaseExp, p: Program): Result<true> =>
    bind(applyTEnv(initTEnv(p), tc.typeName), (texp: TExp) =>
        isRecord(texp) ? handleStupidRecordCase(getParentsType(texp, p), p, tc.cases) : handleClassicTypeCase(texp, p, tc.cases)
    )






// Compute the type of L5 AST exps to TE
// ===============================================
// Compute a Typed-L5 AST exp to a Texp on the basis
// of its structure and the annotations it contains.

// Purpose: Compute the type of a concrete fully-typed expression
export const L51typeofProgram = (concreteExp: string): Result<string> =>
    bind(parseL51(concreteExp), (p: Program) =>
        bind(checkUserDefinedTypes(p), () =>
            bind(typeofExp(p, initTEnv(p), p), unparseTExp)));

// For tests on a single expression - wrap the expression in a program
export const L51typeof = (concreteExp: string): Result<string> =>
    L51typeofProgram(`(L51 ${concreteExp})`);

// Purpose: Compute the type of an expression
// Traverse the AST and check the type according to the exp type.
// We assume that all variables and procedures have been explicitly typed in the program.
export const typeofExp = (exp: Parsed, tenv: TEnv, p: Program): Result<TExp> =>
    isNumExp(exp) ? makeOk(typeofNum(exp)) :
    isBoolExp(exp) ? makeOk(typeofBool(exp)) :
    isStrExp(exp) ? makeOk(typeofStr(exp)) :
    isPrimOp(exp) ? typeofPrim(exp) :
    isVarRef(exp) ? applyTEnv(tenv, exp.var) :
    isIfExp(exp) ? typeofIf(exp, tenv, p) :
    isProcExp(exp) ? typeofProc(exp, tenv, p) :
    isAppExp(exp) ? typeofApp(exp, tenv, p) :
    isLetExp(exp) ? typeofLet(exp, tenv, p) :
    isLetrecExp(exp) ? typeofLetrec(exp, tenv, p) :
    isDefineExp(exp) ? typeofDefine(exp, tenv, p) :
    isProgram(exp) ? typeofProgram(exp, tenv, p) :
    isSetExp(exp) ? typeofSet(exp, tenv, p) :
    isLitExp(exp) ? typeofLit(exp, tenv, p) :
    isDefineTypeExp(exp) ? typeofDefineType(exp, tenv, p) :
    isTypeCaseExp(exp) ? typeofTypeCase(exp, tenv, p) :
    makeFailure(`Unknown type: ${JSON.stringify(exp, null, 2)}`);

// Purpose: Compute the type of a sequence of expressions
// Check all the exps in a sequence - return type of last.
// Pre-conditions: exps is not empty.
export const typeofExps = (exps: Exp[], tenv: TEnv, p: Program): Result<TExp> =>
    isEmpty(rest(exps)) ? typeofExp(first(exps), tenv, p) :
    bind(typeofExp(first(exps), tenv, p), _ => typeofExps(rest(exps), tenv, p));

// a number literal has type num-te
export const typeofNum = (n: NumExp): NumTExp => makeNumTExp();

// a boolean literal has type bool-te
export const typeofBool = (b: BoolExp): BoolTExp => makeBoolTExp();

// a string literal has type str-te
const typeofStr = (s: StrExp): StrTExp => makeStrTExp();

// primitive ops have known proc-te types
const numOpTExp = parseTE('(number * number -> number)');
const numCompTExp = parseTE('(number * number -> boolean)');
const boolOpTExp = parseTE('(boolean * boolean -> boolean)');

// L51 Todo: cons, car, cdr, list
export const typeofPrim = (p: PrimOp): Result<TExp> =>
    (p.op === '+') ? numOpTExp :
    (p.op === '-') ? numOpTExp :
    (p.op === '*') ? numOpTExp :
    (p.op === '/') ? numOpTExp :
    (p.op === 'and') ? boolOpTExp :
    (p.op === 'or') ? boolOpTExp :
    (p.op === '>') ? numCompTExp :
    (p.op === '<') ? numCompTExp :
    (p.op === '=') ? numCompTExp :
    // Important to use a different signature for each op with a TVar to avoid capture
    (p.op === 'number?') ? parseTE('(T -> boolean)') :
    (p.op === 'boolean?') ? parseTE('(T -> boolean)') :
    (p.op === 'string?') ? parseTE('(T -> boolean)') :
    (p.op === 'list?') ? parseTE('(T -> boolean)') :
    (p.op === 'pair?') ? parseTE('(T -> boolean)') :
    (p.op === 'symbol?') ? parseTE('(T -> boolean)') :
    (p.op === 'not') ? parseTE('(boolean -> boolean)') :
    (p.op === 'eq?') ? parseTE('(T1 * T2 -> boolean)') :
    (p.op === 'string=?') ? parseTE('(T1 * T2 -> boolean)') :
    (p.op === 'display') ? parseTE('(T -> void)') :
    (p.op === 'newline') ? parseTE('(Empty -> void)') :
    makeFailure(`Primitive not yet implemented: ${p.op}`);

// TODO L51
// Change this definition to account for possibility of subtype expressions between thenTE and altTE
// 
// Purpose: compute the type of an if-exp
// Typing rule:
//   if type<test>(tenv) = boolean
//      type<then>(tenv) = t1
//      type<else>(tenv) = t1
// then type<(if test then else)>(tenv) = t1
export const typeofIf = (ifExp: IfExp, tenv: TEnv, p: Program): Result<TExp> => {
    const testTE = typeofExp(ifExp.test, tenv, p);
    const thenTE = typeofExp(ifExp.then, tenv, p);
    const altTE = typeofExp(ifExp.alt, tenv, p);
    const constraint1 = bind(testTE, testTE => checkEqualType(testTE, makeBoolTExp(), ifExp, p));
    const constraint2 = bind(thenTE, (thenTE: TExp) =>
                            bind(altTE, (altTE: TExp) =>
                                checkEqualType(thenTE, altTE, ifExp, p)));
    return bind(constraint1, (_c1) => constraint2);
};

// Purpose: compute the type of a proc-exp
// Typing rule:
// If   type<body>(extend-tenv(x1=t1,...,xn=tn; tenv)) = t
// then type<lambda (x1:t1,...,xn:tn) : t exp)>(tenv) = (t1 * ... * tn -> t)
export const typeofProc = (proc: ProcExp, tenv: TEnv, p: Program): Result<TExp> => {
    const argsTEs = map((vd) => vd.texp, proc.args);
    const extTEnv = makeExtendTEnv(map((vd) => vd.var, proc.args), argsTEs, tenv);
    const constraint1 = bind(typeofExps(proc.body, extTEnv, p), (body: TExp) => 
                            checkEqualType(body, proc.returnTE, proc, p));
    return bind(constraint1, (returnTE: TExp) => makeOk(makeProcTExp(argsTEs, returnTE)));
};

// Purpose: compute the type of an app-exp
// Typing rule:
// If   type<rator>(tenv) = (t1*..*tn -> t)
//      type<rand1>(tenv) = t1
//      ...
//      type<randn>(tenv) = tn
// then type<(rator rand1...randn)>(tenv) = t
// We also check the correct number of arguments is passed.
export const typeofApp = (app: AppExp, tenv: TEnv, p: Program): Result<TExp> =>
    bind(typeofExp(app.rator, tenv, p), (ratorTE: TExp) => {
        if (! isProcTExp(ratorTE)) {
            return bind(unparseTExp(ratorTE), (rator: string) =>
                        bind(unparse(app), (exp: string) =>
                            makeFailure<TExp>(`Application of non-procedure: ${rator} in ${exp}`)));
        }
        if (app.rands.length !== ratorTE.paramTEs.length) {
            return bind(unparse(app), (exp: string) => makeFailure<TExp>(`Wrong parameter numbers passed to proc: ${exp}`));
        }
        const constraints = zipWithResult((rand, trand) => bind(typeofExp(rand, tenv, p), (typeOfRand: TExp) => 
                                                                checkEqualType(typeOfRand, trand, app, p)),
                                          app.rands, ratorTE.paramTEs);
        return mapv(constraints, _ => ratorTE.returnTE);
    });

// Purpose: compute the type of a let-exp
// Typing rule:
// If   type<val1>(tenv) = t1
//      ...
//      type<valn>(tenv) = tn
//      type<body>(extend-tenv(var1=t1,..,varn=tn; tenv)) = t
// then type<let ((var1 val1) .. (varn valn)) body>(tenv) = t
export const typeofLet = (exp: LetExp, tenv: TEnv, p: Program): Result<TExp> => {
    const vars = map((b) => b.var.var, exp.bindings);
    const vals = map((b) => b.val, exp.bindings);
    const varTEs = map((b) => b.var.texp, exp.bindings);
    const constraints = zipWithResult((varTE, val) => bind(typeofExp(val, tenv, p), (typeOfVal: TExp) => 
                                                            checkEqualType(varTE, typeOfVal, exp, p)),
                                      varTEs, vals);
    return bind(constraints, _ => typeofExps(exp.body, makeExtendTEnv(vars, varTEs, tenv), p));
};

// Purpose: compute the type of a letrec-exp
// We make the same assumption as in L4 that letrec only binds proc values.
// Typing rule:
//   (letrec((p1 (lambda (x11 ... x1n1) body1)) ...) body)
//   tenv-body = extend-tenv(p1=(t11*..*t1n1->t1)....; tenv)
//   tenvi = extend-tenv(xi1=ti1,..,xini=tini; tenv-body)
// If   type<body1>(tenv1) = t1
//      ...
//      type<bodyn>(tenvn) = tn
//      type<body>(tenv-body) = t
// then type<(letrec((p1 (lambda (x11 ... x1n1) body1)) ...) body)>(tenv-body) = t
export const typeofLetrec = (exp: LetrecExp, tenv: TEnv, p: Program): Result<TExp> => {
    const ps = map((b) => b.var.var, exp.bindings);
    const procs = map((b) => b.val, exp.bindings);
    if (! allT(isProcExp, procs))
        return makeFailure(`letrec - only support binding of procedures - ${JSON.stringify(exp, null, 2)}`);
    const paramss = map((p) => p.args, procs);
    const bodies = map((p) => p.body, procs);
    const tijs = map((params) => map((p) => p.texp, params), paramss);
    const tis = map((proc) => proc.returnTE, procs);
    const tenvBody = makeExtendTEnv(ps, zipWith((tij, ti) => makeProcTExp(tij, ti), tijs, tis), tenv);
    const tenvIs = zipWith((params, tij) => makeExtendTEnv(map((p) => p.var, params), tij, tenvBody),
                           paramss, tijs);
    const types = zipWithResult((bodyI, tenvI) => typeofExps(bodyI, tenvI, p), bodies, tenvIs)
    const constraints = bind(types, (types: TExp[]) => 
                            zipWithResult((typeI, ti) => checkEqualType(typeI, ti, exp, p), types, tis));
    return bind(constraints, _ => typeofExps(exp.body, tenvBody, p));
};

// TODO - write the true definition
// Purpose: compute the type of a define
// Typing rule:
//   (define (var : texp) val)
//   tenv-val = extend-tenv(var:texp; tenv)
// If   type<val>(tenv-val) = texp
// then type<(define (var : texp) val)>(tenv) = void
export const typeofDefine = (exp: DefineExp, tenv: TEnv, p: Program): Result<VoidTExp> => {
    const v = exp.var.var;
    const texp = exp.var.texp;
    const val = exp.val;
    const tenvVal = makeExtendTEnv([v], [texp], tenv);
    const constraint = typeofExp(val, tenvVal, p);
    return mapv(constraint, (_) => makeVoidTExp());
};

// Purpose: compute the type of a program
// Typing rule:
export const typeofProgram = (exp: Program, tenv: TEnv, p: Program): Result<TExp> =>
    typeofExps(exp.exps, tenv, p);

// TODO L51
// Write the typing rule for DefineType expressions
export const typeofDefineType = (exp: DefineTypeExp, _tenv: TEnv, _p: Program): Result<TExp> =>
    makeOk(makeVoidTExp())

export const typeofSet = (exp: SetExp, _tenv: TEnv, _p: Program): Result<TExp> =>
    bind(applyTEnv(_tenv, exp.var.var), (typeOfOriginal: TExp): Result<TExp> =>
            bind(typeofExp(exp.val, _tenv, _p), (typeOfval: TExp): Result<TExp> =>
                checkEqualType(typeOfval, typeOfOriginal, exp, _p) ? makeOk(makeVoidTExp()) :
                    makeFailure("Variable type is incompatible with set type")
            )
    )

const typeofClosure = (closure: Closure , tenv: TEnv, p:Program):Result<TExp> =>
    typeofExps(closure.body, makeExtendTEnv(map((variable:VarDecl) => variable.var, closure.params), map((variable: VarDecl) => variable.texp, closure.params), tenv), p)

const typeofSExpValue = (exp: SExpValue, _tenv: TEnv, _p: Program): Result<TExp> =>
    typeof(exp) == "number" ? makeOk(makeNumTExp()) :
    typeof(exp) == "boolean" ? makeOk(makeBoolTExp()) :
    typeof(exp) == "string" ? makeOk(makeStrTExp()) :
    typeof(exp) == "undefined" ? makeOk(makeVoidTExp()) :
    isPrimOp(exp) ? typeofPrim(exp) :
    isSymbolSExp(exp) ? makeOk(makeStrTExp()) :
    isClosure(exp) ? typeofClosure(exp, _tenv, _p) :
    isEmptySExp(exp) ? makeOk(makeVoidTExp()) :
    isCompoundSexp(exp) ? typeofCompoundSexp(exp, _tenv, _p):
    makeFailure("Failed in type of Lit");

const typeofCompoundSexp = (val: CompoundSExp, _tenv: TEnv, _p: Program): Result<TExp> =>{
    console.log(val)
    return typeofSExpValue(val.val1, _tenv, _p)

}



// TODO L51
export const typeofLit = (exp: LitExp, _tenv: TEnv, _p: Program): Result<TExp> =>
    typeofSExpValue(exp.val, _tenv, _p)





// TODO: L51
// Purpose: compute the type of a type-case
// Typing rule:
// For all user-defined-type id
//         with component records record_1 ... record_n
//         with fields (field_ij) (i in [1...n], j in [1..R_i])
//         val CExp
//         body_i for i in [1..n] sequences of CExp
//   ( type-case id val (record_1 (field_11 ... field_1r1) body_1)...  )
//  TODO
const getTypeOfCase = (caseExp: CaseExp, tenv: TEnv, p: Program): Result<TExp> =>
    typeofExps(caseExp.body, tenv, p)

const getVarDecKeysFromCase = (caseExp: CaseExp): string[] =>
    map((varDec: VarDecl) => varDec.var, caseExp.varDecls)

const getAllVarDecsKeys = (exp: TypeCaseExp): string[] =>
    map((caseExp: CaseExp) => getVarDecKeysFromCase(caseExp), exp.cases).flat()

const getVarDecsTypesFromCase = (caseExp: CaseExp, tenv: TEnv): Result<TExp[]> =>
    bind(applyTEnv(tenv, caseExp.typeName), (record: TExp) =>
        isRecord(record) ? makeOk(map((field: Field) => field.te, record.fields)) : makeFailure("Bad case is either not in env or not a record")
    )


const getAllVarDecsTypes = (exp: TypeCaseExp, tenv: TEnv): Result<TExp[][]> =>
    mapResult((caseExp:CaseExp) => getVarDecsTypesFromCase(caseExp, tenv) ,exp.cases)


export const typeofTypeCase = (exp: TypeCaseExp, tenv: TEnv, p: Program): Result<TExp> =>
    bind(checkTypeCase(exp, p), ()=>
        bind(getAllVarDecsTypes(exp, tenv), (varDecTypes:TExp[][]) =>
            bind(mapResult((caseExp: CaseExp) => getTypeOfCase(caseExp, makeExtendTEnv(getAllVarDecsKeys(exp), varDecTypes.flat(), tenv), p), exp.cases), (resultMap:TExp[]) =>
                checkCoverType(resultMap, p)
            )
        )
    )
