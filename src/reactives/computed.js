// @ts-check

import { ReactivePrimitive } from "./reactivePrimitive.js";
import { COMPUTED, Engine } from "../core/Engine.js";
import { modeController } from "../services/modeController.js";
import { getValueTracker } from "../services/trackers.js";
import { clone } from "../helpers/tools.js";

/**
 * Computed is a reactive primitive that holds a value that is computed from other reactive values.
 * It is the base unit of reactive state.
 * @extends ReactivePrimitive
 * @template {unknown} T
 * @example
 * ```js
 * const a = new Atom(0); // same as const a = atom(0);
 * const b = new Atom(0);
 *
 * const c = new Computed(() => a.value + b.value);
 *
 * c.subscribe(() => {
 *     console.log("c", c.value);
 * });
 *
 * a.subscribe(() => {
 *     console.log("a", a.value);
 * });
 *
 * b.subscribe(() => {
 *     console.log("b", b.value);
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
class Computed extends ReactivePrimitive {
    /** @type {T} */
    #currentValue;

    /** @type {function():T} */
    #fn;

    /** @type {string} */
    #cachedDependentsVersionString = "";

    options = {
        name: "",
        isHardFunction: false,
        compareFunction: null,
    };

    /**
     * Initializes an Atom instance with a given value.
     * @param {function():T} fn - function that returns the value of the Computed
     * @param {Object} [options] - Options
     * @param {string} [options.name] - The name of the Computed instance.
     * @param {(a:T, b:T)=>boolean} [options.compareFunction] - A function that compares two values for equality.
     * @param {boolean} [options.isHardFunction] - Indicates whether the computed is a hard function. If true, it prevents calling the function by comparing the string representation of the dependencies.
     */
    constructor(fn, options) {
        super();

        this.options = Object.assign({}, this.options, options);

        if (this.options.name) this.name = this.options.name;

        this.engine = new Engine(this, COMPUTED);
        if (this.options.compareFunction)
            this.engine.compareFn = this.options.compareFunction;

        this.#fn = fn;

        getValueTracker.turnOn();
        modeController.computedMode = true;
        try {
            let value = fn();

            if (value instanceof ReactivePrimitive) {
                throw new Error(
                    `Computed${
                        this.name ? ` (${this.name})` : ""
                    }: Return value must not be a reactive item`
                );
            }

            this.#currentValue = value;
            this.engine.oldValues.set("", this.#currentValue);
        } catch (error) {
            this.engine.error = error;
        }

        modeController.computedMode = false;
        getValueTracker.turnOff();

        if (this.engine.error) {
            throw this.engine.error;
        }

        if (getValueTracker.data.size == 0) {
            throw new Error(
                `Computed${this.name ? ` (${this.name})` : ""}: No dependencies`
            );
        }

        this.engine.addDependencies(getValueTracker.data);

        if (this.options.isHardFunction) {
            this.#cachedDependentsVersionString =
                this.#getDependentsVersionString();
        }
    }

    /**
     * Returns a string representation of the dependencies of the Computed value.
     * @returns {string}
     */
    #getDependentsVersionString() {
        /** @type {string[]} */
        let result = [];
        /** @type {Engine} */
        let engine = this.engine;

        engine.dependencies.forEach((dependency) => {
            if (dependency.engine.shouldRecalc) {
                dependency.getValue();
            }

            result.push(
                dependency.engine.id.toString() +
                    ":" +
                    dependency.engine.version
            );
        });

        return result.join(";");
    }

    /**
     * Checks whether the Computed value needs to be recalculated. A recalculation is needed if the engine's shouldRecalc
     * property is true, if the engine has an error, or if the version string of the dependencies has changed.
     * @returns {boolean} true if the Computed value needs to be recalculated, false if it does not.
     */
    isStale() {
        /** @type {Engine} */
        let engine = this.engine;

        if (engine.error != null) return true;

        if (engine.shouldRecalc) return true;

        return false;
    }

    #areDependenciesStale() {
        /** @type {Engine} */
        let engine = this.engine;

        let dependentsVersionString = this.#getDependentsVersionString();
        if (dependentsVersionString != this.#cachedDependentsVersionString) {
            this.#cachedDependentsVersionString = dependentsVersionString;
            engine.shouldRecalc = true;

            return true;
        }

        return false;
    }

    /**
     * @param {{untracked?: boolean}} [options] - Optional options. If `untracked` is `false`, the Computed value will be added to the getValueTracker.
     * @returns {T} The current value of the Computed value.
     */
    getValue(options) {
        super.getValue(options);

        /** @type {Engine} */
        let engine = this.engine;

        if (modeController.computedMode) {
            if (this.isStale()) {
                throw new Error(
                    `Computed${
                        this.name ? ` (${this.name})` : ""
                    }: Dependencies cannot be stale`,
                    { cause: this }
                );
            }
        }

        if (!this.isStale()) {
            engine.shouldRecalc = false;
            return this.#currentValue;
        }

        if (this.options.isHardFunction) {
            if (!this.#areDependenciesStale()) {
                engine.shouldRecalc = false;
                return this.#currentValue;
            }
        }

        return this.#calc();
    }

    /**
     * Returns the current value of the Computed value.
     * @returns {T} The current value of the Computed value.
     */
    get value() {
        return this.getValue();
    }

    /**
     * Returns the current value of the Computed value without tracking it for dependency management.
     * This is useful when you want to access the value without affecting its reactive state.
     * @returns {T} The current value of the Computed value.
     * @example
     * ```js
     * const a = atom(0);
     * const b = atom(0);
     * const c = computed(() => a.value + 1);
     * const d = computed(() => c.valueUntracked + b.value);
     *
     * d.subscribe(() => {
     *     console.log(`d = ${d.value}`);
     * });
     *
     * console.log(`c = ${c.value}`);
     * // Outputs: c = 1
     * a.value++;
     * // a = 1
     * // Outputs: nothing
     * console.log(`c = ${c.value}`);
     * // Outputs: c = 2
     *
     * b.value++;
     * // Outputs: d = 3
     * ```
     */
    get valueUntracked() {
        return this.getValue({ untracked: true });
    }

    #calc() {
        /** @type {Engine} */
        let engine = this.engine;

        engine.shouldRecalc = false;
        engine.error = null;

        let value;

        //console.log("calc", this.name);
        try {
            value = this.#fn();
        } catch (e) {
            engine.setError(
                new Error(
                    `Computed${this.name ? ` (${this.name})` : ""}: ` +
                        e.message,
                    { cause: this }
                )
            );
            throw engine.error;
        }

        if (this.equals(this.#currentValue, value)) {
            return this.#currentValue;
        }

        let oldValue = this.#currentValue;
        this.#currentValue = clone(value);

        let newValue = this.#currentValue;
        engine.addUpdate("", "set", oldValue, newValue);

        engine.valueChangedCallback();

        return this.#currentValue;
    }
}

export { Computed };
