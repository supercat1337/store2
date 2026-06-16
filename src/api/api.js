// @ts-check

import { Computed } from '../reactives/Computed.js';
import { debounce, getAllPropertyDescriptors, isPlainObject } from '../helpers/tools.js';
import { modeController } from '../services/modeController.js';
import { getSetOfUsedReactiveItems } from '../services/dependencyTracker.js';
import { Atom } from '../reactives/Atom.js';
import { Collection } from '../reactives/Collection.js';
import { ShallowReactive } from '../reactives/ShallowReactive.js';

/**
 * Automatically tracks and subscribes to changes in reactive items used by the specified function.
 * This allows the function to be re-executed whenever any of its dependencies change, maintaining
 * up-to-date results.
 *
 * @param {(updates?:Map<string, import("./../core/UpdateDataRecord.js").UpdateDataRecord>)=>void} fn - The function to track and reactively execute.
 * @param {object} [options] - The options for the autorun function.
 * @param {string} [options.name] - An optional name for the autorun.
 * @param {number} [options.delay] - The number of milliseconds to delay the execution of the callback function.
 * @param {AbortSignal} [options.signal] - An optional AbortSignal to cancel the autorun.
 * @param {Function} [options.onError] - An optional function to handle errors.
 * @returns {()=>void} A function that can be called to unsubscribe the callback function from changes in the tracked dependencies.
 * @example
 * ```js
 * const a = atom(0, { name: "a" });
 * const b = atom(0, { name: "b" });
 * let foo = 0;
 *
 * autorun(() => {
 *     a.value;
 *     b.value;
 *     foo++;
 * });
 *
 * console.log(a.value, b.value, foo); // 0 0 1
 *
 * a.value++;
 * console.log(a.value, b.value, foo); // 1 0 2
 *
 * b.value++;
 * console.log(a.value, b.value, foo); // 1 1 3
 *
 * batch(() => {
 *     a.value++;
 *     b.value++;
 * });
 *
 * console.log(a.value, b.value, foo); // 2 2 4
 * ```
 */
function autorun(fn, options) {
    const _options = Object.assign(
        {
            name: undefined,
            delay: 0,
            signal: undefined,
            onError: undefined,
            type: 'autorun',
        },
        options
    );

    if (modeController.untrackMode) {
        throw new Error(
            `Autorun${
                _options.name ? ` (${_options.name})` : ''
            }: cannot initialize when untrackMode is on.`
        );
    }

    return reaction(fn, fn, _options);
}

/**
 * Tracks reactive items used by the specified data function and subscribes
 * the provided callback function to changes in these items. This ensures
 * that the callback is executed whenever any of the tracked dependencies
 * change, allowing for reactive updates based on the data function.
 *
 * @param {()=>any} dataFunction - The function whose reactive dependencies are tracked.
 * @param {(updates?:Map<string, import("../core/UpdateDataRecord.js").UpdateDataRecord>)=>void} fn - The callback function to execute when tracked dependencies change.
 * @param {object} [options] - The options for the reaction function.
 * @param {string} [options.name] - An optional name for the reaction.
 * @param {number} [options.delay] - The number of milliseconds to delay the execution of the callback function.
 * @param {AbortSignal} [options.signal] - An optional signal to abort the reaction.
 * @param {string} [options.type] - An optional type for the reaction. Defaults to "reaction".
 * @returns {()=>void} A function that can be called to unsubscribe the callback function from changes in the tracked dependencies.
 * @example
 * ```js
 * const a = atom(0);
 * const b = atom(0);
 *
 * let foo = 0;
 *
 * // runs only data-function to get dependencies
 * // and then subscribes to changes in a and b
 * reaction(
 *     () => [a.value, b.value],
 *     () => {
 *         foo++;
 *     }
 * );
 *
 * console.log(a.value, b.value, foo); // 0 0 0
 *
 * a.value++;
 * console.log(a.value, b.value, foo); // 1 0 1
 *
 * b.value++;
 * console.log(a.value, b.value, foo); // 1 1 2
 *
 * batch(() => {
 *     a.value++;
 *     b.value++;
 * });
 *
 * console.log(a.value, b.value, foo); // 2 2 3
 * ```
 */
