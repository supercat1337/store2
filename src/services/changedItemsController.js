// @ts-check

import { getError } from '../helpers/tools.js';
import { modeController } from './modeController.js';

/**
 * Sorts reactive items by their numeric engine id.
 * @param {import('../reactives/ReactiveItem.js').ReactiveItem} a
 * @param {import('../reactives/ReactiveItem.js').ReactiveItem} b
 * @returns {number}
 */
function sortById(a, b) {
    const idA = a.engine.id;
    const idB = b.engine.id;
    return idA < idB ? -1 : idA > idB ? 1 : 0;
}

/**
 * Coordinates notification of changed reactive items: collects them,
 * recalculates stale computed values in a deterministic order, and invokes
 * subscribers.
 *
 * One instance per `Store2Context`. The class receives the owning
 * `ModeControllerService` in its constructor so that batching and subscriber
 * modes can be controlled independently for each context.
 */
class ChangedItemsController {
    /** @type {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} */
    items = new Set();

    /** @type {import('../services/modeController.js').ModeControllerService} */
    #modeController;

    /**
     * @param {import('../services/modeController.js').ModeControllerService} modeController
     */
    constructor(modeController) {
        this.#modeController = modeController;
    }

    /**
     * Marks an item as changed. Outside a batch, immediately runs subscribers
     * and clears the pending set.
     * @param {import('../reactives/ReactiveItem.js').ReactiveItem} item
     */
    addItem(item) {
        this.items.add(item);
        if (!this.#modeController.batchMode) {
            this.runSubscribers();
            this.clear();
        }
    }

    /**
     * Removes an item from the pending set.
     * @param {import('../reactives/ReactiveItem.js').ReactiveItem} item
     */
    removeItem(item) {
        this.items.delete(item);
    }

    /**
     * Clears the pending set.
     */
    clear() {
        this.items.clear();
    }

    /**
     * Runs all pending subscribers.
     *
     * The outer loop re-checks `this.items` after each notification round so
     * that updates added during subscriber execution (e.g. via `runInAction`)
     * are processed in the same call.
     *
     * Iterations that produce no subscribers to run are short-circuited:
     * they still clean up update records, but do not enter subscribers-mode
     * and therefore do not emit `subscribersModeEnd`. This keeps the
     * subscribers-mode lifecycle aligned with actual subscriber execution —
     * a single mutation emits exactly one `subscribersModeEnd`.
     */
    runSubscribers() {
        /** @type {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} */
        const changedItemsWithUpdates = new Set();

        while (this.items.size > 0) {
            const itemsToProcess = new Set(this.items);
            this.items.clear();

            itemsToProcess.forEach(item => {
                if (this.#modeController.batchMode) {
                    if (item.engine.checkChangesTemporary()) {
                        changedItemsWithUpdates.add(item);
                    }
                } else if (item.engine.hasUpdates()) {
                    changedItemsWithUpdates.add(item);
                }
            });

            /** @type {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} */
            const itemsToRecalc = new Set();
            changedItemsWithUpdates.forEach(item => {
                /**
                 * @param {import('../reactives/ReactiveItem.js').ReactiveItem} dep
                 */
                const visitDependent = dep => {
                    if (dep.hasSubscribers() && !dep.engine.hasUpdates()) {
                        itemsToRecalc.add(dep);
                    }
                };
                item.engine.getDeepDependents().forEach(visitDependent);
            });

            Array.from(itemsToRecalc)
                .sort(sortById)
                .forEach(item => {
                    item.getValue();
                });

            itemsToRecalc.clear();
            changedItemsWithUpdates.clear();

            if (this.#modeController.batchMode) {
                itemsToProcess.forEach(item => {
                    if (item.engine.checkChangesTemporary()) {
                        changedItemsWithUpdates.add(item);
                    }
                });
            } else {
                itemsToProcess.forEach(item => {
                    if (item.engine.hasUpdates()) {
                        changedItemsWithUpdates.add(item);
                    }
                });
            }

            const sorted = Array.from(changedItemsWithUpdates)
                .filter(item => item.hasSubscribers())
                .sort(sortById);

            if (sorted.length === 0) {
                // No subscribers to notify. Clear update records of the
                // processed items so the next round starts clean, and skip
                // the subscribers-mode lifecycle entirely.
                itemsToProcess.forEach(item => {
                    item.engine.clearUpdates();
                });
                continue;
            }

            this.#modeController.startSubscribersMode();

            /** @type {Set<Function>} */
            const usedSubscribers = new Set();

            /** @type {Array<Error>} */
            const errors = [];

            for (const item of sorted) {
                const itemSubscribers = item.engine.subscribeController.getSubscribers();
                for (const subscriber of itemSubscribers) {
                    if (usedSubscribers.has(subscriber)) {
                        continue;
                    }
                    usedSubscribers.add(subscriber);
                    try {
                        item.engine.context.emitPlugin(
                            'onSubscriberRun',
                            item,
                            item.engine.updates
                        );
                        subscriber(item.engine.updates);
                    } catch (e) {
                        const err = getError(e);
                        const error = new Error(`Error in ${item.name}: ${err.message}`, {
                            cause: item,
                        });
                        error.stack = err.stack;
                        errors.push(error);
                    }
                }
                item.engine.clearUpdates();
            }

            itemsToProcess.forEach(item => {
                item.engine.clearUpdates();
            });

            usedSubscribers.clear();

            this.#modeController.endSubscribersMode();

            if (this.#modeController.throwErrorInSubscribers) {
                for (const error of errors) {
                    throw error;
                }
            }
        }
    }
}

/**
 * Process-wide singleton, wired to the default mode controller.
 * The default `Store2Context` adopts this instance so that direct imports
 * continue to share state with the context-aware engine.
 */
const changedItemsController = new ChangedItemsController(modeController);
modeController.on('beforeBatchModeEnd', () => {
    changedItemsController.runSubscribers();
    changedItemsController.clear();
});

export { ChangedItemsController, changedItemsController };
