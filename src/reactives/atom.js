// @ts-check

import { ReactivePrimitive } from "./reactivePrimitive.js";
import { ATOM, Engine } from "../core/Engine.js";
import { clone } from "../helpers/tools.js";

/**
 * Atom is a reactive primitive that holds a value. It is the base unit of reactive state.
 * @extends ReactivePrimitive
 * @template T
 * @example
 * ```js
 * const a = new Atom(0); // same as const a = atom(0);
 * const b = new Atom(0);
 *
 * const c = new Computed(() => a.value + b.value);
 *
 * c.subscribe(() => {
 *     console.log(c.name, c.value);
 * });
 *
 * a.subscribe(() => {
 *     console.log(a.name, a.value);
 * });
 *
 * b.subscribe(() => {
 *     console.log(b.name, b.value);
 * });
 *
 * a.value = 1;
 * // Output:
 * //a 1
 * //c 1
 *
 * a.value = 2;
 * // Output:
 * //a 2
 * //c 2
 * b.value = 2;
 * // Output:
 * //b 2
 * //c 4
 *
 * a.value = 3;
 * // Output:
 * //a 3
 * //c 5
 *
 * a.value = 3;
 * // Output: nothing
 * ```
 */
class Atom extends ReactivePrimitive {
    /** @type {T} */
    #currentValue;

    options = {
        name: "",
        compareFunction: null,
    };

    /**
     * Initializes an Atom instance with a given value.
     * @param {T} value - The initial value of the Atom.
     * @param {Object} [options] - Options.
     * @param {string} [options.name] - The name of the Atom.
     * @param {(a:T, b:T)=>boolean} [options.compareFunction] - A function that compares two values for equality.
     */
    constructor(value, options) {
        super();

        if (value instanceof ReactivePrimitive) {
            throw new Error(
                `Atom${
                    this.name ? ` (${this.name})` : ""
                }: value must not be a reactive item`
            );
        }

        this.options = Object.assign({}, this.options, options);

        if (this.options.name) this.name = this.options.name;

        this.#currentValue = value;

        this.engine = new Engine(this, ATOM);
        if (this.options.compareFunction)
            this.engine.compareFn = this.options.compareFunction;

        //this.engine.addUpdate("", "set", undefined, this.#currentValue);
        this.engine.oldValues.set("", undefined);
    }

    /**
     * Sets the value of the Atom. If the new value is the same as the current value, no action is taken.
     * Updates the current value to the new value if they are different.
     * @param {T} value - The new value to set for the Atom.
     */
    set value(value) {
        if (value instanceof ReactivePrimitive) {
            throw new Error(
                `Atom${
                    this.name ? ` (${this.name})` : ""
                }: value must not be a reactive item`
            );
        }

        /** @type {Engine} */
        let engine = this.engine;

        engine.prepareSetValue();

        if (this.equals(value, this.#currentValue)) {
            return;
        }

        let oldValue = this.#currentValue;
        this.#currentValue = clone(value);

        let newValue = this.#currentValue;
        engine.addUpdate("", "set", oldValue, newValue);
        engine.valueChangedCallback();
    }

    /**
     * Retrieves the current value of the Atom. If the engine is destroyed, an error is thrown.
     * Tracks the Atom for dependency management.
     * @param {{untracked?: boolean}} [options] - Optional options. If `untracked` is `false`, the Atom value will be added to the getValueTracker.
     * @returns {T} The current value of the Atom.
     */
    getValue(options) {
        super.getValue(options);
        return this.#currentValue;
    }

    /**
     * Returns the current value of the Atom. If the engine is destroyed, an error is thrown.
     * @returns {T} The current value of the Atom.
     */
    get value() {
        return this.getValue();
    }

    /**
     * Returns the current value of the Atom without tracking it for dependency management.
     * This is useful when you want to access the value without affecting its reactive state.
     * @returns {T} The current value of the Atom.
     * @example
     * ```js
     * const a = atom(0);
     * const b = atom(0);
     * const c = computed(() => a.value + b.valueUntracked, {
     *     name: "c",
     * });
     *
     * c.subscribe(() => {
     *     console.log(c.name, c.value);
     * });
     * console.log("change b.value");
     * b.value++;
     * b.value++;
     * console.log("change a.value");
     * a.value++;
     * // Output: c 3
     * a.value++;
     * // Output: c 4
     * ```
     */
    get valueUntracked() {
        return this.getValue({ untracked: true });
    }
}

export { Atom };
