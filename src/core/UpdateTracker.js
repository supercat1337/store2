// @ts-check

import { BatchSnapshot } from './BatchSnapshot.js';
import { UpdateDataRecord } from './UpdateDataRecord.js';

/**
 * Tracks updates and batch snapshots for a reactive item.
 * Manages the `updates` map and handles batch change detection.
 */
export class UpdateTracker {
    /** @type {Map<string, import('./UpdateDataRecord.js').UpdateDataRecord>} */
    #updates;

    /** @type {import('../reactives/ReactiveItem.js').ReactiveItem} */
    #reactiveItem;

    /** @type {BatchSnapshot | null} */
    #batchSnapshot = null;

    /** @type {import('./Engine.js').Engine} */
    #engine;

    /**
     * @param {Map<string, import('./UpdateDataRecord.js').UpdateDataRecord>} updates
     * @param {import('../reactives/ReactiveItem.js').ReactiveItem} reactiveItem
     * @param {import('./Engine.js').Engine} engine
     */
    constructor(updates, reactiveItem, engine) {
        this.#updates = updates;
        this.#reactiveItem = reactiveItem;
        this.#engine = engine;
    }

    /**
     * In batch mode, stores the original value in a snapshot.
     * @param {string} property
     * @param {any} oldValue
     */
    #recordChange(property, oldValue) {
        if (this.#engine.context.modeController.batchMode) {
            if (!this.#batchSnapshot) {
                this.#batchSnapshot = new BatchSnapshot(this.#reactiveItem);
            }
            this.#batchSnapshot.record(property, oldValue);
        }
    }

    /**
     * Determines whether a change is effective (i.e. not reverted) considering
     * batch snapshots.
     * @param {string} property
     * @param {any} oldValue
     * @param {any} newValue
     * @param {import('../types.js').CompareFunction | null} compareFn
     * @returns {boolean}
     */
    isEffectiveChange(property, oldValue, newValue, compareFn) {
        /**
         * @param {*} a
         * @param {*} b
         * @returns {boolean}
         */
        const equals = (a, b) => (compareFn ? compareFn(a, b) : this.#reactiveItem.equals(a, b));

        const batchMode = this.#engine.context.modeController.batchMode;

        if (batchMode && this.#batchSnapshot?.has(property)) {
            const original = this.#batchSnapshot.getOriginal(property);
            return !equals(original, newValue);
        }
        return !equals(oldValue, newValue);
    }

    /**
     * Adds an update record if the change is effective.
     * @param {string} property
     * @param {"set" | "delete"} type
     * @param {any} oldValue
     * @param {any} newValue
     * @param {import('../types.js').CompareFunction | null} compareFn
     * @param {() => void} notifyDependentsCallback
     * @param {() => void} addToChangedItemsCallback
     * @returns {boolean}
     */
    addUpdate(
        property,
        type,
        oldValue,
        newValue,
        compareFn,
        notifyDependentsCallback,
        addToChangedItemsCallback
    ) {
        this.#recordChange(property, oldValue);

        const batchMode = this.#engine.context.modeController.batchMode;

        let reportedOld = oldValue;
        let compareOld = oldValue;
        if (batchMode && this.#batchSnapshot?.has(property)) {
            const original = this.#batchSnapshot.getOriginal(property);
            reportedOld = original;
            compareOld = original;
        }

        /**
         * @param {*} a
         * @param {*} b
         * @returns {boolean}
         */
        const equals = (a, b) => (compareFn ? compareFn(a, b) : this.#reactiveItem.equals(a, b));

        const hasMutation = property === '' ? !equals(oldValue, newValue) : oldValue !== newValue;
        if (!hasMutation) {
            return false;
        }

        notifyDependentsCallback();
        addToChangedItemsCallback();

        const effective = !equals(compareOld, newValue);
        if (!effective) {
            this.#updates.delete(property);
            return false;
        }

        const record = new UpdateDataRecord(type, reportedOld, newValue, this.#reactiveItem);
        this.#updates.set(property, record);
        this.#engine.version++;

        return true;
    }

    /**
     * @returns {boolean}
     */
    hasUpdates() {
        return this.#updates.size > 0;
    }

    /**
     * Clears all pending updates and resets the batch snapshot.
     */
    clearUpdates() {
        this.#updates.clear();
        if (this.#batchSnapshot) {
            this.#batchSnapshot.clear();
            this.#batchSnapshot = null;
        }
    }

    /**
     * Removes updates for properties that reverted to their original values.
     * @param {(prop: string) => any} getCurrentValue
     * @returns {boolean}
     */
    checkChangesTemporary(getCurrentValue) {
        if (!this.#batchSnapshot) {
            return this.hasUpdates();
        }

        const changedProps = this.#batchSnapshot.getChangedProperties(getCurrentValue);

        for (const key of this.#updates.keys()) {
            if (!changedProps.includes(key)) {
                this.#updates.delete(key);
            }
        }

        const hasChanges = this.#updates.size > 0;
        this.#batchSnapshot.clear();
        this.#batchSnapshot = null;

        return hasChanges;
    }
}
