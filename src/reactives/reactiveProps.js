// @ts-check

import { ReactivePrimitive } from "./reactivePrimitive.js";
import { Engine, REACTIVEPROPS_OBJECT } from "../core/Engine.js";
import { modeController } from "../services/modeController.js";
import { isPlainObject } from "../helpers/tools.js";

/**
 * ReactiveProps is a reactive primitive that holds a shallow object. It is the base unit of reactive state.
 * It is a shallow reactive object, meaning that it only tracks changes to the properties of the object itself, not its nested properties.
 * @extends ReactivePrimitive
 * @template {{[key:string]:any}} T
 *  * @example
 * ```js
 * const b = new ReactiveProps({ foo: 1 });
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
 * const b = new ReactiveProps(new A(), { name: "b" });
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
class ReactiveProps extends ReactivePrimitive {
    /** @type {T} */
    #target;

    /** @type {T} */
    #proxy;

    /** @type {ProxyHandler<T>} */
    #handler;

    options = {
        name: "",
        compareFunction: null,
    };

    /**
     * Initializes a ReactiveProps instance with a given value.
     * @param {T} value - The initial value of the ReactiveProps.
     * @param {Object} [options] - Options.
     * @param {string} [options.name] - The name of the ReactiveProps.
     */
    constructor(value, options) {
        super();

        if (!isPlainObject(value)) {
            throw new Error(
                `ReactiveProps${
                    this.name ? ` (${this.name})` : ""
                }: value must be an object`
            );
        }

        this.options = Object.assign({}, this.options, options);

        if (this.options.name) this.name = this.options.name;

        this.#initHandler();

        this.#target = value;

        this.#proxy = new Proxy(this.#target, this.#handler);

        this.engine = new Engine(this, REACTIVEPROPS_OBJECT);
    }

    #initHandler() {
        let that = this;

        /** @type {ProxyHandler<T>} */
        this.#handler = {
            /**
             * Sets a property on the ReactiveProps. If the property already exists, its value is updated. If not, a new property is added.
             * @param {T} target - The ReactiveProps to set the property on.
             * @param {string} key - The key of the property to set.
             * @param {any} value - The value to set for the property.
             * @param {Proxy} receiver - The proxy or object that initiated the operation.
             * @returns {boolean} true if the property was successfully set.
             */
            set: (target, key, value, receiver) => {
                /** @type {Engine} */
                let engine = that.engine;
                engine.prepareSetValue();

                let oldValue = target[key];

                if (that.equals(oldValue, value)) return true;

                // @ts-expect-error
                target[key] = value;

                engine.addUpdate(key, "set", oldValue, value);
                engine.valueChangedCallback();

                return true;
            },

            /**
             * Gets a property from the ReactiveProps. If the property is not found, undefined is returned.
             * @param {T} target - The ReactiveProps to get the property from.
             * @param {string} key - The key of the property to get.
             * @returns {any} The value of the property, or undefined if it was not found.
             */
            get: (target, key) => {
                that.getValue();
                return target[key];
            },

            /**
             * Deletes a property from the ReactiveProps. If the property is not found, an error is thrown.
             * @param {T} target - The ReactiveProps to delete the property from.
             * @param {string} key - The key of the property to delete.
             * @returns {boolean} true if the property was deleted, false if it was not.
             */
            deleteProperty: (target, key) => {
                if (modeController.subscribersMode) {
                    throw new Error(
                        `ReactiveProps${
                            this.name ? ` (${this.name})` : ""
                        }: Cannot delete property while subscribers are running`
                    );
                }

                /** @type {Engine} */
                let engine = that.engine;

                engine.addUpdate(key, "delete", target[key], undefined);
                delete target[key];

                engine.valueChangedCallback();

                return true;
            },
        };
    }

    /**
     * Retrieves the proxied value of the ReactiveProps. If the engine is destroyed, an error is thrown.
     * Tracks the ReactiveProps for dependency management.
     * @param {{untracked?: boolean}} [options] - Optional options. If `untracked` is `false`, the ReactiveProps value will be added to the getValueTracker.
     * @returns {T} The proxied value of the ReactiveProps.
     */
    getValue(options) {
        super.getValue(options);
        return this.#proxy;
    }

    /**
     * Sets the value of the ReactiveProps. If the value is an object, it will be proxied and reactive.
     * @param {T} value - The new value of the ReactiveProps.
     */
    setValue(value) {
        this.getValue({ untracked: true });

        this.engine.muteUpdates = true;
        let currentKeys = Object.keys(this.#proxy);
        let newKeys = Object.keys(value);
        let keysToDelete = currentKeys.filter((key) => !newKeys.includes(key));
        keysToDelete.forEach((key) => delete this.#proxy[key]);

        for (let i = 0; i < newKeys.length; i++) {
            let key = newKeys[i];

            // @ts-expect-error
            this.#proxy[key] = value[key];
        }

        this.engine.muteUpdates = false;
        this.engine.valueChangedCallback();
    }

    /**
     * Sets the value of the ReactiveProps. If the value is an object, it will be proxied and reactive.
     * @param {T} value - The new value of the ReactiveProps.
     */
    set value(value) {
        this.setValue(value);
    }

    /**
     * Sets the value of the ReactiveProps. If the value is an object, it will be proxied and reactive.
     * This is a synonym for `set value(value)`.
     * @param {T} value - The new value of the ReactiveProps.
     */
    set data(value) {
        this.setValue(value);
    }

    /**
     * Retrieves the proxied value of the ReactiveProps. If the engine is destroyed, an error is thrown.
     * Tracks the ReactiveProps for dependency management.
     * @returns {T} The proxied value of the ReactiveProps.
     */
    get value() {
        return this.getValue();
    }

    /**
     * Retrieves the proxied value of the ReactiveProps. If the engine is destroyed, an error is thrown.
     * Tracks the ReactiveProps for dependency management.
     * @returns {T} The proxied value of the ReactiveProps.
     */
    get data() {
        return this.getValue();
    }

    /**
     * Returns the raw, unproxied value of the ReactiveProps. This is generally not recommended as it breaks reactivity.
     * @returns {T} The raw, unproxied value of the ReactiveProps.
     */
    getRawValue() {
        return this.#target;
    }
}

export { ReactiveProps };
