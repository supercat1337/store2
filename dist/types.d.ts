/**
 * A lightweight, efficient, and easy-to-use reactive state management
 * system for JavaScript.
 *
 * Zero runtime dependencies beyond a tiny event emitter. Provides atoms,
 * computed values, collections, shallow reactive objects, stores, and a
 * context/plugin system for building ecosystem packages.
 *
 * @packageDocumentation
 */

import { EventEmitterLite } from '@supercat1337/event-emitter';

/**
 * Runs `fn` as a named, optionally asynchronous action. Middleware installed
 * on the current context is applied around the body.
 *
 * @param {string} name
 * @param {(action: import('../types.js').ActionInfo) => any} fn
 * @param {any} [payload]
 * @returns {Promise<any>}
 */
export declare function action(name: string, fn: (action: ActionInfo) => any, payload?: any): Promise<any>;

/**
 * Metadata about a single logical user action.
 *
 * Actions are the unit of work that DevTools, loggers, and time-travel
 * plugins reason about. An `ActionInfo` is created by
 * `Store2Context.action()` and passed to middleware and lifecycle hooks.
 *
 * @public
 */
export declare interface ActionInfo {
    /**
     * Unique identifier, monotonic within the owning context.
     */
    id: string;
    /**
     * Human-readable action name, e.g. `"add todo"`.
     */
    name: string;
    /**
     * Optional payload passed to `action()`.
     */
    payload: any;
    /**
     * Id of the enclosing action when actions are nested, or `null` for
     * top-level actions.
     */
    parentId: string | null;
    /**
     * Wall-clock timestamp (milliseconds since epoch) when the action
     * started.
     */
    startTime: number;
    /**
     * Wall-clock timestamp when the action finished, or `null` while the
     * action body is still running.
     */
    endTime: number | null;
    /**
     * Error thrown by the action body, or `null` on success.
     */
    error: Error | null;
}

/**
 * Middleware invoked for every action. Must call `next()` to continue the
 * chain. Returning without calling `next()` short-circuits the action.
 *
 * @public
 */
export declare type ActionMiddleware = (action: ActionInfo, next: () => Promise<any>) => Promise<any>;

/**
 * Atom is a reactive item that holds a single value.
 *
 * It is the base unit of reactive state — a single mutable cell. Reads
 * inside a tracked scope (a `Computed` body, an `autorun`, or a `reaction`)
 * register a dependency; writes schedule a change notification.
 *
 * Objects assigned to an Atom are shallow-cloned, so mutating nested
 * properties does not trigger reactivity. Use `Collection` or
 * `ShallowReactive` for structures that need deep updates.
 *
 * @augments ReactiveItem
 * @template T
 * @public
 */
export declare class Atom<T> extends ReactiveItem {
    /**
     * Creates a new Atom with the given initial value.
     *
     * @param {T} value - The initial value.
     * @param {object} [options]
     * @param {string} [options.name] - Debug name used in error messages.
     * @param {((a: T, b: T) => boolean) | null} [options.compareFunction] - Custom equality function. Defaults to shallow comparison.
     */
    constructor(value: T, options?: {
        name?: string;
        compareFunction?: ((a: T, b: T) => boolean) | null;
    });
    set value(value: T);
    /**
     * The current value.
     *
     * Reading this property inside a tracked scope registers a dependency.
     * Writing it schedules a change if the new value differs from the
     * current one.
     *
     * @returns {T}
     */
    get value(): T;
    /**
     * Returns the current value.
     *
     * When `options.untracked` is `false` (the default), registers this
     * atom as a dependency of the enclosing tracked scope. Pass
     * `{ untracked: true }` to read without creating a dependency.
     *
     * @param {{ untracked?: boolean }} [options]
     * @returns {T}
     */
    getValue(options?: {
        untracked?: boolean;
    }): T;
    /**
     * Returns the current value without registering a dependency.
     *
     * Shorthand for `getValue({ untracked: true })`. Useful when you need
     * to peek at an atom inside a `Computed` or `autorun` without making it
     * re-run when the atom changes.
     *
     * @returns {T}
     */
    get valueUntracked(): T;
    #private;
}

/**
 * Creates a new reactive Atom holding the given value.
 *
 * An Atom is the base unit of reactive state — a single mutable cell. Reads
 * inside tracked contexts register a dependency; writes schedule a change.
 *
 * @template T
 * @param {T} value
 * @param {object} [options]
 * @param {string} [options.name]
 * @param {(a: T, b: T) => boolean} [options.compareFunction]
 * @returns {Atom<T>}
 */
export declare function atom<T>(value: T, options?: {
    name?: string;
    compareFunction?: (a: T, b: T) => boolean;
}): Atom<T>;

/**
 * Autorun – runs the effect immediately and re-runs it on any dependency
 * change.
 *
 * @param {() => void} fn
 * @param {object} [options]
 * @param {string} [options.name]
 * @param {number} [options.delay]
 * @param {AbortSignal} [options.signal]
 * @param {Function} [options.onError]
 * @param {boolean} [options.recomputeDependencies=true]
 * @returns {() => void}
 */
export declare function autorun(fn: () => void, options?: {
    name?: string;
    delay?: number;
    signal?: AbortSignal;
    onError?: Function;
    recomputeDependencies?: boolean;
}): () => void;

/**
 * Groups multiple updates into a single notification round.
 *
 *     batch(() => { ... })
 *     batch('update todos', () => { ... })
 *
 * @param {string | Function} nameOrFn
 * @param {Function} [fn]
 * @returns {any}
 */
export declare function batch(nameOrFn: string | Function, fn?: Function): any;

/**
 * Metadata about a batch scope. Emitted to plugins via `onBatchStart` and
 * `onBatchEnd`.
 *
 * @public
 */
export declare interface BatchInfo {
    /**
     * Nesting depth of the batch at the moment of emission. The outermost
     * batch has depth `1`.
     */
    depth: number;
    /**
     * Name passed to `context.batch(name, fn)`, or `''` for unnamed
     * batches.
     */
    name: string;
    /**
     * The action currently running, if the batch is nested inside one, or
     * `null`.
     */
    action: ActionInfo | null;
}

/**
 * Coordinates notification of changed reactive items: collects them,
 * recalculates stale computed values in a deterministic order, and invokes
 * subscribers.
 *
 * One instance per `Store2Context`. The class receives the owning
 * `ModeControllerService` in its constructor so that batching and subscriber
 * modes can be controlled independently for each context.
 */
export declare class ChangedItemsController {
    /**
     * @param {import('../services/modeController.js').ModeControllerService} modeController
     */
    constructor(modeController: ModeControllerService);
    /** @type {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} */
    items: Set<ReactiveItem>;
    /**
     * Marks an item as changed. Outside a batch, immediately runs subscribers
     * and clears the pending set.
     * @param {import('../reactives/ReactiveItem.js').ReactiveItem} item
     */
    addItem(item: ReactiveItem): void;
    /**
     * Removes an item from the pending set.
     * @param {import('../reactives/ReactiveItem.js').ReactiveItem} item
     */
    removeItem(item: ReactiveItem): void;
    /**
     * Clears the pending set.
     */
    clear(): void;
    /**
     * Runs all pending subscribers.
     *
     * The outer loop re-checks `this.items` after each notification round so
     * that updates added during subscriber execution (e.g. via `runInAction`)
     * are processed in the same call.
     */
    runSubscribers(): void;
    #private;
}

/**
 * Clones an object shallowly.
 * @template T
 * @param {T} obj
 * @returns {T}
 */
export declare function clone<T>(obj: T): T;

/**
 * Collection is a reactive item that holds an array of values.
 *
 * Array mutations (`push`, `pop`, `splice`, index assignment) trigger
 * reactivity. The `.value` property returns a Proxy — direct mutations
 * through it are tracked. The underlying raw array is available via
 * `getRawValue()` but bypassing the proxy disables reactivity.
 *
 * @augments ReactiveItem
 * @template T
 * @public
 */
export declare class Collection<T> extends ReactiveItem {
    /**
     * Creates a new Collection wrapping the given array.
     *
     * The array is copied element-by-element; the caller's array reference
     * is not stored.
     *
     * @param {T[]} value - The initial array.
     * @param {object} [options]
     * @param {string} [options.name] - Debug name used in error messages.
     * @param {import('../types.js').CompareFunction | null} [options.compareFunction] - Custom equality function for element comparison.
     */
    constructor(value: T[], options?: {
        name?: string;
        compareFunction?: CompareFunction | null;
    });
    set value(value: T[]);
    /**
     * The proxied array.
     *
     * Reading this property registers a dependency. Mutating the returned
     * array — `push`, index assignment, `splice`, and so on — triggers a
     * reactive update.
     *
     * @returns {T[]}
     */
    get value(): T[];
    /**
     * Returns the proxied array.
     *
     * Mutations through the returned proxy are reactive. When
     * `options.untracked` is `false` (the default), registers this
     * collection as a dependency of the enclosing tracked scope.
     *
     * @param {{ untracked?: boolean }} [options]
     * @returns {T[]}
     */
    getValue(options?: {
        untracked?: boolean;
    }): T[];
    /**
     * Returns the underlying array without the proxy.
     *
     * Mutations on the returned array do not trigger reactivity. Use for
     * inspection, iteration, or passing to APIs that must receive a plain
     * array — not for state changes.
     *
     * @returns {T[]}
     */
    getRawValue(): T[];
    #private;
}

