// @ts-check

import { Computed } from "../../src/reactives/Computed.js";
import { Atom } from "../../src/reactives/Atom.js";
import test from "ava";
import { batch } from "../../src/api/api.js";
import { EngineMessages } from "../../src/core/Engine.js";

test("Engine: notifyDependents with no context", (t) => {
    const a = new Atom(0, { name: "a" });
    const b = new Atom(0, { name: "b" });
    const c = new Computed(() => a.value + b.value, { name: "c" });

    t.false(c.engine.shouldRecalc);
    a.engine.notifyDependents(EngineMessages.DEPENDENCY_CHANGED);
    t.true(c.engine.shouldRecalc);
});

test("Engine: notifyDependents with context", (t) => {
    const a = new Atom(0, { name: "a" });
    const b = new Atom(0, { name: "b" });
    const c = new Computed(() => a.value + b.value, { name: "c" });

    const ctx = {
        sender: a,
        recipients: new Set(),
    };

    a.engine.notifyDependents(EngineMessages.DEPENDENCY_CHANGED, ctx);

    t.true(ctx.recipients.has(c));
});

test("Engine: hasUpdates", (t) => {
    const a = new Atom(0, { name: "a" });
    const b = new Atom(0, { name: "b" });
    const c = new Computed(() => a.value + b.value, { name: "c" });

    batch(() => {
        a.value++;
        b.value++;
        t.true(a.engine.hasUpdates());

        a.value = 0;

        t.false(a.engine.hasUpdates());

        t.true(b.engine.hasUpdates());
        t.false(c.engine.hasUpdates());

        let foo = c.value + 1;
        t.true(c.engine.hasUpdates());
    });

    t.false(c.engine.hasUpdates());
    t.false(a.engine.hasUpdates());
    t.false(b.engine.hasUpdates());
});

test("Engine: Computed addDependent while destroyed", (t) => {
    const a = new Atom(0, { name: "a" });

    const c = new Computed(() => a.value, { name: "c" });

    c.destroy();

    const b = new Atom(0, { name: "b" });

    t.false(c.engine.addDependent(b));
    t.is(a.engine.dependents.size, 0);
});

test("Engine: Computed notifyDependencies", (t) => {
    const a = new Atom(0, { name: "a" });
    const b = new Atom(0, { name: "b" });
    const c = new Computed(() => a.value + b.value, { name: "c" });

    const ctx = {
        sender: c,
        recipients: new Set(),
    };

    c.engine.notifyDependencies(EngineMessages.DEPENDENT_DESTROYED, ctx);

    t.true(ctx.recipients.has(a));
    t.true(ctx.recipients.has(b));
});

test("Engine: setError(null)", (t) => {
    const a = new Atom(0, { name: "a" });
    a.engine.setError(null);
    t.is(a.engine.error, null);
});
