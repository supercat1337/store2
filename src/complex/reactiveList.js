// @ts-check

import { Atom } from '../reactives/Atom.js';
import { ShallowReactive } from '../reactives/ShallowReactive.js';
import { Store } from './store.js';
import { isPlainObject } from '../helpers/tools.js';

/**
 * @template T
 * @typedef {T extends object ? ShallowReactive<T> : Atom<T>} ReactiveWrapper
 */

/**
 * Type guard to check if an item is a reactive wrapper with a `value` property.
 * @param {any} item
 * @returns {item is Atom<any> | ShallowReactive<any>}
 */
function isReactiveWrapper(item) {
    return item instanceof Atom || item instanceof ShallowReactive;
}

/**
 * ReactiveList is a reactive array-like structure that stores values of any type.
 * It automatically chooses the appropriate reactive primitive:
 * - Objects and arrays are wrapped with `ShallowReactive` (shallow property tracking).
 * - Primitives (numbers, strings, booleans, etc.) are wrapped with `Atom`.
 *
 * The list supports adding, removing, updating, and splicing items while maintaining
 * full reactivity. Subscribers are notified only once per batch of changes.
 *
 * @template {{[key:string]:any}} T
 *
 * @example
 * ```js
 * const list = new ReactiveList();
 *
 * list.subscribe(() => {
 *     console.log('List changed:', list.getItems());
 * });
 *
 * list.add(1, 2, 3);                // numbers -> stored as Atom
 * list.setItem(1, 42);
 * list.splice(0, 1);
 * list.setItems([{ a: 1 }, { b: 2 }]); // objects -> stored as ShallowReactive
 * ```
 */
export class ReactiveList {
    /** @type {Atom<number>} */
    #lengthAtom;

    /** @type {Store} */
    #store;

    /**
     * Creates a new empty ReactiveList.
     */
    constructor() {
        this.#store = new Store();
        this.#store.suppressNotifications();

        this.#lengthAtom = new Atom(0, { name: 'length' });
        this.#store.addItems({ length: this.#lengthAtom });
        this.#store.unmuteUpdates();
    }

