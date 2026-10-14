// @ts-check

import { Computed } from '../reactives/Computed.js';
import { Atom } from '../reactives/Atom.js';
import { Collection } from '../reactives/Collection.js';
import { ShallowReactive } from '../reactives/ShallowReactive.js';
import { debounce, getAllPropertyDescriptors, isPlainObject } from '../helpers/tools.js';
import { getCurrentContext } from '../core/context.js';

/**
 * Runs `fn` with the current context's dependency tracker enabled and
 * returns the set of items read during the call.
 * @param {() => void} fn
 * @returns {Set<import('../reactives/ReactiveItem.js').ReactiveItem>}
 */
function collectDependencies(fn) {
    const tracker = getCurrentContext().dependencyTracker;
    tracker.enable();
    /** @type {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} */
    let deps;
    try {
        fn();
        // Snapshot must be taken before disable(), which restores the
        // previous (outer) tracking scope.
        deps = tracker.data;
    } finally {
        tracker.disable();
    }
    return deps;
}

/**
 * Creates a reactive subscription with configurable dependency tracking.
 *
 * @param {() => any} dataFn
 * @param {(updates?: Map<string, import('../core/UpdateDataRecord.js').UpdateDataRecord>) => void} effectFn
 * @param {object} options
 * @param {string} [options.name]
 * @param {number} [options.delay]
 * @param {AbortSignal} [options.signal]
 * @param {Function} [options.onError]
 * @param {boolean} [options.recomputeDependencies=true]
 * @param {boolean} [options.isAutorun=false]
 * @param {boolean} [options.passUpdates=false]
 * @returns {() => void}
 */
function createReactiveSubscription(dataFn, effectFn, options = {}) {
    const ctx = getCurrentContext();

    const {
        name = '',
        delay = 0,
        signal = undefined,
        onError = undefined,
        recomputeDependencies = true,
        isAutorun = false,
        passUpdates = false,
    } = options;

    if (ctx.modeController.untrackMode) {
        throw new Error(
            `Cannot initialize reactive subscription${
                name ? ` (${name})` : ''
            } when untrackMode is on.`
        );
    }

    const finalEffect = delay > 0 ? debounce(effectFn, delay) : effectFn;

    /** @type {Array<() => void>} */
    let unsubscribers = [];

    let isActive = true;
    let isRunning = false;

    /** @type {Set<import('../reactives/ReactiveItem.js').ReactiveItem> | null} */
    let staticDependencies = null;

    /** @type {Map<string, import('../core/UpdateDataRecord.js').UpdateDataRecord>} */
    const collectedUpdates = new Map();

    /**
     * @param {Map<string, import('../core/UpdateDataRecord.js').UpdateDataRecord>} updates
     * @returns {void}
     */
    const onChange = updates => {
        if (updates && passUpdates) {
            for (const [key, record] of updates) {
                collectedUpdates.set(key, record);
            }
        }
        run();
    };

    /**
     * @param {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} deps
     * @returns {Array<() => void>}
     */
    function subscribeTo(deps) {
        const unsubs = [];
        for (const item of deps) {
            const unsub = item.subscribe(onChange, { signal });
            unsubs.push(unsub);
        }
        return unsubs;
    }

    /**
     * The main runner.
     */
    function run() {
        if (!isActive || isRunning) {
            return;
        }
        isRunning = true;

        try {
            if (recomputeDependencies) {
                for (const unsub of unsubscribers) {
                    try {
                        unsub();
                    } catch (e) {
                        console.error(e);
                    }
                }
                unsubscribers = [];

                const deps = collectDependencies(dataFn);
                if (deps.size === 0) {
                    throw new Error(`No reactive items found${name ? ` (${name})` : ''}.`);
                }
                unsubscribers = subscribeTo(deps);
            }

            // For autorun with recomputeDependencies=true, dataFn === effectFn
            // and the effect already ran during dependency collection above.
            // Otherwise we must run the effect explicitly here.
            const shouldRunEffect = !isAutorun || !recomputeDependencies;

            if (shouldRunEffect) {
                // Snapshot the collected updates before clearing. The effect
                // owns this Map; the internal accumulator is reset for the
                // next cycle immediately.
                const updatesForEffect =
                    passUpdates && collectedUpdates.size > 0
                        ? new Map(collectedUpdates)
                        : undefined;

                collectedUpdates.clear();

                ctx.modeController.enterBatch();
                try {
                    finalEffect(updatesForEffect);
                } finally {
                    ctx.modeController.exitBatch();
                }
            }
        } catch (error) {
            if (onError) {
                onError(error);
            }
            throw error;
        } finally {
            isRunning = false;
        }
    }

    // ----- Initialization -----
    const initialDeps = collectDependencies(dataFn);
    if (initialDeps.size === 0) {
        throw new Error(`No reactive items found${name ? ` (${name})` : ''}.`);
    }

    if (recomputeDependencies) {
        unsubscribers = subscribeTo(initialDeps);
    } else {
        staticDependencies = initialDeps;
        unsubscribers = subscribeTo(staticDependencies);
    }

    return function unsubscribe() {
        isActive = false;
        for (const unsub of unsubscribers) {
            try {
                unsub();
            } catch (e) {
                console.error(e);
            }
        }
        unsubscribers = [];
        staticDependencies = null;
        collectedUpdates.clear();
    };
}

