// @ts-check

import test from 'ava';
import { action, atom, autorun, batch, reaction } from '../../src/api/api.js';

test('autorun: onError fires when a later run throws', t => {
    const a = atom(0);
    /** @type {Error[]} */
    const errors = [];
    let firstRun = true;

    autorun(
        () => {
            a.value;
            if (!firstRun) {
                throw new Error('effect failed');
            }
            firstRun = false;
        },
        { onError: e => errors.push(e) }
    );

    t.throws(() => {
        a.value = 1;
    });
    t.is(errors.length, 1);
    t.is(errors[0].message, 'effect failed');
});

test('reaction: onError fires when the effect throws', t => {
    const a = atom(0);
    /** @type {Error[]} */
    const errors = [];

    reaction(
        () => a.value,
        () => {
            throw new Error('reaction failed');
        },
        { onError: e => errors.push(e) }
    );

    t.throws(() => {
        a.value = 1;
    });
    t.is(errors.length, 1);
    t.is(errors[0].message, 'reaction failed');
});

test('reaction: passUpdates=false passes undefined to effectFn', t => {
    const a = atom(0);
    const b = atom(0);
    /** @type {any[]} */
    const received = [];

    reaction(
        () => [a.value, b.value],
        updates => received.push(updates),
        { passUpdates: false }
    );

    a.value = 1;
    t.is(received.length, 1);
    t.is(received[0], undefined);
});

test('reaction: passUpdates=true passes the updates Map', t => {
    const a = atom(0);
    const b = atom(0);
    /** @type {any[]} */
    const received = [];

    reaction(
        () => [a.value, b.value],
        updates => received.push(updates),
        { passUpdates: true }
    );

    a.value = 1;
    t.is(received.length, 1);
    t.true(received[0] instanceof Map);
    t.is(received[0].get('').value, 1);
});

test('reaction: passUpdates Map survives after the effect returns', t => {
    const a = atom(0);
    /** @type {any[]} */
    const received = [];

    reaction(
        () => a.value,
        updates => received.push(updates),
        { passUpdates: true }
    );

    a.value = 1;
    a.value = 2;
    a.value = 3;

    // Each invocation received its own snapshot; none of them are empty.
    t.is(received.length, 3);
    for (let i = 0; i < received.length; i++) {
        t.true(received[i] instanceof Map);
        t.is(received[i].size, 1);
        t.is(received[i].get('').value, i + 1);
    }
});

test('reaction: recomputeDependencies=false uses static deps', t => {
    const a = atom(0);
    const b = atom(0);
    let dataRuns = 0;
    let effectRuns = 0;

    reaction(
        () => {
            dataRuns++;
            const av = a.value;
            if (av > 0) {
                b.value;
            }
        },
        () => {
            effectRuns++;
        },
        { recomputeDependencies: false }
    );

    // Init: dataFn runs once, effectFn does not.
    t.is(dataRuns, 1);
    t.is(effectRuns, 0);

    // b is not in the static dependency set (a was 0 at setup).
    b.value = 1;
    t.is(dataRuns, 1);
    t.is(effectRuns, 0);

    // a is tracked. Its mutation runs the effect, not the data function.
    a.value = 1;
    t.is(dataRuns, 1);
    t.is(effectRuns, 1);

    // b remains untracked forever.
    b.value = 2;
    t.is(dataRuns, 1);
    t.is(effectRuns, 1);

    // Subsequent mutations of a re-run the effect.
    a.value = 2;
    t.is(dataRuns, 1);
    t.is(effectRuns, 2);
});

test('autorun: recomputeDependencies=false re-runs on static deps', t => {
    const a = atom(0);
    const b = atom(0);
    let runs = 0;

    autorun(
        () => {
            a.value;
            b.value;
            runs++;
        },
        { recomputeDependencies: false }
    );

    t.is(runs, 1);

    a.value = 1;
    t.is(runs, 2);

    b.value = 1;
    t.is(runs, 3);
});

test('batch: nested batch with error still unwinds cleanly', t => {
    const a = atom(0);
    let notifications = 0;
    a.subscribe(() => notifications++);

    t.throws(() => {
        batch(() => {
            a.value = 1;
            throw new Error('inner');
        });
    });

    t.is(a.value, 1);
    t.is(notifications, 1);
});
