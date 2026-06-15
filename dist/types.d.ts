type ReactivePrimitive = import('./reactives/ReactivePrimitive.js').ReactivePrimitive;
type CompareFunction = (a: any, b: any) => boolean;

/* From api\api.d.ts */
/**
 * Creates a new Atom instance. An Atom is a reactive primitive that holds a value. Same as `atom` but
 * returns a new Atom instance.
 * @template T
 * @param {T} value - The initial value of the Atom.
 * @param {object} [options] - Options
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
 * Creates a new Computed instance. Computed is a reactive primitive that holds a value that is computed from other reactive values.
 * @template T
 * @param {()=>T} fn - The function that returns the value of the Computed
 * @param {object} [options] - Options
 * @param {string} [options.name] - The name of Computed.
 * @param {(a:T, b:T)=>boolean} [options.compareFunction] - A function that compares two values to determine if they are equal.
 * @param {boolean} [options.smartRecompute] - Whether the function is a hard function. If true, it prevents calling the function by comparing the string representation of the dependencies.
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
    smartRecompute?: boolean;
}): Computed<T>;
/**
 * Creates a new Collection instance. A Collection is a reactive primitive that holds an array of values. Same as `collection` but
 * returns a new Collection instance.
 * @template T
 * @param {T[]} value - The array to observe.
 * @param {object} [options] - Options
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
 * Creates a new ShallowReactive instance. An ShallowReactive is a reactive primitive that holds a value. Same as `shallowReactive` but
 * returns a new ShallowReactive instance.
 * @template T
 * @param {T} value - The object to observe.
 * @param {object} [options] - Options to configure the observable behavior.
 * @param {string} [options.name] - The name of ShallowReactive object.
 * @returns {T} The observed object
 * @example
 * ```js
 * const obj = shallowReactive({ a: 1, b: 2 });
 *
 * obj.subscribe(() => {
 *     console.log(obj.value);
 * });
 *
 * obj.value.a = 3;
 * // output: { a: 3, b: 2 }
 * ```
 */
export function shallowReactive<T>(value: T, options?: {
    name?: string;
}): T;
/**
 * Automatically tracks and subscribes to changes in reactive items used by the specified function.
 * This allows the function to be re-executed whenever any of its dependencies change, maintaining
 * up-to-date results.
 *
 * @param {(updates?:Map<string, UpdateDataRecord>)=>void} fn - The function to track and reactively execute.
 * @param {object} [options] - The options for the autorun function.
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
 * Supports nested batch calls.
 *
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
 * Tracks reactive items used by the specified data function and subscribes
 * the provided callback function to changes in these items. This ensures
 * that the callback is executed whenever any of the tracked dependencies
 * change, allowing for reactive updates based on the data function.
 *
 * @param {()=>any} dataFunction - The function whose reactive dependencies are tracked.
 * @param {(updates?:Map<string, UpdateDataRecord>)=>void} fn - The callback function to execute when tracked dependencies change.
 * @param {object} [options] - The options for the reaction function.
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
 * Automatically calls the given function whenever the given predicate evaluates to true.
 * @param {()=>boolean} predicate - The predicate that should be evaluated.
 * @param {()=>void} fn - The function to be called when the predicate evaluates to true.
 * @param {object} [options] - Optional options.
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
/**
 * Waits until the given predicate evaluates to true.
 * @param {()=>boolean} predicate - The predicate that should be evaluated.
 * @param {object} [options] - Optional options.
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
 * Enhances an object to make its properties observable using specified annotations.
 *
 * @template T
 * @param {T} obj - The object to be observed.
 * @param {{[key:string]:"atom"|"computed"|"collection"|"shallowReactive"|false}} annotations -
 *        Annotations defining the type of reactivity for each property. Properties with a
 *        'false' annotation will be ignored.
 * @param {object} [options] - Options to configure the observable behavior.
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
    [key: string]: "atom" | "computed" | "collection" | "shallowReactive" | false;
}, options?: {
    name?: string;
}): T;
/**
 * Makes existing object properties observable. Same as {@link makeObservable} but infers all the properties.
 * @template T
 * @param {T} obj - The object to observe.
 * @param {{[key:string]:"atom"|"computed"|"collection"|"shallowReactive"|false}} [overrides] - The overrides to use to define type of the reactive property. If an override is false, the key will be ignored.
 * @param {object} [options] - Options to configure the observable behavior.
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
    [key: string]: "atom" | "computed" | "collection" | "shallowReactive" | false;
}, options?: {
    name?: string;
}, filter?: Set<string>): T;
/**
 * Extends an object with new properties and makes them observable.
 *
 * @template T
 * @template {{[key:string]:any}} R
 * @param {T} target - The object to be extended and observed.
 * @param {R} properties - The properties to add to the target object.
 * @param {{[key:string]:"atom"|"computed"|"collection"|"shallowReactive"|false}} [overrides] - Optional overrides to define the type of the reactive property. If an override is false, the key will be ignored.
 * @param {object} [options] - Options to configure the observable behavior.
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
    [key: string]: "atom" | "computed" | "collection" | "shallowReactive" | false;
}, options?: {
    name?: string;
}): T & R;

/* From complex\reactiveList.d.ts */
/**
 * ReactiveList is a reactive array-like structure that stores values of any type.
 * It automatically chooses the appropriate reactive primitive:
 * - Objects and arrays are wrapped with `ShallowReactive` (shallow property tracking).
 * - Primitives (numbers, strings, booleans, etc.) are wrapped with `Atom`.
 *
 * The list supports adding, removing, updating, and splicing items while maintaining
 * full reactivity. Subscribers are notified only once per batch of changes.
 *
 * @template {{[key:string]:any}} T
 *
 * @example
 * ```js
 * const list = new ReactiveList();
 *
 * list.subscribe(() => {
 *     console.log('List changed:', list.getItems());
 * });
 *
 * list.add(1, 2, 3);                // numbers -> stored as Atom
 * list.setItem(1, 42);
 * list.splice(0, 1);
 * list.setItems([{ a: 1 }, { b: 2 }]); // objects -> stored as ShallowReactive
 * ```
 */
