// @ts-check

import { Atom, batch, Computed } from "./@supercat1337/store2";

let res = [];
let output = [];

const numbers = Array.from(
    { length: 5 },
    (_, i) => i,
)
const fib = n => n < 2 ? 1
    : fib(n - 1) + fib(n - 2)

const hard = ((n, l) => {
    console.log("add: ", l);
    output.push(l);
    return n + fib(18)
});

const A = new Atom(0, { name: "A" });
const B = new Atom(0, { name: "B" });

const C = new Computed(() => A.value % 2 + B.value % 2, { name: "C" });

const D = new Computed(
    () => numbers.map(i => ({ x: i + A.value % 2 - B.value % 2 }))
    , { name: "D" });

const E = new Computed(() => hard(C.value + A.value + D.value[0].x, 'E'), { name: "E", isHardFunction: true });

const F = new Computed(() => hard(D.value[2].x || B.value, 'F'), { name: "F", isHardFunction: true });

const G = new Computed(() => C.value + (C.value || E.value % 2) + D.value[4].x + F.value, { name: "G" });

/*
C.subscribe(() => {
    console.log("C =", C.value);
});

D.subscribe(() => {
    console.log("D: ", D.value);
});

*/

//res.push(hard(G.value, 'H'));

const H = G.subscribe(() => res.push(hard(G.value, 'H')));

const I = G.subscribe(() => res.push(G.value));

const J = F.subscribe(() => res.push(hard(F.value, 'J')));

res.length = 0;

//console.log(`C = ${C.isStale()}, D = ${D.isStale()}, E = ${E.isStale()}, F = ${F.isStale()}, G = ${G.isStale()}`);

for (let i = 0; i < 10; i++) {

    console.log("===========================")
    output = [];

    batch(() => {
        A.value = 1 + i * 2;
        B.value = 1;
    })

//    console.log("A", "oldValue", A.engine.oldValue, "value", A.value);
//    console.log("B", "oldValue", B.engine.oldValue, "value", B.value);
    
    // H
    console.log(output.join(", "));

    console.log("#2");

    output = [];
    batch(() => {
        A.value = 2 + i * 2;
        B.value = 2;
    });

//    console.log("A", "oldValue", A.engine.oldValue, "value", A.value);
//    console.log("B", "oldValue", B.engine.oldValue, "value", B.value);

    // EH

    console.log(output.join(", "));
    output = [];
}

/*
console.log("A dependents", Array.from(A.engine.dependents).map(d => d.name));
console.log("B dependents", Array.from(B.engine.dependents).map(d => d.name));
console.log("C dependents", Array.from(C.engine.dependents).map(d => d.name));
console.log("D dependents", Array.from(D.engine.dependents).map(d => d.name));
console.log("E dependents", Array.from(E.engine.dependents).map(d => d.name));
console.log("F dependents", Array.from(F.engine.dependents).map(d => d.name));
console.log("G dependents", Array.from(G.engine.dependents).map(d => d.name));

console.log("A dependencies", Array.from(A.engine.dependencies).map(d => d.name));
console.log("B dependencies", Array.from(B.engine.dependencies).map(d => d.name));
console.log("C dependencies", Array.from(C.engine.dependencies).map(d => d.name));
console.log("D dependencies", Array.from(D.engine.dependencies).map(d => d.name));
console.log("E dependencies", Array.from(E.engine.dependencies).map(d => d.name));
console.log("F dependencies", Array.from(F.engine.dependencies).map(d => d.name));
console.log("G dependencies", Array.from(G.engine.dependencies).map(d => d.name));
*/
//console.log(res);
