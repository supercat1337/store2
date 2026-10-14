// @ts-check

import { ATOM } from '../core/Engine.js';
import { clone } from '../helpers/tools.js';
import { ReactiveItem } from './ReactiveItem.js';

/**
 * Atom is a reactive item that holds a single value.
 *
 * It is the base unit of reactive state — a single mutable cell. Reads
 * inside a tracked scope (a `Computed` body, an `autorun`, or a `reaction`)
 * register a dependency; writes schedule a change notification.
 *
 * Objects assigned to an Atom are shallow-cloned, so mutating nested
 * properties does not trigger reactivity. Use `Collection` or
 * `ShallowReactive` for structures that need deep updates.
 *
 * @augments ReactiveItem
 * @template T
 * @public
 */
class Atom extends ReactiveItem {
    /** @type {T} */
    #currentValue;

    /**
     * Creates a new Atom with the given initial value.
     *
     * @param {T} value - The initial value.
     * @param {object} [options]
     * @param {string} [options.name] - Debug name used in error messages.
     * @param {((a: T, b: T) => boolean) | null} [options.compareFunction] - Custom equality function. Defaults to shallow comparison.
     */
    constructor(
        value,
        options = {
            name: '',
            compareFunction: null,
        }
    ) {
        super(ATOM);

        if (value instanceof ReactiveItem) {
            throw new Error(
                `Atom${this.name ? ` (${this.name})` : ''}: value must not be a reactive item`
            );
        }

        this.name = options.name || '';
        this.engine.compareFn = options.compareFunction || null;
        this.#currentValue = value;
    }

    set value(value) {
        if (value instanceof ReactiveItem) {
            throw new Error(
                `Atom${this.name ? ` (${this.name})` : ''}: value must not be a reactive item`
            );
        }

        const engine = this.engine;
        engine.prepareSetValue();

        if (this.equals(value, this.#currentValue)) {
            return;
        }

        const oldValue = this.#currentValue;
        this.#currentValue = clone(value);

        const newValue = this.#currentValue;
        if (engine.addUpdate('', 'set', oldValue, newValue)) {
            engine.valueChangedCallback();
        }
    }

    /**
     * Returns the current value.
     *
     * When `options.untracked` is `false` (the default), registers this
     * atom as a dependency of the enclosing tracked scope. Pass
     * `{ untracked: true }` to read without creating a dependency.
     *
     * @param {{ untracked?: boolean }} [options]
     * @returns {T}
     */
    getValue(options) {
        super.getValue(options);
        return this.#currentValue;
    }

    /**
     * The current value.
     *
     * Reading this property inside a tracked scope registers a dependency.
     * Writing it schedules a change if the new value differs from the
     * current one.
     *
     * @returns {T}
     */
    get value() {
        return this.getValue();
    }

    /**
     * Returns the current value without registering a dependency.
     *
     * Shorthand for `getValue({ untracked: true })`. Useful when you need
     * to peek at an atom inside a `Computed` or `autorun` without making it
     * re-run when the atom changes.
     *
     * @returns {T}
     */
    get valueUntracked() {
        return this.getValue({ untracked: true });
    }

    /**
     * Returns a serializable representation of the current value.
     *
     * @returns {any}
     */
    serialize() {
        return {
            type: 'atom',
            value: this.#currentValue,
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
        if (data && typeof data === 'object' && 'value' in data) {
            // @ts-ignore
            this.value = data.value;
        }
    }
}

export { Atom };
