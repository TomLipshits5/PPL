"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const L3_ast_1 = require("../imp/L3-ast");
const result_1 = require("../shared/result");
const q4_1 = require("../src/q4");
const parser_1 = require("../shared/parser");
const l30toJSResult = (x) => (0, result_1.bind)((0, result_1.bind)((0, parser_1.parse)(x), L3_ast_1.parseL3Exp), q4_1.l30ToJS);
describe('Q4 Tests', () => {
    it('parses primitive ops', () => {
        (0, chai_1.expect)(l30toJSResult(`(+ 3 5 7)`)).to.deep.equal((0, result_1.makeOk)(`(3 + 5 + 7)`));
        (0, chai_1.expect)(l30toJSResult(`(= 3 (+ 1 2))`)).to.deep.equal((0, result_1.makeOk)(`(3 === (1 + 2))`));
    });
    it('parses "if" expressions', () => {
        (0, chai_1.expect)(l30toJSResult(`(if (> x 3) 4 5)`)).to.deep.equal((0, result_1.makeOk)(`((x > 3) ? 4 : 5)`));
    });
    it('parses "lambda" expressions', () => {
        (0, chai_1.expect)(l30toJSResult(`(lambda (x y) (* x y))`)).to.deep.equal((0, result_1.makeOk)(`((x,y) => (x * y))`));
        (0, chai_1.expect)(l30toJSResult(`((lambda (x y) (* x y)) 3 4)`)).to.deep.equal((0, result_1.makeOk)(`((x,y) => (x * y))(3,4)`));
    });
    it("defines constants", () => {
        (0, chai_1.expect)(l30toJSResult(`(define pi 3.14)`)).to.deep.equal((0, result_1.makeOk)(`const pi = 3.14`));
    });
    it("defines functions", () => {
        (0, chai_1.expect)(l30toJSResult(`(define f (lambda (x y) (* x y)))`)).to.deep.equal((0, result_1.makeOk)(`const f = ((x,y) => (x * y))`));
    });
    it("applies user-defined functions", () => {
        (0, chai_1.expect)(l30toJSResult(`(f 3 4)`)).to.deep.equal((0, result_1.makeOk)(`f(3,4)`));
    });
    it("let expressions", () => {
        (0, chai_1.expect)(l30toJSResult(`(let ((a 1) (b 2)) (+ a b))`)).to.deep.equal((0, result_1.makeOk)(`((a,b) => (a + b))(1,2)`));
    });
    it('parses programs', () => {
        (0, chai_1.expect)((0, result_1.bind)((0, L3_ast_1.parseL3)(`(L3 (define b (> 3 4)) (define x 5) (define f (lambda (y) (+ x y))) (define g (lambda (y) (* x y))) (if (not b) (f 3) (g 4)) ((lambda (x) (* x x)) 7))`), q4_1.l30ToJS)).to.deep.equal((0, result_1.makeOk)(`const b = (3 > 4);\nconst x = 5;\nconst f = ((y) => (x + y));\nconst g = ((y) => (x * y));\n((!b) ? f(3) : g(4));\n((x) => (x * x))(7)`));
    });
    it("literal expressions", () => {
        (0, chai_1.expect)(l30toJSResult(`"a"`)).to.deep.equal((0, result_1.makeOk)(`"a"`));
        (0, chai_1.expect)(l30toJSResult(`'a`)).to.deep.equal((0, result_1.makeOk)(`Symbol.for("a")`));
        (0, chai_1.expect)(l30toJSResult(`symbol?`)).to.deep.equal((0, result_1.makeOk)(`((x) => (typeof (x) === symbol))`));
        (0, chai_1.expect)(l30toJSResult(`(string=? "a" "b")`)).to.deep.equal((0, result_1.makeOk)(`("a" === "b")`));
    });
});
