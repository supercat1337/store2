// @ts-check

import { ReactiveItem } from './ReactiveItem.js';
import { COLLECTION } from '../core/Engine.js';

/**
 * Collection is a reactive item that holds an array of values.
 *
 * Array mutations (`push`, `pop`, `splice`, index assignment) trigger
 * reactivity. The `.value` property returns a Proxy — direct mutations
 * through it are tracked. The underlying raw array is available via
 * `getRawValue()` but bypassing the proxy disables reactivity.
 *
 * @augments ReactiveItem
 * @template T
 * @public
 */
class Collection extends ReactiveItem {
    /** @type {T[]} */
    #target;
    /** @type {T[]} */
    #proxy;
    /** @type {number} */
    #length = 0;
    /** @type {ProxyHandler<T[]>} */
    #handler;

    /**
     * Creates a new Collection wrapping the given array.
     *
     * The array is copied element-by-element; the caller's array reference
     * is not stored.
     *
     * @param {T[]} value - The initial array.
     * @param {object} [options]
     * @param {string} [options.name] - Debug name used in error messages.
     * @param {import('../types.js').CompareFunction | null} [options.compareFunction] - Custom equality function for element comparison.
     */
    constructor(value, options = { name: '', compareFunction: null }) {
        super(COLLECTION);
        this.name = options.name || '';
        this.engine.compareFn = options.compareFunction || null;
        this.#handler = this.#initHandler();
        this.#target = [];
        this.#proxy = new Proxy(this.#target, this.#handler);
        this.#length = value.length;
        for (let i = 0; i < value.length; i++) {
            this.#target[i] = value[i];
        }
    }

    /**
     * @returns {ProxyHandler<T[]>}
     */
    #initHandler() {
        const that = this;
        return {
            set: (target, key, value) => {
                if (typeof key === 'symbol') {
                    // @ts-ignore
                    target[key] = value;
                    return true;
                }

                const engine = that.engine;
                engine.prepareSetValue();

                // @ts-ignore
                const oldValue = target[key];
                if (that.equals(oldValue, value)) {
                    return true;
                }

                // @ts-ignore
                target[key] = value;

                if (that.#length !== target.length) {
                    const newLength = target.length;
                    const oldLength = that.#length;
                    that.#length = newLength;
                    engine.addUpdate('length', 'set', oldLength, newLength);
                }

                if (key !== 'length') {
                    engine.addUpdate(key, 'set', oldValue, value);
                }

                engine.valueChangedCallback();
                return true;
            },
            get: (target, key) => {
                that.getValue();
                // @ts-ignore
                return target[key];
            },
            deleteProperty: (target, key) => {
                if (typeof key === 'symbol') {
                    // @ts-ignore
                    delete target[key];
                    return true;
                }

                if (that.engine.context.modeController.subscribersMode) {
                    throw new Error(
                        `Collection${
                            that.name ? ` (${that.name})` : ''
                        }: Cannot delete property while subscribers are running`
                    );
                }

                const engine = that.engine;
                if (engine.addUpdate(key, 'delete', target[/** @type {any} */ (key)], undefined)) {
                    delete target[/** @type {any} */ (key)];
                    engine.valueChangedCallback();
                }
                return true;
            },
        };
    }

    set value(value) {
        if (!Array.isArray(value)) {
            throw new Error(
                `Collection${this.name ? ` (${this.name})` : ''}: Value must be an array`
            );
        }
        const current = this.getValue({ untracked: true });
        if (this.equals(current, value)) {
            return;
        }
        const engine = this.engine;
        engine.prepareSetValue();
        engine.suppressNotifications = true;
        this.#proxy.length = value.length;
        for (let i = 0; i < value.length; i++) {
            this.#proxy[i] = value[i];
        }
        engine.suppressNotifications = false;
        engine.valueChangedCallback();
    }

    /**
     * Returns the proxied array.
     *
     * Mutations through the returned proxy are reactive. When
     * `options.untracked` is `false` (the default), registers this
     * collection as a dependency of the enclosing tracked scope.
     *
     * @param {{ untracked?: boolean }} [options]
     * @returns {T[]}
     */
    getValue(options) {
        super.getValue(options);
        return this.#proxy;
    }

    /**
     * The proxied array.
     *
     * Reading this property registers a dependency. Mutating the returned
     * array — `push`, index assignment, `splice`, and so on — triggers a
     * reactive update.
     *
     * @returns {T[]}
     */
    get value() {
        return this.getValue();
    }

    /**
     * Returns the underlying array without the proxy.
     *
     * Mutations on the returned array do not trigger reactivity. Use for
     * inspection, iteration, or passing to APIs that must receive a plain
     * array — not for state changes.
     *
     * @returns {T[]}
     */
    getRawValue() {
        return this.#target;
    }

    /**
     * Returns a serializable representation of the array contents.
     *
     * @returns {any}
     */
    serialize() {
        return {
            type: 'collection',
            value: this.#target.slice(),
        };
    }

    /**
     * Returns the raw array contents without the reactive proxy, so that
     * `JSON.stringify(collection)` produces a clean array.
     *
     * @returns {T[]}
     */
    toJSON() {
        return this.#target.slice();
    }

    /**
     * Applies data previously produced by `serialize()`.
     *
     * Silently ignores malformed input.
     *
     * @param {any} data
     */
    hydrate(data) {
        if (data && typeof data === 'object' && Array.isArray(data.value)) {
            this.value = data.value;
        }
    }
}

export { Collection };
