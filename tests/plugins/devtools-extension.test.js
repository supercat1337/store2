// @ts-check

import test from 'ava';
import { Store, atom, createDevToolsPlugin, createStore2Context } from '../../src/index.js';

/**
 * Installs a fake Redux DevTools Extension on `globalThis` and returns
 * handles for the messages sent to it and for the message callbacks the
 * plugin subscribed to.
 */
function installFakeExtension() {
    /** @type {Array<{ type: string, name?: string, state?: any }>} */
    const sent = [];

    /** @type {Array<(message: any) => void>} */
    const subscribers = [];

    /** @type {(() => void) | null} */
    let unsubscribeReturn = () => {};

    /** @type {any} */ (globalThis).__REDUX_DEVTOOLS_EXTENSION__ = {
        connect() {
            return {
                init(state) {
                    sent.push({ type: 'init', state });
                },
                send(name, state) {
                    sent.push({ type: 'send', name, state });
                },
                subscribe(fn) {
                    subscribers.push(fn);
                    return unsubscribeReturn;
                },
            };
        },
    };

    return {
        sent,
        subscribers,
        setUnsubscribeReturn(fn) {
            unsubscribeReturn = fn;
        },
        uninstall() {
            delete (/** @type {any} */ (globalThis).__REDUX_DEVTOOLS_EXTENSION__);
        },
    };
}

/**
 * Creates an isolated context with a counter atom, registers it, and
 * installs a DevTools plugin connected to the fake extension.
 */
function setupConnected() {
    const ctx = createStore2Context({ name: 'ext-test' });
    const store = new Store();
    const count = atom(0, { name: 'count' });
    store.addItems({ count });
    ctx.registerRoot('app', store);

    const devtools = createDevToolsPlugin({ name: 'ext-app' });
    ctx.use(devtools);

    return { ctx, store, count, devtools };
}

test.serial('extension: JUMP_TO_STATE jumps to the baseline', async t => {
    const ext = installFakeExtension();
    try {
        const { ctx, count, devtools } = setupConnected();

        await ctx.action('one', () => {
            count.value = 1;
        });
        await ctx.action('two', () => {
            count.value = 2;
        });
        t.is(count.value, 2);
        t.is(devtools.getCurrentIndex(), 2);

        ext.subscribers[0]({
            type: 'DISPATCH',
            payload: { type: 'JUMP_TO_STATE' },
        });

        t.is(count.value, 0);
        t.is(devtools.getCurrentIndex(), 0);
    } finally {
        ext.uninstall();
    }
});

test.serial('extension: ignores messages that are not DISPATCH', async t => {
    const ext = installFakeExtension();
    try {
        const { ctx, count, devtools } = setupConnected();

        await ctx.action('one', () => {
            count.value = 1;
        });
        const before = devtools.getCurrentIndex();

        ext.subscribers[0]({ type: 'START' });
        ext.subscribers[0]({ type: 'ACTION', payload: { type: 'X' } });
        ext.subscribers[0](null);
        ext.subscribers[0]('not an object');
        ext.subscribers[0]({ type: 'DISPATCH' }); // no payload

        t.is(devtools.getCurrentIndex(), before);
        t.is(count.value, 1);
    } finally {
        ext.uninstall();
    }
});

test.serial('extension: ignores DISPATCH with unknown payload type', async t => {
    const ext = installFakeExtension();
    try {
        const { ctx, count, devtools } = setupConnected();

        await ctx.action('one', () => {
            count.value = 1;
        });
        const before = devtools.getCurrentIndex();

        ext.subscribers[0]({
            type: 'DISPATCH',
            payload: { type: 'COMMIT' },
        });

        t.is(devtools.getCurrentIndex(), before);
        t.is(count.value, 1);
    } finally {
        ext.uninstall();
    }
});

test.serial('extension: disconnect invokes the extension unsubscribe', async t => {
    const ext = installFakeExtension();
    let unsubscribeCalls = 0;
    ext.setUnsubscribeReturn(() => {
        unsubscribeCalls++;
    });

    try {
        const { devtools } = setupConnected();

        t.is(unsubscribeCalls, 0);
        devtools.disconnect();
        t.is(unsubscribeCalls, 1);

        // Second disconnect is a no-op.
        devtools.disconnect();
        t.is(unsubscribeCalls, 1);
    } finally {
        ext.uninstall();
    }
});

test.serial('extension: disconnect swallows unsubscribe errors', async t => {
    const ext = installFakeExtension();
    ext.setUnsubscribeReturn(() => {
        throw new Error('unsubscribe failed');
    });

    const warnings = [];
    const originalWarn = console.warn;
    console.warn = (...args) => warnings.push(args);

    try {
        const { devtools } = setupConnected();
        t.notThrows(() => devtools.disconnect());
        t.is(warnings.length, 1);
        t.true(String(warnings[0][0]).includes('failed to unsubscribe'));
    } finally {
        console.warn = originalWarn;
        ext.uninstall();
    }
});

