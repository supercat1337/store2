export type Unsubscriber = () => void;
export type CompareFunction = (...args: any) => boolean;
/**
 * Atom is a reactive primitive that holds a value. It is the base unit of reactive state.
 * @extends ReactivePrimitive
 * @template T
 * @example
 * ```js
 * const a = new Atom(0); // same as const a = atom(0);
 * const b = new Atom(0);
 *
 * const c = new Computed(() => a.value + b.value);
 *
 * c.subscribe(() => {
 *     console.log(c.name, c.value);
 * });
 *
 * a.subscribe(() => {
 *     console.log(a.name, a.value);
 * });
 *
 * b.subscribe(() => {
 *     console.log(b.name, b.value);
 * });
 *
 * a.value = 1;
 * // Output:
 * //a 1
 * //c 1
 *
 * a.value = 2;
 * // Output:
 * //a 2
 * //c 2
 * b.value = 2;
 * // Output:
 * //b 2
 * //c 4
 *
 * a.value = 3;
 * // Output:
 * //a 3
 * //c 5
 *
 * a.value = 3;
 * // Output: nothing
 * ```
 */
export class Atom<T> extends ReactivePrimitive {
    /**
     * Initializes an Atom instance with a given value.
     * @param {T} value - The initial value of the Atom.
     * @param {Object} [options] - Options.
     * @param {string} [options.name] - The name of the Atom.
     * @param {(a:T, b:T)=>boolean} [options.compareFunction] - A function that compares two values for equality.
     */
    constructor(value: T, options?: {
        name?: string;
        compareFunction?: (a: T, b: T) => boolean;
    });
    options: {
        name: string;
        compareFunction: any;
    };
    engine: any;
    /**
     * Sets the value of the Atom. If the new value is the same as the current value, no action is taken.
     * Updates the current value to the new value if they are different.
     * @param {T} value - The new value to set for the Atom.
     */
    set value(value: T);
    /**
     * Returns the current value of the Atom. If the engine is destroyed, an error is thrown.
     * @returns {T} The current value of the Atom.
     */
    get value(): T;
    /**
     * Retrieves the current value of the Atom. If the engine is destroyed, an error is thrown.
     * Tracks the Atom for dependency management.
     * @param {{untracked?: boolean}} [options] - Optional options. If `untracked` is `false`, the Atom value will be added to the getValueTracker.
     * @returns {T} The current value of the Atom.
     */
    getValue(options?: {
        untracked?: boolean;
    }): T;
    /**
     * Returns the current value of the Atom without tracking it for dependency management.
     * This is useful when you want to access the value without affecting its reactive state.
     * @returns {T} The current value of the Atom.
     * @example
     * ```js
     * const a = atom(0);
     * const b = atom(0);
     * const c = computed(() => a.value + b.valueUntracked, {
     *     name: "c",
     * });
     *
     * c.subscribe(() => {
     *     console.log(c.name, c.value);
     * });
     * console.log("change b.value");
     * b.value++;
     * b.value++;
     * console.log("change a.value");
     * a.value++;
     * // Output: c 3
     * a.value++;
     * // Output: c 4
     * ```
     */
    get valueUntracked(): T;
    #private;
}
/**
 * Collection is a reactive primitive that holds an array of values. It is the base unit of reactive state.
 * @extends ReactivePrimitive
 * @template {unknown} T
 * @example
 * ```js
 * let c = new Collection([1, 2, 3]);
 * c.subscribe((updates) => {
 *     console.log("updated", updates);
 * });
 *
 * let len = new Computed(() => c.data.length);
 *
 * len.subscribe((updates) => {
 *     console.log("len updated", updates);
 * });
 *
 * c.data.push(4);
 * ```
 */
export class Collection<T extends unknown> extends ReactivePrimitive {
    /**
     * Initializes a Collection instance with a given value.
     * @param {T[]} value - The initial value of the Collection.
     * @param {Object} [options] - Options.
     * @param {string} [options.name] - The name of the Collection.
     * @param {(a:T, b:T)=>boolean} [options.compareFunction] - A function to compare elements.
     */
    constructor(value: T[], options?: {
        name?: string;
        compareFunction?: (a: T, b: T) => boolean;
    });
    options: {
        name: string;
        compareFunction: any;
    };
    engine: any;
    /**
     * Sets the value of the Collection. If the new value is the same as the current value, no action is taken.
     * Updates the current value to the new value if they are different.
     * @param {T[]} value - The new value to set for the Collection.
     */
    set value(value: T[]);
    /**
     * Retrieves the proxied value of the Collection. If the engine is destroyed, an error is thrown.
     * Tracks the Collection for dependency management.
     * @returns {T[]} The proxied value of the Collection.
     */
    get value(): T[];
    /**
     * Retrieves the proxied value of the Collection. If the engine is destroyed, an error is thrown.
     * Tracks the Collection for dependency management.
     * @param {{untracked?: boolean}} [options] - Optional options. If `untracked` is `false`, the Collection value will be added to the getValueTracker.
     * @returns {T[]} The proxied value of the Collection.
     */
    getValue(options?: {
        untracked?: boolean;
    }): T[];
    /**
     * Sets the value of the Collection. This is a synonym for `set value(value)`.
     * @param {T[]} value - The new value to set for the Collection.
     */
    set data(value: T[]);
    /**
     * Retrieves the proxied value of the Collection. If the engine is destroyed, an error is thrown.
     * Tracks the Collection for dependency management.
     * @returns {T[]} The proxied value of the Collection.
     */
    get data(): T[];
    /**
     * Returns the raw, unproxied value of the Collection. This is generally not recommended as it breaks reactivity.
     * @returns {T[]} The raw, unproxied value of the Collection.
     */
    getRawValue(): T[];
    #private;
}
/**
 * Computed is a reactive primitive that holds a value that is computed from other reactive values.
 * It is the base unit of reactive state.
 * @extends ReactivePrimitive
 * @template {unknown} T
 * @example
 * ```js
 * const a = new Atom(0); // same as const a = atom(0);
 * const b = new Atom(0);
 *
 * const c = new Computed(() => a.value + b.value);
 *
 * c.subscribe(() => {
 *     console.log("c", c.value);
 * });
 *
 * a.subscribe(() => {
 *     console.log("a", a.value);
 * });
 *
 * b.subscribe(() => {
 *     console.log("b", b.value);
 * });
 *
 * a.value = 1;
 * // Output:
 * //a 1
 * //c 1
 *
 * a.value = 2;
 * // Output:
 * //a 2
 * //c 2
 * b.value = 2;
 * // Output:
 * //b 2
 * //c 4
 *
 * a.value = 3;
 * // Output:
 * //a 3
 * //c 5
 *
 * a.value = 3;
 * // Output: nothing
 * ```
 */
