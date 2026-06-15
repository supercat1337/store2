// @ts-check

import { Atom, Collection, Computed, shallowReactive } from "@supercat1337/store2";

const a = new Atom(1, { name: "a" });

const b = new Computed(
    () => {
        //console.log("b recalculated", a.value > 0 ? 1: 0);
        return a.value > 0 ? 1 : 0;
    },
    { name: "b" }
);

//a.value = 2;
//b.value;
//console.log("b.isStale()", b.isStale());

const c = new Computed(
    () => {
        //console.log("c recalculated", b.value);
        return b.value + a.value;
    },
    { name: "c" }
);

const d = new Collection([1, 2, 3], { name: "d" });

const e = new Computed(
    () => {
        console.log("e recalculated", d.data.length);
        return d.data.length + " " + d.data[3];
    },
    { name: "e" }
);

const f = new shallowReactive({ a: 1, b: 1 }, { name: "f" });

const g = new Computed(
    () => {
        console.log("g recalculated", f.value.a);
        return f.value.a + " " + f.value.b;
    },
    { name: "g" }
);

console.log("g: current value", g.value);
f.value = { a: 2, b: 3 };
console.log("g: current value", g.value);

// @ts-expect-error
delete f.value.b;

console.log(f.value);
