// @ts-check

import { SHALLOW_REACTIVE } from '../core/Engine.js';
import { isPlainObject } from '../helpers/tools.js';
import { ReactiveItem } from './ReactiveItem.js';

/**
 * ShallowReactive tracks assignments and deletions on the top level of an
 * object.
 *
 * Nested objects are stored by reference and are not made reactive —
 * mutating a property of a nested object does not trigger an update. For
 * deep reactivity, either use immutable updates on the top level or split
 * the state across multiple reactive items.
 *
 * @augments ReactiveItem
 * @template {{[key: string]: any}} T
 * @public
 */
class ShallowReactive extends ReactiveItem {
    /** @type {T} */
    #target;

    /** @type {T} */
    #proxy;

    /** @type {ProxyHandler<T>} */
    #handler;

    /**
     * Creates a new ShallowReactive wrapping the given object.
     *
     * @param {T} value - The object to wrap. Must be a plain object.
     * @param {object} [options]
     * @param {string} [options.name] - Debug name used in error messages.
     */
    constructor(value, options = { name: '' }) {
        super(SHALLOW_REACTIVE);

        this.name = options.name || '';
        if (!isPlainObject(value)) {
            throw new Error(
                `ShallowReactive${this.name ? ` (${this.name})` : ''}: value must be an object`
            );
        }

        this.#handler = this.#initHandler();
        this.#target = value;
        this.#proxy = new Proxy(this.#target, this.#handler);
    }

    /**
     * @returns {ProxyHandler<T>}
     */
    #initHandler() {
        const that = this;

        return {
            set: (target, key, value) => {
                if (typeof key === 'symbol') {
                    /** @type {any} */ (target)[key] = value;
                    return true;
                }

                const engine = that.engine;
                engine.prepareSetValue();

                const oldValue = /** @type {any} */ (target)[key];
                if (that.equals(oldValue, value)) {
                    return true;
                }

                /** @type {any} */ (target)[key] = value;

                if (engine.addUpdate(key, 'set', oldValue, value)) {
                    engine.valueChangedCallback();
                }
                return true;
            },
            get: (target, key) => {
                that.getValue();
                return /** @type {any} */ (target)[key];
            },
            deleteProperty: (target, key) => {
                if (typeof key === 'symbol') {
                    delete (/** @type {any} */ (target)[key]);
                    return true;
                }

                if (that.engine.context.modeController.subscribersMode) {
                    throw new Error(
                        `ShallowReactive${
                            that.name ? ` (${that.name})` : ''
                        }: Cannot delete property while subscribers are running`
                    );
                }

                const engine = that.engine;
                if (engine.addUpdate(key, 'delete', /** @type {any} */ (target)[key], undefined)) {
                    delete (/** @type {any} */ (target)[key]);
                    engine.valueChangedCallback();
                }
                return true;
            },
        };
    }

    /**
     * Returns the proxied object.
     *
     * When `options.untracked` is `false` (the default), registers this
     * item as a dependency of the enclosing tracked scope.
     *
     * @param {{ untracked?: boolean }} [options]
     * @returns {T}
     */
    getValue(options) {
        super.getValue(options);
        return this.#proxy;
    }

    /**
     * Replaces the object's properties wholesale.
     *
     * Keys absent from `value` are deleted from the target; new keys are
     * added. The entire operation is batched and produces a single
     * notification.
     *
     * @param {T} value
     */
    setValue(value) {
        this.getValue({ untracked: true });

        this.engine.suppressNotifications = true;
        const currentKeys = Object.keys(this.#proxy);
        const newKeys = Object.keys(value);
        const keysToDelete = currentKeys.filter(key => !newKeys.includes(key));
        keysToDelete.forEach(key => delete this.#proxy[key]);

        for (let i = 0; i < newKeys.length; i++) {
            const key = newKeys[i];
            // @ts-ignore
            this.#proxy[key] = value[key];
        }

        this.engine.suppressNotifications = false;
        this.engine.valueChangedCallback();
    }

    set value(value) {
        this.setValue(value);
    }

    /**
     * The proxied object.
     *
     * Reading a top-level property registers a dependency on this item.
     * Writing a top-level property schedules an update. Nested properties
     * are not tracked.
     *
     * @returns {T}
     */
    get value() {
        return this.getValue();
    }

    /**
     * Returns the underlying object without the proxy.
     *
     * Mutations on the returned object do not trigger reactivity. Use for
     * inspection or for passing to APIs that must receive a plain object —
     * not for state changes.
     *
     * @returns {T}
     */
    getRawValue() {
        return this.#target;
    }

    /**
     * Returns a serializable representation of the object's own enumerable
     * properties.
     *
     * @returns {any}
     */
    serialize() {
        return {
            type: 'shallowReactive',
            value: { ...this.#target },
        };
    }

    /**
     * Applies data previously produced by `serialize()`.
     *
     * Silently ignores malformed input.
     *
     * @param {any} data
     */
    hydrate(data) {
        if (data && typeof data === 'object' && isPlainObject(data.value)) {
            this.value = /** @type {T} */ (data.value);
        }
    }
}

export { ShallowReactive };