/**
 * Creates a new reactive Collection wrapping an array.
 *
 * Array mutations (`push`, `pop`, `splice`, index assignment) trigger
 * reactivity. The `.value` property returns a Proxy; direct mutations
 * through it are tracked.
 *
 * @template T
 * @param {T[]} value
 * @param {object} [options]
 * @param {string} [options.name]
 * @param {(a: T, b: T) => boolean} [options.compareFunction]
 * @returns {Collection<T>}
 */
export declare function collection<T>(value: T[], options?: {
    name?: string;
    compareFunction?: (a: T, b: T) => boolean;
}): Collection<T>;

/**
 * Checks if two values are equal.
 * @param {unknown} a
 * @param {unknown} b
 * @returns {boolean}
 */
export declare function compareAny(a: unknown, b: unknown): boolean;

/**
 * A function that compares two values for equality. Used by reactive items
 * to decide whether a mutation is effective.
 *
 * @public
 */
export declare type CompareFunction = (a: any, b: any) => boolean;

/**
 * Checks if two plain objects are equal.
 * @param {object} a
 * @param {object} b
 * @returns {boolean}
 */
export declare function comparePlainObjects(a: object, b: object): boolean;

/**
 * Computed is a reactive item whose value is derived from other reactive
 * sources.
 *
 * The function passed to the constructor runs once at construction time to
 * establish dependencies and compute the initial value. It runs again
 * whenever a dependency changes and the recomputed value differs from the
 * cached one. Because equality is checked before notifying subscribers, a
 * computed whose dependencies change but whose output stays the same does
 * not cause any downstream work.
 *
 * `Computed` is derived state and is never persisted — `serialize()`
 * returns `null`, and the value is recalculated from its dependencies on
 * hydration.
 *
 * @augments ReactiveItem
 * @template {unknown} T
 * @public
 */
export declare class Computed<T extends unknown> extends ReactiveItem {
    /**
     * Creates a new Computed.
     *
     * @param {() => T} fn - The derivation function. Must read at least one reactive value.
     * @param {object} [options]
     * @param {string} [options.name] - Debug name used in error messages.
     * @param {((a: T, b: T) => boolean) | null} [options.compareFunction] - Custom equality function. Defaults to shallow comparison.
     * @param {boolean} [options.smartRecompute] - When `true`, the value is recalculated only if the version of a dependency actually changed, avoiding recomputation when dependencies toggled back to their previous values within a batch.
     */
    constructor(fn: () => T, options?: {
        name?: string;
        compareFunction?: ((a: T, b: T) => boolean) | null;
        smartRecompute?: boolean;
    });
    /**
     * Read-only view of the options passed to the constructor. Currently
     * exposes `smartRecompute`.
     */
    options: {
        smartRecompute: boolean;
    };
    /**
     * Returns `true` if the cached value is out of date and a read would
     * trigger recalculation.
     *
     * A computed is stale if one of its dependencies notified a change, or
     * if its last evaluation threw an error.
     *
     * @returns {boolean}
     */
    isStale(): boolean;
    /**
     * Returns the computed value, recalculating first if any dependency
     * changed.
     *
     * When `options.untracked` is `false` (the default), registers this
     * computed as a dependency of the enclosing tracked scope. Pass
     * `{ untracked: true }` to read without creating a dependency.
     *
     * Throws if the derivation function throws, or if the item has been
     * destroyed.
     *
     * @param {{ untracked?: boolean }} [options]
     * @returns {T}
     */
    getValue(options?: {
        untracked?: boolean;
    }): T;
    /**
     * The computed value.
     *
     * Reading this property recalculates if a dependency changed and
     * registers a dependency in the enclosing tracked scope.
     *
     * @returns {T}
     */
    get value(): T;
    /**
     * Returns the last cached value without triggering recalculation.
     *
     * If the computed is stale, this returns the previous value — not a
     * fresh one. Useful for debugging and for reading without causing side
     * effects, but the value may be out of date.
     *
     * @returns {T}
     */
    peekValue(): T;
    /**
     * Returns the computed value without registering a dependency.
     *
     * Shorthand for `getValue({ untracked: true })`. The value is still
     * recalculated if stale — only dependency registration is skipped.
     *
     * @returns {T}
     */
    get valueUntracked(): T;
    /**
     * Always returns `null`. Computed items are derived state and are never
     * persisted — they are recalculated from their dependencies on
     * hydration.
     *
     * @returns {null}
     */
    serialize(): null;
    #private;
}

/**
 * Creates a new reactive Computed whose value is derived from other
 * reactive sources.
 *
 * The function passed as `fn` runs once at construction, then again
 * whenever one of its dependencies changes and the recomputed value
 * differs.
 *
 * @template T
 * @param {() => T} fn
 * @param {object} [options]
 * @param {string} [options.name]
 * @param {(a: T, b: T) => boolean} [options.compareFunction]
 * @param {boolean} [options.smartRecompute]
 * @returns {Computed<T>}
 */
export declare function computed<T>(fn: () => T, options?: {
    name?: string;
    compareFunction?: (a: T, b: T) => boolean;
    smartRecompute?: boolean;
}): Computed<T>;

/**
 * A serializable snapshot of an entire context.
 *
 * `roots` maps the name given at `registerRoot()` time to that root's own
 * `serialize()` output. The snapshot is JSON-safe by construction — every
 * `serialize()` implementation returns plain objects, arrays, and
 * primitives.
 *
 * @public
 */
export declare interface ContextSnapshot {
    /**
     * Snapshot format version. Currently `1`. Persistence adapters should
     * dispatch on this field for migrations.
     */
    version: number;
    /**
     * Wall-clock timestamp (milliseconds since epoch) when the snapshot was
     * captured.
     */
    timestamp: number;
    /**
     * Snapshot data keyed by the root name passed to `registerRoot()`.
     */
    roots: {
        [rootName: string]: any;
    };
}

/**
 * Creates a DevTools plugin instance.
 *
 * @param {DevToolsOptions} [options]
 * @returns {DevToolsPlugin}
 *
 * @example
 * ```js
 * const devtools = createDevToolsPlugin({ name: 'my app', maxAge: 100 });
 * ctx.use(devtools);
 *
 * devtools.subscribe((entry, index) => {
 *     console.log('now at', index, entry?.name);
 * });
 * ```
 *
 * @public
 */
export declare function createDevToolsPlugin(options?: DevToolsOptions): DevToolsPlugin;

/**
 * Creates a new isolated context.
 * @param {object} [options]
 * @returns {Store2Context}
 */
export declare function createStore2Context(options?: object): Store2Context;

/**
 * Debounce function.
 * @template {Function} T
 * @param {T} func
 * @param {number} wait
 * @returns {T}
 */
export declare function debounce<T extends Function>(func: T, wait: number): T;

/**
 * The default context adopts the process-wide service singletons so that
 * legacy code paths that import them directly continue to observe the same
 * state as the context-aware engine.
 */
export declare const defaultContext: Store2Context;

/**
 * A single entry in the DevTools history.
 */
export declare type DevToolsEntry = {
    /**
     * Monotonic id assigned by the plugin.
     */
    id: number;
    /**
     * Action name, or `'@@INIT'` for the baseline.
     */
    name: string;
    /**
     * Wall-clock time when the entry was recorded.
     */
    timestamp: number;
    /**
     * Duration of the recorded action in milliseconds.
     */
    durationMs: number;
    /**
     * State captured after the action completed.
     */
    snapshot: ContextSnapshot;
};

/**
 * Options accepted by `createDevToolsPlugin`.
 */
export declare type DevToolsOptions = {
    /**
     * Display name in the Redux DevTools Extension.
     */
    name?: string;
    /**
     * Maximum number of entries kept in history. Defaults to 50.
     */
    maxAge?: number;
    /**
     * Set to `false` to skip the extension bridge. Defaults to `true`.
     */
    connectToExtension?: boolean;
};

/**
 * A single entry in the DevTools history.
 *
 * @typedef {Object} DevToolsEntry@typedef {Object} DevToolsEntry
 * @property {number} id           Monotonic id assigned by the plugin.
 * @property {string} name         Action name, or `'@@INIT'` for the baseline.
 * @property {number} timestamp    Wall-clock time when the entry was recorded.
 * @property {number} durationMs   Duration of the recorded action in milliseconds.
 * @property {import('../types.js').ContextSnapshot} snapshot  State captured after the action completed.
 * @public
 */
