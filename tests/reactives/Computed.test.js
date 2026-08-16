// @ts-check

import { Atom, Computed, batch } from '../../src/index.js';
import test from 'ava';

test('Computed: get value', t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });
    const c = new Computed(() => a.value + b.value, { name: 'c' });

    t.is(c.value, 0);
    b.value++;
    t.is(c.value, 1);
});

test('Computed: computed depends on another computed', t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });
    const c = new Computed(() => a.value + b.value, { name: 'c' });
    const d = new Computed(() => c.value + a.value, { name: 'd' });

    t.is(d.value, 0);
    b.value++;
    t.is(d.value, 1);
});

test("Computed: dependencies can't be stale", t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });
    const c = new Computed(() => a.value + b.value, { name: 'c' });

    b.value = 1;
    // c is stale
    //t.log(c.isStale());
    t.throws(() => new Computed(() => c.value + a.value, { name: 'd' }));
});

test('Computed: get value with error, hasError, getLastError', t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });
    const c = new Computed(
        () => {
            let result = a.value + b.value;
            if (result > 10) {
                throw new Error('a + b > 10');
            }
            return result;
        },
        { name: 'c' }
    );

    t.is(c.value, 0);
    b.value = 20;
    t.is(c.hasError(), true);
    t.is(c.getLastError() instanceof Error, true);
    b.value = 9;
    t.is(c.hasError(), false);
    t.is(c.getLastError() === null, true);
    t.is(c.isStale(), false);

    a.value = 2;
    t.is(c.hasError(), true);
    t.is(c.getLastError() instanceof Error, true);
    t.is(c.isStale(), true);

    t.throws(() => c.value);
});

test('Computed: pass error to dependents computed', t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });
    const c = new Computed(
        () => {
            if (a.value > 10) {
                throw new Error('a > 10');
            }
            return a.value + b.value;
        },
        { name: 'c' }
    );

    const d = new Computed(() => c.value * 2, { name: 'd' });

    t.is(d.value, 0);
    a.value = 20;
    t.is(d.hasError(), true);
    t.is(d.getLastError() instanceof Error, true);
});

test('Computed: no dependencies', t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });

    t.throws(
        () =>
            new Computed(() => a.valueUntracked + b.valueUntracked, {
                name: 'c',
            })
    );
});

test('Computed: smartRecompute = false', t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });

    const c = new Computed(
        () => {
            return a.value + b.value;
        },
        { smartRecompute: false, name: 'c' }
    );

    let foo = 0;

    const d = new Computed(
        () => {
            foo++;
            return c.value;
        },
        { smartRecompute: false, name: 'd' }
    );

    // foo == 1;

    a.value = 1;
    b.value = 1;
    a.value = 0;
    b.value = 0;

    // dependencies values are not changed, but d is updated
    t.is(d.value, 0);
    t.is(foo, 2);
});

test('Computed: smartRecompute = true, dependencies are not changed', t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });

    const c = new Computed(
        () => {
            return a.value + b.value;
        },
        { smartRecompute: false, name: 'c' }
    );

    let foo = 0;

    const d = new Computed(
        () => {
            foo++;
            return c.value;
        },
        { smartRecompute: true, name: 'd' }
    );
    t.is(foo, 1);
    // foo == 1;

    a.value = 1;
    b.value = 1;
    a.value = 0;
    b.value = 0;
    // dependencies are not changed, d is not updated

    t.is(d.value, 0);
    t.is(foo, 1);
});

test('Computed: smartRecompute = true, dependencies are changed', t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });

    const c = new Computed(
        () => {
            return a.value + b.value;
        },
        { smartRecompute: false, name: 'c' }
    );

    let foo = 0;

    const d = new Computed(
        () => {
            foo++;
            return c.value;
        },
        { smartRecompute: true, name: 'd' }
    );

    // foo == 1;
    /*
    t.log('c.__cachedDependentsVersionString = ', c.__cachedDependentsVersionString);
    t.log('c.engine.shouldRecalc = ', c.engine.shouldRecalc);
    t.log('d.__cachedDependentsVersionString = ', d.__cachedDependentsVersionString);
    t.log('d.engine.shouldRecalc = ', d.engine.shouldRecalc);
    */
    a.value = 1;
    b.value = 1;
    /*
    t.log('c.__cachedDependentsVersionString = ', c.__cachedDependentsVersionString);
    t.log('c.engine.shouldRecalc = ', c.engine.shouldRecalc);
    t.log('c.engine.version = ', c.engine.version);
    */
    t.is(c.value, 2);
    /*
    t.log('c.__cachedDependentsVersionString = ', c.__cachedDependentsVersionString);
    t.log('c.engine.shouldRecalc = ', c.engine.shouldRecalc);
    t.log('c.engine.version = ', c.engine.version);

    t.log('d.__cachedDependentsVersionString = ', d.__cachedDependentsVersionString);
    t.log('d.engine.shouldRecalc = ', d.engine.shouldRecalc);
*/
    t.is(d.value, 2);
    /*
    t.log(d.__cachedDependentsVersionString);
*/
    // foo == 2;

    t.is(foo, 2);
});

