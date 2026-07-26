// @ts-check

import test from 'ava';
import { BatchSnapshot } from '../../src/core/BatchSnapshot.js';
import { Atom } from '../../src/reactives/Atom.js';

test('BatchSnapshot: getChangedProperties with empty snapshot', t => {
    const a = new Atom(0);
    const snapshot = new BatchSnapshot(a);
    const changed = snapshot.getChangedProperties(() => 0);
    t.deepEqual(changed, []);
});

test('BatchSnapshot: record and getOriginal', t => {
    const a = new Atom(0);
    const snapshot = new BatchSnapshot(a);
    snapshot.record('x', 10);
    t.is(snapshot.getOriginal('x'), 10);
    t.true(snapshot.has('x'));
    t.is(snapshot.size, 1);
});

test('BatchSnapshot: clear', t => {
    const a = new Atom(0);
    const snapshot = new BatchSnapshot(a);
    snapshot.record('x', 10);
    snapshot.clear();
    t.false(snapshot.has('x'));
    t.is(snapshot.size, 0);
});

test('BatchSnapshot: getChangedProperties with changes', t => {
    const a = new Atom(0);
    const snapshot = new BatchSnapshot(a);
    snapshot.record('x', 10);
    const changed = snapshot.getChangedProperties(() => 20);
    t.deepEqual(changed, ['x']);
});

test('BatchSnapshot: getChangedProperties with no changes', t => {
    const a = new Atom(0);
    const snapshot = new BatchSnapshot(a);
    snapshot.record('x', 10);
    const changed = snapshot.getChangedProperties(() => 10);
    t.deepEqual(changed, []);
});
