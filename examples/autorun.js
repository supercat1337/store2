// @ts-check

import { Atom, autorun, batch } from "../src/index.js";

const a = new Atom(0, { name: "a" });
const b = new Atom(0, { name: "b" });

autorun(() => {
    console.log(`a = ${a.value}, b = ${b.value}`);
});
// Output:
// a = 0, b = 0

console.log("Start set values");
a.value++;
// Output:
// a = 1, b = 0
b.value++;
// Output:
// a = 1, b = 1

console.log("Start set values in batch mode");
batch(() => {
    a.value++;
    b.value++;
});
// Output:
// a = 2, b = 2