/**
 * Options accepted by `createDevToolsPlugin`.
 *
 * @typedef {Object} DevToolsOptions@typedef {Object} DevToolsOptions
 * @property {string} [name]                 Display name in the Redux DevTools Extension.
 * @property {number} [maxAge]               Maximum number of entries kept in history. Defaults to 50.
 * @property {boolean} [connectToExtension]  Set to `false` to skip the extension bridge. Defaults to `true`.
 * @public
 */
/**
 * Records a snapshot after every completed action and exposes a `jumpTo()`
 * method for time-travel.
 *
 * The plugin maintains a linear history. Entry `0` is the baseline snapshot
 * taken at install time; entries `1..N` are the state after each completed
 * action. When a new action arrives after a `jumpTo()`, the future is
 * truncated before the new entry is appended — matching Redux DevTools
 * behaviour.
 *
 * Time-travel calls `context.hydrate(snapshot, { timeTravel: true })`, which
 * suppresses plugin hooks for the duration of the rehydration so the
 * rehydration does not itself appear as an action.
 *
 * Recommended usage: install the plugin **after** registering all roots, so
 * the baseline snapshot captures their initial state.
 *
 * @example
 * ```js
 * import { createStore2Context, createDevToolsPlugin, Store, atom } from '@supercat1337/store2';
 *
 * const ctx = createStore2Context({ name: 'app' });
 * const store = new Store();
 * const count = atom(0, { name: 'count' });
 * store.addItems({ count });
 * ctx.registerRoot('app', store);
 *
 * const devtools = createDevToolsPlugin({ name: 'my app' });
 * ctx.use(devtools);
 *
 * await ctx.action('increment', () => { count.value++; });
 * await ctx.action('increment', () => { count.value++; });
 *
 * devtools.getHistory().length; // 3: baseline + 2 actions
 * devtools.jumpTo(1);
 * count.value; // 1
 * ```
 *
 * @public
 */
export declare class DevToolsPlugin {
    /**
     * @param {DevToolsOptions} [options]
     */
    constructor(options?: DevToolsOptions);
    /**
     * Plugin identifier. Also used as the default display name in the
     * Redux DevTools Extension when no `name` option is provided.
     */
    name: string;
    /**
     * Called by the context when the plugin is registered via `use()`.
     *
     * Captures the initial baseline snapshot and connects to the Redux
     * DevTools Extension when it is available in the host environment.
     *
     * Do not call this method directly — it is part of the plugin
     * installation contract.
     *
     * @param {import('../core/context.js').Store2Context} context
     */
    install(context: Store2Context): void;
    /**
     * Records a new history entry after an action completes.
     *
     * Called by the context's action lifecycle. Ignored while a time-travel
     * jump is in progress, so that rewinding does not itself appear as a
     * new action in the history.
     *
     * @param {import('../types.js').ActionInfo} action
     */
    onActionEnd(action: ActionInfo): void;
    /**
     * Returns a shallow copy of the recorded history.
     *
     * The returned array is newly allocated; mutating it does not affect
     * the plugin. The snapshot objects inside each entry are shared by
     * reference — treat them as immutable.
     *
     * @returns {Array<DevToolsEntry>}
     */
    getHistory(): Array<DevToolsEntry>;
    /**
     * Returns the index of the entry the plugin is currently positioned at.
     *
     * Entry `0` is the baseline; higher indices correspond to completed
     * actions in order. Returns `-1` if the plugin has not been installed
     * yet.
     *
     * @returns {number}
     */
    getCurrentIndex(): number;
    /**
     * Returns the entry at the current history index, or `null` if the
     * history is empty.
     *
     * After `jumpTo(index)`, the returned entry is the one at that index,
     * not the most recent one. Use `getHistory()` to inspect the full
     * history.
     *
     * @returns {DevToolsEntry | null}
     */
    getCurrentEntry(): DevToolsEntry | null;
    /**
     * Travels to a specific history index.
     *
     * Restores the state captured at that entry by calling
     * `context.hydrate(snapshot, { timeTravel: true })`. Plugin hooks are
     * suppressed for the duration of the hydration, so the jump does not
     * appear as a new action. Subscribers still run — the UI updates.
     *
     * No-op if the index is out of range or already current.
     *
     * @param {number} index
     */
    jumpTo(index: number): void;
    /**
     * Clears the history and records a fresh baseline.
     *
     * Called by the plugin itself in response to a `RESET` message from the
     * Redux DevTools Extension, or directly by user code. After this call,
     * the history contains exactly one entry: the new baseline.
     */
    reset(): void;
    /**
     * Subscribes a listener called whenever the current index or the
     * history changes.
     *
     * The listener receives the current entry (or `null` if the history is
     * empty) and its index. Errors thrown by the listener are caught and
     * logged, so one faulty listener cannot break others.
     *
     * @param {(entry: DevToolsEntry | null, index: number) => void} fn
     * @returns {() => void} An unsubscribe function.
     */
    subscribe(fn: (entry: DevToolsEntry | null, index: number) => void): () => void;
    /**
     * Detaches from the Redux DevTools Extension, if connected.
     *
     * Safe to call when no extension is connected or after the plugin was
     * installed with `connectToExtension: false`. Idempotent.
     */
    disconnect(): void;
    #private;
}

/**
 * Engine is the core reactive engine for a single reactive item.
 * It manages dependencies, updates, lifecycle, and plugin notifications.
 *
 * Every engine holds a reference to the `Store2Context` it was created in.
 * All coordination with the id service, mode controller, and changed-items
 * controller goes through that context, so multiple isolated roots can
 * coexist in one process.
 */
declare class Engine {
    /**
     * @param {import('../reactives/ReactiveItem.js').ReactiveItem} reactiveItem
     * @param {import('../types.js').ReactiveItemType} type
     */
    constructor(reactiveItem: ReactiveItem, type: ReactiveItemType);
    /** @type {import('./context.js').Store2Context} */
    context: Store2Context;
    /** @type {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} */
    dependencies: Set<ReactiveItem>;
    /** @type {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} */
    dependents: Set<ReactiveItem>;
    /** @type {number} */
    id: number;
    /** @type {number} */
    version: number;
    /** @type {import('../reactives/ReactiveItem.js').ReactiveItem} */
    reactiveItem: ReactiveItem;
    /** @type {boolean} */
    shouldRecalc: boolean;
    /** @type {boolean} */
    isDestroyed: boolean;
    /** @type {SubscribeController} */
    subscribeController: SubscribeController;
    /** @type {import('../types.js').ReactiveItemType} */
    type: ReactiveItemType;
    /** @type {Map<string, import('./UpdateDataRecord.js').UpdateDataRecord>} */
    updates: Map<string, UpdateDataRecord>;
    /** @type {import('../types.js').CompareFunction | null} */
    compareFn: CompareFunction | null;
    /** @type {boolean} */
    suppressNotifications: boolean;
    /**
     * @returns {Error | null}
     */
    get error(): Error;
    /**
     * Records a change attempt and emits `onUpdate` when the change is
     * effective.
     * @param {string} property
     * @param {"set" | "delete"} type
     * @param {any} oldValue
     * @param {any} value
     * @returns {boolean}
     */
    addUpdate(property: string, type: "set" | "delete", oldValue: any, value: any): boolean;
    /**
     * @param {import('../reactives/ReactiveItem.js').ReactiveItem} dependency
     */
    addDependency(dependency: ReactiveItem): void;
    /**
     * @param {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} dependencies
     */
    addDependencies(dependencies: Set<ReactiveItem>): void;
    /**
     * @param {import('../reactives/ReactiveItem.js').ReactiveItem} dependent
     * @returns {boolean}
     */
    addDependent(dependent: ReactiveItem): boolean;
    /**
     * @param {import('../reactives/ReactiveItem.js').ReactiveItem} dependent
     */
    removeDependent(dependent: ReactiveItem): void;
    /**
     * @returns {Set<import('../reactives/ReactiveItem.js').ReactiveItem>}
     */
    getDeepDependents(): Set<ReactiveItem>;
    /**
     * @returns {Array<import('../reactives/ReactiveItem.js').ReactiveItem>}
     */
    getDeepDependentsArray(): Array<ReactiveItem>;
    /**
     * @param {number} message
     * @param {{ sender: import('../reactives/ReactiveItem.js').ReactiveItem, recipients: Set<import('../reactives/ReactiveItem.js').ReactiveItem> }} [ctx]
     */
    notifyDependents(message: number, ctx?: {
        sender: ReactiveItem;
        recipients: Set<ReactiveItem>;
    }): void;
    /**
     * @param {number} message
     * @param {{ sender: import('../reactives/ReactiveItem.js').ReactiveItem, recipients: Set<import('../reactives/ReactiveItem.js').ReactiveItem> }} [ctx]
     */
    notifyDependencies(message: number, ctx?: {
        sender: ReactiveItem;
        recipients: Set<ReactiveItem>;
    }): void;
    /**
     * @param {number} message
     * @param {{ sender: import('../reactives/ReactiveItem.js').ReactiveItem, recipients: Set<import('../reactives/ReactiveItem.js').ReactiveItem> }} ctx
     */
    getMessage(message: number, ctx: {
        sender: ReactiveItem;
        recipients: Set<ReactiveItem>;
    }): void;
    /**
     * Sets an error and notifies dependents. Emits `onError`.
     * @param {Error | null} error
     * @param {{ sender: import('../reactives/ReactiveItem.js').ReactiveItem, recipients: Set<import('../reactives/ReactiveItem.js').ReactiveItem> }} [ctx]
     */
    setError(error: Error | null, ctx?: {
        sender: ReactiveItem;
        recipients: Set<ReactiveItem>;
    }): void;
    /**
     * Clears the current error.
     */
    clearError(): void;
    /**
     * Destroys the engine. Emits `onDestroy` after teardown.
     * @param {{ sender: import('../reactives/ReactiveItem.js').ReactiveItem, recipients: Set<import('../reactives/ReactiveItem.js').ReactiveItem> }} [ctx]
     */
    destroy(ctx?: {
        sender: ReactiveItem;
        recipients: Set<ReactiveItem>;
    }): void;
    /**
     * Clears all pending updates.
     */
    clearUpdates(): void;
    /**
     * @returns {boolean}
     */
    hasUpdates(): boolean;
    /**
     * @returns {boolean}
     */
    checkChangesTemporary(): boolean;
    /**
     * @param {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} newDeps
     */
    updateDependencies(newDeps: Set<ReactiveItem>): void;
    /**
     * @throws {Error} If destroyed or in subscribers mode.
     */
    prepareSetValue(): void;
    /**
     * Called after a value change to schedule notifications.
     */
    valueChangedCallback(): void;
    /**
     * @param {string} property
     * @param {any} oldValue
     * @param {any} newValue
     * @returns {boolean}
     */
    isEffectiveChangeWithOld(property: string, oldValue: any, newValue: any): boolean;
    #private;
}

