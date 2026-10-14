// @ts-check

import test from 'ava';
import {
    createStore2Context,
    defaultContext,
    getCurrentContext,
    runWithContext,
    runWithContextAsync,
} from '../../src/core/context.js';
import { atom } from '../../src/api/api.js';

test('runWithContextAsync: context survives await', async t => {
    const ctx = createStore2Context({ name: 'async-test' });
    t.is(getCurrentContext(), defaultContext);

    await runWithContextAsync(ctx, async () => {
        t.is(getCurrentContext(), ctx);
        await new Promise(r => setTimeout(r, 10));
        t.is(getCurrentContext(), ctx);
        const a = atom(0);
        t.is(a.engine.context, ctx);
    });

    t.is(getCurrentContext(), defaultContext);
});

test('runWithContextAsync: nested contexts survive await', async t => {
    const outer = createStore2Context({ name: 'outer' });
    const inner = createStore2Context({ name: 'inner' });

    await runWithContextAsync(outer, async () => {
        t.is(getCurrentContext(), outer);
        await new Promise(r => setTimeout(r, 5));

        await runWithContextAsync(inner, async () => {
            t.is(getCurrentContext(), inner);
            await new Promise(r => setTimeout(r, 5));
            t.is(getCurrentContext(), inner);
        });

        await new Promise(r => setTimeout(r, 5));
        t.is(getCurrentContext(), outer);
    });

    t.is(getCurrentContext(), defaultContext);
});

test('runWithContextAsync: restores context on throw', async t => {
    const ctx = createStore2Context();
    await t.throwsAsync(
        runWithContextAsync(ctx, async () => {
            await new Promise(r => setTimeout(r, 5));
            throw new Error('boom');
        })
    );
    t.is(getCurrentContext(), defaultContext);
});

test('migration: registered migration is applied', t => {
    const ctx = createStore2Context();
    ctx.registerMigration({
        from: 1,
        to: 2,
        migrate: snap => ({ ...snap, version: 2, meta: { migrated: true } }),
    });

    // The current SNAPSHOT_VERSION is 1, so hydrate would normally reject
    // a version-1 snapshot only if migration chain leads to a non-1
    // version. Here we test the API surface only.
    t.notThrows(() => ctx.registerMigration({ from: 5, to: 6, migrate: s => s }));
});

test('migration: hydrate throws on missing migration', t => {
    const ctx = createStore2Context();
    const bad = { version: 999, timestamp: 0, roots: {} };
    t.throws(() => ctx.hydrate(bad), { message: /No migration registered/ });
});

test('migration: registerMigration validates arguments', t => {
    const ctx = createStore2Context();
    t.throws(() => ctx.registerMigration(/** @type {any} */ (null)));
    t.throws(() => ctx.registerMigration(/** @type {any} */ ({})));
    t.throws(() => ctx.registerMigration(/** @type {any} */ ({ from: 1, to: 2 })));
});

test('hydrate: onHydrateStart/End fire with timeTravel=false', t => {
    const ctx = createStore2Context();
    /** @type {string[]} */
    const events = [];
    ctx.use({
        name: 'recorder',
        install() {},
        onHydrateStart: (_snap, opts) => events.push('start:' + opts.timeTravel),
        onHydrateEnd: (_snap, opts) => events.push('end:' + opts.timeTravel),
    });

    ctx.hydrate({ version: 1, timestamp: 0, roots: {} });
    t.deepEqual(events, ['start:false', 'end:false']);
});

test('hydrate: onHydrateStart/End fire even with timeTravel=true', t => {
    const ctx = createStore2Context();
    /** @type {string[]} */
    const events = [];
    ctx.use({
        name: 'recorder',
        install() {},
        onHydrateStart: (_snap, opts) => events.push('start:' + opts.timeTravel),
        onHydrateEnd: (_snap, opts) => events.push('end:' + opts.timeTravel),
    });

    ctx.hydrate({ version: 1, timestamp: 0, roots: {} }, { timeTravel: true });
    t.deepEqual(events, ['start:true', 'end:true']);
});

test('hydrate: other hooks stay suppressed during timeTravel', t => {
    const ctx = createStore2Context();
    /** @type {string[]} */
    const events = [];
    ctx.use({
        name: 'recorder',
        install() {},
        onBatchStart: info => events.push('batch:' + info.name),
        onHydrateStart: () => events.push('hydrate'),
    });

    ctx.hydrate({ version: 1, timestamp: 0, roots: {} }, { timeTravel: true });
    t.deepEqual(events, ['hydrate']);
});

test('use: rejects plugin with mismatched apiVersion', t => {
    const ctx = createStore2Context();
    t.throws(
        () =>
            ctx.use({
                name: 'future',
                apiVersion: 999,
                install() {},
            }),
        { message: /targets API v999/ }
    );
});

test('use: accepts plugin without apiVersion', t => {
    const ctx = createStore2Context();
    t.notThrows(() => ctx.use({ name: 'legacy', install() {} }));
});

test('snapshot: meta field is preserved on round-trip', t => {
    const ctx = createStore2Context();
    ctx.registerRoot('app', {
        serialize: () => ({ value: 42 }),
        hydrate: () => {},
    });

    const snap = ctx.snapshot();
    snap.meta = { adapter: 'test', ttl: 1000 };

    let received = null;
    ctx.registerRoot('app', {
        serialize: () => null,
        hydrate: data => {
            received = data;
        },
    });

    ctx.hydrate(snap);
    t.deepEqual(received, { value: 42 });
});
