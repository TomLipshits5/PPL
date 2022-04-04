"use strict";
exports.__esModule = true;
exports.treeToSentence = exports.isPaired = exports.countLetters = void 0;
var R = require("ramda");
var stringToArray = R.split("");
/* Question 1 */
var countLetters = function (s) { return R.countBy(R.toLower)(R.filter(function (x) { return x != ' '; }, stringToArray(s))); };
exports.countLetters = countLetters;
var makeStack = function (a) { return a; };
var peek = function (s) { return s[0]; };
var empty = function (s) { return s.length === 0; };
var push = function (s, t) { return [t].concat(s); };
var pop = function (s) { return s.slice(1); };
var parentheses = ['(', ')', '[', ']', '{', '}'];
var isPair = function (open, close) { return open === '(' ? close === ')' : open === '[' ? close === ']' : open === '{' && close === '}'; };
var isParentheses = function (str) { return parentheses.indexOf(str) > -1; };
var removeAllLetters = function (lst) { return R.filter(isParentheses, lst); };
var checkNextParentheses = function (stack, lst, index) { return index === lst.length ? empty(stack) :
    lst[index] === '(' || lst[index] === '[' || lst[index] === '{' ? checkNextParentheses(push(stack, lst[index]), lst, index + 1) :
        isPair(peek(stack), lst[index]) ? checkNextParentheses(pop(stack), lst, index + 1) : false; };
/* Question 2 */
var isPaired = function (s) { return checkNextParentheses([], R.compose(removeAllLetters, stringToArray)(s), 0); };
exports.isPaired = isPaired;
var convertArrayToSentence = function (lst) { return R.reduce(function (acc, newWord) { return acc + " " + newWord; }, "", lst); };
var treeToSentence = function (t) { return t.children.length === 0 ? t.root : t.root + convertArrayToSentence(R.map(exports.treeToSentence, t.children)); };
exports.treeToSentence = treeToSentence;
