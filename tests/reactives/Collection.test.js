// @ts-check

import { UpdateDataRecord } from '../../src/core/UpdateDataRecord.js';
import { Atom, batch, Collection, Computed, untrack } from '../../src/index.js';
import test from 'ava';

test('Collection: get value', t => {
    const a = new Collection([0, 1, 2], { name: 'a' });
    t.deepEqual(a.value, [0, 1, 2]);
    t.deepEqual(a.getValue(), [0, 1, 2]);
    t.is(a.hasError(), false);
});

test('Collection: get value while destroyed', t => {
    const a = new Collection([0, 1, 2], { name: 'a' });
    a.destroy();
    t.throws(() => a.value);
});

test('Collection: set value', t => {
    const a = new Collection([0, 1, 2], { name: 'a' });
    a.value = [3, 4, 5];
    t.deepEqual(a.value, [3, 4, 5]);
    t.deepEqual(a.getValue(), [3, 4, 5]);
});

test('Collection: set value while destroyed', t => {
    const a = new Collection([0, 1, 2], { name: 'a' });
    a.destroy();
    t.throws(() => (a.value = [3, 4, 5]));
});

test("Collection: set collection's item value", t => {
    const a = new Collection([0, 1, 2], { name: 'a' });
    a.value[0] = 3;
    t.deepEqual(a.value, [3, 1, 2]);
    t.deepEqual(a.getValue(), [3, 1, 2]);
});

test("Collection: set collection's item value while destroyed", t => {
    const a = new Collection([0, 1, 2], { name: 'a' });
    a.destroy();
    t.throws(() => (a.value[0] = 3));
});

test('Collection: add item', t => {
    const a = new Collection([0, 1, 2], { name: 'a' });
    a.value.push(3);
    t.deepEqual(a.value, [0, 1, 2, 3]);
    t.deepEqual(a.getValue(), [0, 1, 2, 3]);
});

test('Collection: add item while destroyed', t => {
    const a = new Collection([0, 1, 2], { name: 'a' });
    a.destroy();
    t.throws(() => a.value.push(3));
});

test('Collection: remove item', t => {
    const a = new Collection([0, 1, 2], { name: 'a' });
    a.value.pop();
    t.deepEqual(a.value, [0, 1]);
    t.deepEqual(a.getValue(), [0, 1]);
});

test('Collection: remove item while destroyed', t => {
    const a = new Collection([0, 1, 2], { name: 'a' });
    a.destroy();
    t.throws(() => a.value.pop());
});

test('Collection: destroy', t => {
    const a = new Collection([0, 1, 2], { name: 'a' });
    a.subscribe(() => {});
    a.destroy();
    t.is(a.hasError(), true);
    t.is(a.hasSubscribers(), false);
});

test('Collection: destroy while destroyed', t => {
    const a = new Collection([0, 1, 2], { name: 'a' });
    a.destroy();
    t.notThrows(() => a.destroy());
});

test('Collection: set new value', t => {
    const a = new Collection([0, 1, 2], { name: 'a' });
    a.value = [3, 4, 5, 6, 7];
    t.deepEqual(a.value, [3, 4, 5, 6, 7]);
    t.deepEqual(a.getValue(), [3, 4, 5, 6, 7]);
});

test('Collection: set new value in subscriber', t => {
    const a = new Collection([0, 1, 2], { name: 'a' });
    const b = new Atom(0);

    b.subscribe(() => {
        t.throws(() => {
            a.value = [3, 4, 5, 6, 7];
        });
    });

    b.value++;
});

test('Collection: set new value 2', t => {
    const a = new Collection([0, 1, 2], { name: 'a' });
    a.value = [3, 4];
    t.deepEqual(a.value, [3, 4]);
    t.deepEqual(a.getValue(), [3, 4]);
});

test('Collection: set new value 3', t => {
    const array = [0, 1, 2];
    const a = new Collection(array, { name: 'a' });
    t.notThrows(() => {
        a.value = a.value;
    });

    t.deepEqual(a.value, array);
    t.deepEqual(a.getValue(), array);
});

test('Collection: set null value', t => {
    const a = new Collection([0, 1, 2], { name: 'a' });
    // @ts-ignore
    t.throws(() => (a.value = null));
});

test("Collection: set collection's item value in subscriber", t => {
    const a = new Collection([0, 1, 2], { name: 'a' });
    a.subscribe(() => {
        t.throws(() => (a.value[0] = 3));
    });
    t.notThrows(() => (a.value[1] = 3));
});

test("Collection: delete collection's item value in subscriber", t => {
    const a = new Collection([0, 1, 2], { name: 'a' });
    a.subscribe(() => {
        t.throws(() => delete a.value[0]);
    });
    t.notThrows(() => delete a.value[1]);
});

