// @ts-check

import {Atom, runInAction} from "@supercat1337/store2";

let a = new Atom(0, { name: "a" });
let b = new Atom(0, { name: "b" });

a.subscribe(() => {
    console.log("a = ", a.value);

    runInAction(() => {
        console.log("runInAction");
        b.value = a.value;        
    })
});

b.subscribe(() => {
    console.log("b = ", b.value);
});

console.log("==============");
a.value++;
console.log("==============");
a.value++;