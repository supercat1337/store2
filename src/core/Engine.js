// @ts-check

import { idService } from '../services/idService.js';
import { SubscribeController } from './SubscribeController.js';
import { changedItemsController } from '../services/changedItemsController.js';
import { modeController } from '../services/modeController.js';
import { DependencyGraph } from './DependencyGraph.js';
import { UpdateTracker } from './UpdateTracker.js';
import { MessageHandler, EngineMessages } from './MessageHandler.js';

export const ATOM = 1;
export const COMPUTED = 2;
export const COLLECTION = 3;
export const SHALLOW_REACTIVE = 4;

/**
 * Engine is the core reactive engine for a single reactive item.
 * It manages dependencies, updates, and lifecycle, delegating to specialised submodules.
 * All public properties and methods remain unchanged for backward compatibility.
 */
export class Engine {
    // --- Public fields (for backward compatibility) ---
    /** @type {Set<import('../types.d.ts').ReactiveItem>} */
    dependencies = new Set();

    /** @type {Set<import('../types.d.ts').ReactiveItem>} */
    dependents = new Set();

    /** @type {number} */
    id = idService.generateId();

    /** @type {number} */
    version = 0;

    /** @type {import('../types.d.ts').ReactiveItem} */
    reactiveItem;

    /** @type {boolean} */
    shouldRecalc = false;

    /** @type {boolean} */
    isDestroyed = false;

    /** @type {null|Error} */
    #error = null;

    /** @type {SubscribeController} */
    subscribeController;

    /** @type {number} */
    type;

    /** @type {Map<string, import('./UpdateDataRecord.js').UpdateDataRecord>} */
    updates = new Map();

    /** @type {import('../types.d.ts').CompareFunction|null} */
    compareFn = null;

    /** @type {boolean} */
    suppressNotifications = false;

    // --- Private submodules ---
    /** @type {DependencyGraph} */
    #graph;
    /** @type {UpdateTracker} */
    #updateTracker;
    /** @type {MessageHandler} */
    #messageHandler;

    /**
     * Creates an Engine instance.
     * @param {import('../types.d.ts').ReactiveItem} reactiveItem - The owning reactive item.
     * @param {1|2|3|4} type - The type of reactive item.
     */
    constructor(reactiveItem, type) {
        this.reactiveItem = reactiveItem;
        this.type = type;

        // Initialise submodules with references to the public Sets/Maps
        this.#graph = new DependencyGraph(this.dependencies, this.dependents, reactiveItem);
        this.#updateTracker = new UpdateTracker(this.updates, reactiveItem, this);
        this.#messageHandler = new MessageHandler();
        this.subscribeController = new SubscribeController(this.reactiveItem);
    }

    /** @type {Error|null} */
    get error() {
        return this.#error;
    }

