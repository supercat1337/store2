// @ts-check

import test from "ava";
import { ReactiveProps } from "./reactiveProps.js";

test("ReactiveProps: set", (t) => {
    const b = new ReactiveProps({ foo: 1 }, { name: "b" });

    let foo = 0;

    b.subscribe(() => {
        foo += 1;
    });

    const reactiveprops = b.value;
    reactiveprops.foo = 2;
    reactiveprops.foo = 2;

    t.is(foo, 1);
    t.is(b.value.foo, 2);
});

test("ReactiveProps: create with error", (t) => {
    t.throws(() => {
        new ReactiveProps([], { name: "b" });
    });

    t.throws(() => {
        // @ts-expect-error
        new ReactiveProps(null, { name: "b" });
    });

    t.throws(() => {
        // @ts-expect-error
        new ReactiveProps(123, { name: "b" });
    });
});

test("ReactiveProps: set same value", (t) => {
    const b = new ReactiveProps({ foo: 1 }, { name: "b" });

    let foo = 0;

    b.subscribe(() => {
        foo += 1;
    });

    b.value.foo = 1;

    t.is(foo, 0);
    t.is(b.value.foo, 1);
});

test("ReactiveProps: set value", (t) => {
    const item1 = { name: "item1" };
    let foo = 0;

    const reactiveProps = new ReactiveProps({});
    reactiveProps.subscribe((updates) => {
        foo++;
    });

    reactiveProps.value = item1;

    t.deepEqual(reactiveProps.value, item1);
    t.is(foo, 1);
});

test("ReactiveProps: set data", (t) => {
    const item1 = { name: "item1" };
    let foo = 0;

    const reactiveProps = new ReactiveProps({});
    reactiveProps.subscribe((updates) => {
        foo++;
    });

    reactiveProps.data = item1;

    t.deepEqual(reactiveProps.value, item1);
    t.is(foo, 1);
});

test("ReactiveProps: delete", (t) => {
    const b = new ReactiveProps({ foo: 1 }, { name: "b" });

    let foo = 0;

    b.subscribe(() => {
        foo += 1;
    });

    const reactiveprops = b.value;
    // @ts-expect-error
    delete reactiveprops.foo;

    t.is(foo, 1);
    // @ts-expect-error
    t.is(b.value.foo, undefined);
});

test("ReactiveProps: delete while subscribers are running", (t) => {
    const b = new ReactiveProps({ foo: 1 }, { name: "b" });

    b.subscribe(() => {
        // @ts-expect-error
        t.throws(() => delete b.value.foo);
    });

    b.value.foo = 2;
});

test("ReactiveProps: getRawValue", (t) => {
    const b = new ReactiveProps({ foo: 1 }, { name: "b" });
    t.is(b.getRawValue().foo, 1);
});

test("ReactiveProps: data", (t) => {
    const b = new ReactiveProps({ foo: 1 }, { name: "b" });
    t.is(b.data.foo, 1);
    t.is(b.value === b.data, true);
});

test("ReactiveProps: observe class", (t) => {
    class A {
        foo = 1;

        inc() {
            this.foo++;
        }
    }

    let bar = 0;
    const b = new ReactiveProps(new A(), { name: "b" });

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

test("ReactiveProps: observe class 2", (t) => {
    class A {
        foo = 1;
    }

    let bar = 0;
    const b = new ReactiveProps(new A(), { name: "b" });

    b.subscribe(() => {
        bar++;
    });

    t.is(b.value.foo, 1);

    b.value.foo = 2;
    t.is(b.value.foo, 2);

    t.is(bar, 1);
});

test("ReactiveProps: subscribe", (t) => {
    const b = new ReactiveProps({ foo: 1 }, { name: "b" });

    let foo = 0;

    b.subscribe(() => {
        foo += 1;
    });

    b.value.foo = 2;

    t.is(foo, 1);
    t.is(b.value.foo, 2);
});
