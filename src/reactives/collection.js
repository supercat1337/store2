// @ts-check

import { ReactiveItem } from './ReactiveItem.js';
import { COLLECTION } from '../core/Engine.js';
import { modeController } from '../services/modeController.js';

/**
 * Collection is a reactive item that holds an array of values.
 * It provides reactivity for array operations (push, pop, splice, etc.)
 * and allows tracking changes to individual elements and the array length.
 *
 * @template T
 * @augments ReactiveItem
 * @example
 * ```js
 * const coll = new Collection([1, 2, 3]);
 * coll.subscribe((updates) => {
 *     console.log('Collection changed:', Array.from(updates.keys()));
 * });
 * coll.value.push(4); // triggers reactivity
 * ```
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
     * Initializes a Collection instance with an initial array.
     *
     * @param {T[]} value - The initial array value.
     * @param {object} [options] - Configuration options.
     * @param {string} [options.name] - The name of the Collection (for debugging).
     * @param {CompareFunction|null} [options.compareFunction] - Custom equality function for values.
     */
    constructor(value, options = { name: '', compareFunction: null }) {
        super(COLLECTION);
        this.name = options.name || '';
        this.engine.compareFn = options.compareFunction || null;
        this.#handler = this.#initHandler();
        this.#target = [];
        this.#proxy = new Proxy(this.#target, this.#handler);
        this.#length = value.length;
        // Copy initial values
        for (let i = 0; i < value.length; i++) {
            this.#target[i] = value[i];
        }
    }

    /**
     * Initializes the proxy handler for array interception.
     *
     * @returns {ProxyHandler<T[]>} The proxy handler object.
     */
    #initHandler = () => {
        const that = this;
        return {
            /**
             * Intercepts property assignments on the array.
             *
             * @param {T[]} target - The target array.
             * @param {string|symbol} key - The property key.
             * @param {any} value - The value to set.
             * @returns {boolean} True if the operation succeeded.
             */
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
            /**
             * Intercepts property accesses on the array.
             *
             * @param {T[]} target - The target array.
             * @param {string|symbol} key - The property key.
             * @returns {any} The property value.
             */
            get: (target, key) => {
                that.getValue();
                // @ts-ignore
                return target[key];
            },
            /**
             * Intercepts property deletions on the array.
             *
             * @param {T[]} target - The target array.
             * @param {string|symbol} key - The property key.
             * @returns {boolean} True if the operation succeeded.
             */
            deleteProperty: (target, key) => {
                if (typeof key === 'symbol') {
                    // @ts-ignore
                    delete target[key];
                    return true;
                }

                if (modeController.subscribersMode) {
                    throw new Error(
                        `Collection${this.name ? ` (${this.name})` : ''}: Cannot delete property while subscribers are running`
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
    };

    /**
     * Sets the entire array, replacing all elements.
     * Only triggers reactivity if the new array differs from the current one.
     *
     * @param {T[]} value - The new array value.
     */
    set value(value) {
        if (!Array.isArray(value)) {
            throw new Error(
                `Collection${this.name ? ` (${this.name})` : ''}: Value must be an array`
            );
        }
        const current = this.getValue({ untracked: true });
        // Shallow compare to avoid unnecessary updates
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
     * Returns the proxied array value.
     * Tracks this Collection as a dependency when accessed.
     *
     * @param {{untracked?: boolean}} [options] - If `untracked` is true, does not add to dependency tracker.
     * @returns {T[]} The reactive array proxy.
     */
    getValue(options) {
        super.getValue(options);
        return this.#proxy;
    }

    /**
     * Returns the proxied array value (same as getValue()).
     *
     * @returns {T[]} The reactive array proxy.
     */
    get value() {
        return this.getValue();
    }

    /**
     * Returns the raw, unproxied target array.
     * Warning: Mutating the raw array directly does NOT trigger reactivity.
     *
     * @returns {T[]} The raw array.
     */
    getRawValue() {
        return this.#target;
    }
}

export { Collection };