    /**
     * Creates a reactive wrapper for the given value.
     * Uses ShallowReactive for objects/arrays, Atom for primitives.
     *
     * @param {any} value - The value to wrap.
     * @param {string} name - The name to assign to the reactive item (used for debugging).
     * @returns {ReactiveWrapper<any>} The reactive wrapper.
     */
    #createReactiveItem(value, name) {
        if (isPlainObject(value) || Array.isArray(value)) {
            return new ShallowReactive(value, { name });
        }
        // @ts-ignore
        return new Atom(value, { name });
    }

    /**
     * Updates the value of a reactive wrapper.
     * Works for both Atom and ShallowReactive.
     *
     * @param {ReactiveWrapper<any>} wrapper - The reactive wrapper.
     * @param {any} newValue - The new value to set.
     */
    #updateReactiveItem(wrapper, newValue) {
        // Both Atom and ShallowReactive have a `value` setter.
        wrapper.value = newValue;
    }

    /**
     * Adds one or more items to the end of the list.
     *
     * @param {...T} values - The values to add.
     */
    add(...values) {
        if (this.isDestroyed) {throw new Error('ReactiveList has been destroyed');}
        if (values.length === 0) {return;}

        const startIndex = this.#lengthAtom.value;
        const alreadyMuted = this.#store.isMuted();
        this.#store.suppressNotifications();

        /** @type {{[key:string]: ReactiveWrapper<any>}} */
        const wrappers = {};
        for (let i = 0; i < values.length; i++) {
            const idx = startIndex + i;
            const wrapper = this.#createReactiveItem(values[i], idx.toString());
            wrappers[idx] = wrapper;
        }

        this.#store.addItems(wrappers);
        for (let i = 0; i < values.length; i++) {
            const idx = startIndex + i;
            this.#updateReactiveItem(wrappers[idx], values[i]);
        }
        this.#lengthAtom.value += values.length;

        if (!alreadyMuted) {this.#store.unmuteUpdates();}
    }

    /**
     * Retrieves the value at the given index.
     *
     * @param {number} index - The index of the item to retrieve.
     * @returns {T | undefined} The value, or undefined if the index is out of bounds.
     */
    getItem(index) {
        if (this.isDestroyed) {throw new Error('ReactiveList has been destroyed');}
        const item = this.#store.getItem(index.toString());
        if (!isReactiveWrapper(item)) {return undefined;}
        return item.value;
    }

    /**
     * Returns a shallow copy of all items in the list as a plain array.
     *
     * @returns {T[]} An array containing all values.
     */
    getItems() {
        if (this.isDestroyed) {throw new Error('ReactiveList has been destroyed');}
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
     * Updates the value at the specified index.
     *
     * @param {number} index - The index to update.
     * @param {T} value - The new value.
     */
    setItem(index, value) {
        if (this.isDestroyed) {throw new Error('ReactiveList has been destroyed');}
        const wrapper = this.#store.getItem(index.toString());
        if (!isReactiveWrapper(wrapper)) {return;}
        const alreadyMuted = this.#store.isMuted();
        this.#store.suppressNotifications();
        wrapper.value = value;
        if (!alreadyMuted) {this.#store.unmuteUpdates();}
    }

    /**
     * Returns the current length of the list.
     *
     * @returns {number}
     */
    get length() {
        if (this.isDestroyed) {throw new Error('ReactiveList has been destroyed');}
        return this.#lengthAtom.value;
    }

    /**
     * Replaces the entire content of the list with the given array.
     *
     * @param {T[]} values - The new array of values.
     */
    setItems(values) {
        if (this.isDestroyed) {throw new Error('ReactiveList has been destroyed');}
        const alreadyMuted = this.#store.isMuted();
        this.#store.suppressNotifications();

        const currentLen = this.#lengthAtom.value;
        const newLen = values.length;

        if (newLen < currentLen) {
            // Remove tail items
            for (let i = newLen; i < currentLen; i++) {
                this.#store.destroyItem(i.toString());
            }
            this.#lengthAtom.value = newLen;
            // Update remaining items
            for (let i = 0; i < newLen; i++) {
                const wrapper = this.#store.getItem(i.toString());
                if (isReactiveWrapper(wrapper)) {
                    wrapper.value = values[i];
                }
            }
        } else {
            // Update existing items
            for (let i = 0; i < currentLen; i++) {
                const wrapper = this.#store.getItem(i.toString());
                if (isReactiveWrapper(wrapper)) {
                    wrapper.value = values[i];
                }
            }
            // Create and add new items
            /** @type {{[key:string]: ReactiveWrapper<any>}} */
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

        if (!alreadyMuted) {this.#store.unmuteUpdates();}
    }

    /**
     * Removes elements from the list starting at `startIndex` and removing `count` items.
     * Remaining elements are shifted left. The operation is batched to emit only one notification.
     *
     * @param {number} startIndex - The index at which to start removal.
     * @param {number} count - The number of elements to remove.
     */
    splice(startIndex, count) {
        if (this.isDestroyed) {throw new Error('ReactiveList has been destroyed');}
        if (count <= 0) {return;}

        const oldLen = this.#lengthAtom.value;
        if (startIndex < 0 || startIndex >= oldLen) {return;}

        const actualCount = Math.min(count, oldLen - startIndex);
        if (actualCount === 0) {return;}

        const newLen = oldLen - actualCount;
        const alreadyMuted = this.#store.isMuted();
        this.#store.suppressNotifications();

        // Shift elements left
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

        // Destroy tail items
        for (let i = newLen; i < oldLen; i++) {
            this.#store.destroyItem(i.toString());
        }

        this.#lengthAtom.value = newLen;

        if (!alreadyMuted) {this.#store.unmuteUpdates();}
    }

    /**
     * Removes the item at the given index.
     *
     * @param {number} index - The index of the item to remove.
     */
    removeItem(index) {
        this.splice(index, 1);
    }

    /**
     * Removes the last item of the list.
     */
    removeLastItem() {
        this.splice(this.#lengthAtom.value - 1, 1);
    }

    /**
     * Removes the first item of the list.
     */
    removeFirstItem() {
        this.splice(0, 1);
    }

    /**
     * Removes all items from the list.
     */
    clear() {
        this.splice(0, this.#lengthAtom.value);
    }

    /**
     * Destroys the list, releasing all internal resources.
     * After destruction, any method call (except `isDestroyed`) will throw an error.
     */
    destroy() {
        if (this.isDestroyed) {return;}
        this.#store.destroy();
        // No need to nullify #lengthAtom; it will be inaccessible because isDestroyed becomes true.
    }

    /**
     * Indicates whether the list has been destroyed.
     *
     * @returns {boolean}
     */
    get isDestroyed() {
        return this.#store.isDestroyed;
    }

    /**
     * Subscribes a callback to be invoked whenever the list changes.
     * The callback receives a Map of updates with details about changed items.
     *
     * @param {(updates: Map<string, import("../core/UpdateDataRecord.js").UpdateDataRecord>) => void} fn - The callback function.
     * @returns {() => void} A function to unsubscribe the callback.
     */
    subscribe(fn) {
        if (this.isDestroyed) {throw new Error('ReactiveList has been destroyed');}
        return this.#store.subscribe(fn);
    }
}
