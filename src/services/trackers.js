// @ts-check

import { ReactivePrimitive } from "../reactives/reactivePrimitive.js";
import { sortReactiveItems } from "../helpers/tools.js";
import { modeController } from "./modeController.js";

class Tracker {
    #isTurnedOn = false;
    /** @type {Set<ReactivePrimitive>} */
    #store = new Set();

    /** @type {Object} */
    ctx = {};

    /**
     * Returns the current contents of the tracker's store, which is a set of all reactive items that have been
     * accessed since the tracker was last turned on. This is useful for debugging and testing purposes.
     * @returns {Set<ReactivePrimitive>} The current contents of the tracker's store.
     */
    get data() {
        return new Set([...this.#store]);
        //return this.#store;
    }

    /**
     * Returns a sorted array of all reactive items in the tracker's store. The items are sorted by their internal id,
     * ensuring consistent processing order when notified of changes.
     * @returns {Array<ReactivePrimitive>} A sorted array of reactive items.
     */
    getAsSortedArray() {
        return Array.from(this.#store).sort(sortReactiveItems);
    }

    /**
     * Adds a reactive item to the tracker's store if the tracker is turned on. If the tracker is not turned on, this
     * method does nothing.
     * @param {ReactivePrimitive} item - The reactive item to add to the tracker's store.
     * @param {string} [key=""]
     */
    add(item, key = "") {
        if (modeController.untrackMode) return;

        if (this.#isTurnedOn) {
            this.#store.add(item);
        }
    }

    /**
     * Returns whether the tracker is currently turned on or not.
     * @returns {boolean} true if the tracker is on, false if it is off.
     */
    isTurnedOn() {
        return this.#isTurnedOn;
    }

    /**
     * Turns the tracker on and clears its store. If the tracker is already turned on, an error is thrown.
     * @param {Object} [ctx={}] - The context to use when the tracker is turned on.
     * are tracked. If filter is a function, it is called with each reactive item as its argument, and if it returns false, the
     * reactive item is not tracked.
     */
    turnOn(ctx = {}) {
        if (this.#isTurnedOn)
            throw new Error("The tracker is already turned on");

        this.ctx = ctx;
        this.#isTurnedOn = true;
        this.#store.clear();
    }

    /**
     * Disables the tracker. When the tracker is disabled, it will not watch any set operations and will not report
     * anything to any registered listeners. The tracker is off by default.
     */
    turnOff() {
        this.#isTurnedOn = false;
    }
}

/**
 * The getValueTracker is a utility instance that monitors reactive items that are used when a computed item is created. It is used
 * to track the dependencies of a computed item, so that it can be recalculated when any of the dependencies change.
 */
export const getValueTracker = new Tracker();

/**
 * Executes the specified function with the given arguments while tracking
 * all reactive items accessed during its execution. The tracked items are
 * returned as an array, representing the dependencies used by the function.
 * This is useful for identifying which reactive items a function depends on.
 *
 * @param {Function} fn - The function to execute and track for reactive item usage.
 * @param {...any} args - The arguments to pass to the function.
 * @returns {Array<ReactivePrimitive>} A sorted array of reactive items accessed during the function execution.
 */
export function getArrayOfUsedReactiveItems(fn, ...args) {
    getValueTracker.turnOn();
    fn(...args);
    getValueTracker.turnOff();
    let res = getValueTracker.getAsSortedArray();
    return res;
}

/**
 * Executes the specified function with the given arguments while tracking
 * all reactive items accessed during its execution. The tracked items are
 * returned as a set, representing the dependencies used by the function.
 * This is useful for identifying which reactive items a function depends on.
 *
 * @param {Function} fn - The function to execute and track for reactive item usage.
 * @param {...any} args - The arguments to pass to the function.
 * @returns {Set<ReactivePrimitive>} A set of reactive items accessed during the function execution.
 */
export function getSetOfUsedReactiveItems(fn, ...args) {
    getValueTracker.turnOn();
    fn(...args);
    getValueTracker.turnOff();
    return getValueTracker.data;
}
