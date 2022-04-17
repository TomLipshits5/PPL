"use strict";
exports.__esModule = true;
exports.treeToSentence = void 0;
// @ts-ignore
var R = require("ramda");
var stringToArray = R.split("");
var t1 = {
    root: "Hello",
    children: [
        {
            root: "students",
            children: [
                {
                    root: "how",
                    children: []
                }
            ]
        },
        {
            root: "are",
            children: []
        },
        {
            root: "you?",
            children: []
        }
    ]
};
var convertToSentence = function (wordTree) {
    return wordTree === undefined || wordTree.children.length === 0 ? " " + wordTree.root : " " + wordTree.root + R.reduce(convertToSentence, "", wordTree.children);
};
var treeToSentence = function (t) { return convertToSentence(t); };
exports.treeToSentence = treeToSentence;
console.log((0, exports.treeToSentence)(t1));
