// @ts-check

import test from 'ava';
import { Atom } from '../../src/reactives/Atom.js';
import { Computed } from '../../src/reactives/Computed.js';
import { Collection } from '../../src/reactives/Collection.js';
import { ShallowReactive } from '../../src/reactives/ShallowReactive.js';
import { Store } from '../../src/complex/Store.js';
import { ReactiveItem } from '../../src/reactives/ReactiveItem.js';

test('Store: add, toMap', t => {
    const store = new Store();
    const a = new Atom(1);
    const b = new Atom(2);

    const c = new Store();

    store.addItems({ a, b, c });

    t.throws(() => {
        store.addItems({ a, b, c });
    });

    t.throws(() => {
        store.addItems({ c });
    });

    /** @type {Map<string, ReactiveItem|Store>} */
    // @ts-ignore
    let map = new Map([
        ['a', a],
        ['b', b],
        ['c', c],
    ]);

    t.deepEqual(store.toMap(), map);
    t.deepEqual(store.toMap('all'), map);
    t.deepEqual(
        store.toMap('reactives'),
        new Map([
            ['a', a],
            ['b', b],
        ])
    );
    t.deepEqual(store.toMap('stores'), new Map([['c', c]]));

    t.is(store.getItem('a'), a);
    t.is(store.getItem('b'), b);
    t.is(store.getItem('c'), c);
});

test('Store: getItemNames, hasItem', t => {
    const store = new Store();
    const a = new Atom(1);
    const b = new Atom(2);
    const c = new Store();

    store.addItems({ a, b, c });

    t.deepEqual(store.getItemNames('reactives'), ['a', 'b']);
    t.deepEqual(store.getItemNames('stores'), ['c']);
    t.deepEqual(store.getItemNames('all'), ['a', 'b', 'c']);
    t.deepEqual(store.getItemNames(), ['a', 'b', 'c']);

    t.true(store.hasItem('a'));
    t.true(store.hasItem('b'));
    t.true(store.hasItem('c'));
    t.false(store.hasItem('d'));
});

test('Store: destroy, destroyItem', t => {
    const store = new Store();
    const a = new Atom(1);
    const b = new Atom(2);
    const c = new Store();

    store.addItems({ a, b, c });

    store.destroyItem('a');
    store.destroyItem('d');

    t.deepEqual(store.toMap('reactives'), new Map([['b', b]]));

    store.destroy();

    t.throws(() => {
        store.toMap();
    });
});

test('Store: removeItem', t => {
    const store = new Store();
    const a = new Atom(1);
    const b = new Atom(2);
    const c = new Store();

    store.addItems({ a, b, c });

    store.removeItem('a');

    t.deepEqual(store.toMap('reactives'), new Map([['b', b]]));
    store.removeItem('c');

    t.deepEqual(store.toMap('stores'), new Map());

    t.is(store.getItem('a'), null);
    t.is(store.getItem('c'), null);

    t.false(a.isDestroyed);
    t.false(c.isDestroyed);
});

test('Store: toJSON', t => {
    const store = new Store();
    const a = new Atom(1);
    const b = new Atom(2);
    const c = new Store();
    const d = new Computed(() => a.value + b.value);
    const e = new Collection([1, 2, 3]);

    store.addItems({ a, b, c });
    c.addItems({ d, e });

    t.deepEqual(store.toJSON(), {
        a: 1,
        b: 2,
        c: {
            d: 3,
            e: [1, 2, 3],
        },
    });

    t.deepEqual(store.toJSON('all'), {
        a: 1,
        b: 2,
        c: {
            d: 3,
            e: [1, 2, 3],
        },
    });

    t.deepEqual(store.toJSON('reactives'), {
        a: 1,
        b: 2,
    });

    t.deepEqual(store.toJSON('stores'), {
        c: {
            d: 3,
            e: [1, 2, 3],
        },
    });

    store.destroy();

    t.throws(() => {
        store.toJSON();
    });
});

