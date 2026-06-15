// @ts-check

import { Atom } from "@supercat1337/store2";

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