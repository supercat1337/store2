// @ts-check

import test from 'ava';
import {
    createStore2Context,
    defaultContext,
    getCurrentContext,
    runWithContext,
} from '../../src/core/context.js';
import { atom } from '../../src/api/api.js';

test('createStore2Context returns isolated services', t => {
    const a = createStore2Context();
    const b = createStore2Context();
    t.not(a.idService, b.idService);
    t.not(a.modeController, b.modeController);
    t.not(a.dependencyTracker, b.dependencyTracker);
    t.not(a.changedItemsController, b.changedItemsController);
});

test('context name defaults to "store2"', t => {
    t.is(createStore2Context().name, 'store2');
    t.is(createStore2Context({ name: 'app' }).name, 'app');
});

test('getCurrentContext returns defaultContext when none installed', t => {
    t.is(getCurrentContext(), defaultContext);
});

test('runWithContext installs and restores context', t => {
    const custom = createStore2Context({ name: 'custom' });
    t.is(getCurrentContext(), defaultContext);
    const result = runWithContext(custom, () => {
        t.is(getCurrentContext(), custom);
        return 42;
    });
    t.is(result, 42);
    t.is(getCurrentContext(), defaultContext);
});

test('runWithContext restores context on throw', t => {
    const custom = createStore2Context();
    t.throws(() => {
        runWithContext(custom, () => {
            throw new Error('boom');
        });
    });
    t.is(getCurrentContext(), defaultContext);
});

test('runWithContext supports nesting', t => {
    const outer = createStore2Context({ name: 'outer' });
    const inner = createStore2Context({ name: 'inner' });

    runWithContext(outer, () => {
        t.is(getCurrentContext(), outer);
        runWithContext(inner, () => {
            t.is(getCurrentContext(), inner);
        });
        t.is(getCurrentContext(), outer);
    });
    t.is(getCurrentContext(), defaultContext);
});

test('atoms created inside context bind to it', t => {
    const ctx = createStore2Context();
    runWithContext(ctx, () => {
        const a = atom(0);
        t.is(a.engine.context, ctx);
        t.is(a.engine.context.idService, ctx.idService);
    });
});

test('context.batch() runs body and returns its result', t => {
    const ctx = createStore2Context();
    const r = ctx.batch(() => 7);
    t.is(r, 7);
});

test('context.batch(name, fn) sets currentBatchName during execution', t => {
    const ctx = createStore2Context();
    let seen = '';
    ctx.batch('my-batch', () => {
        seen = ctx.modeController.currentBatchName;
    });
    t.is(seen, 'my-batch');
    t.is(ctx.modeController.currentBatchName, '');
});

test('context.batch() throws if no function given', t => {
    const ctx = createStore2Context();
    t.throws(() => ctx.batch('name-only'));
});

test('registerRoot requires serialize and hydrate', t => {
    const ctx = createStore2Context();
    t.throws(() => ctx.registerRoot('bad', /** @type {any} */ ({})));
    t.throws(() => ctx.registerRoot('bad', /** @type {any} */ ({ serialize: () => null })));
    t.throws(() => ctx.registerRoot('bad', /** @type {any} */ ({ hydrate: () => {} })));
});

test('registerRoot / getRootNames / unregisterRoot', t => {
    const ctx = createStore2Context();
    const root = {
        serialize: () => ({ x: 1 }),
        hydrate: () => {},
    };
    ctx.registerRoot('a', root);
    ctx.registerRoot('b', root);
    t.deepEqual(ctx.getRootNames().sort(), ['a', 'b']);
    t.true(ctx.unregisterRoot('a'));
    t.false(ctx.unregisterRoot('missing'));
    t.deepEqual(ctx.getRootNames(), ['b']);
});

test('snapshot captures each registered root', t => {
    const ctx = createStore2Context();
    ctx.registerRoot('a', {
        serialize: () => ({ value: 1 }),
        hydrate: () => {},
    });
    ctx.registerRoot('b', {
        serialize: () => ({ value: 2 }),
        hydrate: () => {},
    });

    const snap = ctx.snapshot();
    t.is(snap.version, 1);
    t.deepEqual(snap.roots, { a: { value: 1 }, b: { value: 2 } });
    t.is(typeof snap.timestamp, 'number');
});

test('snapshot of empty context has empty roots', t => {
    const ctx = createStore2Context();
    const snap = ctx.snapshot();
    t.deepEqual(snap.roots, {});
});

