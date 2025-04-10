// @ts-check

import { Atom } from "../reactives/atom.js";
import { ReactiveProps } from "../reactives/reactiveProps.js";
import { Store } from "./store.js";
import { UpdateDataRecord } from "../core/UpdateDataRecord.js";

/**
 * ReactiveList is a class that represents a reactive list of items.
 * It allows adding, removing, and updating items in the list while maintaining reactivity.
 * @template {{[key:string]:any}} T
 * @example
 * ```js
 * const list = new ReactiveList();
 * const item1 = { name: "item1" };
 * const item2 = { name: "item2" };
 * const item3 = { name: "item3" };
 *
 * list.subscribe((updates) => {
 *     console.log("updates: ", Array.from(updates.keys()));
 *     console.log("list.length = ", list.length);
 *     console.log("list.items = ", list.getItems());
 *     console.log("=====================================");
 * });
 *
 * list.setItems([item1, item2, item3]);
 * // Outputs:
 * // updates:  [ '0.name', '1.name', '2.name', 'length' ]
 * // list.length =  3
 * // list.items =  [ { name: 'item1' }, { name: 'item2' }, { name: 'item3' } ]
 *
 * list.setItems([item1]);
 * // Outputs:
 * // updates:  [ '1', '2', 'length' ]
 * // list.length =  1
 * // list.items =  [ { name: 'item1' } ]
 *
 * list.setItem(0, { name: "updated" });
 * // Outputs:
 * // updates:  [ '0.name' ]
 * // list.length =  1
 * // list.items =  [ { name: 'updated' } ]
 * ```
 */
export class ReactiveList {
    /** @type {Atom<number>} */
    #lengthAtom;

    /** @type {Store} */
    #store;

