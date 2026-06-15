// @ts-check

import { UpdateDataRecord } from '../../src/core/UpdateDataRecord.js';
import { Atom, Computed, batch } from '../../src/index.js';
import test from 'ava';

test('Atom: get value', t => {
    const a = new Atom(0, { name: 'a' });
    t.is(a.value, 0);
    t.is(a.getValue(), 0);
    t.is(a.hasError(), false);
});

test('Atom: get value while destroyed', t => {
    const a = new Atom(0, { name: 'a' });
    a.destroy();
    t.is(a.isDestroyed, true);
    t.throws(() => a.value);
});

test('Atom: set value', t => {
    const a = new Atom(0, { name: 'a' });
    a.value = 1;
    t.is(a.value, 1);
});

test('Atom: set object value', t => {
    let foo = { a: 1 };
    const a = new Atom(foo, { name: 'a' });
    a.value = foo;
    foo = { a: 2 };
    a.value = foo;

    t.not(a.value, foo);
    t.is(a.value.a, foo.a);
});

test('Atom: set value with no changes', t => {
    const a = new Atom(1, { name: 'a' });
    let foo = 0;

    a.subscribe(() => {
        foo++;
    });

    a.value = 1;
    t.is(foo, 0);
});

test('Atom: set value in batch mode', t => {
    const a = new Atom(0, { name: 'a' });
    let foo = 0;

    a.subscribe(() => {
        foo++;
    });

    batch(() => {
        a.value = 1;
        a.value = 2;
    });

    t.is(a.value, 2);
    t.is(foo, 1);
});

test('Atom: set value in batch mode while batch mode is enabled', t => {
    const a = new Atom(0, { name: 'a' });
    let foo = 0;

    a.subscribe(() => {
        foo++;
    });

    batch(() => {
        batch(() => {
            a.value = 1;
            a.value = 2;
        });

        a.value = 3;
    });

    t.is(a.value, 3);
    t.is(foo, 1);
});

test('Atom: set value while destroyed', t => {
    const a = new Atom(0, { name: 'a' });
    a.destroy();
    t.throws(() => (a.value = 1));
});

test('Atom: set value while subscribers are running', t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });

    a.subscribe(() => {
        b.value = 1;
    });

    t.throws(() => (a.value = 1));
});

test('Atom: set value while subscribers are running in batch mode', t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });

    a.subscribe(() => {
        t.throws(() => {
            b.value = 1;
        });
    });

    batch(() => {
        a.value = 1;
    });
});

test('Atom: get valueUntracked', t => {
    //t.log("modeController.computedMode", modeController.computedMode, "modeController.batchMode", modeController.batchMode, "modeController.subscribersMode", modeController.subscribersMode);

    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });
    const c = new Computed(() => a.value + b.valueUntracked, { name: 'c' });

    let foo = 0;
    c.subscribe(() => {
        foo++;
    });

    a.value = 1;
    b.value = 2;

    t.is(b.valueUntracked, 2);

    t.is(c.value, 1);
    t.is(foo, 1);
});

test('Atom: set compare function', t => {
    const a = new Atom(
        { foo: 1, bar: 2 },
        {
            name: 'a',
            compareFunction: (a, b) => {
                return a.foo === b.foo;
            },
        }
    );

    let foo = 0;

    a.subscribe(() => {
        foo++;
    });

    a.value = { foo: 1, bar: 20 };
    t.is(a.value.foo, 1);
    t.is(a.value.bar, 2);

    a.value = { foo: 2, bar: 30 };
    t.is(a.value.foo, 2);
    t.is(a.value.bar, 30);

    t.is(foo, 1);
});

test('Atom: equals', t => {
    const a = new Atom(0, { name: 'a' });
    t.is(a.equals(0), true);
    t.is(a.equals(1), false);
});

test('Atom: hasSubscribers, clearSubscribers, clearAllSubscribers', t => {
    const a = new Atom(0, { name: 'a' });
    let foo = 0;
    let bar = 0;

    a.onHasSubscribers(() => {
        foo++;
    });

    a.onNoSubscribers(() => {
        bar++;
    });

    a.subscribe(() => {
        // #1
    });

    t.is(a.hasSubscribers(), true);
    a.clearSubscribers();
    t.is(a.hasSubscribers(), false);

    a.subscribe(() => {
        // #2
    });

    t.is(a.hasSubscribers(), true);
    a.clearSubscribers();
    t.is(a.hasSubscribers(), false);

    t.is(foo, 2);
    t.is(bar, 0);

    a.clearAllSubscribers();
    let unsubscriber = a.subscribe(() => {
        // #3
    });

    a.onNoSubscribers(() => {
        bar++;
    });

    t.is(a.hasSubscribers(), true);
    unsubscriber();

    t.is(foo, 2);
    t.is(bar, 1);

    a.subscribe(() => {
        // #4
    });

    a.destroy();
    t.is(a.hasSubscribers(), false);
});

test('Atom: unsubscribe with signal', t => {
    const a = new Atom(0, { name: 'a' });
    let foo = 0;

    const abortController = new AbortController();

    a.subscribe(
        () => {
            foo++;
        },
        { signal: abortController.signal }
    );

    a.value = 1;
    t.is(foo, 1);

    abortController.abort();

    a.value = 2;
    t.is(foo, 1);
    t.is(a.hasSubscribers(), false);
});

test('Atom: subscribe with debounce', t => {
    const a = new Atom(0, { name: 'a' });
    let foo = 0;

    a.subscribe(
        () => {
            foo++;
        },
        { delay: 100 }
    );

    a.value = 1;
    a.value = 2;
    a.value = 3;

    t.is(foo, 0);

    setTimeout(() => {
        t.is(foo, 1);
    }, 200);
});

test('Atom: throw error in subscribe', t => {
    const a = new Atom(0, { name: 'a' });

    a.subscribe(() => {
        throw new Error('error');
    });

    t.throws(() => {
        a.value = 1;
    });
});

test('Atom: get oldValue and current value in subscribe', t => {
    const a = new Atom(0, { name: 'a' });

    a.subscribe(updates => {
        let upd = /** @type {UpdateDataRecord} */ (updates.get(''));

        let { value, oldValue } = upd;
        t.is(value, 1);
        t.is(oldValue, 0);
    });

    a.value = 1;
});

test('Atom: get oldValue and current value in subscribe using batch mode', t => {
    const a = new Atom(0, { name: 'a' });
    let foo = 0;

    a.subscribe(updates => {
        foo++;
        let upd = /** @type {UpdateDataRecord} */ (updates.get(''));
        let { value, oldValue } = upd;
        t.is(value, 3);
        t.is(oldValue, 0);
    });

    batch(() => {
        a.value = 1;
        a.value = 2;
        a.value = 3;
    });

    t.is(foo, 1);
});

test('Atom: check updates data when value is not changed', t => {
    const a = new Atom(0, { name: 'a' });
    let foo = 0;

    a.subscribe(updates => {
        foo++;
    });

    batch(() => {
        a.value = 1;
        a.value = 2;
        a.value = 0;
        t.log(a.engine.updates);
    });

    t.false(a.engine.hasUpdates());
    t.is(foo, 0);
});

test('Atom: set value (another atom)', t => {
    const a = new Atom(undefined, { name: 'a' });
    const b = new Atom(undefined, { name: 'b' });
    t.throws(() => {
        // @ts-ignore
        a.value = b;
    });
});

test('Atom: set value (another atom) 2', t => {
    const a = new Atom(undefined, { name: 'a' });
    t.throws(() => {
        const b = new Atom(a, { name: 'b' });
    });
});