/**
 * @template T
 * @template {{[key: string]: any}} R
 * @param {T} target
 * @param {R} properties
 * @param {{[key: string]: "atom" | "computed" | "collection" | "shallowReactive" | false}} [overrides]
 * @param {object} [options]
 * @param {string} [options.name]
 * @returns {T & R}
 */
export declare function extendObservable<T, R extends {
    [key: string]: any;
}>(target: T, properties: R, overrides?: {
    [key: string]: "atom" | "computed" | "collection" | "shallowReactive" | false;
}, options?: {
    name?: string;
}): T & R;

/**
 * Observes a promise's state. The returned object exposes a single method
 * `case({ pending, resolved, rejected })`.
 * @template T
 * @param {Promise<T>} promise
 * @returns {{ case: (param0: { resolved?: (value: T) => void, rejected?: (error: Error) => void, pending?: () => void }) => Promise<void> }}
 */
export declare function fromPromise<T>(promise: Promise<T>): {
    case: (param0: {
        resolved?: (value: T) => void;
        rejected?: (error: Error) => void;
        pending?: () => void;
    }) => Promise<void>;
};

/**
 * Gets all property descriptors of an object, including its prototype and all its ancestors.
 * The descriptors are returned as a plain object.
 * @param {object | null | undefined} obj
 * @param {number} [depth=0]
 * @param {number} [maxDepth=100]
 * @returns {{[x: string]: PropertyDescriptor}}
 */
export declare function getAllPropertyDescriptors(obj: object | null | undefined, depth?: number, maxDepth?: number): {
    [x: string]: PropertyDescriptor;
};

/**
 * Returns the currently installed context, or the default one.
 * @returns {Store2Context}
 */
export declare function getCurrentContext(): Store2Context;

/**
 * Converts any value to an Error object.
 * @param {unknown} e
 * @returns {Error}
 */
export declare function getError(e: unknown): Error;

/**
 * Extracts names (and optionally ids) from a Set of reactive items.
 *
 * Uses duck typing (`item.engine && item.name`) to avoid importing from
 * `reactives/` — that keeps `tools.js` free of circular dependencies.
 *
 * @param {Set<import('../reactives/ReactiveItem.js').ReactiveItem> | Iterable<import('../reactives/ReactiveItem.js').ReactiveItem>} items
 * @param {{includeId?: boolean, fallback?: string, sorted?: boolean}} [options]
 * @returns {string[]}
 */
export declare function getItemNamesFromSet(items: Set<ReactiveItem> | Iterable<ReactiveItem>, options?: {
    includeId?: boolean;
    fallback?: string;
    sorted?: boolean;
}): string[];

/**
 * Returns an Atom that ticks at the given interval while it has subscribers.
 * @param {number} [interval=1000]
 * @returns {Atom<number>}
 */
export declare function getNow(interval?: number): Atom<number>;

/**
 * Combines multiple reactive items or sets of reactive items into a single set,
 * ensuring that each item appears only once. The combined set is then converted
 * to an array and sorted by the internal id of the reactive items.
 *
 * @param {...(import('../reactives/ReactiveItem.js').ReactiveItem | Set<import('../reactives/ReactiveItem.js').ReactiveItem>)} items
 * @returns {Array<import('../reactives/ReactiveItem.js').ReactiveItem>}
 */
export declare function getSortedReactiveItems(...items: (ReactiveItem | Set<ReactiveItem>)[]): Array<ReactiveItem>;

/**
 * Service that generates unique numeric identifiers for reactive items.
 *
 * Each context owns its own instance so that ordering stays deterministic
 * inside one store tree and isolated between contexts (SSR, tests, etc.).
 */
export declare class IdService {
    /**
     * Generates a new unique numeric identifier.
     * @returns {number} A monotonic unique number.
     */
    generateId(): number;
    /**
     * Compares two numeric identifiers.
     * @param {number} a
     * @param {number} b
     * @returns {number} -1 if a < b, 1 if a > b, 0 if equal.
     */
    compareIds(a: number, b: number): number;
    /**
     * Resets the internal counter. Useful in tests.
     */
    reset(): void;
    #private;
}

/**
 * Checks if a given value is a plain object.
 * @param {*} obj
 * @returns {boolean} true if the value is a plain object, false otherwise.
 */
export declare function isPlainObject(obj: any): boolean;

/**
 * Same as `makeObservable` but infers annotations automatically.
 *
 * Plain objects become `shallowReactive`, arrays become `collection`,
 * getters become `computed`, and everything else becomes `atom`. Pass
 * `overrides` to correct the inference or disable a property with `false`.
 *
 * @template T
 * @param {T} obj
 * @param {{[key: string]: "atom" | "computed" | "collection" | "shallowReactive" | false}} [overrides]
 * @param {object} [options]
 * @param {string} [options.name]
 * @param {Set<string>} [filter]
 * @returns {T}
 */
export declare function makeAutoObservable<T>(obj: T, overrides?: {
    [key: string]: "atom" | "computed" | "collection" | "shallowReactive" | false;
}, options?: {
    name?: string;
}, filter?: Set<string>): T;

/**
 * Enhances an object with reactive properties using explicit annotations.
 *
 * Each key maps to one of `"atom"`, `"computed"`, `"collection"`,
 * `"shallowReactive"`, or `false` to leave the property untouched.
 *
 * @template T
 * @param {T} obj
 * @param {{[key: string]: "atom" | "computed" | "collection" | "shallowReactive" | false}} annotations
 * @param {object} [options]
 * @param {string} [options.name]
 * @returns {T}
 */
export declare function makeObservable<T>(obj: T, annotations: {
    [key: string]: "atom" | "computed" | "collection" | "shallowReactive" | false;
}, options?: {
    name?: string;
}): T;

/**
 * Coordinates global reactivity modes: batching, subscriber notification,
 * untracked reads, and named actions.
 *
 * Each `Store2Context` owns its own instance so that multiple root stores
 * can coexist (SSR requests, parallel tests, embedded widgets).
 */
