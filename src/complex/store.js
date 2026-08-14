// @ts-check

import { EventEmitter } from '@supercat1337/event-emitter';
import { UpdateDataRecordManager } from '../core/UpdateDataRecord.js';
import { ReactiveItem } from '../reactives/ReactiveItem.js';

/**
 * Store is a reactive container that holds a collection of reactive items.
 * You can add, remove and access items via methods of this class.
 * It also emits events when items are added, removed or updated.
 */
class Store {
    /**
     * @type {Map<string, ReactiveItem>}
     */
    #items = new Map();

    /**
     * @type {Map<string, Store>}
     */
    #childStores = new Map();

    /** @type {EventEmitter} */
    #eventEmitter;

    /** @type {boolean} */
    #isDestroyed = false;

    /** @type {Map<string, Set<Function>>} */
    #unsubscribers = new Map();

    /** @type {Map<string, import('../types.d.ts').UpdateDataRecord>} */
    #updates;

    /** @type {UpdateDataRecordManager} */
    #updatesManager;

    #keys = new WeakMap();

    #subscriber;

    #muted = false;
    #pendingUpdate = false;

    constructor() {
        this.#eventEmitter = new EventEmitter();

        this.#updates = new Map();
        this.#updatesManager = new UpdateDataRecordManager(this.#updates);

        const that = this;
        this.#eventEmitter.on('clear-updates', () => {
            that.#updates.clear();
        });

        this.#subscriber = (
            /** @type {Map<string, import('../types.d.ts').UpdateDataRecord>} */ updates,
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
     * @type {boolean}
     */
    get isDestroyed() {
        return this.#isDestroyed;
    }

    #notifySubscribers() {
        if (this.#muted) {
            this.#pendingUpdate = true;
        } else {
            this.#eventEmitter.emit('change');
            this.#eventEmitter.emit('clear-updates');
        }
    }

    /**
     * Adds a reactive item to the store with the given key.
     * @param {string} key - The key to use when adding the item to the store.
     * @param {ReactiveItem} reactiveItem - The reactive item to add to the store.
     * @throws {Error} If an item with the given key already exists in the store.
     */
    #addReactiveItem(key, reactiveItem) {
        if (this.#items.has(key)) {
            throw new Error(`Item with key ${key} already exists in the store.`);
        }

        this.#items.set(key, reactiveItem);
        this.#keys.set(reactiveItem, key);

        const that = this;
        // @ts-ignore
        const unsubscriber = reactiveItem.subscribe(this.#subscriber);
        const unsubscriber2 = reactiveItem.onDestroy(() => {
            that.#removeReactiveItem(key);
        });

        // Store unsubscribers in Map
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
     * Adds a child store with the given key to this store.
     * @param {string} storeName - The key to use when adding the child store to this store.
     * @param {Store} store - The child store to add to this store.
     * @throws {Error} If a child store with the given key already exists in this store.
     */
    #addStore(storeName, store) {
        if (this.#childStores.has(storeName)) {
            throw new Error(`Child store with key ${storeName} already exists in this store.`);
        }

        this.#childStores.set(storeName, store);
        const that = this;

        this.#keys.set(store, storeName);

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
     * Adds one or more reactive items to the store.
     * @param {{[key: string]: ReactiveItem|Store}} items
     * @throws {Error} If an item with the given key already exists in the store.
     * @throws {Error} If the store is destroyed.
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
     * Destroys the child store with the given key.
     * @param {string} key - The key of the child store to destroy.
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
     * Destroys the item with the given key, whether it's a reactive item or a child store.
     * @param {string} key - The key of the item or child store to destroy.
     */
    destroyItem(key) {
        if (this.isDestroyed) {
            throw new Error('Store has been destroyed');
        }

        this.#destroyReactiveItem(key);
        this.#destroyChildStore(key);
    }

    /**
     * Removes a reactive item from the store WITHOUT destroying it.
     * @param {string} key
     */
    #removeReactiveItem(key) {
        const item = this.#items.get(key);
        if (!item) {
            return;
        }

        this.#items.delete(key);
        this.#keys.delete(item);

        // Call and remove all unsubscribers
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
     * Removes a child store WITHOUT destroying it.
     * @param {string} key
     */
    #removeChildStore(key) {
        const store = this.#childStores.get(key);
        if (!store) {
            return;
        }

        this.#childStores.delete(key);
        this.#keys.delete(store);

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
     * Removes and DESTROYS a reactive item.
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
     * Removes the reactive item with the given key from the store (without destroying it).
     * @param {string} key - The key of the item to remove.
     */
    removeItem(key) {
        if (this.isDestroyed) {
            throw new Error('Store has been destroyed');
        }

        this.#removeReactiveItem(key);
        this.#removeChildStore(key);
    }

    /**
     * Destroys all reactive items stored in the Store.
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
     * Clears all reactive items from the store without destroying them.
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
     * Retrieves the reactive item with the given key.
     * @param {string} key
     * @returns {ReactiveItem|null}
     */
    #getReactiveItem(key) {
        return this.#items.get(key) || null;
    }

    /**
     * Retrieves the child store with the given key.
     * @param {string} key
     * @returns {Store|null}
     */
    #getChildStore(key) {
        return this.#childStores.get(key) || null;
    }

    /**
     * Retrieves the item with the given key.
     * @param {string} key
     * @returns {ReactiveItem|Store|null}
     */
    getItem(key) {
        if (this.isDestroyed) {
            throw new Error('Store has been destroyed');
        }
        return this.#getReactiveItem(key) || this.#getChildStore(key) || null;
    }

    /**
     * Checks if an item with the given key exists.
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
     * Retrieves the names of items stored.
     * @param {"all"|"reactives"|"stores"} [filter="all"]
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
     * Retrieves all items stored.
     * @param {"all"|"reactives"|"stores"} [filter="all"]
     * @returns {Map<string, ReactiveItem|Store>}
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

        /** @type {Map<string, ReactiveItem|Store>} */
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
     * Retrieves the value of this Store as a plain object.
     * @param {"all"|"reactives"|"stores"} [filter="all"]
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
     * Subscribes a function to be called whenever the value of this Store changes.
     * @param {(update: Map<string, import('../types.d.ts').UpdateDataRecord>, store: Store)=>void} fn
     * @returns {()=>void}
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
     * Subscribes a function to be called when this Store is destroyed.
     * @param {(store:Store)=>void} fn
     * @returns {()=>void}
     */
    onDestroy(fn) {
        if (this.isDestroyed) {
            throw new Error('Store has been destroyed');
        }

        return this.#eventEmitter.on('destroy', fn);
    }

    /**
     * Mutes the event emitter, preventing any updates from being triggered.
     */
    muteUpdates() {
        if (this.isDestroyed) {
            throw new Error('Store has been destroyed');
        }
        this.#muted = true;
    }

    /**
     * Unmutes the event emitter, allowing updates to be triggered.
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
     * Returns whether the event emitter is currently muted.
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
