// @ts-check

import { idService, ItemId } from "../services/idService.js";
import { SubscribeController } from "./subscribeController.js";
import { sortReactiveItems } from "../helpers/tools.js";
import { changedItemsController } from "../services/changedItemsController.js";
import { ReactivePrimitive } from "../reactives/reactivePrimitive.js";
import { modeController } from "../services/modeController.js";
import { UpdateDataRecord } from "./UpdateDataRecord.js";

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
export const REACTIVEPROPS_OBJECT = 4;

/** @typedef {(...args:any)=>boolean} CompareFunction */

class Engine {
    /**
     * The set of dependencies of the engine.
     * @type {Set<ReactivePrimitive>}
     * */
    dependencies = new Set(); // dependencies

    /**
     * The set of dependents of the engine.
     * @type {Set<ReactivePrimitive>}
     * */
    dependents = new Set(); // dependents

    /**
     * A unique identifier for the engine. It is used to determine the order in which reactive items were created.
     * @type {ItemId}
     * */
    id = idService.generateId();

    /**
     * The version of the value of the reactive item.
     * @type {number}
     */
    version = 0;

    /**
     * The reference to the reactive item.
     * @type {ReactivePrimitive}
     * */
    reactiveItem;

    /**
     * The flag that indicates whether the Engine should recalculate the value of the reactive item.
     * @type {boolean}
     * */
    shouldRecalc = false;

    /**
     * Indicates whether the Engine has been destroyed.
     * @type {boolean}
     * */
    isDestroyed = false;

    /**
     * The error state of the Engine.
     * @type {null|Error}
     * */
    error = null;

    subscribeController = new SubscribeController();

    /**
     * The type of the reactive item.
     * @type {number}
     * */
    type;

    /** @type {Map<string, UpdateDataRecord>} */
    updates = new Map();

    oldValues = new Map();

    // Holds previous values when batchMode is active
    temporaryOldValues = new Map();

    /**
     * A function that compares two values to determine if they are equal.
     * @type {CompareFunction|null}
     * */
    compareFn = null;

    /**
     * Prevents updates from being propagated when the engine is setting properties of the reactive item.
     * @type {boolean}
     * */
    muteUpdates = false;

    /**
     * Initializes an Engine instance with a given reactive item.
     * @param {ReactivePrimitive} reactiveItem - The reactive item to be managed by the engine.
     * @param {ATOM|COMPUTED|COLLECTION|REACTIVEPROPS_OBJECT} type - The type of the reactive item.
     */
    constructor(reactiveItem, type) {
        this.reactiveItem = reactiveItem;
        this.type = type;
    }