export class Computed<T extends unknown> extends ReactivePrimitive {
    /**
     * Initializes an Atom instance with a given value.
     * @param {function():T} fn - function that returns the value of the Computed
     * @param {Object} [options] - Options
     * @param {string} [options.name] - The name of the Computed instance.
     * @param {(a:T, b:T)=>boolean} [options.compareFunction] - A function that compares two values for equality.
     * @param {boolean} [options.isHardFunction] - Indicates whether the computed is a hard function. If true, it prevents calling the function by comparing the string representation of the dependencies.
     */
    constructor(fn: () => T, options?: {
        name?: string;
        compareFunction?: (a: T, b: T) => boolean;
        isHardFunction?: boolean;
    });
    options: {
        name: string;
        isHardFunction: boolean;
        compareFunction: any;
    };
    engine: any;
    /**
     * Checks whether the Computed value needs to be recalculated. A recalculation is needed if the engine's shouldRecalc
     * property is true, if the engine has an error, or if the version string of the dependencies has changed.
     * @returns {boolean} true if the Computed value needs to be recalculated, false if it does not.
     */
    isStale(): boolean;
    /**
     * @param {{untracked?: boolean}} [options] - Optional options. If `untracked` is `false`, the Computed value will be added to the getValueTracker.
     * @returns {T} The current value of the Computed value.
     */
    getValue(options?: {
        untracked?: boolean;
    }): T;
    /**
     * Returns the current value of the Computed value.
     * @returns {T} The current value of the Computed value.
     */
    get value(): T;
    /**
     * Returns the current value of the Computed value without tracking it for dependency management.
     * This is useful when you want to access the value without affecting its reactive state.
     * @returns {T} The current value of the Computed value.
     * @example
     * ```js
     * const a = atom(0);
     * const b = atom(0);
     * const c = computed(() => a.value + 1);
     * const d = computed(() => c.valueUntracked + b.value);
     *
     * d.subscribe(() => {
     *     console.log(`d = ${d.value}`);
     * });
     *
     * console.log(`c = ${c.value}`);
     * // Outputs: c = 1
     * a.value++;
     * // a = 1
     * // Outputs: nothing
     * console.log(`c = ${c.value}`);
     * // Outputs: c = 2
     *
     * b.value++;
     * // Outputs: d = 3
     * ```
     */
    get valueUntracked(): T;
    #private;
}
/**
 * ReactiveList is a class that represents a reactive list of items.
 * It allows adding, removing, and updating items in the list while maintaining reactivity.
 * @template {{[key:string]:any}} T
 * @example
 * ```js
 * const list = new ReactiveList();
 * const item1 = { name: "item1" };
 * const item2 = { name: "item2" };
 * const item3 = { name: "item3" };
 *
 * list.subscribe((updates) => {
 *     console.log("updates: ", Array.from(updates.keys()));
 *     console.log("list.length = ", list.length);
 *     console.log("list.items = ", list.getItems());
 *     console.log("=====================================");
 * });
 *
 * list.setItems([item1, item2, item3]);
 * // Outputs:
 * // updates:  [ '0.name', '1.name', '2.name', 'length' ]
 * // list.length =  3
 * // list.items =  [ { name: 'item1' }, { name: 'item2' }, { name: 'item3' } ]
 *
 * list.setItems([item1]);
 * // Outputs:
 * // updates:  [ '1', '2', 'length' ]
 * // list.length =  1
 * // list.items =  [ { name: 'item1' } ]
 *
 * list.setItem(0, { name: "updated" });
 * // Outputs:
 * // updates:  [ '0.name' ]
 * // list.length =  1
 * // list.items =  [ { name: 'updated' } ]
 * ```
 */
export class ReactiveList<T extends {
    [key: string]: any;
}> {
    /**
     * Adds the given values to the reactive list as ReactiveProps items.
     * Updates the internal store and the length atom accordingly.
     * @param {...T} values - The values to add to the list.
     */
    add(...values: T[]): void;
    /**
     * Retrieves the value of the ReactiveProps item at the specified index.
     * @param {number} index - The index of the item to retrieve from the reactive list.
     * @returns {T|undefined} The value of the item at the specified index, or undefined if no item exists at that index.
     */
    getItem(index: number): T | undefined;
    /**
     * Retrieves all items from the reactive list as an array of values.
     * The order of the items in the array matches the order of the items in the reactive list.
     * If the reactive list has been destroyed, an empty array is returned.
     * @returns {T[]} An array of values from the reactive list.
     */
    getItems(): T[];
    /**
     * Sets the value of the ReactiveProps item at the specified index.
     * If the item exists at the given index, its value is updated.
     * @param {number} index - The index of the item to update in the reactive list.
     * @param {T} value - The new value to set for the item at the specified index.
     */
    setItem(index: number, value: T): void;
    /**
     * Retrieves the length of the reactive list.
     * @returns {number} The length of the reactive list.
     */
    get length(): number;
    /**
     * Sets multiple items in the reactive list, updating existing items or adding new ones as necessary.
     * If the new number of items is less than the current length of the list, the excess items are destroyed.
     * Operates within a batch to optimize performance and prevent unnecessary reactivity triggers.
     *
     * @param {T[]} values - The new values to set in the reactive list.
     */
    setItems(values: T[]): void;
    /**
     * Cleans up the reactive list by destroying all items in the internal store.
     * This method is useful when the reactive list is no longer needed and resources should be freed.
     */
    destroy(): void;
    /**
     * Returns true if the reactive list has been destroyed, and false otherwise.
     * This property is useful for determining whether it is safe to interact with the reactive list.
     * A destroyed reactive list will not respond to any methods or properties except for this one.
     * @type {boolean}
     */
    get isDestroyed(): boolean;
    /**
     * Subscribes a function to be called whenever the value of this reactive list changes.
     * The function is called with a Map of updates, where the keys are the names of the items that changed, and the values are UpdateDataRecord objects.
     * @param {(update: Map<string, UpdateDataRecord>)=>void} fn - The function to be called whenever the value of this reactive list changes.
     * @returns {()=>void} A function that unsubscribes the given function.
     */
    subscribe(fn: (update: Map<string, UpdateDataRecord>) => void): () => void;
    /**
     * Removes a specified number of items from the reactive list, starting at a given index.
     * The function operates within a batch to optimize performance and prevent unnecessary reactivity triggers.
     *
     * @param {number} startIndex - The index at which to start removing items from the list.
     * @param {number} count - The number of items to remove from the list.
     */
    splice(startIndex: number, count: number): void;
    /**
     * Removes the item at the given index from the reactive list.
     * @param {number} index - The index of the item to remove.
     */
    removeItem(index: number): void;
    /**
     * Removes the last item from the reactive list.
     */
    removeLastItem(): void;
    /**
     * Removes the first item from the reactive list.
     */
    removeFirstItem(): void;
    /**
     * Clears all items from the reactive list.
     * This method removes all items from the list using the splice operation,
     * effectively resetting the list to an empty state.
     */
    clear(): void;
    #private;
}
/**
 * ReactivePrimitive is the base class for all reactive items. It provides methods for subscribing to changes,
 * getting the current value, and checking for errors.
 * @private
 */
