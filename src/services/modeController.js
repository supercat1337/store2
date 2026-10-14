// @ts-check

import { EventEmitterLite } from '@supercat1337/event-emitter';

/**
 * Coordinates global reactivity modes: batching, subscriber notification,
 * untracked reads, and named actions.
 *
 * Each `Store2Context` owns its own instance so that multiple root stores
 * can coexist (SSR requests, parallel tests, embedded widgets).
 */
class ModeControllerService {
    /** @type {boolean} */
    isComputing = false;

    /** @type {boolean} */
    throwErrorInSubscribers = true;

    /**
     * When `true`, tracked reads are suppressed. `untrack()` saves and
     * restores this value, so nesting is safe.
     * @type {boolean}
     */
    untrackMode = false;

    /** @type {number} */
    #batchDepth = 0;

    /** @type {string} */
    #currentBatchName = '';

    /** @type {boolean} */
    #subscribersMode = false;

    /** @type {Array<import('../types.js').ActionInfo>} */
    #actionStack = [];

    /** @type {number} */
    #actionCounter = 0;

    /** @type {EventEmitterLite<"batchModeStart"|"batchModeEnd"|"beforeBatchModeEnd">} @internal */
    batchModeEvents;

    /** @type {EventEmitterLite<"subscribersModeEnd">} @internal */
    subscribersModeEvents;

    /** @type {EventEmitterLite<"actionStart"|"actionEnd">} @internal */
    actionEvents;

    constructor() {
        this.batchModeEvents = new EventEmitterLite();
        this.subscribersModeEvents = new EventEmitterLite();
        this.actionEvents = new EventEmitterLite();
    }

    /**
     * Subscribes to a lifecycle event.
     *
     * Batch events (`batchModeStart`, `batchModeEnd`, `beforeBatchModeEnd`)
     * and the subscribers-mode-end event (`subscribersModeEnd`) are
     * dispatched through this single public entry point. Internally they
     * use two different emitters, but callers should not care.
     *
     * @param {"batchModeStart"|"batchModeEnd"|"beforeBatchModeEnd"|"subscribersModeEnd"} event
     * @param {() => void} callback
     * @returns {() => void}
     */
    on(event, callback) {
        if (event === 'subscribersModeEnd') {
            return this.subscribersModeEvents.on(event, callback);
        }
        return this.batchModeEvents.on(event, callback);
    }

    /**
     * Subscribes to an action lifecycle event.
     * @param {"actionStart"|"actionEnd"} event
     * @param {(action: import('../types.js').ActionInfo) => void} callback
     * @returns {() => void}
     */
    onAction(event, callback) {
        return this.actionEvents.on(event, callback);
    }

    /**
     * Returns true while the controller is inside a batch.
     * @returns {boolean}
     */
    get batchMode() {
        return this.#batchDepth > 0;
    }

    /**
     * Returns the current batch depth.
     * @returns {number}
     */
    get batchDepth() {
        return this.#batchDepth;
    }

    /**
     * Returns the name of the currently running outermost batch, or ''.
     * @returns {string}
     */
    get currentBatchName() {
        return this.#currentBatchName;
    }

    /**
     * Increments the batch depth. Emits `batchModeStart` on the first entry.
     * @param {string} [name] - Optional human-readable name for the batch.
     */
    enterBatch(name = '') {
        const wasInBatch = this.batchMode;
        this.#batchDepth++;
        if (name || !this.#currentBatchName) {
            this.#currentBatchName = name || this.#currentBatchName;
        }
        if (!wasInBatch) {
            this.batchModeEvents.emit('batchModeStart');
        }
    }

    /**
     * Decrements the batch depth. Emits `beforeBatchModeEnd`, then
     * `batchModeEnd` when leaving the outermost batch.
     */
    exitBatch() {
        if (this.#batchDepth === 0) {
            return;
        }
        const isLast = this.#batchDepth === 1;
        if (isLast) {
            this.batchModeEvents.emit('beforeBatchModeEnd');
        }
        this.#batchDepth--;
        if (isLast) {
            this.batchModeEvents.emit('batchModeEnd');
            // Clear the batch name only after listeners have observed it.
            this.#currentBatchName = '';
        }
    }

    /**
     * Returns true while subscribers are running.
     * @returns {boolean}
     */
    get subscribersMode() {
        return this.#subscribersMode;
    }

    /**
     * Marks the start of subscriber notification.
     */
    startSubscribersMode() {
        this.#subscribersMode = true;
    }

    /**
     * Marks the end of subscriber notification and flushes deferred callbacks.
     */
    endSubscribersMode() {
        if (!this.#subscribersMode) {
            return;
        }
        this.#subscribersMode = false;
        this.subscribersModeEvents.emit('subscribersModeEnd');
    }

    /**
     * Registers a callback to run once after subscribers finish.
     * @param {() => void} callback
     */
    runAfterSubscribers(callback) {
        this.subscribersModeEvents.once('subscribersModeEnd', callback);
    }

    /**
     * Returns the currently running action, or `null` if no action is in
     * flight.
     *
     * @type {import('../types.js').ActionInfo | null}
     */
    get currentAction() {
        if (this.#actionStack.length === 0) {
            return null;
        }
        const last = this.#actionStack[this.#actionStack.length - 1];
        return /** @type {import('../types.js').ActionInfo} */ (last);
    }

    /**
     * Starts a new named action.
     * @param {string} name
     * @param {any} [payload]
     * @returns {import('../types.js').ActionInfo}
     */
    beginAction(name, payload = undefined) {
        const parent = this.currentAction;
        /** @type {import('../types.js').ActionInfo} */
        const action = {
            id: String(++this.#actionCounter),
            name,
            payload,
            parentId: parent ? parent.id : null,
            startTime: Date.now(),
            endTime: null,
            error: null,
        };
        this.#actionStack.push(action);
        this.actionEvents.emit('actionStart', action);
        return action;
    }

    /**
     * Ends an action previously started with `beginAction`.
     * @param {import('../types.js').ActionInfo} action
     * @param {Error | null} [error]
     */
    endAction(action, error = null) {
        action.endTime = Date.now();
        action.error = error;
        const index = this.#actionStack.indexOf(action);
        if (index !== -1) {
            this.#actionStack.splice(index, 1);
        }
        this.actionEvents.emit('actionEnd', action);
    }
}

/**
 * Default process-wide instance. Kept for backward compatibility.
 */
const modeController = new ModeControllerService();

export { ModeControllerService, modeController };
