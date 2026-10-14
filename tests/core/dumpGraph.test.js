// @ts-check

import test from 'ava';
import { createStore2Context, runWithContext } from '../../src/core/context.js';
import { atom, computed, batch } from '../../src/api/api.js';

test('dumpGraph: empty context', t => {
    const ctx = createStore2Context();
    const graph = ctx.dumpGraph();
    t.deepEqual(graph.items, []);
    t.deepEqual(graph.edges, []);
});

test('dumpGraph: standalone atom is listed', t => {
    const ctx = createStore2Context();
    runWithContext(ctx, () => {
        const a = atom(0, { name: 'a' });
        // Force the item into the registry — the engine registers at
        // construction, but only if the item is not destroyed.
        const graph = ctx.dumpGraph();
        t.is(graph.items.length, 1);
        t.is(graph.items[0].name, 'a');
        t.is(graph.items[0].type, 1); // ATOM
        t.is(graph.edges.length, 0);

        a.destroy();
    });
});

test('dumpGraph: computed produces a dependency edge', t => {
    const ctx = createStore2Context();
    runWithContext(ctx, () => {
        const a = atom(0, { name: 'a' });
        const c = computed(() => a.value + 1, { name: 'c' });

        const graph = ctx.dumpGraph();
        t.is(graph.items.length, 2);

        const aId = a.engine.id;
        const cId = c.engine.id;

        // The edge goes from dependent to dependency.
        const edge = graph.edges.find(e => e.from === cId && e.to === aId);
        t.truthy(edge);
        t.is(edge.kind, 'dep');
    });
});

test('dumpGraph: destroyed items are skipped', t => {
    const ctx = createStore2Context();
    runWithContext(ctx, () => {
        const a = atom(0, { name: 'a' });
        const b = atom(0, { name: 'b' });
        b.destroy();

        const graph = ctx.dumpGraph();
        const names = graph.items.map(i => i.name).sort();
        t.deepEqual(names, ['a']);
    });
});

test('dumpGraph: disposed context throws', t => {
    const ctx = createStore2Context();
    ctx.dispose();
    t.throws(() => ctx.dumpGraph(), { message: /disposed/ });
});
