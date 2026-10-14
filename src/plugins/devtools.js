// @ts-check

/**
 * A single entry in the DevTools history.
 *
 * @typedef {Object} DevToolsEntry
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
 * @typedef {Object} DevToolsOptions
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
class DevToolsPlugin {
    /**
     * Plugin identifier. Also used as the default display name in the
     * Redux DevTools Extension when no `name` option is provided.
     */
    name = 'devtools';

    /** @type {import('../core/context.js').Store2Context | null} */
    #context = null;

    /** @type {Array<DevToolsEntry>} */
    #entries = [];

    /** @type {number} */
    #maxAge;

    /** @type {number} */
    #nextId = 0;

    /** @type {number} */
    #currentIndex = -1;

    /** @type {any} */
    #extension = null;

    /** @type {(() => void) | null} */
    #extensionUnsubscribe = null;

    /** @type {boolean} */
    #isTimeTraveling = false;

    /** @type {Set<(entry: DevToolsEntry | null, index: number) => void>} */
    #listeners = new Set();

    /** @type {DevToolsOptions} */
    #options;

    /**
     * @param {DevToolsOptions} [options]
     */
    constructor(options = {}) {
        this.#maxAge = options.maxAge ?? 50;
        this.#options = options;
    }

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
    install(context) {
        this.#context = context;

        // Baseline snapshot. Taken before any action runs.
        this.#recordEntry('@@INIT', 0);

        if (this.#options.connectToExtension !== false) {
            this.#tryConnectToExtension();
        }
    }

    /**
     * Records a new history entry after an action completes.
     *
     * Called by the context's action lifecycle. Ignored while a time-travel
     * jump is in progress, so that rewinding does not itself appear as a
     * new action in the history.
     *
     * @param {import('../types.js').ActionInfo} action
     */
    onActionEnd(action) {
        if (this.#isTimeTraveling) {
            return;
        }

        const durationMs = action.endTime !== null ? action.endTime - action.startTime : 0;

        const entry = this.#recordEntry(action.name, durationMs);

        if (this.#extension && entry) {
            try {
                this.#extension.send(action.name, entry.snapshot);
            } catch (e) {
                console.warn('[store2-devtools] failed to send to extension:', e);
            }
        }
    }

    /**
     * Appends a new entry to the history, truncating any future entries that
     * were superseded by a time-travel followed by a fresh action.
     *
     * @param {string} name
     * @param {number} durationMs
     * @returns {DevToolsEntry | null}
     */
    #recordEntry(name, durationMs) {
        if (!this.#context) {
            return null;
        }

        // Truncate future history: we are about to record a new action after
        // having jumped back in time.
        if (this.#currentIndex < this.#entries.length - 1) {
            this.#entries.splice(this.#currentIndex + 1);
        }

        /** @type {DevToolsEntry} */
        const entry = {
            id: this.#nextId++,
            name,
            timestamp: Date.now(),
            durationMs,
            snapshot: this.#context.snapshot(),
        };

        this.#entries.push(entry);

        while (this.#entries.length > this.#maxAge) {
            this.#entries.shift();
        }

        this.#currentIndex = this.#entries.length - 1;
        this.#emitChange();

        return entry;
    }

    #emitChange() {
        const entry = this.#entries[this.#currentIndex] || null;
        for (const listener of this.#listeners) {
            try {
                listener(entry, this.#currentIndex);
            } catch (e) {
                console.error('[store2-devtools] listener threw:', e);
            }
        }
    }

    /**
     * Returns a shallow copy of the recorded history.
     *
     * The returned array is newly allocated; mutating it does not affect
     * the plugin. The snapshot objects inside each entry are shared by
     * reference — treat them as immutable.
     *
     * @returns {Array<DevToolsEntry>}
     */
    getHistory() {
        return this.#entries.map(e => ({ ...e }));
    }

    /**
     * Returns the index of the entry the plugin is currently positioned at.
     *
     * Entry `0` is the baseline; higher indices correspond to completed
     * actions in order. Returns `-1` if the plugin has not been installed
     * yet.
     *
     * @returns {number}
     */
    getCurrentIndex() {
        return this.#currentIndex;
    }

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
    getCurrentEntry() {
        return this.#entries[this.#currentIndex] ?? null;
    }

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
    jumpTo(index) {
        if (!this.#context) {
            return;
        }
        if (index < 0 || index >= this.#entries.length) {
            return;
        }
        if (index === this.#currentIndex) {
            return;
        }

        const entry = this.#entries[index];

        this.#isTimeTraveling = true;
        try {
            this.#context.hydrate(entry.snapshot, { timeTravel: true });
            this.#currentIndex = index;
        } finally {
            this.#isTimeTraveling = false;
        }

        this.#emitChange();
    }

    /**
     * Clears the history and records a fresh baseline.
     *
     * Called by the plugin itself in response to a `RESET` message from the
     * Redux DevTools Extension, or directly by user code. After this call,
     * the history contains exactly one entry: the new baseline.
     */
    reset() {
        this.#entries.length = 0;
        this.#currentIndex = -1;
        this.#nextId = 0;
        this.#recordEntry('@@INIT', 0);
    }

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
    subscribe(fn) {
        this.#listeners.add(fn);
        return () => {
            this.#listeners.delete(fn);
        };
    }

    /**
     * Detaches from the Redux DevTools Extension, if connected.
     *
     * Safe to call when no extension is connected or after the plugin was
     * installed with `connectToExtension: false`. Idempotent.
     */
    disconnect() {
        if (this.#extensionUnsubscribe) {
            try {
                this.#extensionUnsubscribe();
            } catch (e) {
                console.warn('[store2-devtools] failed to unsubscribe:', e);
            }
            this.#extensionUnsubscribe = null;
        }
        this.#extension = null;
    }

    #tryConnectToExtension() {
        const g = /** @type {any} */ (globalThis);
        const ext = g.__REDUX_DEVTOOLS_EXTENSION__;

        if (!ext || typeof ext.connect !== 'function') {
            return;
        }

        try {
            this.#extension = ext.connect({
                name: this.#options.name || 'store2',
                features: {
                    pause: false,
                    lock: false,
                    persist: false,
                    export: true,
                    import: 'custom',
                    jump: true,
                    skip: false,
                    reorder: false,
                    dispatch: false,
                    test: false,
                },
            });

            if (this.#context) {
                try {
                    this.#extension.init(this.#context.snapshot());
                } catch (e) {
                    console.warn('[store2-devtools] extension.init failed:', e);
                }
            }

            if (typeof this.#extension.subscribe === 'function') {
                const unsubscribe = this.#extension.subscribe(
                    /** @param {any} message */ message => {
                        this.#handleExtensionMessage(message);
                    }
                );
                if (typeof unsubscribe === 'function') {
                    this.#extensionUnsubscribe = unsubscribe;
                }
            }
        } catch (e) {
            console.warn('[store2-devtools] failed to connect to extension:', e);
            this.#extension = null;
        }
    }

    /**
     * Handles messages from the Redux DevTools Extension.
     *
     * The extension tracks actions independently of our history. We sent the
     * baseline via `init()`, so its action list is offset by one relative to
     * our entry list: extension action `N` corresponds to our entry `N + 1`.
     * `JUMP_TO_STATE` refers to the initial state, i.e. our entry `0`.
     *
     * @param {any} message
     */
    #handleExtensionMessage(message) {
        if (!message || typeof message !== 'object') {
            return;
        }
        if (message.type !== 'DISPATCH') {
            return;
        }

        const payload = message.payload;
        if (!payload) {
            return;
        }

        if (payload.type === 'JUMP_TO_ACTION') {
            const extIndex = Number(payload.actionId);
            if (Number.isFinite(extIndex)) {
                this.jumpTo(extIndex + 1);
            }
        } else if (payload.type === 'JUMP_TO_STATE') {
            this.jumpTo(0);
        } else if (payload.type === 'RESET') {
            this.reset();
        }
    }
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
function createDevToolsPlugin(options = {}) {
    return new DevToolsPlugin(options);
}

export { DevToolsPlugin, createDevToolsPlugin };
