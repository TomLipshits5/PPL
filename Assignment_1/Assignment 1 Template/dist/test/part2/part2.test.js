"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const part2_1 = require("../../src/part2/part2");
describe("Assignment 1 Part 2", () => {
    describe("countLetters", () => {
        it("counts letters", () => {
            (0, chai_1.expect)((0, part2_1.countLetters)("aaabbbb")).to.deep.equal({ "a": 3, "b": 4 });
            (0, chai_1.expect)((0, part2_1.countLetters)("AaaBbbb")).to.deep.equal({ "a": 3, "b": 4 });
            (0, chai_1.expect)((0, part2_1.countLetters)("ABbbaab")).to.deep.equal({ "a": 3, "b": 4 });
            (0, chai_1.expect)((0, part2_1.countLetters)("I am robot")).to.deep.equal({ "i": 1, "a": 1, "m": 1, "r": 1, "o": 2, "b": 1, "t": 1 });
        });
    });
    describe("isPaired", () => {
        it("returns true for a string with paired parens", () => {
            (0, chai_1.expect)((0, part2_1.isPaired)("([{}])")).to.be.true;
            (0, chai_1.expect)((0, part2_1.isPaired)("This is ([some]) {text}.")).to.be.true;
            (0, chai_1.expect)((0, part2_1.isPaired)("No parens, no problems.")).to.be.true;
            (0, chai_1.expect)((0, part2_1.isPaired)("")).to.be.true;
        });
        it("returns false when the parens are not paired", () => {
            (0, chai_1.expect)((0, part2_1.isPaired)("(]")).to.be.false;
            (0, chai_1.expect)((0, part2_1.isPaired)("This is ]some[ }text{")).to.be.false;
            (0, chai_1.expect)((0, part2_1.isPaired)("(")).to.be.false;
            (0, chai_1.expect)((0, part2_1.isPaired)(")(")).to.be.false;
        });
    });
    describe("treeToSentence", () => {
        const t1 = { root: "hello", children: [{ root: "world", children: [] }] };
        const t2 = { root: "hello", children: [{ root: "there", children: [] }, { root: "!", children: [] }] };
        const t3 = { root: "hello", children: [{ root: "there", children: [{ root: "!", children: [] }] }] };
        it("Represents a tree as a sentence", () => {
            (0, chai_1.expect)((0, part2_1.treeToSentence)(t1)).to.equal("hello world");
            (0, chai_1.expect)((0, part2_1.treeToSentence)(t2)).to.equal("hello there !");
            (0, chai_1.expect)((0, part2_1.treeToSentence)(t3)).to.equal("hello there !");
        });
    });
});
//# sourceMappingURL=part2.test.js.map