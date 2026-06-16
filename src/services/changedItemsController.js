// @ts-check

import { getError, sortReactiveItems } from '../helpers/tools.js';
import { modeController } from './modeController.js';

/**
 * Controller that manages changed reactive items and coordinates subscriber notifications.
 * Handles batching, dependency recalculation, and error aggregation.
 */
class ChangedItemsController {
    /** @type {Set<ReactiveItem>} */
    items = new Set();

    /**
     * Adds a reactive item to the set of changed items.
     * If not in batch mode, immediately runs subscribers and clears the set.
     * @param {ReactiveItem} item - The reactive item that changed.
     */
    addItem(item) {
        this.items.add(item);
        if (!modeController.batchMode) {
            this.runSubscribers();
            this.clear();
        }
    }

    /**
     * @param {ReactiveItem} item
     */
    removeItem(item) {
        this.items.delete(item);
    }

    /**
     * Removes all items from the changed items set.
     */
    clear() {
        this.items.clear();
    }

    /**
     * Runs all subscribers for the changed items.
     * Processes dependency trees, recalculates stale computed values,
     * and invokes subscriber callbacks with update records.
     * Handles errors and aggregates them if multiple occur.
     */
    runSubscribers() {
        /** @type {Set<ReactiveItem>} */
        const changedItemsWithUpdates = new Set();

        // get atoms whose value has changed. compare values
        this.items.forEach(item => {
            if (modeController.batchMode === true) {
                if (item.engine.checkChangesTemporary()) {
                    changedItemsWithUpdates.add(item);
                }
            } else {
                if (item.engine.hasUpdates()) {
                    changedItemsWithUpdates.add(item);
                }
            }
        });

        /** @type {Set<ReactiveItem>} */
        const itemsToRecalc = new Set();

        // get reactive items whose dependents have subscribers
        changedItemsWithUpdates.forEach(item => {
            item.engine.getDeepDependents().forEach(dep => {
                if (dep.hasSubscribers()) {
                    itemsToRecalc.add(dep);
                }
            });
        });

        // changed items will be recalculated and added to this.items
        Array.from(itemsToRecalc)
            .sort(sortReactiveItems)
            .forEach(item => {
                item.getValue();
            });

        itemsToRecalc.clear();
        changedItemsWithUpdates.clear();

        if (modeController.batchMode === true) {
            this.items.forEach(item => {
                if (item.engine.checkChangesTemporary()) {
                    changedItemsWithUpdates.add(item);
                }
            });
        } else {
            this.items.forEach(item => {
                if (item.engine.hasUpdates()) {
                    changedItemsWithUpdates.add(item);
                }
            });
        }

        // create an array of reactive elements, sorted by ID (order of creation)
        const changedItemsWithUpdatesSorted = Array.from(changedItemsWithUpdates)
            .filter(item => item.hasSubscribers())
            .sort(sortReactiveItems);

        modeController.startSubscribersMode();

        const usedSubscribers = new Set();
        const errors = [];

        for (let i = 0; i < changedItemsWithUpdatesSorted.length; i++) {
            const item = changedItemsWithUpdatesSorted[i];

            const itemSubscribers = item.engine.subscribeController.getSubscribers();

            for (const subscriber of itemSubscribers) {
                if (usedSubscribers.has(subscriber)) {
                    continue;
                }

                usedSubscribers.add(subscriber);
                try {
                    subscriber(item.engine.updates);
                } catch (e) {
                    const err = getError(e);
                    const error = new Error(`Error in ${item.name}: ${err.message}`, { cause: item });
                    error.stack = err.stack;
                    errors.push(error);
                }
            }

            item.engine.clearUpdates();
        }

        this.items.forEach(item => {
            item.engine.clearUpdates();
        });

        usedSubscribers.clear();
        this.items.clear();

        modeController.endSubscribersMode();

        if (modeController.throwErrorInSubscribers) {
            for (let i = 0; i < errors.length; i++) {
                const error = errors[i];
                throw error;
            }
        }
    }
}

// Hook into batch mode lifecycle
modeController.on('beforeBatchModeEnd', () => {
    changedItemsController.runSubscribers();
    changedItemsController.clear();
});

const changedItemsController = new ChangedItemsController();
export { changedItemsController };
