// @ts-check

import { atom, computed } from "@supercat1337/store2";

const a = atom(0);
const b = atom(0);
const c = computed(() => a.value + b.valueUntracked, {
    name: "c",
});

c.subscribe(() => {
    console.log(c.name, c.value);
});
console.log("change b.value");
b.value++;
b.value++;
console.log("change a.value");
a.value++;
// Output: c 3
a.value++;
// Output: c 4
