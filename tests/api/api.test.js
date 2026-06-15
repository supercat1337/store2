// @ts-check

import test from 'ava';

import { Atom } from '../../src/index.js';
import {
    autorun,
    batch,
    reaction,
    when,
    waitTrue,
    getNow,
    fromPromise,
    untrack,
    runInAction,
    atom,
    computed,
    collection,
    shallowReactive,
    makeObservable,
    makeAutoObservable,
    extendObservable,
} from '../../src/api/api.js';
import { modeController } from '../../src/services/modeController.js';
import { sleep } from '../../src/helpers/tools.js';
import { getArrayOfUsedReactiveItems } from '../../src/services/dependencyTracker.js';
import { COMPUTED, SHALLOW_REACTIVE } from '../../src/core/Engine.js';

test('reaction should track dependencies', t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });
    const c = new Atom(0, { name: 'c' });

    let foo = 0;

    // runs only data-function
    reaction(
        () => [a.value, b.value],
        () => {
            c.value;
            foo++;
        }
    );

    t.is(foo, 0);

    a.value++;
    t.is(foo, 1);

    b.value++;
    t.is(foo, 2);

    batch(() => {
        a.value++;
        b.value++;
    });

    t.is(foo, 3);
});

test('reaction with unsubscriber', t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });
    const c = new Atom(0, { name: 'c' });

    let foo = 0;

    const unsubscriber = reaction(
        () => [a.value, b.value],
        () => {
            c.value;
            foo++;
        }
    );

    t.is(foo, 0);

    a.value++;
    t.is(foo, 1);

    unsubscriber();

    b.value++;
    t.is(foo, 1);

    batch(() => {
        a.value++;
        b.value++;
    });

    t.is(foo, 1);
});

test('reaction() throws Error when untrackMode is on', t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });
    let foo = 0;

    t.throws(() => {
        untrack(() => {
            reaction(
                () => [a.value, b.value],
                () => {
                    foo++;
                }
            );
        });
    });

    t.is(foo, 0);
});

test('reaction() with delay', t => {
    const a = new Atom(0, { name: 'a' });

    let foo = 0;

    reaction(
        () => a.value,
        () => {
            foo++;
        },
        { delay: 100 }
    );

    a.value++;
    a.value++;
    a.value++;

    t.is(foo, 0);

    setTimeout(() => {
        t.is(foo, 1);
    }, 150);
});

test('reaction() with error', t => {
    const a = new Atom(0, { name: 'a' });

    reaction(
        () => a.value,
        () => {
            throw new Error('error');
        }
    );

    t.throws(() => {
        a.value++;
    });

    t.is(a.value, 1);
});

test('No reactive items found', t => {
    t.throws(() => {
        reaction(
            () => {},
            () => {}
        );
    });
});

test('autorun() runs and subscribes to reactive items', t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });
    let foo = 0;

    autorun(() => {
        a.value;
        b.value;
        foo++;
    });

    t.is(foo, 1);

    a.value++;
    t.is(foo, 2);

    b.value++;
    t.is(foo, 3);

    batch(() => {
        a.value++;
        b.value++;
    });

    t.is(foo, 4);
});

test('autorun() throws Error when untrackMode is on', t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });
    let foo = 0;

    t.throws(() => {
        untrack(() => {
            autorun(() => {
                a.value;
                b.value;
                foo++;
            });
        });
    });
});

test('autorun() with unsubscriber()', t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });
    let foo = 0;

    const unsubscriber = autorun(() => {
        a.value;
        b.value;
        foo++;
    });

    t.is(foo, 1);

    a.value++;
    t.is(foo, 2);

    unsubscriber();

    b.value++;
    t.is(foo, 2);

    batch(() => {
        a.value++;
        b.value++;
    });

    t.is(foo, 2);
});

