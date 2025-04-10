// @ts-check

import { EventEmitterExt } from "@supercat1337/event-emitter-ext";
import {
    UpdateDataRecord,
    UpdateDataRecordManager,
} from "../core/UpdateDataRecord.js";
import { ReactivePrimitive } from "../reactives/reactivePrimitive.js";
import { Dictionary } from "@supercat1337/dictionary";

/**
 * Store is a reactive container that holds a collection of reactive items.
 * You can add, remove and access items via methods of this class.
 * It also emits events when items are added, removed or updated.
 * @example
 * ```js
 * const store = new Store();
 * const a = atom(0);
 * const b = atom(0);
 *
 * const childStore = new Store();
 * const sum = computed(() => a.value + b.value);
 * childStore.addItems({ sum });
 *
 * store.addItems({ a, b, childStore });
 *
 * store.subscribe((updates) => {
 *     let updatesArr = Array.from(updates.keys());
 *     console.log("props", updatesArr);
 * });
 *
 * // mute updates
 * store.muteUpdates();
 * childStore.removeItem("childStore");
 * a.value = 3;
 * b.value = 4;
 * store.unmuteUpdates();
 * // outputs
 * // props [ 'a', 'childStore.sum', 'b' ]
 *
 * // without mute updates
 *
 * a.value = 1;
 * // outputs
 * // props [ 'a' ]
 * // props [ 'childStore.sum' ]
 *
 * b.value = 2;
 * // outputs
 * //props [ 'b' ]
 * //props [ 'childStore.sum' ]
 *
 * // using batch
 * batch(() => {
 *     a.value = 2;
 *     b.value = 3;
 * });
 * // outputs
 * // props [ 'a' ]
 * // props [ 'childStore.sum' ]
 * ```
 */
class Store {
    /**
     * @type {Map<string, ReactivePrimitive>}
     */
    #items = new Map();
    /**
     * @type {Map<string, Store>}
     */
    #childStores = new Map();

    /** @type {EventEmitterExt<"change"|"destroy"|"clear-updates">} */
    eventEmitter;

    /** @type {boolean} */
    #isDestroyed = false;

    /** @type {Dictionary<()=>void>} */
    #unsubscribers = new Dictionary();

    /** @type {Map<string, UpdateDataRecord>} */
    #updates;

    /** @type {UpdateDataRecordManager} */
    #updatesManager;

    #keys = new WeakMap();

    #subscriber;

