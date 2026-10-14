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
 *
 * The public surface of this class is intentionally narrow: only the
 * fields an ecosystem package (DevTools, diagnostics, structural sharing)
 * needs to inspect. Everything else is marked `@internal` and is not part
 * of the supported API.
 *
 * @public
 */
export class Engine {
    /**
     * The context this engine belongs to. Captured once at construction and
     * never changes.
     * @type {import('./context.js').Store2Context}
     */
    context;

    /**
     * The set of items this engine depends on. Populated by `Computed`
     * during dependency collection and by explicit `addDependency` calls.
     * @type {Set<import('../reactives/ReactiveItem.js').ReactiveItem>}
     */
    dependencies = new Set();

    /**
     * The set of items that depend on this engine's reactive item. Maintained
     * in sync with each dependency's `dependencies` set.
     * @type {Set<import('../reactives/ReactiveItem.js').ReactiveItem>}
     */
    dependents = new Set();

    /**
     * Monotonic numeric id, assigned by the owning context's id service.
     * Used for deterministic ordering of subscriber notifications.
     * @type {number}
     */
    id;

    /**
     * Monotonic version counter, bumped on every effective change.
     * @type {number}
     */
    version = 0;

    /**
     * The reactive item this engine drives.
     * @type {import('../reactives/ReactiveItem.js').ReactiveItem}
     */
    reactiveItem;

    /**
     * Set to `true` when a dependency has notified a change and the
     * computed value must be recalculated on the next read.
     * @type {boolean}
     */
    shouldRecalc = false;

    /**
     * Set to `true` after `destroy()` completes. Subsequent reads and
     * writes throw.
     * @type {boolean}
     */
    isDestroyed = false;

    /**
     * Pending updates, keyed by property path. Read by plugins via
     * `onSubscriberRun` and by `Store` to build notification payloads.
     * @type {Map<string, import('./UpdateDataRecord.js').UpdateDataRecord>}
     */
    updates = new Map();

    /** @type {Error | null} */
    #error = null;

    /**
     * Manages change subscriptions and lifecycle hooks for the reactive
     * item.
     *
     * @internal
     * @type {SubscribeController}
     */
    subscribeController;

    /**
     * The numeric type tag of the reactive item.
     * @type {import('../types.js').ReactiveItemType}
     */
    type;

    /**
     * Custom equality function, set by the reactive item at construction.
     *
     * @internal
     * @type {import('../types.js').CompareFunction | null}
     */
    compareFn = null;

    /**
     * When `true`, `valueChangedCallback` skips scheduling notifications.
     * Used internally by `Collection` and `ShallowReactive` during bulk
     * updates.
     *
     * @internal
     * @type {boolean}
     */
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

        this.context.registerItem(this.reactiveItem);

