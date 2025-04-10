// @ts-check

import { Atom, batch } from "../src/index.js";

const a = new Atom(0, { name: "a" });
const b = new Atom(0, { name: "b" });

function fn() {
    console.log(`a = ${a.value}; b = ${b.value}`);
}

function fn1() {
    console.log(`a = ${a.value}; b = ${b.value}`);
}

a.subscribe(fn);
const unsubscriber = b.subscribe(fn1);

batch(()=>{
    a.value++;
    b.value++;

    a.value++;
    b.value++;

    a.value++;
    b.value++;
});

/*
Outputs:
a = 3; b = 3
a = 3; b = 3
*/
console.log("end batch mode");
unsubscriber();

b.subscribe(fn);
batch(()=>{
    a.value++;
    b.value++;

    a.value++;
    b.value++;

    a.value++;
    b.value++;
});

/*
Outputs:
a = 6; b = 6
*/
console.log("end batch mode 2");
