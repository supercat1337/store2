// @ts-check

import test from 'ava';
import { Atom, Collection, Computed, ShallowReactive } from '../../src/index.js';
import { dependencyTracker } from '../../src/services/dependencyTracker.js';

test('ReactiveItem.type returns the correct tag', t => {
    let a = new Atom(0);
    t.is(new Atom(0).type, 1); // ATOM
    t.is(new Computed(() => {return a.value + 1}).type, 2); // COMPUTED
    t.is(new Collection([]).type, 3); // COLLECTION
    // @ts-ignore — ShallowReactive expects an object
    t.is(new ShallowReactive({}).type, 4); // SHALLOW_REACTIVE
});

test('ReactiveItem.getVersion() advances on change', t => {
    const a = new Atom(0);
    const v0 = a.getVersion();

    a.value = 1;
    t.is(a.getVersion(), v0 + 1);

    // Setting the same value does not bump the version.
    a.value = 1;
    t.is(a.getVersion(), v0 + 1);

    a.value = 2;
    t.is(a.getVersion(), v0 + 2);
});

test('Computed.getVersion() advances on recompute', t => {
    const a = new Atom(0);
    const c = new Computed(() => a.value * 2);
    const v0 = c.getVersion();

    a.value = 1;
    // Force recompute by reading.
    t.is(c.value, 2);
    t.is(c.getVersion(), v0 + 1);
});

test('Collection ignores symbol-keyed properties', t => {
    const c = new Collection([1, 2, 3]);
    let notifications = 0;
    c.subscribe(() => notifications++);

    const sym = Symbol('tag');
    // @ts-ignore — symbol indexing on a Collection
    c.value[sym] = 'meta';

    // Symbol writes bypass reactivity.
    t.is(notifications, 0);
    // @ts-ignore
    t.is(c.value[sym], 'meta');

    // Array indices still trigger.
    c.value[0] = 10;
    t.is(notifications, 1);
});

test('ShallowReactive ignores symbol-keyed properties', t => {
    const s = new ShallowReactive({ count: 0 });
    let notifications = 0;
    s.subscribe(() => notifications++);

    const sym = Symbol('tag');
    s.value[sym] = 'meta';

    t.is(notifications, 0);
    t.is(s.value[sym], 'meta');

    // String keys still trigger.
    s.value.count = 1;
    t.is(notifications, 1);
});

test('dependencyTracker.onAdd() unsubscribe stops notifications', t => {
    const a = new Atom(0);
    const b = new Atom(0);

    /** @type {any[]} */
    const captured = [];

    const unsub = dependencyTracker.onAdd(item => captured.push(item));

    dependencyTracker.enable();
    a.value;
    t.is(captured.length, 1);

    unsub();

    b.value;
    t.is(captured.length, 1);

    dependencyTracker.disable();
});