export class ReactiveList<T extends {
    [key: string]: any;
}> {
    /**
     * Adds one or more items to the end of the list.
     *
     * @param {...T} values - The values to add.
     */
    add(...values: T[]): void;
    /**
     * Retrieves the value at the given index.
     *
     * @param {number} index - The index of the item to retrieve.
     * @returns {T | undefined} The value, or undefined if the index is out of bounds.
     */
    getItem(index: number): T | undefined;
    /**
     * Returns a shallow copy of all items in the list as a plain array.
     *
     * @returns {T[]} An array containing all values.
     */
    getItems(): T[];
    /**
     * Updates the value at the specified index.
     *
     * @param {number} index - The index to update.
     * @param {T} value - The new value.
     */
    setItem(index: number, value: T): void;
    /**
     * Returns the current length of the list.
     *
     * @returns {number}
     */
    get length(): number;
    /**
     * Replaces the entire content of the list with the given array.
     *
     * @param {T[]} values - The new array of values.
     */
    setItems(values: T[]): void;
    /**
     * Removes elements from the list starting at `startIndex` and removing `count` items.
     * Remaining elements are shifted left. The operation is batched to emit only one notification.
     *
     * @param {number} startIndex - The index at which to start removal.
     * @param {number} count - The number of elements to remove.
     */
    splice(startIndex: number, count: number): void;
    /**
     * Removes the item at the given index.
     *
     * @param {number} index - The index of the item to remove.
     */
    removeItem(index: number): void;
    /**
     * Removes the last item of the list.
     */
    removeLastItem(): void;
    /**
     * Removes the first item of the list.
     */
    removeFirstItem(): void;
    /**
     * Removes all items from the list.
     */
    clear(): void;
    /**
     * Destroys the list, releasing all internal resources.
     * After destruction, any method call (except `isDestroyed`) will throw an error.
     */
    destroy(): void;
    /**
     * Indicates whether the list has been destroyed.
     *
     * @returns {boolean}
     */
    get isDestroyed(): boolean;
    /**
     * Subscribes a callback to be invoked whenever the list changes.
     * The callback receives a Map of updates with details about changed items.
     *
     * @param {(updates: Map<string, UpdateDataRecord>) => void} fn - The callback function.
     * @returns {() => void} A function to unsubscribe the callback.
     */
    subscribe(fn: (updates: Map<string, UpdateDataRecord>) => void): () => void;
    #private;
}
export type ReactiveWrapper<T> = T extends object ? ShallowReactive<T> : Atom<T>;

/* From complex\store.d.ts */
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
 * store.suppressNotifications();
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
     * @returns {object} A plain object containing the values of the items that match the filter.
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
    asPlainObject(filter?: "all" | "reactives" | "stores"): object;
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
    suppressNotifications(): void;
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

/* From core\BatchSnapshot.d.ts */
/**
 * BatchSnapshot stores the original values of properties at the start of a batch operation.
 * It allows detecting which properties have actually changed after a series of mutations
 * inside a batch, and whether they have reverted to their original values.
 */