    constructor() {
        this.eventEmitter = new EventEmitterExt();
        this.eventEmitter.registerEvents("change", "destroy", "clear-updates");
        this.eventEmitter.setListenerRunnerStrategy(1);

        this.#updates = new Map();
        this.#updatesManager = new UpdateDataRecordManager(this.#updates);

        let that = this;
        this.eventEmitter.on("clear-updates", () => {
            //console.log("clear-updates");
            //console.log(that.#updates);
            that.#updates.clear();
        });

        this.#subscriber = (
            /** @type {Map<string, UpdateDataRecord>} */ updates,
            /** @type {Store} */ store
        ) => {
            let storeName = that.#keys.get(store) || "";

            updates.forEach((update, localKey) => {
                if (!update.reactiveItem) return;

                if (storeName == "") {
                    let key = that.#keys.get(update.reactiveItem);
                    let fullPath = localKey == "" ? key : key + "." + localKey;
                    that.#updates.set(fullPath, update);
                } else {
                    let fullPath = storeName + "." + localKey;
                    that.#updates.set(fullPath, update);
                }
            });
            that.#notifySubscribers();
        };
    }

    /**
     * This property is set to true when the store is destroyed, and false otherwise.
     * It is used to prevent further modifications to the store after it has been destroyed.
     * @type {boolean}
     * @example
     * ```js
     * const store = new Store();
     *
     * const store2 = new Store();
     * const a = atom(1);
     *
     * store2.addItems({ a });
     * store.addItems({ store2 });
     *
     * console.log(store.hasItem("store2")); // output: true
     *
     * store2.destroy();
     * console.log(store2.hasItem("a")); // output: false
     * console.log(store.hasItem("store2")); // output: false
     * console.log(a.isDestroyed); // output: true
     * ```
     */
    get isDestroyed() {
        return this.#isDestroyed;
    }

    #notifySubscribers() {
        this.eventEmitter.emit("change");
        this.eventEmitter.emit("clear-updates");
    }

    /**
     * Adds a reactive item to the store with the given key.
     * @param {string} key - The key to use when adding the item to the store.
     * @param {ReactivePrimitive} reactiveItem - The reactive item to add to the store.
     * @throws {Error} If an item with the given key already exists in the store.
     */
    #addReactiveItem(key, reactiveItem) {
        if (this.#items.has(key)) {
            throw new Error(
                `Item with key ${key} already exists in the store.`
            );
        }

        this.#items.set(key, reactiveItem);
        this.#keys.set(reactiveItem, key);

        let that = this;
        let unsubscriber = reactiveItem.subscribe(this.#subscriber);

        let unsubscriber2 = reactiveItem.onDestroy(() => {
            /*
            that.#updates.set(
                key,
                new UpdateDataRecord(
                    "delete",
                    undefined,
                    undefined,
                    reactiveItem
                )
            );
            */
            that.#removeReactiveItem(key);
            //that.#notifySubscribers();
        });

        this.#unsubscribers.add(key, unsubscriber, unsubscriber2);
    }

    /**
     * Adds a child store with the given key to this store.
     * @param {string} storeName - The key to use when adding the child store to this store.
     * @param {Store} store - The child store to add to this store.
     * @throws {Error} If a child store with the given key already exists in this store.
     */
    #addStore(storeName, store) {
        if (this.#childStores.has(storeName)) {
            throw new Error(
                `Child store with key ${storeName} already exists in this store.`
            );
        }

        this.#childStores.set(storeName, store);
        let that = this;

        this.#keys.set(store, storeName);

        let unsubscriber = store.subscribe(this.#subscriber);

        let unsubscriber2 = store.onDestroy(() => {
            that.#removeChildStore(storeName);
            //that.#notifySubscribers();
        });

        this.#unsubscribers.add(storeName, unsubscriber, unsubscriber2);
    }

    /**
     * Adds one or more reactive items to the store. If an item is a child store, it will be added to the store.
     * @param {{[key: string]: ReactivePrimitive|Store}} items - An object where the keys are the keys to use when adding the items to the store and the values are the reactive items to add.
     * @throws {Error} If an item with the given key already exists in the store.
     * @throws {Error} If the store is destroyed.
     * @example
     * ```js
     * const store = new Store();
     * const a = atom(1);
     * store.addItems({ a });
     * console.log(store.hasItem("a")); // output: true
     * ```
     */
    addItems(items) {
        if (this.isDestroyed) {
            throw new Error("Cannot add items to a destroyed store.");
        }

        for (const [key, item] of Object.entries(items)) {
            if (item instanceof Store) {
                this.#addStore(key, item);
            } else if (item instanceof ReactivePrimitive) {
                this.#addReactiveItem(key, item);
            }
        }
    }

    /**
     * Destroys the child store with the given key. This method is useful for cleaning up after a child store
     * that is no longer needed. It calls destroy on the child store and removes the child store from this store.
     * @param {string} key - The key of the child store to destroy.
     * @returns {void}
     */
    #destroyChildStore(key) {
        let childStore = this.#childStores.get(key);
        if (!childStore) {
            return;
        }

        childStore.destroy();
        this.#childStores.delete(key);
        this.#unsubscribers.iterate(key, (unsubscriber) => {
            unsubscriber();
        });
    }

    /**
     * Destroys the reactive item with the given key. This method is useful for cleaning up after a reactive item
     * that is no longer needed. It calls destroy on the reactive item and removes the item from the store.
     * @param {string} key - The key of the item to destroy.
     * @returns {boolean} true if the item was destroyed, false otherwise.
     */
    #destroyReactiveItem(key) {
        let item = this.#items.get(key);
        if (!item) {
            return false;
        }

        item.destroy();

        this.#unsubscribers.iterate(key, (unsubscriber) => {
            unsubscriber();
        });

        this.#items.delete(key);

        return true;
    }

    /**
     * Destroys the item with the given key, whether it's a reactive item or a child store.
     * It first attempts to destroy a reactive item with the specified key, and if not found,
     * attempts to destroy a child store with the same key.
     * @param {string} key - The key of the item or child store to destroy.
     * @returns {void}
     */
    destroyItem(key) {
        this.#destroyReactiveItem(key);
        this.#destroyChildStore(key);
    }

    /**
     * Removes the reactive item with the given key from the store. This method does not call destroy on the item.
     * @param {string} key - The key of the item to remove.
     * @returns {void}
     */
    #removeReactiveItem(key) {
        let item = this.#items.get(key);
        if (!item) {
            return;
        }

        this.#updatesManager.removeItem(key);
        /*
        this.#updates.set(
            key,
            new UpdateDataRecord("delete", undefined, undefined, undefined)
        );
*/
        this.#notifySubscribers();
        this.#items.delete(key);
        this.#unsubscribers.iterate(key, (unsubscriber) => {
            unsubscriber();
        });
    }

    /**
     * Removes the child store with the given key from this store.
     * @param {string} key - The key of the child store to remove.
     * @returns {void}
     */
    #removeChildStore(key) {
        this.#updatesManager.removeItem(key);
        this.#notifySubscribers();

        this.#unsubscribers.iterate(key, (unsubscriber) => {
            unsubscriber();
        });
        this.#childStores.delete(key);
    }

    /**
     * Removes the reactive item with the given key from the store. This method does not call destroy on the item.
     * @param {string} key - The key of the item to remove.
     * @returns {void}
     */
    removeItem(key) {
        if (this.#items.has(key)) {
            this.#removeReactiveItem(key);
            return;
        }

        if (this.#childStores.has(key)) {
            this.#removeChildStore(key);
            return;
        }
    }

    /**
     * Destroys all reactive items stored in the Store. This method is useful for cleaning
     * up after a Store that is no longer needed. It calls destroy on each reactive item
     * in the store and clears the store of all items.
     */
    destroy() {
        if (this.#isDestroyed) {
            return;
        }

        this.#items.forEach((item, key) => {
            this.#destroyReactiveItem(key);
        });
        this.#items.clear();

        this.#childStores.forEach((childStore, key) => {
            this.#destroyChildStore(key);
        });

        this.#childStores.clear();

        this.eventEmitter.emit("destroy", this);
        this.eventEmitter.unregisterAllEvents();

        this.#isDestroyed = true;

        this.#unsubscribers.removeAll();
    }

    /**
     * Clears all reactive items from the store. This method is useful for resetting a Store to an empty state.
     * It removes all reactive items from the store and clears all child stores. It does not destroy the reactive items.
     */
    clear() {
        this.#items.forEach((item, key) => {
            this.#removeReactiveItem(key);
        });
        this.#items.clear();

        this.#childStores.forEach((childStore, key) => {
            this.#removeChildStore(key);
        });
        this.#childStores.clear();

        this.#unsubscribers.removeAll();
    }

    /**
     * Retrieves the reactive item with the given key from the store.
     * @param {string} key - The key of the item to retrieve.
     * @returns {ReactivePrimitive|null} The reactive item with the given key, or null if no such item exists in the store.
     */
    #getReactiveItem(key) {
        if (this.isDestroyed) {
            return null;
        }
        return this.#items.get(key) || null;
    }

    /**
     * Retrieves the child store with the given key from the store.
     * @param {string} key - The key of the child store to retrieve.
     * @returns {Store|null} The child store with the given key, or null if no such child store exists in the store.
     */
    #getChildStore(key) {
        if (this.isDestroyed) {
            return null;
        }
        return this.#childStores.get(key) || null;
    }

    /**
     * Retrieves the item with the given key from the store. This method first looks for a reactive item with the given key,
     * and if no such item exists, looks for a child store with the same key.
     * @param {string} key - The key of the item to retrieve.
     * @returns {ReactivePrimitive|Store|null} The item with the given key, or null if no such item exists in the store.
     */
    getItem(key) {
        return this.#getReactiveItem(key) || this.#getChildStore(key) || null;
    }

    /**
     * Checks if an item with the given key exists in the store.
     * @param {string} key - The key of the item to check.
     * @returns {boolean} true if the item exists, false otherwise.
     */
    hasItem(key) {
        if (this.isDestroyed) {
            return false;
        }
        return this.#items.has(key) || this.#childStores.has(key);
    }

    /**
     * Retrieves the names of items stored in the Store, optionally filtered by a specified filter.
     *
     * @param {"all"|"reactives"|"stores"} [filter="all"] - The filter to apply when retrieving item names. Default is "all".
     * Possible values can be "all", "reactives", or "stores" (if applicable).
     * @returns {Array<string>} An array containing the names of items that match the filter.
     */
    getItemNames(filter = "all") {
        if (this.isDestroyed) {
            return [];
        }

        if (filter === "reactives") {
            return Array.from(this.#items.keys());
        } else if (filter === "stores") {
            return Array.from(this.#childStores.keys());
        }

        return Array.from(this.#items.keys()).concat(
            Array.from(this.#childStores.keys())
        );
    }

    /**
     * Retrieves all items stored in the Store, optionally filtered by a specified filter.
     *
     * @param {"all"|"reactives"|"stores"} [filter="all"] - The filter to apply when retrieving items. Default is "all".
     * Possible values can be "all", "reactives", or "stores" (if applicable).
     * @returns {Map<string, ReactivePrimitive|Store>} A Map containing the items that match the filter.
     */
    getItems(filter = "all") {
        if (this.isDestroyed) {
            return new Map();
        }

        if (filter === "reactives") {
            return this.#items;
        } else if (filter === "stores") {
            return this.#childStores;
        }

        /** @type {Map<string, ReactivePrimitive|Store>} */
        let result = new Map(this.#items);

        this.#childStores.forEach((store, key) => {
            result.set(key, store);
        });

        return result;
    }

    #itemsAsPlainObject() {
        let object = {};

        this.#items.forEach((item, key) => {
            object[key] = item.getValue();
        });

        return object;
    }

    #childStoresAsPlainObject() {
        let object = {};

        this.#childStores.forEach((store, key) => {
            object[key] = store.asPlainObject();
        });

        return object;
    }

    /**
     * Retrieves the value of this Store as a plain object, optionally filtered by a specified filter.
     *
     * @param {"all"|"reactives"|"stores"} [filter="all"] - The filter to apply when retrieving items. Default is "all".
     * Possible values can be "all", "reactives", or "stores" (if applicable).
     * @returns {Object} A plain object containing the values of the items that match the filter.
     * @example
     * ```js
     * const store = new Store();
     * const a = atom(1);
     * const b = atom(2);
     * const c = new Store();
     * const d = computed(() => a.value + b.value);
     * const e = collection([1, 2, 3]);
     *
     * store.addItems({ a, b, c });
     * c.addItems({ d, e });
     *
     * console.log(store.asPlainObject());
     * // output: { a: 1, b: 2, c: { d: 3, e: [1, 2, 3] } }
     *
     * console.log(store.asPlainObject("all"));
     * // output: { a: 1, b: 2, c: { d: 3, e: [1, 2, 3] } }
     *
     * console.log(store.asPlainObject("reactives"));
     * // output: { a: 1, b: 2 }
     *
     * console.log(store.asPlainObject("stores"));
     * // output: { c: { d: 3, e: [1, 2, 3] } }
     *
     * store.destroy();
     *
     * console.log(store.asPlainObject());
     * // output: {}
     * ```
     */
    asPlainObject(filter = "all") {
        if (this.isDestroyed) {
            return {};
        }

        if (filter === "reactives") {
            return this.#itemsAsPlainObject();
        } else if (filter === "stores") {
            return this.#childStoresAsPlainObject();
        }

        let object = {
            ...this.#itemsAsPlainObject(),
            ...this.#childStoresAsPlainObject(),
        };
        return object;
    }

    /**
     * Subscribes a function to be called whenever the value of this Store changes.
     * The function is called with a Map of updates, where the keys are the names of the items that changed, and the values are UpdateDataRecord objects.
     * @param {(update: Map<string, UpdateDataRecord>, store: Store)=>void} fn - The function to be called whenever the value of this Atom changes.
     * @returns {()=>void} A function that unsubscribes the given function.
     * @example
     * ```js
     * const store = new Store();
     * const a = atom(1);
     * const b = atom(2);
     *
     * const c = new Store();
     * const d = new Computed(() => a.value + b.value);
     * c.addItems({ d });
     *
     * store.addItems({ a, b, c });
     *
     * let i = 0;
     *
     * store.subscribe((updates) => {
     *     let updatesArr = Array.from(updates.keys());
     *     console.log(updatesArr);
     *     i += 1;
     * });
     *
     * a.value = 2;
     * // output: ["a", "c.d"]
     *
     * b.value = 3;
     * // output: ["b", "c.d"]
     *
     * console.log(i); // output: 4
     * ```
     */
    subscribe(fn) {
        if (this.isDestroyed) {
            return () => {};
        }

        let that = this;

        return this.eventEmitter.on("change", () => {
            fn(that.#updates, that);
        });
    }

    /**
     * Subscribes a function to be called when this Store is destroyed.
     * The function is called with no arguments.
     * @param {(store:Store)=>void} fn - The function to be called.
     * @returns {()=>void} A function that unsubscribes the given function.
     */
    onDestroy(fn) {
        if (this.isDestroyed) {
            return () => {};
        }

        return this.eventEmitter.on("destroy", fn);
    }

    /**
     * Mutes the event emitter, preventing any updates from being triggered.
     * Any updates that are scheduled while muted will be queued and executed when unmuteUpdates is called.
     */
    muteUpdates() {
        this.eventEmitter.mute();
    }

    /**
     * Unmutes the event emitter, allowing updates to be triggered.
     * Any updates that were scheduled while muted will be executed.
     */
    unmuteUpdates() {
        this.eventEmitter.unmute();
    }

    /**
     * Returns whether the event emitter is currently muted.
     * @returns {boolean}
     */
    isMuted() {
        return this.eventEmitter.isMuted();
    }
}

export { Store };
