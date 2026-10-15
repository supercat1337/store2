// @ts-check

import { IdService, idService as defaultIdService } from '../services/idService.js';
import {
    ModeControllerService,
    modeController as defaultModeController,
} from '../services/modeController.js';
import {
    Tracker,
    dependencyTracker as defaultDependencyTracker,
} from '../services/dependencyTracker.js';
import {
    ChangedItemsController,
    changedItemsController as defaultChangedItemsController,
} from '../services/changedItemsController.js';
import { getError } from '../helpers/tools.js';

/** Current snapshot format version. */
const SNAPSHOT_VERSION = 1;

/**
 * Plugin API version. Bumped whenever the plugin hook contract changes in
 * a way that existing plugins cannot survive unchanged. Plugins that
 * declare an `apiVersion` are rejected if it does not match.
 */
const PLUGIN_API_VERSION = 1;

/**
 * Minimal structural type for `AsyncLocalStorage` so we don't depend on
 * `@types/node`. Only the two methods the context actually uses are
 * declared.
 *
 * @template T
 * @typedef {{
 *   run: <R>(store: T, callback: () => R) => R;
 *   getStore: () => T | undefined;
 * }} AsyncLocalStorageLike
 */

/**
 * AsyncLocalStorage instance, or `null` when unavailable.
 *
 * Node 22.3+ exposes `process.getBuiltinModule`, which allows synchronous
 * access to built-in modules from ESM. On older runtimes and in browsers
 * we fall back to a module-level variable, which loses the context after
 * the first `await`.
 *
 * @type {AsyncLocalStorageLike<Store2Context> | null}
 */
let asyncLocalStorage = null;
try {
    const proc = /** @type {any} */ (globalThis).process;
    if (proc && typeof proc.getBuiltinModule === 'function') {
        const mod = proc.getBuiltinModule('node:async_hooks');
        if (mod && typeof mod.AsyncLocalStorage === 'function') {
            asyncLocalStorage = new mod.AsyncLocalStorage();
        }
    }
} catch {
    /* c8 ignore next 2 */
    asyncLocalStorage = null;
}

/**
 * A Store2 context owns the per-root services that drive reactivity and
 * tracks the roots (stores, lists) it should snapshot and hydrate.
 */
class Store2Context {
    /** @type {IdService} */
    idService;

    /** @type {ModeControllerService} */
    modeController;

    /** @type {Tracker} */
    dependencyTracker;

    /** @type {ChangedItemsController} */
    changedItemsController;

    /** @type {string} */
    name;

    /** @type {Array<import('../types.js').Store2Plugin>} */
    #plugins = [];

    /** @type {Array<import('../types.js').ActionMiddleware>} */
    #middlewares = [];

    /** @type {Map<string, import('../types.js').SnapshotRoot>} */
    #roots = new Map();

    /** @type {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} */
    #items = new Set();

    /** @type {Map<number, import('../types.js').SnapshotMigration>} */
    #migrations = new Map();

    /**
     * Unsubscribe functions for every listener this context registered
     * with its mode controller. Called during `dispose()` so that a
     * disposed context does not keep a reference to its own internal
     * closures through the controller's listener lists — otherwise the
     * context cannot be garbage-collected, and cloning the controller
     * (e.g. by AVA when serialising a failed test) throws on the
     * function references.
     *
     * @type {Array<() => void>}
     */
    #modeControllerUnsubscribers = [];

    /** @type {boolean} */
    #pluginsSuspended = false;

    /** @type {boolean} */
    #disposed = false;

    /**
     * @param {object} [options]
     * @param {string} [options.name]
     * @param {IdService} [options.idService]
     * @param {ModeControllerService} [options.modeController]
     * @param {Tracker} [options.dependencyTracker]
     * @param {ChangedItemsController} [options.changedItemsController]
     */
    constructor(options = {}) {
        this.name = options.name || 'store2';

        this.idService = options.idService || new IdService();
        this.modeController = options.modeController || new ModeControllerService();
        this.dependencyTracker = options.dependencyTracker || new Tracker(this.modeController);

        if (options.changedItemsController) {
            this.changedItemsController = options.changedItemsController;
        } else {
            this.changedItemsController = new ChangedItemsController(this.modeController);
            this.#modeControllerUnsubscribers.push(
                this.modeController.on('beforeBatchModeEnd', () => {
                    this.changedItemsController.runSubscribers();
                    this.changedItemsController.clear();
                })
            );
        }

