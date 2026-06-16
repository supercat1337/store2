// @ts-check

import test from 'ava';
import { ReactiveList } from '../../src/complex/reactiveList.js';
import { ShallowReactive } from '../../src/reactives/ShallowReactive.js';

test('ReactiveList: add, getItem', t => {
    const list = new ReactiveList();
    const item1 = { name: 'item1' };
    const item2 = { name: 'item2' };

    list.add(item1, item2);

    t.deepEqual(list.getItem(0), item1);
    t.deepEqual(list.getItem(1), item2);
    t.is(list.getItem(2), undefined);
});

test('ReactiveList: setItem', t => {
    const list = new ReactiveList();
    const item1 = { name: 'item1' };
    const item2 = { name: 'item2' };

    list.add(item1, item2);

    list.setItem(0, { name: 'updatedItem1' });

    t.deepEqual(list.getItem(0), { name: 'updatedItem1' });
    t.deepEqual(list.getItem(1), item2);
});

test('ReactiveList: length', t => {
    const list = new ReactiveList();
    const item1 = { name: 'item1' };
    const item2 = { name: 'item2' };

    list.add(item1, item2);

    t.is(list.length, 2);
});

test('ReactiveList: remove', t => {
    const list = new ReactiveList();
    const item1 = { name: 'item1' };
    const item2 = { name: 'item2' };

    list.add(item1, item2);

    list.removeItem(0);

    t.is(list.length, 1);
});

test('ReactiveList: clear', t => {
    const list = new ReactiveList();
    const item1 = { name: 'item1' };
    const item2 = { name: 'item2' };

    list.add(item1, item2);

    list.clear();

    t.is(list.length, 0);
});

test('ReactiveList: removeRange', t => {
    const list = new ReactiveList();
    const item1 = { name: 'item1' };
    const item2 = { name: 'item2' };

    list.add(item1, item2);

    t.notThrows(() => {
        list.removeRange(2, -1);
    });
    t.notThrows(() => {
        list.removeRange(-2, 1);
    });
    list.removeRange(0, 1);
    t.is(list.length, 1);
});

test('ReactiveList: removeLastItem', t => {
    const list = new ReactiveList();
    const item1 = { name: 'item1' };
    const item2 = { name: 'item2' };

    list.add(item1, item2);
    list.removeLastItem();

    t.is(list.length, 1);
});

test('ReactiveList: add with no items', t => {
    const list = new ReactiveList();
    t.is(list.length, 0);
});

test('ReactiveList: add with one item', t => {
    const list = new ReactiveList();
    const item1 = { name: 'item1' };

    list.add(item1);

    t.is(list.length, 1);
});

test('ReactiveList: add with multiple items', t => {
    const list = new ReactiveList();
    const item1 = { name: 'item1' };
    const item2 = { name: 'item2' };

    list.add(item1, item2);

    t.is(list.length, 2);
});

test('ReactiveList: setItems with no items', t => {
    const list = new ReactiveList();
    list.setItems([]);
    t.is(list.length, 0);
});

test('ReactiveList: setItems with one item', t => {
    const list = new ReactiveList();
    const item1 = { name: 'item1' };

    list.setItems([item1]);

    t.is(list.length, 1);
});

test('ReactiveList: setItems with multiple items', t => {
    const list = new ReactiveList();
    const item1 = { name: 'item1' };

    list.setItems([item1]);
    t.is(list.length, 1);

    const item2 = { name: 'item2' };
    list.setItems([item1, item2]);
    t.deepEqual(list.toArray(), [item1, item2]);

    t.is(list.length, 2);
});

test('ReactiveList: setItems with multiple items #2', t => {
    const list = new ReactiveList();
    const item1 = { name: 'item1' };
    const item2 = { name: 'item2' };
    const item3 = { name: 'item3' };

    list.setItems([item1, item2, item3]);
    t.is(list.length, 3);

    list.setItems([item1, item2]);

    t.is(list.length, 2);
});

