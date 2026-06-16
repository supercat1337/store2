// @ts-check

import { EventEmitterExt } from '@supercat1337/event-emitter-ext';

class ModeControllerService {
    isComputing = false;
    untrackMode = false;
    throwErrorInSubscribers = true;

    #batchDepth = 0;
    #subscribersMode = false;

    /** @type {EventEmitterExt<"batchModeStart"|"batchModeEnd"|"beforeBatchModeEnd">} */
    batchModeEvents;

    /** @type {EventEmitterExt<"subscribersModeEnd">} */
    subscribersModeEvents;

    constructor() {
        this.batchModeEvents = new EventEmitterExt();
        this.batchModeEvents.registerEvents('batchModeStart', 'beforeBatchModeEnd', 'batchModeEnd');
        this.batchModeEvents.setListenerRunnerStrategy(1);

        this.subscribersModeEvents = new EventEmitterExt();
        this.subscribersModeEvents.noLimitsToEmit = true;
        this.subscribersModeEvents.registerEvents('subscribersModeEnd');
    }

    /**
     * Subscribes a function to be called whenever the given event is triggered.
     * @param {"batchModeStart"|"batchModeEnd"|"beforeBatchModeEnd"} event - The event to subscribe to.
     * @param {function():void} callback - The function to be called.
     * @returns {()=>void} A function that unsubscribes the given function.
     */
    on(event, callback) {
        return this.batchModeEvents.on(event, callback);
    }

    /**
     * Returns true if currently inside a batch (batch depth > 0).
     * @returns {boolean}
     */
    get batchMode() {
        return this.#batchDepth > 0;
    }

    /**
     * Enters a batch mode. Increments the batch depth.
     * Emits "batchModeStart" when entering the first batch.
     */
    enterBatch() {
        const wasInBatch = this.batchMode;
        this.#batchDepth++;
        if (!wasInBatch) {
            this.batchModeEvents.emit('batchModeStart');
        }
    }

    /**
     * Exits a batch mode. Decrements the batch depth.
     * If exiting the last batch, emits "beforeBatchModeEnd" and then "batchModeEnd".
     */
    exitBatch() {
        if (this.#batchDepth === 0) {return;}
        const isLast = this.#batchDepth === 1;
        if (isLast) {
            this.batchModeEvents.emit('beforeBatchModeEnd');
        }
        this.#batchDepth--;
        if (isLast) {
            this.batchModeEvents.emit('batchModeEnd');
        }
    }

    /**
     * Retrieves whether any subscribers are currently running.
     * @returns {boolean}
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
        if (!this.#subscribersMode) {return;}
        this.#subscribersMode = false;
        this.subscribersModeEvents.emit('subscribersModeEnd');
    }

    /**
     * Subscribes a function to be called once after all subscribers have finished running.
     * @param {Function} callback
     */
    runAfterSubscribers(callback) {
        this.subscribersModeEvents.once('subscribersModeEnd', callback);
    }
}

const modeController = new ModeControllerService();
export { modeController };
