// @ts-check

import { Atom, Computed, batch } from "../index.js";
import test from "ava";

test("Computed: get value", (t) => {
    const a = new Atom(0, { name: "a" });
    const b = new Atom(0, { name: "b" });
    const c = new Computed(() => a.value + b.value, { name: "c" });

    t.is(c.value, 0);
    b.value++;
    t.is(c.value, 1);
});

test("Computed: computed depends on another computed", (t) => {
    const a = new Atom(0, { name: "a" });
    const b = new Atom(0, { name: "b" });
    const c = new Computed(() => a.value + b.value, { name: "c" });
    const d = new Computed(() => c.value + a.value, { name: "d" });

    t.is(d.value, 0);
    b.value++;
    t.is(d.value, 1);
});

test("Computed: dependencies can't be stale", (t) => {
    const a = new Atom(0, { name: "a" });
    const b = new Atom(0, { name: "b" });
    const c = new Computed(() => a.value + b.value, { name: "c" });

    b.value = 1;
    // c is stale
    //t.log(c.isStale());
    t.throws(() => new Computed(() => c.value + a.value, { name: "d" }));
});

test("Computed: get value with error, hasError, getLastError", (t) => {
    const a = new Atom(0, { name: "a" });
    const b = new Atom(0, { name: "b" });
    const c = new Computed(
        () => {
            let result = a.value + b.value;
            if (result > 10) {
                throw new Error("a + b > 10");
            }
            return result;
        },
        { name: "c" }
    );

    t.is(c.value, 0);
    b.value = 20;
    t.is(c.hasError(), true);
    t.is(c.getLastError() instanceof Error, true);
    b.value = 9;
    t.is(c.hasError(), false);
    t.is(c.getLastError() === null, true);
    t.is(c.isStale(), false);

    a.value = 2;
    t.is(c.hasError(), true);
    t.is(c.getLastError() instanceof Error, true);
    t.is(c.isStale(), true);

    t.throws(() => c.value);
});

test("Computed: pass error to dependents computed", (t) => {
    const a = new Atom(0, { name: "a" });
    const b = new Atom(0, { name: "b" });
    const c = new Computed(
        () => {
            if (a.value > 10) {
                throw new Error("a > 10");
            }
            return a.value + b.value;
        },
        { name: "c" }
    );

    const d = new Computed(() => c.value * 2, { name: "d" });

    t.is(d.value, 0);
    a.value = 20;
    t.is(d.hasError(), true);
    t.is(d.getLastError() instanceof Error, true);
});

test("Computed: no dependencies", (t) => {
    const a = new Atom(0, { name: "a" });
    const b = new Atom(0, { name: "b" });

    t.throws(
        () =>
            new Computed(() => a.valueUntracked + b.valueUntracked, {
                name: "c",
            })
    );
});

test("Computed: isHardFunction = false", (t) => {
    const a = new Atom(0, { name: "a" });
    const b = new Atom(0, { name: "b" });

    const c = new Computed(
        () => {
            return a.value + b.value;
        },
        { isHardFunction: false, name: "c" }
    );

    let foo = 0;

    const d = new Computed(
        () => {
            foo++;
            return c.value;
        },
        { isHardFunction: false, name: "d" }
    );

    // foo == 1;

    a.value = 1;
    b.value = 1;
    a.value = 0;
    b.value = 0;

    // dependencies values are not changed, but d is updated
    t.is(d.value, 0);
    t.is(foo, 2);
});

test("Computed: isHardFunction = true, dependencies are not changed", (t) => {
    const a = new Atom(0, { name: "a" });
    const b = new Atom(0, { name: "b" });

    const c = new Computed(
        () => {
            return a.value + b.value;
        },
        { isHardFunction: false, name: "c" }
    );

    let foo = 0;

    const d = new Computed(
        () => {
            foo++;
            return c.value;
        },
        { isHardFunction: true, name: "d" }
    );

    // foo == 1;

    a.value = 1;
    b.value = 1;
    a.value = 0;
    b.value = 0;
    // dependencies are not changed, d is not updated

    t.is(d.value, 0);
    t.is(foo, 1);
});

test("Computed: isHardFunction = true, dependencies are changed", (t) => {
    const a = new Atom(0, { name: "a" });
    const b = new Atom(0, { name: "b" });

    const c = new Computed(
        () => {
            return a.value + b.value;
        },
        { isHardFunction: false, name: "c" }
    );

    let foo = 0;

    const d = new Computed(
        () => {
            foo++;
            return c.value;
        },
        { isHardFunction: true, name: "d" }
    );

    // foo == 1;

    a.value = 1;
    b.value = 1;

    t.is(d.value, 2);
    // foo == 2;

    t.is(foo, 2);
});

test("Computed: get value while computed is destroyed", (t) => {
    const a = new Atom(0, { name: "a" });
    const b = new Atom(0, { name: "b" });
    const c = new Computed(() => a.value + b.value, { name: "c" });
    c.destroy();
    t.throws(() => c.value);
});