export class ReactivePrimitive {
    /** @type {Engine} */
    engine: Engine;
    name: string;
    /**
     * Subscribes a function to be called whenever the value of this reactive item changes.
     * @param {(updates: Map<string, UpdateDataRecord>)=>void} fn - The function to be called whenever the value of this reactive item changes.
     * @param {Object} [options] - Optional options.
     * @param {number} [options.delay] - The delay in milliseconds before the function is called.
     * @param {AbortSignal} [options.signal] - The signal to abort the subscription.
     */
    subscribe(fn: (updates: Map<string, UpdateDataRecord>) => void, options?: {
        delay?: number;
        signal?: AbortSignal;
    }): Unsubscriber;
    /**
     * Removes all "change" subscribers. Listeners for "#has-subscribers" and "#no-subscribers" are not removed.
     */
    clearSubscribers(): void;
    /**
     * Removes all subscribers, including listeners for "#has-subscribers" and "#no-subscribers" events.
     */
    clearAllSubscribers(): void;
    /**
     * Returns true if there are any subscribers, false otherwise.
     * @returns {boolean} Whether there are any subscribers.
     */
    hasSubscribers(): boolean;
    /**
     * Retrieves the current value of the reactive item.
     * @param {Object} [options] - Optional options.
     * @param {boolean} [options.untracked=false] - If `true`, the value will not be added to the getValueTracker.
     * @returns {any} The current value of the reactive item.
     */
    getValue(options?: {
        untracked?: boolean;
    }): any;
    /**
     * Returns the last error that occurred while calculating the value of the reactive item,
     * or null if there is no error.
     * @returns {Error|null} The last error that occurred, or null if there is no error.
     */
    getLastError(): Error | null;
    /**
     * Returns true if there has been an error while calculating the value of the reactive item,
     * false otherwise. This method returns true if the reactive item has been destroyed, if the
     * reactive item has an error, or if the calculation of the value of the reactive item has
     * thrown an error.
     * @returns {boolean} Whether there has been an error while calculating the value of the
     * reactive item.
     */
    hasError(): boolean;
    /**
     * Subscribes a function to be called whenever a subscriber is added to the reactive item.
     * The function is called with no arguments.
     * @param {function():void} fn - The function to be called.
     * @returns {()=>void} A function that unsubscribes the given function.
     */
    onHasSubscribers(fn: () => void): () => void;
    /**
     * Subscribes a function to be called whenever there are no longer any subscribers.
     * The function is called with no arguments.
     * @param {function():void} fn - The function to be called.
     * @returns {()=>void} A function that unsubscribes the given function.
     */
    onNoSubscribers(fn: () => void): () => void;
    /**
     * Subscribes a function to be called when the reactive item is destroyed.
     * The function is called with no arguments.
     * @param {(reactiveItem:ReactivePrimitive)=>void} fn - The function to be called.
     * @returns {()=>void} A function that unsubscribes the given function.
     */
    onDestroy(fn: (reactiveItem: ReactivePrimitive) => void): () => void;
    /**
     * Destroys the reactive item. This method is useful for cleaning up after a reactive item
     * that is no longer needed. It calls destroy on the engine of the reactive item, which
     * removes all dependencies, dependents and subscribers, and marks the engine as destroyed.
     */
    destroy(): void;
    /**
     * Checks if two values are equal. If the compareFn property is a function, it is used to compare the two values.
     * If the compareFn property is not a function, the values are compared using the === operator.
     * If the optional second argument is not provided, the value of the reactive item is used.
     * @param {any} a - The first value to compare.
     * @param {any} [b] - The second value to compare. If not provided, the value of the reactive item is used.
     * @returns {boolean} True if the two values are equal, false otherwise.
     */
    equals(a: any, b?: any): boolean;
    /**
     * @returns {boolean} True if the reactive item has been destroyed, false otherwise.
     */
    get isDestroyed(): boolean;
}
/**
 * ReactiveProps is a reactive primitive that holds a shallow object. It is the base unit of reactive state.
 * It is a shallow reactive object, meaning that it only tracks changes to the properties of the object itself, not its nested properties.
 * @extends ReactivePrimitive
 * @template {{[key:string]:any}} T
 *  * @example
 * ```js
 * const b = new ReactiveProps({ foo: 1 });
 *
 * let bar = 0;
 *
 * b.subscribe(() => {
 *     bar += 1;
 * });
 *
 * const props = b.data;
 * props.foo = 2;
 *
 * console.log(bar);
 * // Outputs: 1
 * ```
 *
 * @example
 * ```js
 * class A {
 *     foo = 1;
 *
 *     inc() {
 *         this.foo++;
 *     }
 * }
 *
 * let bar = 0;
 * const b = new ReactiveProps(new A(), { name: "b" });
 *
 * b.subscribe(() => {
 *     bar++;
 * });
 *
 * console.log(b.data.foo);
 * // Outputs: 1
 *
 * b.data.foo = 2;
 * console.log(b.data.foo);
 * // Outputs: 2
 *
 * console.log(bar);
 * // Outputs: 1
 *
 * b.data.inc();
 * console.log(b.data.foo);
 * // Outputs: 3
 * console.log(bar);
 * // Outputs: 2
 * ```
 */