        this.#modeControllerUnsubscribers.push(
            this.modeController.on('batchModeStart', () => {
                this.emitPlugin('onBatchStart', {
                    depth: this.modeController.batchDepth,
                    name: this.modeController.currentBatchName,
                    action: this.modeController.currentAction,
                });
            })
        );

        this.#modeControllerUnsubscribers.push(
            this.modeController.on('batchModeEnd', () => {
                this.emitPlugin('onBatchEnd', {
                    depth: this.modeController.batchDepth,
                    name: this.modeController.currentBatchName,
                    action: this.modeController.currentAction,
                });
            })
        );

        this.#modeControllerUnsubscribers.push(
            this.modeController.onAction('actionStart', action => {
                this.emitPlugin('onActionStart', action);
            })
        );

        this.#modeControllerUnsubscribers.push(
            this.modeController.onAction('actionEnd', action => {
                this.emitPlugin('onActionEnd', action);
            })
        );
    }

    /**
     * Installs a plugin into this context.
     * @param {import('../types.js').Store2Plugin} plugin
     * @returns {this}
     */
    use(plugin) {
        if (this.#disposed) {
            throw new Error('Context has been disposed');
        }
        if (!plugin || typeof plugin.install !== 'function') {
            throw new Error('Plugin must implement install(context)');
        }
        if (plugin.apiVersion !== undefined && plugin.apiVersion !== PLUGIN_API_VERSION) {
            throw new Error(
                `Plugin "${plugin.name}" targets API v${plugin.apiVersion}, ` +
                    `core is v${PLUGIN_API_VERSION}`
            );
        }
        plugin.install(this);
        this.#plugins.push(plugin);
        return this;
    }

    /**
     * Registers an action middleware.
     * @param {import('../types.js').ActionMiddleware} middleware
     * @returns {this}
     */
    addMiddleware(middleware) {
        if (this.#disposed) {
            throw new Error('Context has been disposed');
        }
        this.#middlewares.push(middleware);
        return this;
    }

    /**
     * Registers a root for snapshot/hydrate. The root must implement
     * `serialize()` and `hydrate(data)`.
     * @param {string} name
     * @param {import('../types.js').SnapshotRoot} root
     * @returns {this}
     */
    registerRoot(name, root) {
        if (this.#disposed) {
            throw new Error('Context has been disposed');
        }
        if (!root || typeof root.serialize !== 'function' || typeof root.hydrate !== 'function') {
            throw new Error('Root must implement serialize() and hydrate(data)');
        }
        this.#roots.set(name, root);
        return this;
    }

    /**
     * Unregisters a previously registered root.
     * @param {string} name
     * @returns {boolean}
     */
    unregisterRoot(name) {
        return this.#roots.delete(name);
    }

    /**
     * Registers a snapshot migration. Only one migration per `from`
     * version is allowed — a second registration for the same `from`
     * overwrites the first.
     *
     * @param {import('../types.js').SnapshotMigration} migration
     * @returns {this}
     */
    registerMigration(migration) {
        if (this.#disposed) {
            throw new Error('Context has been disposed');
        }
        if (!migration || typeof migration.migrate !== 'function') {
            throw new Error('Migration must implement migrate(snapshot)');
        }
        if (typeof migration.from !== 'number' || typeof migration.to !== 'number') {
            throw new Error('Migration must declare numeric from/to versions');
        }
        this.#migrations.set(migration.from, migration);
        return this;
    }

    /**
     * Returns the root registered under `name`, or `null` if it is not
     * registered.
     *
     * Persistence adapters and SSR transports use this to inspect or
     * serialize individual roots.
     *
     * @param {string} name
     * @returns {import('../types.js').SnapshotRoot | null}
     */
    getRoot(name) {
        return this.#roots.get(name) ?? null;
    }

    /**
     * Returns the names of all roots currently registered with
     * `registerRoot()`.
     *
     * @returns {Array<string>}
     */
    getRootNames() {
        return Array.from(this.#roots.keys());
    }

    /**
     * Returns a copy of the plugins installed via `use()`.
     *
     * @returns {Array<import('../types.js').Store2Plugin>}
     */
    get plugins() {
        return [...this.#plugins];
    }

    /**
     * Returns a copy of the middleware chain installed via
     * `addMiddleware()`.
     *
     * @returns {Array<import('../types.js').ActionMiddleware>}
     */
    get middlewares() {
        return [...this.#middlewares];
    }

    /**
     * Subscribes a callback invoked after every round of change
     * propagation that ran subscribers.
     *
     * Persistence adapters use this as a "state is dirty, consider
     * saving" hook without having to install a full plugin.
     *
     * @param {() => void} callback
     * @returns {() => void} An unsubscribe function.
     */
    onAnyUpdate(callback) {
        if (this.#disposed) {
            throw new Error('Context has been disposed');
        }
        return this.modeController.on('subscribersModeEnd', () => {
            callback();
        });
    }

    /**
     * Registers a reactive item with this context. Called by `Engine` at
     * construction. Idempotent — registering the same item twice is a
     * no-op.
     *
     * This registry is what powers `dumpGraph()` and any future
     * context-wide diagnostics. It is not exposed as a public API for
     * iteration; use `dumpGraph()` if you need to enumerate items.
     *
     * @param {import('../reactives/ReactiveItem.js').ReactiveItem} item
     */
    registerItem(item) {
        if (this.#disposed) {
            return;
        }
        this.#items.add(item);
    }

    /**
     * Removes a reactive item from this context's registry. Called by
     * `Engine.destroy()`.
     *
     * @param {import('../reactives/ReactiveItem.js').ReactiveItem} item
     */
    unregisterItem(item) {
        this.#items.delete(item);
    }

    /**
     * Returns a serializable snapshot of the dependency graph for every
     * live reactive item registered with this context.
     *
     * Edges are directed: `{ from: A, to: B, kind: 'dep' }` means A
     * depends on B. Each dependency relation appears exactly once,
     * derived from the source item's `dependencies` set.
     *
     * Items whose `isDestroyed` is `true` are skipped.
     *
     * @returns {import('../types.js').GraphDump}
     */
    dumpGraph() {
        if (this.#disposed) {
            throw new Error('Context has been disposed');
        }

        /** @type {import('../types.js').GraphDumpItem[]} */
        const items = [];

        /** @type {import('../types.js').GraphDumpEdge[]} */
        const edges = [];

        for (const item of this.#items) {
            if (item.isDestroyed) {
                continue;
            }

            items.push({
                id: item.engine.id,
                name: item.name || '',
                type: item.engine.type,
                version: item.engine.version,
            });

            for (const dep of item.engine.dependencies) {
                if (dep.isDestroyed) {
                    continue;
                }
                edges.push({
                    from: item.engine.id,
                    to: dep.engine.id,
                    kind: 'dep',
                });
            }
        }

        return { items, edges };
    }

    /**
     * Invokes a lifecycle hook on every installed plugin. Plugin errors are
     * caught and logged. When plugins are suspended (e.g. during time-travel),
     * calls are ignored.
     *
     * @param {string} hook
     * @param {...any} args
     */
    emitPlugin(hook, ...args) {
        if (this.#pluginsSuspended) {
            return;
        }
        this.emitPluginDirect(hook, ...args);
    }

    /**
     * Same as `emitPlugin`, but ignores the suspension flag. Used for
     * hooks that must fire regardless of time-travel state — notably
     * `onHydrateStart` / `onHydrateEnd`, which persistence adapters rely
     * on to observe every hydration.
     *
     * @param {string} hook
     * @param {...any} args
     */
    emitPluginDirect(hook, ...args) {
        for (const plugin of this.#plugins) {
            const fn = /** @type {any} */ (plugin)[hook];
            if (typeof fn === 'function') {
                try {
                    fn.apply(plugin, args);
                } catch (e) {
                    console.error(`[store2] plugin "${plugin.name}" threw in ${hook}:`, e);
                }
            }
        }
    }

    /**
     * Runs `fn` inside a batch. Supports two signatures:
     *
     *     ctx.batch(() => { ... })
     *     ctx.batch('update todos', () => { ... })
     *
     * @param {string | Function} nameOrFn
     * @param {Function} [fn]
     * @returns {any}
     */
    batch(nameOrFn, fn) {
        const callback = typeof nameOrFn === 'function' ? nameOrFn : fn;
        const name = typeof nameOrFn === 'string' ? nameOrFn : '';
        if (typeof callback !== 'function') {
            throw new Error('batch() requires a function to run');
        }
        this.modeController.enterBatch(name);
        try {
            return callback();
        } finally {
            this.modeController.exitBatch();
        }
    }

    /**
     * Runs `fn` as a named action. Supports async bodies and middleware.
     *
     * The action body is executed inside `runWithContext(this, ...)` so
     * that reactive items created synchronously inside the body bind to
     * this context. On runtimes with `AsyncLocalStorage`, the binding
     * survives `await` boundaries — the correct behaviour for SSR.
     *
     * @param {string} name
     * @param {(action: import('../types.js').ActionInfo) => any} fn
     * @param {any} [payload]
     * @returns {Promise<any>}
     */
    async action(name, fn, payload = undefined) {
        return runWithContext(this, async () => {
            const action = this.modeController.beginAction(name, payload);

            let index = -1;

            /**
             * @param {number} i
             * @returns {Promise<any>}
             */
            const dispatch = async i => {
                if (i <= index) {
                    throw new Error('next() called multiple times');
                }
                index = i;
                const middleware = this.#middlewares[i];
                if (!middleware) {
                    return fn(action);
                }
                return middleware(action, () => dispatch(i + 1));
            };

            try {
                const result = await dispatch(0);
                this.modeController.endAction(action);
                return result;
            } catch (error) {
                this.modeController.endAction(action, getError(error));
                throw error;
            }
        });
    }

    /**
     * Flushes pending subscribers synchronously.
     *
     * Safe to call inside a batch — the batch snapshot is intentionally
     * consumed at that point. Framework adapters that expect a
     * `flushSync`-named method (e.g. React's `act()`) may call
     * `flushSync()` instead.
     */
    flush() {
        this.changedItemsController.runSubscribers();
        this.changedItemsController.clear();
    }

    /**
     * Semantic alias for `flush()`. Named to match framework conventions
     * (React `act`, Vue `nextTick`).
     */
    flushSync() {
        this.flush();
    }

    /**
     * Captures a serializable snapshot of every registered root.
     * @returns {import('../types.js').ContextSnapshot}
     */
    snapshot() {
        /** @type {{ [rootName: string]: any }} */
        const roots = {};
        for (const [name, root] of this.#roots) {
            roots[name] = root.serialize();
        }
        return {
            version: SNAPSHOT_VERSION,
            timestamp: Date.now(),
            roots,
        };
    }

    /**
     * Applies a snapshot to every registered root. The whole operation runs
     * in one batch.
     *
     * Before unpacking, the snapshot is migrated to the current format
     * version using migrations registered via `registerMigration()`. If a
     * migration is missing for the incoming version, `hydrate()` throws —
     * silently accepting an incompatible snapshot is worse than failing
     * loudly.
     *
     * When `timeTravel` is `true`, plugin hooks are suppressed for the
     * duration of the hydration so that a DevTools-style plugin does not
     * re-record the rehydration as a new action. `onHydrateStart` and
     * `onHydrateEnd` still fire — persistence adapters need to observe
     * every hydration, including time-travel rewinds.
     *
     * Roots present in the snapshot but not registered here are ignored.
     * Roots registered here but missing from the snapshot are left untouched.
     *
     * @param {import('../types.js').ContextSnapshot} snapshot
     * @param {{ timeTravel?: boolean }} [options]
     */
    hydrate(snapshot, options = {}) {
        if (!snapshot || typeof snapshot !== 'object' || !snapshot.roots) {
            throw new Error('hydrate() requires a snapshot object with a roots field');
        }

        const migrated = this.#applyMigrations(snapshot);
        const { timeTravel = false } = options;

        // Hydration hooks fire even during time-travel.
        this.emitPluginDirect('onHydrateStart', migrated, { timeTravel });

        const previousSuspended = this.#pluginsSuspended;
        if (timeTravel) {
            this.#pluginsSuspended = true;
        }

        this.modeController.enterBatch(timeTravel ? 'time-travel' : 'hydrate');
        try {
            for (const [name, data] of Object.entries(migrated.roots)) {
                const root = this.#roots.get(name);
                if (root) {
                    root.hydrate(data);
                }
            }
        } finally {
            this.modeController.exitBatch();
            if (timeTravel) {
                this.#pluginsSuspended = previousSuspended;
            }
        }

        this.emitPluginDirect('onHydrateEnd', migrated, { timeTravel });
    }

    /**
     * Returns a snapshot whose version matches `SNAPSHOT_VERSION`, applying
     * registered migrations in a loop.
     *
     * @param {import('../types.js').ContextSnapshot} snapshot
     * @returns {import('../types.js').ContextSnapshot}
     */
    #applyMigrations(snapshot) {
        let current = snapshot;
        let guard = 0;

        while (current.version !== SNAPSHOT_VERSION) {
            if (++guard > 100) {
                throw new Error('Snapshot migration chain exceeded 100 steps');
            }
            const migration = this.#migrations.get(current.version);
            if (!migration) {
                throw new Error(
                    `No migration registered from snapshot version ${current.version} ` +
                        `to ${SNAPSHOT_VERSION}`
                );
            }
            current = migration.migrate(current);
        }

        return current;
    }

    /**
     * Releases the context and forgets all installed plugins, roots,
     * migrations, and registered items.
     *
     * Also detaches every listener this context registered with its mode
     * controller. Without this step the controller's listener lists would
     * keep references to closures that capture `this`, preventing the
     * context from being garbage-collected — and, in structured-clone
     * scenarios (AVA workers, worker_threads), causing `DataCloneError`
     * on the function references.
     *
     * Idempotent — subsequent calls are no-ops.
     */
    dispose() {
        if (this.#disposed) {
            return;
        }
        this.#disposed = true;

        for (const unsubscribe of this.#modeControllerUnsubscribers) {
            try {
                unsubscribe();
            } catch (e) {
                console.error(e);
            }
        }
        this.#modeControllerUnsubscribers = [];

        this.#middlewares.length = 0;
        this.#plugins.length = 0;
        this.#roots.clear();
        this.#migrations.clear();
        this.#items.clear();
    }
}

/**
 * The default context adopts the process-wide service singletons so that
 * legacy code paths that import them directly continue to observe the same
 * state as the context-aware engine.
 */
const defaultContext = new Store2Context({
    name: 'default',
    idService: defaultIdService,
    modeController: defaultModeController,
    dependencyTracker: defaultDependencyTracker,
    changedItemsController: defaultChangedItemsController,
});

/** @type {Store2Context | null} */
let currentContext = null;

/**
 * Returns the currently installed context, or the default one.
 *
 * On runtimes with `AsyncLocalStorage`, returns the context associated
 * with the current async chain — safe to call from server-render
 * components after an `await`.
 *
 * @returns {Store2Context}
 */
function getCurrentContext() {
    if (asyncLocalStorage) {
        return asyncLocalStorage.getStore() || defaultContext;
    }
    return currentContext || defaultContext;
}

/**
 * Runs `fn` with `context` installed as the active context.
 *
 * On runtimes with `AsyncLocalStorage` (Node 22.3+), the context binding
 * survives `await` boundaries — a server-render function that awaits an
 * async operation will still see the correct context afterwards. On older
 * runtimes and in browsers, the binding only holds for the synchronous
 * execution of `fn`.
 *
 * @template T
 * @param {Store2Context} context
 * @param {() => T} fn
 * @returns {T}
 */
function runWithContext(context, fn) {
    if (asyncLocalStorage) {
        return asyncLocalStorage.run(context, fn);
    }

    /* c8 ignore next 8 */
    const previous = currentContext;
    currentContext = context;
    try {
        return fn();
    } finally {
        currentContext = previous;
    }
}

/**
 * Async-aware variant of `runWithContext`. On runtimes with
 * `AsyncLocalStorage`, behaves identically to `runWithContext` for async
 * functions. On runtimes without it, this is an explicit marker that the
 * caller expects context propagation across `await`, and will lose it
 * after the first `await` — the same limitation as `runWithContext`.
 *
 * @template T
 * @param {Store2Context} context
 * @param {() => Promise<T>} fn
 * @returns {Promise<T>}
 */
async function runWithContextAsync(context, fn) {
    return runWithContext(context, fn);
}

/**
 * Creates a new isolated context.
 * @param {object} [options]
 * @returns {Store2Context}
 */
function createStore2Context(options = {}) {
    return new Store2Context(options);
}

export {
    SNAPSHOT_VERSION,
    PLUGIN_API_VERSION,
    Store2Context,
    defaultContext,
    getCurrentContext,
    runWithContext,
    runWithContextAsync,
    createStore2Context,
};
