// @ts-check

import { COMPUTED } from '../core/Engine.js';
import { clone, getError } from '../helpers/tools.js';
import { ReactiveItem } from './ReactiveItem.js';

/**
 * Computed is a reactive item whose value is derived from other reactive
 * sources.
 *
 * The function passed to the constructor runs once at construction time to
 * establish dependencies and compute the initial value. It runs again
 * whenever a dependency changes and the recomputed value differs from the
 * cached one. Because equality is checked before notifying subscribers, a
 * computed whose dependencies change but whose output stays the same does
 * not cause any downstream work.
 *
 * `Computed` is derived state and is never persisted — `serialize()`
 * returns `null`, and the value is recalculated from its dependencies on
 * hydration.
 *
 * @augments ReactiveItem
 * @template {unknown} T
 * @public
 */
class Computed extends ReactiveItem {
    /** @type {T} */
    #currentValue;

    /** @type {() => T} */
    #fn;

    /** @type {string} */
    #cachedDependentsVersionString = '';

    /** @type {boolean} */
    #warnedAboutReference = false;

    /**
     * Read-only view of the options passed to the constructor. Currently
     * exposes `smartRecompute`.
     */
    options = {
        smartRecompute: false,
    };

    /**
     * Creates a new Computed.
     *
     * @param {() => T} fn - The derivation function. Must read at least one reactive value.
     * @param {object} [options]
     * @param {string} [options.name] - Debug name used in error messages.
     * @param {((a: T, b: T) => boolean) | null} [options.compareFunction] - Custom equality function. Defaults to shallow comparison.
     * @param {boolean} [options.smartRecompute] - When `true`, the value is recalculated only if the version of a dependency actually changed, avoiding recomputation when dependencies toggled back to their previous values within a batch.
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
            this.#cachedDependentsVersionString = this.#getDependenciesVersionString();
        }
    }

    /**
     * @returns {string}
     */
    #getDependenciesVersionString() {
        /** @type {string[]} */
        const result = [];
        const engine = this.engine;

        engine.dependencies.forEach(dependency => {
            if (dependency.engine.shouldRecalc) {
                dependency.getValue();
            }
            result.push(dependency.engine.id.toString() + ':' + dependency.engine.version);
        });