test('batch() should update atoms in a single transaction', t => {
    const a = new Atom(0);
    const b = new Atom(0);

    let foo = 0;

    autorun(() => {
        a.value;
        b.value;
        foo++;
    });

    t.is(foo, 1);

    batch(() => {
        a.value++;
        b.value++;
    });

    t.is(foo, 2);
});

test('batch() should throw error if throws in callback', t => {
    t.is(modeController.batchMode, false);

    t.throws(() => {
        batch(() => {
            batch(() => {
                batch(() => {
                    throw new Error('error');
                });
                // Внутри внешних батчей режим всё ещё активен
                t.is(modeController.batchMode, true);
            });
            t.is(modeController.batchMode, true);
        });
    });

    t.is(modeController.batchMode, false);
});

test('untrack()', t => {
    const a = new Atom(0);
    const b = new Atom(0);

    let foo = 0;

    autorun(() => {
        a.value;
        untrack(() => {
            b.value;
        });
        foo++;
    });

    t.is(foo, 1);

    a.value++;
    t.is(foo, 2);
    b.value++;
    t.is(foo, 2);
});

test('untrack() in untrack', t => {
    modeController.untrackMode = false;

    untrack(() => {
        modeController.untrackMode = false;
        untrack(() => {
            untrack(() => {
                modeController.untrackMode = false;
            });
            t.is(modeController.untrackMode, true);
        });
        t.is(modeController.untrackMode, false);
    });

    t.is(modeController.untrackMode, false);
});

test('getNow() should return an Atom with the current time when subscribed', t => {
    t.log(`modeController.subscribersMode = ${modeController.subscribersMode}`);

    return new Promise(resolve => {
        const now = getNow(100); // Using a smaller interval for testing purposes
        t.is(now.value, 0);

        const unsubscribe = now.subscribe(() => {
            t.true(now.value > 0);
            unsubscribe();
        });

        setTimeout(() => {
            t.true(now.value === 0);
            resolve();
        }, 200);
    });
});

test('runInAction() should work when used in a reaction', t => {
    let a = new Atom(0, { name: 'a' });
    let b = new Atom(0, { name: 'b' });

    let count = 0;

    a.subscribe(() => {
        count++;
        runInAction(() => {
            b.value = a.value;
        });
    });

    a.value++;
    t.is(count, 1);
    t.is(b.value, 1);

    a.value++;
    t.is(count, 2);
    t.is(b.value, 2);
});

test('waitTrue', async t => {
    const a = new Atom(0, { name: 'a' });
    let foo = 0;

    waitTrue(() => a.value > 3).then(() => {
        foo++;
    });

    await sleep(100);
    a.value = 1;
    await sleep(100);
    a.value = 2;
    await sleep(100);
    a.value = 3;
    await sleep(100);
    a.value = 4;
    await sleep(100);
    a.value = 5;

    t.is(foo, 1);
});

test('waitTrue with timeout', async t => {
    const a = new Atom(0, { name: 'a' });
    let foo = 0;

    waitTrue(() => a.value > 3, { timeout: 10 }).then(() => {
        t.log(`a = ${a.value}`);
        t.log(foo);
        foo++;
    });

    await sleep(100);
    a.value = 1;
    await sleep(100);
    a.value = 2;
    await sleep(100);
    a.value = 3;
    await sleep(100);
    a.value = 4;
    await sleep(100);
    a.value = 5;

    t.is(foo, 0);
});

test('when', async t => {
    const a = new Atom(0, { name: 'a' });
    let foo = 0;

    when(
        () => a.value > 3,
        () => {
            foo++;
        }
    );

    t.is(foo, 0);
    a.value = 1;
    a.value = 2;
    a.value = 3;
    a.value = 4;
    a.value = 5;
    t.is(foo, 1);
    a.value = 3;
    t.is(foo, 1);
    a.value = 4;
    t.is(foo, 2);
});