export class ReactiveProps<T extends {
    [key: string]: any;
}> extends ReactivePrimitive {
    /**
     * Initializes a ReactiveProps instance with a given value.
     * @param {T} value - The initial value of the ReactiveProps.
     * @param {Object} [options] - Options.
     * @param {string} [options.name] - The name of the ReactiveProps.
     */
    constructor(value: T, options?: {
        name?: string;
    });
    options: {
        name: string;
        compareFunction: any;
    };
    engine: any;
    /**
     * Retrieves the proxied value of the ReactiveProps. If the engine is destroyed, an error is thrown.
     * Tracks the ReactiveProps for dependency management.
     * @param {{untracked?: boolean}} [options] - Optional options. If `untracked` is `false`, the ReactiveProps value will be added to the getValueTracker.
     * @returns {T} The proxied value of the ReactiveProps.
     */
    getValue(options?: {
        untracked?: boolean;
    }): T;
    /**
     * Sets the value of the ReactiveProps. If the value is an object, it will be proxied and reactive.
     * @param {T} value - The new value of the ReactiveProps.
     */
    setValue(value: T): void;
    /**
     * Sets the value of the ReactiveProps. If the value is an object, it will be proxied and reactive.
     * @param {T} value - The new value of the ReactiveProps.
     */
    set value(value: T);
    /**
     * Retrieves the proxied value of the ReactiveProps. If the engine is destroyed, an error is thrown.
     * Tracks the ReactiveProps for dependency management.
     * @returns {T} The proxied value of the ReactiveProps.
     */
    get value(): T;
    /**
     * Sets the value of the ReactiveProps. If the value is an object, it will be proxied and reactive.
     * This is a synonym for `set value(value)`.
     * @param {T} value - The new value of the ReactiveProps.
     */
    set data(value: T);
    /**
     * Retrieves the proxied value of the ReactiveProps. If the engine is destroyed, an error is thrown.
     * Tracks the ReactiveProps for dependency management.
     * @returns {T} The proxied value of the ReactiveProps.
     */
    get data(): T;
    /**
     * Returns the raw, unproxied value of the ReactiveProps. This is generally not recommended as it breaks reactivity.
     * @returns {T} The raw, unproxied value of the ReactiveProps.
     */
    getRawValue(): T;
    #private;
}
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
export class Store {
    /** @type {EventEmitterExt<"change"|"destroy"|"clear-updates">} */
    eventEmitter: EventEmitterExt<"change" | "destroy" | "clear-updates">;
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
    get isDestroyed(): boolean;
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
    addItems(items: {
        [key: string]: ReactivePrimitive | Store;
    }): void;
    /**
     * Destroys the item with the given key, whether it's a reactive item or a child store.
     * It first attempts to destroy a reactive item with the specified key, and if not found,
     * attempts to destroy a child store with the same key.
     * @param {string} key - The key of the item or child store to destroy.
     * @returns {void}
     */
    destroyItem(key: string): void;
    /**
     * Removes the reactive item with the given key from the store. This method does not call destroy on the item.
     * @param {string} key - The key of the item to remove.
     * @returns {void}
     */
    removeItem(key: string): void;
    /**
     * Destroys all reactive items stored in the Store. This method is useful for cleaning
     * up after a Store that is no longer needed. It calls destroy on each reactive item
     * in the store and clears the store of all items.
     */
    destroy(): void;
    /**
     * Clears all reactive items from the store. This method is useful for resetting a Store to an empty state.
     * It removes all reactive items from the store and clears all child stores. It does not destroy the reactive items.
     */
    clear(): void;
    /**
     * Retrieves the item with the given key from the store. This method first looks for a reactive item with the given key,
     * and if no such item exists, looks for a child store with the same key.
     * @param {string} key - The key of the item to retrieve.
     * @returns {ReactivePrimitive|Store|null} The item with the given key, or null if no such item exists in the store.
     */
    getItem(key: string): ReactivePrimitive | Store | null;
    /**
     * Checks if an item with the given key exists in the store.
     * @param {string} key - The key of the item to check.
     * @returns {boolean} true if the item exists, false otherwise.
     */
    hasItem(key: string): boolean;
    /**
     * Retrieves the names of items stored in the Store, optionally filtered by a specified filter.
     *
     * @param {"all"|"reactives"|"stores"} [filter="all"] - The filter to apply when retrieving item names. Default is "all".
     * Possible values can be "all", "reactives", or "stores" (if applicable).
     * @returns {Array<string>} An array containing the names of items that match the filter.
     */
    getItemNames(filter?: "all" | "reactives" | "stores"): Array<string>;
    /**
     * Retrieves all items stored in the Store, optionally filtered by a specified filter.
     *
     * @param {"all"|"reactives"|"stores"} [filter="all"] - The filter to apply when retrieving items. Default is "all".
     * Possible values can be "all", "reactives", or "stores" (if applicable).
     * @returns {Map<string, ReactivePrimitive|Store>} A Map containing the items that match the filter.
     */
    getItems(filter?: "all" | "reactives" | "stores"): Map<string, ReactivePrimitive | Store>;
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
    asPlainObject(filter?: "all" | "reactives" | "stores"): any;
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
    subscribe(fn: (update: Map<string, UpdateDataRecord>, store: Store) => void): () => void;
    /**
     * Subscribes a function to be called when this Store is destroyed.
     * The function is called with no arguments.
     * @param {(store:Store)=>void} fn - The function to be called.
     * @returns {()=>void} A function that unsubscribes the given function.
     */
    onDestroy(fn: (store: Store) => void): () => void;
    /**
     * Mutes the event emitter, preventing any updates from being triggered.
     * Any updates that are scheduled while muted will be queued and executed when unmuteUpdates is called.
     */
    muteUpdates(): void;
    /**
     * Unmutes the event emitter, allowing updates to be triggered.
     * Any updates that were scheduled while muted will be executed.
     */
    unmuteUpdates(): void;
    /**
     * Returns whether the event emitter is currently muted.
     * @returns {boolean}
     */
    isMuted(): boolean;
    #private;
}
/**
 * Creates a new Atom instance. An Atom is a reactive primitive that holds a value. Same as `atom` but
 * returns a new Atom instance.
 * @template T
 * @param {T} value - The initial value of the Atom.
 * @param {Object} [options] - Options
 * @param {string} [options.name] - The name of Atom.
 * @param {(a:T, b:T)=>boolean} [options.compareFunction] - A function that compares two values to determine if they are equal.
 * @returns {Atom<T>} A new Atom instance with the given value and options.
 * @example
 * ```js
 * const count = atom(0);
 *
 * count.subscribe(() => {
 *     console.log(count.value);
 * });
 *
 * count.value = 1;
 * ```
 */
export function atom<T>(value: T, options?: {
    name?: string;
    compareFunction?: (a: T, b: T) => boolean;
}): Atom<T>;
/**
 * Automatically tracks and subscribes to changes in reactive items used by the specified function.
 * This allows the function to be re-executed whenever any of its dependencies change, maintaining
 * up-to-date results.
 *
 * @param {(updates?:Map<string, UpdateDataRecord>)=>void} fn - The function to track and reactively execute.
 * @param {Object} [options] - The options for the autorun function.
 * @param {string} [options.name] - An optional name for the autorun.
 * @param {number} [options.delay] - The number of milliseconds to delay the execution of the callback function.
 * @param {AbortSignal} [options.signal] - An optional AbortSignal to cancel the autorun.
 * @param {Function} [options.onError] - An optional function to handle errors.
 * @returns {()=>void} A function that can be called to unsubscribe the callback function from changes in the tracked dependencies.
 * @example
 * ```js
 * const a = atom(0, { name: "a" });
 * const b = atom(0, { name: "b" });
 * let foo = 0;
 *
 * autorun(() => {
 *     a.value;
 *     b.value;
 *     foo++;
 * });
 *
 * console.log(a.value, b.value, foo); // 0 0 1
 *
 * a.value++;
 * console.log(a.value, b.value, foo); // 1 0 2
 *
 * b.value++;
 * console.log(a.value, b.value, foo); // 1 1 3
 *
 * batch(() => {
 *     a.value++;
 *     b.value++;
 * });
 *
 * console.log(a.value, b.value, foo); // 2 2 4
 * ```
 */
export function autorun(fn: (updates?: Map<string, UpdateDataRecord>) => void, options?: {
    name?: string;
    delay?: number;
    signal?: AbortSignal;
    onError?: Function;
}): () => void;
/**
 * Executes the specified function while batching notifications to reactive items.
 * This is useful for operations that make multiple changes to reactive items, as
 * it prevents the notifications from being sent until all changes have been made.
 * @param {Function} fn - The function to execute while batching notifications.
 * @returns {void}
 * @example
 * ```js
 * const a = atom(0);
 * const b = atom(0);
 *
 * let foo = 0;
 *
 * autorun(() => {
 *     a.value;
 *     b.value;
 *     foo++;
 * });
 *
 * console.log(a.value, b.value, foo); // 0 0 1
 *
 * batch(() => {
 *     a.value++;
 *     b.value++;
 * });
 *
 * console.log(a.value, b.value, foo); // 1 1 2
 * ```
 */