test('hydrate applies to each registered root in order', t => {
    const ctx = createStore2Context();
    /** @type {Array<[string, any]>} */
    const applied = [];
    ctx.registerRoot('a', {
        serialize: () => null,
        hydrate: data => applied.push(['a', data]),
    });
    ctx.registerRoot('b', {
        serialize: () => null,
        hydrate: data => applied.push(['b', data]),
    });

    ctx.hydrate({ version: 1, timestamp: 0, roots: { a: { x: 1 }, b: { x: 2 } } });

    t.deepEqual(applied, [
        ['a', { x: 1 }],
        ['b', { x: 2 }],
    ]);
});

test('hydrate ignores roots not present in snapshot', t => {
    const ctx = createStore2Context();
    let called = false;
    ctx.registerRoot('a', {
        serialize: () => null,
        hydrate: () => {
            called = true;
        },
    });
    ctx.hydrate({ version: 1, timestamp: 0, roots: {} });
    t.false(called);
});

test('hydrate ignores snapshot roots not registered', t => {
    const ctx = createStore2Context();
    t.notThrows(() => {
        ctx.hydrate({ version: 1, timestamp: 0, roots: { missing: {} } });
    });
});

test('hydrate throws on malformed snapshot', t => {
    const ctx = createStore2Context();
    t.throws(() => ctx.hydrate(/** @type {any} */ (null)));
    t.throws(() => ctx.hydrate(/** @type {any} */ ({})));
});

test('hydrate wraps in a batch', t => {
    const ctx = createStore2Context();
    let sawBatch = false;
    ctx.registerRoot('a', {
        serialize: () => null,
        hydrate: () => {
            sawBatch = ctx.modeController.batchMode;
        },
    });
    ctx.hydrate({ version: 1, timestamp: 0, roots: { a: {} } });
    t.true(sawBatch);
});

test('hydrate without timeTravel fires plugin hooks', t => {
    const ctx = createStore2Context();
    /** @type {string[]} */
    const events = [];
    ctx.use({
        name: 'recorder',
        install() {},
        onBatchStart: info => events.push('start:' + info.name),
        onBatchEnd: info => events.push('end:' + info.name),
    });

    ctx.hydrate({ version: 1, timestamp: 0, roots: {} });
    t.deepEqual(events, ['start:hydrate', 'end:hydrate']);
});

test('hydrate with timeTravel suppresses plugin hooks', t => {
    const ctx = createStore2Context();
    /** @type {string[]} */
    const events = [];
    ctx.use({
        name: 'recorder',
        install() {},
        onBatchStart: info => events.push('start:' + info.name),
        onBatchEnd: info => events.push('end:' + info.name),
    });

    ctx.hydrate({ version: 1, timestamp: 0, roots: {} }, { timeTravel: true });

    t.deepEqual(events, []);
});

test('use(plugin) validates plugin shape', t => {
    const ctx = createStore2Context();
    t.throws(() => ctx.use(/** @type {any} */ (null)));
    t.throws(() => ctx.use(/** @type {any} */ ({})));
});

test('use(plugin) installs and exposes via plugins getter', t => {
    const ctx = createStore2Context();
    let installed = false;
    const plugin = {
        name: 'p',
        install() {
            installed = true;
        },
    };
    ctx.use(plugin);
    t.true(installed);
    t.deepEqual(ctx.plugins, [plugin]);
});

test('addMiddleware and middlewares getter', t => {
    const ctx = createStore2Context();
    /** @type {import('../../src/types.js').ActionMiddleware} */
    const mw = async (action, next) => next();
    ctx.addMiddleware(mw);
    t.deepEqual(ctx.middlewares, [mw]);
});

test('action runs body and returns its result', async t => {
    const ctx = createStore2Context();
    const result = await ctx.action('test', () => 42);
    t.is(result, 42);
});

test('action passes ActionInfo to body', async t => {
    const ctx = createStore2Context();
    /** @type {any} */
    let captured = null;
    await ctx.action('my-action', action => {
        captured = action;
    });
    t.is(captured.name, 'my-action');
    t.truthy(captured.id);
    t.is(captured.parentId, null);
    t.is(typeof captured.startTime, 'number');
    t.is(typeof captured.endTime, 'number');
    t.is(captured.error, null);
});

test('action supports parent-child nesting', async t => {
    const ctx = createStore2Context();
    /** @type {any} */
    let parentAction = null;
    /** @type {any} */
    let childAction = null;

    await ctx.action('parent', async parent => {
        parentAction = parent;
        await ctx.action('child', child => {
            childAction = child;
        });
    });

    t.is(childAction.parentId, parentAction.id);
});

