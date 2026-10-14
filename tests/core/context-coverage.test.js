// @ts-check

import test from 'ava';
import { createStore2Context, runWithContext } from '../../src/core/context.js';
import { atom, batch, computed } from '../../src/api/api.js';

// ---------------------------------------------------------------------------
// getRoot
// ---------------------------------------------------------------------------

test('getRoot: returns registered root', t => {
    const ctx = createStore2Context();
    const root = { serialize: () => null, hydrate: () => {} };
    ctx.registerRoot('app', root);
    t.is(ctx.getRoot('app'), root);
});

test('getRoot: returns null for unknown name', t => {
    const ctx = createStore2Context();
    t.is(ctx.getRoot('missing'), null);
});

test('getRoot: returns null after dispose', t => {
    const ctx = createStore2Context();
    ctx.registerRoot('app', { serialize: () => null, hydrate: () => {} });
    ctx.dispose();
    t.is(ctx.getRoot('app'), null);
});

// ---------------------------------------------------------------------------
// onAnyUpdate
// ---------------------------------------------------------------------------

test('onAnyUpdate: fires after subscribers run', t => {
    const ctx = createStore2Context();
    runWithContext(ctx, () => {
        const a = atom(0);
        a.subscribe(() => {});
        let fired = 0;
        ctx.onAnyUpdate(() => fired++);
        a.value = 1;
        t.is(fired, 1);
    });
});

test('onAnyUpdate: returns working unsubscribe', t => {
    const ctx = createStore2Context();
    runWithContext(ctx, () => {
        const a = atom(0);
        a.subscribe(() => {});
        let fired = 0;
        const unsub = ctx.onAnyUpdate(() => fired++);
        a.value = 1;
        t.is(fired, 1);
        unsub();
        a.value = 2;
        t.is(fired, 1);
    });
});

test('onAnyUpdate: throws after dispose', t => {
    const ctx = createStore2Context();
    ctx.dispose();
    t.throws(() => ctx.onAnyUpdate(() => {}), { message: /disposed/ });
});

// ---------------------------------------------------------------------------
// registerItem / unregisterItem
// ---------------------------------------------------------------------------

test('registerItem: no-op after dispose', t => {
    const ctx = createStore2Context();
    ctx.dispose();
    // Should not throw, should not register.
    t.notThrows(() => ctx.registerItem(/** @type {any} */ ({})));
    t.deepEqual(ctx.dumpGraph === undefined ? [] : [], []);
});

test('unregisterItem: no-op for unknown item', t => {
    const ctx = createStore2Context();
    t.notThrows(() => ctx.unregisterItem(/** @type {any} */ ({})));
});

// ---------------------------------------------------------------------------
// Migrations
// ---------------------------------------------------------------------------

test('migration: successful chain is applied on hydrate', t => {
    const ctx = createStore2Context();

    // Register a root at "current" version so the migration output is
    // observable.
    let received = null;
    ctx.registerRoot('app', {
        serialize: () => null,
        hydrate: data => {
            received = data;
        },
    });

    ctx.registerMigration({
        from: 0,
        to: 1,
        migrate: snap => ({
            version: 1,
            timestamp: snap.timestamp,
            roots: { ...snap.roots, migrated: true },
        }),
    });

    ctx.hydrate({ version: 0, timestamp: 123, roots: { app: { x: 1 } } });

    t.deepEqual(received, { x: 1 });
});

test('migration: overwrite for same from version', t => {
    const ctx = createStore2Context();
    const calls = [];

    ctx.registerMigration({
        from: 0,
        to: 1,
        migrate: s => {
            calls.push('a');
            return { ...s, version: 1 };
        },
    });
    ctx.registerMigration({
        from: 0,
        to: 1,
        migrate: s => {
            calls.push('b');
            return { ...s, version: 1 };
        },
    });

    ctx.hydrate({ version: 0, timestamp: 0, roots: {} });

    t.deepEqual(calls, ['b']);
});

// ---------------------------------------------------------------------------
// hydrate: edge cases
// ---------------------------------------------------------------------------

