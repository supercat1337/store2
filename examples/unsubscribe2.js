// @ts-check

import { Atom } from "@supercat1337/store2";

const a = new Atom(0, { name: "a" });
const abortController = new AbortController();

let foo = 0;

a.subscribe(()=>{
    console.log("a = ", a.value);
    foo++;
}, {signal: abortController.signal});

a.value++;
console.log(a.value);
a.value++;
console.log(a.value);

abortController.abort();

a.value++;

console.log(foo);