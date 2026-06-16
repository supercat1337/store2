// @ts-check

import test from "ava";
import {
    getArrayOfUsedReactiveItems,
    getSetOfUsedReactiveItems,
    dependencyTracker,
} from "../../src/services/dependencyTracker.js";
import { Atom } from "../../src/reactives/Atom.js";
import { Computed } from "../../src/reactives/Computed.js";

test("dependencyTracker: getArrayOfUsedReactiveItems()", (t) => {
    const a = new Atom(0, { name: "a" });
    const b = new Atom(0, { name: "b" });
    const c = new Computed(() => a.value + 1, { name: "c" });

    let array = getArrayOfUsedReactiveItems(() => {
        t.is(dependencyTracker.isTurnedOn(), true);
        a.value = 1;
        let foo = c.value;
        t.is(foo, 2);
    });

    t.is(dependencyTracker.isTurnedOn(), false);

    t.is(array.length, 2);
    t.is(array[0].name, "a");
    t.is(array[1].name, "c");
});

test("dependencyTracker: getSetOfUsedReactiveItems()", (t) => {
    const a = new Atom(0, { name: "a" });
    const b = new Atom(0, { name: "b" });
    const c = new Computed(() => a.value + 1, { name: "c" });

    let set = getSetOfUsedReactiveItems(() => {
        t.is(dependencyTracker.isTurnedOn(), true);
        a.value = 1;
        let foo = c.value;
        t.is(foo, 2);
    });

    t.is(dependencyTracker.isTurnedOn(), false);

    t.is(set.size, 2);
    t.is(set.has(a), true);
    t.is(set.has(b), false);
    t.is(set.has(c), true);
});

test("dependencyTracker: enable() while is enable", (t) => {
    dependencyTracker.enable();

    t.throws(() => dependencyTracker.enable());
});