export function batch(fn: Function): void;
/**
 * Creates a new Collection instance. A Collection is a reactive primitive that holds an array of values. Same as `collection` but
 * returns a new Collection instance.
 * @template T
 * @param {T[]} value - The array to observe.
 * @param {Object} [options] - Options
 * @param {string} [options.name] - The name of Collection object.
 * @param {(a:T, b:T)=>boolean} [options.compareFunction] - A function that compares two values to determine if they are equal.
 * @returns {T[]} The observed array
 * @example
 * ```js
 * const items = collection([1, 2, 3]);
 *
 * items.subscribe(() => {
 *     console.log(items.value);
 });
 *
 * items.value.push(4);
 * // output: [1, 2, 3, 4]
 * ```
 */
export function collection<T>(value: T[], options?: {
    name?: string;
    compareFunction?: (a: T, b: T) => boolean;
}): T[];
/**
 * Creates a new Computed instance. Computed is a reactive primitive that holds a value that is computed from other reactive values.
 * @template T
 * @param {()=>T} fn - The function that returns the value of the Computed
 * @param {Object} [options] - Options
 * @param {string} [options.name] - The name of Computed.
 * @param {(a:T, b:T)=>boolean} [options.compareFunction] - A function that compares two values to determine if they are equal.
 * @param {boolean} [options.isHardFunction] - Whether the function is a hard function. If true, it prevents calling the function by comparing the string representation of the dependencies.
 * @returns {Computed<T>} A new Computed instance with the given function and options.
 * @example
 * ```js
 * const a = atom(0);
 * const b = computed(() => a.value + 1);
 *
 * b.subscribe(() => {
 *     console.log(b.value);
 * });
 *
 * a.value = 1;
 * // b = 2
 * ```
 */
export function computed<T>(fn: () => T, options?: {
    name?: string;
    compareFunction?: (a: T, b: T) => boolean;
    isHardFunction?: boolean;
}): Computed<T>;
/**
 * Extends an object with new properties and makes them observable.
 *
 * @template T
 * @template {{[key:string]:any}} R
 * @param {T} target - The object to be extended and observed.
 * @param {R} properties - The properties to add to the target object.
 * @param {{[key:string]:"atom"|"computed"|"collection"|"reactiveProps"|false}} [overrides] - Optional overrides to define the type of the reactive property. If an override is false, the key will be ignored.
 * @param {Object} [options] - Options to configure the observable behavior.
 * @param {string} [options.name] - The name of the observable object. Defaults to an empty string. Using as prefix for reactive property names.
 * @returns {T & R} The extended object with observable properties.
 * @example
 * ```js
 * let object = {
 *     value: 0,
 *     get double() {
 *         return this.value * 2;
 *     },
 *     increment() {
 *         this.value++;
 *     },
 * };
 *
 * makeObservable(object, { value: "atom", double: "computed" });
 * extendObservable(object, {a: 1, b: 2});
 *
 * let foo = 0;
 *
 * autorun(() => {
 *     foo++;
 *     object.a;
 * });
 *
 * console.log(foo); // 1
 * object.a++;
 * console.log(foo); // 2
 * ```
 */
export function extendObservable<T, R extends {
    [key: string]: any;
}>(target: T, properties: R, overrides?: {
    [key: string]: "atom" | "computed" | "collection" | "reactiveProps" | false;
}, options?: {
    name?: string;
}): T & R;
/**
 * Creates an object that provides a way to handle the result of a Promise.
 * The object has a single method called `case` which takes an object with
 * three optional methods: `resolved`, `rejected`, and `pending`. The appropriate
 * method will be called based on the state of the promise.
 * @template T
 * @param {Promise<T>} promise - The promise to handle.
 * @returns {{case: (param0: {resolved?:(value: T)=>void, rejected?:(error: Error)=>void, pending?:()=>void})=>Promise<void>}} An object with a single method called `case`.
 * @example
 * ```js
 * const promise = new Promise((resolve, reject) => {
 *     setTimeout(() => {
 *         resolve("Hello, world!");
 *     }, 1000);
 * });
 *
 * const fromPromiseResult = fromPromise(promise);
 *
 * await fromPromiseResult.case({
 *     resolved: (value) => {
 *         console.log("Resolved:", value); // Resolved: Hello, world!
 *     },
 *     rejected: () => {
 *         console.log("Rejected");
 *     },
 *     pending: () => {
 *         console.log("Pending"); // Pending
 *     },
 * });
 * ```
 */
export function fromPromise<T>(promise: Promise<T>): {
    case: (param0: {
        resolved?: (value: T) => void;
        rejected?: (error: Error) => void;
        pending?: () => void;
    }) => Promise<void>;
};
/**
 * Returns an Atom that automatically updates its value to the current time
 * at the given interval. The interval is specified in milliseconds and
 * defaults to 1000. When there are subscribers, the Atom updates its value
 * at the specified interval. When there are no subscribers, the interval
 * is cleared and the Atom's value is reset to 0.
 *
 * @param {number} [interval=1000] - The interval in milliseconds at which the Atom should update its value.
 * @returns {Atom<number>} An Atom that automatically updates its value to the current time at the given interval.
 * @example
 * ```js
 * const now = getNow();
 * console.log(now.value); // 0
 *
 * const unsubscribe = now.subscribe(() => {
 *     console.log(now.value); // Current time in milliseconds
 * });
 * ```
 */
export function getNow(interval?: number): Atom<number>;
/**
 * Makes existing object properties observable. Same as {@link makeObservable} but infers all the properties.
 * @template T
 * @param {T} obj - The object to observe.
 * @param {{[key:string]:"atom"|"computed"|"collection"|"reactiveProps"|false}} [overrides] - The overrides to use to define type of the reactive property. If an override is false, the key will be ignored.
 * @param {Object} [options] - Options to configure the observable behavior.
 * @param {string} [options.name] - The name of the observable object. Defaults to an empty string. Using as prefix for reactive property names.
 * @param {Set<string>} [filter] - A set of property keys to selectively apply annotations.
 * @returns {T}
 * @example
 * ```js
 * let object = {
 *     value: 0,
 *     get double() {
 *         return this.value * 2;
 *     },
 *     increment() {
 *         this.value++;
 *     },
 * };
 *
 * makeAutoObservable(object);
 *
 * let foo = 0;
 *
 * autorun(() => {
 *     foo++;
 *     object.double;
 * });
 * console.log(foo); // 1
 *
 * object.increment();
 * console.log(foo); // 2
 *
 * object.increment();
 * console.log(foo); // 3
 * ```
 */
