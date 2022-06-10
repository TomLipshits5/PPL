"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyEnv = exports.isEnv = exports.isNonEmptyEnv = exports.isEmptyEnv = exports.makeEnv = exports.makeEmptyEnv = void 0;
const result_1 = require("../shared/result");
const makeEmptyEnv = () => ({ tag: "EmptyEnv" });
exports.makeEmptyEnv = makeEmptyEnv;
const makeEnv = (v, val, env) => ({ tag: "Env", var: v, val: val, nextEnv: env });
exports.makeEnv = makeEnv;
const isEmptyEnv = (x) => x.tag === "EmptyEnv";
exports.isEmptyEnv = isEmptyEnv;
const isNonEmptyEnv = (x) => x.tag === "Env";
exports.isNonEmptyEnv = isNonEmptyEnv;
const isEnv = (x) => (0, exports.isEmptyEnv)(x) || (0, exports.isNonEmptyEnv)(x);
exports.isEnv = isEnv;
const applyEnv = (env, v) => (0, exports.isEmptyEnv)(env) ? (0, result_1.makeFailure)("var not found " + v) :
    env.var === v ? (0, result_1.makeOk)(env.val) :
        (0, exports.applyEnv)(env.nextEnv, v);
exports.applyEnv = applyEnv;
