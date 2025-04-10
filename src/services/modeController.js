// @ts-check

import { EventEmitterExt } from "@supercat1337/event-emitter-ext";

class ModeControllerService {
    computedMode = false;

    untrackMode = false;

    throwErrorInSubscribers = true;

    #batchMode = false;
    #subscribersMode = false;
    /** @type {EventEmitterExt<"batchModeStart"|"batchModeEnd"|"beforeBatchModeEnd">} */
    batchModeEvents;

    /** @type {EventEmitterExt<"subscribersModeEnd">} */
    subscribersModeEvents;

    constructor() {
        this.batchModeEvents = new EventEmitterExt();
        this.batchModeEvents.registerEvents(
            "batchModeStart",
            "beforeBatchModeEnd",
            "batchModeEnd"
        );
        this.batchModeEvents.setListenerRunnerStrategy(1);

        this.subscribersModeEvents = new EventEmitterExt();
        this.subscribersModeEvents.noLimitsToEmit = true;
        this.subscribersModeEvents.registerEvents("subscribersModeEnd");
    }

    /**
     * Subscribes a function to be called whenever the given event is triggered.
     * @param {"batchModeStart"|"batchModeEnd"|"beforeBatchModeEnd"} event - The event to subscribe to. Currently, only "batchModeStart" and "batchModeEnd" are supported.
     * @param {function():void} callback - The function to be called.
     * @returns {()=>void} A function that unsubscribes the given function.
     */
    on(event, callback) {
        return this.batchModeEvents.on(event, callback);
    }

    /**
     * Enables or disables batch mode. When batch mode is enabled, all changes to reactive items are batched together and notifications are only sent when batch mode is disabled.
     * @type {boolean}
     */
    set batchMode(value) {
        if (this.#batchMode === value) return;

        if (value === false) this.batchModeEvents.emit("beforeBatchModeEnd");
        this.#batchMode = value;
        this.batchModeEvents.emit(value ? "batchModeStart" : "batchModeEnd");
    }

    /**
     * Retrieves the current state of batch mode.
     * @returns {boolean} The current state of batch mode, where true indicates that batch mode is enabled and false indicates that it is disabled.
     */
    get batchMode() {
        return this.#batchMode;
    }

    /**
     * Retrieves whether any subscribers are currently running.
     * @returns {boolean} True if any subscribers are currently running, false otherwise.
     */
    get subscribersMode() {
        return this.#subscribersMode;
    }

    /**
     * Sets the state to indicate that subscribers are currently running.
     */
    startSubscribersMode() {
        this.#subscribersMode = true;
    }

    /**
     * Sets the state to indicate that no subscribers are currently running.
     */
    endSubscribersMode() {
        if (!this.#subscribersMode) return;
        this.#subscribersMode = false;
        this.subscribersModeEvents.emit("subscribersModeEnd");
    }

    /**
     * Subscribes a function to be called once after all subscribers have finished running.
     * The callback function is triggered when the "subscribersModeEnd" event is emitted.
     * @param {Function} callback - The function to be called after subscribers have completed.
     */
    runAfterSubscribers(callback) {
        this.subscribersModeEvents.once("subscribersModeEnd", callback);
    }
}

const modeController = new ModeControllerService();
export { modeController };
