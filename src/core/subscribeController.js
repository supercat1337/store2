// @ts-check

import { EventEmitterExt } from "@supercat1337/event-emitter-ext";
import { debounce } from "../helpers/tools.js";
import { UpdateDataRecord } from "./UpdateDataRecord.js";

/**
 * @typedef {()=>void} Unsubscriber
 */

class SubscribeController {
    /** @type {EventEmitterExt<"change">} */
    #eventEmitter;

    /** @type {EventEmitterExt<"#has-listeners"|"#no-listeners"|"destroy">} */
    #additionalEvents;
    constructor() {
        this.#eventEmitter = new EventEmitterExt();
        this.#eventEmitter.registerEvents("change");

        this.#additionalEvents = new EventEmitterExt();
        this.#additionalEvents.registerEvents(
            "destroy",
            "#has-listeners",
            "#no-listeners"
        );
        // @ts-ignore
        this.#additionalEvents.noLimitsToEmit = true;
    }

    /**
     * Returns an array of functions that have been subscribed to the subscribeController.
     * @returns {Function[]} The functions that have been subscribed.
     */
    getSubscribers() {
        return this.#eventEmitter.getListeners("change");
    }

    /**
     * Subscribes a function to be called whenever the subscribeController schedules a task.
     * The function is called with no arguments.
     * @param {(updates: Map<string, UpdateDataRecord>)=>void} fn - The function to be called.
     * @param {{delay?:number, signal?:AbortSignal}} [options]
     * @returns {Unsubscriber} A function that unsubscribes the given function.
     */
    subscribe(fn, options) {
        /** @type {{delay?:number, signal?:AbortSignal}} */
        let _options = Object.assign({ delay: 0, signal: undefined }, options);

        /** @type {Function} */
        let _fn;

        let delay = _options.delay || 0;

        _fn = delay > 0 ? debounce(fn, delay) : fn;

        let hasListeners = this.#eventEmitter.hasListeners("change");

        let unsubscriberInner = this.#eventEmitter.on("change", _fn);

        let unsubscriber = () => {
            let hasListeners = this.#eventEmitter.hasListeners("change");
            if (!hasListeners) {
                return;
            }

            if (_options.signal instanceof AbortSignal) {
                _options.signal.removeEventListener("abort", unsubscriber);
            }

            unsubscriberInner();

            let hasListeners_2 = this.#eventEmitter.hasListeners("change");
            if (!hasListeners_2) {
                /*
                runInAction(() => {
                    this.#additionalEvents.emit("#no-listeners");
                });
                //*/
                this.#additionalEvents.emit("#no-listeners");
            }
        };

        if (_options.signal instanceof AbortSignal) {
            _options.signal.addEventListener("abort", unsubscriber);
        }

        // If there are no listeners, emit the #has-listeners event.
        if (!hasListeners) {
            /*
            runInAction(() => {
                this.#additionalEvents.emit("#has-listeners");
            });
            //*/

            this.#additionalEvents.emit("#has-listeners");
        }

        return unsubscriber;
    }

    /**
     * Removes all event listeners from the event emitter. This method is useful for
     * cleaning up all subscribers that are no longer needed.
     */
    clearAllSubscribers() {
        this.#eventEmitter.removeAllListeners("change");

        this.#additionalEvents.removeAllListeners("destroy");
        this.#additionalEvents.removeAllListeners("#has-listeners");
        this.#additionalEvents.removeAllListeners("#no-listeners");
    }

    /**
     * Removes all "change" event listeners from the event emitter. This method is useful for cleaning up
     * "change" subscribers that are no longer needed.
     */
    clearSubscribers() {
        this.#eventEmitter.removeAllListeners("change");
    }

    /**
     * Returns true if there are any subscribers, false otherwise.
     * @returns {boolean} Whether there are any subscribers.
     */
    hasSubscribers() {
        return this.#eventEmitter.hasListeners("change");
    }

    /**
     * Destroys the SubscribeController. This method is useful for cleaning up after a SubscribeController
     * that is no longer needed. It calls clearSubscribers, which removes all subscribers.
     */
    destroy() {
        this.#additionalEvents.emit("destroy");
        this.#eventEmitter.unregisterAllEvents();
        this.#additionalEvents.unregisterAllEvents();
    }

    /**
     * Subscribes a function to be called whenever a subscriber is added to the subscribeController.
     * The function is called with no arguments.
     * @param {function():void} callback - The function to be called.
     * @returns {Unsubscriber} A function that unsubscribes the given function.
     */
    onHasSubscribers(callback) {
        return this.#additionalEvents.on("#has-listeners", callback);
    }

    /**
     * Subscribes a function to be called whenever there are no longer any subscribers.
     * The function is called with no arguments.
     * @param {function():void} callback - The function to be called.
     * @returns {Unsubscriber} A function that unsubscribes the given function.
     */
    onNoSubscribers(callback) {
        return this.#additionalEvents.on("#no-listeners", callback);
    }

    /**
     * Subscribes a function to be called when the SubscribeController is destroyed.
     * The function is called with no arguments.
     * @param {Function} callback - The function to be called.
     * @returns {Unsubscriber} A function that unsubscribes the given function.
     */
    onDestroy(callback) {
        return this.#additionalEvents.on("destroy", callback);
    }
}

export { SubscribeController };
