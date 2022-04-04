"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.treeToSentence = exports.isPaired = exports.countLetters = void 0;
const R = require("ramda");
const stringToArray = R.split("");
/* Question 1 */
const countLetters = s => R.countBy(R.toLower)(R.filter(x => x != ' ', stringToArray(s)));
exports.countLetters = countLetters;
const makeStack = a => a;
const peek = s => s[0];
const empty = s => s.length === 0;
const push = (s, t) => [t].concat(s);
const pop = s => s.slice(1);
const parentheses = ['(', ')', '[', ']', '{', '}'];
const isPair = (open, close) => open === '(' ? close === ')' : open === '[' ? close === ']' : open === '{' && close === '}';
const isParentheses = str => parentheses.indexOf(str) > -1;
const removeAllLetters = lst => R.filter(isParentheses, lst);
const checkNextParentheses = (stack, lst, index) => index === lst.length ? empty(stack) :
    lst[index] === '(' || lst[index] === '[' || lst[index] === '{' ? checkNextParentheses(push(stack, lst[index]), lst, index + 1) :
        isPair(peek(stack), lst[index]) ? checkNextParentheses(pop(stack), lst, index + 1) : false;
/* Question 2 */
const isPaired = s => checkNextParentheses([], R.compose(removeAllLetters, stringToArray)(s), 0);
exports.isPaired = isPaired;
const convertArrayToSentence = lst => R.reduce((acc, newWord) => acc + " " + newWord, "", lst);
const treeToSentence = (t) => t.children.length === 0 ? t.root : t.root + convertArrayToSentence(R.map(exports.treeToSentence, t.children));
exports.treeToSentence = treeToSentence;
//# sourceMappingURL=part2.js.map