export declare class ModeControllerService {
    /** @type {boolean} */
    isComputing: boolean;
    /** @type {boolean} */
    throwErrorInSubscribers: boolean;
    /**
     * When `true`, tracked reads are suppressed. `untrack()` saves and
     * restores this value, so nesting is safe.
     * @type {boolean}
     */
    untrackMode: boolean;
    /* Excluded from this release type: batchModeEvents */
    /* Excluded from this release type: subscribersModeEvents */
    /* Excluded from this release type: actionEvents */
    /**
     * Subscribes to a batch lifecycle event.
     * @param {"batchModeStart"|"batchModeEnd"|"beforeBatchModeEnd"} event
     * @param {() => void} callback
     * @returns {() => void}
     */
    on(event: "batchModeStart" | "batchModeEnd" | "beforeBatchModeEnd", callback: () => void): () => void;
    /**
     * Subscribes to an action lifecycle event.
     * @param {"actionStart"|"actionEnd"} event
     * @param {(action: import('../types.js').ActionInfo) => void} callback
     * @returns {() => void}
     */
    onAction(event: "actionStart" | "actionEnd", callback: (action: ActionInfo) => void): () => void;
    /**
     * Returns true while the controller is inside a batch.
     * @returns {boolean}
     */
    get batchMode(): boolean;
    /**
     * Returns the current batch depth.
     * @returns {number}
     */
    get batchDepth(): number;
    /**
     * Returns the name of the currently running outermost batch, or ''.
     * @returns {string}
     */
    get currentBatchName(): string;
    /**
     * Increments the batch depth. Emits `batchModeStart` on the first entry.
     * @param {string} [name] - Optional human-readable name for the batch.
     */
    enterBatch(name?: string): void;
    /**
     * Decrements the batch depth. Emits `beforeBatchModeEnd`, then
     * `batchModeEnd` when leaving the outermost batch.
     */
    exitBatch(): void;
    /**
     * Returns true while subscribers are running.
     * @returns {boolean}
     */
    get subscribersMode(): boolean;
    /**
     * Marks the start of subscriber notification.
     */
    startSubscribersMode(): void;
    /**
     * Marks the end of subscriber notification and flushes deferred callbacks.
     */
    endSubscribersMode(): void;
    /**
     * Registers a callback to run once after subscribers finish.
     * @param {() => void} callback
     */
    runAfterSubscribers(callback: () => void): void;
    /**
     * Returns the currently running action, or null if no action is in flight.
     * @returns {import('../types.js').ActionInfo | null}
     */
    get currentAction(): ActionInfo;
    /**
     * Starts a new named action.
     * @param {string} name
     * @param {any} [payload]
     * @returns {import('../types.js').ActionInfo}
     */
    beginAction(name: string, payload?: any): ActionInfo;
    /**
     * Ends an action previously started with `beginAction`.
     * @param {import('../types.js').ActionInfo} action
     * @param {Error | null} [error]
     */
    endAction(action: ActionInfo, error?: Error | null): void;
    #private;
}

/**
 * Reaction – tracks dependencies via `dataFn` and runs `effectFn` when they
 * change. The effect is NOT run at setup time.
 *
 * @param {() => any} dataFn
 * @param {(updates?: Map<string, import('../core/UpdateDataRecord.js').UpdateDataRecord>) => void} effectFn
 * @param {object} [options]
 * @param {string} [options.name]
 * @param {number} [options.delay]
 * @param {AbortSignal} [options.signal]
 * @param {Function} [options.onError]
 * @param {boolean} [options.recomputeDependencies=true]
 * @param {boolean} [options.passUpdates=true]
 * @returns {() => void}
 */
export declare function reaction(dataFn: () => any, effectFn: (updates?: Map<string, UpdateDataRecord>) => void, options?: {
    name?: string;
    delay?: number;
    signal?: AbortSignal;
    onError?: Function;
    recomputeDependencies?: boolean;
    passUpdates?: boolean;
}): () => void;

/**
 * ReactiveItem is the base class for all reactive items. It provides methods
 * for subscribing to changes, reading values, and lifecycle management.
 *
 * Concrete subclasses are `Atom`, `Computed`, `Collection`, and
 * `ShallowReactive`. User code rarely instantiates this class directly; use
 * the factory functions exported from the package root instead.
 *
 * @public
 */
export declare class ReactiveItem {
    /**
     * Creates a new reactive item. Subclasses pass their own type tag.
     *
     * @param {import('../types.js').ReactiveItemType} type
     */
    constructor(type: ReactiveItemType);
    /* Excluded from this release type: engine */
    /**
     * Debug name assigned at construction. Used in error messages and
     * DevTools listings. Empty string when not set.
     * @type {string}
     */
    name: string;
    /**
     * Local path assigned by the immediate container. Top-level items get a
     * path equal to their key in the root store; standalone items keep `''`.
     * @type {string}
     */
    path: string;
    /**
     * The numeric type tag of this item: `1` for `Atom`, `2` for `Computed`,
     * `3` for `Collection`, `4` for `ShallowReactive`.
     *
     * @returns {import('../types.js').ReactiveItemType}
     */
    get type(): ReactiveItemType;
    /**
     * Monotonic version counter, bumped on every effective change.
     *
     * Useful as a stable token for `useSyncExternalStore` and for cache
     * invalidation: comparing two `getVersion()` results tells you whether
     * the value changed, without reading it.
     *
     * @returns {number}
     */
    getVersion(): number;
    /**
     * Subscribes a function to changes of this item.
     *
     * The callback receives a `Map` of property paths to
     * `UpdateDataRecord` instances. It is invoked once per batch of
     * effective changes.
     *
     * @param {(updates: Map<string, import('../core/UpdateDataRecord.js').UpdateDataRecord>) => void} fn
     * @param {object} [options]
     * @param {number} [options.delay] - Debounce delay in milliseconds.
     * @param {AbortSignal} [options.signal] - Cancels the subscription when aborted.
     * @returns {() => void} An unsubscribe function.
     */
    subscribe(fn: (updates: Map<string, UpdateDataRecord>) => void, options?: {
        delay?: number;
        signal?: AbortSignal;
    }): () => void;
    /**
     * Removes all change subscribers, keeping lifecycle listeners
     * registered via `onHasSubscribers`, `onNoSubscribers`, and
     * `onDestroy`.
     */
    clearSubscribers(): void;
    /**
     * Removes all subscribers, including lifecycle listeners.
     *
     * After this call, the item no longer invokes any user callbacks until
     * a new subscription is made.
     */
    clearAllSubscribers(): void;
    /**
     * Returns `true` if at least one change subscriber is currently
     * registered.
     *
     * @returns {boolean}
     */
    hasSubscribers(): boolean;
    /**
     * Reads the current value, tracking the item as a dependency unless
     * `untracked` is `true`.
     *
     * Throws if the item has been destroyed.
     *
     * @param {object} [options]
     * @param {boolean} [options.untracked=false]
     * @returns {any}
     */
    getValue(options?: {
        untracked?: boolean;
    }): any;
    /**
     * Returns the current value without registering a dependency and
     * without triggering recalculation for `Computed`.
     *
     * For `Computed`, this returns the last cached value even if it is
     * stale. To force a fresh value, use `.value` or `.getValue()`.
     *
     * @returns {any}
     */
    peekValue(): any;
    /**
     * Returns the last error produced by this item, or `null`.
     *
     * For `Computed`, this is the error thrown during the most recent
     * evaluation. The error is preserved until a dependency changes.
     *
     * @returns {Error | null}
     */
    getLastError(): Error | null;
    /**
     * Returns `true` if reading the value currently throws or has thrown.
     *
     * For `Computed`, this forces a read to determine whether the current
     * dependencies are valid.
     *
     * @returns {boolean}
     */
    hasError(): boolean;
    /**
     * Registers a callback that fires when the first change subscriber is
     * added.
     *
     * Useful for lazy initialisation: start expensive work only when
     * somebody actually listens.
     *
     * @param {() => void} fn
     * @returns {() => void} An unsubscribe function.
     */
    onHasSubscribers(fn: () => void): () => void;
    /**
     * Registers a callback that fires when the last change subscriber is
     * removed.
     *
     * Useful for cleanup: stop timers or subscriptions that only make sense
     * while somebody is listening.
     *
     * @param {() => void} fn
     * @returns {() => void} An unsubscribe function.
     */
    onNoSubscribers(fn: () => void): () => void;
    /**
     * Registers a callback that fires when the item is destroyed.
     *
     * The callback receives the destroyed item as its only argument.
     *
     * @param {(reactiveItem: ReactiveItem) => void} fn
     * @returns {() => void} An unsubscribe function.
     */
    onDestroy(fn: (reactiveItem: ReactiveItem) => void): () => void;
    /**
     * Destroys the item and tears down its dependency graph.
     *
     * All subscribers are detached, all dependencies are released, and any
     * further read or write throws. Idempotent — subsequent calls are
     * no-ops.
     */
    destroy(): void;
    /**
     * Returns `true` if the two values are considered equal by this item's
     * comparator.
     *
     * When the second argument is omitted, it is compared against the
     * item's current value. Uses the custom `compareFunction` if one was
     * provided at construction, otherwise falls back to shallow equality.
     *
     * @param {any} a
     * @param {any} [b]
     * @returns {boolean}
     */
    equals(a: any, b?: any): boolean;
    /**
     * Returns `true` if `destroy()` has been called.
     *
     * After destruction, reads and writes throw. This getter is the only
     * operation that remains safe to call.
     *
     * @returns {boolean}
     */
    get isDestroyed(): boolean;
    /**
     * Returns a plain data representation suitable for storage or transport.
     *
     * The base implementation returns `null`, signalling that the item must
     * not be persisted. `Atom`, `Collection`, `ShallowReactive`, and `Store`
     * override this method. `Computed` deliberately keeps the `null`
     * default — derived state is recalculated on hydration, never restored.
     *
     * @returns {any}
     */
    serialize(): any;
    /**
     * Restores state previously produced by `serialize()`.
     *
     * The base implementation is a no-op. Subclasses override this to apply
     * the given data. Implementations must be idempotent and must not throw
     * on malformed input — silently ignore what they cannot apply.
     *
     * @param {any} _data
     */
    hydrate(_data: any): void;
}

