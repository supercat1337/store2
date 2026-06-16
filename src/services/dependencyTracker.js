// @ts-check

import { EventEmitterLite } from '@supercat1337/event-emitter';
import { sortReactiveItems } from '../helpers/tools.js';
import { modeController } from './modeController.js';

class Tracker {
    #isActive = false;
    /** @type {Set<ReactiveItem>} */
    #store = new Set();
    #eventEmitter = new EventEmitterLite();

    /** @type {object} */
    ctx = {};

    /**
     * Returns the current contents of the tracker's store, which is a set of all reactive items that have been
     * accessed since the tracker was last turned on. This is useful for debugging and testing purposes.
     * @returns {Set<ReactiveItem>} The current contents of the tracker's store.
     */
    get data() {
        return new Set([...this.#store]);
        //return this.#store;
    }

    /**
     * Returns a sorted array of all reactive items in the tracker's store. The items are sorted by their internal id,
     * ensuring consistent processing order when notified of changes.
     * @returns {Array<ReactiveItem>} A sorted array of reactive items.
     */
    getAsSortedArray() {
        return Array.from(this.#store).sort(sortReactiveItems);
    }

    /**
     * Adds a reactive item to the tracker's store if the tracker is turned on. If the tracker is not turned on, this
     * method does nothing.
     * @param {ReactiveItem} item - The reactive item to add to the tracker's store.
     * @param {string} [_key=""]
     */
    add(item, _key = '') {
        if (modeController.untrackMode) {
            return;
        }

        if (this.#isActive) {
            this.#store.add(item);
            this.#eventEmitter.emit('add', item);
        }
    }

    /**
     *
     * @param {(reactiveItem:ReactiveItem)=>void} callback
     * @returns {()=>void}
     */
    onAdd(callback) {
        return this.#eventEmitter.on('add', callback);
    }

    /**
     * Returns whether the tracker is currently turned on or not.
     * @returns {boolean} true if the tracker is on, false if it is off.
     */
    isTurnedOn() {
        return this.#isActive;
    }

    /**
     * Turns the tracker on and clears its store. If the tracker is already turned on, an error is thrown.
     * @param {object} [ctx={}] - The context to use when the tracker is turned on.
     * are tracked. If filter is a function, it is called with each reactive item as its argument, and if it returns false, the
     * reactive item is not tracked.
     */
    enable(ctx = {}) {
        if (this.#isActive) {
            throw new Error('The tracker is already turned on');
        }

        this.ctx = ctx;
        this.#isActive = true;
        this.#store.clear();
    }

    /**
     * Disables the tracker. When the tracker is disabled, it will not watch any set operations and will not report
     * anything to any registered listeners. The tracker is off by default.
     */
    disable() {
        this.#isActive = false;
    }
}

/**
 * The dependencyTracker is a utility instance that monitors reactive items that are used when a computed item is created. It is used
 * to track the dependencies of a computed item, so that it can be recalculated when any of the dependencies change.
 */
export const dependencyTracker = new Tracker();

/**
 * Executes the specified function and tracks reactive items.
 * Returns a sorted array of used reactive items.
 * @param {Function} fn - The function to execute and track.
 * @param {...any} args - Arguments to pass to the function.
 * @returns {Array<ReactiveItem>} Sorted array of reactive items accessed.
 */
export function getArrayOfUsedReactiveItems(fn, ...args) {
    dependencyTracker.enable();
    try {
        fn(...args);
    } finally {
        dependencyTracker.disable();
    }
    return dependencyTracker.getAsSortedArray();
}

/**
 * Executes the specified function and tracks reactive items.
 * Returns a Set of used reactive items.
 * @param {Function} fn - The function to execute and track.
 * @param {...any} args - Arguments to pass to the function.
 * @returns {Set<ReactiveItem>} Set of reactive items accessed.
 */
export function getSetOfUsedReactiveItems(fn, ...args) {
    dependencyTracker.enable();
    try {
        fn(...args);
    } finally {
        dependencyTracker.disable();
    }
    return dependencyTracker.data;
}