export class BatchSnapshot {
    /**
     * Creates a new BatchSnapshot instance.
     * @param {ReactivePrimitive} reactiveItem - The reactive item to snapshot.
     */
    constructor(reactiveItem: ReactivePrimitive);
    /**
     * Records the original value for a property if not already recorded in this batch.
     * @param {string} property - The property key.
     * @param {any} value - The original value at the start of the batch.
     */
    record(property: string, value: any): void;
    /**
     * Returns the original value recorded for a property.
     * @param {string} property - The property key.
     * @returns {any | undefined} The original value, or undefined if not recorded.
     */
    getOriginal(property: string): any | undefined;
    /**
     * Checks whether a property has been recorded in this snapshot.
     * @param {string} property - The property key.
     * @returns {boolean} True if the property was recorded.
     */
    has(property: string): boolean;
    /**
     * Returns an array of property keys that have changed compared to their original values.
     * Uses the reactive item's equality comparison function.
     * @param {(property: string) => any} getCurrentValue - Function that returns the current value for a given property.
     * @returns {string[]} Array of property keys that actually changed.
     */
    getChangedProperties(getCurrentValue: (property: string) => any): string[];
    /**
     * Clears all recorded initial values.
     */
    clear(): void;
    /**
     * Returns the number of recorded properties.
     * @returns {number}
     */
    get size(): number;
    #private;
}

/* From core\Engine.d.ts */
export type EngineMessages = number;
export namespace EngineMessages {
    let DEPENDENCY_CHANGED: number;
    let DEPENDENCY_DESTROYED: number;
    let HAS_ERROR: number;
    let DEPENDENT_DESTROYED: number;
}
export const ATOM: 1;
export const COMPUTED: 2;
export const COLLECTION: 3;
export const SHALLOW_REACTIVE: 4;
export class Engine {
    /**
     * Creates an Engine instance.
     * @param {ReactivePrimitive} reactiveItem - The reactive item.
     * @param {ATOM|COMPUTED|COLLECTION|SHALLOW_REACTIVE} type - The type.
     */
    constructor(reactiveItem: ReactivePrimitive, type: 1 | 2 | 3 | 4);
    /**
     * The set of dependencies of the engine.
     * @type {Set<ReactivePrimitive>}
     */
    dependencies: Set<ReactivePrimitive>;
    /**
     * The set of dependents of the engine.
     * @type {Set<ReactivePrimitive>}
     */
    dependents: Set<ReactivePrimitive>;
    /**
     * Unique identifier for ordering.
     * @type {number}
     */
    id: number;
    /**
     * Version number (currently unused, kept for potential future use).
     * @type {number}
     */
    version: number;
    /**
     * Reference to the reactive item.
     * @type {ReactivePrimitive}
     */
    reactiveItem: ReactivePrimitive;
    /**
     * Flag indicating that the value should be recalculated.
     * @type {boolean}
     */
    shouldRecalc: boolean;
    /**
     * Indicates whether the engine has been destroyed.
     * @type {boolean}
     */
    isDestroyed: boolean;
    subscribeController: SubscribeController;
    /**
     * The type of the reactive item.
     * @type {number}
     */
    type: number;
    /**
     * Map of pending updates (property -> UpdateDataRecord).
     * @type {Map<string, UpdateDataRecord>}
     */
    updates: Map<string, UpdateDataRecord>;
    /**
     * Comparison function for equality.
     * @type {CompareFunction|null}
     */
    compareFn: CompareFunction | null;
    /**
     * Prevents updates from being propagated (used during mass updates).
     * @type {boolean}
     */
    suppressNotifications: boolean;
    /** @type {Error|null} */
    get error(): Error;
    /**
     * Determines whether a change actually affects the final value (considering batch).
     * @param {string} property - The property key.
     * @param {any} newValue - The new value.
     * @returns {boolean} True if the change is effective.
     */
    isEffectiveChange(property: string, newValue: any): boolean;
    /**
     * Alternative version that accepts explicit oldValue (preferred).
     * @param {string} property - The property key.
     * @param {any} oldValue - The previous value (immediate before this change).
     * @param {any} newValue - The new value.
     * @returns {boolean}
     */
    isEffectiveChangeWithOld(property: string, oldValue: any, newValue: any): boolean;
    /**
     * Legacy method for backward compatibility. Delegates to recordChange + #commitChange.
     * @param {string} property - The property key.
     * @param {"set"|"delete"} verb - The operation.
     * @param {any} oldValue - The previous value.
     * @param {any} value - The new value.
     * @returns {boolean} True if an update was added.
     */
    addUpdate(property: string, verb: "set" | "delete", oldValue: any, value: any): boolean;
    /**
     * Adds dependencies to this engine.
     * @param {Set<ReactivePrimitive>} dependencies
     */
    addDependencies(dependencies: Set<ReactivePrimitive>): void;
    /**
     * Adds a single dependency.
     * @param {ReactivePrimitive} dependency
     */
    addDependency(dependency: ReactivePrimitive): void;
    /**
     * Adds a dependent.
     * @param {ReactivePrimitive} dependent
     * @returns {boolean}
     */
    addDependent(dependent: ReactivePrimitive): boolean;
    /**
     * Removes a dependent.
     * @param {ReactivePrimitive} dependent
     */
    removeDependent(dependent: ReactivePrimitive): void;
    /**
     * Returns all dependents recursively.
     * @returns {Set<ReactivePrimitive>}
     */
    getDeepDependents(): Set<ReactivePrimitive>;
    /**
     * Returns sorted array of deep dependents.
     * @returns {Array<ReactivePrimitive>}
     */
    getDeepDependentsArray(): Array<ReactivePrimitive>;
    /**
     * Notifies dependents of a message.
     * @param {EngineMessages} message
     * @param {{sender: ReactivePrimitive, recipients: Set<ReactivePrimitive>}} [ctx]
     */
    notifyDependents(message: EngineMessages, ctx?: {
        sender: ReactivePrimitive;
        recipients: Set<ReactivePrimitive>;
    }): void;
    /**
     * Notifies dependencies (reverse direction).
     * @param {EngineMessages} message
     * @param {{sender: ReactivePrimitive, recipients: Set<ReactivePrimitive>}} ctx
     */
    notifyDependencies(message: EngineMessages, ctx: {
        sender: ReactivePrimitive;
        recipients: Set<ReactivePrimitive>;
    }): void;
    /**
     * Handles incoming messages.
     * @param {EngineMessages} message
     * @param {{sender: ReactivePrimitive, recipients: Set<ReactivePrimitive>}} ctx
     */
    getMessage(message: EngineMessages, ctx: {
        sender: ReactivePrimitive;
        recipients: Set<ReactivePrimitive>;
    }): void;
    /**
     * Sets an error and notifies dependents.
     * @param {Error|null} error
     * @param {{sender: ReactivePrimitive, recipients: Set<ReactivePrimitive>}} [ctx]
     */
    setError(error: Error | null, ctx?: {
        sender: ReactivePrimitive;
        recipients: Set<ReactivePrimitive>;
    }): void;
    /**
     * Clears the current error.
     */
    clearError(): void;
    /**
     * Destroys the engine.
     * @param {{sender: ReactivePrimitive, recipients: Set<ReactivePrimitive>}} [ctx]
     */
    destroy(ctx?: {
        sender: ReactivePrimitive;
        recipients: Set<ReactivePrimitive>;
    }): void;
    /**
     * Clears all pending updates.
     */
    clearUpdates(): void;
    /**
     * Checks if there are any pending updates.
     * @returns {boolean}
     */
    hasUpdates(): boolean;
    /**
     * Legacy method for compatibility.
     * @returns {boolean}
     */
    checkChangesOldValues(): boolean;
    /**
     * Processes temporary changes after batch ends.
     * Removes updates for properties that reverted to original values.
     * @returns {boolean} True if any changes remain.
     */
    checkChangesTemporary(): boolean;
    /**
     * Called after a value change to schedule notifications.
     */
    valueChangedCallback(): void;
    /**
     * Prepares the engine for setting a new value.
     * @throws {Error} If destroyed or in subscribers mode.
     */
    prepareSetValue(): void;
    /**
     * Updates dependencies to a new set.
     * @param {Set<ReactivePrimitive>} newDeps
     */
    updateDependencies(newDeps: Set<ReactivePrimitive>): void;
    #private;
}

