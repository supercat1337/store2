// @ts-check

import { BatchSnapshot } from './BatchSnapshot.js';
import { UpdateDataRecord } from './UpdateDataRecord.js';
import { modeController } from '../services/modeController.js';

/**
 * Tracks updates and batch snapshots for a reactive item.
 * Manages the `updates` map and handles batch change detection.
 */
export class UpdateTracker {
    /** @type {Map<string, import('../types.d.ts').UpdateDataRecord>} */
    #updates;
    /** @type {import('../types.d.ts').ReactiveItem} */
    #reactiveItem;
    /** @type {BatchSnapshot | null} */
    #batchSnapshot = null;
    /** @type {import('./Engine.js').Engine} */
    #engine; // ссылка на Engine для доступа к version и batchSnapshot

    /**
     * @param {Map<string, import('../types.d.ts').UpdateDataRecord>} updates - The engine's updates map.
     * @param {import('../types.d.ts').ReactiveItem} reactiveItem - The owning reactive item.
     * @param {import('./Engine.js').Engine} engine - The owning engine (for version and batch snapshot access).
     */
    constructor(updates, reactiveItem, engine) {
        this.#updates = updates;
        this.#reactiveItem = reactiveItem;
        this.#engine = engine;
    }

    /**
     * Records a change attempt. In batch mode, stores the original value in a snapshot.
     * @param {string} property - The property key.
     * @param {any} oldValue - The value before the change.
     */
    #recordChange(property, oldValue) {
        if (modeController.batchMode) {
            if (!this.#batchSnapshot) {
                this.#batchSnapshot = new BatchSnapshot(this.#reactiveItem);
            }
            this.#batchSnapshot.record(property, oldValue);
        }
    }

    /**
     * Determines if a change is effective (i.e., not reverted) considering batch snapshots.
     * @param {string} property - The property key.
     * @param {any} oldValue - The immediate previous value.
     * @param {any} newValue - The new value.
     * @param {import('../types.d.ts').CompareFunction|null} compareFn - Equality function.
     * @returns {boolean}
     */
    isEffectiveChange(property, oldValue, newValue, compareFn) {
        /**
         * @param {*} a
         * @param {*} b
         * @returns {boolean}
         */
        const equals = (a, b) => (compareFn ? compareFn(a, b) : this.#reactiveItem.equals(a, b));
        if (modeController.batchMode && this.#batchSnapshot?.has(property)) {
            const original = this.#batchSnapshot.getOriginal(property);
            return !equals(original, newValue);
        }
        return !equals(oldValue, newValue);
    }

    /**
     * Adds an update record if the change is effective.
     * @param {string} property - The property key.
     * @param {"set"|"delete"} type - The operation type.
     * @param {any} oldValue - The previous value (immediate).
     * @param {any} newValue - The new value.
     * @param {import('../types.d.ts').CompareFunction|null} compareFn - Equality function.
     * @param {() => void} notifyDependentsCallback - Callback to notify dependents of a change.
     * @param {() => void} addToChangedItemsCallback - Callback to add the item to the changed items controller.
     * @returns {boolean} True if an update was added.
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

        // Compute the reported old value (original in batch, else immediate)
        let reportedOld = oldValue;
        let compareOld = oldValue;
        if (modeController.batchMode && this.#batchSnapshot?.has(property)) {
            const original = this.#batchSnapshot.getOriginal(property);
            reportedOld = original;
            compareOld = original;
        }

        // Check if the mutation actually changed the value (immediate check)
        /**
         * @param {*} a
         * @param {*} b
         * @returns {boolean}
         */
        const equals = (a, b) => (compareFn ? compareFn(a, b) : this.#reactiveItem.equals(a, b));
        const hasMutation = property === '' ? !equals(oldValue, newValue) : oldValue !== newValue;
        if (!hasMutation) {return false;}

        // Notify dependents and add to changed items controller
        notifyDependentsCallback();
        addToChangedItemsCallback();

        // Determine if the change is effective relative to the batch original (if any)
        const effective = !equals(compareOld, newValue);
        if (!effective) {
            // Reverted back to original – remove the update record
            this.#updates.delete(property);
            return false;
        }

        // Create or update the record with the reported old value
        const record = new UpdateDataRecord(type, reportedOld, newValue, this.#reactiveItem);
        this.#updates.set(property, record);
        // Increment engine version (needed for smartRecompute)
        this.#engine.version++;

        /*
        console.log(
            `[UpdateTracker] ${this.#reactiveItem.name} addUpdate: property=${property}, old=${oldValue}, new=${newValue}, effective=${effective}, hasMutation=${hasMutation}`
        );
        */
        return true;
    }

    /**
     * Checks if there are any pending updates.
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
     * Processes temporary changes after batch ends.
     * Removes updates for properties that reverted to original values.
     * @param {(prop: string) => any} getCurrentValue - Function to get current value for a property.
     * @returns {boolean} True if any changes remain.
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
        
        /*
        console.log(
            `[checkChangesTemporary] ${this.#reactiveItem.name} result: ${hasChanges}, updates:`,
            Array.from(this.#updates.keys())
        );
        */

        return hasChanges;
    }
}
