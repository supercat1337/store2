// @ts-check

import test from "ava";
import {
    getArrayOfUsedReactiveItems,
    getSetOfUsedReactiveItems,
    getValueTracker,
} from "./trackers.js";
import { Atom } from "../reactives/atom.js";
import { Computed } from "../reactives/computed.js";

test("getValueTracker: getArrayOfUsedReactiveItems()", (t) => {
    const a = new Atom(0, { name: "a" });
    const b = new Atom(0, { name: "b" });
    const c = new Computed(() => a.value + 1, { name: "c" });

    let array = getArrayOfUsedReactiveItems(() => {
        t.is(getValueTracker.isTurnedOn(), true);
        a.value = 1;
        let foo = c.value;
        t.is(foo, 2);
    });

    t.is(getValueTracker.isTurnedOn(), false);

    t.is(array.length, 2);
    t.is(array[0].name, "a");
    t.is(array[1].name, "c");
});

test("getValueTracker: getSetOfUsedReactiveItems()", (t) => {
    const a = new Atom(0, { name: "a" });
    const b = new Atom(0, { name: "b" });
    const c = new Computed(() => a.value + 1, { name: "c" });

    let set = getSetOfUsedReactiveItems(() => {
        t.is(getValueTracker.isTurnedOn(), true);
        a.value = 1;
        let foo = c.value;
        t.is(foo, 2);
    });

    t.is(getValueTracker.isTurnedOn(), false);

    t.is(set.size, 2);
    t.is(set.has(a), true);
    t.is(set.has(b), false);
    t.is(set.has(c), true);
});

test("getValueTracker: turnOn() while is turnOn", (t) => {
    getValueTracker.turnOn();

    t.throws(() => getValueTracker.turnOn());
});