    /**
     * Records a change attempt.
     * @param {string} property - The property key.
     * @param {"set"|"delete"} type - The operation type.
     * @param {any} oldValue - The previous value.
     * @param {any} value - The new value.
     * @returns {boolean} True if an update was added.
     */
    addUpdate(property, type, oldValue, value) {
        return this.#updateTracker.addUpdate(
            property,
            type,
            oldValue,
            value,
            this.compareFn,
            () => this.notifyDependents(EngineMessages.DEPENDENCY_CHANGED),
            () => changedItemsController.addItem(this.reactiveItem)
        );
    }

    /**
     * Adds a single dependency.
     * @param {import('../types.d.ts').ReactiveItem} dependency
     */
    addDependency(dependency) {
        this.#graph.addDependency(dependency);
    }

    /**
     * Adds multiple dependencies.
     * @param {Set<import('../types.d.ts').ReactiveItem>} dependencies
     */
    addDependencies(dependencies) {
        this.#graph.addDependencies(dependencies);
    }

    /**
     * Adds a dependent.
     * @param {import('../types.d.ts').ReactiveItem} dependent
     * @returns {boolean}
     */
    addDependent(dependent) {
        if (this.isDestroyed) {
            return false;
        }
        return this.#graph.addDependent(dependent);
    }

    /**
     * Removes a dependent.
     * @param {import('../types.d.ts').ReactiveItem} dependent
     */
    removeDependent(dependent) {
        this.#graph.removeDependent(dependent);
    }

    /**
     * Returns all dependents recursively.
     * @returns {Set<import('../types.d.ts').ReactiveItem>}
     */
    getDeepDependents() {
        return this.#graph.getDeepDependents();
    }

    /**
     * Returns sorted array of deep dependents.
     * @returns {Array<import('../types.d.ts').ReactiveItem>}
     */
    getDeepDependentsArray() {
        return this.#graph.getDeepDependentsArray();
    }

    /**
     * Notifies dependents of a message.
     * @param {number} message - The message code.
     * @param {{ sender: import('../types.d.ts').ReactiveItem, recipients: Set<import('../types.d.ts').ReactiveItem> }} [ctx]
     */
    notifyDependents(message, ctx) {
        if (!ctx) {
            ctx = { sender: this.reactiveItem, recipients: new Set() };
        }
        this.#graph.notifyDependents(message, ctx);
    }

    /**
     * Notifies dependencies (reverse direction).
     * @param {number} message - The message code.
     * @param {{ sender: import('../types.d.ts').ReactiveItem, recipients: Set<import('../types.d.ts').ReactiveItem> }} [ctx]
     */
    notifyDependencies(message, ctx) {
        /*
        console.log(
            `[Engine] ${this.reactiveItem.name} notifyDependents, dependents:`,
            Array.from(this.dependents).map(d => d.name)
        );
        */
        if (!ctx) {
            ctx = { sender: this.reactiveItem, recipients: new Set() };
        }
        this.#graph.notifyDependencies(message, ctx);
    }

    /**
     * Handles incoming messages.
     * @param {number} message - The message code.
     * @param {{ sender: import('../types.d.ts').ReactiveItem, recipients: Set<import('../types.d.ts').ReactiveItem> }} ctx
     */
    getMessage(message, ctx) {
        /** @param {Error|null} err */
        const setError = err => {
            this.#error = err;
        };
        /** @param {boolean} val */
        const setShouldRecalc = val => {
            this.shouldRecalc = val;
        };
        /**
         * @param {number} msg @param {{ sender: import('../types.d.ts').ReactiveItem, recipients: Set<import('../types.d.ts').ReactiveItem> }} c
         * @param {{ sender: import('../types.d.ts').ReactiveItem, recipients: Set<import('../types.d.ts').ReactiveItem> }} [c]
         * @returns {void}
         */
        const notify = (msg, c) => this.notifyDependents(msg, c);
        /**
         * @param {import('../types.d.ts').ReactiveItem} dep
         * @returns {void}
         * */
        const removeDep = dep => this.removeDependent(dep);
        /**
         * @param {{ sender: import('../types.d.ts').ReactiveItem, recipients: Set<import('../types.d.ts').ReactiveItem> }} c
         * @returns {void}
         */
        const destroy = c => this.destroy(c);

        this.#messageHandler.handleMessage(
            message,
            ctx,
            this,
            setError,
            setShouldRecalc,
            notify,
            removeDep,
            destroy
        );
    }

    /**
     * Sets an error and notifies dependents.
     * @param {Error|null} error
     * @param {{ sender: import('../types.d.ts').ReactiveItem, recipients: Set<import('../types.d.ts').ReactiveItem> }} [ctx]
     */
    setError(error, ctx) {
        if (error === null) {
            return;
        }
        this.#error = error;
        this.shouldRecalc = true;
        const c = ctx || { sender: this.reactiveItem, recipients: new Set() };
        this.notifyDependents(EngineMessages.HAS_ERROR, c);
    }

    /**
     * Clears the current error.
     */
    clearError() {
        this.#error = null;
    }

    /**
     * Destroys the engine.
     * @param {{ sender: import('../types.d.ts').ReactiveItem, recipients: Set<import('../types.d.ts').ReactiveItem> }} [ctx]
     */
    destroy(ctx) {
        if (this.isDestroyed) {
            return;
        }
        const c = ctx || { sender: this.reactiveItem, recipients: new Set() };
        this.#error = null;
        this.notifyDependents(EngineMessages.DEPENDENCY_DESTROYED, c);
        this.notifyDependencies(EngineMessages.DEPENDENT_DESTROYED, c);
        this.isDestroyed = true;
        this.#graph.clear();
        this.clearUpdates();
        this.subscribeController.destroy();
    }

    /**
     * Clears all pending updates.
     */
    clearUpdates() {
        this.#updateTracker.clearUpdates();
    }

    /**
     * Checks if there are any pending updates.
     * @returns {boolean}
     */
    hasUpdates() {
        return this.#updateTracker.hasUpdates();
    }

    /**
     * Processes temporary changes after batch ends.
     * @returns {boolean} True if any changes remain.
     */
    checkChangesTemporary() {
        /**
         * @param {string} prop
         * @returns {any}
         */
        const getCurrent = prop => {
            if (prop === '') {
                return this.reactiveItem.peekValue();
            }
            const val = this.reactiveItem.peekValue();
            return val?.[prop];
        };
        return this.#updateTracker.checkChangesTemporary(getCurrent);
    }

    /**
     * Updates dependencies to a new set.
     * @param {Set<import('../types.d.ts').ReactiveItem>} newDeps
     */
    updateDependencies(newDeps) {
        this.#graph.updateDependencies(newDeps);
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
     * Called after a value change to schedule notifications.
     */
    valueChangedCallback() {
        //console.log('valueChangedCallback:', this.reactiveItem.name);
        //console.log('this.suppressNotifications', this.suppressNotifications);

        if (this.suppressNotifications) {
            return;
        }
        changedItemsController.addItem(this.reactiveItem);
    }

    /**
     * Checks if a change is effective considering batch mode and snapshots.
     * This method is kept for backward compatibility.
     *
     * @param {string} property - The property key.
     * @param {any} oldValue - The immediate previous value.
     * @param {any} newValue - The new value.
     * @returns {boolean} True if the change is effective (not reverted).
     */
    isEffectiveChangeWithOld(property, oldValue, newValue) {
        return this.#updateTracker.isEffectiveChange(property, oldValue, newValue, this.compareFn);
    }
}