export function makeAutoObservable<T>(obj: T, overrides?: {
    [key: string]: "atom" | "computed" | "collection" | "reactiveProps" | false;
}, options?: {
    name?: string;
}, filter?: Set<string>): T;
/**
 * Enhances an object to make its properties observable using specified annotations.
 *
 * @template T
 * @param {T} obj - The object to be observed.
 * @param {{[key:string]:"atom"|"computed"|"collection"|"reactiveProps"|false}} annotations -
 *        Annotations defining the type of reactivity for each property. Properties with a
 *        'false' annotation will be ignored.
 * @param {Object} [options] - Options to configure the observable behavior.
 * @param {string} [options.name] - The name of the observable object. Defaults to an empty string. Using as prefix for reactive property names.
 * @returns {T} The input object with enhanced reactive properties.
 *
 * @example
 * ```js
 * class List {
 *     data = [];
 *
 *     constructor(data) {
 *         this.data = data;
 *         makeObservable(this, { data: "collection" });
 *     }
 *
 *     // not reactive property
 *     get length() {
 *         return this.data.length;
 *     }
 * }
 *
 * const list = new List([1, 2, 3]);
 *
 * let foo = 0;
 *
 * autorun((updates) => {
 *     console.log(`list.length = ${list.length}`);
 *     foo++;
 * });
 * // Outputs: list.length = 3
 *
 * console.log(foo);
 * // Outputs: 1
 *
 * list.data.push(4);
 * // Outputs: list.length = 4
 * console.log(foo);
 * // Outputs: 2
 *
 * list.data.pop();
 * // set last element to undefined. foo++
 * // Outputs: list.length = 4
 * // set new value of length/ foo++
 * // Outputs: list.length = 3
 *
 * console.log(foo);
 * // Outputs: 4
 * ```
 *
 * @example
 * ```js
 * let object = {
 *     value: 0,
 *     get double() {
 *         return this.value * 2;
 *     },
 *     increment() {
 *         this.value++;
 *     },
 * };
 *
 * makeObservable(object, { value: "atom", double: "computed" });
 *
 * let foo = 0;
 *
 * autorun(() => {
 *     foo++;
 *     object.double;
 * });
 * console.log(foo); // 1
 *
 * object.increment();
 * console.log(foo); // 2
 *
 * object.increment();
 * console.log(foo); // 3
 * ```
 */
export function makeObservable<T>(obj: T, annotations: {
    [key: string]: "atom" | "computed" | "collection" | "reactiveProps" | false;
}, options?: {
    name?: string;
}): T;
/**
 * Tracks reactive items used by the specified data function and subscribes
 * the provided callback function to changes in these items. This ensures
 * that the callback is executed whenever any of the tracked dependencies
 * change, allowing for reactive updates based on the data function.
 *
 * @param {()=>any} dataFunction - The function whose reactive dependencies are tracked.
 * @param {(updates?:Map<string, UpdateDataRecord>)=>void} fn - The callback function to execute when tracked dependencies change.
 * @param {Object} [options] - The options for the reaction function.
 * @param {string} [options.name] - An optional name for the reaction.
 * @param {number} [options.delay] - The number of milliseconds to delay the execution of the callback function.
 * @param {AbortSignal} [options.signal] - An optional signal to abort the reaction.
 * @param {string} [options.type] - An optional type for the reaction. Defaults to "reaction".
 * @returns {()=>void} A function that can be called to unsubscribe the callback function from changes in the tracked dependencies.
 * @example
 * ```js
 * const a = atom(0);
 * const b = atom(0);
 *
 * let foo = 0;
 *
 * // runs only data-function to get dependencies
 * // and then subscribes to changes in a and b
 * reaction(
 *     () => [a.value, b.value],
 *     () => {
 *         foo++;
 *     }
 * );
 *
 * console.log(a.value, b.value, foo); // 0 0 0
 *
 * a.value++;
 * console.log(a.value, b.value, foo); // 1 0 1
 *
 * b.value++;
 * console.log(a.value, b.value, foo); // 1 1 2
 *
 * batch(() => {
 *     a.value++;
 *     b.value++;
 * });
 *
 * console.log(a.value, b.value, foo); // 2 2 3
 * ```
 */
export function reaction(dataFunction: () => any, fn: (updates?: Map<string, UpdateDataRecord>) => void, options?: {
    name?: string;
    delay?: number;
    signal?: AbortSignal;
    type?: string;
}): () => void;
/**
 * Creates a new ReactiveProps instance. An ReactiveProps is a reactive primitive that holds a value. Same as `reactiveProps` but
 * returns a new ReactiveProps instance.
 * @template T
 * @param {T} value - The object to observe.
 * @param {Object} [options] - Options to configure the observable behavior.
 * @param {string} [options.name] - The name of ReactiveProps object.
 * @returns {T} The observed object
 * @example
 * ```js
 * const obj = reactiveProps({ a: 1, b: 2 });
 *
 * obj.subscribe(() => {
 *     console.log(obj.value);
 * });
 *
 * obj.value.a = 3;
 * // output: { a: 3, b: 2 }
 * ```
 */
export function reactiveProps<T>(value: T, options?: {
    name?: string;
}): T;
/**
 * Runs the given function in an action, i.e. when there are no active
 * subscribers. This is useful for making changes to reactive items without
 * triggering subscribers.
 * @param {Function} fn - The function to be run in an action.
 * @returns {void}
 * @example
 * ```js
 * let a = atom(0, { name: "a" });
 * let b = atom(0, { name: "b" });
 *
 * let count = 0;
 *
 * a.subscribe(() => {
 *     count++;
 *     runInAction(() => {
 *         b.value = a.value;
 *     });
 * });
 *
 * a.value++;
 * console.log(a.value, b.value, count); // 1 1 1
 * ```
 */
export function runInAction(fn: Function): void;
/**
 * Executes the specified function while not tracking reactive items.
 * This is useful for operations that access reactive items without
 * actually depending on them.
 * @template T
 * @param {()=>T} fn - The function to execute while not tracking reactive items.
 * @returns {T} The result of executing the function.
 * @example
 * ```js
 * const a = atom(0);
 * const b = atom(0);
 *
 * let foo = 0;
 *
 * autorun(() => {
 *     a.value;
 *     untrack(() => {
 *         b.value;
 *     });
 *     foo++;
 * });
 * console.log(a.value, b.value, foo); // 0 0 1
 *
 * a.value++;
 * console.log(a.value, b.value, foo); // 1 0 2
 * b.value++;
 * console.log(a.value, b.value, foo); // 1 1 2
 * ```
 */
export function untrack<T>(fn: () => T): T;
/**
 * Waits until the given predicate evaluates to true.
 * @param {()=>boolean} predicate - The predicate that should be evaluated.
 * @param {Object} [options] - Optional options.
 * @param {number} [options.timeout] - The number of milliseconds to wait before timing out.
 * @returns {Promise<void>} A promise that resolves when the predicate evaluates to true.
 * @example
 * ```js
 * const a = atom(0, { name: "a" });
 * let foo = 0;
 *
 * waitTrue(() => a.value > 3).then(() => {
 *     foo++;
 * });
 *
 * a.value = 2; // foo = 0
 * a.value = 3; // foo = 0
 * a.value = 4; // foo = 1
 * ```
 */