    /**
     * Adds the given dependencies to the engine. The engine will be considered as needing an update if any of the
     * dependencies have changed.
     * @param {Set<ReactivePrimitive>} dependencies - The dependencies to add.
     */
    addDependencies(dependencies) {
        let array = [];

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
     * Adds a single dependency to the engine. The engine will be considered as needing an update if the dependency changes.
     * @param {ReactivePrimitive} dependency - The dependency to add.
     */
    addDependency(dependency) {
        if (!this.dependencies.has(dependency)) {
            this.dependencies.add(dependency);
        }
    }

    /**
     * Adds a single dependent to the engine. The engine will notify the dependent whenever an update is needed.
     * @param {ReactivePrimitive} dependent - The dependent to add.
     * @returns {boolean} Whether the dependent was successfully added. If the engine is destroyed, the dependent is not added and the method returns false.
     */
    addDependent(dependent) {
        if (this.isDestroyed) return false;

        if (!this.dependents.has(dependent)) {
            this.dependents.add(dependent);
        }

        return true;
    }

    /**
     * Returns a set of all dependents of the engine, including all dependents of the dependents of the engine. This
     * method is useful for finding all atoms, computed values and collections that are dependent on a given reactive
     * item.
     * @returns {Set<ReactivePrimitive>} A set of all dependents of the engine.
     */
    getDeepDependents() {
        const dependents = new Set(this.dependents);

        for (const dependent of this.dependents) {
            for (const deepDependent of dependent.engine.dependents) {
                dependents.add(deepDependent);
            }
        }

        return dependents;
    }

    /**
     * Returns an array of all dependents of the engine, including all dependents of the dependents of the engine, sorted
     * by engine ID. This method is useful for finding all atoms, computed values and collections that are dependent on a
     * given reactive item, in a specific order.
     * @returns {Array<ReactivePrimitive>} An array of all dependents of the engine, sorted by engine ID.
     */
    getDeepDependentsArray() {
        let array = Array.from(this.getDeepDependents());
        array.sort(sortReactiveItems);
        return array;
    }

    /**
     * Notifies all dependents of the engine that a change has occurred.
     * @param {EngineMessages} message - An optional message to pass to the dependents.
     * @param { {sender: ReactivePrimitive, recipients: Set<ReactivePrimitive>} } [ctx] - An optional context to pass to the dependents.
     */
    notifyDependents(message, ctx) {
        if (ctx === undefined) {
            ctx = {
                sender: this.reactiveItem,
                recipients: new Set(),
            };
        }

        this.dependents.forEach((dependent) => {
            ctx.recipients.add(dependent);
            dependent.engine.getMessage(message, ctx);
        });
    }

    /**
     * Notifies all dependencies of the engine that a change has occurred.
     * @param {EngineMessages} message - The message to pass to the dependencies.
     * @param { {sender: ReactivePrimitive, recipients: Set<ReactivePrimitive>} } ctx - The context to pass to the dependencies.
     */
    notifyDependencies(message, ctx) {
        this.dependencies.forEach((dependent) => {
            ctx.recipients.add(dependent);
            dependent.engine.getMessage(message, ctx);
        });
    }

    /**
     * Processes a message that has been sent to the engine. If the message is {@link DEPENDENCY_CHANGED}, the engine
     * notifies all dependents of the change. If the message is {@link DEPENDENCY_DESTROYED}, the engine destroys itself. If
     * the message is {@link HAS_ERROR}, the engine forwards the error to all dependents.
     * @param {EngineMessages} message - The message to process.
     * @param { {sender: ReactivePrimitive, recipients: Set<ReactivePrimitive>} } ctx - The context to pass to the dependents.
     */
    getMessage(message, ctx) {
        if (message == EngineMessages.DEPENDENT_DESTROYED) {
            this.dependents.delete(ctx.sender);
        }

        if (message == EngineMessages.DEPENDENCY_CHANGED) {
            this.error = null;
            this.shouldRecalc = true;
            this.notifyDependents(message, ctx);
        }

        if (message == EngineMessages.DEPENDENCY_DESTROYED) {
            this.destroy(ctx);
        }

        if (message == EngineMessages.HAS_ERROR) {
            this.setError(ctx.sender.engine.error, ctx);
        }
    }

    /**
     * Sets the error state of the Engine to the given error, increments the version, and notifies dependents of the error.
     * @param {Error|null} error - The error to set.
     * @param {{sender: ReactivePrimitive, recipients: Set<ReactivePrimitive>}} [ctx] - An optional context to pass to the dependents.
     */
    setError(error, ctx) {
        if (error === null) return;

        if (ctx === undefined) {
            ctx = {
                sender: this.reactiveItem,
                recipients: new Set(),
            };
        }

        this.version++;
        this.error = error;
        this.shouldRecalc = true;
        this.notifyDependents(EngineMessages.HAS_ERROR, ctx);
    }

    /**
     * Destroys the Engine, clearing all dependencies, dependents and subscribers, and marking the Engine as destroyed.
     * This method is useful for cleaning up after an Engine that is no longer needed.
     * @param {{sender: ReactivePrimitive, recipients: Set<ReactivePrimitive>}} [ctx]
     */
    destroy(ctx) {
        if (this.isDestroyed) return;

        if (ctx === undefined) {
            ctx = {
                sender: this.reactiveItem,
                recipients: new Set(),
            };
        }

        this.error = null;
        this.notifyDependents(EngineMessages.DEPENDENCY_DESTROYED, ctx);
        this.notifyDependencies(EngineMessages.DEPENDENT_DESTROYED, ctx);
        this.isDestroyed = true;
        this.dependencies.clear();
        this.dependents.clear();
        this.subscribeController.destroy();
        this.clearUpdates();
    }

    /**
     * Adds an update to the Engine's update log. The update log is an array of objects with the following properties:
     * - property: The name of the property that changed.
     * - verb: The verb that describes the change. For example "set" or "added".
     * - oldValue: The value of the property before the change.
     * - value: The new value of the property.
     * @param {string} property - The name of the property that changed.
     * @param {"set"|"delete"} verb - The verb that describes the change.
     * @param {any} oldValue - The value of the property before the change.
     * @param {any} value - The new value of the property.
     */
    addUpdate(property, verb, oldValue, value) {
        if (modeController.batchMode == true) {
            if (this.temporaryOldValues.get(property) === undefined) {
                this.temporaryOldValues.set(property, oldValue);
            }
        }

        this.oldValues.set(property, oldValue);

        if (modeController.batchMode) {
            oldValue = this.temporaryOldValues.get(property);
        }

        if (property == "") {
            this.updates.clear();
        }

        if (property == "" && this.reactiveItem.equals(oldValue, value)) {
            this.updates.delete(property);
            return;
        }

        let updateRecord = new UpdateDataRecord(
            verb,
            oldValue,
            value,
            this.reactiveItem
        );
        this.updates.set(property, updateRecord);
    }

    /**
     * Clears all updates in the engine's update log.
     */
    clearUpdates() {
        this.updates.clear();
    }

    /**
     * Checks whether there are any updates in the engine's update log.
     * @returns {boolean} True if there are updates, false otherwise.
     */
    hasUpdates() {
        return this.updates.size > 0;
    }

    /**
     * Processes a value change.
     */
    valueChangedCallback() {
        if (this.muteUpdates) return;

        this.version++;

        let ctx = {
            sender: this.reactiveItem,
            recipients: new Set(),
        };

        this.shouldRecalc = false;

        this.notifyDependents(EngineMessages.DEPENDENCY_CHANGED, ctx);

        changedItemsController.addItem(this.reactiveItem);
    }

    /**
     * Checks whether any temporary old values have changed and if so, moves these values to the oldValues map and deletes them from the temporaryOldValues map.
     * This method is called by the reactive item whenever a value change is detected and the muteUpdates flag is set to true.
     * @returns {boolean} True if any changes were detected, false otherwise.
     */
    checkChangesTemporary() {
        let item = this.reactiveItem;

        let keys = Array.from(this.temporaryOldValues.keys());

        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];

            let temporaryOldValue = this.temporaryOldValues.get(key);
            let actualValue =
                key == "" ? item.getValue() : item.getValue()[key];

            if (!item.equals(temporaryOldValue, actualValue)) {
                this.oldValues.set(key, this.temporaryOldValues.get(key));
                this.temporaryOldValues.delete(key);
                return true;
            }
        }

        return false;
    }

    /**
     * Checks whether any old values have changed by comparing them with the current values.
     * If a change is detected, returns true; otherwise, returns false.
     * This method iterates over the keys of the oldValues map and checks if the
     * corresponding current value differs from the stored old value.
     *
     * @returns {boolean} True if any old values have changed, false otherwise.
     */
    checkChangesOldValues() {
        return this.hasUpdates();
    }

    /**
     * Prepares the engine to set a new value for the reactive item by
     * checking that the reactive item has not been destroyed and that
     * there are no subscribers currently running. If either of these
     * conditions are true, an error is thrown.
     */
    prepareSetValue() {
        if (this.isDestroyed) {
            throw new Error("The reactive item has been destroyed");
        }

        if (modeController.subscribersMode) {
            throw new Error("Cannot set value while subscribers are running");
        }
    }
}

export { Engine };