    constructor() {
        this.#store = new Store();
        this.#store.muteUpdates();

        this.#lengthAtom = new Atom(0, {
            name: "length",
        });
        this.#store.addItems({ length: this.#lengthAtom });
        this.#store.unmuteUpdates();
    }

    /**
     * Adds the given values to the reactive list as ReactiveProps items.
     * Updates the internal store and the length atom accordingly.
     * @param {...T} values - The values to add to the list.
     */
    add(...values) {
        if (this.isDestroyed) {
            throw new Error("The reactive list has been destroyed");
        }

        // Check if the values are empty
        if (values.length === 0) return;

        let startIndex = this.#lengthAtom.value;
        /** @type {{[key:string]:any}} */
        let items = {};
        /** @type {{[key:string]:ReactiveProps}} */
        let reactives = {};

        let alreadyMuted = this.#store.isMuted();
        this.#store.muteUpdates();

        for (let i = 0; i < values.length; i++) {
            let value = values[i];
            reactives[startIndex + i] = new ReactiveProps(
                {},
                { name: (startIndex + i).toString() }
            );
            items[startIndex + i] = value;
        }

        this.#store.addItems(reactives);
        let that = this;

        that.#lengthAtom.value = that.#lengthAtom.value + values.length;
        for (let i = 0; i < values.length; i++) {
            reactives[startIndex + i].value = values[i];
        }

        if (!alreadyMuted) {
            that.#store.unmuteUpdates();
        }
    }

    /**
     * Retrieves the value of the ReactiveProps item at the specified index.
     * @param {number} index - The index of the item to retrieve from the reactive list.
     * @returns {T|undefined} The value of the item at the specified index, or undefined if no item exists at that index.
     */
    getItem(index) {
        if (this.isDestroyed) {
            throw new Error("The reactive list has been destroyed");
        }

        let item = /** @type {ReactiveProps|null} */ (
            this.#store.getItem(index.toString())
        );

        if (item) {
            return item.value;
        }

        return undefined;
    }

    /**
     * Retrieves all items from the reactive list as an array of values.
     * The order of the items in the array matches the order of the items in the reactive list.
     * If the reactive list has been destroyed, an empty array is returned.
     * @returns {T[]} An array of values from the reactive list.
     */
    getItems() {
        if (this.isDestroyed) {
            throw new Error("The reactive list has been destroyed");
        }

        let items = [];
        for (let i = 0; i < this.#lengthAtom.value; i++) {
            let item = /** @type {ReactiveProps|null} */ (
                this.#store.getItem(i.toString())
            );
            if (item) {
                items.push(item.value);
            }
        }
        return items;
    }

    /**
     * Sets the value of the ReactiveProps item at the specified index.
     * If the item exists at the given index, its value is updated.
     * @param {number} index - The index of the item to update in the reactive list.
     * @param {T} value - The new value to set for the item at the specified index.
     */
    setItem(index, value) {
        if (this.isDestroyed) {
            throw new Error("The reactive list has been destroyed");
        }

        let alreadyMuted = this.#store.isMuted();
        this.#store.muteUpdates();
        let item = /** @type {ReactiveProps|null} */ (
            this.#store.getItem(index.toString())
        );

        if (item) {
            item.value = value;
        }

        if (!alreadyMuted) {
            this.#store.unmuteUpdates();
        }
    }

    /**
     * Retrieves the length of the reactive list.
     * @returns {number} The length of the reactive list.
     */
    get length() {
        if (this.isDestroyed) {
            return 0;
        }

        return this.#lengthAtom.value;
    }

    /**
     * Sets multiple items in the reactive list, updating existing items or adding new ones as necessary.
     * If the new number of items is less than the current length of the list, the excess items are destroyed.
     * Operates within a batch to optimize performance and prevent unnecessary reactivity triggers.
     *
     * @param {T[]} values - The new values to set in the reactive list.
     */
    setItems(values) {
        if (this.isDestroyed) {
            throw new Error("The reactive list has been destroyed");
        }

        if (values.length === 0) {
            this.clear();
            return;
        }

        let isAlreadyMuted = this.#store.isMuted();
        this.#store.muteUpdates();

        if (values.length < this.#lengthAtom.value) {
            for (let i = values.length; i < this.#lengthAtom.value; i++) {
                this.#store.destroyItem(i.toString());
            }

            this.#lengthAtom.value = values.length;

            for (let i = 0; i < values.length; i++) {
                let item = /** @type {ReactiveProps} */ (
                    this.#store.getItem(i.toString())
                );
                item.value = values[i];
            }
        } else {
            // If the new number of items is greater than the current length,
            // we need to add new items to the list.

            let currentLength = this.#lengthAtom.value;

            // Update existing items
            for (let i = 0; i < currentLength; i++) {
                let item = /** @type {ReactiveProps} */ (
                    this.#store.getItem(i.toString())
                );
                item.value = values[i];
            }

            /** @type {{[key:string]:ReactiveProps}} */
            let reactives = {};

            for (let i = currentLength; i < values.length; i++) {
                reactives[i] = new ReactiveProps({}, { name: i.toString() });
            }

            this.#store.addItems(reactives);

            for (let i = currentLength; i < values.length; i++) {
                reactives[i].value = values[i];
            }

            this.#lengthAtom.value = values.length;
        }

        if (!isAlreadyMuted) {
            this.#store.unmuteUpdates();
        }
    }

    /**
     * Cleans up the reactive list by destroying all items in the internal store.
     * This method is useful when the reactive list is no longer needed and resources should be freed.
     */
    destroy() {
        this.#store.destroy();
    }

    /**
     * Returns true if the reactive list has been destroyed, and false otherwise.
     * This property is useful for determining whether it is safe to interact with the reactive list.
     * A destroyed reactive list will not respond to any methods or properties except for this one.
     * @type {boolean}
     */
    get isDestroyed() {
        return this.#store.isDestroyed;
    }

    /**
     * Subscribes a function to be called whenever the value of this reactive list changes.
     * The function is called with a Map of updates, where the keys are the names of the items that changed, and the values are UpdateDataRecord objects.
     * @param {(update: Map<string, UpdateDataRecord>)=>void} fn - The function to be called whenever the value of this reactive list changes.
     * @returns {()=>void} A function that unsubscribes the given function.
     */
    subscribe(fn) {
        if (this.isDestroyed) {
            throw new Error("The reactive list has been destroyed");
        }

        return this.#store.subscribe(fn);
    }

    /**
     * Removes a specified number of items from the reactive list, starting at a given index.
     * The function operates within a batch to optimize performance and prevent unnecessary reactivity triggers.
     *
     * @param {number} startIndex - The index at which to start removing items from the list.
     * @param {number} count - The number of items to remove from the list.
     */
    splice(startIndex, count) {
        if (this.isDestroyed) {
            throw new Error("The reactive list has been destroyed");
        }

        if (count <= 0) {
            return;
        }

        let listLength = this.#lengthAtom.value;

        if (startIndex < 0 || startIndex >= listLength) {
            return;
        }

        count =
            startIndex + count > listLength ? listLength - startIndex : count;

        let alreadyMuted = this.#store.isMuted();
        this.#store.muteUpdates();

        for (let i = startIndex; i < listLength; i++) {
            let currentItem = /** @type {ReactiveProps} */ (
                this.#store.getItem(i.toString())
            );

            let itemWithValue = /** @type {ReactiveProps} */ (
                this.#store.getItem((i + count).toString())
            );

            if (itemWithValue) {
                currentItem.value = itemWithValue.value;
            }
        }

        // Destroy the items that are no longer needed
        // and update the length atom.
        for (let i = listLength - count; i < listLength; i++) {
            this.#store.destroyItem(i.toString());
        }

        this.#lengthAtom.value = listLength - count;

        if (!alreadyMuted) {
            this.#store.unmuteUpdates();
        }
    }

    /**
     * Removes the item at the given index from the reactive list.
     * @param {number} index - The index of the item to remove.
     */
    removeItem(index) {
        this.splice(index, 1);
    }

    /**
     * Removes the last item from the reactive list.
     */
    removeLastItem() {
        this.splice(this.#lengthAtom.value - 1, 1);
    }

    /**
     * Removes the first item from the reactive list.
     */
    removeFirstItem() {
        this.splice(0, 1);
    }

    /**
     * Clears all items from the reactive list.
     * This method removes all items from the list using the splice operation,
     * effectively resetting the list to an empty state.
     */
    clear() {
        this.splice(0, this.#lengthAtom.value);
    }
}