export function waitTrue(predicate: () => boolean, options?: {
    timeout?: number;
}): Promise<void>;
/**
 * Automatically calls the given function whenever the given predicate evaluates to true.
 * @param {()=>boolean} predicate - The predicate that should be evaluated.
 * @param {()=>void} fn - The function to be called when the predicate evaluates to true.
 * @param {Object} [options] - Optional options.
 * @param {number} [options.timeout] - The number of milliseconds to wait before timing out.
 * @param {number} [options.delay] - The number of milliseconds to wait before calling the function.
 * @param {AbortSignal} [options.signal] - An AbortSignal to cancel the function call.
 * @returns {()=>void} A function that can be called to unsubscribe the callback function from changes in the tracked dependencies.
 * @example
 * ```js
 * const a = atom(0, { name: "a" });
 * let foo = 0;
 *
 * when(
 *     () => a.value > 3,
 *     () => {
 *         foo++;
 *     }
 * );
 *
 * a.value = 2; // foo = 0
 * a.value = 3; // foo = 0
 * a.value = 4; // foo = 1
 * a.value = 5; // foo = 1
 * a.value = 3; // foo = 1
 * a.value = 4; // foo = 2
 * a.value = 5; // foo = 2
 * ```
 */
export function when(predicate: () => boolean, fn: () => void, options?: {
    timeout?: number;
    delay?: number;
    signal?: AbortSignal;
}): () => void;
declare class UpdateDataRecord {
    /**
     * Initializes an instance of UpdateDataRecord with the provided verb, old value, and new value.
     * @param {"set"|"delete"} verb - The action performed, either "set" or "delete".
     * @param {any} oldValue - The previous value before the update.
     * @param {any} value - The new value after the update.
     * @param {ReactivePrimitive} [reactiveItem] - The reactive item that triggered the update.
     */
    constructor(verb: "set" | "delete", oldValue: any, value: any, reactiveItem?: ReactivePrimitive);
    /** @type {"set"|"delete"} */
    verb: "set" | "delete";
    /** @type {any} */
    value: any;
    /** @type {any} */
    oldValue: any;
    /** @type {ReactivePrimitive|undefined} */
    reactiveItem: ReactivePrimitive | undefined;
}
/** @typedef {(...args:any)=>boolean} CompareFunction */
declare class Engine {
    /**
     * Initializes an Engine instance with a given reactive item.
     * @param {ReactivePrimitive} reactiveItem - The reactive item to be managed by the engine.
     * @param {ATOM|COMPUTED|COLLECTION|REACTIVEPROPS_OBJECT} type - The type of the reactive item.
     */
    constructor(reactiveItem: ReactivePrimitive, type: 1 | 2 | 3 | 4);
    /**
     * The set of dependencies of the engine.
     * @type {Set<ReactivePrimitive>}
     * */
    dependencies: Set<ReactivePrimitive>;
    /**
     * The set of dependents of the engine.
     * @type {Set<ReactivePrimitive>}
     * */
    dependents: Set<ReactivePrimitive>;
    /**
     * A unique identifier for the engine. It is used to determine the order in which reactive items were created.
     * @type {ItemId}
     * */
    id: ItemId;
    /**
     * The version of the value of the reactive item.
     * @type {number}
     */
    version: number;
    /**
     * The reference to the reactive item.
     * @type {ReactivePrimitive}
     * */
    reactiveItem: ReactivePrimitive;
    /**
     * The flag that indicates whether the Engine should recalculate the value of the reactive item.
     * @type {boolean}
     * */
    shouldRecalc: boolean;
    /**
     * Indicates whether the Engine has been destroyed.
     * @type {boolean}
     * */
    isDestroyed: boolean;
    /**
     * The error state of the Engine.
     * @type {null|Error}
     * */
    error: null | Error;
    subscribeController: SubscribeController;
    /**
     * The type of the reactive item.
     * @type {number}
     * */
    type: number;
    /** @type {Map<string, UpdateDataRecord>} */
    updates: Map<string, UpdateDataRecord>;
    oldValues: Map<any, any>;
    temporaryOldValues: Map<any, any>;
    /**
     * A function that compares two values to determine if they are equal.
     * @type {CompareFunction|null}
     * */
    compareFn: CompareFunction | null;
    /**
     * Prevents updates from being propagated when the engine is setting properties of the reactive item.
     * @type {boolean}
     * */
    muteUpdates: boolean;
    /**
     * Adds the given dependencies to the engine. The engine will be considered as needing an update if any of the
     * dependencies have changed.
     * @param {Set<ReactivePrimitive>} dependencies - The dependencies to add.
     */
    addDependencies(dependencies: Set<ReactivePrimitive>): void;
    /**
     * Adds a single dependency to the engine. The engine will be considered as needing an update if the dependency changes.
     * @param {ReactivePrimitive} dependency - The dependency to add.
     */
    addDependency(dependency: ReactivePrimitive): void;
    /**
     * Adds a single dependent to the engine. The engine will notify the dependent whenever an update is needed.
     * @param {ReactivePrimitive} dependent - The dependent to add.
     * @returns {boolean} Whether the dependent was successfully added. If the engine is destroyed, the dependent is not added and the method returns false.
     */
    addDependent(dependent: ReactivePrimitive): boolean;
    /**
     * Returns a set of all dependents of the engine, including all dependents of the dependents of the engine. This
     * method is useful for finding all atoms, computed values and collections that are dependent on a given reactive
     * item.
     * @returns {Set<ReactivePrimitive>} A set of all dependents of the engine.
     */
    getDeepDependents(): Set<ReactivePrimitive>;
    /**
     * Returns an array of all dependents of the engine, including all dependents of the dependents of the engine, sorted
     * by engine ID. This method is useful for finding all atoms, computed values and collections that are dependent on a
     * given reactive item, in a specific order.
     * @returns {Array<ReactivePrimitive>} An array of all dependents of the engine, sorted by engine ID.
     */
    getDeepDependentsArray(): Array<ReactivePrimitive>;
    /**
     * Notifies all dependents of the engine that a change has occurred.
     * @param {EngineMessages} message - An optional message to pass to the dependents.
     * @param { {sender: ReactivePrimitive, recipients: Set<ReactivePrimitive>} } [ctx] - An optional context to pass to the dependents.
     */
    notifyDependents(message: EngineMessages, ctx?: {
        sender: ReactivePrimitive;
        recipients: Set<ReactivePrimitive>;
    }): void;
    /**
     * Notifies all dependencies of the engine that a change has occurred.
     * @param {EngineMessages} message - The message to pass to the dependencies.
     * @param { {sender: ReactivePrimitive, recipients: Set<ReactivePrimitive>} } ctx - The context to pass to the dependencies.
     */
    notifyDependencies(message: EngineMessages, ctx: {
        sender: ReactivePrimitive;
        recipients: Set<ReactivePrimitive>;
    }): void;
    /**
     * Processes a message that has been sent to the engine. If the message is {@link DEPENDENCY_CHANGED}, the engine
     * notifies all dependents of the change. If the message is {@link DEPENDENCY_DESTROYED}, the engine destroys itself. If
     * the message is {@link HAS_ERROR}, the engine forwards the error to all dependents.
     * @param {EngineMessages} message - The message to process.
     * @param { {sender: ReactivePrimitive, recipients: Set<ReactivePrimitive>} } ctx - The context to pass to the dependents.
     */
    getMessage(message: EngineMessages, ctx: {
        sender: ReactivePrimitive;
        recipients: Set<ReactivePrimitive>;
    }): void;
    /**
     * Sets the error state of the Engine to the given error, increments the version, and notifies dependents of the error.
     * @param {Error|null} error - The error to set.
     * @param {{sender: ReactivePrimitive, recipients: Set<ReactivePrimitive>}} [ctx] - An optional context to pass to the dependents.
     */
    setError(error: Error | null, ctx?: {
        sender: ReactivePrimitive;
        recipients: Set<ReactivePrimitive>;
    }): void;
    /**
     * Destroys the Engine, clearing all dependencies, dependents and subscribers, and marking the Engine as destroyed.
     * This method is useful for cleaning up after an Engine that is no longer needed.
     * @param {{sender: ReactivePrimitive, recipients: Set<ReactivePrimitive>}} [ctx]
     */
    destroy(ctx?: {
        sender: ReactivePrimitive;
        recipients: Set<ReactivePrimitive>;
    }): void;
    /**
     * Adds an update to the Engine's update log. The update log is an array of objects with the following properties:
     * - property: The name of the property that changed.
     * - verb: The verb that describes the change. For example "set" or "added".
     * - oldValue: The value of the property before the change.
     * - value: The new value of the property.
     * @param {string} property - The name of the property that changed.
     * @param {"set"|"delete"} verb - The verb that describes the change.
     * @param {any} oldValue - The value of the property before the change.
     * @param {any} value - The new value of the property.
     */
    addUpdate(property: string, verb: "set" | "delete", oldValue: any, value: any): void;
    /**
     * Clears all updates in the engine's update log.
     */
    clearUpdates(): void;
    /**
     * Checks whether there are any updates in the engine's update log.
     * @returns {boolean} True if there are updates, false otherwise.
     */
    hasUpdates(): boolean;
    /**
     * Processes a value change.
     */
    valueChangedCallback(): void;
    /**
     * Checks whether any temporary old values have changed and if so, moves these values to the oldValues map and deletes them from the temporaryOldValues map.
     * This method is called by the reactive item whenever a value change is detected and the muteUpdates flag is set to true.
     * @returns {boolean} True if any changes were detected, false otherwise.
     */
    checkChangesTemporary(): boolean;
    /**
     * Checks whether any old values have changed by comparing them with the current values.
     * If a change is detected, returns true; otherwise, returns false.
     * This method iterates over the keys of the oldValues map and checks if the
     * corresponding current value differs from the stored old value.
     *
     * @returns {boolean} True if any old values have changed, false otherwise.
     */
    checkChangesOldValues(): boolean;
    /**
     * Prepares the engine to set a new value for the reactive item by
     * checking that the reactive item has not been destroyed and that
     * there are no subscribers currently running. If either of these
     * conditions are true, an error is thrown.
     */
    prepareSetValue(): void;
}
import { EventEmitterExt } from '@supercat1337/event-emitter-ext';
/**
 * A class representing an id for a reactive item.
 */
