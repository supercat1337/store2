// @ts-check

import { Engine } from '../core/Engine.js';
import { compareAny, getError } from '../helpers/tools.js';

/**
 * ReactiveItem is the base class for all reactive items. It provides methods
 * for subscribing to changes, reading values, and lifecycle management.
 *
 * Concrete subclasses are `Atom`, `Computed`, `Collection`, and
 * `ShallowReactive`. User code rarely instantiates this class directly; use
 * the factory functions exported from the package root instead.
 *
 * @public
 */
class ReactiveItem {
    /**
     * The reactive engine driving this item. Provides access to the
     * dependency graph, version counter, and type tag — the machinery
     * ecosystem packages (DevTools, diagnostics, structural sharing)
     * need to inspect.
     *
     * Treat the engine as read-only from outside the library. Constructing
     * reactive items directly (via `ReactiveItem` factories) is the only
     * supported way to create an engine.
     *
     * @type {import('../core/Engine.js').Engine}
     */
    engine;

    /**
     * Debug name assigned at construction. Used in error messages and
     * DevTools listings. Empty string when not set.
     * @type {string}
     */
    name = '';

    /**
     * Local path assigned by the immediate container. Top-level items get a
     * path equal to their key in the root store; standalone items keep `''`.
     * @type {string}
     */
    path = '';

    /**
     * Creates a new reactive item. Subclasses pass their own type tag.
     *
     * @param {import('../types.js').ReactiveItemType} type
     */
    constructor(type) {
        this.engine = new Engine(this, type);
    }

    /**
     * The numeric type tag of this item: `1` for `Atom`, `2` for `Computed`,
     * `3` for `Collection`, `4` for `ShallowReactive`.
     *
     * @returns {import('../types.js').ReactiveItemType}
     */
    get type() {
        return this.engine.type;
    }

    /**
     * Monotonic version counter, bumped on every effective change.
     *
     * Useful as a stable token for `useSyncExternalStore` and for cache
     * invalidation: comparing two `getVersion()` results tells you whether
     * the value changed, without reading it.
     *
     * @returns {number}
     */
    getVersion() {
        return this.engine.version;
    }

    /**
     * Subscribes a function to changes of this item.
     *
     * The callback receives a `Map` of property paths to
     * `UpdateDataRecord` instances. It is invoked once per batch of
     * effective changes.
     *
     * @param {(updates: Map<string, import('../core/UpdateDataRecord.js').UpdateDataRecord>) => void} fn
     * @param {object} [options]
     * @param {number} [options.delay] - Debounce delay in milliseconds.
     * @param {AbortSignal} [options.signal] - Cancels the subscription when aborted.
     * @returns {() => void} An unsubscribe function.
     */
    subscribe(fn, options) {
        return this.engine.subscribeController.subscribe(fn, options);
    }

    /**
     * Removes all change subscribers, keeping lifecycle listeners
     * registered via `onHasSubscribers`, `onNoSubscribers`, and
     * `onDestroy`.
     */
    clearSubscribers() {
        this.engine.subscribeController.clearSubscribers();
    }

    /**
     * Removes all subscribers, including lifecycle listeners.
     *
     * After this call, the item no longer invokes any user callbacks until
     * a new subscription is made.
     */
    clearAllSubscribers() {
        this.engine.subscribeController.clearAllSubscribers();
    }

    /**
     * Returns `true` if at least one change subscriber is currently
     * registered.
     *
     * @returns {boolean}
     */
    hasSubscribers() {
        return this.engine.subscribeController.hasSubscribers();
    }

    /**
     * Reads the current value, tracking the item as a dependency unless
     * `untracked` is `true`.
     *
     * Throws if the item has been destroyed.
     *
     * @param {object} [options]
     * @param {boolean} [options.untracked=false]
     * @returns {any}
     */
    getValue(options) {
        if (this.engine.isDestroyed) {
            throw new Error('The reactive item has been destroyed');
        }

        const _options = Object.assign({ untracked: false }, options);

        if (_options.untracked === false) {
            this.engine.context.dependencyTracker.add(this);
        }
    }

    /**
     * Returns the current value without registering a dependency and
     * without triggering recalculation for `Computed`.
     *
     * For `Computed`, this returns the last cached value even if it is
     * stale. To force a fresh value, use `.value` or `.getValue()`.
     *
     * @returns {any}
     */
    peekValue() {
        return this.getValue({ untracked: true });
    }

    /**
     * Returns the last error produced by this item, or `null`.
     *
     * For `Computed`, this is the error thrown during the most recent
     * evaluation. The error is preserved until a dependency changes.
     *
     * @returns {Error | null}
     */
    getLastError() {
        return this.engine.error;
    }

