import { Result, makeFailure, makeOk, bind, either,isOk,isFailure } from "../lib/result";
import * as R from "ramda"

/* Library code */
const findOrThrow = <T>(pred: (x: T) => boolean, a: T[]): T => {
    for (let i = 0; i < a.length; i++) {
        if (pred(a[i])) return a[i];
    }
    throw "No element found.";
}

export const findResult: <T>(pred:(x:T)=>boolean,arr:T[])=>Result<T> =
    (pred,arr) => R.filter(pred,arr).length === 0 ? makeFailure("NO such element exist") : makeOk(R.filter(pred,arr)[0])

/* Client code */
const returnSquaredIfFoundEven_v1 = (a: number[]): number => {
    try {
        const x = findOrThrow(x => x % 2 === 0, a);
        return x * x;
    } catch (e) {
        return -1;
    }
}
const isEven: (x:number)=>boolean = x=> x%2===0
export const returnSquaredIfFoundEven_v2: (a:number[])=>Result<number> = a => bind(findResult(isEven,a),x=>makeOk(x*x))


const anyWay:(r:Result<number>)=>number = r => isOk(r) ? r.value*r.value:-1
export const returnSquaredIfFoundEven_v3: (a:number[])=>number = a=> either( findResult(isEven,a),x=>x*x,str=>-1)