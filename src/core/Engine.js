// @ts-check

import { idService } from '../services/idService.js';
import { SubscribeController } from './subscribeController.js';
import { sortReactiveItems } from '../helpers/tools.js';
import { changedItemsController } from '../services/changedItemsController.js';
import { modeController } from '../services/modeController.js';
import { UpdateDataRecord } from './UpdateDataRecord.js';
import { BatchSnapshot } from './BatchSnapshot.js';

/** @enum {number} */
export const EngineMessages = {
    DEPENDENCY_CHANGED: 1,
    DEPENDENCY_DESTROYED: 2,
    HAS_ERROR: 3,
    DEPENDENT_DESTROYED: 4,
};

export const ATOM = 1;
export const COMPUTED = 2;
export const COLLECTION = 3;
export const SHALLOW_REACTIVE = 4;

export class Engine {
    /**
     * The set of dependencies of the engine.
     * @type {Set<ReactivePrimitive>}
     */
    dependencies = new Set();

    /**
     * The set of dependents of the engine.
     * @type {Set<ReactivePrimitive>}
     */
    dependents = new Set();

    /**
     * Unique identifier for ordering.
     * @type {number}
     */
    id = idService.generateId();

    /**
     * Version number (currently unused, kept for potential future use).
     * @type {number}
     */
    version = 0;

    /**
     * Reference to the reactive item.
     * @type {ReactivePrimitive}
     */
    reactiveItem;

    /**
     * Flag indicating that the value should be recalculated.
     * @type {boolean}
     */
    shouldRecalc = false;

    /**
     * Indicates whether the engine has been destroyed.
     * @type {boolean}
     */
    isDestroyed = false;

    /**
     * @type {null|Error}
     */
    #error = null;

    subscribeController = new SubscribeController();

    /**
     * The type of the reactive item.
     * @type {number}
     */
    type;

    /**
     * Map of pending updates (property -> UpdateDataRecord).
     * @type {Map<string, UpdateDataRecord>}
     */
    updates = new Map();

    /**
     * Snapshot of original values when inside a batch.
     * @type {BatchSnapshot|null}
     */
    #batchSnapshot = null;

    /**
     * Comparison function for equality.
     * @type {CompareFunction|null}
     */
    compareFn = null;

    /**
     * Prevents updates from being propagated (used during mass updates).
     * @type {boolean}
     */
    suppressNotifications = false;

    /**
     * Creates an Engine instance.
     * @param {ReactivePrimitive} reactiveItem - The reactive item.
     * @param {ATOM|COMPUTED|COLLECTION|SHALLOW_REACTIVE} type - The type.
     */
    constructor(reactiveItem, type) {
        this.reactiveItem = reactiveItem;
        this.type = type;
    }

    /** @type {Error|null} */
    get error() {
        return this.#error;
    }

