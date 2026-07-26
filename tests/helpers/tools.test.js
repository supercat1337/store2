// @ts-check

import test from 'ava';
import { clone, compareAny, comparePlainObjects, debounce, getSortedReactiveItems } from '../../src/helpers/tools.js';
import { Atom } from '../../src/reactives/Atom.js';
import { Computed } from '../../src/reactives/Computed.js';

test('tools: clone()', t => {
    let arr = [1, 2, 3];
    let arrCopy = clone(arr);
    t.deepEqual(arr, arrCopy);

    let obj = { a: 1, b: 2 };
    let objCopy = clone(obj);
    t.deepEqual(obj, objCopy);

    let primitive = 2;
    t.deepEqual(primitive, clone(primitive));
});

test('tools: debounce()', t => {
    const p = new Promise(resolve => {
        const foo = debounce(() => {
            t.pass();
            resolve(1);
        }, 100);
        foo();
    });
    return p;
});

test('tools: getSortedReactiveItems()', t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });
    const c = new Computed(() => a.value + b.value, { name: 'c' });
    const d = new Atom(0, { name: 'd' });
    const e = new Atom(0, { name: 'e' });

    const set = new Set([a, e]);

    let result = getSortedReactiveItems(b, c, d, set).map(item => item.name);
    t.deepEqual(result, ['a', 'b', 'c', 'd', 'e']);
});

test('tools: compareAny()', t => {
    t.false(compareAny({ a: 1, b: 2 }, null));
    t.false(compareAny({ a: 1, b: 2 }, undefined));

    t.false(compareAny('3', 3));
    t.true(compareAny({ a: 1, b: 2 }, { a: 1, b: 2 }));
    t.false(compareAny({ a: 1, b: 2 }, { a: 1, b: 3 }));
    t.false(compareAny({ a: 1 }, { a: 1, b: 2 }));
    t.false(compareAny({ a: 1, b: 2 }, { a: 1 }));
    t.false(compareAny({ a: 1, b: 2 }, { a: 1, c: 2 }));
    t.false(compareAny({ a: 1, b: 2, c: 3 }, { a: 1, b: 2, c: 3, d: 4 }));
    t.false(compareAny({ a: 1, b: 2, c: 3, d: 4 }, { a: 1, b: 2, c: 3 }));
});

import { getAllPropertyDescriptors, getItemNamesFromSet } from '../../src/helpers/tools.js';

test('tools: compareAny with arrays', t => {
    t.true(compareAny([1, 2, 3], [1, 2, 3]));
    t.false(compareAny([1, 2, 3], [1, 2, 4]));
    t.false(compareAny([1, 2], [1, 2, 3]));
    t.false(compareAny([1, 2, 3], [1, 2]));
    t.false(compareAny([1, 2], { 0: 1, 1: 2 }));
});

test('tools: compareAny with nested objects', t => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { c: 2 } };
    const obj3 = { a: 1, b: { c: 3 } };
    t.true(compareAny(obj1, obj2));
    t.false(compareAny(obj1, obj3));
});

test('tools: compareAny with null and undefined', t => {
    t.false(compareAny(null, undefined));
    t.false(compareAny(undefined, null));
    t.false(compareAny(null, {}));
    t.false(compareAny(undefined, {}));
});

test('tools: compareAny with different types', t => {
    t.false(compareAny(1, '1'));
    t.false(compareAny(true, 1));
    t.false(compareAny(false, 0));
});

test('tools: getAllPropertyDescriptors', t => {
    class Parent {
        parentProp = 1;
    }
    class Child extends Parent {
        childProp = 2;
        get computed() { return this.childProp * 2; }
    }
    const obj = new Child();
    const descriptors = getAllPropertyDescriptors(obj);
    t.true('parentProp' in descriptors);
    t.true('childProp' in descriptors);
    t.true('computed' in descriptors);

    const shallow = getAllPropertyDescriptors(obj, 0, 0);
    t.true('childProp' in shallow);
    // при depth=0 геттер из прототипа не должен попасть
    t.false('computed' in shallow);
    // parentProp может присутствовать, поэтому не проверяем его отсутствие
});

test('tools: getItemNamesFromSet', t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: '' });
    const c = new Atom(0, { name: 'c' });
    const set = new Set([a, b, c]);

    let names = getItemNamesFromSet(set);
    t.deepEqual(names, ['a', 'c', 'unnamed']); // sorted alphabetically

    names = getItemNamesFromSet(set, { includeId: true, fallback: '?' });
    // '?' < 'a' < 'c', поэтому порядок: '?:...', 'a:...', 'c:...'
    t.true(names[0].startsWith('?:'));
    t.true(names[1].startsWith('a:'));
    t.true(names[2].startsWith('c:'));

    names = getItemNamesFromSet(set, { sorted: false });
    t.is(names.length, 3);
});

test('tools: comparePlainObjects returns true for same reference', t => {
    const obj = { a: 1 };
    // compareAny вызывает comparePlainObjects для объектов
    t.true(comparePlainObjects(obj, obj));
});

test('tools: compareAny with undefined and null', t => {
    // Строка 127-128: if (a === undefined || b === undefined) return false;
    // Но сначала выполняется a === b, поэтому undefined === undefined -> true
    t.true(compareAny(undefined, undefined));
    t.true(compareAny(null, null));
    // Разные типы
    t.false(compareAny(undefined, null));
    t.false(compareAny(null, undefined));
    t.false(compareAny(undefined, {}));
    t.false(compareAny({}, undefined));
    t.false(compareAny(undefined, 0));
    t.false(compareAny(0, undefined));
});

test('tools: getItemNamesFromSet filters out non-reactive items', t => {
    const a = new Atom(0, { name: 'a' });
    const nonReactive = { name: 'b' };
    const set = new Set([a, nonReactive]);
    const names = getItemNamesFromSet(set);
    t.deepEqual(names, ['a']); // nonReactive пропущен (строка 278-279)
});