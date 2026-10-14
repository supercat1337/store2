// @ts-check

import test from 'ava';
import {
    getArrayOfUsedReactiveItems,
    getSetOfUsedReactiveItems,
    dependencyTracker,
} from '../../src/services/dependencyTracker.js';
import { Atom } from '../../src/reactives/Atom.js';
import { Computed } from '../../src/reactives/Computed.js';

test('dependencyTracker: getArrayOfUsedReactiveItems()', t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });
    const c = new Computed(() => a.value + 1, { name: 'c' });

    let array = getArrayOfUsedReactiveItems(() => {
        t.is(dependencyTracker.isActive(), true);
        a.value = 1;
        let foo = c.value;
        t.is(foo, 2);
    });

    t.is(dependencyTracker.isActive(), false);

    // After the B2 fix, nested computed reads do not leak into the outer
    // tracking scope. Only `c` is tracked here.
    t.is(array.length, 1);
    t.is(array[0].name, 'c');
});

test('dependencyTracker: getSetOfUsedReactiveItems()', t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });
    const c = new Computed(() => a.value + 1, { name: 'c' });

    let set = getSetOfUsedReactiveItems(() => {
        t.is(dependencyTracker.isActive(), true);
        a.value = 1;
        let foo = c.value;
        t.is(foo, 2);
    });

    t.is(dependencyTracker.isActive(), false);

    t.is(set.size, 1);
    t.is(set.has(a), false);
    t.is(set.has(b), false);
    t.is(set.has(c), true);
});

// dependencyTracker: nested enable()/disable() is safe
test('dependencyTracker: nested enable and disable', t => {
    dependencyTracker.enable();
    // After Chunk A the tracker is reentrant: nested enable() no longer throws.
    dependencyTracker.enable();
    t.is(dependencyTracker.isActive(), true);

    dependencyTracker.disable();
    t.is(dependencyTracker.isActive(), true);

    dependencyTracker.disable();
    t.is(dependencyTracker.isActive(), false);
});
