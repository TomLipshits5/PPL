"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const L31_ast_1 = require("../src/L31-ast");
const q3_1 = require("../src/q3");
const result_1 = require("../shared/result");
const parser_1 = require("../shared/parser");
describe('Q3 Tests', () => {
    it('test parse/unparse let*', () => {
        (0, chai_1.expect)((0, result_1.bind)((0, result_1.bind)((0, parser_1.parse)(`(let* ((a 1) (b (+ a 2))) (* a b))`), L31_ast_1.parseL31Exp), x => (0, result_1.makeOk)((0, L31_ast_1.unparseL31)(x)))).to.deep.equal((0, result_1.makeOk)(`(let* ((a 1) (b (+ a 2))) (* a b))`));
    });
    it('test parse wrong let', () => {
        (0, chai_1.expect)((0, result_1.bind)((0, parser_1.parse)(`(let* ((a 1) (b (+ a 2)) (* a b))`), L31_ast_1.parseL31Exp)).is.satisfy(result_1.isFailure);
    });
    it('test parse/unparse program', () => {
        (0, chai_1.expect)((0, result_1.bind)((0, L31_ast_1.parseL31)(`(L31 (define a 1) (if (> a 3) (let ((a 1) (b a)) (* a b)) (let* ((a 1) (b a)) (* a b))))`), x => (0, result_1.makeOk)((0, L31_ast_1.unparseL31)(x)))).to.deep.equal((0, result_1.makeOk)(`(L31 (define a 1) (if (> a 3) (let ((a 1) (b a)) (* a b)) (let* ((a 1) (b a)) (* a b))))`));
    });
    it('trnasform let*-exp in to let-exp', () => {
        (0, chai_1.expect)((0, result_1.bind)((0, result_1.bind)((0, result_1.bind)((0, parser_1.parse)(`(let* ((a 1) (b (+ a 2))) (* a b))`), L31_ast_1.parseL31Exp), q3_1.L31ToL3), x => (0, result_1.makeOk)((0, L31_ast_1.unparseL31)(x)))).to.deep.equal((0, result_1.makeOk)(`(let ((a 1)) (let ((b (+ a 2))) (* a b)))`));
    });
    it('trnasform let* program in to let', () => {
        (0, chai_1.expect)((0, result_1.bind)((0, result_1.bind)((0, L31_ast_1.parseL31)(`(L31 (define a 1) (if (> a 3) (let ((a 1) (b a)) (* a b)) (let* ((a 1) (b a)) (* a b))))`), q3_1.L31ToL3), x => (0, result_1.makeOk)((0, L31_ast_1.unparseL31)(x)))).to.deep.equal((0, result_1.makeOk)(`(L31 (define a 1) (if (> a 3) (let ((a 1) (b a)) (* a b)) (let ((a 1)) (let ((b a)) (* a b)))))`));
    });
});
