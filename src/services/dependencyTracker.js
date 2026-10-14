// @ts-check

import { EventEmitterLite } from '@supercat1337/event-emitter';
import { modeController } from './modeController.js';

/**
 * Records reactive items read during a tracked execution (inside `Computed`,
 * `autorun`, or `reaction`).
 *
 * Scopes are nested: each `enable()` pushes a fresh store and each
 * `disable()` restores the previous one. This makes nested computed
 * construction and re-entrant tracking safe.
 */
class Tracker {
    /** @type {boolean} */
    #isActive = false;

    /** @type {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} */
    #store = new Set();

    /** @type {Array<{ store: Set<import('../reactives/ReactiveItem.js').ReactiveItem>, ctx: object, isActive: boolean }>} */
    #stack = [];

    /** @type {EventEmitterLite<"add">} */
    #eventEmitter = new EventEmitterLite();

    /** @type {import('../services/modeController.js').ModeControllerService | null} */
    #modeController;

    /** @type {object} */
    ctx = {};

    /**
     * @param {import('../services/modeController.js').ModeControllerService} [modeController]
     *        Used to honour `untrackMode`. Optional so that the tracker can be
     *        constructed in isolation for tests.
     */
    constructor(modeController) {
        this.#modeController = modeController ?? null;
    }

    /**
     * Returns a copy of the currently tracked items.
     * @returns {Set<import('../reactives/ReactiveItem.js').ReactiveItem>}
     */
    get data() {
        return new Set(this.#store);
    }

    /**
     * Returns the currently tracked items sorted by engine id.
     * @returns {Array<import('../reactives/ReactiveItem.js').ReactiveItem>}
     */
    getAsSortedArray() {
        return Array.from(this.#store).sort((a, b) => {
            const idA = a.engine.id;
            const idB = b.engine.id;
            return idA < idB ? -1 : idA > idB ? 1 : 0;
        });
    }

    /**
     * Records a reactive item if tracking is active and untracked reads are
     * not currently suppressed.
     * @param {import('../reactives/ReactiveItem.js').ReactiveItem} item
     * @param {string} [_key]
     */
    add(item, _key = '') {
        if (this.#modeController?.untrackMode) {
            return;
        }
        if (this.#isActive) {
            this.#store.add(item);
            this.#eventEmitter.emit('add', item);
        }
    }

    /**
     * Registers a listener called for every tracked item.
     * @param {(item: import('../reactives/ReactiveItem.js').ReactiveItem) => void} callback
     * @returns {() => void}
     */
    onAdd(callback) {
        return this.#eventEmitter.on('add', callback);
    }

    /**
     * Returns true while tracking is active.
     * @returns {boolean}
     */
    isActive() {
        return this.#isActive;
    }

    /**
     * Pushes a new tracking scope.
     * @param {object} [ctx]
     */
    enable(ctx = {}) {
        this.#stack.push({
            store: this.#store,
            ctx: this.ctx,
            isActive: this.#isActive,
        });
        this.#store = new Set();
        this.ctx = ctx;
        this.#isActive = true;
    }

    /**
     * Pops the current tracking scope and restores the previous one.
     */
    disable() {
        const previous = this.#stack.pop();
        if (previous) {
            this.#store = previous.store;
            this.ctx = previous.ctx;
            this.#isActive = previous.isActive;
        } else {
            this.#store = new Set();
            this.ctx = {};
            this.#isActive = false;
        }
    }
}

/**
 * Process-wide singleton, bound to the default mode controller so that
 * `untrack()` behaves identically for direct imports and the default context.
 */
const dependencyTracker = new Tracker(modeController);

/**
 * Runs `fn` with tracking enabled and returns the tracked items as a set.
 * @param {Function} fn
 * @param {...any} args
 * @returns {Set<import('../reactives/ReactiveItem.js').ReactiveItem>}
 */
function getSetOfUsedReactiveItems(fn, ...args) {
    dependencyTracker.enable();
    /** @type {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} */
    let result;
    try {
        fn(...args);
        result = dependencyTracker.data;
    } finally {
        dependencyTracker.disable();
    }
    return result;
}

/**
 * Runs `fn` with tracking enabled and returns the tracked items as a sorted array.
 * @param {Function} fn
 * @param {...any} args
 * @returns {Array<import('../reactives/ReactiveItem.js').ReactiveItem>}
 */
function getArrayOfUsedReactiveItems(fn, ...args) {
    dependencyTracker.enable();
    /** @type {Array<import('../reactives/ReactiveItem.js').ReactiveItem>} */
    let result;
    try {
        fn(...args);
        result = dependencyTracker.getAsSortedArray();
    } finally {
        dependencyTracker.disable();
    }
    return result;
}

export { Tracker, dependencyTracker, getSetOfUsedReactiveItems, getArrayOfUsedReactiveItems };