test('action middleware chain runs in order', async t => {
    const ctx = createStore2Context();
    /** @type {string[]} */
    const order = [];

    ctx.addMiddleware(async (action, next) => {
        order.push('m1-before');
        const r = await next();
        order.push('m1-after');
        return r;
    });
    ctx.addMiddleware(async (action, next) => {
        order.push('m2-before');
        const r = await next();
        order.push('m2-after');
        return r;
    });

    await ctx.action('test', () => {
        order.push('body');
    });

    t.deepEqual(order, ['m1-before', 'm2-before', 'body', 'm2-after', 'm1-after']);
});

test('action middleware can short-circuit', async t => {
    const ctx = createStore2Context();
    let bodyRan = false;
    ctx.addMiddleware(async () => 'short-circuited');
    const result = await ctx.action('test', () => {
        bodyRan = true;
    });
    t.is(result, 'short-circuited');
    t.false(bodyRan);
});

test('action middleware calling next twice throws', async t => {
    const ctx = createStore2Context();
    ctx.addMiddleware(async (action, next) => {
        await next();
        await next();
    });
    await t.throwsAsync(() => ctx.action('test', () => {}));
});

test('action propagates errors and records them on ActionInfo', async t => {
    const ctx = createStore2Context();
    /** @type {any} */
    let endAction = null;
    ctx.modeController.onAction('actionEnd', action => {
        endAction = action;
    });

    await t.throwsAsync(
        () =>
            ctx.action('failing', () => {
                throw new Error('boom');
            }),
        { message: 'boom' }
    );

    t.truthy(endAction);
    t.is(endAction.error.message, 'boom');
});

test('emitPlugin catches plugin errors', t => {
    const ctx = createStore2Context();
    /** @type {any[]} */
    const logged = [];
    const originalError = console.error;
    console.error = (...args) => logged.push(args);

    try {
        ctx.use({
            name: 'faulty',
            install() {},
            onBatchStart: () => {
                throw new Error('plugin threw');
            },
        });
        ctx.batch('test', () => {});
        t.is(logged.length, 1);
        t.true(logged[0][0].includes('faulty'));
    } finally {
        console.error = originalError;
    }
});

test('context emits onBatchStart / onBatchEnd with names', t => {
    const ctx = createStore2Context();
    /** @type {any[]} */
    const starts = [];
    /** @type {any[]} */
    const ends = [];
    ctx.use({
        name: 'p',
        install() {},
        onBatchStart: info => starts.push({ name: info.name, depth: info.depth }),
        onBatchEnd: info => ends.push({ name: info.name, depth: info.depth }),
    });

    ctx.batch('foo', () => {
        ctx.batch('bar', () => {});
    });

    // Nested batches emit start once (outermost) and end once (outermost).
    t.is(starts.length, 1);
    t.is(starts[0].name, 'foo');
    t.is(ends.length, 1);
});

test('context emits onActionStart / onActionEnd', async t => {
    const ctx = createStore2Context();
    /** @type {string[]} */
    const events = [];
    ctx.use({
        name: 'p',
        install() {},
        onActionStart: a => events.push('start:' + a.name),
        onActionEnd: a => events.push('end:' + a.name),
    });

    await ctx.action('foo', () => {});

    t.deepEqual(events, ['start:foo', 'end:foo']);
});

test('flush() runs pending subscribers synchronously', t => {
    const ctx = createStore2Context();
    runWithContext(ctx, () => {
        const a = atom(0);
        let count = 0;
        a.subscribe(() => count++);

        ctx.modeController.enterBatch();
        a.value = 1;
        t.is(count, 0);
        ctx.flush();
        t.is(count, 1);
        ctx.modeController.exitBatch();
    });
});

test('dispose clears plugins and middlewares', t => {
    const ctx = createStore2Context();
    ctx.use({ name: 'p', install() {} });
    ctx.addMiddleware(async (action, next) => next());
    t.is(ctx.plugins.length, 1);
    t.is(ctx.middlewares.length, 1);

    ctx.dispose();
    t.is(ctx.plugins.length, 0);
    t.is(ctx.middlewares.length, 0);
});

test('dispose clears roots', t => {
    const ctx = createStore2Context();
    ctx.registerRoot('r', { serialize: () => null, hydrate: () => {} });
    t.is(ctx.getRootNames().length, 1);
    ctx.dispose();
    t.is(ctx.getRootNames().length, 0);
});

test('use / addMiddleware / registerRoot throw after dispose', t => {
    const ctx = createStore2Context();
    ctx.dispose();
    t.throws(() => ctx.use({ name: 'p', install() {} }));
    t.throws(() => ctx.addMiddleware(async (a, n) => n()));
    t.throws(() => ctx.registerRoot('r', { serialize: () => null, hydrate: () => {} }));
});

test('dispose is idempotent', t => {
    const ctx = createStore2Context();
    ctx.dispose();
    t.notThrows(() => ctx.dispose());
});
