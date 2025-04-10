// @ts-check

import { compareAny } from "../helpers/tools.js";
import { Engine } from "../core/Engine.js";
import { getValueTracker } from "../services/trackers.js";
import { UpdateDataRecord } from "../core/UpdateDataRecord.js";

/**
 * ReactivePrimitive is the base class for all reactive items. It provides methods for subscribing to changes,
 * getting the current value, and checking for errors.
 * @private
 */
class ReactivePrimitive {
    /** @type {Engine} */
    engine;

    name = "";

    /**
     * Subscribes a function to be called whenever the value of this reactive item changes.
     * @param {(updates: Map<string, UpdateDataRecord>)=>void} fn - The function to be called whenever the value of this reactive item changes.
     * @param {Object} [options] - Optional options.
     * @param {number} [options.delay] - The delay in milliseconds before the function is called.
     * @param {AbortSignal} [options.signal] - The signal to abort the subscription.
     */
    subscribe(fn, options) {
        return this.engine.subscribeController.subscribe(fn, options);
    }

    /**
     * Removes all "change" subscribers. Listeners for "#has-subscribers" and "#no-subscribers" are not removed.
     */
    clearSubscribers() {
        return this.engine.subscribeController.clearSubscribers();
    }

    /**
     * Removes all subscribers, including listeners for "#has-subscribers" and "#no-subscribers" events.
     */
    clearAllSubscribers() {
        return this.engine.subscribeController.clearAllSubscribers();
    }

    /**
     * Returns true if there are any subscribers, false otherwise.
     * @returns {boolean} Whether there are any subscribers.
     */
    hasSubscribers() {
        return this.engine.subscribeController.hasSubscribers();
    }

    /**
     * Retrieves the current value of the reactive item.
     * @param {Object} [options] - Optional options.
     * @param {boolean} [options.untracked=false] - If `true`, the value will not be added to the getValueTracker.
     * @returns {any} The current value of the reactive item.
     */
    getValue(options) {
        if (this.engine === undefined) {
            throw new Error("Not implemented");
        }

        if (this.engine.isDestroyed) {
            throw new Error("The reactive item has been destroyed");
        }

        let _options = Object.assign({ untracked: false }, options);

        if (_options.untracked == false) {
            getValueTracker.add(this);
        }
    }

    /**
     * Returns the last error that occurred while calculating the value of the reactive item,
     * or null if there is no error.
     * @returns {Error|null} The last error that occurred, or null if there is no error.
     */
    getLastError() {
        return this.engine.error;
    }

    /**
     * Returns true if there has been an error while calculating the value of the reactive item,
     * false otherwise. This method returns true if the reactive item has been destroyed, if the
     * reactive item has an error, or if the calculation of the value of the reactive item has
     * thrown an error.
     * @returns {boolean} Whether there has been an error while calculating the value of the
     * reactive item.
     */
    hasError() {
        try {
            this.getValue();
        } catch (error) {
            this.engine.error = error;
        }

        return this.engine.error != null;
    }

    /**
     * Subscribes a function to be called whenever a subscriber is added to the reactive item.
     * The function is called with no arguments.
     * @param {function():void} fn - The function to be called.
     * @returns {()=>void} A function that unsubscribes the given function.
     */
    onHasSubscribers(fn) {
        return this.engine.subscribeController.onHasSubscribers(fn);
    }

    /**
     * Subscribes a function to be called whenever there are no longer any subscribers.
     * The function is called with no arguments.
     * @param {function():void} fn - The function to be called.
     * @returns {()=>void} A function that unsubscribes the given function.
     */
    onNoSubscribers(fn) {
        return this.engine.subscribeController.onNoSubscribers(fn);
    }

    /**
     * Subscribes a function to be called when the reactive item is destroyed.
     * The function is called with no arguments.
     * @param {(reactiveItem:ReactivePrimitive)=>void} fn - The function to be called.
     * @returns {()=>void} A function that unsubscribes the given function.
     */
    onDestroy(fn) {
        let that = this;
        const callback = () => {
            fn(that);
        };

        let unsubscriber = this.engine.subscribeController.onDestroy(callback);
        return unsubscriber;
    }

    /**
     * Destroys the reactive item. This method is useful for cleaning up after a reactive item
     * that is no longer needed. It calls destroy on the engine of the reactive item, which
     * removes all dependencies, dependents and subscribers, and marks the engine as destroyed.
     */
    destroy() {
        this.engine.destroy();
    }

    /**
     * Checks if two values are equal. If the compareFn property is a function, it is used to compare the two values.
     * If the compareFn property is not a function, the values are compared using the === operator.
     * If the optional second argument is not provided, the value of the reactive item is used.
     * @param {any} a - The first value to compare.
     * @param {any} [b] - The second value to compare. If not provided, the value of the reactive item is used.
     * @returns {boolean} True if the two values are equal, false otherwise.
     */
    equals(a, b) {
        if (b === undefined) b = this.getValue();

        if (this.engine.compareFn) {
            return this.engine.compareFn(a, b);
        }

        return compareAny(a, b);
    }

    /**
     * @returns {boolean} True if the reactive item has been destroyed, false otherwise.
     */
    get isDestroyed() {
        return this.engine.isDestroyed;
    }
}

export { ReactivePrimitive };
