import * as R from "ramda";



const stringToArray = R.split("");


/* Question 1 */
export const countLetters: (s: string) => {} = s=> R.countBy(R.toLower)(R.filter(x=>x!=' ',stringToArray(s)))






type Stack<T> = T[];
const makeStack: <T>(a: T[]) => Stack<T> = a => a;
const peek: <T>(s: Stack<T>) => T = s => s[0];
const empty: <T>(s: Stack<T>) => boolean = s => s.length === 0;
const push: <T>(s: Stack<T>, t: T) => Stack<T> = (s, t) => [t].concat(s);
const pop: <T>(s: Stack<T>) => Stack<T> = s => s.slice(1);

const parentheses:string[] = ['(',')','[',']','{','}']
const isPair: (open:string,close:string)=>boolean = (open,close)=> open==='('? close===')':open==='['?close===']':open==='{' && close==='}'
const isParentheses: (str:string)=>boolean = str=> parentheses.indexOf(str)> -1
const removeAllLetters: (lst:string[])=>string[] = lst=>R.filter(isParentheses,lst)
const checkNextParentheses: (stack: Stack<string>, lst: string[], index: number)=> boolean =
    (stack,lst,index)=>index === lst.length ? empty(stack):
        lst[index]==='('|| lst[index] ==='[' ||lst[index]==='{'? checkNextParentheses(push(stack,lst[index]),lst,index+1):
            isPair(peek(stack),lst[index])?checkNextParentheses(pop(stack),lst,index+1):false


/* Question 2 */
export const isPaired: (s: string) => boolean = s => checkNextParentheses([],R.compose(removeAllLetters,stringToArray)(s),0)

/* Question 3 */
export interface WordTree {
    root: string;
    children: WordTree[];
}


const convertArrayToSentence: (lst:string[])=>string = lst=> R.reduce((acc:string,newWord:string)=>acc+" "+newWord,"",lst)

export const treeToSentence = (t: WordTree): string => t.children.length === 0 ? t.root  :  t.root + convertArrayToSentence(R.map(treeToSentence,t.children))


