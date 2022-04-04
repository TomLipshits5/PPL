
import * as R from "ramda"



const stringToArray = R.split("");

/* Question 1 */

export const countLetters: (s: string) => {} = s=> R.countBy(R.toLower)(R.filter(x=>x!=' ',stringToArray(s)))
console.log(countLetters("I am robot"))

