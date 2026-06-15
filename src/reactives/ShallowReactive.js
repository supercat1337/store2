// @ts-check

import { SHALLOW_REACTIVE } from '../core/Engine.js';
import { isPlainObject } from '../helpers/tools.js';
import { modeController } from '../services/modeController.js';
import { ReactivePrimitive } from './ReactivePrimitive.js';

/**
 * ShallowReactive is a reactive primitive that holds a shallow object. It is the base unit of reactive state.
 * It is a shallow reactive object, meaning that it only tracks changes to the properties of the object itself, not its nested properties.
 * @augments ReactivePrimitive
 * @template {{[key:string]:any}} T
 *  * @example
 * ```js
 * const b = new ShallowReactive({ foo: 1 });
 *
 * let bar = 0;
 *
 * b.subscribe(() => {
 *     bar += 1;
 * });
 *
 * const props = b.data;
 * props.foo = 2;
 *
 * console.log(bar);
 * // Outputs: 1
 * ```
 *
 * @example
 * ```js
 * class A {
 *     foo = 1;
 *
 *     inc() {
 *         this.foo++;
 *     }
 * }
 *
 * let bar = 0;
 * const b = new ShallowReactive(new A(), { name: "b" });
 *
 * b.subscribe(() => {
 *     bar++;
 * });
 *
 * console.log(b.data.foo);
 * // Outputs: 1
 *
 * b.data.foo = 2;
 * console.log(b.data.foo);
 * // Outputs: 2
 *
 * console.log(bar);
 * // Outputs: 1
 *
 * b.data.inc();
 * console.log(b.data.foo);
 * // Outputs: 3
 * console.log(bar);
 * // Outputs: 2
 * ```
 */
class ShallowReactive extends ReactivePrimitive {
    /** @type {T} */
    #target;

    /** @type {T} */
    #proxy;

    /** @type {ProxyHandler<T>} */
    #handler;

    /**
     * Initializes a ShallowReactive instance with a given value.
     * @param {T} value - The initial value of the ShallowReactive.
     * @param {object} [options] - Options.
     * @param {string} [options.name] - The name of the ShallowReactive.
     */
    constructor(
        value,
        options = {
            name: '',
        }
    ) {
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

    #initHandler() {
        const that = this;

        /** @type {ProxyHandler<T>} */
        return {
            /**
             * Sets a property on the ShallowReactive. If the property already exists, its value is updated. If not, a new property is added.
             * @param {T} target - The ShallowReactive to set the property on.
             * @param {string} key - The key of the property to set.
             * @param {any} value - The value to set for the property.
             * @returns {boolean} true if the property was successfully set.
             */
            set: (target, key, value) => {
                const engine = that.engine;
                engine.prepareSetValue();

                const oldValue = target[key];

                if (that.equals(oldValue, value)) {
                    return true;
                }

                // @ts-ignore
                target[key] = value;

                if (engine.addUpdate(key, 'set', oldValue, value)) {
                    engine.valueChangedCallback();
                }

                return true;
            },

            /**
             * Gets a property from the ShallowReactive. If the property is not found, undefined is returned.
             * @param {T} target - The ShallowReactive to get the property from.
             * @param {string} key - The key of the property to get.
             * @returns {any} The value of the property, or undefined if it was not found.
             */
            get: (target, key) => {
                that.getValue();
                return target[key];
            },

            /**
             * Deletes a property from the ShallowReactive. If the property is not found, an error is thrown.
             * @param {T} target - The ShallowReactive to delete the property from.
             * @param {string} key - The key of the property to delete.
             * @returns {boolean} true if the property was deleted, false if it was not.
             */
            deleteProperty: (target, key) => {
                if (modeController.subscribersMode) {
                    throw new Error(
                        `ShallowReactive${
                            this.name ? ` (${this.name})` : ''
                        }: Cannot delete property while subscribers are running`
                    );
                }

                const engine = that.engine;

                if (engine.addUpdate(key, 'delete', target[key], undefined)) {
                    delete target[key];
                    engine.valueChangedCallback();
                }

                return true;
            },
        };
    }

    /**
     * Retrieves the proxied value of the ShallowReactive. If the engine is destroyed, an error is thrown.
     * Tracks the ShallowReactive for dependency management.
     * @param {{untracked?: boolean}} [options] - Optional options. If `untracked` is `false`, the ShallowReactive value will be added to the dependencyTracker.
     * @returns {T} The proxied value of the ShallowReactive.
     */
    getValue(options) {
        super.getValue(options);
        return this.#proxy;
    }

    /**
     * Sets the value of the ShallowReactive. If the value is an object, it will be proxied and reactive.
     * @param {T} value - The new value of the ShallowReactive.
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

    /**
     * Sets the value of the ShallowReactive. If the value is an object, it will be proxied and reactive.
     * @param {T} value - The new value of the ShallowReactive.
     */
    set value(value) {
        this.setValue(value);
    }

    /**
     * Sets the value of the ShallowReactive. If the value is an object, it will be proxied and reactive.
     * This is a synonym for `set value(value)`.
     * @param {T} value - The new value of the ShallowReactive.
     */
    set data(value) {
        this.setValue(value);
    }

    /**
     * Retrieves the proxied value of the ShallowReactive. If the engine is destroyed, an error is thrown.
     * Tracks the ShallowReactive for dependency management.
     * @returns {T} The proxied value of the ShallowReactive.
     */
    get value() {
        return this.getValue();
    }

    /**
     * Retrieves the proxied value of the ShallowReactive. If the engine is destroyed, an error is thrown.
     * Tracks the ShallowReactive for dependency management.
     * @returns {T} The proxied value of the ShallowReactive.
     */
    get data() {
        return this.getValue();
    }

    /**
     * Returns the raw, unproxied value of the ShallowReactive. This is generally not recommended as it breaks reactivity.
     * @returns {T} The raw, unproxied value of the ShallowReactive.
     */
    getRawValue() {
        return this.#target;
    }
}

export { ShallowReactive };
