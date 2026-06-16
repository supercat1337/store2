// @ts-check

import test from "ava";
import { ShallowReactive } from "../../src/reactives/ShallowReactive.js";

test("ShallowReactive: set", (t) => {
    const b = new ShallowReactive({ foo: 1 }, { name: "b" });

    let foo = 0;

    b.subscribe(() => {
        foo += 1;
    });

    const shallowReactive = b.value;
    shallowReactive.foo = 2;
    shallowReactive.foo = 2;

    t.is(foo, 1);
    t.is(b.value.foo, 2);
});

test("ShallowReactive: create with error", (t) => {
    t.throws(() => {
        new ShallowReactive([], { name: "b" });
    });

    t.throws(() => {
        // @ts-ignore
        new ShallowReactive(null, { name: "b" });
    });

    t.throws(() => {
        // @ts-ignore
        new ShallowReactive(123, { name: "b" });
    });
});

test("ShallowReactive: set same value", (t) => {
    const b = new ShallowReactive({ foo: 1 }, { name: "b" });

    let foo = 0;

    b.subscribe(() => {
        foo += 1;
    });

    b.value.foo = 1;

    t.is(foo, 0);
    t.is(b.value.foo, 1);
});

test("ShallowReactive: set value", (t) => {
    const item1 = { name: "item1" };
    let foo = 0;

    const shallowReactive = new ShallowReactive({});
    shallowReactive.subscribe((updates) => {
        foo++;
    });

    shallowReactive.value = item1;

    t.deepEqual(shallowReactive.value, item1);
    t.is(foo, 1);
});

test("ShallowReactive: delete", (t) => {
    const b = new ShallowReactive({ foo: 1 }, { name: "b" });

    let foo = 0;

    b.subscribe(() => {
        foo += 1;
    });

    const shallowReactive = b.value;
    // @ts-ignore
    delete shallowReactive.foo;

    t.is(foo, 1);
    // @ts-ignore
    t.is(b.value.foo, undefined);
});

test("ShallowReactive: delete while subscribers are running", (t) => {
    const b = new ShallowReactive({ foo: 1 }, { name: "b" });

    b.subscribe(() => {
        // @ts-ignore
        t.throws(() => delete b.value.foo);
    });

    b.value.foo = 2;
});

test("ShallowReactive: getRawValue", (t) => {
    const b = new ShallowReactive({ foo: 1 }, { name: "b" });
    t.is(b.getRawValue().foo, 1);
});

test("ShallowReactive: observe class", (t) => {
    class A {
        foo = 1;

        inc() {
            this.foo++;
        }
    }

    let bar = 0;
    const b = new ShallowReactive(new A(), { name: "b" });

    b.subscribe(() => {
        bar++;
    });

    t.is(b.value.foo, 1);

    b.value.foo = 2;
    t.is(b.value.foo, 2);

    t.is(bar, 1);

    b.value.inc();
    t.is(b.value.foo, 3);
    t.is(bar, 2);
});

test("ShallowReactive: observe class 2", (t) => {
    class A {
        foo = 1;
    }

    let bar = 0;
    const b = new ShallowReactive(new A(), { name: "b" });

    b.subscribe(() => {
        bar++;
    });

    t.is(b.value.foo, 1);

    b.value.foo = 2;
    t.is(b.value.foo, 2);

    t.is(bar, 1);
});

test("ShallowReactive: subscribe", (t) => {
    const b = new ShallowReactive({ foo: 1 }, { name: "b" });

    let foo = 0;

    b.subscribe(() => {
        foo += 1;
    });

    b.value.foo = 2;

    t.is(foo, 1);
    t.is(b.value.foo, 2);
});
