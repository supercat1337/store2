// @ts-check

import { atom, computed } from "@supercat1337/store2";

const a = atom(0);
const b = atom(0);
const c = computed(() => a.value + 1);
const d = computed(() => c.valueUntracked + b.value);

d.subscribe(() => {
    console.log(`d = ${d.value}`);
});

console.log(`c = ${c.value}`);
// Outputs: c = 1
a.value++;
// a = 1
// Outputs: nothing
console.log(`c = ${c.value}`);
// Outputs: c = 2

b.value++;
// Outputs: d = 3