/**
 * Autorun – runs the effect immediately and re-runs it on any dependency
 * change.
 *
 * @param {() => void} fn
 * @param {object} [options]
 * @param {string} [options.name]
 * @param {number} [options.delay]
 * @param {AbortSignal} [options.signal]
 * @param {Function} [options.onError]
 * @param {boolean} [options.recomputeDependencies=true]
 * @returns {() => void}
 */
function autorun(fn, options = {}) {
    return createReactiveSubscription(fn, fn, {
        ...options,
        recomputeDependencies: options.recomputeDependencies ?? true,
        isAutorun: true,
        passUpdates: false,
    });
}

/**
 * Reaction – tracks dependencies via `dataFn` and runs `effectFn` when they
 * change. The effect is NOT run at setup time.
 *
 * @param {() => any} dataFn
 * @param {(updates?: Map<string, import('../core/UpdateDataRecord.js').UpdateDataRecord>) => void} effectFn
 * @param {object} [options]
 * @param {string} [options.name]
 * @param {number} [options.delay]
 * @param {AbortSignal} [options.signal]
 * @param {Function} [options.onError]
 * @param {boolean} [options.recomputeDependencies=true]
 * @param {boolean} [options.passUpdates=true]
 * @returns {() => void}
 */
function reaction(dataFn, effectFn, options = {}) {
    return createReactiveSubscription(dataFn, effectFn, {
        ...options,
        recomputeDependencies: options.recomputeDependencies ?? true,
        passUpdates: options.passUpdates ?? true,
        isAutorun: false,
    });
}

/**
 * Waits for `predicate` to become true, then runs `fn` once.
 * @param {() => boolean} predicate
 * @param {() => void} fn
 * @param {object} [options]
 * @param {number} [options.timeout]
 * @param {number} [options.delay]
 * @param {AbortSignal} [options.signal]
 * @returns {() => void}
 */