test('Store: subscribe', t => {
    const store = new Store();
    const a = new Atom(1);
    const b = new Atom(2);

    const c = new Store();
    const d = new Computed(() => a.value + b.value);
    c.addItems({ d });

    store.addItems({ a, b, c });

    let i = 0;
    /** @type {string[]} */
    let updatesKeys = [];

    store.subscribe(updates => {
        let updatesArr = Array.from(updates.keys());
        updatesKeys.push(...updatesArr);
        i += 1;
    });

    a.value = 2;
    t.log(updatesKeys);
    // update a.value, then update c.value
    t.deepEqual(updatesKeys, ['a', 'c.d']);
    updatesKeys = [];

    b.value = 3;
    // update b.value, then update c.value
    t.deepEqual(updatesKeys, ['b', 'c.d']);
    updatesKeys = [];

    t.is(i, 4);
});

test('Store: subscribe 2', t => {
    const store = new Store();
    const a = new Atom(1);
    const b = new Atom(2);

    const childStore = new Store();
    const d = new ShallowReactive({ foo: 1 });
    childStore.addItems({ d });

    store.addItems({ a, b, childStore });

    let i = 0;
    /** @type {string[]} */
    let updatesKeys = [];

    store.subscribe(updates => {
        let updatesArr = Array.from(updates.keys());
        updatesKeys.push(...updatesArr);
        i += 1;
    });

    a.value = 2;
    // update a.value, then update childStore.value
    t.deepEqual(updatesKeys, ['a']);
    updatesKeys = [];

    b.value = 3;
    // update b.value, then update childStore.value
    t.deepEqual(updatesKeys, ['b']);
    updatesKeys = [];

    d.value.foo = 3;
    // update b.value, then update childStore.value
    t.deepEqual(updatesKeys, ['childStore.d.foo']);
    updatesKeys = [];

    t.is(i, 3);
});

test('Store: subscribe 3', t => {
    const store = new Store();
    const a = new Atom(1);
    const b = new Atom(2);

    const c = new Store();
    const e = new Store();

    c.addItems({ e });

    const d = new ShallowReactive({ foo: 1 });
    e.addItems({ d });

    store.addItems({ a, b, c });

    let i = 0;
    /** @type {string[]} */
    let updatesKeys = [];

    store.subscribe(updates => {
        let updatesArr = Array.from(updates.keys());
        updatesKeys.push(...updatesArr);
        i += 1;
    });

    a.value = 2;
    // update a.value, then update c.value
    t.deepEqual(updatesKeys, ['a']);
    updatesKeys = [];

    b.value = 3;
    // update b.value, then update c.value
    t.deepEqual(updatesKeys, ['b']);
    updatesKeys = [];

    d.value.foo = 3;
    // update b.value, then update c.value
    t.deepEqual(updatesKeys, ['c.e.d.foo']);
    updatesKeys = [];

    t.is(i, 3);
});

test('Store: item.destroy', t => {
    const store = new Store();
    const a = new Atom(1);

    store.addItems({ a });

    a.destroy();
    t.false(store.hasItem('a'));
});

test('Store: store.destroy', t => {
    const store = new Store();

    const store2 = new Store();
    const a = new Atom(1);

    store2.addItems({ a });
    store.addItems({ store2 });

    t.true(store.hasItem('store2'));

    store2.destroy();
    t.true(a.isDestroyed);
    t.throws(() => {
        store2.hasItem('a');
    });
});

test('Store: onDestroy', t => {
    const store = new Store();
    let i = 0;

    store.onDestroy(() => {
        i += 1;
    });

    t.is(i, 0);

    store.destroy();
    store.destroy();
    store.destroy();
    t.is(i, 1);

    t.throws(() => {
        store.onDestroy(() => {
            i += 1;
        });
    });
});

test('Store: detachAll', t => {
    const store = new Store();
    const a = new Atom(1);
    const b = new Atom(2);

    const c = new Store();
    const d = new ShallowReactive({ foo: 1 });
    c.addItems({ d });

    store.addItems({ a, b, c });

    t.true(store.hasItem('a'));
    t.true(store.hasItem('b'));
    t.true(store.hasItem('c'));

    store.detachAll();

    t.false(store.hasItem('a'));
    t.false(store.hasItem('b'));
    t.false(store.hasItem('c'));
    t.false(a.isDestroyed);
    t.false(b.isDestroyed);
    t.false(c.isDestroyed);
    t.false(d.isDestroyed);
});

test('Store: removeItem with non-existent key does nothing', t => {
    const store = new Store();
    const a = new Atom(1);
    store.addItems({ a });
    t.notThrows(() => store.removeItem('b'));
    t.true(store.hasItem('a'));
});

