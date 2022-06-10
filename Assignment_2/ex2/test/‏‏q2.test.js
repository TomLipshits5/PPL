"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const chai_1 = require("chai");
const L3_eval_1 = require("../imp/L3-eval");
const result_1 = require("../shared/result");
const L3_ast_1 = require("../imp/L3-ast");
const evalP = (x) => (0, result_1.bind)((0, L3_ast_1.parseL3)(x), L3_eval_1.evalL3program);
const q2 = fs_1.default.readFileSync(__dirname + '/../src/q2.l3', { encoding: 'utf-8' });
const q2_test_string = `

(define empty? (lambda (x) (eq? x '() )))

(define compose
    (lambda (f g)
        (lambda (x)
            (f (g x))
        )
    )
)

(define pipe
    (lambda (fs)  
        (if (empty? fs)
            (lambda (x) x)
            (compose (pipe (cdr fs)) (car fs))
        )
    )
)

(define square 
    (lambda (x) 
        (make-ok (* x x))
    )
)

(define inverse 
    (lambda (x) 
        (if (= x 0) 
            (make-error "div by 0") 
            (make-ok (/ 1 x))
        )
    )
)

(define inverse-square-inverse (pipe (list inverse (bind square) (bind inverse))))
`;
describe('Q4 Tests', () => {
    /**
     * Q2.1--(a) tests
     */
    it("Q21a", () => {
        (0, chai_1.expect)(evalP(`(L3` + q2 + `3)`)).to.deep.equal((0, result_1.makeOk)(3));
        (0, chai_1.expect)(evalP(`(L3` + q2 + `(define r1 (make-ok 3)) (ok? r1)` + `)`)).to.deep.equal((0, result_1.makeOk)(true));
        (0, chai_1.expect)(evalP(`(L3` + q2 + `(define r1 (make-ok 3)) (error? r1)` + `)`)).to.deep.equal((0, result_1.makeOk)(false));
        (0, chai_1.expect)(evalP(`(L3` + q2 + `(define r1 (make-ok 3)) (result? r1)` + `)`)).to.deep.equal((0, result_1.makeOk)(true));
        (0, chai_1.expect)(evalP(`(L3` + q2 + `(define r1 (make-ok 3)) (result->val r1)` + `)`)).to.deep.equal((0, result_1.makeOk)(3));
        (0, chai_1.expect)(evalP(`(L3` + q2 + `(define r2 (make-error "Error: key not found")) (ok? r2)` + `)`)).to.deep.equal((0, result_1.makeOk)(false));
        (0, chai_1.expect)(evalP(`(L3` + q2 + `(define r2 (make-error "Error: key not found")) (error? r2)` + `)`)).to.deep.equal((0, result_1.makeOk)(true));
        (0, chai_1.expect)(evalP(`(L3` + q2 + `(define r2 (make-error "Error: key not found")) (result? r2)` + `)`)).to.deep.equal((0, result_1.makeOk)(true));
        (0, chai_1.expect)(evalP(`(L3` + q2 + `(define r2 (make-error "Error: key not found")) (result->val r2)` + `)`)).to.deep.equal((0, result_1.makeOk)("Error: key not found"));
        (0, chai_1.expect)(evalP(`(L3` + q2 + `(define r3 'ok) (ok? r3)` + `)`)).to.deep.equal((0, result_1.makeOk)(false));
        (0, chai_1.expect)(evalP(`(L3` + q2 + `(define r3 'ok) (error? r3)` + `)`)).to.deep.equal((0, result_1.makeOk)(false));
        (0, chai_1.expect)(evalP(`(L3` + q2 + `(define r3 'ok) (result? r3)` + `)`)).to.deep.equal((0, result_1.makeOk)(false));
        (0, chai_1.expect)(evalP(`(L3` + q2 + `(define r3 'error) (ok? r3)` + `)`)).to.deep.equal((0, result_1.makeOk)(false));
        (0, chai_1.expect)(evalP(`(L3` + q2 + `(define r3 'error) (error? r3)` + `)`)).to.deep.equal((0, result_1.makeOk)(false));
        (0, chai_1.expect)(evalP(`(L3` + q2 + `(define r3 'error) (result? r3)` + `)`)).to.deep.equal((0, result_1.makeOk)(false));
        console.log("PASSED Q2.1 A TESTS!!");
    });
    /**
     * Q2.1--(b) tests
     */
    it("Q21b", () => {
        (0, chai_1.expect)(evalP(`(L3` + q2 + q2_test_string + `3)`)).to.deep.equal((0, result_1.makeOk)(3));
        (0, chai_1.expect)(evalP(`(L3` + q2 + q2_test_string + `(result->val (inverse-square-inverse 2))` + `)`)).to.deep.equal((0, result_1.makeOk)(4));
        (0, chai_1.expect)(evalP(`(L3` + q2 + q2_test_string + `(result->val (inverse-square-inverse 0))` + `)`)).to.deep.equal((0, result_1.makeOk)("div by 0"));
        console.log("PASSED Q2.1 B TESTS!!");
    });
    /**
     * Q2.2 tests
     */
    it("Q22", () => {
        (0, chai_1.expect)(evalP(`(L3` + q2 + q2_test_string + `3)`)).to.deep.equal((0, result_1.makeOk)(3));
        (0, chai_1.expect)(evalP(`(L3` + q2 + q2_test_string + `(define dict (make-dict)) (dict? dict)` + `)`)).to.deep.equal((0, result_1.makeOk)(true));
        (0, chai_1.expect)(evalP(`(L3` + q2 + q2_test_string + `(define dict (make-dict)) (dict? '(2  4))` + `)`)).to.deep.equal((0, result_1.makeOk)(false));
        (0, chai_1.expect)(evalP(`(L3` + q2 + q2_test_string + `(define dict (make-dict)) (result->val (get (result->val (put dict 3 4)) 3))` + `)`)).to.deep.equal((0, result_1.makeOk)(4));
        (0, chai_1.expect)(evalP(`(L3` + q2 + q2_test_string + `(define dict (make-dict)) (result->val (get (result->val (put (result->val (put dict 3 4) ) 3 5)) 3))` + `)`)).to.deep.equal((0, result_1.makeOk)(5));
        (0, chai_1.expect)(evalP(`(L3` + q2 + q2_test_string + `(define dict (make-dict)) (result->val (get (result->val (put dict 3 4)) 4))` + `)`)).to.deep.equal((0, result_1.makeOk)("Key not found"));
        (0, chai_1.expect)(evalP(`(L3` + q2 + q2_test_string + `(define dict (make-dict)) (result->val (put '(1 2) 3 4))` + `)`)).to.deep.equal((0, result_1.makeOk)("Error: not a dictionary"));
        (0, chai_1.expect)(evalP(`(L3` + q2 + q2_test_string + `(define dict (make-dict)) (result->val (get '(1 2) 1))` + `)`)).to.deep.equal((0, result_1.makeOk)("Error: not a dictionary"));
        console.log("PASSED Q2.2 TESTS!!");
    });
    /**
     * Q2.3--(a) tests
     */
    it("Q23a", () => {
        (0, chai_1.expect)(evalP(`(L3` + q2 + q2_test_string + `(result->val (get (result->val (map-dict (result->val (put (result->val (put (make-dict) 1 #t)) 2 #f)) (lambda (x) (not x )))) 1))` + `)`)).to.deep.equal((0, result_1.makeOk)(false));
        (0, chai_1.expect)(evalP(`(L3` + q2 + q2_test_string + `(result->val (get (result->val (map-dict (result->val (put (result->val (put (make-dict) 1 #t)) 2 #f)) (lambda (x) (not x )))) 2))` + `)`)).to.deep.equal((0, result_1.makeOk)(true));
        console.log("PASSED Q2.3 A TESTS!!");
    });
    /**
     * Q2.3--(b) tests
     */
    it("Q23b", () => {
        (0, chai_1.expect)(evalP(`(L3` + q2 + q2_test_string + `(result->val (get (result->val (filter-dict (result->val (put (result->val (put (make-dict) 2 3)) 3 4)) (lambda (x y) (< (+ x y) 6)))) 2))` + `)`)).to.deep.equal((0, result_1.makeOk)(3));
        (0, chai_1.expect)(evalP(`(L3` + q2 + q2_test_string + `(result->val (get (result->val (filter-dict (result->val (put (result->val (put (make-dict) 2 3)) 3 4)) (lambda (x y) (< (+ x y) 6)))) 3))` + `)`)).to.deep.equal((0, result_1.makeOk)("Key not found"));
        console.log("PASSED Q2.3 B TESTS!!");
    });
    console.log("PASSED ALL TESTS!!");
});