test("Collection: delete collection's item value in subscriber 2", t => {
    const a = new Collection([0, 1, 2], { name: 'a' });
    a.subscribe(() => {
        t.throws(() => a.value.pop());
    });
    t.notThrows(() => a.value.pop());
});

test('Collection: value in computed', t => {
    const a = new Collection([0]);
    const b = new Atom(0);
    const c = new Computed(() => {
        return a.value[0] + b.value;
    });

    let foo = 0;

    c.subscribe(() => {
        foo++;
    });

    b.value++;
    t.is(foo, 1);

    a.value[0] = 10;
    t.is(foo, 2);
});

test('Collection: valueUntracked in computed', t => {
    const a = new Collection([0, 1, 2], { name: 'a' });
    const b = new Atom(0);
    const c = new Computed(() => {
        let local;
        untrack(() => {
            local = a.value[0];
        });

        // @ts-ignore
        return local + b.value;
    });

    let foo = 0;

    c.subscribe(() => {
        foo++;
    });

    b.value++;
    t.is(foo, 1);
    a.value[0] = 1;
    t.is(foo, 1);
});

test('Collection: valueUntracked in computed 2', t => {
    const a = new Collection([0, 1, 2], { name: 'a' });
    const b = new Atom(0);
    const c = new Computed(() => {
        let v = untrack(() => a.value[0]);
        return v + b.value;
    });

    let foo = 0;

    c.subscribe(() => {
        foo++;
    });

    b.value++;
    t.is(foo, 1);
    a.value[0] = 1;
    t.is(foo, 1);
});

test('Collection: getRawValue()', t => {
    const array = [0, 1, 2];
    const a = new Collection(array, { name: 'a' });

    t.is(a.getRawValue() instanceof Array, true);
    t.deepEqual(a.value, a.getRawValue());
});

test('Collection: with compareFunction', t => {
    const a = new Collection([{ x: 1, y: 200 }], {
        // @ts-ignore
        compareFunction: (a, b) => {
            return a.x == b.x;
        },
    });

    let foo = 0;

    a.subscribe(() => {
        foo++;
    });

    a.value[0] = { x: 1, y: 300 };
    t.deepEqual(a.value[0], { x: 1, y: 200 });
    t.is(foo, 0);

    a.value[0] = { x: 2, y: 300 };
    t.deepEqual(a.value[0], { x: 2, y: 300 });
    t.is(foo, 1);
});

test('Collection: get oldValue and current value in subscribe', t => {
    const a = new Collection([0], { name: 'a' });

    a.subscribe(updates => {
        let upd = /** @type {UpdateDataRecord} */ (updates.get('0'));
        let { value, oldValue } = upd;
        t.is(value, 1);
        t.is(oldValue, 0);
    });

    a.value[0] = 1;
});

test('Collection: get oldValue and current value in subscribe using batch mode', t => {
    const a = new Collection([0], { name: 'a' });
    let foo = 0;

    a.subscribe(updates => {
        foo++;
        let upd = /** @type {UpdateDataRecord} */ (updates.get('0'));
        let { value, oldValue } = upd;
        t.is(value, 3);
        t.is(oldValue, 0);

        let upd2 = /** @type {UpdateDataRecord} */ (updates.get('length'));
        let { value: value2, oldValue: oldValue2 } = upd2;
        t.is(value2, 2);
        t.is(oldValue2, 1);
    });

    batch(() => {
        a.value[0] = 1;
        a.value[0] = 2;
        a.value[0] = 3;
        a.value.length = 2;
    });

    t.is(foo, 1);
});

test('Collection: check updates data when value is not changed', t => {
    const a = new Collection([0], { name: 'a' });
    let foo = 0;

    a.subscribe(updates => {
        foo++;
        t.log('SUBSCRIBER CALLED');
        t.log('updates keys:', Array.from(updates.keys()));
        t.log(
            'updates entries:',
            Array.from(updates.entries()).map(([k, v]) => ({
                k,
                type: v.type,
                old: v.oldValue,
                new: v.value,
            }))
        );
    });

    batch(() => {
        a.value[0] = 1;
        a.value[0] = 2;
        a.value[0] = 0;
        a.value.length = 1;
    });

    t.log(
        'After batch: a.engine.updates =',
        Array.from(a.engine.updates.entries()).map(([k, v]) => ({
            k,
            type: v.type,
            old: v.oldValue,
            new: v.value,
        }))
    );
    t.log('a.engine.hasUpdates() =', a.engine.hasUpdates());
    t.log('foo =', foo);

    t.false(a.engine.hasUpdates());
    t.is(foo, 0);
});
