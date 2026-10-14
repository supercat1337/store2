// @ts-check

import test from 'ava';
import {
    Atom,
    Computed,
    Collection,
    ShallowReactive,
    Store,
    ReactiveList,
    createStore2Context,
    runWithContext,
} from '../../src/index.js';

// ---------------------------------------------------------------------------
// ReactiveItem.toObservable
// ---------------------------------------------------------------------------

test('ReactiveItem.toObservable: get returns current value', t => {
    const a = new Atom(42);
    const obs = a.toObservable();
    t.is(obs.get(), 42);
});

test('ReactiveItem.toObservable: subscribe fires on change', t => {
    const a = new Atom(0);
    const obs = a.toObservable();
    /** @type {number[]} */
    const seen = [];
    const unsub = obs.subscribe(v => seen.push(v));
    a.value = 1;
    a.value = 2;
    unsub();
    a.value = 3;
    t.deepEqual(seen, [1, 2]);
});

test('ReactiveItem.toObservable: version advances on change', t => {
    const a = new Atom(0);
    const obs = a.toObservable();
    const v0 = obs.version();
    a.value = 1;
    t.is(obs.version(), v0 + 1);
    a.value = 1; // no change
    t.is(obs.version(), v0 + 1);
});

test('ReactiveItem.toObservable: works for Computed', t => {
    const a = new Atom(2);
    const c = new Computed(() => a.value * 3);
    const obs = c.toObservable();
    t.is(obs.get(), 6);
    a.value = 5;
    t.is(obs.get(), 15);
});

test('ReactiveItem.toObservable: works for Collection', t => {
    const c = new Collection([1, 2, 3]);
    const obs = c.toObservable();
    t.deepEqual(obs.get(), [1, 2, 3]);
});

test('ReactiveItem.toObservable: works for ShallowReactive', t => {
    const s = new ShallowReactive({ x: 1 });
    const obs = s.toObservable();
    t.deepEqual(obs.get(), { x: 1 });
});

// ---------------------------------------------------------------------------
// Store.toObservable / getVersion
// ---------------------------------------------------------------------------

test('Store.getVersion: advances on child change', t => {
    const store = new Store();
    const a = new Atom(0);
    store.addItems({ a });

    const v0 = store.getVersion();
    a.value = 1;
    t.is(store.getVersion(), v0 + 1);
});

test('Store.getVersion: throws after destroy', t => {
    const store = new Store();
    store.destroy();
    t.throws(() => store.getVersion(), { message: /destroyed/ });
});

test('Store.toObservable: get returns JSON snapshot', t => {
    const store = new Store();
    store.addItems({ a: new Atom(1), b: new Atom(2) });
    const obs = store.toObservable();
    t.deepEqual(obs.get(), { a: 1, b: 2 });
});

test('Store.toObservable: subscribe fires with snapshot', t => {
    const store = new Store();
    const a = new Atom(0);
    store.addItems({ a });
    const obs = store.toObservable();
    /** @type {any[]} */
    const seen = [];
    obs.subscribe(v => seen.push(v));
    a.value = 1;
    t.is(seen.length, 1);
    t.deepEqual(seen[0], { a: 1 });
});

// ---------------------------------------------------------------------------
// ReactiveList.toObservable / getVersion / getItemVersionAt
// ---------------------------------------------------------------------------

test('ReactiveList.getVersion: advances on add', t => {
    const list = new ReactiveList();
    const v0 = list.getVersion();
    list.add(1);
    t.true(list.getVersion() > v0);
});

test('ReactiveList.getVersion: throws after destroy', t => {
    const list = new ReactiveList();
    list.destroy();
    t.throws(() => list.getVersion(), { message: /destroyed/ });
});

test('ReactiveList.getItemVersionAt: returns -1 for out of bounds', t => {
    const list = new ReactiveList();
    list.add(1, 2);
    t.is(list.getItemVersionAt(5), -1);
    t.is(list.getItemVersionAt(-1), -1);
});

test('ReactiveList.getItemVersionAt: returns version for existing item', t => {
    const list = new ReactiveList();
    list.add(1);
    const v = list.getItemVersionAt(0);
    t.is(typeof v, 'number');
    t.true(v >= 0);
});

test('ReactiveList.toObservable: get returns array', t => {
    const list = new ReactiveList();
    list.setItems([1, 2, 3]);
    const obs = list.toObservable();
    t.deepEqual(obs.get(), [1, 2, 3]);
});

test('ReactiveList.toObservable: subscribe fires on change', t => {
    const list = new ReactiveList();
    const obs = list.toObservable();
    /** @type {any[]} */
    const seen = [];
    obs.subscribe(v => seen.push(v));
    list.add(1);
    t.is(seen.length, 1);
    t.deepEqual(seen[0], [1]);
});

// ---------------------------------------------------------------------------
// toJSON
// ---------------------------------------------------------------------------

test('Atom.toJSON: returns value', t => {
    t.is(JSON.stringify(new Atom(42)), '42');
});

test('Computed.toJSON: returns value', t => {
    const a = new Atom(2);
    const c = new Computed(() => a.value * 5);
    t.is(JSON.stringify(c), '10');
});

test('Collection.toJSON: returns array without proxy', t => {
    const c = new Collection([1, 2, 3]);
    t.is(JSON.stringify(c), '[1,2,3]');
});

test('ShallowReactive.toJSON: returns plain object', t => {
    const s = new ShallowReactive({ x: 1, y: 2 });
    t.is(JSON.stringify(s), '{"x":1,"y":2}');
});

test('ReactiveList.toJSON: returns array', t => {
    const list = new ReactiveList();
    list.setItems([1, 2, 3]);
    t.is(JSON.stringify(list), '[1,2,3]');
});

test('nested JSON.stringify works', t => {
    const store = new Store();
    store.addItems({
        atom: new Atom(1),
        collection: new Collection([2, 3]),
    });
    t.is(JSON.stringify(store), '{"atom":1,"collection":[2,3]}');
});
