// @ts-check

import { Atom, batch, Computed } from "@supercat1337/store2";

const a = new Atom(0, { name: "a" });
const b = new Atom(0, { name: "b" });

const c = new Computed(() => a.value + b.value, { name: "c" });

c.subscribe((updates)=>{
    console.log(c.name, updates);
});

a.subscribe((updates)=>{
    console.log(a.name, updates);
});

b.subscribe((updates)=>{
    console.log(b.name, updates);
});


a.value = 1;

console.log("batch #1: ");

batch(()=>{
    b.value = 2;
    b.value++;  
    b.value++;
    a.value = 2;
});


console.log("==================================");

batch(()=>{
    b.value++;
    a.value++;
});

console.log("==================================");

a.value++;

