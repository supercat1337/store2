// @ts-check

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
export type ReactiveItemType = 1 | 2 | 3 | 4;

/**
 * A function that compares two values for equality. Used by reactive items
 * to decide whether a mutation is effective.
 *
 * @public
 */
export type CompareFunction = (a: any, b: any) => boolean;

/**
 * Metadata about a single logical user action.
 *
 * Actions are the unit of work that DevTools, loggers, and time-travel
 * plugins reason about. An `ActionInfo` is created by
 * `Store2Context.action()` and passed to middleware and lifecycle hooks.
 *
 * @public
 */
export interface ActionInfo {
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
 * Metadata about a batch scope. Emitted to plugins via `onBatchStart` and
 * `onBatchEnd`.
 *
 * @public
 */
export interface BatchInfo {
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
 * A serializable snapshot of an entire context.
 *
 * `roots` maps the name given at `registerRoot()` time to that root's own
 * `serialize()` output. The snapshot is JSON-safe by construction — every
 * `serialize()` implementation returns plain objects, arrays, and
 * primitives.
 *
 * @public
 */
export interface ContextSnapshot {
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
    roots: { [rootName: string]: any };
}

/**
 * Minimal interface a context root must satisfy to be snapshotted.
 *
 * `Store` and `ReactiveList` implement this interface out of the box.
 *
 * @public
 */
export interface SnapshotRoot {
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
 * Plugin contract. Every hook is optional.
 *
 * Plugins are installed via `context.use(plugin)`. Plugin errors are caught
 * and logged; a plugin cannot break reactivity by throwing.
 *
 * @public
 */
export interface Store2Plugin {
    /**
     * Debug name, used in error logs. Should be unique per context.
     */
    name: string;

    /**
     * Called once when the plugin is installed. Receives the context the
     * plugin will observe.
     */
    install(context: import('./core/context.js').Store2Context): void;

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
    onUpdate?(
        item: import('./reactives/ReactiveItem.js').ReactiveItem,
        property: string,
        record: import('./core/UpdateDataRecord.js').UpdateDataRecord
    ): void;

    /**
     * Called after a computed's value changes, with the previous and new
     * values.
     */
    onComputedRecalc?(
        item: import('./reactives/ReactiveItem.js').ReactiveItem,
        oldValue: any,
        newValue: any
    ): void;

    /**
     * Called before a subscriber runs, with the item and its pending
     * updates.
     */
    onSubscriberRun?(
        item: import('./reactives/ReactiveItem.js').ReactiveItem,
        updates: Map<string, import('./core/UpdateDataRecord.js').UpdateDataRecord>
    ): void;

    /**
     * Called after a reactive item is destroyed.
     */
    onDestroy?(item: import('./reactives/ReactiveItem.js').ReactiveItem): void;

    /**
     * Called when a computed throws during evaluation.
     */
    onError?(item: import('./reactives/ReactiveItem.js').ReactiveItem, error: Error): void;
}

/**
 * Middleware invoked for every action. Must call `next()` to continue the
 * chain. Returning without calling `next()` short-circuits the action.
 *
 * @public
 */
export type ActionMiddleware = (action: ActionInfo, next: () => Promise<any>) => Promise<any>;
