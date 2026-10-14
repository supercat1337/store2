// @ts-check

import { Atom } from '../reactives/Atom.js';
import { ShallowReactive } from '../reactives/ShallowReactive.js';
import { Store } from './Store.js';
import { isPlainObject } from '../helpers/tools.js';

/**
 * @template T
 * @typedef {T extends object ? ShallowReactive<T> : Atom<T>} ReactiveWrapper
 */

/**
 * Type guard for reactive wrappers with a `value` property.
 * @param {any} item
 * @returns {item is Atom<any> | ShallowReactive<any>}
 */
function isReactiveWrapper(item) {
    return item instanceof Atom || item instanceof ShallowReactive;
}

/**
 * ReactiveList is a reactive array-like structure that stores values of any
 * type.
 *
 * Primitives (numbers, strings, booleans) are wrapped in `Atom`; objects
 * and arrays are wrapped in `ShallowReactive`. Every mutation — adding,
 * removing, replacing, reordering — is batched into a single notification.
 *
 * Internally the list is backed by a `Store` indexed by string positions,
 * plus a separate `Atom` tracking the list length. This is not part of the
 * public contract; treat the list as an opaque reactive array.
 *
 * @template T
 * @public
 */
export class ReactiveList {
    /**
     * Local path of this list. Empty unless set by the user. Used by
     * snapshot tooling to build dotted paths when the list is nested inside
     * a `Store`.
     * @type {string}
     */
    path = '';

    /** @type {Atom<number>} */
    #lengthAtom;

    /** @type {Store} */
    #store;

    /**
     * Creates a new empty ReactiveList.
     */
    constructor() {
        this.#store = new Store();
        this.#store.muteUpdates();

        this.#lengthAtom = new Atom(0, { name: 'length' });
        this.#store.addItems({ length: this.#lengthAtom });
        this.#store.unmuteUpdates();
    }