test("Computed: get value while one of the dependencies is destroyed", (t) => {
    const a = new Atom(0, { name: "a" });
    const b = new Atom(0, { name: "b" });
    const c = new Computed(() => a.value + b.value, { name: "c" });
    b.destroy();
    t.throws(() => c.value);
});

test("Computed: get valueUntracked", (t) => {
    const a = new Atom(0, { name: "a" });
    const b = new Atom(0, { name: "b" });
    const c = new Computed(() => a.value + b.value, { name: "c" });
    const d = new Computed(() => c.valueUntracked + b.value, { name: "d" });

    let foo = 0;

    d.subscribe(() => {
        foo++;
    });

    b.value++;
    t.is(foo, 1);

    // `a` influences `d` but only through `c` that is not tracked, so `d` is not updated
    a.value++;
    t.is(foo, 1);

    b.value++;
    t.is(foo, 2);

    a.value++;
    t.is(foo, 2);
});

test("Computed: recalculate value in batch mode", (t) => {
    const a = new Atom(0, { name: "a" });
    const b = new Atom(0, { name: "b" });
    const c = new Computed(() => a.value + b.value, { name: "c" });
    let foo = 0;

    c.subscribe(() => {
        foo++;
    });

    batch(() => {
        // c.value = 0
        a.value = 1;
        b.value = 1;
        // calc the computed value
        // c.value = 2
        c.value;

        a.value = 0;
        b.value = 0;
        // c.value = 0
        // no subscribers will be triggered
    });

    t.is(c.value, 0);
    t.is(foo, 0);
});

test("Computed: set compare function", (t) => {
    const a = new Atom(
        {
            foo: 0,
            bar: 0,
        },
        { name: "a" }
    );

    const c = new Computed(
        () => {
            return {
                foo: a.value.foo,
                // nonsense value
                bar: a.value.bar,
            };
        },
        {
            compareFunction: (a, b) => a.foo == b.foo,
        }
    );

    let foo = 0;

    c.subscribe(() => {
        foo++;
    });

    a.value = { foo: 0, bar: 1 };

    t.is(c.value.foo, 0);
    t.is(c.value.bar, 0);

    a.value = { foo: 1, bar: 10 };

    t.is(c.value.foo, 1);
    t.is(c.value.bar, 10);

    t.is(foo, 1);
});

test("Computed: test reactivity / Karlovsky's test", (t) => {
    let res = [];
    let output = [];

    const numbers = Array.from({ length: 5 }, (_, i) => i);
    const fib = (n) => (n < 2 ? 1 : fib(n - 1) + fib(n - 2));

    const hard = (n, l) => {
        output.push(l);
        return n + fib(16);
    };

    const A = new Atom(0, { name: "A" });
    const B = new Atom(0, { name: "B" });

    const C = new Computed(() => (A.value % 2) + (B.value % 2), { name: "C" });

    const D = new Computed(
        () => numbers.map((i) => ({ x: i + (A.value % 2) - (B.value % 2) })),
        { name: "D" }
    );

    const E = new Computed(() => hard(C.value + A.value + D.value[0].x, "E"), {
        name: "E",
        isHardFunction: true,
    });

    const F = new Computed(() => hard(D.value[2].x || B.value, "F"), {
        name: "F",
        isHardFunction: true,
    });

    const G = new Computed(
        () => C.value + (C.value || E.value % 2) + D.value[4].x + F.value,
        { name: "G" }
    );

    const H = G.subscribe(() => res.push(hard(G.value, "H")));

    const I = G.subscribe(() => res.push(G.value));

    const J = F.subscribe(() => res.push(hard(F.value, "J")));

    res.length = 0;

    for (let i = 0; i < 10; i++) {
        output = [];

        batch(() => {
            A.value = 1 + i * 2;
            B.value = 1;
        });

        t.is(output.join(", "), "H");
        // H

        output = [];
        batch(() => {
            A.value = 2 + i * 2;
            B.value = 2;
        });

        // E, H
        t.is(output.join(", "), "E, H");

        output = [];
    }
});

test("Computed: getDeepDependentsArray", (t) => {
    const a = new Atom(0, { name: "a" });
    const b = new Atom(0, { name: "b" });
    const c = new Computed(() => a.value + b.value, { name: "c" });
    const d = new Computed(() => c.value + b.value, { name: "d" });
    const e = new Computed(() => d.value + a.value, { name: "e" });

    t.deepEqual(a.engine.getDeepDependentsArray(), [c, d, e]);
    t.deepEqual(b.engine.getDeepDependentsArray(), [c, d, e]);
    t.deepEqual(c.engine.getDeepDependentsArray(), [d, e]);
    t.deepEqual(d.engine.getDeepDependentsArray(), [e]);
    t.deepEqual(e.engine.getDeepDependentsArray(), []);
});

test("Computed: set value (another atom) 2", (t) => {
    const a = new Atom(undefined, { name: "a" });
    t.throws(() => {
        const b = new Computed(() => a, { name: "b" });
    });
});