    /**
     * Returns `true` if reading the value currently throws or has thrown.
     *
     * For `Computed`, this forces a read to determine whether the current
     * dependencies are valid.
     *
     * @returns {boolean}
     */
    hasError() {
        try {
            this.getValue();
        } catch (e) {
            this.engine.setError(getError(e));
        }

        return this.engine.error !== null;
    }

    /**
     * Registers a callback that fires when the first change subscriber is
     * added.
     *
     * Useful for lazy initialisation: start expensive work only when
     * somebody actually listens.
     *
     * @param {() => void} fn
     * @returns {() => void} An unsubscribe function.
     */
    onHasSubscribers(fn) {
        return this.engine.subscribeController.onHasSubscribers(fn);
    }

    /**
     * Registers a callback that fires when the last change subscriber is
     * removed.
     *
     * Useful for cleanup: stop timers or subscriptions that only make sense
     * while somebody is listening.
     *
     * @param {() => void} fn
     * @returns {() => void} An unsubscribe function.
     */
    onNoSubscribers(fn) {
        return this.engine.subscribeController.onNoSubscribers(fn);
    }

    /**
     * Registers a callback that fires when the item is destroyed.
     *
     * The callback receives the destroyed item as its only argument.
     *
     * @param {(reactiveItem: ReactiveItem) => void} fn
     * @returns {() => void} An unsubscribe function.
     */
    onDestroy(fn) {
        const that = this;
        const callback = () => {
            fn(that);
        };

        return this.engine.subscribeController.onDestroy(callback);
    }

    /**
     * Destroys the item and tears down its dependency graph.
     *
     * All subscribers are detached, all dependencies are released, and any
     * further read or write throws. Idempotent — subsequent calls are
     * no-ops.
     */
    destroy() {
        this.engine.destroy();
    }

    /**
     * Returns `true` if the two values are considered equal by this item's
     * comparator.
     *
     * When the second argument is omitted, it is compared against the
     * item's current value. Uses the custom `compareFunction` if one was
     * provided at construction, otherwise falls back to shallow equality.
     *
     * @param {any} a
     * @param {any} [b]
     * @returns {boolean}
     */
    equals(a, b) {
        if (b === undefined) {
            b = this.getValue();
        }

        if (this.engine.compareFn) {
            return this.engine.compareFn(a, b);
        }

        return compareAny(a, b);
    }

    /**
     * Returns `true` if `destroy()` has been called.
     *
     * After destruction, reads and writes throw. This getter is the only
     * operation that remains safe to call.
     *
     * @returns {boolean}
     */
    get isDestroyed() {
        return this.engine.isDestroyed;
    }

    /**
     * Returns a plain data representation suitable for storage or transport.
     *
     * The base implementation returns `null`, signalling that the item must
     * not be persisted. `Atom`, `Collection`, `ShallowReactive`, and `Store`
     * override this method. `Computed` deliberately keeps the `null`
     * default — derived state is recalculated on hydration, never restored.
     *
     * @returns {any}
     */
    serialize() {
        return null;
    }

    /**
     * Returns the current value as a plain JavaScript value, for use with
     * `JSON.stringify()`. Subclasses override this to return their raw
     * value without proxies.
     *
     * This is a debug/inspection convenience, not a persistence protocol —
     * use `serialize()` for snapshots.
     *
     * @returns {any}
     */
    toJSON() {
        return this.peekValue();
    }

    /**
     * Restores state previously produced by `serialize()`.
     *
     * The base implementation is a no-op. Subclasses override this to apply
     * the given data. Implementations must be idempotent and must not throw
     * on malformed input — silently ignore what they cannot apply.
     *
     * @param {any} _data
     */
    hydrate(_data) {
        // no-op by default
    }

    /**
     * Returns a minimal observable facade for framework adapters.
     *
     * - `get()` returns the current value without tracking a dependency.
     * - `subscribe(fn)` invokes `fn` with the current value on every
     *   effective change.
     * - `version()` returns the monotonic version, suitable as a token
     *   for `useSyncExternalStore`.
     *
     * @returns {import('../types.js').ObservableValue<any>}
     */
    toObservable() {
        const self = this;
        return {
            get() {
                return self.getValue({ untracked: true });
            },
            subscribe(fn) {
                return self.subscribe(() => {
                    fn(self.getValue({ untracked: true }));
                });
            },
            version() {
                return self.getVersion();
            },
        };
    }
}

export { ReactiveItem };