declare class ItemId {
    /**
     * @param {number} timestamp - The timestamp of the id.
     * @param {number} innerIndex - The inner index of the id.
     */
    constructor(timestamp: number, innerIndex: number);
    /** @type {number} */
    timestamp: number;
    /** @type {number} */
    innerIndex: number;
    /**
     * Returns a string representation of the id in the form of "timestamp-innerIndex".
     * @returns {string} A string representation of the id.
     */
    toString(): string;
}
/**
 * @typedef {()=>void} Unsubscriber
 */
declare class SubscribeController {
    /**
     * Returns an array of functions that have been subscribed to the subscribeController.
     * @returns {Function[]} The functions that have been subscribed.
     */
    getSubscribers(): Function[];
    /**
     * Subscribes a function to be called whenever the subscribeController schedules a task.
     * The function is called with no arguments.
     * @param {(updates: Map<string, UpdateDataRecord>)=>void} fn - The function to be called.
     * @param {{delay?:number, signal?:AbortSignal}} [options]
     * @returns {Unsubscriber} A function that unsubscribes the given function.
     */
    subscribe(fn: (updates: Map<string, UpdateDataRecord>) => void, options?: {
        delay?: number;
        signal?: AbortSignal;
    }): Unsubscriber;
    /**
     * Removes all event listeners from the event emitter. This method is useful for
     * cleaning up all subscribers that are no longer needed.
     */
    clearAllSubscribers(): void;
    /**
     * Removes all "change" event listeners from the event emitter. This method is useful for cleaning up
     * "change" subscribers that are no longer needed.
     */
    clearSubscribers(): void;
    /**
     * Returns true if there are any subscribers, false otherwise.
     * @returns {boolean} Whether there are any subscribers.
     */
    hasSubscribers(): boolean;
    /**
     * Destroys the SubscribeController. This method is useful for cleaning up after a SubscribeController
     * that is no longer needed. It calls clearSubscribers, which removes all subscribers.
     */
    destroy(): void;
    /**
     * Subscribes a function to be called whenever a subscriber is added to the subscribeController.
     * The function is called with no arguments.
     * @param {function():void} callback - The function to be called.
     * @returns {Unsubscriber} A function that unsubscribes the given function.
     */
    onHasSubscribers(callback: () => void): Unsubscriber;
    /**
     * Subscribes a function to be called whenever there are no longer any subscribers.
     * The function is called with no arguments.
     * @param {function():void} callback - The function to be called.
     * @returns {Unsubscriber} A function that unsubscribes the given function.
     */
    onNoSubscribers(callback: () => void): Unsubscriber;
    /**
     * Subscribes a function to be called when the SubscribeController is destroyed.
     * The function is called with no arguments.
     * @param {Function} callback - The function to be called.
     * @returns {Unsubscriber} A function that unsubscribes the given function.
     */
    onDestroy(callback: Function): Unsubscriber;
    #private;
}
type EngineMessages = number;
declare namespace EngineMessages {
    let DEPENDENCY_CHANGED: number;
    let DEPENDENCY_DESTROYED: number;
    let HAS_ERROR: number;
    let DEPENDENT_DESTROYED: number;
}
export {};
//# sourceMappingURL=store2.esm.d.ts.map