test('when with timeout', async t => {
    const a = new Atom(0, { name: 'a' });
    let foo = 0;

    when(
        () => a.value > 3,
        () => {
            foo++;
            t.pass();
        },
        { timeout: 10 }
    );

    await sleep(100);
    a.value = 1;
    await sleep(100);
    a.value = 2;
    await sleep(100);
    a.value = 3;
    await sleep(100);
    a.value = 4;
    await sleep(100);
    a.value = 5;

    t.is(foo, 0);
});

test('fromPromise handles pending promise', async t => {
    const promise = new Promise(resolve => {
        setTimeout(() => {
            resolve('Hello, world!');
        }, 1000);
    }); // Create a pending promise

    const fromPromiseResult = fromPromise(promise);

    let resolvedCalled = false;
    let rejectedCalled = false;
    let pendingCalled = false;

    await fromPromiseResult.case({
        resolved: value => {
            resolvedCalled = true;
            t.is(value, 'Hello, world!');
        },
        rejected: () => {
            rejectedCalled = true;
        },
        pending: () => {
            pendingCalled = true;
        },
    });

    t.true(resolvedCalled);
    t.false(rejectedCalled);
    t.true(pendingCalled);
});

test('fromPromise handles resolved promise', async t => {
    const promise = Promise.resolve('resolved value');
    const fromPromiseResult = fromPromise(promise);

    let resolvedCalled = false;
    let rejectedCalled = false;
    let pendingCalled = false;

    await fromPromiseResult.case({
        resolved: value => {
            resolvedCalled = true;
            t.is(value, 'resolved value');
        },
        rejected: () => {
            rejectedCalled = true;
        },
        pending: () => {
            pendingCalled = true;
        },
    });

    t.true(resolvedCalled);
    t.false(rejectedCalled);
    t.true(pendingCalled);
});

test('fromPromise handles rejected promise', async t => {
    const promise = Promise.reject(new Error('rejected error'));

    const fromPromiseResult = fromPromise(promise);

    let resolvedCalled = false;
    let rejectedCalled = false;
    let pendingCalled = false;

    await fromPromiseResult.case({
        resolved: () => {
            resolvedCalled = true;
        },
        rejected: error => {
            rejectedCalled = true;
            t.is(error.message, 'rejected error');
        },
        pending: () => {
            pendingCalled = true;
        },
    });

    t.true(pendingCalled);
    t.false(resolvedCalled);
    t.true(rejectedCalled);
});

test('fromPromise no case methods', async t => {
    let foo = 0;
    const promise = new Promise((resolve, rejected) => {
        foo++;
        resolve(true);
    });
    const fromPromiseResult = fromPromise(promise);

    await fromPromiseResult.case({});
    t.is(foo, 1);
});

test('fromPromise: ignore errors in case methods', async t => {
    let foo = 0;
    const caseObject = {
        resolved: () => {
            throw new Error('resolved error');
        },
        rejected: () => {
            throw new Error('rejected error');
        },
        pending: () => {
            throw new Error('pending error');
        },
    };

    const promise = new Promise((resolve, rejected) => {
        foo++;
        resolve(true);
    });

    const fromPromiseResult = fromPromise(promise);
    await fromPromiseResult.case(caseObject);
    t.is(foo, 1);

    const rejectedPromise = new Promise((resolve, rejected) => {
        foo++;
        rejected();
    });

    const rejectedPromiseResult = fromPromise(rejectedPromise);
    await rejectedPromiseResult.case(caseObject);
    t.is(foo, 2);
});

test('atom', t => {
    const a = atom(0, { name: 'a' });
    t.is(a.value, 0);
    a.value = 1;
    t.is(a.value, 1);
});

test('computed', t => {
    const a = atom(0, { name: 'a' });
    const b = atom(0, { name: 'b' });
    const c = computed(() => a.value + b.value, { name: 'c' });

    t.is(c.value, 0);
    a.value = 1;
    t.is(c.value, 1);
    b.value = 1;
    t.is(c.value, 2);
});

test('collection', t => {
    const a = collection([0, 1, 2], { name: 'a' });
    t.is(a.length, 3);
});

