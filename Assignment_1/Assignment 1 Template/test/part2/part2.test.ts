
import { expect } from "chai";

import { countLetters, isPaired, treeToSentence, WordTree } from "../../src/part2/part2";

describe("Assignment 1 Part 2", () => {
    describe("countLetters", () => {
        it("counts letters", () => {
            expect(countLetters("aaabbbb")).to.deep.equal({"a": 3, "b":4});
            expect(countLetters("AaaBbbb")).to.deep.equal({"a": 3, "b":4});
            expect(countLetters("ABbbaab")).to.deep.equal({"a": 3, "b":4});
            expect(countLetters("")).to.deep.equal({});
            expect(countLetters("aaammmmMMMMmmmmjjjjaj")).to.deep.equal({ "a": 4, "m": 12, "j":5});
            expect(countLetters("2227777338883888")).to.deep.equal({"2": 3, "7": 4, "3": 3, "8":6});
        });
    });

    describe("isPaired", () => {
        it("returns true for a string with paired parens", () => {
            expect(isPaired("([{}])")).to.be.true;
            expect(isPaired("This is ([some]) {text}.")).to.be.true;
            expect(isPaired("No parens, no problems.")).to.be.true;
            expect(isPaired("")).to.be.true;
            expect(isPaired("lkahjsdkfjhdsaf(asdopiaspod)asdjkaksd({{sdkj}sdkj}laskdj)[]")).to.be.true;

        });

        it("returns false when the parens are not paired", () => {
            expect(isPaired("(]")).to.be.false;
            expect(isPaired("This is ]some[ }text{")).to.be.false;
            expect(isPaired("(")).to.be.false;
            expect(isPaired(")(")).to.be.false;
            expect(isPaired("((((((())))")).to.be.false;
            expect(isPaired("(((()))))){")).to.be.false;
        });
    });

    describe("treeToSentence", () => {
        const t1: WordTree = {root:"hello", children:[{root: "world", children:[{root:"my",children:[]}]}]}
        const t2: WordTree = {root:"hello", children:[{root: "there", children:[]}, {root:"!", children:[]}]}
        const t3: WordTree = {root:"hello", children:[{root: "there", children:[{root:"!", children:[]}]}]}
        const t4: WordTree = {root:"",children:[]}
        it("Represents a tree as a sentence", () => {
            expect(treeToSentence(t1)).to.equal("hello world my");
            expect(treeToSentence(t2)).to.equal("hello there !");
            expect(treeToSentence(t3)).to.equal("hello there !");
            expect(treeToSentence(t4)).to.equal("")

        });
    });
});

