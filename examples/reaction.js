// @ts-check

import { Atom, batch, reaction } from "../src/index.js";

const a = new Atom(0, { name: "a" });
const b = new Atom(0, { name: "b" });

reaction(()=>[a.value], () => {
    console.log(`a = ${a.value}, b = ${b.value}`);
});

console.log("Start set values");
a.value++;
// Output:
// a = 1, b = 0
b.value++;
a.value++;
// Output:
// a = 2, b = 1

console.log("Start set values in batch mode");
batch(()=>{
    a.value++;
    b.value++;
    a.value++;
});
// Output:
// a = 4, b = 2