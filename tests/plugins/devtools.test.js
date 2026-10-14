// @ts-check

import test from 'ava';
import { createStore2Context, createDevToolsPlugin, Store, atom } from '../../src/index.js';

/**
 * Helper: create an isolated context with a store holding a single counter
 * atom, register the store as a root, and install a DevTools plugin.
 */
function setup() {
    const ctx = createStore2Context({ name: 'test' });
    const store = new Store();
    const count = atom(0, { name: 'count' });

    store.addItems({ count });
    ctx.registerRoot('app', store);

    const devtools = createDevToolsPlugin({
        name: 'test-app',
        connectToExtension: false,
    });
    ctx.use(devtools);

    return { ctx, store, count, devtools };
}

test('devtools: records a baseline entry on install', t => {
    const { devtools } = setup();
    const history = devtools.getHistory();
    t.is(history.length, 1);
    t.is(history[0].name, '@@INIT');
    t.is(devtools.getCurrentIndex(), 0);
});

test('devtools: records one entry per action', async t => {
    const { ctx, count, devtools } = setup();

    await ctx.action('increment', () => {
        count.value++;
    });

    await ctx.action('increment', () => {
        count.value++;
    });

    const history = devtools.getHistory();
    t.is(history.length, 3);
    t.is(history[1].name, 'increment');
    t.is(history[2].name, 'increment');
    t.is(devtools.getCurrentIndex(), 2);
});

test('devtools: jumpTo restores the value of an earlier entry', async t => {
    const { ctx, count, devtools } = setup();

    await ctx.action('inc', () => {
        count.value = 1;
    });
    await ctx.action('inc', () => {
        count.value = 2;
    });
    await ctx.action('inc', () => {
        count.value = 3;
    });

    t.is(count.value, 3);

    devtools.jumpTo(1);
    t.is(count.value, 1);
    t.is(devtools.getCurrentIndex(), 1);

    devtools.jumpTo(3);
    t.is(count.value, 3);
    t.is(devtools.getCurrentIndex(), 3);

    devtools.jumpTo(0);
    t.is(count.value, 0);
    t.is(devtools.getCurrentIndex(), 0);
});

test('devtools: a new action after jumpTo truncates the future', async t => {
    const { ctx, count, devtools } = setup();

    await ctx.action('a', () => {
        count.value = 1;
    });
    await ctx.action('b', () => {
        count.value = 2;
    });
    await ctx.action('c', () => {
        count.value = 3;
    });

    t.is(devtools.getHistory().length, 4);

    devtools.jumpTo(1);
    t.is(count.value, 1);

    await ctx.action('d', () => {
        count.value = 100;
    });

    const history = devtools.getHistory();
    // [@@INIT, a, d] — b and c were discarded.
    t.is(history.length, 3);
    t.is(history[2].name, 'd');
    t.is(count.value, 100);
    t.is(devtools.getCurrentIndex(), 2);
});

test('devtools: jumpTo during time-travel does not record a new entry', async t => {
    const { ctx, count, devtools } = setup();

    await ctx.action('a', () => {
        count.value = 1;
    });
    await ctx.action('b', () => {
        count.value = 2;
    });

    const before = devtools.getHistory().length;
    devtools.jumpTo(1);
    devtools.jumpTo(0);
    devtools.jumpTo(2);

    t.is(devtools.getHistory().length, before);
});

test('devtools: subscribers fire on new entries and on jumpTo', async t => {
    const { ctx, count, devtools } = setup();

    /** @type {Array<{ name: string | null, index: number }>} */
    const events = [];
    devtools.subscribe((entry, index) => {
        events.push({ name: entry ? entry.name : null, index });
    });

    await ctx.action('a', () => {
        count.value = 1;
    });
    await ctx.action('b', () => {
        count.value = 2;
    });

    // Install already recorded the baseline before we subscribed, so we see
    // only entries created after the subscription.
    t.deepEqual(events, [
        { name: 'a', index: 1 },
        { name: 'b', index: 2 },
    ]);

    events.length = 0;
    devtools.jumpTo(0);
    t.deepEqual(events, [{ name: '@@INIT', index: 0 }]);
});

