// @ts-check

import { getCurrentContext } from './context.js';
import { SubscribeController } from './SubscribeController.js';
import { DependencyGraph } from './DependencyGraph.js';
import { UpdateTracker } from './UpdateTracker.js';
import { MessageHandler, EngineMessages } from './MessageHandler.js';

export const ATOM = 1;
export const COMPUTED = 2;
export const COLLECTION = 3;
export const SHALLOW_REACTIVE = 4;

/**
 * Engine is the core reactive engine for a single reactive item.
 * It manages dependencies, updates, lifecycle, and plugin notifications.
 *
 * Every engine holds a reference to the `Store2Context` it was created in.
 * All coordination with the id service, mode controller, and changed-items
 * controller goes through that context, so multiple isolated roots can
 * coexist in one process.
 */
export class Engine {
    /** @type {import('./context.js').Store2Context} */
    context;

    /** @type {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} */
    dependencies = new Set();

    /** @type {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} */
    dependents = new Set();

    /** @type {number} */
    id;

    /** @type {number} */
    version = 0;

    /** @type {import('../reactives/ReactiveItem.js').ReactiveItem} */
    reactiveItem;

    /** @type {boolean} */
    shouldRecalc = false;

    /** @type {boolean} */
    isDestroyed = false;

    /** @type {Error | null} */
    #error = null;

    /** @type {SubscribeController} */
    subscribeController;

    /** @type {import('../types.js').ReactiveItemType} */
    type;

    /** @type {Map<string, import('./UpdateDataRecord.js').UpdateDataRecord>} */
    updates = new Map();

    /** @type {import('../types.js').CompareFunction | null} */
    compareFn = null;

    /** @type {boolean} */
    suppressNotifications = false;

    /** @type {DependencyGraph} */
    #graph;

    /** @type {UpdateTracker} */
    #updateTracker;

    /** @type {MessageHandler} */
    #messageHandler;

    /**
     * @param {import('../reactives/ReactiveItem.js').ReactiveItem} reactiveItem
     * @param {import('../types.js').ReactiveItemType} type
     */
    constructor(reactiveItem, type) {
        this.reactiveItem = reactiveItem;
        this.type = type;
        this.context = getCurrentContext();
        this.id = this.context.idService.generateId();

        this.#graph = new DependencyGraph(this.dependencies, this.dependents, reactiveItem);
        this.#updateTracker = new UpdateTracker(this.updates, reactiveItem, this);
        this.#messageHandler = new MessageHandler();
        this.subscribeController = new SubscribeController(this.reactiveItem);
    }

    /**
     * @returns {Error | null}
     */
    get error() {
        return this.#error;
    }

    /**
     * Records a change attempt and emits `onUpdate` when the change is
     * effective.
     * @param {string} property
     * @param {"set" | "delete"} type
     * @param {any} oldValue
     * @param {any} value
     * @returns {boolean}
     */
    addUpdate(property, type, oldValue, value) {
        const added = this.#updateTracker.addUpdate(
            property,
            type,
            oldValue,
            value,
            this.compareFn,
            () => this.notifyDependents(EngineMessages.DEPENDENCY_CHANGED),
            () => this.context.changedItemsController.addItem(this.reactiveItem)
        );

        if (added) {
            const record = this.updates.get(property);
            if (record) {
                this.context.emitPlugin('onUpdate', this.reactiveItem, property, record);
            }
        }

