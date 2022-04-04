"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countLetters = void 0;
const R = require("ramda");
const stringToArray = R.split("");
/* Question 1 */
const countLetters = s => R.countBy(R.toLower)(R.filter(x => x != ' ', stringToArray(s)));
exports.countLetters = countLetters;
console.log((0, exports.countLetters)("I am robot"));
//# sourceMappingURL=test.js.map