test('shallowReactive', t => {
    const a = shallowReactive({ foo: 0 }, { name: 'a' });
    t.is(a.foo, 0);
    a.foo = 1;
    t.is(a.foo, 1);
});

test('makeObservable: Class (atom, computed, false)', t => {
    class Doubler {
        /** @type {number} */
        value;

        /**
         * Not reactive
         * @type {number}
         * */
        value_2 = 1;

        /**
         * Creates a new Doubler instance.
         * @param {number} value - The number to double.
         */
        constructor(value) {
            this.value = value;
            makeObservable(this, {
                value: 'atom',
                double: 'computed',
                value_2: false,
            });
        }

        get double() {
            return this.value * 2;
        }

        getDouble() {
            return this.value * 2;
        }

        increment() {
            this.value++;
        }
    }

    const d = new Doubler(0);

    let foo = 0;

    autorun(() => {
        d.value_2++;
        d.double;
        foo++;
    });

    t.is(foo, 1);

    d.increment();
    t.is(foo, 2);

    d.increment();
    t.is(foo, 3);

    //console.log("==============");
});

test('makeObservable 2: Object (atom, computed)', t => {
    let object = {
        /** @type {number} */
        value: 0,

        get double() {
            return this.value * 2;
        },

        getDouble() {
            return this.value * 2;
        },

        increment() {
            this.value++;
        },
    };

    makeObservable(object, { value: 'atom', double: 'computed' });

    let foo = 0;

    autorun(() => {
        foo++;
        object.double;
    });

    t.is(foo, 1);

    object.increment();
    t.is(foo, 2);

    object.increment();
    t.is(foo, 3);
});

test('makeObservable 3: Object (shallowReactive, computed)', t => {
    let d = {
        value: { foo: 0, bar: 0 },

        get double() {
            return this.value.foo * 2;
        },

        incrementFoo() {
            this.value.foo++;
        },

        incrementBar() {
            this.value.bar++;
        },
    };

    makeObservable(d, { value: 'shallowReactive', double: 'computed' });

    let foo = 0;

    autorun(() => {
        foo++;
        d.double;
    });

    t.is(foo, 1);

    d.incrementFoo();
    d.incrementBar();
    t.is(foo, 2);

    d.incrementFoo();
    d.incrementBar();
    t.is(foo, 3);
});

/**
 * NOTE: In the current implementation, mutating array methods on a Collection
 * (push, pop, splice, etc.) trigger separate reactive updates for `length`
 * and for the affected indices. As a result, without explicit batching,
 * a single operation like `push` or `pop` increments the subscription counter
 * by 2. Wrapping the operation in `batch()` groups the updates into one.
 * The tests below reflect this behavior.
 */
test('makeObservable 4: Class (collection)', t => {
    class List {
        /** @type {number[]} */
        data = [];

        /**
         * @param {number[]} data
         */
        constructor(data) {
            this.data = data;
            makeObservable(this, { data: 'collection' });
        }

        // not reactive property
        get length() {
            return this.data.length;
        }
    }

    const list = new List([1, 2, 3]);

    let foo = 0;

    autorun(updates => {
        t.log(`list.length = ${list.length}`);
        t.log(updates);
        //list.length;
        foo++;
    });

    t.is(foo, 1);

    list.data.push(4);
    t.is(foo, 3);

    list.data.pop();
    // set last element to undefined. foo++
    // set new value of length/ foo++

    t.log(list.data);
    t.is(foo, 5);

    t.deepEqual(list.data, [1, 2, 3]);
});

/**
 * NOTE: In the current implementation, mutating array methods on a Collection
 * (push, pop, splice, etc.) trigger separate reactive updates for `length`
 * and for the affected indices. As a result, without explicit batching,
 * a single operation like `push` or `pop` increments the subscription counter
 * by 2. Wrapping the operation in `batch()` groups the updates into one.
 * The tests below reflect this behavior.
 */
