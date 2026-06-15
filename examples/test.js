// @ts-check

import { Atom, batch, Computed, reaction } from "@supercat1337/store2";
const a = new Atom(0, { name: "a" });
const b = new Atom(0, { name: "b" });

console.log("Start reaction #1");
const c = new Computed(() => a.value);

c.subscribe((updates)=>{
    console.log(`a = ${a.value}, b = ${b.value}`);
})

console.log("Start set values");
batch(()=>{
  a.value++;
  a.value--;
});

console.log("Start reaction #2");

const d = new Computed(()=> a.value + b.value);
d.subscribe((updates)=>{
    console.log(`a = ${a.value}, b = ${b.value}`);
});

console.log("Start set values");
batch(()=>{
  a.value++;
  b.value--;
});
// Output:
// a = 1, b = -1