/* From core\subscribeController.d.ts */
export type Unsubscriber = () => void;
/**
 * @typedef {()=>void} Unsubscriber
 */
export class SubscribeController {
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

/* From core\UpdateDataRecord.d.ts */
export class UpdateDataRecord {
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
export class UpdateDataRecordManager {
    /**
     * Initializes an instance of UpdateDataRecordManager with the given data.
     * @param {Map<string, UpdateDataRecord>} data - The data to be managed.
     */
    constructor(data: Map<string, UpdateDataRecord>);
    data: Map<string, UpdateDataRecord>;
    /**
     * Removes the specified item and its related sub-items from the data map.
     * Replaces the deleted items with new UpdateDataRecord instances indicating the "delete" action.
     * @param {string} itemName - The name of the item to be destroyed.
     */
    removeItem(itemName: string): void;
}

/* From helpers\tools.d.ts */
/**
 * Sorts reactive items by their internal id. This is used to
 * ensure that reactive items are processed in a consistent order
 * when they are notified of changes.
 * @param {ReactivePrimitive} a - The first item to compare
 * @param {ReactivePrimitive} b - The second item to compare
 * @returns {number} -1 if a should come before b, 0 if a and b are equal, 1 if a should come after b
 */
export function sortReactiveItems(a: ReactivePrimitive, b: ReactivePrimitive): number;
/**
 * Combines multiple reactive items or sets of reactive items into a single set,
 * ensuring that each item appears only once. The combined set is then converted
 * to an array and sorted by the internal id of the reactive items.
 *
 * @param {...(ReactivePrimitive|Set<ReactivePrimitive>)} items - Reactive items or sets of reactive items to combine and sort.
 * @returns {Array<ReactivePrimitive>} A sorted array of unique reactive items.
 */
export function getSortedReactiveItems(...items: (ReactivePrimitive | Set<ReactivePrimitive>)[]): Array<ReactivePrimitive>;
/**
 * Checks if a given value is a plain object.
 * @param {*} obj - The value to check.
 * @returns {boolean} true if the value is a plain object, false otherwise.
 */
export function isPlainObject(obj: any): boolean;
/**
 * Checks if two objects are equal. If objects are arrays, then check if stringified versions of them are equal.
 * If objects are not arrays, then check if sorted stringified versions of them are equal.
 * @param {unknown} a
 * @param {unknown} b
 * @returns {boolean}
 */
export function compareAny(a: unknown, b: unknown): boolean;
/**
 * Debounce function that, as long as it continues to be invoked, will not be triggered.
 * @template {Function} T
 * @param {T} func - Function to be debounced
 * @param {number} wait - Time in milliseconds to wait before the function gets called.
 * @returns {T}
 * @example
   window.addEventListener('resize', debounce((evt) => console.log(evt), 250));
 */
export function debounce<T extends Function>(func: T, wait: number): T;
/**
 * Clones an object. If the object is an array, the function returns a shallow copy of the array.
 * If the object is a plain object, the function returns a shallow copy of the object.
 * If the object is not an array or a plain object, the function returns the object as is.
 * @template T
 * @param {T} obj - The object to clone
 * @returns {T} A shallow copy of the object
 */
export function clone<T>(obj: T): T;
/**
 * A Promise-based sleep function.
 * @param {number} ms - The amount of milliseconds to sleep for.
 * @returns {Promise<void>}
 */
export function sleep(ms: number): Promise<void>;
/**
 * Gets all property descriptors of an object, including its prototype and all its ancestors.
 * The descriptors are returned as a plain object.
 * @param {object} obj - The object to get the property descriptors from.
 * @param {number} [depth=0]
 * @param {number} [maxDepth=100]
 * @returns {{[x: string]: TypedPropertyDescriptor<any>;} & { [x: string]: PropertyDescriptor;}} A plain object with all property descriptors of the object.
 */
export function getAllPropertyDescriptors(obj: object, depth?: number, maxDepth?: number): {
    [x: string]: TypedPropertyDescriptor<any>;
} & {
    [x: string]: PropertyDescriptor;
};
/**
 * Converts any value to an Error object.
 *
 * If the given value is already an instance of Error, it is returned unchanged.
 * Otherwise, a new Error object is created using the string representation of the value.
 *
 * @param {unknown} e - The value to convert into an Error.
 * @returns {Error} An Error object derived from the input value.
 *
 * @example
 * // Returns the original Error
 * const originalError = new Error('Something went wrong');
 * getError(originalError) === originalError; // true
 *
 * @example
 * // Converts a string to an Error
 * const error = getError('Network failure');
 * error.message; // 'Network failure'
 * error instanceof Error; // true
 *
 * @example
 * // Converts numbers or other types
 * getError(42).message; // '42'
 * getError(null).message; // 'null'
 * getError(undefined).message; // 'undefined'
 */
export function getError(e: unknown): Error;
/**
 * Extracts names (and optionally ids) from a Set of reactive primitives.
 * Returns an array of strings, one per item.
 *
 * @param {Set<ReactivePrimitive>|Iterable<ReactivePrimitive>} items - Collection of reactive items.
 * @param {{includeId:boolean, fallback:string, sorted:boolean}} [options] - Formatting options.
 * @returns {string[]} Array of item representations.
 *
 * @example
 * const a = new Atom(0, { name: 'counter' });
 * const b = new Computed(() => a.value * 2, { name: 'double' });
 * const set = new Set([a, b]);
 * getItemNamesFromSet(set);
 * // ['counter', 'double']
 *
 * @example
 * getItemNamesFromSet(set, { includeId: true });
 * // ['counter:5', 'double:7']
 *
 * @example
 * getItemNamesFromSet(set, { fallback: '?', sorted: false });
 */
export function getItemNamesFromSet(items: Set<ReactivePrimitive> | Iterable<ReactivePrimitive>, options?: {
    includeId: boolean;
    fallback: string;
    sorted: boolean;
}): string[];

/* From reactives\Atom.d.ts */
/**
 * Atom is a reactive primitive that holds a value. It is the base unit of reactive state.
 * @augments ReactivePrimitive
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
     * @param {object} [options] - Options.
     * @param {string} [options.name] - The name of the Atom.
     * @param {((a:T, b:T)=>boolean)|null} [options.compareFunction] - A function that compares two values for equality.
     */
    constructor(value: T, options?: {
        name?: string;
        compareFunction?: ((a: T, b: T) => boolean) | null;
    });
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
     * @param {{untracked?: boolean}} [options] - Optional options. If `untracked` is `false`, the Atom value will be added to the dependencyTracker.
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

/* From reactives\Collection.d.ts */
/**
 * Collection is a reactive primitive that holds an array of values.
 * It provides reactivity for array operations (push, pop, splice, etc.)
 * and allows tracking changes to individual elements and the array length.
 *
 * @template T
 * @augments ReactivePrimitive
 * @example
 * ```js
 * const coll = new Collection([1, 2, 3]);
 * coll.subscribe((updates) => {
 *     console.log('Collection changed:', Array.from(updates.keys()));
 * });
 * coll.value.push(4); // triggers reactivity
 * ```
 */
export class Collection<T> extends ReactivePrimitive {
    /**
     * Initializes a Collection instance with an initial array.
     *
     * @param {T[]} value - The initial array value.
     * @param {object} [options] - Configuration options.
     * @param {string} [options.name] - The name of the Collection (for debugging).
     * @param {CompareFunction|null} [options.compareFunction] - Custom equality function for values.
     */
    constructor(value: T[], options?: {
        name?: string;
        compareFunction?: CompareFunction | null;
    });
    /**
     * Sets the entire array, replacing all elements.
     * Only triggers reactivity if the new array differs from the current one.
     *
     * @param {T[]} value - The new array value.
     */
    set value(value: T[]);
    /**
     * Returns the proxied array value (same as getValue()).
     *
     * @returns {T[]} The reactive array proxy.
     */
    get value(): T[];
    /**
     * Returns the proxied array value.
     * Tracks this Collection as a dependency when accessed.
     *
     * @param {{untracked?: boolean}} [options] - If `untracked` is true, does not add to dependency tracker.
     * @returns {T[]} The reactive array proxy.
     */
    getValue(options?: {
        untracked?: boolean;
    }): T[];
    /**
     * Alias for `value` setter.
     *
     * @param {T[]} value - The new array value.
     */
    set data(value: T[]);
    /**
     * Alias for `value` getter.
     *
     * @returns {T[]} The reactive array proxy.
     */
    get data(): T[];
    /**
     * Returns the raw, unproxied target array.
     * Warning: Mutating the raw array directly does NOT trigger reactivity.
     *
     * @returns {T[]} The raw array.
     */
    getRawValue(): T[];
    #private;
}

/* From reactives\Computed.d.ts */
/**
 * Computed is a reactive primitive that holds a value that is computed from other reactive values.
 * It is the base unit of reactive state.
 * @augments ReactivePrimitive
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
     * @param {object} [options] - Options
     * @param {string} [options.name] - The name of the Computed instance.
     * @param {((a:T, b:T)=>boolean)|null} [options.compareFunction] - A function that compares two values for equality.
     * @param {boolean} [options.smartRecompute] - When true, the computed value will be
     *        recalculated only when the version string of its dependencies changes,
     *        rather than on every dependency notification. This avoids unnecessary
     *        recalculations when dependencies change but their final values remain
     *        the same (e.g., toggling back and forth). Defaults to false.
     */
    constructor(fn: () => T, options?: {
        name?: string;
        compareFunction?: ((a: T, b: T) => boolean) | null;
        smartRecompute?: boolean;
    });
    /** @type {string} */
    __cachedDependentsVersionString: string;
    options: {
        smartRecompute: boolean;
    };
    /**
     * Checks whether the Computed value needs to be recalculated. A recalculation is needed if the engine's shouldRecalc
     * property is true, if the engine has an error, or if the version string of the dependencies has changed.
     * @returns {boolean} true if the Computed value needs to be recalculated, false if it does not.
     */
    isStale(): boolean;
    /**
     * @param {{untracked?: boolean}} [options] - Optional options. If `untracked` is `false`, the Computed value will be added to the dependencyTracker.
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
     *
     * @returns {T}
     */
    peekValue(): T;
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

/* From reactives\ReactivePrimitive.d.ts */
/**
 * ReactivePrimitive is the base class for all reactive items. It provides methods for subscribing to changes,
 * getting the current value, and checking for errors.
 * @private
 */
export class ReactivePrimitive {
    /**
     *
     * @param {1|2|3|4} type
     */
    constructor(type: 1 | 2 | 3 | 4);
    engine: Engine;
    name: string;
    /**
     * Subscribes a function to be called whenever the value of this reactive item changes.
     * @param {(updates: Map<string, UpdateDataRecord>)=>void} fn - The function to be called whenever the value of this reactive item changes.
     * @param {object} [options] - Optional options.
     * @param {number} [options.delay] - The delay in milliseconds before the function is called.
     * @param {AbortSignal} [options.signal] - The signal to abort the subscription.
     * @returns {()=>void}
     */
    subscribe(fn: (updates: Map<string, UpdateDataRecord>) => void, options?: {
        delay?: number;
        signal?: AbortSignal;
    }): () => void;
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
     * @param {object} [options] - Optional options.
     * @param {boolean} [options.untracked=false] - If `true`, the value will not be added to the dependencyTracker.
     * @returns {any} The current value of the reactive item.
     */
    getValue(options?: {
        untracked?: boolean;
    }): any;
    /**
     * Retrieves the current value of the reactive item.
     * @returns {any} The current value of the reactive item.
     */
    peekValue(): any;
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

/* From reactives\ShallowReactive.d.ts */
/**
 * ShallowReactive is a reactive primitive that holds a shallow object. It is the base unit of reactive state.
 * It is a shallow reactive object, meaning that it only tracks changes to the properties of the object itself, not its nested properties.
 * @augments ReactivePrimitive
 * @template {{[key:string]:any}} T
 *  * @example
 * ```js
 * const b = new ShallowReactive({ foo: 1 });
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
 * const b = new ShallowReactive(new A(), { name: "b" });
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
export class ShallowReactive<T extends {
    [key: string]: any;
}> extends ReactivePrimitive {
    /**
     * Initializes a ShallowReactive instance with a given value.
     * @param {T} value - The initial value of the ShallowReactive.
     * @param {object} [options] - Options.
     * @param {string} [options.name] - The name of the ShallowReactive.
     */
    constructor(value: T, options?: {
        name?: string;
    });
    /**
     * Retrieves the proxied value of the ShallowReactive. If the engine is destroyed, an error is thrown.
     * Tracks the ShallowReactive for dependency management.
     * @param {{untracked?: boolean}} [options] - Optional options. If `untracked` is `false`, the ShallowReactive value will be added to the dependencyTracker.
     * @returns {T} The proxied value of the ShallowReactive.
     */
    getValue(options?: {
        untracked?: boolean;
    }): T;
    /**
     * Sets the value of the ShallowReactive. If the value is an object, it will be proxied and reactive.
     * @param {T} value - The new value of the ShallowReactive.
     */
    setValue(value: T): void;
    /**
     * Sets the value of the ShallowReactive. If the value is an object, it will be proxied and reactive.
     * @param {T} value - The new value of the ShallowReactive.
     */
    set value(value: T);
    /**
     * Retrieves the proxied value of the ShallowReactive. If the engine is destroyed, an error is thrown.
     * Tracks the ShallowReactive for dependency management.
     * @returns {T} The proxied value of the ShallowReactive.
     */
    get value(): T;
    /**
     * Sets the value of the ShallowReactive. If the value is an object, it will be proxied and reactive.
     * This is a synonym for `set value(value)`.
     * @param {T} value - The new value of the ShallowReactive.
     */
    set data(value: T);
    /**
     * Retrieves the proxied value of the ShallowReactive. If the engine is destroyed, an error is thrown.
     * Tracks the ShallowReactive for dependency management.
     * @returns {T} The proxied value of the ShallowReactive.
     */
    get data(): T;
    /**
     * Returns the raw, unproxied value of the ShallowReactive. This is generally not recommended as it breaks reactivity.
     * @returns {T} The raw, unproxied value of the ShallowReactive.
     */
    getRawValue(): T;
    #private;
}

/* From services\changedItemsController.d.ts */
export const changedItemsController: ChangedItemsController;
/**
 * Controller that manages changed reactive items and coordinates subscriber notifications.
 * Handles batching, dependency recalculation, and error aggregation.
 */
declare class ChangedItemsController {
    /** @type {Set<ReactivePrimitive>} */
    items: Set<ReactivePrimitive>;
    /**
     * Adds a reactive item to the set of changed items.
     * If not in batch mode, immediately runs subscribers and clears the set.
     * @param {ReactivePrimitive} item - The reactive item that changed.
     */
    addItem(item: ReactivePrimitive): void;
    /**
     * @param {ReactivePrimitive} item
     */
    removeItem(item: ReactivePrimitive): void;
    /**
     * Removes all items from the changed items set.
     */
    clear(): void;
    /**
     * Runs all subscribers for the changed items.
     * Processes dependency trees, recalculates stale computed values,
     * and invokes subscriber callbacks with update records.
     * Handles errors and aggregates them if multiple occur.
     */
    runSubscribers(): void;
}
export {};

/* From services\dependencyTracker.d.ts */
/**
 * Executes the specified function and tracks reactive items.
 * Returns a sorted array of used reactive items.
 * @param {Function} fn - The function to execute and track.
 * @param {...any} args - Arguments to pass to the function.
 * @returns {Array<ReactivePrimitive>} Sorted array of reactive items accessed.
 */
export function getArrayOfUsedReactiveItems(fn: Function, ...args: any[]): Array<ReactivePrimitive>;
/**
 * Executes the specified function and tracks reactive items.
 * Returns a Set of used reactive items.
 * @param {Function} fn - The function to execute and track.
 * @param {...any} args - Arguments to pass to the function.
 * @returns {Set<ReactivePrimitive>} Set of reactive items accessed.
 */
export function getSetOfUsedReactiveItems(fn: Function, ...args: any[]): Set<ReactivePrimitive>;
/**
 * The dependencyTracker is a utility instance that monitors reactive items that are used when a computed item is created. It is used
 * to track the dependencies of a computed item, so that it can be recalculated when any of the dependencies change.
 */
export const dependencyTracker: Tracker;
declare class Tracker {
    /** @type {object} */
    ctx: object;
    /**
     * Returns the current contents of the tracker's store, which is a set of all reactive items that have been
     * accessed since the tracker was last turned on. This is useful for debugging and testing purposes.
     * @returns {Set<ReactivePrimitive>} The current contents of the tracker's store.
     */
    get data(): Set<ReactivePrimitive>;
    /**
     * Returns a sorted array of all reactive items in the tracker's store. The items are sorted by their internal id,
     * ensuring consistent processing order when notified of changes.
     * @returns {Array<ReactivePrimitive>} A sorted array of reactive items.
     */
    getAsSortedArray(): Array<ReactivePrimitive>;
    /**
     * Adds a reactive item to the tracker's store if the tracker is turned on. If the tracker is not turned on, this
     * method does nothing.
     * @param {ReactivePrimitive} item - The reactive item to add to the tracker's store.
     * @param {string} [_key=""]
     */
    add(item: ReactivePrimitive, _key?: string): void;
    /**
     *
     * @param {(reactiveItem:ReactivePrimitive)=>void} callback
     * @returns {()=>void}
     */
    onAdd(callback: (reactiveItem: ReactivePrimitive) => void): () => void;
    /**
     * Returns whether the tracker is currently turned on or not.
     * @returns {boolean} true if the tracker is on, false if it is off.
     */
    isTurnedOn(): boolean;
    /**
     * Turns the tracker on and clears its store. If the tracker is already turned on, an error is thrown.
     * @param {object} [ctx={}] - The context to use when the tracker is turned on.
     * are tracked. If filter is a function, it is called with each reactive item as its argument, and if it returns false, the
     * reactive item is not tracked.
     */
    turnOn(ctx?: object): void;
    /**
     * Disables the tracker. When the tracker is disabled, it will not watch any set operations and will not report
     * anything to any registered listeners. The tracker is off by default.
     */
    turnOff(): void;
    #private;
}
export {};

/* From services\idService.d.ts */
export const idService: IdService;
/**
 * A service that generates unique numeric identifiers for reactive items.
 * Ensures deterministic ordering based on creation time.
 */
declare class IdService {
    /**
     * Generates a new unique numeric identifier.
     * @returns {number} A new unique number.
     */
    generateId(): number;
    /**
     * Compares two numeric identifiers.
     * @param {number} a - First identifier.
     * @param {number} b - Second identifier.
     * @returns {number} Negative if a < b, positive if a > b, zero if equal.
     */
    compareIds(a: number, b: number): number;
    /**
     * Resets the counter to zero (useful for testing).
     */
    reset(): void;
    #private;
}
export {};

/* From services\modeController.d.ts */
export const modeController: ModeControllerService;
declare class ModeControllerService {
    computedMode: boolean;
    untrackMode: boolean;
    throwErrorInSubscribers: boolean;
    /** @type {EventEmitterExt<"batchModeStart"|"batchModeEnd"|"beforeBatchModeEnd">} */
    batchModeEvents: EventEmitterExt<"batchModeStart" | "batchModeEnd" | "beforeBatchModeEnd">;
    /** @type {EventEmitterExt<"subscribersModeEnd">} */
    subscribersModeEvents: EventEmitterExt<"subscribersModeEnd">;
    /**
     * Subscribes a function to be called whenever the given event is triggered.
     * @param {"batchModeStart"|"batchModeEnd"|"beforeBatchModeEnd"} event - The event to subscribe to.
     * @param {function():void} callback - The function to be called.
     * @returns {()=>void} A function that unsubscribes the given function.
     */
    on(event: "batchModeStart" | "batchModeEnd" | "beforeBatchModeEnd", callback: () => void): () => void;
    /**
     * Returns true if currently inside a batch (batch depth > 0).
     * @returns {boolean}
     */
    get batchMode(): boolean;
    /**
     * Enters a batch mode. Increments the batch depth.
     * Emits "batchModeStart" when entering the first batch.
     */
    enterBatch(): void;
    /**
     * Exits a batch mode. Decrements the batch depth.
     * If exiting the last batch, emits "beforeBatchModeEnd" and then "batchModeEnd".
     */
    exitBatch(): void;
    /**
     * Retrieves whether any subscribers are currently running.
     * @returns {boolean}
     */
    get subscribersMode(): boolean;
    /**
     * Sets the state to indicate that subscribers are currently running.
     */
    startSubscribersMode(): void;
    /**
     * Sets the state to indicate that no subscribers are currently running.
     */
    endSubscribersMode(): void;
    /**
     * Subscribes a function to be called once after all subscribers have finished running.
     * @param {Function} callback
     */
    runAfterSubscribers(callback: Function): void;
    #private;
}

export {};