test('ReactiveList: setItems with empty array', t => {
    const list = new ReactiveList();
    list.setItems([]);
    t.is(list.length, 0);
});

test('ReactiveList: setItems with array of items', t => {
    const list = new ReactiveList();
    const item1 = { name: 'item1' };
    const item2 = { name: 'item2' };

    list.setItems([item1, item2]);

    t.is(list.length, 2);
});

test('ReactiveList: destroy', t => {
    const list = new ReactiveList();
    const item1 = { name: 'item1' };
    const item2 = { name: 'item2' };

    list.add(item1, item2);

    list.destroy();
    list.destroy();

    t.is(list.isDestroyed, true);
});

test('ReactiveList: after destroy', t => {
    const list = new ReactiveList();
    const item1 = { name: 'item1' };
    const item2 = { name: 'item2' };

    list.destroy();

    t.throws(() => {
        list.subscribe(() => {});
    });

    t.throws(() => {
        list.add(item1, item2);
    });
    t.throws(() => {
        list.removeRange(0, 1);
    });
    t.throws(() => {
        list.removeItem(0);
    });
    t.throws(() => {
        list.removeLastItem();
    });
    t.throws(() => {
        list.clear();
    });
    t.throws(() => {
        list.setItems([]);
    });
    t.throws(() => {
        list.setItem(0, item1);
    });
    t.throws(() => {
        list.getItem(0);
    });
    t.throws(() => {
        list.toArray();
    });
    t.throws(() => {
        list.length;
    });
    t.throws(() => {
        list.removeFirstItem();
    });
    t.pass();
});

test('ReactiveList: subscribe', t => {
    const list = new ReactiveList();

    const item1 = { name: 'item1' };
    const item2 = { name: 'item2' };

    let count = 0;

    list.subscribe(updates => {
        count++;
    });

    list.add(item1, item2);

    t.is(count, 1);
    list.setItem(0, { name: 'updatedItem1' });
    t.deepEqual(list.getItem(0), { name: 'updatedItem1' });
    t.is(count, 2);
});

test('ReactiveList: toArray()', t => {
    const list = new ReactiveList();
    const item1 = { name: 'item1' };
    const item2 = { name: 'item2' };

    list.add(item1, item2);

    t.deepEqual(list.toArray(), [item1, item2]);
});

// ===== Дополнительные тесты для removeRange и операций удаления =====

test('ReactiveList: removeRange removes from middle', t => {
    /** @type {ReactiveList<number>} */
    const list = new ReactiveList();
    list.setItems([1, 2, 3, 4]);

    list.removeRange(1, 2); // удаляем 2 элемента, начиная с индекса 1

    t.is(list.length, 2);
    t.deepEqual(list.toArray(), [1, 4]);
});

test('ReactiveList: removeRange removes from beginning', t => {
    const list = new ReactiveList();
    list.setItems([1, 2, 3, 4]);

    list.removeRange(0, 2);

    t.is(list.length, 2);
    t.deepEqual(list.toArray(), [3, 4]);
});

test('ReactiveList: removeRange removes from end', t => {
    const list = new ReactiveList();
    list.setItems([1, 2, 3, 4]);

    list.removeRange(2, 2);

    t.is(list.length, 2);
    t.deepEqual(list.toArray(), [1, 2]);
});

test('ReactiveList: removeRange removes all items', t => {
    const list = new ReactiveList();
    list.setItems([1, 2, 3, 4]);

    list.removeRange(0, 4);

    t.is(list.length, 0);
    t.deepEqual(list.toArray(), []);
});

test('ReactiveList: removeRange with count larger than remaining elements', t => {
    const list = new ReactiveList();
    list.setItems([1, 2, 3, 4]);

    list.removeRange(2, 10); // пытаемся удалить 10 элементов, начиная с индекса 2

    t.is(list.length, 2);
    t.deepEqual(list.toArray(), [1, 2]);
});

