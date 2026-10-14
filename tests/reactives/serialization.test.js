// @ts-check

import test from 'ava';
import {
    Atom,
    Collection,
    Computed,
    ReactiveList,
    ShallowReactive,
    Store,
} from '../../src/index.js';
import { createStore2Context, runWithContext } from '../../src/core/context.js';

test('Atom.serialize / hydrate round-trip', t => {
    const a = new Atom(42);
    const data = a.serialize();
    t.deepEqual(data, { type: 'atom', value: 42 });

    const b = new Atom(0);
    b.hydrate(data);
    t.is(b.value, 42);
});

test('Atom.hydrate ignores malformed data', t => {
    const a = new Atom(5);
    a.hydrate(null);
    a.hydrate({});
    a.hydrate('nonsense');
    t.is(a.value, 5);
});

test('Atom.serialize handles object values', t => {
    const a = new Atom({ x: 1, y: 2 });
    const data = a.serialize();
    t.deepEqual(data, { type: 'atom', value: { x: 1, y: 2 } });
});

test('Collection.serialize / hydrate round-trip', t => {
    const c = new Collection([1, 2, 3]);
    const data = c.serialize();
    t.deepEqual(data, { type: 'collection', value: [1, 2, 3] });

    const d = new Collection([]);
    d.hydrate(data);
    t.deepEqual(d.value, [1, 2, 3]);
});

test('Collection.hydrate ignores malformed data', t => {
    const c = new Collection([1]);
    c.hydrate(null);
    c.hydrate({ type: 'collection', value: 'not-an-array' });
    t.deepEqual(c.value, [1]);
});

test('ShallowReactive.serialize / hydrate round-trip', t => {
    const s = new ShallowReactive({ a: 1, b: 2 });
    const data = s.serialize();
    t.deepEqual(data, { type: 'shallowReactive', value: { a: 1, b: 2 } });

    const s2 = new ShallowReactive(/** @type {any} */ ({}));
    s2.hydrate(data);
    t.deepEqual(s2.getRawValue(), { a: 1, b: 2 });
});

test('ShallowReactive.hydrate ignores malformed data', t => {
    const s = new ShallowReactive({ a: 1 });
    s.hydrate(null);
    s.hydrate({ type: 'shallowReactive', value: 'not-an-object' });
    t.deepEqual(s.getRawValue(), { a: 1 });
});

test('Computed.serialize returns null', t => {
    const a = new Atom(1);
    const c = new Computed(() => a.value * 2);
    t.is(c.serialize(), null);
});

test('Store.serialize / hydrate flat', t => {
    const store = new Store();
    store.addItems({
        a: new Atom(1),
        b: new Atom(2),
    });

    const data = store.serialize();
    t.is(data.type, 'store');
    t.deepEqual(data.items.a, { type: 'atom', value: 1 });
    t.deepEqual(data.items.b, { type: 'atom', value: 2 });
    t.deepEqual(data.stores, {});

    const target = new Store();
    const a2 = new Atom(0);
    const b2 = new Atom(0);
    target.addItems({ a: a2, b: b2 });
    target.hydrate(data);

    t.is(a2.value, 1);
    t.is(b2.value, 2);
});

test('Store.serialize skips Computed entries', t => {
    const store = new Store();
    const a = new Atom(1);
    const c = new Computed(() => a.value * 2);
    store.addItems({ a, c });

    const data = store.serialize();
    t.truthy(data.items.a);
    t.is(data.items.c, undefined);
});

test('Store.serialize / hydrate nested stores', t => {
    const parent = new Store();
    const child = new Store();
    child.addItems({ a: new Atom(10) });
    parent.addItems({ child });

    const data = parent.serialize();
    t.is(data.stores.child.type, 'store');
    t.deepEqual(data.stores.child.items.a, { type: 'atom', value: 10 });

    const parent2 = new Store();
    const child2 = new Store();
    const a2 = new Atom(0);
    child2.addItems({ a: a2 });
    parent2.addItems({ child: child2 });
    parent2.hydrate(data);

    t.is(a2.value, 10);
});

test('Store.hydrate ignores malformed data', t => {
    const store = new Store();
    const a = new Atom(5);
    store.addItems({ a });
    store.hydrate(null);
    store.hydrate({ type: 'other' });
    store.hydrate({ type: 'store', items: 'not-an-object', stores: {} });
    t.is(a.value, 5);
});

test('Store.hydrate ignores keys not present in the store', t => {
    const store = new Store();
    const a = new Atom(0);
    store.addItems({ a });
    store.hydrate({
        type: 'store',
        items: {
            a: { type: 'atom', value: 1 },
            missing: { type: 'atom', value: 99 },
        },
        stores: {},
    });
    t.is(a.value, 1);
});

test('ReactiveList.serialize / hydrate round-trip', t => {
    const list = new ReactiveList();
    list.setItems([1, 2, 3]);

    const data = list.serialize();
    t.deepEqual(data, { type: 'list', value: [1, 2, 3] });

    const list2 = new ReactiveList();
    list2.hydrate(data);
    t.deepEqual(list2.toArray(), [1, 2, 3]);
});

test('ReactiveList.hydrate ignores malformed data', t => {
    const list = new ReactiveList();
    list.setItems([1]);
    list.hydrate(null);
    list.hydrate({ type: 'list', value: 'bad' });
    list.hydrate({ type: 'other', value: [9, 9] });
    t.deepEqual(list.toArray(), [1]);
});

test('context snapshot / hydrate full round-trip', t => {
    const ctx = createStore2Context();

    runWithContext(ctx, () => {
        const store = new Store();
        const count = new Atom(0);
        const label = new Atom('hello');
        store.addItems({ count, label });
        ctx.registerRoot('app', store);

        const snap = ctx.snapshot();
        t.is(snap.version, 1);
        t.truthy(snap.roots.app);

        count.value = 42;
        label.value = 'world';
        t.is(count.value, 42);

        ctx.hydrate(snap);
        t.is(count.value, 0);
        t.is(label.value, 'hello');
    });
});

test('context hydrate notifies subscribers once', t => {
    const ctx = createStore2Context();

    runWithContext(ctx, () => {
        const store = new Store();
        const a = new Atom(0);
        const b = new Atom(0);
        store.addItems({ a, b });
        ctx.registerRoot('app', store);

        const snap = ctx.snapshot();

        a.value = 100;
        b.value = 200;

        let notifications = 0;
        store.subscribe(() => notifications++);

        ctx.hydrate(snap);

        t.is(notifications, 1);
        t.is(a.value, 0);
        t.is(b.value, 0);
    });
});

test('context hydrate restores nested stores', t => {
    const ctx = createStore2Context();

    runWithContext(ctx, () => {
        const parent = new Store();
        const child = new Store();
        const value = new Atom(0);
        child.addItems({ value });
        parent.addItems({ child });
        ctx.registerRoot('app', parent);

        const snap = ctx.snapshot();

        value.value = 99;
        t.is(value.value, 99);

        ctx.hydrate(snap);
        t.is(value.value, 0);
    });
});

test('context hydrate leaves unregistered state untouched', t => {
    const ctx = createStore2Context();

    runWithContext(ctx, () => {
        const registered = new Store();
        const other = new Store();
        const a = new Atom(0);
        const b = new Atom(0);
        registered.addItems({ a });
        other.addItems({ b });
        ctx.registerRoot('app', registered);

        const snap = ctx.snapshot();

        a.value = 1;
        b.value = 2;

        ctx.hydrate(snap);

        t.is(a.value, 0);
        t.is(b.value, 2);
    });
});