        return result.join(';');
    }

    /**
     * @returns {T}
     */
    #collectDependenciesAndInitValue() {
        const engine = this.engine;
        const tracker = engine.context.dependencyTracker;
        const modeController = engine.context.modeController;

        tracker.enable();
        modeController.isComputing = true;

        /** @type {T} */
        let value = /** @type {any} */ (undefined);
        /** @type {Set<ReactiveItem>} */
        let newDeps;
        /** @type {Error | null} */
        let thrownError = null;

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
            thrownError = getError(e);
        } finally {
            newDeps = tracker.data;
            tracker.disable();
            modeController.isComputing = false;
        }

        if (thrownError) {
            engine.setError(thrownError);
            throw engine.error;
        }

        if (newDeps.size === 0) {
            throw new Error(`Computed${this.name ? ` (${this.name})` : ''}: No dependencies`);
        }

        engine.addDependencies(newDeps);

        return /** @type {T} */ (value);
    }

    /**
     * Returns `true` if the cached value is out of date and a read would
     * trigger recalculation.
     *
     * A computed is stale if one of its dependencies notified a change, or
     * if its last evaluation threw an error.
     *
     * @returns {boolean}
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

    /**
     * @returns {boolean}
     */
    #areDependenciesStale() {
        const engine = this.engine;
        const dependentsVersionString = this.#getDependenciesVersionString();

        if (dependentsVersionString !== this.#cachedDependentsVersionString) {
            this.#cachedDependentsVersionString = dependentsVersionString;
            engine.shouldRecalc = true;
            return true;
        }

        return false;
    }

    /**
     * Returns the computed value, recalculating first if any dependency
     * changed.
     *
     * When `options.untracked` is `false` (the default), registers this
     * computed as a dependency of the enclosing tracked scope. Pass
     * `{ untracked: true }` to read without creating a dependency.
     *
     * Throws if the derivation function throws, or if the item has been
     * destroyed.
     *
     * @param {{ untracked?: boolean }} [options]
     * @returns {T}
     */
    getValue(options) {
        super.getValue(options);

        const engine = this.engine;

        if (engine.error !== null && !engine.shouldRecalc) {
            throw engine.error;
        }

        if (engine.context.modeController.isComputing) {
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
     * The computed value.
     *
     * Reading this property recalculates if a dependency changed and
     * registers a dependency in the enclosing tracked scope.
     *
     * @returns {T}
     */
    get value() {
        return this.getValue();
    }

    /**
     * Returns the last cached value without triggering recalculation.
     *
     * If the computed is stale, this returns the previous value — not a
     * fresh one. Useful for debugging and for reading without causing side
     * effects, but the value may be out of date.
     *
     * @returns {T}
     */
    peekValue() {
        return this.#currentValue;
    }

    /**
     * Returns the computed value without registering a dependency.
     *
     * Shorthand for `getValue({ untracked: true })`. The value is still
     * recalculated if stale — only dependency registration is skipped.
     *
     * @returns {T}
     */
    get valueUntracked() {
        return this.getValue({ untracked: true });
    }

    /**
     * @returns {T}
     */
    #calc() {
        const engine = this.engine;
        const tracker = engine.context.dependencyTracker;

        engine.shouldRecalc = false;
        engine.clearError();

        tracker.enable();

        /** @type {T} */
        let value = /** @type {any} */ (undefined);
        /** @type {Set<ReactiveItem>} */
        let newDeps;
        /** @type {Error | null} */
        let thrownError = null;

        try {
            value = this.#fn();
        } catch (e) {
            thrownError = getError(e);
        } finally {
            newDeps = tracker.data;
            tracker.disable();
        }

        if (thrownError) {
            engine.setError(
                new Error(`Computed${this.name ? ` (${this.name})` : ''}: ` + thrownError.message, {
                    cause: this,
                })
            );
            throw engine.error;
        }

        if (newDeps.size > 0) {
            engine.updateDependencies(newDeps);
        }

        // Compare against the CURRENT cached value, not a value captured
        // before #fn() ran. If #calc was re-entered during #fn() (nested
        // computed recalculation), #currentValue is already up to date and
        // we must not fire subscribers a second time.
        if (this.equals(this.#currentValue, value)) {
            // Detect the "Collection proxy identity" trap: the computed
            // returned the same reference as before, but at least one
            // dependency's version changed. In that case downstream
            // subscribers will not fire, which is almost never what the
            // user wanted.
            if (
                !this.#warnedAboutReference &&
                this.#hasReactiveContainerDependency() &&
                this.#hasAnyDependencyVersionChanged()
            ) {
                this.#warnedAboutReference = true;
                console.warn(
                    `[store2] Computed${this.name ? ` (${this.name})` : ''} ` +
                        `returned the same reference as before, but a Collection ` +
                        `or ShallowReactive dependency changed. Downstream ` +
                        `subscribers will not fire. Return a fresh array ` +
                        `(e.g. [...collection.value]) or pass ` +
                        `{ compareFunction: compareAny }.`
                );
            }
            engine.clearUpdates();
            return this.#currentValue;
        }

        const oldValue = this.#currentValue;
        this.#currentValue = clone(/** @type {any} */ (value));
        const newValue = this.#currentValue;

        if (engine.addUpdate('', 'set', oldValue, newValue)) {
            engine.valueChangedCallback();
        }

        engine.context.emitPlugin('onComputedRecalc', this, oldValue, newValue);

        return this.#currentValue;
    }

    /**
     * Always returns `null`. Computed items are derived state and are never
     * persisted — they are recalculated from their dependencies on
     * hydration.
     *
     * @returns {null}
     */
    serialize() {
        return null;
    }

    /**
     * Returns true if any direct dependency is a Collection or
     * ShallowReactive (both expose a proxy whose identity does not change
     * when contents change).
     *
     * @returns {boolean}
     */
    #hasReactiveContainerDependency() {
        for (const dep of this.engine.dependencies) {
            const type = dep.engine.type;
            if (type === 3 /* COLLECTION */ || type === 4 /* SHALLOW_REACTIVE */) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns true if at least one dependency has been notified of a change
     * since the previous computation. We cannot know the "previous" version
     * exactly, but the version counter on each dependency is monotonic, so
     * any dependency with `shouldRecalc === true` or a version bump that
     * the computed has not seen yet qualifies. A simpler proxy: check
     * whether any dependency's engine has pending updates.
     *
     * @returns {boolean}
     */
    #hasAnyDependencyVersionChanged() {
        for (const dep of this.engine.dependencies) {
            if (dep.engine.shouldRecalc || dep.engine.hasUpdates()) {
                return true;
            }
        }
        return false;
    }
}

export { Computed };