    /**
     * Records a change attempt. In batch mode, stores the original value.
     * @param {string} property - The property key.
     * @param {any} oldValue - The value before the change.
     */
    #recordChange(property, oldValue) {
        if (modeController.batchMode) {
            if (!this.#batchSnapshot) {
                this.#batchSnapshot = new BatchSnapshot(this.reactiveItem);
            }
            this.#batchSnapshot.record(property, oldValue);
        }
    }

    /**
     * Determines whether a change actually affects the final value (considering batch).
     * @param {string} property - The property key.
     * @param {any} newValue - The new value.
     * @returns {boolean} True if the change is effective.
     */
    isEffectiveChange(property, newValue) {
        let effectiveOld;
        if (modeController.batchMode && this.#batchSnapshot?.has(property)) {
            effectiveOld = this.#batchSnapshot.getOriginal(property);
        } else {
            // When not in batch or property not recorded, we treat oldValue as unknown.
            // In practice, this method is called after recordChange, so oldValue is known.
            // We'll rely on the caller passing the correct oldValue, but here we need a baseline.
            // For simplicity, we assume that if no snapshot, the change is always effective?
            // Better to have the caller pass oldValue. We'll change signature.
            // But to keep compatibility with existing calls, we'll require oldValue parameter.
            throw new Error('isEffectiveChange requires oldValue when not in batch mode');
        }
        return !this.reactiveItem.equals(effectiveOld, newValue);
    }

    /**
     * Alternative version that accepts explicit oldValue (preferred).
     * @param {string} property - The property key.
     * @param {any} oldValue - The previous value (immediate before this change).
     * @param {any} newValue - The new value.
     * @returns {boolean}
     */
    isEffectiveChangeWithOld(property, oldValue, newValue) {
        if (modeController.batchMode && this.#batchSnapshot?.has(property)) {
            const original = this.#batchSnapshot.getOriginal(property);
            return !this.reactiveItem.equals(original, newValue);
        }
        return !this.reactiveItem.equals(oldValue, newValue);
    }

    /**
     * Commits a change: creates an UpdateDataRecord, adds to updates, and schedules notification.
     * @param {string} property - The property key.
     * @param {"set"|"delete"} verb - The operation.
     * @param {any} oldValue - The previous value (immediate before this change).
     * @param {any} newValue - The new value.
     * @returns {boolean} True if committed (i.e., value actually changed).
     */
    #commitChange(property, verb, oldValue, newValue) {
        let reportedOld = oldValue;
        let compareOld = oldValue;
        if (modeController.batchMode && this.#batchSnapshot?.has(property)) {
            const original = this.#batchSnapshot.getOriginal(property);
            reportedOld = original;
            compareOld = original;
        }

        // 1. Проверяем, произошла ли реальная мутация (изменение значения)
        const hasMutation =
            property === '' ? !this.reactiveItem.equals(oldValue, newValue) : oldValue !== newValue;

        if (!hasMutation) {
            return false;
        }

        // 2. Всегда уведомляем зависимых и добавляем элемент в changedItemsController
        //    (даже если в batch и значение позже вернётся к исходному)
        this.notifyDependents(EngineMessages.DEPENDENCY_CHANGED);
        changedItemsController.addItem(this.reactiveItem);

        // 3. Определяем, изменилось ли значение относительно стабильного (или старого вне batch)
        const isEffective =
            property === ''
                ? !this.reactiveItem.equals(compareOld, newValue)
                : compareOld !== newValue;

        if (!isEffective) {
            // Значение вернулось к исходному – удаляем запись обновления
            this.updates.delete(property);
            return false;
        }

        // 4. Создаём или обновляем запись в updates
        const record = new UpdateDataRecord(verb, reportedOld, newValue, this.reactiveItem);
        this.updates.set(property, record);
        this.version++;
        return true;
    }

    /**
     * Legacy method for backward compatibility. Delegates to recordChange + #commitChange.
     * @param {string} property - The property key.
     * @param {"set"|"delete"} verb - The operation.
     * @param {any} oldValue - The previous value.
     * @param {any} value - The new value.
     * @returns {boolean} True if an update was added.
     */
    addUpdate(property, verb, oldValue, value) {
        this.#recordChange(property, oldValue);
        return this.#commitChange(property, verb, oldValue, value);
    }

    /**
     * Adds dependencies to this engine.
     * @param {Set<ReactivePrimitive>} dependencies
     */
    addDependencies(dependencies) {
        const array = [];
        for (const dependency of dependencies) {
            if (!this.dependencies.has(dependency)) {
                array.push(dependency);
                dependency.engine.addDependent(this.reactiveItem);
            }
        }
        array.sort(sortReactiveItems);
        for (let i = 0; i < array.length; i++) {
            this.addDependency(array[i]);
        }
    }

    /**
     * Adds a single dependency.
     * @param {ReactivePrimitive} dependency
     */
    addDependency(dependency) {
        if (!this.dependencies.has(dependency)) {
            this.dependencies.add(dependency);
        }
    }

    /**
     * Adds a dependent.
     * @param {ReactivePrimitive} dependent
     * @returns {boolean}
     */
    addDependent(dependent) {
        if (this.isDestroyed) {
            return false;
        }
        if (!this.dependents.has(dependent)) {
            this.dependents.add(dependent);
        }
        return true;
    }

    /**
     * Removes a dependent.
     * @param {ReactivePrimitive} dependent
     */
    removeDependent(dependent) {
        this.dependents.delete(dependent);
    }

    /**
     * Returns all dependents recursively.
     * @returns {Set<ReactivePrimitive>}
     */
    getDeepDependents() {
        const result = new Set();
        const queue = [this.reactiveItem];
        const visited = new Set();
        while (queue.length) {
            const current = queue.shift();
            if (!current || visited.has(current)) {
                continue;
            }
            visited.add(current);
            for (const dependent of current.engine.dependents) {
                if (!result.has(dependent)) {
                    result.add(dependent);
                    queue.push(dependent);
                }
            }
        }
        return result;
    }

    /**
     * Returns sorted array of deep dependents.
     * @returns {Array<ReactivePrimitive>}
     */
    getDeepDependentsArray() {
        const array = Array.from(this.getDeepDependents());
        array.sort(sortReactiveItems);
        return array;
    }

    /**
     * Notifies dependents of a message.
     * @param {EngineMessages} message
     * @param {{sender: ReactivePrimitive, recipients: Set<ReactivePrimitive>}} [ctx]
     */
    notifyDependents(message, ctx) {
        if (ctx === undefined) {
            ctx = { sender: this.reactiveItem, recipients: new Set() };
        }
        for (const dependent of this.dependents) {
            ctx.recipients.add(dependent);
            dependent.engine.getMessage(message, ctx);
        }
    }

    /**
     * Notifies dependencies (reverse direction).
     * @param {EngineMessages} message
     * @param {{sender: ReactivePrimitive, recipients: Set<ReactivePrimitive>}} ctx
     */
    notifyDependencies(message, ctx) {
        for (const dependency of this.dependencies) {
            ctx.recipients.add(dependency);
            dependency.engine.getMessage(message, ctx);
        }
    }

    /**
     * Handles incoming messages.
     * @param {EngineMessages} message
     * @param {{sender: ReactivePrimitive, recipients: Set<ReactivePrimitive>}} ctx
     */
    getMessage(message, ctx) {
        switch (message) {
            case EngineMessages.DEPENDENT_DESTROYED:
                this.dependents.delete(ctx.sender);
                break;
            case EngineMessages.DEPENDENCY_CHANGED:
                this.#error = null;
                this.shouldRecalc = true;
                this.notifyDependents(message, ctx);
                break;
            case EngineMessages.DEPENDENCY_DESTROYED:
                this.destroy(ctx);
                break;
            case EngineMessages.HAS_ERROR:
                this.shouldRecalc = true;
                this.setError(ctx.sender.engine.error, ctx);
                break;
        }
    }

    /**
     * Sets an error and notifies dependents.
     * @param {Error|null} error
     * @param {{sender: ReactivePrimitive, recipients: Set<ReactivePrimitive>}} [ctx]
     */
    setError(error, ctx) {
        if (error === null) {
            return;
        }
        if (ctx === undefined) {
            ctx = { sender: this.reactiveItem, recipients: new Set() };
        }
        this.version++;
        this.#error = error;
        this.shouldRecalc = true;
        this.notifyDependents(EngineMessages.HAS_ERROR, ctx);
    }

    /**
     * Clears the current error.
     */
    clearError() {
        this.#error = null;
    }

    /**
     * Destroys the engine.
     * @param {{sender: ReactivePrimitive, recipients: Set<ReactivePrimitive>}} [ctx]
     */
    destroy(ctx) {
        if (this.isDestroyed) {
            return;
        }
        if (ctx === undefined) {
            ctx = { sender: this.reactiveItem, recipients: new Set() };
        }
        this.#error = null;
        this.notifyDependents(EngineMessages.DEPENDENCY_DESTROYED, ctx);
        this.notifyDependencies(EngineMessages.DEPENDENT_DESTROYED, ctx);
        this.isDestroyed = true;
        this.dependencies.clear();
        this.dependents.clear();
        this.subscribeController.destroy();
        this.clearUpdates();
        if (this.#batchSnapshot) {
            this.#batchSnapshot.clear();
            this.#batchSnapshot = null;
        }
    }

    /**
     * Clears all pending updates.
     */
    clearUpdates() {
        this.updates.clear();
    }

    /**
     * Checks if there are any pending updates.
     * @returns {boolean}
     */
    hasUpdates() {
        return this.updates.size > 0;
    }

    /**
     * Legacy method for compatibility.
     * @returns {boolean}
     */
    checkChangesOldValues() {
        return this.hasUpdates();
    }

    /**
     * Processes temporary changes after batch ends.
     * Removes updates for properties that reverted to original values.
     * @returns {boolean} True if any changes remain.
     */
    checkChangesTemporary() {
        if (!this.#batchSnapshot) {
            return this.hasUpdates();
        }

        /**
         *
         * @param {string} prop
         * @returns {any}
         */
        const getCurrent = prop => {
            if (prop === '') {
                return this.reactiveItem.peekValue();
            }
            const val = this.reactiveItem.peekValue();
            return val ? val[prop] : undefined;
        };

        const changedProps = this.#batchSnapshot.getChangedProperties(getCurrent);

        for (const key of this.updates.keys()) {
            if (!changedProps.includes(key)) {
                this.updates.delete(key);
            }
        }

        const hasChanges = this.updates.size > 0;
        this.#batchSnapshot.clear();
        this.#batchSnapshot = null;

        return hasChanges;
    }

    /**
     * Called after a value change to schedule notifications.
     */
    valueChangedCallback() {
        if (this.suppressNotifications) {
            return;
        }
        changedItemsController.addItem(this.reactiveItem);
    }

    /**
     * Prepares the engine for setting a new value.
     * @throws {Error} If destroyed or in subscribers mode.
     */
    prepareSetValue() {
        if (this.isDestroyed) {
            throw new Error('The reactive item has been destroyed');
        }
        if (modeController.subscribersMode) {
            throw new Error('Cannot set value while subscribers are running');
        }
    }

    /**
     * Updates dependencies to a new set.
     * @param {Set<ReactivePrimitive>} newDeps
     */
    updateDependencies(newDeps) {
        // Remove old dependencies no longer needed
        for (const oldDep of this.dependencies) {
            if (!newDeps.has(oldDep)) {
                this.dependencies.delete(oldDep);
                oldDep.engine.removeDependent(this.reactiveItem);
            }
        }
        // Add new dependencies
        for (const newDep of newDeps) {
            if (!this.dependencies.has(newDep)) {
                this.dependencies.add(newDep);
                newDep.engine.addDependent(this.reactiveItem);
            }
        }
    }
}