function reaction(dataFunction, fn, options) {
    const _options = Object.assign(
        { name: undefined, delay: 0, signal: undefined, type: 'reaction' },
        options
    );

    if (modeController.untrackMode) {
        throw new Error(
            `Reaction${
                _options.name ? ` (${_options.name})` : ''
            }: cannot initialize when untrackMode is on.`
        );
    }

    if (_options.delay > 0) {
        fn = debounce(fn, _options.delay);
        _options.delay = 0;
    }

    /** @type {Function[]} */
    const unsubscribers = [];

    const items = getSetOfUsedReactiveItems(dataFunction);

    if (items.size === 0) {
        throw new Error(
            `Autorun/Reaction${
                _options.name ? ` (${_options.name})` : ''
            }: No reactive items found.`
        );
    }

    for (const item of items) {
        unsubscribers.push(item.subscribe(fn, _options));
    }

    const unsubscriber = () => {
        for (let i = 0; i < unsubscribers.length; i++) {
            unsubscribers[i]();
        }
    };

    return unsubscriber;
}

/**
 * Automatically calls the given function whenever the given predicate evaluates to true.
 * @param {()=>boolean} predicate - The predicate that should be evaluated.
 * @param {()=>void} fn - The function to be called when the predicate evaluates to true.
 * @param {object} [options] - Optional options.
 * @param {number} [options.timeout] - The number of milliseconds to wait before timing out.
 * @param {number} [options.delay] - The number of milliseconds to wait before calling the function.
 * @param {AbortSignal} [options.signal] - An AbortSignal to cancel the function call.
 * @returns {()=>void} A function that can be called to unsubscribe the callback function from changes in the tracked dependencies.
 * @example
 * ```js
 * const a = atom(0, { name: "a" });
 * let foo = 0;
 *
 * when(
 *     () => a.value > 3,
 *     () => {
 *         foo++;
 *     }
 * );
 *
 * a.value = 2; // foo = 0
 * a.value = 3; // foo = 0
 * a.value = 4; // foo = 1
 * a.value = 5; // foo = 1
 * a.value = 3; // foo = 1
 * a.value = 4; // foo = 2
 * a.value = 5; // foo = 2
 * ```
 */
function when(predicate, fn, options) {
    const computed = new Computed(predicate);
    const timeout = options?.timeout || 0;
    /** @type {ReturnType<typeof setTimeout>|null} */
    let timer;

    const mainUnsubscriber = function () {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }

        unsubscribe();
        computed.destroy();
    };

    const unsubscribe = computed.subscribe(() => {
        if (computed.value) {
            //mainUnsubscriber();
            fn();
        }
    }, options);

    if (timeout > 0) {
        timer = setTimeout(() => {
            mainUnsubscriber();
        }, timeout);
    }

    return mainUnsubscriber;
}

/**
 * Waits until the given predicate evaluates to true.
 * @param {()=>boolean} predicate - The predicate that should be evaluated.
 * @param {object} [options] - Optional options.
 * @param {number} [options.timeout] - The number of milliseconds to wait before timing out.
 * @returns {Promise<void>} A promise that resolves when the predicate evaluates to true.
 * @example
 * ```js
 * const a = atom(0, { name: "a" });
 * let foo = 0;
 *
 * waitUntil(() => a.value > 3).then(() => {
 *     foo++;
 * });
 *
 * a.value = 2; // foo = 0
 * a.value = 3; // foo = 0
 * a.value = 4; // foo = 1
 * ```
 */
function waitUntil(predicate, options) {
    return new Promise(resolve => {
        const computed = new Computed(predicate);
        const timeout = options?.timeout || 0;
        /** @type {ReturnType<typeof setTimeout>|null} */
        let timer;

        const mainUnsubscriber = function () {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }

            unsubscribe();
            computed.destroy();
        };

        const unsubscribe = computed.subscribe(() => {
            if (computed.value) {
                mainUnsubscriber();
                resolve();
            }
        });

        if (timeout > 0) {
            timer = setTimeout(() => {
                mainUnsubscriber();
            }, timeout);
        }
    });
}