/**
 * The numeric type tag of a reactive item.
 *
 * - `1` — `Atom`
 * - `2` — `Computed`
 * - `3` — `Collection`
 * - `4` — `ShallowReactive`
 *
 * @public
 */
export declare type ReactiveItemType = 1 | 2 | 3 | 4;

/**
 * ReactiveList is a reactive array-like structure that stores values of any
 * type.
 *
 * Primitives (numbers, strings, booleans) are wrapped in `Atom`; objects
 * and arrays are wrapped in `ShallowReactive`. Every mutation — adding,
 * removing, replacing, reordering — is batched into a single notification.
 *
 * Internally the list is backed by a `Store` indexed by string positions,
 * plus a separate `Atom` tracking the list length. This is not part of the
 * public contract; treat the list as an opaque reactive array.
 *
 * @template T
 * @public
 */
export declare class ReactiveList<T> {
    /**
     * Local path of this list. Empty unless set by the user. Used by
     * snapshot tooling to build dotted paths when the list is nested inside
     * a `Store`.
     * @type {string}
     */
    path: string;
    /**
     * Appends one or more values to the end of the list.
     *
     * Each value is wrapped according to its type — primitives become
     * `Atom`, objects and arrays become `ShallowReactive`. The whole
     * operation produces a single notification, regardless of how many
     * values are added.
     *
     * @param {...T} values
     */
    add(...values: T[]): void;
    /**
     * Returns the value at the given index, or `undefined` if the index is
     * out of bounds.
     *
     * Reads through the reactive wrapper, so a call inside a tracked scope
     * registers a dependency on the item at that index.
     *
     * @param {number} index
     * @returns {T | undefined}
     */
    getItem(index: number): T | undefined;
    /**
     * Returns a shallow copy of all items in the list as a plain array.
     *
     * The array is newly allocated on each call; mutating it does not
     * affect the list. Elements that are reactive objects are returned as
     * their underlying values, not as wrappers.
     *
     * @returns {T[]}
     */
    toArray(): T[];
    /**
     * Replaces the value at the specified index.
     *
     * The whole operation produces a single notification. No-op if `index`
     * is out of bounds.
     *
     * @param {number} index
     * @param {T} value
     */
    setItem(index: number, value: T): void;
    /**
     * The current number of items in the list.
     *
     * Reading this property inside a tracked scope registers a dependency,
     * so the enclosing effect re-runs whenever items are added or removed.
     *
     * @returns {number}
     */
    get length(): number;
    /**
     * Replaces the entire content of the list with the given array.
     *
     * Existing positions are updated in place; positions beyond the new
     * length are destroyed; new positions are created. The whole operation
     * produces a single notification.
     *
     * @param {T[]} values
     */
    setItems(values: T[]): void;
    /**
     * Removes `count` items starting at `startIndex`.
     *
     * Remaining items shift left to fill the gap; the tail positions are
     * destroyed. The whole operation produces a single notification.
     *
     * No-op if `count <= 0`, `startIndex < 0`, or `startIndex >= length`.
     * If `count` exceeds the number of items from `startIndex` to the end,
     * it is clamped.
     *
     * @param {number} startIndex
     * @param {number} count
     */
    removeRange(startIndex: number, count: number): void;
    /**
     * Removes the item at the given index.
     *
     * Shorthand for `removeRange(index, 1)`. No-op if `index` is out of
     * bounds.
     *
     * @param {number} index
     */
    removeItem(index: number): void;
    /**
     * Removes the last item. No-op if the list is empty.
     */
    removeLastItem(): void;
    /**
     * Removes the first item. No-op if the list is empty.
     */
    removeFirstItem(): void;
    /**
     * Removes all items from the list.
     *
     * The length becomes `0` and every item is destroyed.
     */
    clear(): void;
    /**
     * Destroys the list and releases its internal store.
     *
     * After this call, all mutating methods throw. Idempotent — subsequent
     * calls are no-ops.
     */
    destroy(): void;
    /**
     * Returns `true` after `destroy()` has been called.
     *
     * After destruction, all mutating methods throw and only this getter
     * remains safe to call.
     *
     * @returns {boolean}
     */
    get isDestroyed(): boolean;
    /**
     * Subscribes a function to changes of the list.
     *
     * The callback receives a `Map` of update paths to `UpdateDataRecord`
     * instances. It is invoked once per batch of effective changes,
     * regardless of how many items were affected.
     *
     * @param {(updates: Map<string, import('../core/UpdateDataRecord.js').UpdateDataRecord>) => void} fn
     * @returns {() => void} An unsubscribe function.
     */
    subscribe(fn: (updates: Map<string, UpdateDataRecord>) => void): () => void;
    /**
     * Returns a serializable representation of the list's contents.
     *
     * The shape is `{ type: 'list', value: [...] }`, matching the
     * serialization protocol used by reactive items.
     *
     * @returns {any}
     */
    serialize(): any;
    /**
     * Applies data produced by `serialize()`.
     *
     * Uses `setItems` internally, so the whole replacement is batched and
     * subscribers fire once. Silently ignores malformed input.
     *
     * @param {any} data
     */
    hydrate(data: any): void;
    #private;
}

/**
 * Defers mutations until after subscribers finish, so it is safe to call
 * from inside a subscriber callback.
 * @param {Function} fn
 * @returns {void}
 */
export declare function runInAction(fn: Function): void;

/**
 * Runs `fn` with `context` installed as the active context.
 * @template T
 * @param {Store2Context} context
 * @param {() => T} fn
 * @returns {T}
 */
export declare function runWithContext<T>(context: Store2Context, fn: () => T): T;

/**
 * ShallowReactive tracks assignments and deletions on the top level of an
 * object.
 *
 * Nested objects are stored by reference and are not made reactive —
 * mutating a property of a nested object does not trigger an update. For
 * deep reactivity, either use immutable updates on the top level or split
 * the state across multiple reactive items.
 *
 * @augments ReactiveItem
 * @template {{[key: string]: any}} T
 * @public
 */
export declare class ShallowReactive<T extends {
    [key: string]: any;
}> extends ReactiveItem {
    /**
     * Creates a new ShallowReactive wrapping the given object.
     *
     * @param {T} value - The object to wrap. Must be a plain object.
     * @param {object} [options]
     * @param {string} [options.name] - Debug name used in error messages.
     */
    constructor(value: T, options?: {
        name?: string;
    });
    /**
     * Returns the proxied object.
     *
     * When `options.untracked` is `false` (the default), registers this
     * item as a dependency of the enclosing tracked scope.
     *
     * @param {{ untracked?: boolean }} [options]
     * @returns {T}
     */
    getValue(options?: {
        untracked?: boolean;
    }): T;
    /**
     * Replaces the object's properties wholesale.
     *
     * Keys absent from `value` are deleted from the target; new keys are
     * added. The entire operation is batched and produces a single
     * notification.
     *
     * @param {T} value
     */
    setValue(value: T): void;
    set value(value: T);
    /**
     * The proxied object.
     *
     * Reading a top-level property registers a dependency on this item.
     * Writing a top-level property schedules an update. Nested properties
     * are not tracked.
     *
     * @returns {T}
     */
    get value(): T;
    /**
     * Returns the underlying object without the proxy.
     *
     * Mutations on the returned object do not trigger reactivity. Use for
     * inspection or for passing to APIs that must receive a plain object —
     * not for state changes.
     *
     * @returns {T}
     */
    getRawValue(): T;
    #private;
}

/**
 * @template {{[key: string]: any}} T
 * @param {T} value
 * @param {object} [options]
 * @param {string} [options.name]
 * @returns {ShallowReactive<T>}
 */
export declare function shallowReactive<T extends {
    [key: string]: any;
}>(value: T, options?: {
    name?: string;
}): ShallowReactive<T>;

/**
 * A Promise-based sleep function.
 * @param {number} ms
 * @returns {Promise<void>}
 */
export declare function sleep(ms: number): Promise<void>;

/**
 * Minimal interface a context root must satisfy to be snapshotted.
 *
 * `Store` and `ReactiveList` implement this interface out of the box.
 *
 * @public
 */
export declare interface SnapshotRoot {
    /**
     * Returns a plain data representation of the root suitable for storage
     * or transport. Called by `context.snapshot()`.
     */
    serialize(): any;
    /**
     * Restores state previously produced by `serialize()`. Called by
     * `context.hydrate()` inside a batch. Implementations must be
     * idempotent and must not throw on malformed input.
     */
    hydrate(data: any): void;
}

