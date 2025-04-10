// @ts-check

import { ReactivePrimitive } from "../reactives/reactivePrimitive.js";
import { sortReactiveItems } from "../helpers/tools.js";
import { modeController } from "./modeController.js";

class ChangedItemsController {
    /** @type {Set<ReactivePrimitive>} */
    items = new Set();

    /**
     * Adds an item to the set of changed items. If not in batch mode, it updates
     * the old values of the items and clears the set.
     *
     * @param {ReactivePrimitive} item - The reactive item to add.
     */
    addItem(item) {
        this.items.add(item);

        if (!modeController.batchMode) {
            this.runSubscribers();
            this.clear();
        }
    }

    /**
     * Removes all items from the set of changed items.
     */
    clear() {
        this.items.clear();
    }

    /**
     * Runs all subscribers of the items in the set of changed items. If not in batch mode, it clears the set of changed items after running the subscribers.
     * If in batch mode, it also runs the subscribers of the items that have changed since the last time this method was called.
     * All subscribers are run in the order of the items' creation IDs. If an error occurs in a subscriber, it is thrown after all subscribers have been run.
     */
    runSubscribers() {
        /** @type {Set<ReactivePrimitive>} */
        let effectedItems = new Set();

        // get atoms whose value has changed. compare values
        this.items.forEach((item) => {
            if (modeController.batchMode == true) {
                if (item.engine.checkChangesTemporary()) {
                    effectedItems.add(item);
                }
            } else {
                if (item.engine.checkChangesOldValues()) {
                    effectedItems.add(item);
                }
            }
        });

        /** @type {Set<ReactivePrimitive>} */
        let itemsToRecalc = new Set();

        // get reactive items whose dependents have subscribers
        effectedItems.forEach((item) => {
            item.engine.getDeepDependents().forEach((dep) => {
                if (dep.hasSubscribers()) {
                    itemsToRecalc.add(dep);
                }
            });
        });

        // changed items will be recalculated and added to this.items
        Array.from(itemsToRecalc)
            .sort(sortReactiveItems)
            .forEach((item) => {
                item.getValue();
            });

        itemsToRecalc.clear();
        effectedItems.clear();

        this.items.forEach((item) => {
            if (modeController.batchMode == true) {
                if (item.engine.temporaryOldValues.size > 0) {
                    if (item.engine.checkChangesTemporary()) {
                        effectedItems.add(item);
                    }
                } else {
                    effectedItems.add(item);
                }
            } else {
                if (item.engine.checkChangesOldValues()) {
                    effectedItems.add(item);
                }
            }
        });

        // create an array of reactive elements, sorted by ID (order of creation)
        let effectedItemsSorted = Array.from(effectedItems)
            .filter((item) => item.hasSubscribers())
            .sort(sortReactiveItems);

        modeController.startSubscribersMode();

        let usedSubscribers = new Set();
        let errors = [];

        for (let i = 0; i < effectedItemsSorted.length; i++) {
            let item = effectedItemsSorted[i];

            let itemSubscribers =
                item.engine.subscribeController.getSubscribers();

            for (let subscriber of itemSubscribers) {
                if (usedSubscribers.has(subscriber)) {
                    continue;
                }

                usedSubscribers.add(subscriber);
                try {
                    subscriber(item.engine.updates);
                } catch (e) {
                    let error = new Error(
                        `Error in ${item.name}: ${e.message}`,
                        { cause: item }
                    );
                    error.stack = e.stack;
                    errors.push(error);
                }
            }

            item.engine.clearUpdates();
        }

        this.items.forEach((item) => {
            item.engine.clearUpdates();
        });

        usedSubscribers.clear();
        this.items.clear();

        modeController.endSubscribersMode();

        if (modeController.throwErrorInSubscribers) {
            for (let i = 0; i < errors.length; i++) {
                let error = errors[i];
                throw error;
            }
        }
    }
}

modeController.on("beforeBatchModeEnd", () => {
    changedItemsController.runSubscribers();
    changedItemsController.clear();
});

const changedItemsController = new ChangedItemsController();
export { changedItemsController };
