// @ts-check

import { ReactivePrimitive } from "./reactivePrimitive.js";
import { COLLECTION, Engine } from "../core/Engine.js";
import { modeController } from "../services/modeController.js";

/**
 * Collection is a reactive primitive that holds an array of values. It is the base unit of reactive state.
 * @extends ReactivePrimitive
 * @template {unknown} T
 * @example
 * ```js
 * let c = new Collection([1, 2, 3]);
 * c.subscribe((updates) => {
 *     console.log("updated", updates);
 * });
 *
 * let len = new Computed(() => c.data.length);
 *
 * len.subscribe((updates) => {
 *     console.log("len updated", updates);
 * });
 *
 * c.data.push(4);
 * ```
 */
class Collection extends ReactivePrimitive {
    /** @type {T[]} */
    #target;

    /** @type {T[]} */
    #proxy;

    #length = 0;

    /** @type {ProxyHandler<T[]>} */
    #handler;

    options = {
        name: "",
        compareFunction: null,
    };

    /**
     * Initializes a Collection instance with a given value.
     * @param {T[]} value - The initial value of the Collection.
     * @param {Object} [options] - Options.
     * @param {string} [options.name] - The name of the Collection.
     * @param {(a:T, b:T)=>boolean} [options.compareFunction] - A function to compare elements.
     */
    constructor(value, options) {
        super();

        this.options = Object.assign({}, this.options, options);

        if (this.options.name) this.name = this.options.name;

        this.#initHandler();

        this.#target = [];
        this.#proxy = new Proxy(this.#target, this.#handler);

        this.engine = new Engine(this, COLLECTION);

        if (this.options.compareFunction)
            this.engine.compareFn = this.options.compareFunction;

        this.#length = value.length;

        // copy array
        for (let i = 0; i < value.length; i++) {
            this.#target[i] = value[i];
        }
    }

    #initHandler = () => {
        let that = this;

        /** @type {ProxyHandler<T[]>} */
        this.#handler = {
            /**
             * Sets a property on the Collection. If the property already exists, its value is updated. If not, a new property is added.
             * @param {T[]} target - The Collection to set the property on.
             * @param {string} key - The key of the property to set.
             * @param {any} value - The value to set for the property.
             * @returns {boolean} true if the property was successfully set.
             */
            set: (target, key, value) => {
                /** @type {Engine} */
                let engine = that.engine;
                engine.prepareSetValue();

                if (target[key] === value) return true;

                if (key != "length") {
                    let oldValue = target[key];

                    //console.log("key ", key);
                    if (that.equals(oldValue, value)) return true;

                    target[key] = value;

                    if (that.#length != target.length) {
                        let newLength = target.length;
                        let oldLength = that.#length;

                        that.#length = newLength;

                        engine.addUpdate("length", "set", oldLength, newLength);
                    }

                    engine.addUpdate(key, "set", oldValue, value);
                    engine.valueChangedCallback();
                } else {
                    // if key is "length"
                    let newLength = value;
                    let oldLength = that.#length;

                    if (newLength < oldLength) {
                        //engine.updates.delete("length");

                        for (let i = newLength; i < oldLength; i++) {
                            let itemValue = that.#target[i];
                            engine.addUpdate(
                                i.toString(),
                                "delete",
                                itemValue,
                                undefined
                            );
                        }

                        that.#target.length = newLength;
                    } else if (newLength > oldLength) {
                        that.#target.length = newLength;

                        for (let i = oldLength; i < newLength; i++) {
                            engine.addUpdate(
                                i.toString(),
                                "set",
                                that.#target[i],
                                undefined
                            );
                        }
                    }

                    that.#length = newLength;
                    engine.addUpdate("length", "set", oldLength, newLength);

                    engine.valueChangedCallback();
                }

                return true;
            },

            /**
             * Gets a property from the Collection. If the property is not found, undefined is returned.
             * @param {T[]} target - The Collection to get the property from.
             * @param {string} key - The key of the property to get.
             * @returns {any} The value of the property, or undefined if it was not found.
             */
            get: (target, key) => {
                that.getValue();

                if (typeof target[key] == "function") return target[key];

                return target[key];
            },

            /**
             * Deletes a property from the Collection. If the property is not found, an error is thrown.
             * @param {T[]} target - The Collection to delete the property from.
             * @param {string} key - The key of the property to delete.
             * @returns {boolean} true if the property was deleted, false if it was not.
             */
            deleteProperty: (target, key) => {
                if (modeController.subscribersMode) {
                    throw new Error(
                        `Collection${
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
    };

    /**
     * Sets the value of the Collection. If the new value is the same as the current value, no action is taken.
     * Updates the current value to the new value if they are different.
     * @param {T[]} value - The new value to set for the Collection.
     */
    set value(value) {
        if (!Array.isArray(value)) {
            throw new Error(
                `Collection${
                    this.name ? ` (${this.name})` : ""
                }: Value must be an array`
            );
        }

        let engine = /** @type {Engine} */ this.engine;

        engine.prepareSetValue();

        if (value === this.getValue()) {
            return;
        }

        engine.muteUpdates = true;

        this.#proxy.length = value.length;

        for (let i = 0; i < value.length; i++) {
            this.#proxy[i] = value[i];
        }

        engine.muteUpdates = false;

        this.#target = value;

        engine.valueChangedCallback();
    }

    /**
     * Retrieves the proxied value of the Collection. If the engine is destroyed, an error is thrown.
     * Tracks the Collection for dependency management.
     * @param {{untracked?: boolean}} [options] - Optional options. If `untracked` is `false`, the Collection value will be added to the getValueTracker.
     * @returns {T[]} The proxied value of the Collection.
     */
    getValue(options) {
        super.getValue(options);
        return this.#proxy;
    }

    /**
     * Retrieves the proxied value of the Collection. If the engine is destroyed, an error is thrown.
     * Tracks the Collection for dependency management.
     * @returns {T[]} The proxied value of the Collection.
     */
    get value() {
        return this.getValue();
    }

    /**
     * Sets the value of the Collection. This is a synonym for `set value(value)`.
     * @param {T[]} value - The new value to set for the Collection.
     */
    set data(value) {
        this.value = value;
    }

    /**
     * Retrieves the proxied value of the Collection. If the engine is destroyed, an error is thrown.
     * Tracks the Collection for dependency management.
     * @returns {T[]} The proxied value of the Collection.
     */
    get data() {
        return this.getValue();
    }

    /**
     * Returns the raw, unproxied value of the Collection. This is generally not recommended as it breaks reactivity.
     * @returns {T[]} The raw, unproxied value of the Collection.
     */
    getRawValue() {
        return this.#target;
    }
}

export { Collection };