/**
 * Sorts reactive items by their internal id. This is used to
 * ensure that reactive items are processed in a consistent order
 * when they are notified of changes.
 * @param {import('../reactives/ReactiveItem.js').ReactiveItem} a
 * @param {import('../reactives/ReactiveItem.js').ReactiveItem} b
 * @returns {number} -1 if a should come before b, 0 if a and b are equal, 1 if a should come after b
 */
export declare function sortReactiveItems(a: ReactiveItem, b: ReactiveItem): number;

/**
 * Store is a reactive container for reactive items and nested stores.
 *
 * It collects the individual subscriptions of its children and re-emits
 * them as a single batched notification. Subscribing to a Store is
 * therefore equivalent to subscribing to every item inside it, without
 * registering a listener per item.
 *
 * Update keys are dot-separated paths. For a root store holding an atom
 * named `count`, a write to `count.value` produces the update key `count`.
 * For a child store named `settings` holding an atom `theme`, the update
 * key is `settings.theme`.
 *
 * @public
 */
export declare class Store {
    /**
     * Local path of this store within its parent. Empty for the root store.
     * The full path is available via `getPath()`.
     * @type {string}
     */
    path: string;
    /**
     * Returns `true` after `destroy()` has been called.
     *
     * After destruction, all mutating methods throw and only this getter
     * remains safe to call.
     *
     * @returns {boolean}
     */
    get isDestroyed(): boolean;
    /**
     * Returns the full path of this store by walking up the parent chain.
     *
     * For a root store, returns `path` — which is `''` unless the user set
     * it manually. For a child store, returns `"parent.getPath() + '.' +
     * this.path"`.
     *
     * @returns {string}
     */
    getPath(): string;
    /**
     * Adds reactive items or child stores to the store under the given keys.
     *
     * Throws if a key is already registered, or if a value is neither a
     * `ReactiveItem` nor a `Store`.
     *
     * @param {{[key: string]: ReactiveItem | Store}} items
     */
    addItems(items: {
        [key: string]: ReactiveItem | Store;
    }): void;
    /**
     * Destroys the item or child store registered under `key`.
     *
     * When `key` refers to a reactive item, the item is removed from the
     * store and then destroyed. When it refers to a child store, the child
     * store and every item inside it is destroyed recursively. No-op if
     * the key is not present.
     *
     * @param {string} key
     */
    destroyItem(key: string): void;
    /**
     * Removes the item or child store registered under `key` from the
     * store, without destroying it.
     *
     * The removed item remains usable and can be re-added to a store (this
     * one or another). No-op if the key is not present.
     *
     * @param {string} key
     */
    removeItem(key: string): void;
    /**
     * Destroys the store and every item and child store inside it.
     *
     * After this call, all mutating methods throw. Idempotent — subsequent
     * calls are no-ops.
     */
    destroy(): void;
    /**
     * Removes all items and child stores without destroying them.
     *
     * After this call the store is empty, but the detached items continue
     * to work and can be re-added elsewhere.
     */
    detachAll(): void;
    /**
     * Returns the item or child store registered under `key`, or `null` if
     * the key is not present.
     *
     * @param {string} key
     * @returns {ReactiveItem | Store | null}
     */
    getItem(key: string): ReactiveItem | Store | null;
    /**
     * Returns `true` if `key` is registered as either a reactive item or a
     * child store.
     *
     * @param {string} key
     * @returns {boolean}
     */
    hasItem(key: string): boolean;
    /**
     * Returns the keys of the store's contents.
     *
     * The `filter` argument narrows the result: `"reactives"` returns only
     * reactive items, `"stores"` returns only child stores, `"all"` (the
     * default) returns both, reactives first.
     *
     * @param {"all" | "reactives" | "stores"} [filter="all"]
     * @returns {Array<string>}
     */
    getItemNames(filter?: "all" | "reactives" | "stores"): Array<string>;
    /**
     * Returns the store's contents as a `Map`.
     *
     * The `filter` argument narrows the result the same way as in
     * `getItemNames()`.
     *
     * @param {"all" | "reactives" | "stores"} [filter="all"]
     * @returns {Map<string, ReactiveItem | Store>}
     */
    toMap(filter?: "all" | "reactives" | "stores"): Map<string, ReactiveItem | Store>;
    /**
     * Returns the store's current values as a plain object.
     *
     * Computed values are included — this is a full state dump, not a
     * persistence payload. For persistence, prefer `serialize()`, which
     * omits derived state.
     *
     * The `filter` argument narrows the result the same way as in
     * `getItemNames()`.
     *
     * @param {"all" | "reactives" | "stores"} [filter="all"]
     * @returns {object}
     */
    toJSON(filter?: "all" | "reactives" | "stores"): object;
    /**
     * Serializes the store and its children.
     *
     * Items whose `serialize()` returns `null` — notably `Computed` — are
     * omitted. The output is suitable for `hydrate()` and for JSON
     * transport.
     *
     * @returns {any}
     */
    serialize(): any;
    /**
     * Applies serialized data produced by `serialize()`.
     *
     * Keys absent from `data` are left untouched; keys present in `data`
     * but not in this store are ignored. Malformed input is a no-op.
     * Runs entirely inside the caller's batch — the context wraps hydration
     * in a batch already.
     *
     * @param {any} data
     */
    hydrate(data: any): void;
    /**
     * Subscribes a function to changes across the store's contents.
     *
     * The callback receives a `Map` of dot-separated update paths to
     * `UpdateDataRecord` instances, plus this store as the second
     * argument. It is invoked once per batch of effective changes.
     *
     * @param {(update: Map<string, import('../core/UpdateDataRecord.js').UpdateDataRecord>, store: Store) => void} fn
     * @returns {() => void} An unsubscribe function.
     */
    subscribe(fn: (update: Map<string, UpdateDataRecord>, store: Store) => void): () => void;
    /**
     * Registers a callback fired when the store is destroyed.
     *
     * @param {(store: Store) => void} fn
     * @returns {() => void} An unsubscribe function.
     */
    onDestroy(fn: (store: Store) => void): () => void;
    /**
     * Suppresses change notifications until `unmuteUpdates()` is called.
     *
     * Mutations that happen while muted are still applied and their
     * updates accumulated; subscribers are notified once, with everything,
     * when the store is unmuted.
     */
    muteUpdates(): void;
    /**
     * Resumes change notifications after `muteUpdates()`.
     *
     * If any updates accumulated while muted, subscribers are notified
     * immediately with the full set.
     */
    unmuteUpdates(): void;
    /**
     * Returns `true` if change notifications are currently suppressed.
     *
     * @returns {boolean}
     */
    isMuted(): boolean;
    #private;
}

/**
 * A Store2 context owns the per-root services that drive reactivity and
 * tracks the roots (stores, lists) it should snapshot and hydrate.
 */
export declare class Store2Context {
    /**
     * @param {object} [options]
     * @param {string} [options.name]
     * @param {IdService} [options.idService]
     * @param {ModeControllerService} [options.modeController]
     * @param {Tracker} [options.dependencyTracker]
     * @param {ChangedItemsController} [options.changedItemsController]
     */
    constructor(options?: {
        name?: string;
        idService?: IdService;
        modeController?: ModeControllerService;
        dependencyTracker?: Tracker;
        changedItemsController?: ChangedItemsController;
    });
    /** @type {IdService} */
    idService: IdService;
    /** @type {ModeControllerService} */
    modeController: ModeControllerService;
    /** @type {Tracker} */
    dependencyTracker: Tracker;
    /** @type {ChangedItemsController} */
    changedItemsController: ChangedItemsController;
    /** @type {string} */
    name: string;
    /**
     * Installs a plugin into this context.
     * @param {import('../types.js').Store2Plugin} plugin
     * @returns {this}
     */
    use(plugin: Store2Plugin): this;
    /**
     * Registers an action middleware.
     * @param {import('../types.js').ActionMiddleware} middleware
     * @returns {this}
     */
    addMiddleware(middleware: ActionMiddleware): this;
    /**
     * Registers a root for snapshot/hydrate. The root must implement
     * `serialize()` and `hydrate(data)`.
     * @param {string} name
     * @param {import('../types.js').SnapshotRoot} root
     * @returns {this}
     */
    registerRoot(name: string, root: SnapshotRoot): this;
    /**
     * Unregisters a previously registered root.
     * @param {string} name
     * @returns {boolean}
     */
    unregisterRoot(name: string): boolean;
    /**
     * Returns the names of all roots currently registered with registerRoot()
     *
     * @returns {Array<string>}
     */
    getRootNames(): Array<string>;
    /**
     * Returns a copy of the plugins installed via use().
     *
     * @returns {Array<import('../types.js').Store2Plugin>}
     */
    get plugins(): Store2Plugin[];
    /**
     * Returns a copy of the middleware chain installed via addMiddleware()
     *
     * @returns {Array<import('../types.js').ActionMiddleware>}
     */
    get middlewares(): ActionMiddleware[];
    /**
     * Invokes a lifecycle hook on every installed plugin. Plugin errors are
     * caught and logged. When plugins are suspended (e.g. during time-travel),
     * calls are ignored.
     * @param {string} hook
     * @param {...any} args
     */
    emitPlugin(hook: string, ...args: any[]): void;
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
    batch(nameOrFn: string | Function, fn?: Function): any;
    /**
     * Runs `fn` as a named action. Supports async bodies and middleware.
     * @param {string} name
     * @param {(action: import('../types.js').ActionInfo) => any} fn
     * @param {any} [payload]
     * @returns {Promise<any>}
     */
    action(name: string, fn: (action: ActionInfo) => any, payload?: any): Promise<any>;
    /**
     * Flushes pending subscribers synchronously.
     */
    flush(): void;
    /**
     * Captures a serializable snapshot of every registered root.
     * @returns {import('../types.js').ContextSnapshot}
     */
    snapshot(): ContextSnapshot;
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
    hydrate(snapshot: ContextSnapshot, options?: {
        timeTravel?: boolean;
    }): void;
    /**
     * Releases the context and forgets all installed plugins and roots.
     */
    dispose(): void;
    #private;
}