        this.#graph = new DependencyGraph(this.dependencies, this.dependents, reactiveItem);
        this.#updateTracker = new UpdateTracker(this.updates, reactiveItem, this);
        this.#messageHandler = new MessageHandler();
        this.subscribeController = new SubscribeController(this.reactiveItem);
    }

    /**
     * Returns the last error produced by this engine, or `null`.
     *
     * For `Computed`, this is the error thrown during the most recent
     * evaluation. The error is preserved until a dependency changes.
     *
     * @type {Error | null}
     */
    get error() {
        return this.#error;
    }

    /**
     * Records a change attempt and emits `onUpdate` when the change is
     * effective.
     *
     * @internal
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
     * Adds a single dependency to this engine's dependency set.
     *
     * Unlike `addDependencies`, this does not register the reverse link on
     * the dependency — use it only when the reverse link has been set up
     * elsewhere or when you know what you are doing.
     *
     * @internal
     * @param {import('../reactives/ReactiveItem.js').ReactiveItem} dependency
     */
    addDependency(dependency) {
        this.#graph.addDependency(dependency);
    }

    /**
     * Adds multiple dependencies, sorted by id, and registers this engine
     * as a dependent on each.
     *
     * Used by `Computed` during dependency collection.
     *
     * @internal
     * @param {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} dependencies
     */
    addDependencies(dependencies) {
        this.#graph.addDependencies(dependencies);
    }

    /**
     * Registers `dependent` as depending on this engine's reactive item.
     *
     * Returns `true` if the dependent was newly added, `false` if it was
     * already present or if the engine is destroyed.
     *
     * @internal
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
     * Removes `dependent` from this engine's dependents set.
     *
     * Called when a dependent is destroyed or when it stops depending on
     * this item (for example, after a `Computed` recalculates and drops
     * a conditional dependency).
     *
     * @internal
     * @param {import('../reactives/ReactiveItem.js').ReactiveItem} dependent
     */
    removeDependent(dependent) {
        this.#graph.removeDependent(dependent);
    }

    /**
     * Returns all transitive dependents of this engine's reactive item.
     *
     * The traversal is cycle-safe: a visited set prevents infinite loops
     * on graphs where computed items mutually depend on each other.
     *
     * @internal
     * @returns {Set<import('../reactives/ReactiveItem.js').ReactiveItem>}
     */
    getDeepDependents() {
        return this.#graph.getDeepDependents();
    }

    /**
     * Returns transitive dependents as an array, sorted by engine id.
     *
     * Sorting by id makes the order deterministic across runs, which the
     * `ChangedItemsController` relies on when it recalculates stale
     * computed values.
     *
     * @internal
     * @returns {Array<import('../reactives/ReactiveItem.js').ReactiveItem>}
     */
    getDeepDependentsArray() {
        return this.#graph.getDeepDependentsArray();
    }

    /**
     * Propagates a message to all direct dependents.
     *
     * A fresh `{ sender, recipients }` context is created when none is
     * supplied; recipients accumulated during the traversal are attached to
     * that context.
     *
     * @internal
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
     * Propagates a message to all direct dependencies.
     *
     * Used mainly to announce that this engine's item has been destroyed,
     * so that each dependency can drop its back-reference.
     *
     * @internal
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
     * Handles an incoming message from a dependency or dependent.
     *
     * Wires the stateless `MessageHandler` to this engine's mutable state
     * (error, `shouldRecalc`) and to the callbacks that forward messages
     * downstream. The handler itself performs no I/O — it dispatches on
     * the message code and calls back into the engine.
     *
     * @internal
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
     *
     * Called by `Computed` when its derivation function throws. Dependents
     * receive a `HAS_ERROR` message and can propagate the error further
     * downstream.
     *
     * @internal
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
     *
     * Called at the start of a recomputation — a successful recalculation
     * removes any error left by a previous failed evaluation.
     *
     * @internal
     */
    clearError() {
        this.#error = null;
    }

    /**
     * Destroys the engine. Emits `onDestroy` after teardown.
     *
     * Notifies dependents and dependencies that this item is going away,
     * clears the graph and pending updates, disposes the subscription
     * controller, emits the `onDestroy` plugin hook, and removes the item
     * from its context's registry.
     *
     * Idempotent — subsequent calls are no-ops.
     *
     * @internal
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
        this.context.unregisterItem(this.reactiveItem);
    }

    /**
     * Clears all pending updates.
     *
     * Called at the end of each subscriber notification round and during
     * teardown. Also resets the batch snapshot used for `checkChangesTemporary`.
     *
     * @internal
     */
    clearUpdates() {
        this.#updateTracker.clearUpdates();
    }

    /**
     * Returns `true` if there are pending (uncommitted) updates.
     *
     * @internal
     * @returns {boolean}
     */
    hasUpdates() {
        return this.#updateTracker.hasUpdates();
    }

    /**
     * In batch mode, drops updates for properties that reverted to their
     * original values and returns whether any effective changes remain.
     *
     * Called by `ChangedItemsController` after a batch closes. Outside
     * batch mode, this delegates to `hasUpdates` because no snapshot was
     * taken.
     *
     * @internal
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
     * Replaces the engine's dependency set with `newDeps`.
     *
     * Updates both the graph and the reverse links on each dependency:
     * dependencies no longer needed have this engine removed from their
     * `dependents`; new dependencies have it added.
     *
     * Used by `Computed` after each recalculation to keep the dependency
     * graph in sync with conditional reads.
     *
     * @internal
     * @param {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} newDeps
     */
    updateDependencies(newDeps) {
        this.#graph.updateDependencies(newDeps);
    }

    /**
     * Checks that the engine is in a state where a value may be written.
     *
     * Throws if the item has been destroyed or if subscribers are
     * currently running — writing to a reactive item from inside a
     * subscriber would re-enter the notification loop and is forbidden.
     * Use `runInAction()` to defer such writes.
     *
     * @internal
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
     *
     * Registers the item with the context's changed-items controller,
     * which either runs subscribers immediately (outside a batch) or
     * defers them to the end of the batch.
     *
     * No-op when `suppressNotifications` is set, used by `Collection` and
     * `ShallowReactive` during bulk updates.
     *
     * @internal
     */
    valueChangedCallback() {
        if (this.suppressNotifications) {
            return;
        }
        this.context.changedItemsController.addItem(this.reactiveItem);
    }

    /**
     * Returns `true` if the change from `oldValue` to `newValue` on
     * `property` is effective.
     *
     * In batch mode, effective means "differs from the value recorded at
     * the start of the batch", which catches reverted writes. Outside a
     * batch, it falls back to plain `oldValue !== newValue` comparison.
     *
     * @internal
     * @param {string} property
     * @param {any} oldValue
     * @param {any} newValue
     * @returns {boolean}
     */
    isEffectiveChangeWithOld(property, oldValue, newValue) {
        return this.#updateTracker.isEffectiveChange(property, oldValue, newValue, this.compareFn);
    }
}
