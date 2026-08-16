// @ts-check

import { getError, sortReactiveItems } from '../helpers/tools.js';
import { modeController } from './modeController.js';

/**
 * Controller that manages changed reactive items and coordinates subscriber notifications.
 * Handles batching, dependency recalculation, and error aggregation.
 */
class ChangedItemsController {
    /** @type {Set<import('../types.d.ts').ReactiveItem>} */
    items = new Set();

    /**
     * Adds a reactive item to the set of changed items.
     * If not in batch mode, immediately runs subscribers and clears the set.
     * @param {import('../types.d.ts').ReactiveItem} item - The reactive item that changed.
     */
    addItem(item) {
        //console.log('[addItem]addItem:', item.name);
        //console.log('[addItem]modeController.batchMode', modeController.batchMode);

        this.items.add(item);
        if (!modeController.batchMode) {
            this.runSubscribers();
            this.clear();
        }
    }

    /**
     * @param {import('../types.d.ts').ReactiveItem} item
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
     *
     * The while-loop ensures that any new changes that are added
     * (via changedItemsController.addItem) during subscriber execution
     * are processed in the next iteration, preventing lost updates.
     */
    runSubscribers() {
        /*
        console.log(
            '[runSubscribers] itemsToProcess:',
            Array.from(this.items).map(i => i.name)
        );
        */

        /** @type {Set<import('../types.d.ts').ReactiveItem>} */
        const changedItemsWithUpdates = new Set();

        // Continue processing as long as there are items pending
        while (this.items.size > 0) {
            // 1. Take a snapshot of the current pending items and clear the queue
            const itemsToProcess = new Set(this.items);
            /*
            console.log(
                '[runSubscribers] itemsToProcess:',
                Array.from(this.items).map(i => i.name)
            );
            */
            this.items.clear();

            // 2. Determine which items actually have effective updates
            itemsToProcess.forEach(item => {
                if (modeController.batchMode === true) {
                    // In batch mode, check if the item still has changes after possible reverts
                    if (item.engine.checkChangesTemporary()) {
                        changedItemsWithUpdates.add(item);
                    }
                } else {
                    // Outside batch, simply check for pending updates
                    if (item.engine.hasUpdates()) {
                        changedItemsWithUpdates.add(item);
                    }
                }
            });

            /*
            console.log(
                '[runSubscribers] changedItemsWithUpdates:',
                Array.from(changedItemsWithUpdates).map(i => i.name)
            );
            */

            // 3. Collect all deep dependents that have subscribers and need recalculation
            /** @type {Set<import('../types.d.ts').ReactiveItem>} */
            const itemsToRecalc = new Set();
            changedItemsWithUpdates.forEach(item => {
                item.engine.getDeepDependents().forEach(dep => {
                    if (dep.hasSubscribers()) {
                        // Если у dep уже есть updates, не пересчитываем его повторно
                        if (!dep.engine.hasUpdates()) {
                            itemsToRecalc.add(dep);
                        }
                    }
                });
            });

            /*
            console.log(
                '[runSubscribers] itemsToRecalc:',
                Array.from(itemsToRecalc).map(i => i.name)
            );
            */

            // 4. Recalculate the stale computed values in a deterministic order
            Array.from(itemsToRecalc)
                .sort(sortReactiveItems)
                .forEach(item => {
                    item.getValue();
                });

            // Clear temporary sets to prepare for the next iteration
            itemsToRecalc.clear();
            changedItemsWithUpdates.clear();

            // 5. Re-evaluate updates after potential recalculation (some updates may have been cleared)
            if (modeController.batchMode === true) {
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

            /*
            console.log(
                '[runSubscribers] after step 5, changedItemsWithUpdates:',
                Array.from(changedItemsWithUpdates).map(i => i.name)
            );
            */

            // 6. Sort the items by creation order and filter those with active subscribers
            /*
            console.log(
                '[runSubscribers] hasSubscribers before filter:',
                Array.from(changedItemsWithUpdates).map(i => ({
                    name: i.name,
                    has: i.hasSubscribers(),
                }))
            );
            */
            const changedItemsWithUpdatesSorted = Array.from(changedItemsWithUpdates)
                .filter(item => item.hasSubscribers())
                .sort(sortReactiveItems);

            /*
            console.log(
                '[runSubscribers] changedItemsWithUpdatesSorted:',
                changedItemsWithUpdatesSorted.map(i => i.name)
            );
            */

            // 7. Notify all subscribers while preventing nested mutations
            modeController.startSubscribersMode();

            const usedSubscribers = new Set();
            const errors = [];

            for (let i = 0; i < changedItemsWithUpdatesSorted.length; i++) {
                const item = changedItemsWithUpdatesSorted[i];
                const itemSubscribers = item.engine.subscribeController.getSubscribers();

                /*
                console.log(
                    `[runSubscribers] Calling subscribers for ${item.name}, updates:`,
                    Array.from(item.engine.updates.entries())
                );
                */
                for (const subscriber of itemSubscribers) {
                    // Avoid calling the same subscriber function multiple times
                    if (usedSubscribers.has(subscriber)) {
                        continue;
                    }
                    usedSubscribers.add(subscriber);
                    try {
                        //console.log(`[runSubscribers] Subscriber called for ${item.name}`);
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
                // Clear updates for this item after notifying its subscribers
                item.engine.clearUpdates();
            }

            // 8. Clear any remaining updates from all processed items
            itemsToProcess.forEach(item => {
                item.engine.clearUpdates();
            });

            usedSubscribers.clear();
            // itemsToProcess is cleared automatically, but we also clear the main set if anything was added during processing
            // Note: this.items was already cleared at the beginning, and any new items added during subscriber execution
            // will be processed in the next while iteration.

            modeController.endSubscribersMode();

            // 9. Throw collected errors if configured to do so
            if (modeController.throwErrorInSubscribers) {
                for (let i = 0; i < errors.length; i++) {
                    const error = errors[i];
                    throw error;
                }
            }

            // The while-loop continues if any new items were added to this.items
            // during the subscriber notifications (e.g., via runInAction or batch).
            // This ensures that no updates are lost.
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
