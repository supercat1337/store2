// @ts-check

import { Atom } from "../src/index.js";

const a = new Atom(0, { name: "a" });

let foo = 0;

let unsubscribe = a.subscribe(()=>{
    foo++;
});

a.value++;
a.value++;

unsubscribe();

a.value++;

console.log(foo);