/**
 * Runs the given function in an action, i.e. when there are no active
 * subscribers. This is useful for making changes to reactive items without
 * triggering subscribers.
 * @param {Function} fn - The function to be run in an action.
 * @returns {void}
 * @example
 * ```js
 * let a = atom(0, { name: "a" });
 * let b = atom(0, { name: "b" });
 *
 * let count = 0;
 *
 * a.subscribe(() => {
 *     count++;
 *     runInAction(() => {
 *         b.value = a.value;
 *     });
 * });
 *
 * a.value++;
 * console.log(a.value, b.value, count); // 1 1 1
 * ```
 */
function runInAction(fn) {
    if (modeController.subscribersMode) {
        modeController.runAfterSubscribers(fn);
    } else {
        fn();
    }
}

/**
 * Executes the specified function while batching notifications to reactive items.
 * This is useful for operations that make multiple changes to reactive items, as
 * it prevents the notifications from being sent until all changes have been made.
 * Supports nested batch calls.
 *
 * @param {Function} fn - The function to execute while batching notifications.
 * @returns {void}
 * @example
 * ```js
 * const a = atom(0);
 * const b = atom(0);
 *
 * let foo = 0;
 *
 * autorun(() => {
 *     a.value;
 *     b.value;
 *     foo++;
 * });
 *
 * console.log(a.value, b.value, foo); // 0 0 1
 *
 * batch(() => {
 *     a.value++;
 *     b.value++;
 * });
 *
 * console.log(a.value, b.value, foo); // 1 1 2
 * ```
 */
function batch(fn) {
    modeController.enterBatch();
    try {
        fn();
    } finally {
        modeController.exitBatch();
    }
}

/**
 * Executes the specified function while not tracking reactive items.
 * This is useful for operations that access reactive items without
 * actually depending on them.
 * @template T
 * @param {()=>T} fn - The function to execute while not tracking reactive items.
 * @returns {T} The result of executing the function.
 * @example
 * ```js
 * const a = atom(0);
 * const b = atom(0);
 *
 * let foo = 0;
 *
 * autorun(() => {
 *     a.value;
 *     untrack(() => {
 *         b.value;
 *     });
 *     foo++;
 * });
 * console.log(a.value, b.value, foo); // 0 0 1
 *
 * a.value++;
 * console.log(a.value, b.value, foo); // 1 0 2
 * b.value++;
 * console.log(a.value, b.value, foo); // 1 1 2
 * ```
 */
function untrack(fn) {
    const untrackMode = modeController.untrackMode;
    let result;
    modeController.untrackMode = true;
    try {
        result = fn();
    } catch (e) {
        modeController.untrackMode = untrackMode;
        throw e;
    }
    modeController.untrackMode = untrackMode;
    return result;
}

/**
 * Returns an Atom that automatically updates its value to the current time
 * at the given interval. The interval is specified in milliseconds and
 * defaults to 1000. When there are subscribers, the Atom updates its value
 * at the specified interval. When there are no subscribers, the interval
 * is cleared and the Atom's value is reset to 0.
 *
 * @param {number} [interval=1000] - The interval in milliseconds at which the Atom should update its value.
 * @returns {Atom<number>} An Atom that automatically updates its value to the current time at the given interval.
 * @example
 * ```js
 * const now = getNow();
 * console.log(now.value); // 0
 *
 * const unsubscribe = now.subscribe(() => {
 *     console.log(now.value); // Current time in milliseconds
 * });
 * ```
 */
function getNow(interval = 1000) {
    const atom = new Atom(0, { name: 'now' });
    /** @type {ReturnType<typeof setTimeout>} */
    let intervalId;

    atom.onHasSubscribers(() => {
        intervalId = setInterval(() => {
            runInAction(() => {
                atom.value = Date.now();
            });
        }, interval);
    });

    atom.onNoSubscribers(() => {
        clearInterval(intervalId);
        runInAction(() => {
            atom.value = 0;
        });
    });

    atom.onDestroy(() => {
        clearInterval(intervalId);
    });

    return atom;
}

