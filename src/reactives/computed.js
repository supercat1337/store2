// @ts-check

import { COMPUTED } from '../core/Engine.js';
import { clone, getError } from '../helpers/tools.js';
import { dependencyTracker } from '../services/dependencyTracker.js';
import { modeController } from '../services/modeController.js';
import { ReactiveItem } from './ReactiveItem.js';

/**
 * Computed is a reactive primitive that holds a value that is computed from other reactive values.
 * It is the base unit of reactive state.
 * @augments ReactiveItem
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
class Computed extends ReactiveItem {
    /** @type {T} */
    #currentValue;

    /** @type {function():T} */
    #fn;

    /** @type {string} */
    __cachedDependentsVersionString = '';

    options = {
        smartRecompute: false,
    };

    /**
     * Initializes an Atom instance with a given value.
     * @param {function():T} fn - function that returns the value of the Computed
     * @param {object} [options] - Options
     * @param {string} [options.name] - The name of the Computed instance.
     * @param {((a:T, b:T)=>boolean)|null} [options.compareFunction] - A function that compares two values for equality.
     * @param {boolean} [options.smartRecompute] - When true, the computed value will be
     *        recalculated only when the version string of its dependencies changes,
     *        rather than on every dependency notification. This avoids unnecessary
     *        recalculations when dependencies change but their final values remain
     *        the same (e.g., toggling back and forth). Defaults to false.
     */
    constructor(
        fn,
        options = {
            name: '',
            compareFunction: null,
            smartRecompute: false,
        }
    ) {
        super(COMPUTED);

        this.options = {
            smartRecompute: options.smartRecompute ?? false,
        };

        this.name = options.name || '';
        this.engine.compareFn = options.compareFunction || null;
        this.#fn = fn;

        this.#currentValue = this.#collectDependenciesAndInitValue();

        if (this.options.smartRecompute) {
            this.__cachedDependentsVersionString = this.#getDependenciesVersionString();
        }
    }

    /**
     * Returns a string representation of the dependencies of the Computed value.
     * @returns {string}
     */
    #getDependenciesVersionString() {
        /** @type {string[]} */
        const result = [];
        const engine = this.engine;

        engine.dependencies.forEach(dependency => {
            // If a dependency is stale (shouldRecalc = true), we must recalculate it
            // to get its most recent version. This is necessary for smartRecompute
            // to correctly detect changes in the dependency graph.
            if (dependency.engine.shouldRecalc) {
                dependency.getValue(); // side effect: forces recomputation
            }

            result.push(dependency.engine.id.toString() + ':' + dependency.engine.version);
        });

        return result.join(';');
    }

    #collectDependenciesAndInitValue() {
        dependencyTracker.enable();
        modeController.isComputing = true;
        /** @type {T} */
        let value;
        try {
            value = this.#fn();
            if (value instanceof ReactiveItem) {
                throw new Error(
                    `Computed${
                        this.name ? ` (${this.name})` : ''
                    }: Return value must not be a reactive item`
                );
            }
        } catch (e) {
            this.engine.setError(getError(e));
        }

        modeController.isComputing = false;
        dependencyTracker.disable();

        if (this.engine.error) {
            throw this.engine.error;
        }

        if (dependencyTracker.data.size === 0) {
            throw new Error(`Computed${this.name ? ` (${this.name})` : ''}: No dependencies`);
        }

        this.engine.addDependencies(dependencyTracker.data);
        // @ts-ignore
        return value;
    }

    /**
     * Checks whether the Computed value needs to be recalculated. A recalculation is needed if the engine's shouldRecalc
     * property is true, if the engine has an error, or if the version string of the dependencies has changed.
     * @returns {boolean} true if the Computed value needs to be recalculated, false if it does not.
     */
    isStale() {
        const engine = this.engine;

        if (engine.error !== null) {
            return true;
        }

        if (engine.shouldRecalc) {
            return true;
        }

        return false;
    }

    #areDependenciesStale() {
        const engine = this.engine;

        const dependentsVersionString = this.#getDependenciesVersionString();
        if (dependentsVersionString !== this.__cachedDependentsVersionString) {
            this.__cachedDependentsVersionString = dependentsVersionString;
            engine.shouldRecalc = true;

            return true;
        }

        return false;
    }

    /**
     * @param {{untracked?: boolean}} [options] - Optional options. If `untracked` is `false`, the Computed value will be added to the dependencyTracker.
     * @returns {T} The current value of the Computed value.
     */
    getValue(options) {
        super.getValue(options);

        const engine = this.engine;

        // If there's an error and dependencies haven't changed, rethrow the same error without recalculating
        if (engine.error !== null && !engine.shouldRecalc) {
            throw engine.error;
        }

        if (modeController.isComputing) {
            if (this.isStale()) {
                throw new Error(
                    `Computed${this.name ? ` (${this.name})` : ''}: Dependencies cannot be stale`,
                    { cause: this }
                );
            }
        }

        if (!this.isStale()) {
            engine.shouldRecalc = false;
            return this.#currentValue;
        }

        if (this.options.smartRecompute) {
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
     * Returns the current cached value of the computed without triggering a recalculation
     * and without tracking dependencies.
     *
     * Unlike the `value` getter, this method does not check if dependencies have changed
     * and does not recompute the value if it's stale. It simply returns the last
     * computed value. This is useful for debugging or for accessing the value
     * without causing side effects (e.g., inside an untracked context).
     *
     * If the computed has an error, this method will still return the last cached
     * value (which may be undefined or a previous value) without rethrowing the error.
     *
     * @override
     * @returns {T} The cached value.
     *
     * @example
     * ```js
     * const a = atom(1);
     * const b = computed(() => a.value * 2);
     *
     * console.log(b.peekValue()); // 2 (without tracking dependencies)
     * a.value = 2;
     * console.log(b.peekValue()); // still 2 (stale, not recomputed)
     * console.log(b.value);       // 4 (recomputed now)
     * ```
     */
    peekValue() {
        return this.#currentValue;
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
        const engine = this.engine;

        engine.shouldRecalc = false;
        engine.clearError();

        // Collect new dependencies if dynamic mode is enabled
        /** @type {Set<ReactiveItem>} */
        const newDeps = new Set();
        const unsubscribe = dependencyTracker.onAdd(item => {
            newDeps.add(item);
        });

        let value;

        //console.log("calc", this.name);
        try {
            value = this.#fn();
        } catch (e) {
            const error = getError(e);
            engine.setError(
                new Error(`Computed${this.name ? ` (${this.name})` : ''}: ` + error.message, {
                    cause: this,
                })
            );
            throw engine.error;
        } finally {
            unsubscribe();
        }

        if (this.equals(this.#currentValue, value)) {
            // Value didn't actually change – remove any pending update
            this.engine.clearUpdates();
            return this.#currentValue;
        }

        const oldValue = this.#currentValue;
        this.#currentValue = clone(value);

        const newValue = this.#currentValue;
        //this.engine.version++;
        if (engine.addUpdate('', 'set', oldValue, newValue)) {
            engine.valueChangedCallback();
        }

        return this.#currentValue;
    }
}

export { Computed };