test.serial('extension: send failures are logged and do not break actions', async t => {
    /** @type {any} */ (globalThis).__REDUX_DEVTOOLS_EXTENSION__ = {
        connect() {
            return {
                init() {},
                send() {
                    throw new Error('send failed');
                },
                subscribe() {
                    return () => {};
                },
            };
        },
    };

    const warnings = [];
    const originalWarn = console.warn;
    console.warn = (...args) => warnings.push(args);

    try {
        const { ctx, count } = setupConnected();
        await ctx.action('increment', () => {
            count.value = 1;
        });

        t.is(count.value, 1);
        t.is(warnings.length, 1);
        t.true(String(warnings[0][0]).includes('failed to send'));
    } finally {
        console.warn = originalWarn;
        delete (/** @type {any} */ (globalThis).__REDUX_DEVTOOLS_EXTENSION__);
    }
});

test.serial('extension: init failures are logged and do not break install', t => {
    /** @type {any} */ (globalThis).__REDUX_DEVTOOLS_EXTENSION__ = {
        connect() {
            return {
                init() {
                    throw new Error('init failed');
                },
                send() {},
                subscribe() {
                    return () => {};
                },
            };
        },
    };

    const warnings = [];
    const originalWarn = console.warn;
    console.warn = (...args) => warnings.push(args);

    try {
        const ctx = createStore2Context({ name: 'ext-test' });
        const store = new Store();
        store.addItems({ a: atom(0, { name: 'a' }) });
        ctx.registerRoot('app', store);

        const devtools = createDevToolsPlugin({ name: 'ext-app' });
        t.notThrows(() => ctx.use(devtools));
        t.is(warnings.length, 1);
        t.true(String(warnings[0][0]).includes('init failed'));
    } finally {
        console.warn = originalWarn;
        delete (/** @type {any} */ (globalThis).__REDUX_DEVTOOLS_EXTENSION__);
    }
});

test.serial('extension: connect failures do not break install', t => {
    /** @type {any} */ (globalThis).__REDUX_DEVTOOLS_EXTENSION__ = {
        connect() {
            throw new Error('connect failed');
        },
    };

    const warnings = [];
    const originalWarn = console.warn;
    console.warn = (...args) => warnings.push(args);

    try {
        const ctx = createStore2Context({ name: 'ext-test' });
        const store = new Store();
        store.addItems({ a: atom(0, { name: 'a' }) });
        ctx.registerRoot('app', store);

        const devtools = createDevToolsPlugin({ name: 'ext-app' });
        t.notThrows(() => ctx.use(devtools));

        t.true(warnings.some(w => String(w[0]).includes('failed to connect')));

        // Plugin still works without an extension.
        t.notThrows(() => devtools.disconnect());
    } finally {
        console.warn = originalWarn;
        delete (/** @type {any} */ (globalThis).__REDUX_DEVTOOLS_EXTENSION__);
    }
});

test.serial('extension: subscribe returning a non-function is tolerated', async t => {
    /** @type {any} */ (globalThis).__REDUX_DEVTOOLS_EXTENSION__ = {
        connect() {
            return {
                init() {},
                send() {},
                subscribe() {
                    return 'not a function';
                },
            };
        },
    };

    try {
        const ctx = createStore2Context({ name: 'ext-test' });
        const store = new Store();
        const count = atom(0, { name: 'count' });
        store.addItems({ count });
        ctx.registerRoot('app', store);

        const devtools = createDevToolsPlugin({ name: 'ext-app' });
        ctx.use(devtools);

        await ctx.action('inc', () => {
            count.value = 1;
        });

        // disconnect must not throw even though no unsubscribe was stored.
        t.notThrows(() => devtools.disconnect());
    } finally {
        delete (/** @type {any} */ (globalThis).__REDUX_DEVTOOLS_EXTENSION__);
    }
});

test.serial('extension: emitChange continues when one listener throws', async t => {
    const ext = installFakeExtension();
    try {
        const { ctx, count, devtools } = setupConnected();

        const calls = [];
        const originalError = console.error;
        console.error = () => {};

        try {
            devtools.subscribe(() => {
                calls.push('first');
                throw new Error('boom');
            });
            devtools.subscribe(() => {
                calls.push('second');
            });

            await ctx.action('inc', () => {
                count.value = 1;
            });

            // The first listener threw, but the second one still ran.
            t.deepEqual(calls.slice(0, 2), ['first', 'second']);
        } finally {
            console.error = originalError;
        }
    } finally {
        ext.uninstall();
    }
});