/**
 * Plugin contract. Every hook is optional.
 *
 * Plugins are installed via `context.use(plugin)`. Plugin errors are caught
 * and logged; a plugin cannot break reactivity by throwing.
 *
 * @public
 */
export declare interface Store2Plugin {
    /**
     * Debug name, used in error logs. Should be unique per context.
     */
    name: string;
    /**
     * Called once when the plugin is installed. Receives the context the
     * plugin will observe.
     */
    install(context: Store2Context): void;
    /**
     * Called when an action begins.
     */
    onActionStart?(action: ActionInfo): void;
    /**
     * Called when an action finishes, successfully or with an error. The
     * `action.error` field is set when the body threw.
     */
    onActionEnd?(action: ActionInfo): void;
    /**
     * Called when the outermost batch begins.
     */
    onBatchStart?(info: BatchInfo): void;
    /**
     * Called when the outermost batch ends.
     */
    onBatchEnd?(info: BatchInfo): void;
    /**
     * Called for every effective property change on a reactive item.
     */
    onUpdate?(item: ReactiveItem, property: string, record: UpdateDataRecord): void;
    /**
     * Called after a computed's value changes, with the previous and new
     * values.
     */
    onComputedRecalc?(item: ReactiveItem, oldValue: any, newValue: any): void;
    /**
     * Called before a subscriber runs, with the item and its pending
     * updates.
     */
    onSubscriberRun?(item: ReactiveItem, updates: Map<string, UpdateDataRecord>): void;
    /**
     * Called after a reactive item is destroyed.
     */
    onDestroy?(item: ReactiveItem): void;
    /**
     * Called when a computed throws during evaluation.
     */
    onError?(item: ReactiveItem, error: Error): void;
}

/**
 * Manages change subscriptions and lifecycle hooks for a reactive item.
 * Uses a single EventEmitter for all events: 'change' and 'destroy'.
 */
declare class SubscribeController {
    /**
     * @param {import('../reactives/ReactiveItem.js').ReactiveItem} reactiveItem
     */
    constructor(reactiveItem: ReactiveItem);
    /**
     * Returns a copy of the current 'change' subscriber list.
     * @returns {Function[]}
     */
    getSubscribers(): Function[];
    /**
     * Subscribes a callback to the 'change' event.
     *
     * @param {(updates: Map<string, import('./UpdateDataRecord.js').UpdateDataRecord>) => void} fn
     * @param {{ delay?: number, signal?: AbortSignal }} [options]
     * @returns {() => void}
     */
    subscribe(fn: (updates: Map<string, UpdateDataRecord>) => void, options?: {
        delay?: number;
        signal?: AbortSignal;
    }): () => void;
    /**
     * Removes all 'change' subscribers.
     * Internal listeners (has/no subscribers) remain intact.
     */
    clearSubscribers(): void;
    /**
     * Removes all subscribers, including internal listeners.
     */
    clearAllSubscribers(): void;
    /**
     * Returns whether there are any 'change' subscribers.
     * @returns {boolean}
     */
    hasSubscribers(): boolean;
    /**
     * Destroys the controller, emits 'destroy', and removes all listeners.
     */
    destroy(): void;
    /**
     * Registers a callback that fires when the first 'change' subscriber is added.
     * @param {() => void} callback
     * @returns {() => void}
     */
    onHasSubscribers(callback: () => void): () => void;
    /**
     * Registers a callback that fires when the last 'change' subscriber is removed.
     * @param {() => void} callback
     * @returns {() => void}
     */
    onNoSubscribers(callback: () => void): () => void;
    /**
     * Registers a callback that fires when the controller is destroyed.
     * @param {() => void} callback
     * @returns {() => void}
     */
    onDestroy(callback: () => void): () => void;
    #private;
}

/**
 * Records reactive items read during a tracked execution (inside `Computed`,
 * `autorun`, or `reaction`).
 *
 * Scopes are nested: each `enable()` pushes a fresh store and each
 * `disable()` restores the previous one. This makes nested computed
 * construction and re-entrant tracking safe.
 */
export declare class Tracker {
    /**
     * @param {import('../services/modeController.js').ModeControllerService} [modeController]
     *        Used to honour `untrackMode`. Optional so that the tracker can be
     *        constructed in isolation for tests.
     */
    constructor(modeController?: ModeControllerService);
    /** @type {object} */
    ctx: object;
    /**
     * Returns a copy of the currently tracked items.
     * @returns {Set<import('../reactives/ReactiveItem.js').ReactiveItem>}
     */
    get data(): Set<ReactiveItem>;
    /**
     * Returns the currently tracked items sorted by engine id.
     * @returns {Array<import('../reactives/ReactiveItem.js').ReactiveItem>}
     */
    getAsSortedArray(): Array<ReactiveItem>;
    /**
     * Records a reactive item if tracking is active and untracked reads are
     * not currently suppressed.
     * @param {import('../reactives/ReactiveItem.js').ReactiveItem} item
     * @param {string} [_key]
     */
    add(item: ReactiveItem, _key?: string): void;
    /**
     * Registers a listener called for every tracked item.
     * @param {(item: import('../reactives/ReactiveItem.js').ReactiveItem) => void} callback
     * @returns {() => void}
     */
    onAdd(callback: (item: ReactiveItem) => void): () => void;
    /**
     * Returns true while tracking is active.
     * @returns {boolean}
     */
    isActive(): boolean;
    /**
     * Pushes a new tracking scope.
     * @param {object} [ctx]
     */
    enable(ctx?: object): void;
    /**
     * Pops the current tracking scope and restores the previous one.
     */
    disable(): void;
    #private;
}

/**
 * Runs `fn` without tracking reactive reads. Nesting is safe: the previous
 * state is restored on exit even if `fn` throws.
 * @template T
 * @param {() => T} fn
 * @returns {T}
 */
export declare function untrack<T>(fn: () => T): T;

/**
 * A single mutation state passed to subscribers.
 *
 * Every entry in the `updates` map received by a subscriber is an instance
 * of this class.
 *
 * @public
 */
export declare class UpdateDataRecord {
    /**
     * Creates a new update record.
     *
     * @param {"set"|"delete"} type - The operation that produced the change.
     * @param {any} oldValue - Value before the change.
     * @param {any} value - Value after the change.
     * @param {import('../reactives/ReactiveItem.js').ReactiveItem} [reactiveItem] - The reactive item that triggered the update.
     */
    constructor(type: "set" | "delete", oldValue: any, value: any, reactiveItem?: ReactiveItem);
    /** @type {"set"|"delete"} */
    type: "set" | "delete";
    /** @type {any} */
    value: any;
    /** @type {any} */
    oldValue: any;
    /** @type {import('../reactives/ReactiveItem.js').ReactiveItem|undefined} */
    reactiveItem: ReactiveItem | undefined;
}

/**
 * Returns a promise that resolves when `predicate` becomes true.
 * @param {() => boolean} predicate
 * @param {object} [options]
 * @param {number} [options.timeout]
 * @returns {Promise<void>}
 */
export declare function waitUntil(predicate: () => boolean, options?: {
    timeout?: number;
}): Promise<void>;

/**
 * Waits for `predicate` to become true, then runs `fn` once.
 * @param {() => boolean} predicate
 * @param {() => void} fn
 * @param {object} [options]
 * @param {number} [options.timeout]
 * @param {number} [options.delay]
 * @param {AbortSignal} [options.signal]
 * @returns {() => void}
 */
export declare function when(predicate: () => boolean, fn: () => void, options?: {
    timeout?: number;
    delay?: number;
    signal?: AbortSignal;
}): () => void;

export { }
