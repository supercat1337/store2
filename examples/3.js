// @ts-check

import { Atom, Computed } from "@supercat1337/store2";

const a = new Atom(0); // same as const a = atom(0);
const b = new Atom(0);

const c = new Computed(() => a.value + b.value);

c.subscribe(() => {
    console.log(c.name, c.value);
});

a.subscribe(() => {
    console.log(a.name, a.value);
});

b.subscribe(() => {
    console.log(b.name, b.value);
});

a.value = 1;
// Output:
//a 1
//c 1

a.value = 2;
// Output:
//a 2
//c 2
b.value = 2;
// Output:
//b 2
//c 4

a.value = 3;
// Output:
//a 3
//c 5

a.value = 3;
// Output: nothing