test('devtools: maxAge prunes the oldest entries', async t => {
    const ctx = createStore2Context({ name: 'test' });
    const store = new Store();
    const count = atom(0, { name: 'count' });
    store.addItems({ count });
    ctx.registerRoot('app', store);

    const devtools = createDevToolsPlugin({
        connectToExtension: false,
        maxAge: 3,
    });
    ctx.use(devtools);

    for (let i = 1; i <= 5; i++) {
        await ctx.action(`inc-${i}`, () => {
            count.value = i;
        });
    }

    const history = devtools.getHistory();
    t.is(history.length, 3);
    // Oldest two entries (@@INIT and inc-1) were pruned; history now holds
    // inc-2, inc-3, inc-4? Wait — we pushed 6 entries total, pruned 3.
    // Actually 1 baseline + 5 actions = 6. maxAge 3 keeps the last 3:
    // inc-3, inc-4, inc-5.
    t.is(history[0].name, 'inc-3');
    t.is(history[2].name, 'inc-5');
});

test('devtools: reset clears history and records a new baseline', async t => {
    const { ctx, count, devtools } = setup();

    await ctx.action('a', () => {
        count.value = 1;
    });

    t.is(devtools.getHistory().length, 2);

    devtools.reset();

    t.is(devtools.getHistory().length, 1);
    t.is(devtools.getHistory()[0].name, '@@INIT');
    t.is(devtools.getCurrentIndex(), 0);
});

test('devtools: disconnect is safe without extension', t => {
    const { devtools } = setup();
    t.notThrows(() => devtools.disconnect());
});

test('devtools: getCurrentEntry returns baseline before any action', t => {
    const { devtools } = setup();
    const entry = devtools.getCurrentEntry();
    t.truthy(entry);
    t.is(entry.name, '@@INIT');
});

test('devtools: jumpTo out of range is a no-op', async t => {
    const { ctx, count, devtools } = setup();
    await ctx.action('a', () => {
        count.value = 1;
    });

    const before = devtools.getCurrentIndex();
    devtools.jumpTo(-1);
    devtools.jumpTo(999);
    t.is(devtools.getCurrentIndex(), before);
    t.is(count.value, 1);
});

test('devtools: jumpTo current index is a no-op', async t => {
    const { ctx, count, devtools } = setup();
    await ctx.action('a', () => {
        count.value = 1;
    });

    const snapshotsBefore = JSON.stringify(devtools.getHistory());
    devtools.jumpTo(devtools.getCurrentIndex());
    t.is(JSON.stringify(devtools.getHistory()), snapshotsBefore);
});

test('devtools: subscriber errors are caught', async t => {
    const { ctx, count, devtools } = setup();
    const logged = [];
    const originalError = console.error;
    console.error = (...args) => logged.push(args);

    try {
        devtools.subscribe(() => {
            throw new Error('listener threw');
        });
        await ctx.action('a', () => {
            count.value = 1;
        });
        t.is(logged.length, 1);
    } finally {
        console.error = originalError;
    }
});

test('devtools: unsubscribe stops listener', async t => {
    const { ctx, count, devtools } = setup();
    let callCount = 0;
    const unsub = devtools.subscribe(() => callCount++);

    await ctx.action('a', () => {
        count.value = 1;
    });
    const afterFirst = callCount;
    t.true(afterFirst > 0);

    unsub();
    await ctx.action('b', () => {
        count.value = 2;
    });
    t.is(callCount, afterFirst);
});

test('devtools: extension bridge initialises and forwards actions', async t => {
    const sent = [];
    const subscriptions = [];

    /** @type {any} */ (globalThis).__REDUX_DEVTOOLS_EXTENSION__ = {
        connect(opts) {
            return {
                init(state) {
                    sent.push({ type: 'init', state });
                },
                send(name, state) {
                    sent.push({ type: 'send', name, state });
                },
                subscribe(fn) {
                    subscriptions.push(fn);
                    return () => {};
                },
            };
        },
    };

    try {
        const ctx = createStore2Context({ name: 'ext-test' });
        const store = new Store();
        const a = atom(0, { name: 'a' });
        store.addItems({ a });
        ctx.registerRoot('app', store);

        const devtools = createDevToolsPlugin({ name: 'ext-app' });
        ctx.use(devtools);

        await ctx.action('increment', () => {
            a.value++;
        });

        const init = sent.find(e => e.type === 'init');
        const snd = sent.find(e => e.type === 'send');
        t.truthy(init);
        t.truthy(snd);
        t.is(snd.name, 'increment');
        t.is(subscriptions.length, 1);
    } finally {
        delete (/** @type {any} */ (globalThis).__REDUX_DEVTOOLS_EXTENSION__);
    }
});