/**
 * Creates an object that provides a way to handle the result of a Promise.
 * The object has a single method called `case` which takes an object with
 * three optional methods: `resolved`, `rejected`, and `pending`. The appropriate
 * method will be called based on the state of the promise.
 * @template T
 * @param {Promise<T>} promise - The promise to handle.
 * @returns {{case: (param0: {resolved?:(value: T)=>void, rejected?:(error: Error)=>void, pending?:()=>void})=>Promise<void>}} An object with a single method called `case`.
 * @example
 * ```js
 * const promise = new Promise((resolve, reject) => {
 *     setTimeout(() => {
 *         resolve("Hello, world!");
 *     }, 1000);
 * });
 *
 * const fromPromiseResult = fromPromise(promise);
 *
 * await fromPromiseResult.case({
 *     resolved: (value) => {
 *         console.log("Resolved:", value); // Resolved: Hello, world!
 *     },
 *     rejected: () => {
 *         console.log("Rejected");
 *     },
 *     pending: () => {
 *         console.log("Pending"); // Pending
 *     },
 * });
 * ```
 */
function fromPromise(promise) {
    /** @type {Atom<"pending"|"resolved"|"rejected">} */
    const stateAtom = new Atom('pending', { name: 'fromPromise' });
    /** @type {T} */
    let promiseResult;

    /** @type {Error} */
    let promiseError;

    /**
     * Executes the appropriate function based on the current state of the promise.
     * @param {object} param0 - An object containing the functions to execute for each state.
     * @param {(value: T)=>void} [param0.resolved] - The function to execute when the promise is resolved.
     * @param {(error: Error)=>void} [param0.rejected] - The function to execute when the promise is rejected.
     * @param {()=>void} [param0.pending] - The function to execute when the promise is pending.
     * @returns {Promise<void>} A Promise that resolves when the appropriate function has been executed.
     */
    async function caseMethod(param0) {
        if (param0.pending) {
            try {
                param0.pending();
            } catch (e) {
                console.error(e);
            }
        }

        stateAtom.subscribe(() => {
            if (stateAtom.value === 'resolved') {
                try {
                    if (param0.resolved) {
                        param0.resolved(promiseResult);
                    }
                } catch (e) {
                    console.error(e);
                }
            }

            if (stateAtom.value === 'rejected') {
                try {
                    if (param0.rejected) {
                        param0.rejected(promiseError);
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        });

        return promise
            .then(value => {
                promiseResult = value;
                stateAtom.value = 'resolved';
            })
            .catch(e => {
                promiseError = e;
                stateAtom.value = 'rejected';
            })
            .finally(() => {
                stateAtom.destroy();
            });
    }

    return {
        case: caseMethod,
    };
}

/**
 * Creates a new Atom instance. An Atom is a reactive item that holds a value. Same as `atom` but
 * returns a new Atom instance.
 * @template T
 * @param {T} value - The initial value of the Atom.
 * @param {object} [options] - Options
 * @param {string} [options.name] - The name of Atom.
 * @param {(a:T, b:T)=>boolean} [options.compareFunction] - A function that compares two values to determine if they are equal.
 * @returns {Atom<T>} A new Atom instance with the given value and options.
 * @example
 * ```js
 * const count = atom(0);
 *
 * count.subscribe(() => {
 *     console.log(count.value);
 * });
 *
 * count.value = 1;
 * ```
 */
function atom(value, options) {
    return new Atom(value, options);
}

/**
 * Creates a new Computed instance. Computed is a reactive item that holds a value that is computed from other reactive values.
 * @template T
 * @param {()=>T} fn - The function that returns the value of the Computed
 * @param {object} [options] - Options
 * @param {string} [options.name] - The name of Computed.
 * @param {(a:T, b:T)=>boolean} [options.compareFunction] - A function that compares two values to determine if they are equal.
 * @param {boolean} [options.smartRecompute] - Whether the function is a hard function. If true, it prevents calling the function by comparing the string representation of the dependencies.
 * @returns {Computed<T>} A new Computed instance with the given function and options.
 * @example
 * ```js
 * const a = atom(0);
 * const b = computed(() => a.value + 1);
 *
 * b.subscribe(() => {
 *     console.log(b.value);
 * });
 *
 * a.value = 1;
 * // b = 2
 * ```
 */
function computed(fn, options) {
    return new Computed(fn, options);
}

/**
 * Creates a new reactive Collection instance that holds an array.
 * The Collection provides reactivity for array mutations (push, pop, splice, etc.)
 * and allows subscribing to changes.
 *
 * Unlike the `Atom` and `Computed` factories, this function returns the actual
 * `Collection` instance, not just the proxied array. To access the reactive array,
 * use the `.value` property.
 *
 * @template T
 * @param {T[]} value - The initial array to observe.
 * @param {object} [options] - Configuration options.
 * @param {string} [options.name] - The name of the Collection (used for debugging).
 * @param {(a:T, b:T)=>boolean} [options.compareFunction] - Custom equality function.
 * @returns {Collection<T>} The Collection instance.
 *
 * @example
 * ```js
 * const coll = collection([1, 2, 3]);
 *
 * // Subscribe to changes
 * coll.subscribe(() => console.log('changed'));
 *
 * // Mutate the array via .value
 * coll.value.push(4); // triggers subscriber
 * console.log(coll.value); // [1, 2, 3, 4]
 *
 * // Direct property access also works (proxied)
 * coll.value[0] = 10; // triggers subscriber
 * ```
 */
function collection(value, options) {
    return new Collection(value, options);
}

/**
 * Creates a new reactive ShallowReactive instance that wraps an object.
 * The ShallowReactive provides reactivity for property assignments and deletions
 * on the top level of the object (shallow reactivity).
 *
 * This function returns the actual `ShallowReactive` instance, not just the proxy.
 * To access the reactive object, use the `.value` property.
 *
 * @template T
 * @param {T} value - The object to observe (must be a plain object or an instance).
 * @param {object} [options] - Configuration options.
 * @param {string} [options.name] - The name of the ShallowReactive (used for debugging).
 * @returns {ShallowReactive<T>} The ShallowReactive instance.
 *
 * @example
 * ```js
 * const reactive = shallowReactive({ a: 1, b: 2 });
 *
 * // Subscribe to changes
 * reactive.subscribe(() => console.log('changed'));
 *
 * // Modify the object via .value
 * reactive.value.a = 3; // triggers subscriber
 * console.log(reactive.value); // { a: 3, b: 2 }
 *
 * // Direct property access also works (proxied)
 * reactive.value.b = 5; // triggers subscriber
 * ```
 */
function shallowReactive(value, options) {
    // @ts-ignore
    return new ShallowReactive(value, options);
}

/**
 * Enhances an object to make its properties observable using specified annotations.
 *
 * @template T
 * @param {T} obj - The object to be observed.
 * @param {{[key:string]:"atom"|"computed"|"collection"|"shallowReactive"|false}} annotations -
 *        Annotations defining the type of reactivity for each property. Properties with a
 *        'false' annotation will be ignored.
 * @param {object} [options] - Options to configure the observable behavior.
 * @param {string} [options.name] - The name of the observable object. Defaults to an empty string. Using as prefix for reactive property names.
 * @returns {T} The input object with enhanced reactive properties.
 *
 * @example
 * ```js
 * class List {
 *     data = [];
 *
 *     constructor(data) {
 *         this.data = data;
 *         makeObservable(this, { data: "collection" });
 *     }
 *
 *     // not reactive property
 *     get length() {
 *         return this.data.length;
 *     }
 * }
 *
 * const list = new List([1, 2, 3]);
 *
 * let foo = 0;
 *
 * autorun((updates) => {
 *     console.log(`list.length = ${list.length}`);
 *     foo++;
 * });
 * // Outputs: list.length = 3
 *
 * console.log(foo);
 * // Outputs: 1
 *
 * list.data.push(4);
 * // Outputs: list.length = 4
 * console.log(foo);
 * // Outputs: 2
 *
 * list.data.pop();
 * // set last element to undefined. foo++
 * // Outputs: list.length = 4
 * // set new value of length/ foo++
 * // Outputs: list.length = 3
 *
 * console.log(foo);
 * // Outputs: 4
 * ```
 *
 * @example
 * ```js
 * let object = {
 *     value: 0,
 *     get double() {
 *         return this.value * 2;
 *     },
 *     increment() {
 *         this.value++;
 *     },
 * };
 *
 * makeObservable(object, { value: "atom", double: "computed" });
 *
 * let foo = 0;
 *
 * autorun(() => {
 *     foo++;
 *     object.double;
 * });
 * console.log(foo); // 1
 *
 * object.increment();
 * console.log(foo); // 2
 *
 * object.increment();
 * console.log(foo); // 3
 * ```
 */
function makeObservable(obj, annotations, options) {
    /** @type {{[key:string]:ReactiveItem}} */
    const reactiveStore = {};
    const _options = Object.assign({ name: '' }, options);

    for (const key in annotations) {
        if (annotations[key] === false) {
            continue;
        }

        if (
            /** @type {Array<string|boolean>} */ ([
                'atom',
                'collection',
                'shallowReactive',
            ]).includes(annotations[key])
        ) {
            if (annotations[key] === 'atom') {
                // @ts-ignore
                reactiveStore[key] = new Atom(obj[key], {
                    name: _options.name + '.' + key,
                });
            }

            if (annotations[key] === 'collection') {
                // @ts-ignore
                reactiveStore[key] = new Collection(obj[key], {
                    name: _options.name + '.' + key,
                });
            }

            if (annotations[key] === 'shallowReactive') {
                // @ts-ignore
                reactiveStore[key] = new ShallowReactive(obj[key], {
                    name: _options.name + '.' + key,
                });
            }
            const existingDescriptor = Object.getOwnPropertyDescriptor(obj, key);
            Object.defineProperty(obj, key, {
                get() {
                    return reactiveStore[key].getValue();
                },
                set(value) {
                    // @ts-ignore
                    reactiveStore[key].value = value;
                },
                enumerable: existingDescriptor?.enumerable ?? true,
                configurable: existingDescriptor?.configurable ?? true,
            });
        }
    }
    // @ts-ignore
    const allDescriptors = getAllPropertyDescriptors(obj);

    for (const key in annotations) {
        if (annotations[key] === 'computed') {
            // if class or plain object
            const descriptor = allDescriptors[key];
            //Object.getOwnPropertyDescriptor(obj.prototype || obj, key) || obj[key];  //

            if (descriptor && typeof descriptor.get === 'function') {
                const f = descriptor.get;
                reactiveStore[key] = new Computed(
                    function () {
                        return f.call(obj);
                    },
                    { name: _options.name + '.' + key }
                );
                const existingDescriptor = Object.getOwnPropertyDescriptor(obj, key);
                Object.defineProperty(obj, key, {
                    get() {
                        return reactiveStore[key].getValue();
                    },
                    enumerable: existingDescriptor?.enumerable ?? true,
                    configurable: existingDescriptor?.configurable ?? true,
                });
            }
        }
    }

    return obj;
}

/**
 * Extends an object with new properties and makes them observable.
 *
 * @template T
 * @template {{[key:string]:any}} R
 * @param {T} target - The object to be extended and observed.
 * @param {R} properties - The properties to add to the target object.
 * @param {{[key:string]:"atom"|"computed"|"collection"|"shallowReactive"|false}} [overrides] - Optional overrides to define the type of the reactive property. If an override is false, the key will be ignored.
 * @param {object} [options] - Options to configure the observable behavior.
 * @param {string} [options.name] - The name of the observable object. Defaults to an empty string. Using as prefix for reactive property names.
 * @returns {T & R} The extended object with observable properties.
 * @example
 * ```js
 * let object = {
 *     value: 0,
 *     get double() {
 *         return this.value * 2;
 *     },
 *     increment() {
 *         this.value++;
 *     },
 * };
 *
 * makeObservable(object, { value: "atom", double: "computed" });
 * extendObservable(object, {a: 1, b: 2});
 *
 * let foo = 0;
 *
 * autorun(() => {
 *     foo++;
 *     object.a;
 * });
 *
 * console.log(foo); // 1
 * object.a++;
 * console.log(foo); // 2
 * ```
 */
function extendObservable(target, properties, overrides, options) {
    Object.assign(/** @type {T & R} */ (/** @type {unknown} */ (target)), properties);
    makeAutoObservable(target, overrides, options, new Set(Object.keys(properties)));
    return /** @type {T & R} */ (target);
}

/**
 * Makes existing object properties observable. Same as {@link makeObservable} but infers all the properties.
 * @template T
 * @param {T} obj - The object to observe.
 * @param {{[key:string]:"atom"|"computed"|"collection"|"shallowReactive"|false}} [overrides] - The overrides to use to define type of the reactive property. If an override is false, the key will be ignored.
 * @param {object} [options] - Options to configure the observable behavior.
 * @param {string} [options.name] - The name of the observable object. Defaults to an empty string. Using as prefix for reactive property names.
 * @param {Set<string>} [filter] - A set of property keys to selectively apply annotations.
 * @returns {T}
 * @example
 * ```js
 * let object = {
 *     value: 0,
 *     get double() {
 *         return this.value * 2;
 *     },
 *     increment() {
 *         this.value++;
 *     },
 * };
 *
 * makeAutoObservable(object);
 *
 * let foo = 0;
 *
 * autorun(() => {
 *     foo++;
 *     object.double;
 * });
 * console.log(foo); // 1
 *
 * object.increment();
 * console.log(foo); // 2
 *
 * object.increment();
 * console.log(foo); // 3
 * ```
 */
function makeAutoObservable(obj, overrides = {}, options, filter) {
    const _options = Object.assign({ name: '' }, options);

    // @ts-ignore
    const allDescriptors = getAllPropertyDescriptors(obj);

    /** @type {Set<string>} */
    const atomKeys = new Set();

    /** @type {Set<string>} */
    const computedKeys = new Set();

    Object.entries(allDescriptors).forEach(descriptorObject => {
        const key = descriptorObject[0];
        const descriptor = descriptorObject[1];

        if (filter !== undefined && !filter.has(key)) {
            return;
        }

        if (/^__/.test(key)) {
            return;
        }

        if (descriptor.set || descriptor.enumerable) {
            atomKeys.add(key);
        }

        if (descriptor.get) {
            computedKeys.add(key);
        }
    });

    /** @type {{[key:string]:"atom"|"computed"|"collection"|"shallowReactive"|false}} */
    let annotations = {};

    let keys = [...atomKeys];
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        if (overrides[key] === false) {
            continue;
        }

        // @ts-ignore
        if (typeof obj[key] === 'function') {
            continue;
        }

        // @ts-ignore
        if (Array.isArray(obj[key])) {
            annotations[key] = 'collection';
            continue;
        }

        // @ts-ignore
        if (isPlainObject(obj[key])) {
            annotations[key] = 'shallowReactive';
            continue;
        }

        annotations[key] = 'atom';
    }

    keys = [...computedKeys];
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        if (overrides[key] === false) {
            continue;
        }

        annotations[key] = 'computed';
    }

    annotations = Object.assign({}, annotations, overrides);

    return makeObservable(obj, annotations, _options);
}

export {
    atom,
    computed,
    collection,
    shallowReactive,
    autorun,
    batch,
    reaction,
    when,
    waitUntil,
    getNow,
    fromPromise,
    untrack,
    runInAction,
    makeObservable,
    makeAutoObservable,
    extendObservable,
};