test('Store: destroyItem with non-existent key does nothing', t => {
    const store = new Store();
    const a = new Atom(1);
    store.addItems({ a });
    t.notThrows(() => store.destroyItem('b'));
    t.true(store.hasItem('a'));
});

test('Store: muteUpdates and unmuteUpdates', t => {
    const store = new Store();
    const a = new Atom(1);
    store.addItems({ a });

    let callCount = 0;
    store.subscribe(() => callCount++);

    store.muteUpdates();
    a.value = 2;
    t.is(callCount, 0);
    store.unmuteUpdates();
    t.is(callCount, 1);
});

test('Store: muteUpdates after destroy throws', t => {
    const store = new Store();
    store.destroy();
    t.throws(() => store.muteUpdates());
});

test('Store: unmuteUpdates after destroy throws', t => {
    const store = new Store();
    store.destroy();
    t.throws(() => store.unmuteUpdates());
});

test('Store: isMuted returns correct state', t => {
    const store = new Store();
    t.false(store.isMuted());
    store.muteUpdates();
    t.true(store.isMuted());
    store.unmuteUpdates();
    t.false(store.isMuted());
});

test('Store: subscribe after destroy throws', t => {
    const store = new Store();
    store.destroy();
    t.throws(() => store.subscribe(() => {}));
});

test('Store: onDestroy after destroy throws', t => {
    const store = new Store();
    store.destroy();
    t.throws(() => store.onDestroy(() => {}));
});

test('Store: detachAll does not destroy items', t => {
    const store = new Store();
    const a = new Atom(1);
    const b = new Atom(2);
    store.addItems({ a, b });
    store.detachAll();
    t.false(a.isDestroyed);
    t.false(b.isDestroyed);
    t.false(store.hasItem('a'));
});

test('Store: detachAll after destroy throws', t => {
    const store = new Store();
    store.destroy();
    t.throws(() => store.detachAll());
});

test('Store: toJSON after destroy throws', t => {
    const store = new Store();
    store.destroy();
    t.throws(() => store.toJSON());
});

test('Store: toMap after destroy throws', t => {
    const store = new Store();
    store.destroy();
    t.throws(() => store.toMap());
});

test('Store: getItemNames after destroy throws', t => {
    const store = new Store();
    store.destroy();
    t.throws(() => store.getItemNames());
});

test('Store: hasItem after destroy throws', t => {
    const store = new Store();
    store.destroy();
    t.throws(() => store.hasItem('a'));
});

test('Store: destroyItem after store destroyed throws', t => {
    const store = new Store();
    store.destroy();
    t.throws(() => store.destroyItem('a'));
});

test('Store: removeItem after store destroyed throws', t => {
    const store = new Store();
    store.destroy();
    t.throws(() => store.removeItem('a'));
});

test('Store: addItems after store destroyed throws', t => {
    const store = new Store();
    store.destroy();
    t.throws(() => store.addItems({ a: new Atom(0) }));
});

test('Store: getItem after store destroyed throws', t => {
    const store = new Store();
    store.destroy();
    t.throws(() => store.getItem('a'));
});

test('Store: toJSON after store destroyed throws', t => {
    const store = new Store();
    store.destroy();
    t.throws(() => store.toJSON());
});

test('Store: toMap after store destroyed throws', t => {
    const store = new Store();
    store.destroy();
    t.throws(() => store.toMap());
});

test('Store: getItemNames after store destroyed throws', t => {
    const store = new Store();
    store.destroy();
    t.throws(() => store.getItemNames());
});

test('Store: hasItem after store destroyed throws', t => {
    const store = new Store();
    store.destroy();
    t.throws(() => store.hasItem('a'));
});

test('Store: isMuted after store destroyed throws', t => {
    const store = new Store();
    store.destroy();
    t.throws(() => store.isMuted());
});

test('Store: muteUpdates after store destroyed throws', t => {
    const store = new Store();
    store.destroy();
    t.throws(() => store.muteUpdates());
});

test('Store: unmuteUpdates after store destroyed throws', t => {
    const store = new Store();
    store.destroy();
    t.throws(() => store.unmuteUpdates());
});

test('Store: subscribe after store destroyed throws', t => {
    const store = new Store();
    store.destroy();
    t.throws(() => store.subscribe(() => {}));
});

test('Store: onDestroy after store destroyed throws', t => {
    const store = new Store();
    store.destroy();
    t.throws(() => store.onDestroy(() => {}));
});