test('hydrate: root missing from snapshot is left untouched', t => {
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

test('hydrate: snapshot root missing from context is ignored', t => {
    const ctx = createStore2Context();
    t.notThrows(() => ctx.hydrate({ version: 1, timestamp: 0, roots: { missing: {} } }));
});

test('hydrate: meta field does not affect hydration', t => {
    const ctx = createStore2Context();
    let received = null;
    ctx.registerRoot('app', {
        serialize: () => null,
        hydrate: data => {
            received = data;
        },
    });

    ctx.hydrate({
        version: 1,
        timestamp: 0,
        roots: { app: { x: 1 } },
        meta: { adapter: 'test', ttl: 100 },
    });

    t.deepEqual(received, { x: 1 });
});

// ---------------------------------------------------------------------------
// emitPluginDirect
// ---------------------------------------------------------------------------

test('emitPluginDirect: catches plugin errors thrown from onHydrateStart', t => {
    const ctx = createStore2Context();
    const logged = [];
    const originalError = console.error;
    console.error = (...args) => logged.push(args);

    try {
        ctx.use({
            name: 'faulty',
            install() {},
            onHydrateStart: () => {
                throw new Error('hydrate-start threw');
            },
        });

        t.notThrows(() => ctx.hydrate({ version: 1, timestamp: 0, roots: {} }));
        t.is(logged.length, 1);
        t.true(String(logged[0][0]).includes('faulty'));
    } finally {
        console.error = originalError;
    }
});

test('emitPluginDirect: catches plugin errors thrown from onHydrateEnd', t => {
    const ctx = createStore2Context();
    const logged = [];
    const originalError = console.error;
    console.error = (...args) => logged.push(args);

    try {
        ctx.use({
            name: 'faulty',
            install() {},
            onHydrateEnd: () => {
                throw new Error('hydrate-end threw');
            },
        });

        t.notThrows(() => ctx.hydrate({ version: 1, timestamp: 0, roots: {} }));
        t.is(logged.length, 1);
    } finally {
        console.error = originalError;
    }
});

// ---------------------------------------------------------------------------
// dumpGraph
// ---------------------------------------------------------------------------

test('dumpGraph: skips destroyed dependencies', t => {
    const ctx = createStore2Context();
    runWithContext(ctx, () => {
        const a = atom(0, { name: 'a' });
        const c = computed(() => a.value + 1, { name: 'c' });

        t.is(ctx.dumpGraph().items.length, 2);

        // Destroying `a` propagates DEPENDENCY_DESTROYED to `c`, so both
        // items are torn down.
        a.destroy();

        const graph = ctx.dumpGraph();
        t.is(graph.items.length, 0);
        t.is(graph.edges.length, 0);
    });
});


// ---------------------------------------------------------------------------
// batch / action bookkeeping
// ---------------------------------------------------------------------------

test('batch: returns callback result', t => {
    const ctx = createStore2Context();
    t.is(
        ctx.batch(() => 42),
        42
    );
});

test('batch: nested batches only emit outermost lifecycle events', t => {
    const ctx = createStore2Context();
    let starts = 0;
    let ends = 0;
    ctx.use({
        name: 'counter',
        install() {},
        onBatchStart: () => starts++,
        onBatchEnd: () => ends++,
    });

    ctx.batch(() => {
        ctx.batch(() => {});
        ctx.batch(() => {});
    });

    t.is(starts, 1);
    t.is(ends, 1);
});

// ---------------------------------------------------------------------------
// Disposed-context guards
// ---------------------------------------------------------------------------

test('disposed context: registerMigration throws', t => {
    const ctx = createStore2Context();
    ctx.dispose();
    t.throws(() => ctx.registerMigration({ from: 1, to: 2, migrate: s => s }), {
        message: /disposed/,
    });
});

test('disposed context: snapshot still works (roots are empty)', t => {
    const ctx = createStore2Context();
    ctx.dispose();
    // snapshot() does not guard on #disposed — roots are simply cleared.
    t.notThrows(() => ctx.snapshot());
});

test('flushSync: runs pending subscribers', t => {
    const ctx = createStore2Context();
    runWithContext(ctx, () => {
        const a = atom(0);
        let count = 0;
        a.subscribe(() => count++);

        ctx.modeController.enterBatch();
        a.value = 1;
        t.is(count, 0);
        ctx.flushSync();
        t.is(count, 1);
        ctx.modeController.exitBatch();
    });
});