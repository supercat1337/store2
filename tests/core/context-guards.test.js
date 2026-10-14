// @ts-check

import test from 'ava';
import { createStore2Context, runWithContext } from '../../src/core/context.js';
import { atom } from '../../src/api/api.js';

test('addMiddleware: throws after dispose', t => {
    const ctx = createStore2Context();
    ctx.dispose();
    t.throws(() => ctx.addMiddleware(async (a, n) => n()), { message: /disposed/ });
});

test('registerMigration: throws after dispose', t => {
    const ctx = createStore2Context();
    ctx.dispose();
    t.throws(() => ctx.registerMigration({ from: 1, to: 2, migrate: s => s }), {
        message: /disposed/,
    });
});

test('hydrate: throws on null snapshot', t => {
    const ctx = createStore2Context();
    t.throws(() => ctx.hydrate(/** @type {any} */ (null)), { message: /requires a snapshot/ });
});

test('hydrate: throws on snapshot without roots', t => {
    const ctx = createStore2Context();
    t.throws(() => ctx.hydrate(/** @type {any} */ ({ version: 1 })), {
        message: /requires a snapshot/,
    });
});

test('hydrate: missing migration throws', t => {
    const ctx = createStore2Context();
    t.throws(() => ctx.hydrate({ version: 999, timestamp: 0, roots: {} }), {
        message: /No migration registered/,
    });
});

test('hydrate: migration chain guard trips', t => {
    const ctx = createStore2Context();
    ctx.registerMigration({
        from: 0,
        to: 0, // cycles forever
        migrate: s => ({ ...s }),
    });
    t.throws(() => ctx.hydrate({ version: 0, timestamp: 0, roots: {} }), {
        message: /exceeded 100 steps/,
    });
});

test('dumpGraph: throws after dispose', t => {
    const ctx = createStore2Context();
    ctx.dispose();
    t.throws(() => ctx.dumpGraph(), { message: /disposed/ });
});

test('use: throws when plugin lacks install()', t => {
    const ctx = createStore2Context();
    t.throws(() => ctx.use(/** @type {any} */ ({ name: 'bad' })), {
        message: /must implement install/,
    });
});

test('registerRoot: throws when root lacks serialize', t => {
    const ctx = createStore2Context();
    t.throws(() => ctx.registerRoot('bad', /** @type {any} */ ({ hydrate: () => {} })), {
        message: /must implement serialize/,
    });
});

test('registerRoot: throws when root lacks hydrate', t => {
    const ctx = createStore2Context();
    t.throws(() => ctx.registerRoot('bad', /** @type {any} */ ({ serialize: () => null })), {
        message: /must implement serialize/,
    });
});

test('unregisterRoot: returns false for unknown key', t => {
    const ctx = createStore2Context();
    t.false(ctx.unregisterRoot('missing'));
});