function when(predicate, fn, options) {
    const computed = new Computed(predicate, { name: 'when' });
    const timeout = options?.timeout || 0;
    /** @type {ReturnType<typeof setTimeout> | null} */
    let timer = null;

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
 * Returns a promise that resolves when `predicate` becomes true.
 * @param {() => boolean} predicate
 * @param {object} [options]
 * @param {number} [options.timeout]
 * @returns {Promise<void>}
 */
function waitUntil(predicate, options) {
    return new Promise(resolve => {
        const computed = new Computed(predicate, { name: 'waitUntil' });
        const timeout = options?.timeout || 0;
        /** @type {ReturnType<typeof setTimeout> | null} */
        let timer = null;

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
 * Defers mutations until after subscribers finish, so it is safe to call
 * from inside a subscriber callback.
 * @param {Function} fn
 * @returns {void}
 */
function runInAction(fn) {
    const ctx = getCurrentContext();
    if (ctx.modeController.subscribersMode) {
        ctx.modeController.runAfterSubscribers(() => {
            ctx.batch(fn);
        });
    } else {
        ctx.batch(fn);
    }
}

/**
 * Groups multiple updates into a single notification round.
 *
 *     batch(() => { ... })
 *     batch('update todos', () => { ... })
 *
 * @param {string | Function} nameOrFn
 * @param {Function} [fn]
 * @returns {any}
 */
function batch(nameOrFn, fn) {
    return getCurrentContext().batch(nameOrFn, fn);
}

/**
 * Runs `fn` as a named, optionally asynchronous action. Middleware installed
 * on the current context is applied around the body.
 *
 * @param {string} name
 * @param {(action: import('../types.js').ActionInfo) => any} fn
 * @param {any} [payload]
 * @returns {Promise<any>}
 */
function action(name, fn, payload) {
    return getCurrentContext().action(name, fn, payload);
}

/**
 * Runs `fn` without tracking reactive reads. Nesting is safe: the previous
 * state is restored on exit even if `fn` throws.
 * @template T
 * @param {() => T} fn
 * @returns {T}
 */
function untrack(fn) {
    const modeController = getCurrentContext().modeController;
    const previous = modeController.untrackMode;
    modeController.untrackMode = true;
    try {
        return fn();
    } finally {
        modeController.untrackMode = previous;
    }
}

/**
 * Returns an Atom that ticks at the given interval while it has subscribers.
 * @param {number} [interval=1000]
 * @returns {Atom<number>}
 */
function getNow(interval = 1000) {
    const nowAtom = new Atom(0, { name: 'now' });
    /** @type {ReturnType<typeof setInterval> | undefined} */
    let intervalId;

    nowAtom.onHasSubscribers(() => {
        intervalId = setInterval(() => {
            runInAction(() => {
                nowAtom.value = Date.now();
            });
        }, interval);
    });

    nowAtom.onNoSubscribers(() => {
        if (intervalId !== undefined) {
            clearInterval(intervalId);
        }
        runInAction(() => {
            nowAtom.value = 0;
        });
    });

    nowAtom.onDestroy(() => {
        if (intervalId !== undefined) {
            clearInterval(intervalId);
        }
    });

    return nowAtom;
}

/**
 * Observes a promise's state. The returned object exposes a single method
 * `case({ pending, resolved, rejected })`.
 * @template T
 * @param {Promise<T>} promise
 * @returns {{ case: (param0: { resolved?: (value: T) => void, rejected?: (error: Error) => void, pending?: () => void }) => Promise<void> }}
 */
function fromPromise(promise) {
    /** @type {Atom<"pending" | "resolved" | "rejected">} */
    const stateAtom = new Atom('pending', { name: 'fromPromise' });

    /** @type {T} */
    let promiseResult;
    /** @type {Error} */
    let promiseError;

    /**
     * @param {{
     *   resolved?: (value: T) => void,
     *   rejected?: (error: Error) => void,
     *   pending?: () => void,
     * }} param0
     * @returns {Promise<void>}
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

    return { case: caseMethod };
}

/**
 * Creates a new reactive Atom holding the given value.
 *
 * An Atom is the base unit of reactive state — a single mutable cell. Reads
 * inside tracked contexts register a dependency; writes schedule a change.
 *
 * @template T
 * @param {T} value
 * @param {object} [options]
 * @param {string} [options.name]
 * @param {(a: T, b: T) => boolean} [options.compareFunction]
 * @returns {Atom<T>}
 */
function atom(value, options) {
    return new Atom(value, options);
}

/**
 * Creates a new reactive Computed whose value is derived from other
 * reactive sources.
 *
 * The function passed as `fn` runs once at construction, then again
 * whenever one of its dependencies changes and the recomputed value
 * differs.
 *
 * @template T
 * @param {() => T} fn
 * @param {object} [options]
 * @param {string} [options.name]
 * @param {(a: T, b: T) => boolean} [options.compareFunction]
 * @param {boolean} [options.smartRecompute]
 * @returns {Computed<T>}
 */
function computed(fn, options) {
    return new Computed(fn, options);
}

/**
 * Creates a new reactive Collection wrapping an array.
 *
 * Array mutations (`push`, `pop`, `splice`, index assignment) trigger
 * reactivity. The `.value` property returns a Proxy; direct mutations
 * through it are tracked.
 *
 * @template T
 * @param {T[]} value
 * @param {object} [options]
 * @param {string} [options.name]
 * @param {(a: T, b: T) => boolean} [options.compareFunction]
 * @returns {Collection<T>}
 */
function collection(value, options) {
    return new Collection(value, options);
}

/**
 * @template {{[key: string]: any}} T
 * @param {T} value
 * @param {object} [options]
 * @param {string} [options.name]
 * @returns {ShallowReactive<T>}
 */
function shallowReactive(value, options) {
    return new ShallowReactive(value, options);
}

/**
 * Enhances an object with reactive properties using explicit annotations.
 *
 * Each key maps to one of `"atom"`, `"computed"`, `"collection"`,
 * `"shallowReactive"`, or `false` to leave the property untouched.
 *
 * @template T
 * @param {T} obj
 * @param {{[key: string]: "atom" | "computed" | "collection" | "shallowReactive" | false}} annotations
 * @param {object} [options]
 * @param {string} [options.name]
 * @returns {T}
 */
function makeObservable(obj, annotations, options) {
    /** @type {{[key: string]: import('../reactives/ReactiveItem.js').ReactiveItem}} */
    const reactiveStore = {};
    const _options = Object.assign({ name: '' }, options);

    for (const key in annotations) {
        if (annotations[key] === false) {
            continue;
        }

        if (
            /** @type {Array<string | boolean>} */ ([
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
            const descriptor = allDescriptors[key];

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
 * @template T
 * @template {{[key: string]: any}} R
 * @param {T} target
 * @param {R} properties
 * @param {{[key: string]: "atom" | "computed" | "collection" | "shallowReactive" | false}} [overrides]
 * @param {object} [options]
 * @param {string} [options.name]
 * @returns {T & R}
 */
function extendObservable(target, properties, overrides, options) {
    Object.assign(/** @type {T & R} */ (/** @type {unknown} */ (target)), properties);
    makeAutoObservable(target, overrides, options, new Set(Object.keys(properties)));
    return /** @type {T & R} */ (target);
}

/**
 * Same as `makeObservable` but infers annotations automatically.
 *
 * Plain objects become `shallowReactive`, arrays become `collection`,
 * getters become `computed`, and everything else becomes `atom`. Pass
 * `overrides` to correct the inference or disable a property with `false`.
 *
 * @template T
 * @param {T} obj
 * @param {{[key: string]: "atom" | "computed" | "collection" | "shallowReactive" | false}} [overrides]
 * @param {object} [options]
 * @param {string} [options.name]
 * @param {Set<string>} [filter]
 * @returns {T}
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

    /** @type {{[key: string]: "atom" | "computed" | "collection" | "shallowReactive" | false}} */
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
    action,
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