test('ReactiveList: removeRange with count = 0 does nothing', t => {
    const list = new ReactiveList();
    list.setItems([1, 2, 3]);

    list.removeRange(1, 0);

    t.is(list.length, 3);
    t.deepEqual(list.toArray(), [1, 2, 3]);
});

test('ReactiveList: removeRange with negative startIndex does nothing', t => {
    const list = new ReactiveList();
    list.setItems([1, 2, 3]);

    list.removeRange(-1, 1);

    t.is(list.length, 3);
    t.deepEqual(list.toArray(), [1, 2, 3]);
});

test('ReactiveList: removeRange with startIndex out of range does nothing', t => {
    const list = new ReactiveList();
    list.setItems([1, 2, 3]);

    list.removeRange(5, 1);

    t.is(list.length, 3);
    t.deepEqual(list.toArray(), [1, 2, 3]);
});

test('ReactiveList: removeItem removes correct element', t => {
    const list = new ReactiveList();
    list.setItems([10, 20, 30, 40]);

    list.removeItem(2);

    t.is(list.length, 3);
    t.deepEqual(list.toArray(), [10, 20, 40]);
});

test('ReactiveList: removeFirstItem removes first element', t => {
    const list = new ReactiveList();
    list.setItems([10, 20, 30]);

    list.removeFirstItem();

    t.is(list.length, 2);
    t.deepEqual(list.toArray(), [20, 30]);
});

test('ReactiveList: removeLastItem removes last element', t => {
    const list = new ReactiveList();
    list.setItems([10, 20, 30]);

    list.removeLastItem();

    t.is(list.length, 2);
    t.deepEqual(list.toArray(), [10, 20]);
});

test('ReactiveList: clear removes all items', t => {
    const list = new ReactiveList();
    list.setItems([1, 2, 3, 4]);

    list.clear();

    t.is(list.length, 0);
    t.deepEqual(list.toArray(), []);
});

test('ReactiveList: multiple removeRange operations maintain correctness', t => {
    const list = new ReactiveList();
    list.setItems([1, 2, 3, 4, 5, 6]);

    list.removeRange(1, 2); // удаляем 2,3 -> [1,4,5,6]
    t.deepEqual(list.toArray(), [1, 4, 5, 6]);

    list.removeRange(2, 1); // удаляем 5 -> [1,4,6]
    t.deepEqual(list.toArray(), [1, 4, 6]);

    list.removeRange(0, 1); // удаляем 1 -> [4,6]
    t.deepEqual(list.toArray(), [4, 6]);

    t.is(list.length, 2);
});

test('ReactiveList: removeRange after add and setItems', t => {
    const list = new ReactiveList();
    list.add({ a: 1 }, { b: 2 });
    list.setItems([{ c: 3 }, { d: 4 }]);

    t.deepEqual(list.toArray(), [{ c: 3 }, { d: 4 }]);

    list.removeRange(1, 1);

    t.is(list.length, 1);
    t.deepEqual(list.toArray(), [{ c: 3 }]);
});

test('ReactiveList: removeRange does not break reactivity', t => {
    const list = new ReactiveList();
    list.setItems([1, 2, 3]);

    let callCount = 0;
    const unsubscribe = list.subscribe(() => {
        callCount++;
    });

    list.removeRange(1, 1); // удаляем 2 -> [1,3]

    t.is(callCount, 1);
    t.deepEqual(list.toArray(), [1, 3]);

    unsubscribe();
});

test('ReactiveList: removeRange handles nested reactive objects', t => {
    const list = new ReactiveList();
    const obj1 = { x: 1, y: { z: 2 } };
    const obj2 = { x: 3, y: { z: 4 } };
    list.setItems([obj1, obj2]);

    list.removeRange(0, 1); // удаляем obj1

    t.is(list.length, 1);
    t.deepEqual(list.getItem(0), obj2);
    // проверяем, что объект остался реактивным
    list.getItem(0).x = 10;
    t.is(list.getItem(0).x, 10);
});