test('devtools: extension JUMP_TO_ACTION triggers hydrate', async t => {
    /** @type {Array<(message: any) => void>} */
    const subscriptions = [];

    /** @type {any} */ (globalThis).__REDUX_DEVTOOLS_EXTENSION__ = {
        connect() {
            return {
                init() {},
                send() {},
                subscribe(fn) {
                    subscriptions.push(fn);
                    return () => {};
                },
            };
        },
    };

    try {
        const ctx = createStore2Context({ name: 'ext-test' });
        const store = new Store();
        const a = atom(0, { name: 'a' });
        store.addItems({ a });
        ctx.registerRoot('app', store);

        const devtools = createDevToolsPlugin({ name: 'ext-app' });
        ctx.use(devtools);

        await ctx.action('one', () => {
            a.value = 1;
        });
        await ctx.action('two', () => {
            a.value = 2;
        });
        t.is(a.value, 2);

        // Extension emits JUMP_TO_ACTION with actionId = 0 (first action).
        // We translate to our index 1 because our entry 0 is the baseline.
        subscriptions[0]({
            type: 'DISPATCH',
            payload: { type: 'JUMP_TO_ACTION', actionId: 0 },
        });

        t.is(a.value, 1);
        t.is(devtools.getCurrentIndex(), 1);
    } finally {
        delete (/** @type {any} */ (globalThis).__REDUX_DEVTOOLS_EXTENSION__);
    }
});

test('devtools: extension RESET clears history', async t => {
    /** @type {Array<(message: any) => void>} */
    const subscriptions = [];

    /** @type {any} */ (globalThis).__REDUX_DEVTOOLS_EXTENSION__ = {
        connect() {
            return {
                init() {},
                send() {},
                subscribe(fn) {
                    subscriptions.push(fn);
                    return () => {};
                },
            };
        },
    };

    try {
        const ctx = createStore2Context({ name: 'ext-test' });
        const store = new Store();
        const a = atom(0, { name: 'a' });
        store.addItems({ a });
        ctx.registerRoot('app', store);

        const devtools = createDevToolsPlugin({ name: 'ext-app' });
        ctx.use(devtools);

        await ctx.action('one', () => {
            a.value = 1;
        });
        await ctx.action('two', () => {
            a.value = 2;
        });
        t.is(devtools.getHistory().length, 3);

        subscriptions[0]({ type: 'DISPATCH', payload: { type: 'RESET' } });

        t.is(devtools.getHistory().length, 1);
        t.is(devtools.getCurrentIndex(), 0);
    } finally {
        delete (/** @type {any} */ (globalThis).__REDUX_DEVTOOLS_EXTENSION__);
    }
});

test('devtools: connectToExtension false skips the bridge', async t => {
    let connectCalls = 0;
    /** @type {any} */ (globalThis).__REDUX_DEVTOOLS_EXTENSION__ = {
        connect() {
            connectCalls++;
            return {
                init() {},
                send() {},
                subscribe() {
                    return () => {};
                },
            };
        },
    };

    try {
        const ctx = createStore2Context({ name: 'ext-test' });
        const store = new Store();
        store.addItems({ a: atom(0, { name: 'a' }) });
        ctx.registerRoot('app', store);

        const devtools = createDevToolsPlugin({
            name: 'no-ext',
            connectToExtension: false,
        });
        ctx.use(devtools);

        t.is(connectCalls, 0);
    } finally {
        delete (/** @type {any} */ (globalThis).__REDUX_DEVTOOLS_EXTENSION__);
    }
});
