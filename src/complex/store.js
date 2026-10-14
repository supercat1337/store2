// @ts-check

import { EventEmitter } from '@supercat1337/event-emitter';
import { UpdateDataRecordManager } from '../core/UpdateDataRecord.js';
import { ReactiveItem } from '../reactives/ReactiveItem.js';

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
class Store {
    /**
     * Local path of this store within its parent. Empty for the root store.
     * The full path is available via `getPath()`.
     * @type {string}
     */
    path = '';

    /** @type {Map<string, ReactiveItem>} */
    #items = new Map();

    /** @type {Map<string, Store>} */
    #childStores = new Map();

    /** @type {EventEmitter} */
    #eventEmitter;

    /** @type {boolean} */
    #isDestroyed = false;

    /** @type {Map<string, Set<Function>>} */
    #unsubscribers = new Map();

    /** @type {Map<string, import('../core/UpdateDataRecord.js').UpdateDataRecord>} */
    #updates;

    /** @type {UpdateDataRecordManager} */
    #updatesManager;

    #keys = new WeakMap();

    #subscriber;

    #muted = false;
    #pendingUpdate = false;

    /** @type {Store | null} */
    #parentStore = null;

    /** @type {number} */
    #version = 0;

    /**
     * Creates a new empty Store.
     */
    constructor() {
        this.#eventEmitter = new EventEmitter();

        this.#updates = new Map();
        this.#updatesManager = new UpdateDataRecordManager(this.#updates);

        const that = this;
        this.#eventEmitter.on('clear-updates', () => {
            that.#updates.clear();
        });

        this.#subscriber = (
            /** @type {Map<string, import('../core/UpdateDataRecord.js').UpdateDataRecord>} */ updates,
            /** @type {Store} */ store
        ) => {
            const storeName = that.#keys.get(store) || '';

            updates.forEach((update, localKey) => {
                if (!update.reactiveItem) {
                    return;
                }

                if (storeName === '') {
                    const key = that.#keys.get(update.reactiveItem);
                    const fullPath = localKey === '' ? key : key + '.' + localKey;
                    that.#updates.set(fullPath, update);
                } else {
                    const fullPath = storeName + '.' + localKey;
                    that.#updates.set(fullPath, update);
                }
            });
            that.#notifySubscribers();
        };
    }

    /**
     * Returns `true` after `destroy()` has been called.
     *
     * After destruction, all mutating methods throw and only this getter
     * remains safe to call.
     *
     * @returns {boolean}
     */
    get isDestroyed() {
        return this.#isDestroyed;
    }

    /**
     * Returns the full path of this store by walking up the parent chain.
     *
     * For a root store, returns `path` — which is `''` unless the user set
     * it manually. For a child store, returns `"parent.getPath() + '.' +
     * this.path"`.
     *
     * @returns {string}
     */
    getPath() {
        if (this.#parentStore) {
            const parentPath = this.#parentStore.getPath();
            return parentPath ? `${parentPath}.${this.path}` : this.path;
        }
        return this.path;
    }

    /**
     * Monotonic version counter, bumped on every store-level notification.
     *
     * The value is stable between notifications, which makes it suitable
     * as a snapshot token for `useSyncExternalStore` and similar APIs.
     *
     * @returns {number}
     */
    getVersion() {
        if (this.#isDestroyed) {
            throw new Error('Store has been destroyed');
        }
        return this.#version;
    }

    /**
     * Returns a minimal observable facade for framework adapters.
     *
     * - `get()` returns a fresh plain-object snapshot via `toJSON()`.
     * - `subscribe(fn)` invokes `fn` with the snapshot on every effective
     *   store-level change.
     * - `version()` returns the monotonic version, suitable as a token for
     *   `useSyncExternalStore`.
     *
     * @returns {import('../types.js').ObservableValue<any>}
     */
    toObservable() {
        const self = this;
        return {
            get() {
                return self.toJSON();
            },
            subscribe(fn) {
                return self.subscribe(() => {
                    fn(self.toJSON());
                });
            },
            version() {
                return self.getVersion();
            },
        };
    }

    #notifySubscribers() {
        if (this.#muted) {
            this.#pendingUpdate = true;
            return;
        }
        this.#version++;
        this.#eventEmitter.emit('change');
        this.#eventEmitter.emit('clear-updates');
    }

    /**
     * @param {string} key
     * @param {ReactiveItem} reactiveItem
     */
    #addReactiveItem(key, reactiveItem) {
        if (this.#items.has(key)) {
            throw new Error(`Item with key ${key} already exists in the store.`);
        }

        this.#items.set(key, reactiveItem);
        this.#keys.set(reactiveItem, key);
        reactiveItem.path = key;

        const that = this;
        // @ts-ignore
        const unsubscriber = reactiveItem.subscribe(this.#subscriber);
        const unsubscriber2 = reactiveItem.onDestroy(() => {
            that.#removeReactiveItem(key);
        });

        if (!this.#unsubscribers.has(key)) {
            this.#unsubscribers.set(key, new Set());
        }
        const set = this.#unsubscribers.get(key);
        if (set) {
            set.add(unsubscriber);
            set.add(unsubscriber2);
        }
    }

    /**
     * @param {string} storeName
     * @param {Store} store
     */
    #addStore(storeName, store) {
        if (this.#childStores.has(storeName)) {
            throw new Error(`Child store with key ${storeName} already exists in this store.`);
        }

        this.#childStores.set(storeName, store);
        this.#keys.set(store, storeName);
        store.path = storeName;
        store.#parentStore = this;

        const that = this;

        const unsubscriber = store.subscribe(this.#subscriber);
        const unsubscriber2 = store.onDestroy(() => {
            that.#removeChildStore(storeName);
        });

        if (!this.#unsubscribers.has(storeName)) {
            this.#unsubscribers.set(storeName, new Set());
        }
        const set = this.#unsubscribers.get(storeName);
        if (set) {
            set.add(unsubscriber);
            set.add(unsubscriber2);
        }
    }

    /**
     * Adds reactive items or child stores to the store under the given keys.
     *
     * Throws if a key is already registered, or if a value is neither a
     * `ReactiveItem` nor a `Store`.
     *
     * @param {{[key: string]: ReactiveItem | Store}} items
     */
    addItems(items) {
        if (this.isDestroyed) {
            throw new Error('Store has been destroyed');
        }

        for (const [key, item] of Object.entries(items)) {
            if (item instanceof Store) {
                this.#addStore(key, item);
            } else if (item instanceof ReactiveItem) {
                this.#addReactiveItem(key, item);
            }
        }
    }

    /**
     * @param {string} key
     */
    #destroyChildStore(key) {
        const childStore = this.#childStores.get(key);
        if (!childStore) {
            return;
        }
        this.#removeChildStore(key);
        childStore.destroy();
    }

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
    destroyItem(key) {
        if (this.isDestroyed) {
            throw new Error('Store has been destroyed');
        }

        this.#destroyReactiveItem(key);
        this.#destroyChildStore(key);
    }

    /**
     * @param {string} key
     */
    #removeReactiveItem(key) {
        const item = this.#items.get(key);
        if (!item) {
            return;
        }

        this.#items.delete(key);
        this.#keys.delete(item);

        const set = this.#unsubscribers.get(key);
        if (set) {
            for (const fn of set) {
                fn();
            }
            this.#unsubscribers.delete(key);
        }

        this.#updatesManager.removeItem(key);
        this.#notifySubscribers();
    }

    /**
     * @param {string} key
     */
    #removeChildStore(key) {
        const store = this.#childStores.get(key);
        if (!store) {
            return;
        }

        this.#childStores.delete(key);
        this.#keys.delete(store);
        store.#parentStore = null;

        const set = this.#unsubscribers.get(key);
        if (set) {
            for (const fn of set) {
                fn();
            }
            this.#unsubscribers.delete(key);
        }

        this.#updatesManager.removeItem(key);
        this.#notifySubscribers();
    }

    /**
     * @param {string} key
     */
    #destroyReactiveItem(key) {
        const item = this.#items.get(key);
        if (!item) {
            return;
        }

        this.#removeReactiveItem(key);
        item.destroy();
    }

    /**
     * Removes the item or child store registered under `key` from the
     * store, without destroying it.
     *
     * The removed item remains usable and can be re-added to a store (this
     * one or another). No-op if the key is not present.
     *
     * @param {string} key
     */
    removeItem(key) {
        if (this.isDestroyed) {
            throw new Error('Store has been destroyed');
        }

        this.#removeReactiveItem(key);
        this.#removeChildStore(key);
    }

    /**
     * Destroys the store and every item and child store inside it.
     *
     * After this call, all mutating methods throw. Idempotent — subsequent
     * calls are no-ops.
     */
    destroy() {
        if (this.#isDestroyed) {
            return;
        }

        this.#isDestroyed = true;

        this.#items.forEach((item, key) => {
            this.#destroyReactiveItem(key);
        });
        this.#items.clear();

        this.#childStores.forEach((childStore, key) => {
            this.#destroyChildStore(key);
        });
        this.#childStores.clear();

        this.#updates.clear();
        // @ts-ignore
        this.#updatesManager = null;

        this.#eventEmitter.emit('destroy', this);
        this.#eventEmitter.removeAllListeners({ removeInternalListeners: true });

        this.#unsubscribers.clear();
    }

    /**
     * Removes all items and child stores without destroying them.
     *
     * After this call the store is empty, but the detached items continue
     * to work and can be re-added elsewhere.
     */
    detachAll() {
        if (this.isDestroyed) {
            throw new Error('Store has been destroyed');
        }

        this.#items.forEach((item, key) => {
            this.#removeReactiveItem(key);
        });
        this.#items.clear();

        this.#childStores.forEach((childStore, key) => {
            this.#removeChildStore(key);
        });
        this.#childStores.clear();

        this.#unsubscribers.clear();
    }

    /**
     * @param {string} key
     * @returns {ReactiveItem | null}
     */
    #getReactiveItem(key) {
        return this.#items.get(key) || null;
    }

    /**
     * @param {string} key
     * @returns {Store | null}
     */
    #getChildStore(key) {
        return this.#childStores.get(key) || null;
    }

    /**
     * Returns the item or child store registered under `key`, or `null` if
     * the key is not present.
     *
     * @param {string} key
     * @returns {ReactiveItem | Store | null}
     */
    getItem(key) {
        if (this.isDestroyed) {
            throw new Error('Store has been destroyed');
        }
        return this.#getReactiveItem(key) || this.#getChildStore(key) || null;
    }

    /**
     * Returns `true` if `key` is registered as either a reactive item or a
     * child store.
     *
     * @param {string} key
     * @returns {boolean}
     */
    hasItem(key) {
        if (this.isDestroyed) {
            throw new Error('Store has been destroyed');
        }
        return this.#items.has(key) || this.#childStores.has(key);
    }

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
    getItemNames(filter = 'all') {
        if (this.isDestroyed) {
            throw new Error('Store has been destroyed');
        }

        if (filter === 'reactives') {
            return Array.from(this.#items.keys());
        } else if (filter === 'stores') {
            return Array.from(this.#childStores.keys());
        }

        return Array.from(this.#items.keys()).concat(Array.from(this.#childStores.keys()));
    }

    /**
     * Returns the store's contents as a `Map`.
     *
     * The `filter` argument narrows the result the same way as in
     * `getItemNames()`.
     *
     * @param {"all" | "reactives" | "stores"} [filter="all"]
     * @returns {Map<string, ReactiveItem | Store>}
     */
    toMap(filter = 'all') {
        if (this.isDestroyed) {
            throw new Error('Store has been destroyed');
        }

        if (filter === 'reactives') {
            return this.#items;
        } else if (filter === 'stores') {
            return this.#childStores;
        }

        /** @type {Map<string, ReactiveItem | Store>} */
        const result = new Map(this.#items);

        this.#childStores.forEach((store, key) => {
            result.set(key, store);
        });

        return result;
    }

    #itemsToJSON() {
        const object = {};
        this.#items.forEach((item, key) => {
            // @ts-ignore
            object[key] = item.getValue();
        });
        return object;
    }

    #childStoresToJSON() {
        const object = {};
        this.#childStores.forEach((store, key) => {
            // @ts-ignore
            object[key] = store.toJSON();
        });
        return object;
    }

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
    toJSON(filter = 'all') {
        if (this.isDestroyed) {
            throw new Error('Store has been destroyed');
        }

        if (filter === 'reactives') {
            return this.#itemsToJSON();
        } else if (filter === 'stores') {
            return this.#childStoresToJSON();
        }

        const object = {
            ...this.#itemsToJSON(),
            ...this.#childStoresToJSON(),
        };
        return object;
    }

    /**
     * Serializes the store and its children.
     *
     * Items whose `serialize()` returns `null` — notably `Computed` — are
     * omitted. The output is suitable for `hydrate()` and for JSON
     * transport.
     *
     * @returns {any}
     */
    serialize() {
        /** @type {{[key: string]: any}} */
        const items = {};
        this.#items.forEach((item, key) => {
            const data = item.serialize();
            if (data !== null && data !== undefined) {
                items[key] = data;
            }
        });

        /** @type {{[key: string]: any}} */
        const stores = {};
        this.#childStores.forEach((store, key) => {
            stores[key] = store.serialize();
        });

        return {
            type: 'store',
            items,
            stores,
        };
    }

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
    hydrate(data) {
        if (!data || typeof data !== 'object' || data.type !== 'store') {
            return;
        }

        if (data.items && typeof data.items === 'object') {
            for (const [key, itemData] of Object.entries(data.items)) {
                const item = this.#items.get(key);
                if (item) {
                    item.hydrate(itemData);
                }
            }
        }

        if (data.stores && typeof data.stores === 'object') {
            for (const [key, storeData] of Object.entries(data.stores)) {
                const store = this.#childStores.get(key);
                if (store) {
                    store.hydrate(storeData);
                }
            }
        }
    }

    /**
     * Subscribes a function to changes across the store's contents.
     *
     * The callback receives a `Map` of dot-separated update paths to
     * `UpdateDataRecord` instances, plus this store as the second
     * argument. It is invoked once per child change propagated up to this
     * store.
     *
     * @param {(update: Map<string, import('../core/UpdateDataRecord.js').UpdateDataRecord>, store: Store) => void} fn
     * @returns {() => void} An unsubscribe function.
     */
    subscribe(fn) {
        if (this.isDestroyed) {
            throw new Error('Store has been destroyed');
        }

        const that = this;
        return this.#eventEmitter.on('change', () => {
            fn(that.#updates, that);
        });
    }

    /**
     * Registers a callback fired when the store is destroyed.
     *
     * @param {(store: Store) => void} fn
     * @returns {() => void} An unsubscribe function.
     */
    onDestroy(fn) {
        if (this.isDestroyed) {
            throw new Error('Store has been destroyed');
        }

        return this.#eventEmitter.on('destroy', fn);
    }

    /**
     * Suppresses change notifications until `unmuteUpdates()` is called.
     *
     * Mutations that happen while muted are still applied and their
     * updates accumulated; subscribers are notified once, with everything,
     * when the store is unmuted.
     */
    muteUpdates() {
        if (this.isDestroyed) {
            throw new Error('Store has been destroyed');
        }
        this.#muted = true;
    }

    /**
     * Resumes change notifications after `muteUpdates()`.
     *
     * If any updates accumulated while muted, subscribers are notified
     * immediately with the full set.
     */
    unmuteUpdates() {
        if (this.isDestroyed) {
            throw new Error('Store has been destroyed');
        }
        this.#muted = false;
        if (this.#pendingUpdate) {
            this.#pendingUpdate = false;
            this.#notifySubscribers();
        }
    }

    /**
     * Returns `true` if change notifications are currently suppressed.
     *
     * @returns {boolean}
     */
    isMuted() {
        if (this.isDestroyed) {
            throw new Error('Store has been destroyed');
        }
        return this.#muted;
    }
}

export { Store };