test('makeObservable 4: Class (collection) with batch', t => {
    class List {
        /** @type {number[]} */
        data = [];

        /**
         * @param {number[]} data
         */
        constructor(data) {
            this.data = data;
            makeObservable(this, { data: 'collection' });
        }

        // not reactive property
        get length() {
            return this.data.length;
        }
    }

    const list = new List([1, 2, 3]);

    let foo = 0;

    autorun(updates => {
        t.log(`list.length = ${list.length}`);
        t.log(updates);
        //list.length;
        foo++;
    });

    t.is(foo, 1);

    batch(() => {
        list.data.push(4);
    });

    t.is(foo, 2);

    list.data.pop();
    // set last element to undefined. foo++
    // set new value of length/ foo++

    t.log(list.data);
    t.is(foo, 4);

    t.deepEqual(list.data, [1, 2, 3]);
});

test('makeObservable 5: Class (collection, computed)', t => {
    class List {
        /** @type {number[]} */
        data = [];

        /**
         * @param {number[]} data
         */
        constructor(data) {
            this.data = data;
            makeObservable(this, { data: 'collection', length: 'computed' });
        }

        // not reactive property
        get length() {
            return this.data.length;
        }
    }

    const list = new List([1, 2, 3]);

    let foo = 0;

    autorun(updates => {
        t.log(`list.length = ${list.length}`);
        //list.length;
        foo++;
    });

    t.is(foo, 1);

    list.data.push(4);
    t.is(foo, 2);

    list.data.pop();
    // set last element to undefined. foo++
    // set new value of length/ foo++

    t.log(list.data);
    t.is(foo, 3);

    t.deepEqual(list.data, [1, 2, 3]);
});

test('makeObservable 6: Class (no computed)', t => {
    class List {
        /**
         * // not reactive property
         * @type {number[]}
         * */
        data = [];

        /**
         * @param {number[]} data
         */
        constructor(data) {
            this.data = data;
            makeObservable(this, { length: 'computed' });
        }

        // not reactive property
        get length() {
            return this.data.length;
        }
    }

    t.throws(() => {
        let list = new List([1, 2, 3]);
        t.log(list.length);
    });
});

test('makeAutoObservable', t => {
    class Doubler {
        /** @type {number} */
        value;

        /**
         * Not reactive
         * @type {number}
         * */
        value_2 = 1;

        /**
         * Creates a new Doubler instance.
         * @param {number} value - The number to double.
         */
        constructor(value) {
            this.value = value;
            makeAutoObservable(this, { value_2: false });
        }

        get double() {
            return this.value * 2;
        }

        getDouble() {
            return this.value * 2;
        }

        increment() {
            this.value++;
        }
    }

    const d = new Doubler(0);

    let foo = 0;

    autorun(() => {
        foo++;
        d.double;
    });

    t.is(foo, 1);

    d.increment();
    t.is(foo, 2);

    d.increment();
    t.is(foo, 3);
});

test('makeAutoObservable 2', t => {
    class A {
        propertyA = 1;

        get doubleA() {
            return this.propertyA * 2;
        }
    }

    class B extends A {
        propertyB = 1;

        get doubleB() {
            return this.propertyB * 2;
        }

        get sum() {
            return this.doubleA + this.doubleB;
        }

        constructor() {
            super();
            makeAutoObservable(this);
        }
    }

    const b = new B();
    let foo = 0;

    autorun(() => {
        foo++;
        b.sum;
    });

    b.propertyA = 2;
    t.is(foo, 2);

    // 2 * 2 + 1 * 2 = 6
    t.is(b.sum, 6);

    b.propertyB = 3;
    // 2 * 2 + 3 * 2 = 10
    t.is(foo, 3);
    t.is(b.sum, 10);
});

