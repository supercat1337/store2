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
            this.modeController.on('beforeBatchModeEnd', () => {
                this.changedItemsController.runSubscribers();
                this.changedItemsController.clear();
            });
        }

        this.modeController.on('batchModeStart', () => {
            this.emitPlugin('onBatchStart', {
                depth: this.modeController.batchDepth,
                name: this.modeController.currentBatchName,
                action: this.modeController.currentAction,
            });
        });
        this.modeController.on('batchModeEnd', () => {
            this.emitPlugin('onBatchEnd', {
                depth: this.modeController.batchDepth,
                name: this.modeController.currentBatchName,
                action: this.modeController.currentAction,
            });
        });
        this.modeController.onAction('actionStart', action => {
            this.emitPlugin('onActionStart', action);
        });
        this.modeController.onAction('actionEnd', action => {
            this.emitPlugin('onActionEnd', action);
        });
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
     * Returns the names of all roots currently registered with registerRoot()
     * 
     * @returns {Array<string>}
     */
    getRootNames() {
        return Array.from(this.#roots.keys());
    }

    /**
     * Returns a copy of the plugins installed via use().
     * 
     * @returns {Array<import('../types.js').Store2Plugin>}
     */
    get plugins() {
        return [...this.#plugins];
    }

    /**
     * Returns a copy of the middleware chain installed via addMiddleware()
     * 
     * @returns {Array<import('../types.js').ActionMiddleware>}
     */
    get middlewares() {
        return [...this.#middlewares];
    }

    /**
     * Invokes a lifecycle hook on every installed plugin. Plugin errors are
     * caught and logged. When plugins are suspended (e.g. during time-travel),
     * calls are ignored.
     * @param {string} hook
     * @param {...any} args
     */
    emitPlugin(hook, ...args) {
        if (this.#pluginsSuspended) {
            return;
        }
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
     * @param {string} name
     * @param {(action: import('../types.js').ActionInfo) => any} fn
     * @param {any} [payload]
     * @returns {Promise<any>}
     */
    async action(name, fn, payload = undefined) {
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
    }

    /**
     * Flushes pending subscribers synchronously.
     */
    flush() {
        this.changedItemsController.runSubscribers();
        this.changedItemsController.clear();
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
     * When `timeTravel` is `true`, plugin hooks are suppressed for the
     * duration of the hydration so that a DevTools-style plugin does not
     * re-record the rehydration as a new action. Subscribers still run so
     * the UI updates.
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

        const { timeTravel = false } = options;
        const previousSuspended = this.#pluginsSuspended;

        if (timeTravel) {
            this.#pluginsSuspended = true;
        }

        this.modeController.enterBatch(timeTravel ? 'time-travel' : 'hydrate');
        try {
            for (const [name, data] of Object.entries(snapshot.roots)) {
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
    }

    /**
     * Releases the context and forgets all installed plugins and roots.
     */
    dispose() {
        if (this.#disposed) {
            return;
        }
        this.#disposed = true;
        this.#middlewares.length = 0;
        this.#plugins.length = 0;
        this.#roots.clear();
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
 * @returns {Store2Context}
 */
function getCurrentContext() {
    return currentContext || defaultContext;
}

/**
 * Runs `fn` with `context` installed as the active context.
 * @template T
 * @param {Store2Context} context
 * @param {() => T} fn
 * @returns {T}
 */
function runWithContext(context, fn) {
    const previous = currentContext;
    currentContext = context;
    try {
        return fn();
    } finally {
        currentContext = previous;
    }
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
    Store2Context,
    defaultContext,
    getCurrentContext,
    runWithContext,
    createStore2Context,
};
