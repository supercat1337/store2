// @ts-check

import test from "ava";
import {
    clone,
    compareAny,
    debounce,
    getSortedReactiveItems,
} from "./tools.js";
import { Atom } from "../reactives/atom.js";
import { Computed } from "../reactives/computed.js";

test("tools: clone()", (t) => {
    let arr = [1, 2, 3];
    let arrCopy = clone(arr);
    t.deepEqual(arr, arrCopy);

    let obj = { a: 1, b: 2 };
    let objCopy = clone(obj);
    t.deepEqual(obj, objCopy);

    let primitive = 2;
    t.deepEqual(primitive, clone(primitive));
});

test("tools: debounce()", (t) => {
    const p = new Promise((resolve) => {
        const foo = debounce(() => {
            t.pass();
            resolve(1);
        }, 100);
        foo();
    });
    return p;
});

test("tools: getSortedReactiveItems()", (t) => {
    const a = new Atom(0, { name: "a" });
    const b = new Atom(0, { name: "b" });
    const c = new Computed(() => a.value + b.value, { name: "c" });
    const d = new Atom(0, { name: "d" });
    const e = new Atom(0, { name: "e" });

    const set = new Set([a, e]);

    let result = getSortedReactiveItems(b, c, d, set).map((item) => item.name);
    t.deepEqual(result, ["a", "b", "c", "d", "e"]);
});

test("tools: compareAny()", (t) => {
    t.false(compareAny({ a: 1, b: 2 }, null));
    t.false(compareAny({ a: 1, b: 2 }, undefined));

    t.false(compareAny("3", 3));
    t.true(compareAny({ a: 1, b: 2 }, { a: 1, b: 2 }));
    t.false(compareAny({ a: 1, b: 2 }, { a: 1, b: 3 }));
    t.false(compareAny({ a: 1 }, { a: 1, b: 2 }));
    t.false(compareAny({ a: 1, b: 2 }, { a: 1 }));
    t.false(compareAny({ a: 1, b: 2 }, { a: 1, c: 2 }));
    t.false(compareAny({ a: 1, b: 2, c: 3 }, { a: 1, b: 2, c: 3, d: 4 }));
    t.false(compareAny({ a: 1, b: 2, c: 3, d: 4 }, { a: 1, b: 2, c: 3 }));
});