test('makeAutoObservable 3: Class (collection)', t => {
    class List {
        /** @type {number[]} */
        data = [];

        func = () => {
            return false;
        };

        /**
         * @param {number[]} data
         */
        constructor(data) {
            this.data = data;
            makeAutoObservable(this, {}, { name: 'list' });
        }

        get length() {
            return this.data.length;
        }
    }

    const list = new List([1]);

    let foo = 0;

    autorun(updates => {
        t.log(`list.length = ${list.length}`);
        foo++;
    });

    // is computed
    let computed = getArrayOfUsedReactiveItems(() => {
        list.length;
    })[0];

    // is collection
    let collection = getArrayOfUsedReactiveItems(() => {
        list.data[0];
    })[0];

    // is undefined
    let func = getArrayOfUsedReactiveItems(() => {
        list.func();
    })[0];

    t.is(collection.name, 'list.data');
    t.is(computed.name, 'list.length');

    // @ts-ignore
    t.is(func, undefined);

    t.is(collection.hasSubscribers(), false);
    t.is(computed.hasSubscribers(), true);

    t.is(foo, 1);
    list.data.push(4);

    t.is(foo, 2);

    list.data.pop();
    // set new value of length. foo++

    t.is(foo, 3);

    t.deepEqual(list.data, [1]);
});

test('makeAutoObservable 4: Class (shallowReactive)', t => {
    class CustomStore {
        /**
         * customStore.data
         * @type {{[key:string]:number}}
         * */
        data = {};

        /**
         * customStore.foo
         */
        get foo() {
            return this.data.foo;
        }

        // no reactive
        get bar() {
            return this.data.bar;
        }

        /**
         * @param {{[key:string]:number}} data
         */
        constructor(data) {
            this.data = data;
            makeAutoObservable(this, { bar: false }, { name: 'customStore' });
        }
    }

    const store = new CustomStore({ foo: 1, bar: 2 });

    // is computed
    let computedFoo = getArrayOfUsedReactiveItems(() => {
        store.foo;
    })[0];

    let computedBar = getArrayOfUsedReactiveItems(() => {
        // tracks only customStore.data
        store.bar;
    })[0];

    t.is(computedFoo.engine.type, COMPUTED);
    t.is(computedBar.engine.type, SHALLOW_REACTIVE);
    t.is(computedBar.name, 'customStore.data');

    let foo = 0;

    autorun(updates => {
        //t.log("updates: ", updates);
        t.log(`data = ${JSON.stringify(store.data)}`);
        foo++;
    });
    t.is(foo, 1);

    store.data.baz = 3;

    t.is(foo, 2);

    delete store.data.baz;

    t.is(foo, 3);

    t.deepEqual(store.data, { foo: 1, bar: 2 });
});

test('extendObservable', t => {
    class Doubler {
        /** @type {number} */
        value;

        /**
         * Not reactive
         * @type {number}
         * */
        value_2 = 1;

        /**
         * Creates a new Doubler instance.
         * @param {number} value - The number to double.
         */
        constructor(value) {
            this.value = value;
            makeAutoObservable(this);
        }

        get double() {
            return this.value * 2;
        }

        getDouble() {
            return this.value * 2;
        }

        increment() {
            this.value++;
        }
    }

    const d = new Doubler(0);
    const d2 = extendObservable(d, { a: 1 });
    t.is(d, d2);

    let foo = 0;
    let bar = 0;

    autorun(() => {
        bar++;
        d2.double;
    });
    //bar == 1

    autorun(() => {
        foo++;
        d2.a;
    });

    t.is(foo, 1);

    d2.a++;
    t.is(foo, 2);

    d2.increment();
    //bar == 2

    t.is(bar, 2);
});

test('makeAutoObservable 5', t => {
    let object = {
        /** @type {number} */
        value: 0,

        get double() {
            return this.value * 2;
        },

        getDouble() {
            return this.value * 2;
        },

        increment() {
            this.value++;
        },
    };

    makeAutoObservable(object);

    let foo = 0;

    autorun(() => {
        foo++;
        object.double;
    });

    t.is(foo, 1);

    object.increment();
    t.is(foo, 2);

    object.increment();
    t.is(foo, 3);
});