        return added;
    }

    /**
     * @param {import('../reactives/ReactiveItem.js').ReactiveItem} dependency
     */
    addDependency(dependency) {
        this.#graph.addDependency(dependency);
    }

    /**
     * @param {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} dependencies
     */
    addDependencies(dependencies) {
        this.#graph.addDependencies(dependencies);
    }

    /**
     * @param {import('../reactives/ReactiveItem.js').ReactiveItem} dependent
     * @returns {boolean}
     */
    addDependent(dependent) {
        if (this.isDestroyed) {
            return false;
        }
        return this.#graph.addDependent(dependent);
    }

    /**
     * @param {import('../reactives/ReactiveItem.js').ReactiveItem} dependent
     */
    removeDependent(dependent) {
        this.#graph.removeDependent(dependent);
    }

    /**
     * @returns {Set<import('../reactives/ReactiveItem.js').ReactiveItem>}
     */
    getDeepDependents() {
        return this.#graph.getDeepDependents();
    }

    /**
     * @returns {Array<import('../reactives/ReactiveItem.js').ReactiveItem>}
     */
    getDeepDependentsArray() {
        return this.#graph.getDeepDependentsArray();
    }

    /**
     * @param {number} message
     * @param {{ sender: import('../reactives/ReactiveItem.js').ReactiveItem, recipients: Set<import('../reactives/ReactiveItem.js').ReactiveItem> }} [ctx]
     */
    notifyDependents(message, ctx) {
        if (!ctx) {
            ctx = { sender: this.reactiveItem, recipients: new Set() };
        }
        this.#graph.notifyDependents(message, ctx);
    }

    /**
     * @param {number} message
     * @param {{ sender: import('../reactives/ReactiveItem.js').ReactiveItem, recipients: Set<import('../reactives/ReactiveItem.js').ReactiveItem> }} [ctx]
     */
    notifyDependencies(message, ctx) {
        if (!ctx) {
            ctx = { sender: this.reactiveItem, recipients: new Set() };
        }
        this.#graph.notifyDependencies(message, ctx);
    }

    /**
     * @param {number} message
     * @param {{ sender: import('../reactives/ReactiveItem.js').ReactiveItem, recipients: Set<import('../reactives/ReactiveItem.js').ReactiveItem> }} ctx
     */
    getMessage(message, ctx) {
        /** @param {Error | null} err */
        const setError = err => {
            this.#error = err;
        };
        /** @param {boolean} val */
        const setShouldRecalc = val => {
            this.shouldRecalc = val;
        };
        /**
         * @param {number} msg
         * @param {{ sender: import('../reactives/ReactiveItem.js').ReactiveItem, recipients: Set<import('../reactives/ReactiveItem.js').ReactiveItem> }} c
         * @returns {void}
         */
        const notify = (msg, c) => this.notifyDependents(msg, c);
        /**
         * @param {import('../reactives/ReactiveItem.js').ReactiveItem} dep
         * @returns {void}
         */
        const removeDep = dep => this.removeDependent(dep);
        /**
         * @param {{ sender: import('../reactives/ReactiveItem.js').ReactiveItem, recipients: Set<import('../reactives/ReactiveItem.js').ReactiveItem> }} c
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
     * Sets an error and notifies dependents. Emits `onError`.
     * @param {Error | null} error
     * @param {{ sender: import('../reactives/ReactiveItem.js').ReactiveItem, recipients: Set<import('../reactives/ReactiveItem.js').ReactiveItem> }} [ctx]
     */
    setError(error, ctx) {
        if (error === null) {
            return;
        }
        this.#error = error;
        this.shouldRecalc = true;
        this.context.emitPlugin('onError', this.reactiveItem, error);
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
     * Destroys the engine. Emits `onDestroy` after teardown.
     * @param {{ sender: import('../reactives/ReactiveItem.js').ReactiveItem, recipients: Set<import('../reactives/ReactiveItem.js').ReactiveItem> }} [ctx]
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
        this.context.emitPlugin('onDestroy', this.reactiveItem);
    }

    /**
     * Clears all pending updates.
     */
    clearUpdates() {
        this.#updateTracker.clearUpdates();
    }

    /**
     * @returns {boolean}
     */
    hasUpdates() {
        return this.#updateTracker.hasUpdates();
    }

    /**
     * @returns {boolean}
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
     * @param {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} newDeps
     */
    updateDependencies(newDeps) {
        this.#graph.updateDependencies(newDeps);
    }

    /**
     * @throws {Error} If destroyed or in subscribers mode.
     */
    prepareSetValue() {
        if (this.isDestroyed) {
            throw new Error('The reactive item has been destroyed');
        }
        if (this.context.modeController.subscribersMode) {
            throw new Error('Cannot set value while subscribers are running');
        }
    }

    /**
     * Called after a value change to schedule notifications.
     */
    valueChangedCallback() {
        if (this.suppressNotifications) {
            return;
        }
        this.context.changedItemsController.addItem(this.reactiveItem);
    }

    /**
     * @param {string} property
     * @param {any} oldValue
     * @param {any} newValue
     * @returns {boolean}
     */
    isEffectiveChangeWithOld(property, oldValue, newValue) {
        return this.#updateTracker.isEffectiveChange(property, oldValue, newValue, this.compareFn);
    }
}