test('Computed: get value while computed is destroyed', t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });
    const c = new Computed(() => a.value + b.value, { name: 'c' });
    c.destroy();
    t.throws(() => c.value);
});

test('Computed: get value while one of the dependencies is destroyed', t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });
    const c = new Computed(() => a.value + b.value, { name: 'c' });
    b.destroy();
    t.throws(() => c.value);
});

test('Computed: get valueUntracked', t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });
    const c = new Computed(() => a.value + b.value, { name: 'c' });
    const d = new Computed(() => c.valueUntracked + b.value, { name: 'd' });

    let foo = 0;

    d.subscribe(() => {
        foo++;
    });

    b.value++;
    t.is(foo, 1);

    // `a` influences `d` but only through `c` that is not tracked, so `d` is not updated
    a.value++;
    t.is(foo, 1);

    b.value++;
    t.is(foo, 2);

    a.value++;
    t.is(foo, 2);
});

test('Computed: recalculate value in batch mode', t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });
    let runs = 0;
    const c = new Computed(
        () => {
            runs++;
            return a.value + b.value;
        },
        { name: 'computed1337' }
    );
    let foo = 0;

    c.subscribe(updates => {
        foo++;
        t.log('Computed subscriber called, c.value =', c.value, updates);
    });

    t.is(runs, 1);

    batch(() => {
        a.value = 1;
        b.value = 1;
        t.is(runs, 1);
        c.value; // force recompute
        t.is(runs, 2);
        a.value = 0;
        b.value = 0;
        t.is(runs, 2);
        t.log('c.engine.updates =', Array.from(c.engine.updates.entries()));
        c.value;
        t.is(runs, 3);

        t.log(
            'c.engine.dependencies = ',
            Array.from(c.engine.dependencies).map(r => r.name)
        );
        t.log('c.engine.shouldRecalc = ', c.engine.shouldRecalc);
        t.log('c.engine.updates =', Array.from(c.engine.updates.entries()));
    });

    t.log('c.engine.updates =', Array.from(c.engine.updates.entries()));
    t.log('c.engine.hasUpdates() =', c.engine.hasUpdates());
    t.log('After batch: c.value =', c.value);
    t.log('foo =', foo);

    t.is(c.value, 0);
    t.is(runs, 3);
    t.is(foo, 0);
});

test('Computed: set compare function', t => {
    const a = new Atom(
        {
            foo: 0,
            bar: 0,
        },
        { name: 'a' }
    );

    const c = new Computed(
        () => {
            return {
                foo: a.value.foo,
                // nonsense value
                bar: a.value.bar,
            };
        },
        {
            compareFunction: (a, b) => a.foo == b.foo,
        }
    );

    let foo = 0;

    c.subscribe(() => {
        foo++;
    });

    a.value = { foo: 0, bar: 1 };

    t.is(c.value.foo, 0);
    t.is(c.value.bar, 0);

    a.value = { foo: 1, bar: 10 };

    t.is(c.value.foo, 1);
    t.is(c.value.bar, 10);

    t.is(foo, 1);
});

test('Computed: getDeepDependentsArray', t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });
    const c = new Computed(() => a.value + b.value, { name: 'c' });
    const d = new Computed(() => c.value + b.value, { name: 'd' });
    const e = new Computed(() => d.value + a.value, { name: 'e' });

    t.deepEqual(a.engine.getDeepDependentsArray(), [c, d, e]);
    t.deepEqual(b.engine.getDeepDependentsArray(), [c, d, e]);
    t.deepEqual(c.engine.getDeepDependentsArray(), [d, e]);
    t.deepEqual(d.engine.getDeepDependentsArray(), [e]);
    t.deepEqual(e.engine.getDeepDependentsArray(), []);
});

test('Computed: set value (another atom) 2', t => {
    const a = new Atom(undefined, { name: 'a' });
    t.throws(() => {
        const b = new Computed(() => a, { name: 'b' });
    });
});

test('Computed: rethrows existing error when shouldRecalc is false', t => {
    const a = new Atom(0);
    const c = new Computed(() => {
        if (a.value > 5) throw new Error('computed error');
        return a.value;
    });

    // Вызываем ошибку
    a.value = 10;
    t.throws(() => c.value, { message: /computed error/ });
    t.true(c.engine.shouldRecalc);

    // Принудительно сбрасываем shouldRecalc (только для теста)
    c.engine.shouldRecalc = false;

    // Теперь при чтении должна выброситься та же ошибка без пересчёта
    t.throws(() => c.value, { message: /computed error/ });
});