    /**
     * @param {any} value
     * @param {string} name
     * @returns {ReactiveWrapper<any>}
     */
    #createReactiveItem(value, name) {
        /** @type {ReactiveWrapper<any>} */
        let item;
        if (isPlainObject(value) || Array.isArray(value)) {
            item = new ShallowReactive(value, { name });
        } else {
            // @ts-ignore
            item = new Atom(value, { name });
        }
        item.path = name;
        return item;
    }

    /**
     * @param {ReactiveWrapper<any>} wrapper
     * @param {any} newValue
     */
    #updateReactiveItem(wrapper, newValue) {
        wrapper.value = newValue;
    }

    /**
     * Appends one or more values to the end of the list.
     *
     * Each value is wrapped according to its type — primitives become
     * `Atom`, objects and arrays become `ShallowReactive`. The whole
     * operation produces a single notification, regardless of how many
     * values are added.
     *
     * @param {...T} values
     */
    add(...values) {
        if (this.isDestroyed) {
            throw new Error('ReactiveList has been destroyed');
        }
        if (values.length === 0) {
            return;
        }

        const startIndex = this.#lengthAtom.value;
        const alreadyMuted = this.#store.isMuted();
        this.#store.muteUpdates();

        /** @type {{[key: string]: ReactiveWrapper<any>}} */
        const wrappers = {};
        for (let i = 0; i < values.length; i++) {
            const idx = startIndex + i;
            wrappers[idx] = this.#createReactiveItem(values[i], idx.toString());
        }

        this.#store.addItems(wrappers);
        for (let i = 0; i < values.length; i++) {
            const idx = startIndex + i;
            this.#updateReactiveItem(wrappers[idx], values[i]);
        }
        this.#lengthAtom.value += values.length;

        if (!alreadyMuted) {
            this.#store.unmuteUpdates();
        }
    }

    /**
     * Returns the value at the given index, or `undefined` if the index is
     * out of bounds.
     *
     * Reads through the reactive wrapper, so a call inside a tracked scope
     * registers a dependency on the item at that index.
     *
     * @param {number} index
     * @returns {T | undefined}
     */
    getItem(index) {
        if (this.isDestroyed) {
            throw new Error('ReactiveList has been destroyed');
        }
        const item = this.#store.getItem(index.toString());
        if (!isReactiveWrapper(item)) {
            return undefined;
        }
        return item.value;
    }

    /**
     * Returns a shallow copy of all items in the list as a plain array.
     *
     * The array is newly allocated on each call; mutating it does not
     * affect the list. Elements that are reactive objects are returned as
     * their underlying values, not as wrappers.
     *
     * @returns {T[]}
     */
    toArray() {
        if (this.isDestroyed) {
            throw new Error('ReactiveList has been destroyed');
        }
        const items = [];
        for (let i = 0; i < this.#lengthAtom.value; i++) {
            const item = this.#store.getItem(i.toString());
            if (isReactiveWrapper(item)) {
                items.push(item.value);
            }
        }
        return items;
    }

    /**
     * Replaces the value at the specified index.
     *
     * The whole operation produces a single notification. No-op if `index`
     * is out of bounds.
     *
     * @param {number} index
     * @param {T} value
     */
    setItem(index, value) {
        if (this.isDestroyed) {
            throw new Error('ReactiveList has been destroyed');
        }
        const wrapper = this.#store.getItem(index.toString());
        if (!isReactiveWrapper(wrapper)) {
            return;
        }
        const alreadyMuted = this.#store.isMuted();
        this.#store.muteUpdates();
        wrapper.value = value;
        if (!alreadyMuted) {
            this.#store.unmuteUpdates();
        }
    }

    /**
     * The current number of items in the list.
     *
     * Reading this property inside a tracked scope registers a dependency,
     * so the enclosing effect re-runs whenever items are added or removed.
     *
     * @returns {number}
     */
    get length() {
        if (this.isDestroyed) {
            throw new Error('ReactiveList has been destroyed');
        }
        return this.#lengthAtom.value;
    }

    /**
     * Replaces the entire content of the list with the given array.
     *
     * Existing positions are updated in place; positions beyond the new
     * length are destroyed; new positions are created. The whole operation
     * produces a single notification.
     *
     * @param {T[]} values
     */
    setItems(values) {
        if (this.isDestroyed) {
            throw new Error('ReactiveList has been destroyed');
        }
        const alreadyMuted = this.#store.isMuted();
        this.#store.muteUpdates();

        const currentLen = this.#lengthAtom.value;
        const newLen = values.length;

        if (newLen < currentLen) {
            for (let i = newLen; i < currentLen; i++) {
                this.#store.destroyItem(i.toString());
            }
            this.#lengthAtom.value = newLen;
            for (let i = 0; i < newLen; i++) {
                const wrapper = this.#store.getItem(i.toString());
                if (isReactiveWrapper(wrapper)) {
                    wrapper.value = values[i];
                }
            }
        } else {
            for (let i = 0; i < currentLen; i++) {
                const wrapper = this.#store.getItem(i.toString());
                if (isReactiveWrapper(wrapper)) {
                    wrapper.value = values[i];
                }
            }
            /** @type {{[key: string]: ReactiveWrapper<any>}} */
            const wrappers = {};
            for (let i = currentLen; i < newLen; i++) {
                wrappers[i] = this.#createReactiveItem(values[i], i.toString());
            }
            this.#store.addItems(wrappers);
            for (let i = currentLen; i < newLen; i++) {
                this.#updateReactiveItem(wrappers[i], values[i]);
            }
            this.#lengthAtom.value = newLen;
        }

        if (!alreadyMuted) {
            this.#store.unmuteUpdates();
        }
    }

    /**
     * Removes `count` items starting at `startIndex`.
     *
     * Remaining items shift left to fill the gap; the tail positions are
     * destroyed. The whole operation produces a single notification.
     *
     * No-op if `count <= 0`, `startIndex < 0`, or `startIndex >= length`.
     * If `count` exceeds the number of items from `startIndex` to the end,
     * it is clamped.
     *
     * @param {number} startIndex
     * @param {number} count
     */
    removeRange(startIndex, count) {
        if (this.isDestroyed) {
            throw new Error('ReactiveList has been destroyed');
        }
        if (count <= 0) {
            return;
        }

        const oldLen = this.#lengthAtom.value;
        if (startIndex < 0 || startIndex >= oldLen) {
            return;
        }

        const actualCount = Math.min(count, oldLen - startIndex);
        if (actualCount === 0) {
            return;
        }

        const newLen = oldLen - actualCount;
        const alreadyMuted = this.#store.isMuted();
        this.#store.muteUpdates();

        for (let i = startIndex; i < newLen; i++) {
            const srcIndex = i + actualCount;
            const srcItem = this.#store.getItem(srcIndex.toString());
            const destItem = this.#store.getItem(i.toString());
            if (isReactiveWrapper(srcItem) && isReactiveWrapper(destItem)) {
                destItem.value = srcItem.value;
            } else if (isReactiveWrapper(destItem)) {
                destItem.value = undefined;
            }
        }

        for (let i = newLen; i < oldLen; i++) {
            this.#store.destroyItem(i.toString());
        }

        this.#lengthAtom.value = newLen;

        if (!alreadyMuted) {
            this.#store.unmuteUpdates();
        }
    }

    /**
     * Removes the item at the given index.
     *
     * Shorthand for `removeRange(index, 1)`. No-op if `index` is out of
     * bounds.
     *
     * @param {number} index
     */
    removeItem(index) {
        this.removeRange(index, 1);
    }

    /**
     * Removes the last item. No-op if the list is empty.
     */
    removeLastItem() {
        this.removeRange(this.#lengthAtom.value - 1, 1);
    }

    /**
     * Removes the first item. No-op if the list is empty.
     */
    removeFirstItem() {
        this.removeRange(0, 1);
    }

    /**
     * Removes all items from the list.
     *
     * The length becomes `0` and every item is destroyed.
     */
    clear() {
        this.removeRange(0, this.#lengthAtom.value);
    }

    /**
     * Destroys the list and releases its internal store.
     *
     * After this call, all mutating methods throw. Idempotent — subsequent
     * calls are no-ops.
     */
    destroy() {
        if (this.isDestroyed) {
            return;
        }
        this.#store.destroy();
    }

    /**
     * Returns `true` after `destroy()` has been called.
     *
     * After destruction, all mutating methods throw and only this getter
     * remains safe to call.
     *
     * @returns {boolean}
     */
    get isDestroyed() {
        return this.#store.isDestroyed;
    }

    /**
     * Subscribes a function to changes of the list.
     *
     * The callback receives a `Map` of update paths to `UpdateDataRecord`
     * instances. It is invoked once per batch of effective changes,
     * regardless of how many items were affected.
     *
     * @param {(updates: Map<string, import('../core/UpdateDataRecord.js').UpdateDataRecord>) => void} fn
     * @returns {() => void} An unsubscribe function.
     */
    subscribe(fn) {
        if (this.isDestroyed) {
            throw new Error('ReactiveList has been destroyed');
        }
        return this.#store.subscribe(fn);
    }

    /**
     * Returns a serializable representation of the list's contents.
     *
     * The shape is `{ type: 'list', value: [...] }`, matching the
     * serialization protocol used by reactive items.
     *
     * @returns {any}
     */
    serialize() {
        return {
            type: 'list',
            value: this.toArray(),
        };
    }

    /**
     * Returns the list's contents as a plain array. Enables
     * `JSON.stringify(list)` to produce useful output.
     *
     * @returns {T[]}
     */
    toJSON() {
        return this.toArray();
    }

    /**
     * Applies data produced by `serialize()`.
     *
     * Uses `setItems` internally, so the whole replacement is batched and
     * subscribers fire once. Silently ignores malformed input.
     *
     * @param {any} data
     */
    hydrate(data) {
        if (data && typeof data === 'object' && data.type === 'list' && Array.isArray(data.value)) {
            this.setItems(data.value);
        }
    }

    /**
     * Monotonic version counter, bumped on every effective change of the
     * list, including changes that come from nested items.
     *
     * The value is stable between notifications, which makes it suitable
     * as a snapshot token for `useSyncExternalStore`.
     *
     * @returns {number}
     */
    getVersion() {
        if (this.isDestroyed) {
            throw new Error('ReactiveList has been destroyed');
        }
        return this.#store.getVersion();
    }

    /**
     * Returns the version of the item at the given index, or `-1` if the
     * index is out of bounds.
     *
     * Framework adapters use this to implement fine-grained list selectors
     * without re-rendering the whole list on every change.
     *
     * @param {number} index
     * @returns {number}
     */
    getItemVersionAt(index) {
        if (this.isDestroyed) {
            throw new Error('ReactiveList has been destroyed');
        }
        const wrapper = this.#store.getItem(index.toString());
        if (isReactiveWrapper(wrapper)) {
            return wrapper.getVersion();
        }
        return -1;
    }

    /**
     * Returns a minimal observable facade for framework adapters.
     *
     * - `get()` returns a fresh array via `toArray()`.
     * - `subscribe(fn)` invokes `fn` with the array on every effective
     *   change of the list.
     * - `version()` returns the monotonic version, suitable as a token
     *   for `useSyncExternalStore`.
     *
     * @returns {import('../types.js').ObservableValue<any[]>}
     */
    toObservable() {
        const self = this;
        return {
            get() {
                return self.toArray();
            },
            subscribe(fn) {
                return self.subscribe(() => {
                    fn(self.toArray());
                });
            },
            version() {
                return self.getVersion();
            },
        };
    }
}
