// @ts-check

import { Atom, runInAction } from "@supercat1337/store2";

const a = new Atom(0, { name: "a" });
const b = new Atom(0, { name: "b" });

a.subscribe(()=>{
    console.log("a");
    b.value++;
});

b.subscribe(()=>{
    console.log("b");
    runInAction(()=>{
        a.value++;        
    });

    if (a.value > 10) {
        process.exit();
    }
});

a.value++;