import { EventEmitterExt } from '@supercat1337/event-emitter-ext';
import { Dictionary } from '@supercat1337/dictionary';

// @ts-check

/**
 * A class representing an id for a reactive item.
 */
class ItemId {
    /** @type {number} */
    timestamp;

    /** @type {number} */
    innerIndex;

    /**
     * @param {number} timestamp - The timestamp of the id.
     * @param {number} innerIndex - The inner index of the id.
     */
    constructor(timestamp, innerIndex) {
        /** @type {number} */
        this.timestamp = timestamp;

        /** @type {number} */
        this.innerIndex = innerIndex;
    }

    /**
     * Returns a string representation of the id in the form of "timestamp-innerIndex".
     * @returns {string} A string representation of the id.
     */
    toString() {
        return `${this.timestamp}-${this.innerIndex}`;
    }
}

/**
 * A service that generates unique ids for reactive items.
 */
class IdService {
    /** @type {number} */
    lastTimestamp = Date.now();

    /** @type {number} */
    lastInnerIndex = 0;

    /**
     * Generates a unique ItemId based on the current timestamp and an inner index.
     * If multiple IDs are generated within the same millisecond, the inner index is incremented
     * to ensure uniqueness. If the inner index reaches Number.MAX_SAFE_INTEGER, it resets to 0
     * and the timestamp is slightly adjusted to maintain uniqueness.
     *
     * @returns {ItemId} A new unique ItemId object.
     */
    generateId() {
        let timestamp = Date.now();

        if (timestamp === this.lastTimestamp) {
            this.lastInnerIndex++;
        } else {
            this.lastInnerIndex = 0;
            this.lastTimestamp = timestamp;
        }

        return new ItemId(timestamp, this.lastInnerIndex);
    }

    /**
     * Compare two ids.
     *
     * @param {ItemId} id1 - The first id to compare.
     * @param {ItemId} id2 - The second id to compare.
     *
     * @returns {number} - A negative number if id1 is less than id2, a positive number if id1 is greater than id2, and 0 if both ids are equal.
     */
    compareIds(id1, id2) {
        if (id1.timestamp < id2.timestamp) return -1;
        if (id1.timestamp > id2.timestamp) return 1;
        if (id1.innerIndex < id2.innerIndex) return -1;
        if (id1.innerIndex > id2.innerIndex) return 1;
        return 0;
    }
}

const idService = new IdService();

// @ts-check


/**
 * Sorts reactive items by their internal id. This is used to
 * ensure that reactive items are processed in a consistent order
 * when they are notified of changes.
 * @param {ReactivePrimitive} a - The first item to compare
 * @param {ReactivePrimitive} b - The second item to compare
 * @returns {number} -1 if a should come before b, 0 if a and b are equal, 1 if a should come after b
 */
function sortReactiveItems(a, b) {
    return idService.compareIds(a.engine.id, b.engine.id);
}

/**
 * Checks if a given value is a plain object.
 * @param {*} obj - The value to check.
 * @returns {boolean} true if the value is a plain object, false otherwise.
 */
function isPlainObject(obj) {
    return typeof obj === "object" && obj !== null && !Array.isArray(obj);
}

/**
 * Checks if two arrays are equal. If the arrays are not the same length, then this function returns false.
 * Otherwise, this function checks if each element of the two arrays is equal, using the compareAny function.
 * @param {any[]} a - The first array to compare.
 * @param {any[]} b - The second array to compare.
 * @returns {boolean} True if the two arrays are equal, false otherwise.
 */
function compareArrays(a, b) {
    if (a.length !== b.length) {
        return false;
    }

    for (let i = 0; i < a.length; i++) {
        if (!compareAny(a[i], b[i])) {
            return false;
        }
    }

    return true;
}

/**
 * Checks if two plain objects are equal. If the objects do not have the same set of keys, then this function returns false.
 * Otherwise, this function checks if each value of the two objects is equal, using the compareAny function.
 * @param {Object} a - The first object to compare.
 * @param {Object} b - The second object to compare.
 * @returns {boolean} True if the two objects are equal, false otherwise.
 */
function comparePlainObjects(a, b) {
    if (a === b) return true;
    if (!isPlainObject(a) || !isPlainObject(b)) return false;

    let keysA = Object.keys(a);
    let keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (let i = 0; i < keysA.length; i++) {
        let key = keysA[i];
        let hasProperty = Object.prototype.hasOwnProperty.call(b, key);
        if (!hasProperty) {
            return false;
        }

        if (!compareAny(a[key], b[key])) {
            return false;
        }
    }

    return true;
}

/**
 * Checks if two objects are equal. If objects are arrays, then check if stringified versions of them are equal.
 * If objects are not arrays, then check if sorted stringified versions of them are equal.
 * @param {unknown} a
 * @param {unknown} b
 * @returns {boolean}
 */
function compareAny(a, b) {
    if (a === b) return true;
    if (typeof a != typeof b) return false;

    if (a === null || b === null) return false;
    if (a === undefined || b === undefined) return false;

    if (Array.isArray(a) || Array.isArray(b)) {
        if (!(Array.isArray(a) && Array.isArray(b))) {
            return false;
        }

        return compareArrays(a, b);
    }

    return comparePlainObjects(a, b);
}

/**
 * Debounce function that, as long as it continues to be invoked, will not be triggered.
 * @template {Function} T
 * @param {T} func - Function to be debounced
 * @param {number} wait - Time in milliseconds to wait before the function gets called.
 * @returns {T}
 * @example
   window.addEventListener('resize', debounce((evt) => console.log(evt), 250));
 */
function debounce(func, wait) {
    var timeout;
    var f = (...args) => {
        var context = this;
        var later = function () {
            timeout = null;
            func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };

    return /** @type {T} */ /** @type {any} */ (f);
}

/**
 * Clones an object. If the object is an array, the function returns a shallow copy of the array.
 * If the object is a plain object, the function returns a shallow copy of the object.
 * If the object is not an array or a plain object, the function returns the object as is.
 * @template T
 * @param {T} obj - The object to clone
 * @returns {T} A shallow copy of the object
 */
function clone(obj) {
    if (Array.isArray(obj)) {
        // @ts-ignore
        return obj.slice();
    } else if (typeof obj === "object" && obj !== null) {
        return Object.assign({}, obj);
    } else {
        return obj;
    }
}

/**
 * Gets all property descriptors of an object, including its prototype and all its ancestors.
 * The descriptors are returned as a plain object.
 * @param {Object} obj - The object to get the property descriptors from.
 * @returns {{[x: string]: TypedPropertyDescriptor<any>;} & { [x: string]: PropertyDescriptor;}} A plain object with all property descriptors of the object.
 */
function getAllPropertyDescriptors(obj) {
    if (!obj) {
        return Object.create(null);
    } else {
        const proto = Object.getPrototypeOf(obj);
        return {
            ...getAllPropertyDescriptors(proto),
            ...Object.getOwnPropertyDescriptors(obj),
        };
    }
}

// @ts-check


class UpdateDataRecord {
    /** @type {"set"|"delete"} */
    verb;

    /** @type {any} */
    value;

    /** @type {any} */
    oldValue;

    /** @type {ReactivePrimitive|undefined} */
    reactiveItem;

    /**
     * Initializes an instance of UpdateDataRecord with the provided verb, old value, and new value.
     * @param {"set"|"delete"} verb - The action performed, either "set" or "delete".
     * @param {any} oldValue - The previous value before the update.
     * @param {any} value - The new value after the update.
     * @param {ReactivePrimitive} [reactiveItem] - The reactive item that triggered the update.
     */
    constructor(verb, oldValue, value, reactiveItem) {
        this.verb = verb;
        this.oldValue = oldValue;
        this.value = value;
        this.reactiveItem = reactiveItem;
    }
}

class UpdateDataRecordManager {
    /**
     * Initializes an instance of UpdateDataRecordManager with the given data.
     * @param {Map<string, UpdateDataRecord>} data - The data to be managed.
     */
    constructor(data) {
        this.data = data;
    }

    /**
     * Removes the specified item and its related sub-items from the data map.
     * Replaces the deleted items with new UpdateDataRecord instances indicating the "delete" action.
     * @param {string} itemName - The name of the item to be destroyed.
     */
    removeItem(itemName) {
        //this.data.delete(itemName);
        this.data.set(
            itemName,
            new UpdateDataRecord("delete", undefined, undefined, undefined)
        );

        /** @type {string[]} */
        let keysToDelete = [];

        this.data.forEach((item, key) => {
            if (key.startsWith(itemName + ".")) {
                keysToDelete.push(key);
            }
        });

        keysToDelete.forEach((key) => {
            this.data.delete(key);
        });
    }
}

// @ts-check


/**
 * @typedef {()=>void} Unsubscriber
 */

class SubscribeController {
    /** @type {EventEmitterExt<"change">} */
    #eventEmitter;

    /** @type {EventEmitterExt<"#has-listeners"|"#no-listeners"|"destroy">} */
    #additionalEvents;
    constructor() {
        this.#eventEmitter = new EventEmitterExt();
        this.#eventEmitter.registerEvents("change");

        this.#additionalEvents = new EventEmitterExt();
        this.#additionalEvents.registerEvents(
            "destroy",
            "#has-listeners",
            "#no-listeners"
        );
        // @ts-ignore
        this.#additionalEvents.noLimitsToEmit = true;
    }

    /**
     * Returns an array of functions that have been subscribed to the subscribeController.
     * @returns {Function[]} The functions that have been subscribed.
     */
    getSubscribers() {
        return this.#eventEmitter.getListeners("change");
    }

    /**
     * Subscribes a function to be called whenever the subscribeController schedules a task.
     * The function is called with no arguments.
     * @param {(updates: Map<string, UpdateDataRecord>)=>void} fn - The function to be called.
     * @param {{delay?:number, signal?:AbortSignal}} [options]
     * @returns {Unsubscriber} A function that unsubscribes the given function.
     */
    subscribe(fn, options) {
        /** @type {{delay?:number, signal?:AbortSignal}} */
        let _options = Object.assign({ delay: 0, signal: undefined }, options);

        /** @type {Function} */
        let _fn;

        let delay = _options.delay || 0;

        _fn = delay > 0 ? debounce(fn, delay) : fn;

        let hasListeners = this.#eventEmitter.hasListeners("change");

        let unsubscriberInner = this.#eventEmitter.on("change", _fn);

        let unsubscriber = () => {
            let hasListeners = this.#eventEmitter.hasListeners("change");
            if (!hasListeners) {
                return;
            }

            if (_options.signal instanceof AbortSignal) {
                _options.signal.removeEventListener("abort", unsubscriber);
            }

            unsubscriberInner();

            let hasListeners_2 = this.#eventEmitter.hasListeners("change");
            if (!hasListeners_2) {
                /*
                runInAction(() => {
                    this.#additionalEvents.emit("#no-listeners");
                });
                //*/
                this.#additionalEvents.emit("#no-listeners");
            }
        };

        if (_options.signal instanceof AbortSignal) {
            _options.signal.addEventListener("abort", unsubscriber);
        }

        // If there are no listeners, emit the #has-listeners event.
        if (!hasListeners) {
            /*
            runInAction(() => {
                this.#additionalEvents.emit("#has-listeners");
            });
            //*/

            this.#additionalEvents.emit("#has-listeners");
        }

        return unsubscriber;
    }

    /**
     * Removes all event listeners from the event emitter. This method is useful for
     * cleaning up all subscribers that are no longer needed.
     */
    clearAllSubscribers() {
        this.#eventEmitter.removeAllListeners("change");

        this.#additionalEvents.removeAllListeners("destroy");
        this.#additionalEvents.removeAllListeners("#has-listeners");
        this.#additionalEvents.removeAllListeners("#no-listeners");
    }

    /**
     * Removes all "change" event listeners from the event emitter. This method is useful for cleaning up
     * "change" subscribers that are no longer needed.
     */
    clearSubscribers() {
        this.#eventEmitter.removeAllListeners("change");
    }

    /**
     * Returns true if there are any subscribers, false otherwise.
     * @returns {boolean} Whether there are any subscribers.
     */
    hasSubscribers() {
        return this.#eventEmitter.hasListeners("change");
    }

    /**
     * Destroys the SubscribeController. This method is useful for cleaning up after a SubscribeController
     * that is no longer needed. It calls clearSubscribers, which removes all subscribers.
     */
    destroy() {
        this.#additionalEvents.emit("destroy");
        this.#eventEmitter.unregisterAllEvents();
        this.#additionalEvents.unregisterAllEvents();
    }

    /**
     * Subscribes a function to be called whenever a subscriber is added to the subscribeController.
     * The function is called with no arguments.
     * @param {function():void} callback - The function to be called.
     * @returns {Unsubscriber} A function that unsubscribes the given function.
     */
    onHasSubscribers(callback) {
        return this.#additionalEvents.on("#has-listeners", callback);
    }

    /**
     * Subscribes a function to be called whenever there are no longer any subscribers.
     * The function is called with no arguments.
     * @param {function():void} callback - The function to be called.
     * @returns {Unsubscriber} A function that unsubscribes the given function.
     */
    onNoSubscribers(callback) {
        return this.#additionalEvents.on("#no-listeners", callback);
    }

    /**
     * Subscribes a function to be called when the SubscribeController is destroyed.
     * The function is called with no arguments.
     * @param {Function} callback - The function to be called.
     * @returns {Unsubscriber} A function that unsubscribes the given function.
     */
    onDestroy(callback) {
        return this.#additionalEvents.on("destroy", callback);
    }
}

// @ts-check


class ModeControllerService {
    computedMode = false;

    untrackMode = false;

    throwErrorInSubscribers = true;

    #batchMode = false;
    #subscribersMode = false;
    /** @type {EventEmitterExt<"batchModeStart"|"batchModeEnd"|"beforeBatchModeEnd">} */
    batchModeEvents;

    /** @type {EventEmitterExt<"subscribersModeEnd">} */
    subscribersModeEvents;

    constructor() {
        this.batchModeEvents = new EventEmitterExt();
        this.batchModeEvents.registerEvents(
            "batchModeStart",
            "beforeBatchModeEnd",
            "batchModeEnd"
        );
        this.batchModeEvents.setListenerRunnerStrategy(1);

        this.subscribersModeEvents = new EventEmitterExt();
        this.subscribersModeEvents.noLimitsToEmit = true;
        this.subscribersModeEvents.registerEvents("subscribersModeEnd");
    }

    /**
     * Subscribes a function to be called whenever the given event is triggered.
     * @param {"batchModeStart"|"batchModeEnd"|"beforeBatchModeEnd"} event - The event to subscribe to. Currently, only "batchModeStart" and "batchModeEnd" are supported.
     * @param {function():void} callback - The function to be called.
     * @returns {()=>void} A function that unsubscribes the given function.
     */
    on(event, callback) {
        return this.batchModeEvents.on(event, callback);
    }

    /**
     * Enables or disables batch mode. When batch mode is enabled, all changes to reactive items are batched together and notifications are only sent when batch mode is disabled.
     * @type {boolean}
     */
    set batchMode(value) {
        if (this.#batchMode === value) return;

        if (value === false) this.batchModeEvents.emit("beforeBatchModeEnd");
        this.#batchMode = value;
        this.batchModeEvents.emit(value ? "batchModeStart" : "batchModeEnd");
    }

    /**
     * Retrieves the current state of batch mode.
     * @returns {boolean} The current state of batch mode, where true indicates that batch mode is enabled and false indicates that it is disabled.
     */
    get batchMode() {
        return this.#batchMode;
    }

    /**
     * Retrieves whether any subscribers are currently running.
     * @returns {boolean} True if any subscribers are currently running, false otherwise.
     */
    get subscribersMode() {
        return this.#subscribersMode;
    }

    /**
     * Sets the state to indicate that subscribers are currently running.
     */
    startSubscribersMode() {
        this.#subscribersMode = true;
    }

    /**
     * Sets the state to indicate that no subscribers are currently running.
     */
    endSubscribersMode() {
        if (!this.#subscribersMode) return;
        this.#subscribersMode = false;
        this.subscribersModeEvents.emit("subscribersModeEnd");
    }

    /**
     * Subscribes a function to be called once after all subscribers have finished running.
     * The callback function is triggered when the "subscribersModeEnd" event is emitted.
     * @param {Function} callback - The function to be called after subscribers have completed.
     */
    runAfterSubscribers(callback) {
        this.subscribersModeEvents.once("subscribersModeEnd", callback);
    }
}

const modeController = new ModeControllerService();

// @ts-check


class ChangedItemsController {
    /** @type {Set<ReactivePrimitive>} */
    items = new Set();

    /**
     * Adds an item to the set of changed items. If not in batch mode, it updates
     * the old values of the items and clears the set.
     *
     * @param {ReactivePrimitive} item - The reactive item to add.
     */
    addItem(item) {
        this.items.add(item);

        if (!modeController.batchMode) {
            this.runSubscribers();
            this.clear();
        }
    }

    /**
     * Removes all items from the set of changed items.
     */
    clear() {
        this.items.clear();
    }

    /**
     * Runs all subscribers of the items in the set of changed items. If not in batch mode, it clears the set of changed items after running the subscribers.
     * If in batch mode, it also runs the subscribers of the items that have changed since the last time this method was called.
     * All subscribers are run in the order of the items' creation IDs. If an error occurs in a subscriber, it is thrown after all subscribers have been run.
     */
    runSubscribers() {
        /** @type {Set<ReactivePrimitive>} */
        let effectedItems = new Set();

        // get atoms whose value has changed. compare values
        this.items.forEach((item) => {
            if (modeController.batchMode == true) {
                if (item.engine.checkChangesTemporary()) {
                    effectedItems.add(item);
                }
            } else {
                if (item.engine.checkChangesOldValues()) {
                    effectedItems.add(item);
                }
            }
        });

        /** @type {Set<ReactivePrimitive>} */
        let itemsToRecalc = new Set();

        // get reactive items whose dependents have subscribers
        effectedItems.forEach((item) => {
            item.engine.getDeepDependents().forEach((dep) => {
                if (dep.hasSubscribers()) {
                    itemsToRecalc.add(dep);
                }
            });
        });

        // changed items will be recalculated and added to this.items
        Array.from(itemsToRecalc)
            .sort(sortReactiveItems)
            .forEach((item) => {
                item.getValue();
            });

        itemsToRecalc.clear();
        effectedItems.clear();

        this.items.forEach((item) => {
            if (modeController.batchMode == true) {
                if (item.engine.temporaryOldValues.size > 0) {
                    if (item.engine.checkChangesTemporary()) {
                        effectedItems.add(item);
                    }
                } else {
                    effectedItems.add(item);
                }
            } else {
                if (item.engine.checkChangesOldValues()) {
                    effectedItems.add(item);
                }
            }
        });

        // create an array of reactive elements, sorted by ID (order of creation)
        let effectedItemsSorted = Array.from(effectedItems)
            .filter((item) => item.hasSubscribers())
            .sort(sortReactiveItems);

        modeController.startSubscribersMode();

        let usedSubscribers = new Set();
        let errors = [];

        for (let i = 0; i < effectedItemsSorted.length; i++) {
            let item = effectedItemsSorted[i];

            let itemSubscribers =
                item.engine.subscribeController.getSubscribers();

            for (let subscriber of itemSubscribers) {
                if (usedSubscribers.has(subscriber)) {
                    continue;
                }

                usedSubscribers.add(subscriber);
                try {
                    subscriber(item.engine.updates);
                } catch (e) {
                    let error = new Error(
                        `Error in ${item.name}: ${e.message}`,
                        { cause: item }
                    );
                    error.stack = e.stack;
                    errors.push(error);
                }
            }

            item.engine.clearUpdates();
        }

        this.items.forEach((item) => {
            item.engine.clearUpdates();
        });

        usedSubscribers.clear();
        this.items.clear();

        modeController.endSubscribersMode();

        if (modeController.throwErrorInSubscribers) {
            for (let i = 0; i < errors.length; i++) {
                let error = errors[i];
                throw error;
            }
        }
    }
}

modeController.on("beforeBatchModeEnd", () => {
    changedItemsController.runSubscribers();
    changedItemsController.clear();
});

const changedItemsController = new ChangedItemsController();

// @ts-check


/** @enum {number} */
const EngineMessages = {
    DEPENDENCY_CHANGED: 1,
    DEPENDENCY_DESTROYED: 2,
    HAS_ERROR: 3,
    DEPENDENT_DESTROYED: 4,
};

const ATOM = 1;
const COMPUTED = 2;
const COLLECTION = 3;
const REACTIVEPROPS_OBJECT = 4;

/** @typedef {(...args:any)=>boolean} CompareFunction */

class Engine {
    /**
     * The set of dependencies of the engine.
     * @type {Set<ReactivePrimitive>}
     * */
    dependencies = new Set(); // dependencies

    /**
     * The set of dependents of the engine.
     * @type {Set<ReactivePrimitive>}
     * */
    dependents = new Set(); // dependents

    /**
     * A unique identifier for the engine. It is used to determine the order in which reactive items were created.
     * @type {ItemId}
     * */
    id = idService.generateId();

    /**
     * The version of the value of the reactive item.
     * @type {number}
     */
    version = 0;

    /**
     * The reference to the reactive item.
     * @type {ReactivePrimitive}
     * */
    reactiveItem;

    /**
     * The flag that indicates whether the Engine should recalculate the value of the reactive item.
     * @type {boolean}
     * */
    shouldRecalc = false;

    /**
     * Indicates whether the Engine has been destroyed.
     * @type {boolean}
     * */
    isDestroyed = false;

    /**
     * The error state of the Engine.
     * @type {null|Error}
     * */
    error = null;

    subscribeController = new SubscribeController();

    /**
     * The type of the reactive item.
     * @type {number}
     * */
    type;

    /** @type {Map<string, UpdateDataRecord>} */
    updates = new Map();

    oldValues = new Map();

    // Holds previous values when batchMode is active
    temporaryOldValues = new Map();

    /**
     * A function that compares two values to determine if they are equal.
     * @type {CompareFunction|null}
     * */
    compareFn = null;

    /**
     * Prevents updates from being propagated when the engine is setting properties of the reactive item.
     * @type {boolean}
     * */
    muteUpdates = false;

    /**
     * Initializes an Engine instance with a given reactive item.
     * @param {ReactivePrimitive} reactiveItem - The reactive item to be managed by the engine.
     * @param {ATOM|COMPUTED|COLLECTION|REACTIVEPROPS_OBJECT} type - The type of the reactive item.
     */
    constructor(reactiveItem, type) {
        this.reactiveItem = reactiveItem;
        this.type = type;
    }

    /**
     * Adds the given dependencies to the engine. The engine will be considered as needing an update if any of the
     * dependencies have changed.
     * @param {Set<ReactivePrimitive>} dependencies - The dependencies to add.
     */
    addDependencies(dependencies) {
        let array = [];

        for (const dependency of dependencies) {
            if (!this.dependencies.has(dependency)) {
                array.push(dependency);

                dependency.engine.addDependent(this.reactiveItem);
            }
        }

        array.sort(sortReactiveItems);

        for (let i = 0; i < array.length; i++) {
            this.addDependency(array[i]);
        }
    }

    /**
     * Adds a single dependency to the engine. The engine will be considered as needing an update if the dependency changes.
     * @param {ReactivePrimitive} dependency - The dependency to add.
     */
    addDependency(dependency) {
        if (!this.dependencies.has(dependency)) {
            this.dependencies.add(dependency);
        }
    }

    /**
     * Adds a single dependent to the engine. The engine will notify the dependent whenever an update is needed.
     * @param {ReactivePrimitive} dependent - The dependent to add.
     * @returns {boolean} Whether the dependent was successfully added. If the engine is destroyed, the dependent is not added and the method returns false.
     */
    addDependent(dependent) {
        if (this.isDestroyed) return false;

        if (!this.dependents.has(dependent)) {
            this.dependents.add(dependent);
        }

        return true;
    }

    /**
     * Returns a set of all dependents of the engine, including all dependents of the dependents of the engine. This
     * method is useful for finding all atoms, computed values and collections that are dependent on a given reactive
     * item.
     * @returns {Set<ReactivePrimitive>} A set of all dependents of the engine.
     */
    getDeepDependents() {
        const dependents = new Set(this.dependents);

        for (const dependent of this.dependents) {
            for (const deepDependent of dependent.engine.dependents) {
                dependents.add(deepDependent);
            }
        }

        return dependents;
    }

    /**
     * Returns an array of all dependents of the engine, including all dependents of the dependents of the engine, sorted
     * by engine ID. This method is useful for finding all atoms, computed values and collections that are dependent on a
     * given reactive item, in a specific order.
     * @returns {Array<ReactivePrimitive>} An array of all dependents of the engine, sorted by engine ID.
     */
    getDeepDependentsArray() {
        let array = Array.from(this.getDeepDependents());
        array.sort(sortReactiveItems);
        return array;
    }

    /**
     * Notifies all dependents of the engine that a change has occurred.
     * @param {EngineMessages} message - An optional message to pass to the dependents.
     * @param { {sender: ReactivePrimitive, recipients: Set<ReactivePrimitive>} } [ctx] - An optional context to pass to the dependents.
     */
    notifyDependents(message, ctx) {
        if (ctx === undefined) {
            ctx = {
                sender: this.reactiveItem,
                recipients: new Set(),
            };
        }

        this.dependents.forEach((dependent) => {
            ctx.recipients.add(dependent);
            dependent.engine.getMessage(message, ctx);
        });
    }

    /**
     * Notifies all dependencies of the engine that a change has occurred.
     * @param {EngineMessages} message - The message to pass to the dependencies.
     * @param { {sender: ReactivePrimitive, recipients: Set<ReactivePrimitive>} } ctx - The context to pass to the dependencies.
     */
    notifyDependencies(message, ctx) {
        this.dependencies.forEach((dependent) => {
            ctx.recipients.add(dependent);
            dependent.engine.getMessage(message, ctx);
        });
    }

    /**
     * Processes a message that has been sent to the engine. If the message is {@link DEPENDENCY_CHANGED}, the engine
     * notifies all dependents of the change. If the message is {@link DEPENDENCY_DESTROYED}, the engine destroys itself. If
     * the message is {@link HAS_ERROR}, the engine forwards the error to all dependents.
     * @param {EngineMessages} message - The message to process.
     * @param { {sender: ReactivePrimitive, recipients: Set<ReactivePrimitive>} } ctx - The context to pass to the dependents.
     */
    getMessage(message, ctx) {
        if (message == EngineMessages.DEPENDENT_DESTROYED) {
            this.dependents.delete(ctx.sender);
        }

        if (message == EngineMessages.DEPENDENCY_CHANGED) {
            this.error = null;
            this.shouldRecalc = true;
            this.notifyDependents(message, ctx);
        }

        if (message == EngineMessages.DEPENDENCY_DESTROYED) {
            this.destroy(ctx);
        }

        if (message == EngineMessages.HAS_ERROR) {
            this.setError(ctx.sender.engine.error, ctx);
        }
    }

    /**
     * Sets the error state of the Engine to the given error, increments the version, and notifies dependents of the error.
     * @param {Error|null} error - The error to set.
     * @param {{sender: ReactivePrimitive, recipients: Set<ReactivePrimitive>}} [ctx] - An optional context to pass to the dependents.
     */
    setError(error, ctx) {
        if (error === null) return;

        if (ctx === undefined) {
            ctx = {
                sender: this.reactiveItem,
                recipients: new Set(),
            };
        }

        this.version++;
        this.error = error;
        this.shouldRecalc = true;
        this.notifyDependents(EngineMessages.HAS_ERROR, ctx);
    }

    /**
     * Destroys the Engine, clearing all dependencies, dependents and subscribers, and marking the Engine as destroyed.
     * This method is useful for cleaning up after an Engine that is no longer needed.
     * @param {{sender: ReactivePrimitive, recipients: Set<ReactivePrimitive>}} [ctx]
     */
    destroy(ctx) {
        if (this.isDestroyed) return;

        if (ctx === undefined) {
            ctx = {
                sender: this.reactiveItem,
                recipients: new Set(),
            };
        }

        this.error = null;
        this.notifyDependents(EngineMessages.DEPENDENCY_DESTROYED, ctx);
        this.notifyDependencies(EngineMessages.DEPENDENT_DESTROYED, ctx);
        this.isDestroyed = true;
        this.dependencies.clear();
        this.dependents.clear();
        this.subscribeController.destroy();
        this.clearUpdates();
    }

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
    addUpdate(property, verb, oldValue, value) {
        if (modeController.batchMode == true) {
            if (this.temporaryOldValues.get(property) === undefined) {
                this.temporaryOldValues.set(property, oldValue);
            }
        }

        this.oldValues.set(property, oldValue);

        if (modeController.batchMode) {
            oldValue = this.temporaryOldValues.get(property);
        }

        if (property == "") {
            this.updates.clear();
        }

        if (property == "" && this.reactiveItem.equals(oldValue, value)) {
            this.updates.delete(property);
            return;
        }

        let updateRecord = new UpdateDataRecord(
            verb,
            oldValue,
            value,
            this.reactiveItem
        );
        this.updates.set(property, updateRecord);
    }

    /**
     * Clears all updates in the engine's update log.
     */
    clearUpdates() {
        this.updates.clear();
    }

    /**
     * Checks whether there are any updates in the engine's update log.
     * @returns {boolean} True if there are updates, false otherwise.
     */
    hasUpdates() {
        return this.updates.size > 0;
    }

    /**
     * Processes a value change.
     */
    valueChangedCallback() {
        if (this.muteUpdates) return;

        this.version++;

        let ctx = {
            sender: this.reactiveItem,
            recipients: new Set(),
        };

        this.shouldRecalc = false;

        this.notifyDependents(EngineMessages.DEPENDENCY_CHANGED, ctx);

        changedItemsController.addItem(this.reactiveItem);
    }

    /**
     * Checks whether any temporary old values have changed and if so, moves these values to the oldValues map and deletes them from the temporaryOldValues map.
     * This method is called by the reactive item whenever a value change is detected and the muteUpdates flag is set to true.
     * @returns {boolean} True if any changes were detected, false otherwise.
     */
    checkChangesTemporary() {
        let item = this.reactiveItem;

        let keys = Array.from(this.temporaryOldValues.keys());

        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];

            let temporaryOldValue = this.temporaryOldValues.get(key);
            let actualValue =
                key == "" ? item.getValue() : item.getValue()[key];

            if (!item.equals(temporaryOldValue, actualValue)) {
                this.oldValues.set(key, this.temporaryOldValues.get(key));
                this.temporaryOldValues.delete(key);
                return true;
            }
        }

        return false;
    }

    /**
     * Checks whether any old values have changed by comparing them with the current values.
     * If a change is detected, returns true; otherwise, returns false.
     * This method iterates over the keys of the oldValues map and checks if the
     * corresponding current value differs from the stored old value.
     *
     * @returns {boolean} True if any old values have changed, false otherwise.
     */
    checkChangesOldValues() {
        return this.hasUpdates();
    }

    /**
     * Prepares the engine to set a new value for the reactive item by
     * checking that the reactive item has not been destroyed and that
     * there are no subscribers currently running. If either of these
     * conditions are true, an error is thrown.
     */
    prepareSetValue() {
        if (this.isDestroyed) {
            throw new Error("The reactive item has been destroyed");
        }

        if (modeController.subscribersMode) {
            throw new Error("Cannot set value while subscribers are running");
        }
    }
}

// @ts-check


class Tracker {
    #isTurnedOn = false;
    /** @type {Set<ReactivePrimitive>} */
    #store = new Set();

    /** @type {Object} */
    ctx = {};

    /**
     * Returns the current contents of the tracker's store, which is a set of all reactive items that have been
     * accessed since the tracker was last turned on. This is useful for debugging and testing purposes.
     * @returns {Set<ReactivePrimitive>} The current contents of the tracker's store.
     */
    get data() {
        return new Set([...this.#store]);
        //return this.#store;
    }

    /**
     * Returns a sorted array of all reactive items in the tracker's store. The items are sorted by their internal id,
     * ensuring consistent processing order when notified of changes.
     * @returns {Array<ReactivePrimitive>} A sorted array of reactive items.
     */
    getAsSortedArray() {
        return Array.from(this.#store).sort(sortReactiveItems);
    }

    /**
     * Adds a reactive item to the tracker's store if the tracker is turned on. If the tracker is not turned on, this
     * method does nothing.
     * @param {ReactivePrimitive} item - The reactive item to add to the tracker's store.
     * @param {string} [key=""]
     */
    add(item, key = "") {
        if (modeController.untrackMode) return;

        if (this.#isTurnedOn) {
            this.#store.add(item);
        }
    }

    /**
     * Returns whether the tracker is currently turned on or not.
     * @returns {boolean} true if the tracker is on, false if it is off.
     */
    isTurnedOn() {
        return this.#isTurnedOn;
    }

    /**
     * Turns the tracker on and clears its store. If the tracker is already turned on, an error is thrown.
     * @param {Object} [ctx={}] - The context to use when the tracker is turned on.
     * are tracked. If filter is a function, it is called with each reactive item as its argument, and if it returns false, the
     * reactive item is not tracked.
     */
    turnOn(ctx = {}) {
        if (this.#isTurnedOn)
            throw new Error("The tracker is already turned on");

        this.ctx = ctx;
        this.#isTurnedOn = true;
        this.#store.clear();
    }

    /**
     * Disables the tracker. When the tracker is disabled, it will not watch any set operations and will not report
     * anything to any registered listeners. The tracker is off by default.
     */
    turnOff() {
        this.#isTurnedOn = false;
    }
}

/**
 * The getValueTracker is a utility instance that monitors reactive items that are used when a computed item is created. It is used
 * to track the dependencies of a computed item, so that it can be recalculated when any of the dependencies change.
 */
const getValueTracker = new Tracker();

/**
 * Executes the specified function with the given arguments while tracking
 * all reactive items accessed during its execution. The tracked items are
 * returned as a set, representing the dependencies used by the function.
 * This is useful for identifying which reactive items a function depends on.
 *
 * @param {Function} fn - The function to execute and track for reactive item usage.
 * @param {...any} args - The arguments to pass to the function.
 * @returns {Set<ReactivePrimitive>} A set of reactive items accessed during the function execution.
 */
function getSetOfUsedReactiveItems(fn, ...args) {
    getValueTracker.turnOn();
    fn(...args);
    getValueTracker.turnOff();
    return getValueTracker.data;
}

// @ts-check


/**
 * ReactivePrimitive is the base class for all reactive items. It provides methods for subscribing to changes,
 * getting the current value, and checking for errors.
 * @private
 */
class ReactivePrimitive {
    /** @type {Engine} */
    engine;

    name = "";

    /**
     * Subscribes a function to be called whenever the value of this reactive item changes.
     * @param {(updates: Map<string, UpdateDataRecord>)=>void} fn - The function to be called whenever the value of this reactive item changes.
     * @param {Object} [options] - Optional options.
     * @param {number} [options.delay] - The delay in milliseconds before the function is called.
     * @param {AbortSignal} [options.signal] - The signal to abort the subscription.
     */
    subscribe(fn, options) {
        return this.engine.subscribeController.subscribe(fn, options);
    }

    /**
     * Removes all "change" subscribers. Listeners for "#has-subscribers" and "#no-subscribers" are not removed.
     */
    clearSubscribers() {
        return this.engine.subscribeController.clearSubscribers();
    }

    /**
     * Removes all subscribers, including listeners for "#has-subscribers" and "#no-subscribers" events.
     */
    clearAllSubscribers() {
        return this.engine.subscribeController.clearAllSubscribers();
    }

    /**
     * Returns true if there are any subscribers, false otherwise.
     * @returns {boolean} Whether there are any subscribers.
     */
    hasSubscribers() {
        return this.engine.subscribeController.hasSubscribers();
    }

    /**
     * Retrieves the current value of the reactive item.
     * @param {Object} [options] - Optional options.
     * @param {boolean} [options.untracked=false] - If `true`, the value will not be added to the getValueTracker.
     * @returns {any} The current value of the reactive item.
     */
    getValue(options) {
        if (this.engine === undefined) {
            throw new Error("Not implemented");
        }

        if (this.engine.isDestroyed) {
            throw new Error("The reactive item has been destroyed");
        }

        let _options = Object.assign({ untracked: false }, options);

        if (_options.untracked == false) {
            getValueTracker.add(this);
        }
    }

    /**
     * Returns the last error that occurred while calculating the value of the reactive item,
     * or null if there is no error.
     * @returns {Error|null} The last error that occurred, or null if there is no error.
     */
    getLastError() {
        return this.engine.error;
    }

    /**
     * Returns true if there has been an error while calculating the value of the reactive item,
     * false otherwise. This method returns true if the reactive item has been destroyed, if the
     * reactive item has an error, or if the calculation of the value of the reactive item has
     * thrown an error.
     * @returns {boolean} Whether there has been an error while calculating the value of the
     * reactive item.
     */
    hasError() {
        try {
            this.getValue();
        } catch (error) {
            this.engine.error = error;
        }

        return this.engine.error != null;
    }

    /**
     * Subscribes a function to be called whenever a subscriber is added to the reactive item.
     * The function is called with no arguments.
     * @param {function():void} fn - The function to be called.
     * @returns {()=>void} A function that unsubscribes the given function.
     */
    onHasSubscribers(fn) {
        return this.engine.subscribeController.onHasSubscribers(fn);
    }

    /**
     * Subscribes a function to be called whenever there are no longer any subscribers.
     * The function is called with no arguments.
     * @param {function():void} fn - The function to be called.
     * @returns {()=>void} A function that unsubscribes the given function.
     */
    onNoSubscribers(fn) {
        return this.engine.subscribeController.onNoSubscribers(fn);
    }

    /**
     * Subscribes a function to be called when the reactive item is destroyed.
     * The function is called with no arguments.
     * @param {(reactiveItem:ReactivePrimitive)=>void} fn - The function to be called.
     * @returns {()=>void} A function that unsubscribes the given function.
     */
    onDestroy(fn) {
        let that = this;
        const callback = () => {
            fn(that);
        };

        let unsubscriber = this.engine.subscribeController.onDestroy(callback);
        return unsubscriber;
    }

    /**
     * Destroys the reactive item. This method is useful for cleaning up after a reactive item
     * that is no longer needed. It calls destroy on the engine of the reactive item, which
     * removes all dependencies, dependents and subscribers, and marks the engine as destroyed.
     */
    destroy() {
        this.engine.destroy();
    }

    /**
     * Checks if two values are equal. If the compareFn property is a function, it is used to compare the two values.
     * If the compareFn property is not a function, the values are compared using the === operator.
     * If the optional second argument is not provided, the value of the reactive item is used.
     * @param {any} a - The first value to compare.
     * @param {any} [b] - The second value to compare. If not provided, the value of the reactive item is used.
     * @returns {boolean} True if the two values are equal, false otherwise.
     */
    equals(a, b) {
        if (b === undefined) b = this.getValue();

        if (this.engine.compareFn) {
            return this.engine.compareFn(a, b);
        }

        return compareAny(a, b);
    }

    /**
     * @returns {boolean} True if the reactive item has been destroyed, false otherwise.
     */
    get isDestroyed() {
        return this.engine.isDestroyed;
    }
}

// @ts-check


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
class Atom extends ReactivePrimitive {
    /** @type {T} */
    #currentValue;

    options = {
        name: "",
        compareFunction: null,
    };

    /**
     * Initializes an Atom instance with a given value.
     * @param {T} value - The initial value of the Atom.
     * @param {Object} [options] - Options.
     * @param {string} [options.name] - The name of the Atom.
     * @param {(a:T, b:T)=>boolean} [options.compareFunction] - A function that compares two values for equality.
     */
    constructor(value, options) {
        super();

        if (value instanceof ReactivePrimitive) {
            throw new Error(
                `Atom${
                    this.name ? ` (${this.name})` : ""
                }: value must not be a reactive item`
            );
        }

        this.options = Object.assign({}, this.options, options);

        if (this.options.name) this.name = this.options.name;

        this.#currentValue = value;

        this.engine = new Engine(this, ATOM);
        if (this.options.compareFunction)
            this.engine.compareFn = this.options.compareFunction;

        //this.engine.addUpdate("", "set", undefined, this.#currentValue);
        this.engine.oldValues.set("", undefined);
    }

    /**
     * Sets the value of the Atom. If the new value is the same as the current value, no action is taken.
     * Updates the current value to the new value if they are different.
     * @param {T} value - The new value to set for the Atom.
     */
    set value(value) {
        if (value instanceof ReactivePrimitive) {
            throw new Error(
                `Atom${
                    this.name ? ` (${this.name})` : ""
                }: value must not be a reactive item`
            );
        }

        /** @type {Engine} */
        let engine = this.engine;

        engine.prepareSetValue();

        if (this.equals(value, this.#currentValue)) {
            return;
        }

        let oldValue = this.#currentValue;
        this.#currentValue = clone(value);

        let newValue = this.#currentValue;
        engine.addUpdate("", "set", oldValue, newValue);
        engine.valueChangedCallback();
    }

    /**
     * Retrieves the current value of the Atom. If the engine is destroyed, an error is thrown.
     * Tracks the Atom for dependency management.
     * @param {{untracked?: boolean}} [options] - Optional options. If `untracked` is `false`, the Atom value will be added to the getValueTracker.
     * @returns {T} The current value of the Atom.
     */
    getValue(options) {
        super.getValue(options);
        return this.#currentValue;
    }

    /**
     * Returns the current value of the Atom. If the engine is destroyed, an error is thrown.
     * @returns {T} The current value of the Atom.
     */
    get value() {
        return this.getValue();
    }

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
    get valueUntracked() {
        return this.getValue({ untracked: true });
    }
}

// @ts-check


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
class Computed extends ReactivePrimitive {
    /** @type {T} */
    #currentValue;

    /** @type {function():T} */
    #fn;

    /** @type {string} */
    #cachedDependentsVersionString = "";

    options = {
        name: "",
        isHardFunction: false,
        compareFunction: null,
    };

    /**
     * Initializes an Atom instance with a given value.
     * @param {function():T} fn - function that returns the value of the Computed
     * @param {Object} [options] - Options
     * @param {string} [options.name] - The name of the Computed instance.
     * @param {(a:T, b:T)=>boolean} [options.compareFunction] - A function that compares two values for equality.
     * @param {boolean} [options.isHardFunction] - Indicates whether the computed is a hard function. If true, it prevents calling the function by comparing the string representation of the dependencies.
     */
    constructor(fn, options) {
        super();

        this.options = Object.assign({}, this.options, options);

        if (this.options.name) this.name = this.options.name;

        this.engine = new Engine(this, COMPUTED);
        if (this.options.compareFunction)
            this.engine.compareFn = this.options.compareFunction;

        this.#fn = fn;

        getValueTracker.turnOn();
        modeController.computedMode = true;
        try {
            let value = fn();

            if (value instanceof ReactivePrimitive) {
                throw new Error(
                    `Computed${
                        this.name ? ` (${this.name})` : ""
                    }: Return value must not be a reactive item`
                );
            }

            this.#currentValue = value;
            this.engine.oldValues.set("", this.#currentValue);
        } catch (error) {
            this.engine.error = error;
        }

        modeController.computedMode = false;
        getValueTracker.turnOff();

        if (this.engine.error) {
            throw this.engine.error;
        }

        if (getValueTracker.data.size == 0) {
            throw new Error(
                `Computed${this.name ? ` (${this.name})` : ""}: No dependencies`
            );
        }

        this.engine.addDependencies(getValueTracker.data);

        if (this.options.isHardFunction) {
            this.#cachedDependentsVersionString =
                this.#getDependentsVersionString();
        }
    }

    /**
     * Returns a string representation of the dependencies of the Computed value.
     * @returns {string}
     */
    #getDependentsVersionString() {
        /** @type {string[]} */
        let result = [];
        /** @type {Engine} */
        let engine = this.engine;

        engine.dependencies.forEach((dependency) => {
            if (dependency.engine.shouldRecalc) {
                dependency.getValue();
            }

            result.push(
                dependency.engine.id.toString() +
                    ":" +
                    dependency.engine.version
            );
        });

        return result.join(";");
    }

    /**
     * Checks whether the Computed value needs to be recalculated. A recalculation is needed if the engine's shouldRecalc
     * property is true, if the engine has an error, or if the version string of the dependencies has changed.
     * @returns {boolean} true if the Computed value needs to be recalculated, false if it does not.
     */
    isStale() {
        /** @type {Engine} */
        let engine = this.engine;

        if (engine.error != null) return true;

        if (engine.shouldRecalc) return true;

        return false;
    }

    #areDependenciesStale() {
        /** @type {Engine} */
        let engine = this.engine;

        let dependentsVersionString = this.#getDependentsVersionString();
        if (dependentsVersionString != this.#cachedDependentsVersionString) {
            this.#cachedDependentsVersionString = dependentsVersionString;
            engine.shouldRecalc = true;

            return true;
        }

        return false;
    }

    /**
     * @param {{untracked?: boolean}} [options] - Optional options. If `untracked` is `false`, the Computed value will be added to the getValueTracker.
     * @returns {T} The current value of the Computed value.
     */
    getValue(options) {
        super.getValue(options);

        /** @type {Engine} */
        let engine = this.engine;

        if (modeController.computedMode) {
            if (this.isStale()) {
                throw new Error(
                    `Computed${
                        this.name ? ` (${this.name})` : ""
                    }: Dependencies cannot be stale`,
                    { cause: this }
                );
            }
        }

        if (!this.isStale()) {
            engine.shouldRecalc = false;
            return this.#currentValue;
        }

        if (this.options.isHardFunction) {
            if (!this.#areDependenciesStale()) {
                engine.shouldRecalc = false;
                return this.#currentValue;
            }
        }

        return this.#calc();
    }

    /**
     * Returns the current value of the Computed value.
     * @returns {T} The current value of the Computed value.
     */
    get value() {
        return this.getValue();
    }

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
    get valueUntracked() {
        return this.getValue({ untracked: true });
    }

    #calc() {
        /** @type {Engine} */
        let engine = this.engine;

        engine.shouldRecalc = false;
        engine.error = null;

        let value;

        //console.log("calc", this.name);
        try {
            value = this.#fn();
        } catch (e) {
            engine.setError(
                new Error(
                    `Computed${this.name ? ` (${this.name})` : ""}: ` +
                        e.message,
                    { cause: this }
                )
            );
            throw engine.error;
        }

        if (this.equals(this.#currentValue, value)) {
            return this.#currentValue;
        }

        let oldValue = this.#currentValue;
        this.#currentValue = clone(value);

        let newValue = this.#currentValue;
        engine.addUpdate("", "set", oldValue, newValue);

        engine.valueChangedCallback();

        return this.#currentValue;
    }
}

// @ts-check


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
class Collection extends ReactivePrimitive {
    /** @type {T[]} */
    #target;

    /** @type {T[]} */
    #proxy;

    #length = 0;

    /** @type {ProxyHandler<T[]>} */
    #handler;

    options = {
        name: "",
        compareFunction: null,
    };

    /**
     * Initializes a Collection instance with a given value.
     * @param {T[]} value - The initial value of the Collection.
     * @param {Object} [options] - Options.
     * @param {string} [options.name] - The name of the Collection.
     * @param {(a:T, b:T)=>boolean} [options.compareFunction] - A function to compare elements.
     */
    constructor(value, options) {
        super();

        this.options = Object.assign({}, this.options, options);

        if (this.options.name) this.name = this.options.name;

        this.#initHandler();

        this.#target = [];
        this.#proxy = new Proxy(this.#target, this.#handler);

        this.engine = new Engine(this, COLLECTION);

        if (this.options.compareFunction)
            this.engine.compareFn = this.options.compareFunction;

        this.#length = value.length;

        // copy array
        for (let i = 0; i < value.length; i++) {
            this.#target[i] = value[i];
        }
    }

    #initHandler = () => {
        let that = this;

        /** @type {ProxyHandler<T[]>} */
        this.#handler = {
            /**
             * Sets a property on the Collection. If the property already exists, its value is updated. If not, a new property is added.
             * @param {T[]} target - The Collection to set the property on.
             * @param {string} key - The key of the property to set.
             * @param {any} value - The value to set for the property.
             * @returns {boolean} true if the property was successfully set.
             */
            set: (target, key, value) => {
                /** @type {Engine} */
                let engine = that.engine;
                engine.prepareSetValue();

                if (target[key] === value) return true;

                if (key != "length") {
                    let oldValue = target[key];

                    //console.log("key ", key);
                    if (that.equals(oldValue, value)) return true;

                    target[key] = value;

                    if (that.#length != target.length) {
                        let newLength = target.length;
                        let oldLength = that.#length;

                        that.#length = newLength;

                        engine.addUpdate("length", "set", oldLength, newLength);
                    }

                    engine.addUpdate(key, "set", oldValue, value);
                    engine.valueChangedCallback();
                } else {
                    // if key is "length"
                    let newLength = value;
                    let oldLength = that.#length;

                    if (newLength < oldLength) {
                        //engine.updates.delete("length");

                        for (let i = newLength; i < oldLength; i++) {
                            let itemValue = that.#target[i];
                            engine.addUpdate(
                                i.toString(),
                                "delete",
                                itemValue,
                                undefined
                            );
                        }

                        that.#target.length = newLength;
                    } else if (newLength > oldLength) {
                        that.#target.length = newLength;

                        for (let i = oldLength; i < newLength; i++) {
                            engine.addUpdate(
                                i.toString(),
                                "set",
                                that.#target[i],
                                undefined
                            );
                        }
                    }

                    that.#length = newLength;
                    engine.addUpdate("length", "set", oldLength, newLength);

                    engine.valueChangedCallback();
                }

                return true;
            },

            /**
             * Gets a property from the Collection. If the property is not found, undefined is returned.
             * @param {T[]} target - The Collection to get the property from.
             * @param {string} key - The key of the property to get.
             * @returns {any} The value of the property, or undefined if it was not found.
             */
            get: (target, key) => {
                that.getValue();

                if (typeof target[key] == "function") return target[key];

                return target[key];
            },

            /**
             * Deletes a property from the Collection. If the property is not found, an error is thrown.
             * @param {T[]} target - The Collection to delete the property from.
             * @param {string} key - The key of the property to delete.
             * @returns {boolean} true if the property was deleted, false if it was not.
             */
            deleteProperty: (target, key) => {
                if (modeController.subscribersMode) {
                    throw new Error(
                        `Collection${
                            this.name ? ` (${this.name})` : ""
                        }: Cannot delete property while subscribers are running`
                    );
                }

                /** @type {Engine} */
                let engine = that.engine;

                engine.addUpdate(key, "delete", target[key], undefined);
                delete target[key];

                engine.valueChangedCallback();

                return true;
            },
        };
    };

    /**
     * Sets the value of the Collection. If the new value is the same as the current value, no action is taken.
     * Updates the current value to the new value if they are different.
     * @param {T[]} value - The new value to set for the Collection.
     */
    set value(value) {
        if (!Array.isArray(value)) {
            throw new Error(
                `Collection${
                    this.name ? ` (${this.name})` : ""
                }: Value must be an array`
            );
        }

        let engine = /** @type {Engine} */ this.engine;

        engine.prepareSetValue();

        if (value === this.getValue()) {
            return;
        }

        engine.muteUpdates = true;

        this.#proxy.length = value.length;

        for (let i = 0; i < value.length; i++) {
            this.#proxy[i] = value[i];
        }

        engine.muteUpdates = false;

        this.#target = value;

        engine.valueChangedCallback();
    }

    /**
     * Retrieves the proxied value of the Collection. If the engine is destroyed, an error is thrown.
     * Tracks the Collection for dependency management.
     * @param {{untracked?: boolean}} [options] - Optional options. If `untracked` is `false`, the Collection value will be added to the getValueTracker.
     * @returns {T[]} The proxied value of the Collection.
     */
    getValue(options) {
        super.getValue(options);
        return this.#proxy;
    }

    /**
     * Retrieves the proxied value of the Collection. If the engine is destroyed, an error is thrown.
     * Tracks the Collection for dependency management.
     * @returns {T[]} The proxied value of the Collection.
     */
    get value() {
        return this.getValue();
    }

    /**
     * Sets the value of the Collection. This is a synonym for `set value(value)`.
     * @param {T[]} value - The new value to set for the Collection.
     */
    set data(value) {
        this.value = value;
    }

    /**
     * Retrieves the proxied value of the Collection. If the engine is destroyed, an error is thrown.
     * Tracks the Collection for dependency management.
     * @returns {T[]} The proxied value of the Collection.
     */
    get data() {
        return this.getValue();
    }

    /**
     * Returns the raw, unproxied value of the Collection. This is generally not recommended as it breaks reactivity.
     * @returns {T[]} The raw, unproxied value of the Collection.
     */
    getRawValue() {
        return this.#target;
    }
}

// @ts-check


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
class ReactiveProps extends ReactivePrimitive {
    /** @type {T} */
    #target;

    /** @type {T} */
    #proxy;

    /** @type {ProxyHandler<T>} */
    #handler;

    options = {
        name: "",
        compareFunction: null,
    };

    /**
     * Initializes a ReactiveProps instance with a given value.
     * @param {T} value - The initial value of the ReactiveProps.
     * @param {Object} [options] - Options.
     * @param {string} [options.name] - The name of the ReactiveProps.
     */
    constructor(value, options) {
        super();

        if (!isPlainObject(value)) {
            throw new Error(
                `ReactiveProps${
                    this.name ? ` (${this.name})` : ""
                }: value must be an object`
            );
        }

        this.options = Object.assign({}, this.options, options);

        if (this.options.name) this.name = this.options.name;

        this.#initHandler();

        this.#target = value;

        this.#proxy = new Proxy(this.#target, this.#handler);

        this.engine = new Engine(this, REACTIVEPROPS_OBJECT);
    }

    #initHandler() {
        let that = this;

        /** @type {ProxyHandler<T>} */
        this.#handler = {
            /**
             * Sets a property on the ReactiveProps. If the property already exists, its value is updated. If not, a new property is added.
             * @param {T} target - The ReactiveProps to set the property on.
             * @param {string} key - The key of the property to set.
             * @param {any} value - The value to set for the property.
             * @param {Proxy} receiver - The proxy or object that initiated the operation.
             * @returns {boolean} true if the property was successfully set.
             */
            set: (target, key, value, receiver) => {
                /** @type {Engine} */
                let engine = that.engine;
                engine.prepareSetValue();

                let oldValue = target[key];

                if (that.equals(oldValue, value)) return true;

                // @ts-expect-error
                target[key] = value;

                engine.addUpdate(key, "set", oldValue, value);
                engine.valueChangedCallback();

                return true;
            },

            /**
             * Gets a property from the ReactiveProps. If the property is not found, undefined is returned.
             * @param {T} target - The ReactiveProps to get the property from.
             * @param {string} key - The key of the property to get.
             * @returns {any} The value of the property, or undefined if it was not found.
             */
            get: (target, key) => {
                that.getValue();
                return target[key];
            },

            /**
             * Deletes a property from the ReactiveProps. If the property is not found, an error is thrown.
             * @param {T} target - The ReactiveProps to delete the property from.
             * @param {string} key - The key of the property to delete.
             * @returns {boolean} true if the property was deleted, false if it was not.
             */
            deleteProperty: (target, key) => {
                if (modeController.subscribersMode) {
                    throw new Error(
                        `ReactiveProps${
                            this.name ? ` (${this.name})` : ""
                        }: Cannot delete property while subscribers are running`
                    );
                }

                /** @type {Engine} */
                let engine = that.engine;

                engine.addUpdate(key, "delete", target[key], undefined);
                delete target[key];

                engine.valueChangedCallback();

                return true;
            },
        };
    }

    /**
     * Retrieves the proxied value of the ReactiveProps. If the engine is destroyed, an error is thrown.
     * Tracks the ReactiveProps for dependency management.
     * @param {{untracked?: boolean}} [options] - Optional options. If `untracked` is `false`, the ReactiveProps value will be added to the getValueTracker.
     * @returns {T} The proxied value of the ReactiveProps.
     */
    getValue(options) {
        super.getValue(options);
        return this.#proxy;
    }

    /**
     * Sets the value of the ReactiveProps. If the value is an object, it will be proxied and reactive.
     * @param {T} value - The new value of the ReactiveProps.
     */
    setValue(value) {
        this.getValue({ untracked: true });

        this.engine.muteUpdates = true;
        let currentKeys = Object.keys(this.#proxy);
        let newKeys = Object.keys(value);
        let keysToDelete = currentKeys.filter((key) => !newKeys.includes(key));
        keysToDelete.forEach((key) => delete this.#proxy[key]);

        for (let i = 0; i < newKeys.length; i++) {
            let key = newKeys[i];

            // @ts-expect-error
            this.#proxy[key] = value[key];
        }

        this.engine.muteUpdates = false;
        this.engine.valueChangedCallback();
    }

    /**
     * Sets the value of the ReactiveProps. If the value is an object, it will be proxied and reactive.
     * @param {T} value - The new value of the ReactiveProps.
     */
    set value(value) {
        this.setValue(value);
    }

    /**
     * Sets the value of the ReactiveProps. If the value is an object, it will be proxied and reactive.
     * This is a synonym for `set value(value)`.
     * @param {T} value - The new value of the ReactiveProps.
     */
    set data(value) {
        this.setValue(value);
    }

    /**
     * Retrieves the proxied value of the ReactiveProps. If the engine is destroyed, an error is thrown.
     * Tracks the ReactiveProps for dependency management.
     * @returns {T} The proxied value of the ReactiveProps.
     */
    get value() {
        return this.getValue();
    }

    /**
     * Retrieves the proxied value of the ReactiveProps. If the engine is destroyed, an error is thrown.
     * Tracks the ReactiveProps for dependency management.
     * @returns {T} The proxied value of the ReactiveProps.
     */
    get data() {
        return this.getValue();
    }

    /**
     * Returns the raw, unproxied value of the ReactiveProps. This is generally not recommended as it breaks reactivity.
     * @returns {T} The raw, unproxied value of the ReactiveProps.
     */
    getRawValue() {
        return this.#target;
    }
}

// @ts-check


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

// @ts-check


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
class ReactiveList {
    /** @type {Atom<number>} */
    #lengthAtom;

    /** @type {Store} */
    #store;

    constructor() {
        this.#store = new Store();
        this.#store.muteUpdates();

        this.#lengthAtom = new Atom(0, {
            name: "length",
        });
        this.#store.addItems({ length: this.#lengthAtom });
        this.#store.unmuteUpdates();
    }

    /**
     * Adds the given values to the reactive list as ReactiveProps items.
     * Updates the internal store and the length atom accordingly.
     * @param {...T} values - The values to add to the list.
     */
    add(...values) {
        if (this.isDestroyed) {
            throw new Error("The reactive list has been destroyed");
        }

        // Check if the values are empty
        if (values.length === 0) return;

        let startIndex = this.#lengthAtom.value;
        /** @type {{[key:string]:ReactiveProps}} */
        let reactives = {};

        let alreadyMuted = this.#store.isMuted();
        this.#store.muteUpdates();

        for (let i = 0; i < values.length; i++) {
            values[i];
            reactives[startIndex + i] = new ReactiveProps(
                {},
                { name: (startIndex + i).toString() }
            );
        }

        this.#store.addItems(reactives);
        let that = this;

        that.#lengthAtom.value = that.#lengthAtom.value + values.length;
        for (let i = 0; i < values.length; i++) {
            reactives[startIndex + i].value = values[i];
        }

        if (!alreadyMuted) {
            that.#store.unmuteUpdates();
        }
    }

    /**
     * Retrieves the value of the ReactiveProps item at the specified index.
     * @param {number} index - The index of the item to retrieve from the reactive list.
     * @returns {T|undefined} The value of the item at the specified index, or undefined if no item exists at that index.
     */
    getItem(index) {
        if (this.isDestroyed) {
            throw new Error("The reactive list has been destroyed");
        }

        let item = /** @type {ReactiveProps|null} */ (
            this.#store.getItem(index.toString())
        );

        if (item) {
            return item.value;
        }

        return undefined;
    }

    /**
     * Retrieves all items from the reactive list as an array of values.
     * The order of the items in the array matches the order of the items in the reactive list.
     * If the reactive list has been destroyed, an empty array is returned.
     * @returns {T[]} An array of values from the reactive list.
     */
    getItems() {
        if (this.isDestroyed) {
            throw new Error("The reactive list has been destroyed");
        }

        let items = [];
        for (let i = 0; i < this.#lengthAtom.value; i++) {
            let item = /** @type {ReactiveProps|null} */ (
                this.#store.getItem(i.toString())
            );
            if (item) {
                items.push(item.value);
            }
        }
        return items;
    }

    /**
     * Sets the value of the ReactiveProps item at the specified index.
     * If the item exists at the given index, its value is updated.
     * @param {number} index - The index of the item to update in the reactive list.
     * @param {T} value - The new value to set for the item at the specified index.
     */
    setItem(index, value) {
        if (this.isDestroyed) {
            throw new Error("The reactive list has been destroyed");
        }

        let alreadyMuted = this.#store.isMuted();
        this.#store.muteUpdates();
        let item = /** @type {ReactiveProps|null} */ (
            this.#store.getItem(index.toString())
        );

        if (item) {
            item.value = value;
        }

        if (!alreadyMuted) {
            this.#store.unmuteUpdates();
        }
    }

    /**
     * Retrieves the length of the reactive list.
     * @returns {number} The length of the reactive list.
     */
    get length() {
        if (this.isDestroyed) {
            return 0;
        }

        return this.#lengthAtom.value;
    }

    /**
     * Sets multiple items in the reactive list, updating existing items or adding new ones as necessary.
     * If the new number of items is less than the current length of the list, the excess items are destroyed.
     * Operates within a batch to optimize performance and prevent unnecessary reactivity triggers.
     *
     * @param {T[]} values - The new values to set in the reactive list.
     */
    setItems(values) {
        if (this.isDestroyed) {
            throw new Error("The reactive list has been destroyed");
        }

        if (values.length === 0) {
            this.clear();
            return;
        }

        let isAlreadyMuted = this.#store.isMuted();
        this.#store.muteUpdates();

        if (values.length < this.#lengthAtom.value) {
            for (let i = values.length; i < this.#lengthAtom.value; i++) {
                this.#store.destroyItem(i.toString());
            }

            this.#lengthAtom.value = values.length;

            for (let i = 0; i < values.length; i++) {
                let item = /** @type {ReactiveProps} */ (
                    this.#store.getItem(i.toString())
                );
                item.value = values[i];
            }
        } else {
            // If the new number of items is greater than the current length,
            // we need to add new items to the list.

            let currentLength = this.#lengthAtom.value;

            // Update existing items
            for (let i = 0; i < currentLength; i++) {
                let item = /** @type {ReactiveProps} */ (
                    this.#store.getItem(i.toString())
                );
                item.value = values[i];
            }

            /** @type {{[key:string]:ReactiveProps}} */
            let reactives = {};

            for (let i = currentLength; i < values.length; i++) {
                reactives[i] = new ReactiveProps({}, { name: i.toString() });
            }

            this.#store.addItems(reactives);

            for (let i = currentLength; i < values.length; i++) {
                reactives[i].value = values[i];
            }

            this.#lengthAtom.value = values.length;
        }

        if (!isAlreadyMuted) {
            this.#store.unmuteUpdates();
        }
    }

    /**
     * Cleans up the reactive list by destroying all items in the internal store.
     * This method is useful when the reactive list is no longer needed and resources should be freed.
     */
    destroy() {
        this.#store.destroy();
    }

    /**
     * Returns true if the reactive list has been destroyed, and false otherwise.
     * This property is useful for determining whether it is safe to interact with the reactive list.
     * A destroyed reactive list will not respond to any methods or properties except for this one.
     * @type {boolean}
     */
    get isDestroyed() {
        return this.#store.isDestroyed;
    }

    /**
     * Subscribes a function to be called whenever the value of this reactive list changes.
     * The function is called with a Map of updates, where the keys are the names of the items that changed, and the values are UpdateDataRecord objects.
     * @param {(update: Map<string, UpdateDataRecord>)=>void} fn - The function to be called whenever the value of this reactive list changes.
     * @returns {()=>void} A function that unsubscribes the given function.
     */
    subscribe(fn) {
        if (this.isDestroyed) {
            throw new Error("The reactive list has been destroyed");
        }

        return this.#store.subscribe(fn);
    }

    /**
     * Removes a specified number of items from the reactive list, starting at a given index.
     * The function operates within a batch to optimize performance and prevent unnecessary reactivity triggers.
     *
     * @param {number} startIndex - The index at which to start removing items from the list.
     * @param {number} count - The number of items to remove from the list.
     */
    splice(startIndex, count) {
        if (this.isDestroyed) {
            throw new Error("The reactive list has been destroyed");
        }

        if (count <= 0) {
            return;
        }

        let listLength = this.#lengthAtom.value;

        if (startIndex < 0 || startIndex >= listLength) {
            return;
        }

        count =
            startIndex + count > listLength ? listLength - startIndex : count;

        let alreadyMuted = this.#store.isMuted();
        this.#store.muteUpdates();

        for (let i = startIndex; i < listLength; i++) {
            let currentItem = /** @type {ReactiveProps} */ (
                this.#store.getItem(i.toString())
            );

            let itemWithValue = /** @type {ReactiveProps} */ (
                this.#store.getItem((i + count).toString())
            );

            if (itemWithValue) {
                currentItem.value = itemWithValue.value;
            }
        }

        // Destroy the items that are no longer needed
        // and update the length atom.
        for (let i = listLength - count; i < listLength; i++) {
            this.#store.destroyItem(i.toString());
        }

        this.#lengthAtom.value = listLength - count;

        if (!alreadyMuted) {
            this.#store.unmuteUpdates();
        }
    }

    /**
     * Removes the item at the given index from the reactive list.
     * @param {number} index - The index of the item to remove.
     */
    removeItem(index) {
        this.splice(index, 1);
    }

    /**
     * Removes the last item from the reactive list.
     */
    removeLastItem() {
        this.splice(this.#lengthAtom.value - 1, 1);
    }

    /**
     * Removes the first item from the reactive list.
     */
    removeFirstItem() {
        this.splice(0, 1);
    }

    /**
     * Clears all items from the reactive list.
     * This method removes all items from the list using the splice operation,
     * effectively resetting the list to an empty state.
     */
    clear() {
        this.splice(0, this.#lengthAtom.value);
    }
}

// @ts-check


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
function autorun(fn, options) {
    let _options = Object.assign(
        {
            name: undefined,
            delay: 0,
            signal: undefined,
            onError: undefined,
            type: "autorun",
        },
        options
    );

    if (modeController.untrackMode) {
        throw new Error(
            `Autorun${
                _options.name ? ` (${_options.name})` : ""
            }: cannot initialize when untrackMode is on.`
        );
    }

    return reaction(fn, fn, _options);
}

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
function reaction(dataFunction, fn, options) {
    let _options = Object.assign(
        { name: undefined, delay: 0, signal: undefined, type: "reaction" },
        options
    );

    if (modeController.untrackMode) {
        throw new Error(
            `Reaction${
                _options.name ? ` (${_options.name})` : ""
            }: cannot initialize when untrackMode is on.`
        );
    }

    if (_options.delay > 0) {
        fn = debounce(fn, _options.delay);
        _options.delay = 0;
    }

    let items;
    let unsubscribers = [];

    items = getSetOfUsedReactiveItems(dataFunction);

    if (items.size == 0) {
        throw new Error(
            `Autorun/Reaction${
                _options.name ? ` (${_options.name})` : ""
            }: No reactive items found.`
        );
    }

    for (let item of items) {
        unsubscribers.push(item.subscribe(fn, _options));
    }

    let unsubscriber = () => {
        for (let i = 0; i < unsubscribers.length; i++) {
            unsubscribers[i]();
        }
    };

    return unsubscriber;
}

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
function when(predicate, fn, options) {
    let computed = new Computed(predicate);
    let timeout = options?.timeout || 0;
    let timer;

    let mainUnsubscriber = function () {
        if (timer) {
            clearTimeout(timer);
            timer = undefined;
        }

        unsubscribe();
        computed.destroy();
    };

    let unsubscribe = computed.subscribe(() => {
        if (computed.value) {
            //mainUnsubscriber();
            fn();
        }
    }, options);

    if (timeout > 0) {
        timer = setTimeout(() => {
            mainUnsubscriber();
        }, timeout);
    }

    return mainUnsubscriber;
}

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
function waitTrue(predicate, options) {
    return new Promise((resolve) => {
        let computed = new Computed(predicate);
        let timeout = options?.timeout || 0;
        let timer;

        let mainUnsubscriber = function () {
            if (timer) {
                clearTimeout(timer);
                timer = undefined;
            }

            unsubscribe();
            computed.destroy();
        };

        let unsubscribe = computed.subscribe(() => {
            if (computed.value) {
                mainUnsubscriber();
                resolve();
            }
        });

        if (timeout > 0) {
            timer = setTimeout(() => {
                mainUnsubscriber();
            }, timeout);
        }
    });
}

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
function runInAction(fn) {
    if (modeController.subscribersMode) {
        modeController.runAfterSubscribers(fn);
    } else {
        fn();
    }
}

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
function batch(fn) {
    let batchMode = modeController.batchMode;
    modeController.batchMode = true;

    try {
        fn();
    } catch (e) {
        modeController.batchMode = batchMode;
        throw e;
    }

    modeController.batchMode = batchMode;
}

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
function untrack(fn) {
    let untrackMode = modeController.untrackMode;
    let result;
    modeController.untrackMode = true;
    try {
        result = fn();
    } catch (e) {
        modeController.untrackMode = untrackMode;
        throw e;
    }
    modeController.untrackMode = untrackMode;
    return result;
}

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
function getNow(interval = 1000) {
    let atom = new Atom(0, { name: "now" });
    let intervalId;

    atom.onHasSubscribers(() => {
        intervalId = setInterval(() => {
            runInAction(() => {
                atom.value = Date.now();
            });
        }, interval);
    });

    atom.onNoSubscribers(() => {
        clearInterval(intervalId);
        runInAction(() => {
            atom.value = 0;
        });
    });

    return atom;
}

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
function fromPromise(promise) {
    /** @type {Atom<"pending"|"resolved"|"rejected">} */
    let stateAtom = new Atom("pending", { name: "fromPromise" });
    /** @type {T} */
    let promiseResult;

    /** @type {Error} */
    let promiseError;

    /**
     * Executes the appropriate function based on the current state of the promise.
     * @param {Object} param0 - An object containing the functions to execute for each state.
     * @param {(value: T)=>void} [param0.resolved] - The function to execute when the promise is resolved.
     * @param {(error: Error)=>void} [param0.rejected] - The function to execute when the promise is rejected.
     * @param {()=>void} [param0.pending] - The function to execute when the promise is pending.
     * @returns {Promise<void>} A Promise that resolves when the appropriate function has been executed.
     */
    async function caseMethod(param0) {
        if (param0.pending) {
            try {
                param0.pending();
            } catch (e) {
                console.error(e);
            }
        }

        stateAtom.subscribe(() => {
            if (stateAtom.value === "resolved") {
                try {
                    if (param0.resolved) {
                        param0.resolved(promiseResult);
                    }
                } catch (e) {
                    console.error(e);
                }
            }

            if (stateAtom.value === "rejected") {
                try {
                    if (param0.rejected) {
                        param0.rejected(promiseError);
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        });

        return promise
            .then((value) => {
                promiseResult = value;
                stateAtom.value = "resolved";
            })
            .catch((e) => {
                promiseError = e;
                stateAtom.value = "rejected";
            })
            .finally(() => {
                stateAtom.destroy();
            });
    }

    return {
        case: caseMethod,
    };
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
function atom(value, options) {
    return new Atom(value, options);
}

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
function computed(fn, options) {
    return new Computed(fn, options);
}

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
function collection(value, options) {
    let item = new Collection(value, options);
    return item.value;
}

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
function reactiveProps(value, options) {
    // @ts-ignore
    let item = new ReactiveProps(value, options);
    return /** @type {T} */ (item.value);
}

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
function makeObservable(obj, annotations, options) {
    /** @type {{[key:string]:ReactivePrimitive}} */
    let reactiveStore = {};
    let _options = Object.assign({ name: "" }, options);

    for (let key in annotations) {
        if (annotations[key] === false) {
            continue;
        }

        if (
            /** @type {Array<string|boolean>} */ ([
                "atom",
                "collection",
                "reactiveProps",
            ]).includes(annotations[key])
        ) {
            if (annotations[key] == "atom") {
                reactiveStore[key] = new Atom(obj[key], {
                    name: _options.name + "." + key,
                });
            }

            if (annotations[key] == "collection") {
                reactiveStore[key] = new Collection(obj[key], {
                    name: _options.name + "." + key,
                });
            }

            if (annotations[key] == "reactiveProps") {
                reactiveStore[key] = new ReactiveProps(obj[key], {
                    name: _options.name + "." + key,
                });
            }

            Object.defineProperty(obj, key, {
                get() {
                    return reactiveStore[key].getValue();
                },
                set(value) {
                    // @ts-expect-error
                    reactiveStore[key].value = value;
                },
            });
        }
    }

    let allDescriptors = getAllPropertyDescriptors(obj);

    for (let key in annotations) {
        if (annotations[key] == "computed") {
            // if class or plain object
            const descriptor = allDescriptors[key];
            //Object.getOwnPropertyDescriptor(obj.prototype || obj, key) || obj[key];  //

            if (descriptor && typeof descriptor.get === "function") {
                let f = descriptor.get;
                reactiveStore[key] = new Computed(
                    function () {
                        return f.call(obj);
                    },
                    { name: _options.name + "." + key }
                );

                Object.defineProperty(obj, key, {
                    get() {
                        return reactiveStore[key].getValue();
                    },
                });
            }
        }
    }

    return obj;
}

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
function extendObservable(target, properties, overrides, options) {
    Object.assign(
        /** @type {T & R} */ (/** @type {unknown} */ (target)),
        properties
    );
    makeAutoObservable(
        target,
        overrides,
        options,
        new Set(Object.keys(properties))
    );
    return /** @type {T & R} */ (target);
}

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
function makeAutoObservable(obj, overrides = {}, options, filter) {
    let _options = Object.assign({ name: "" }, options);

    let allDescriptors = getAllPropertyDescriptors(obj);

    /** @type {Set<string>} */
    let atomKeys = new Set();

    /** @type {Set<string>} */
    let computedKeys = new Set();

    Object.entries(allDescriptors).forEach((descriptorObject) => {
        let key = descriptorObject[0];
        let descriptor = descriptorObject[1];

        if (filter !== undefined && !filter.has(key)) {
            return;
        }

        if (/^__/.test(key)) {
            return;
        }

        if (descriptor.set || descriptor.enumerable) {
            atomKeys.add(key);
        }

        if (descriptor.get) {
            computedKeys.add(key);
        }
    });

    /** @type {{[key:string]:"atom"|"computed"|"collection"|"reactiveProps"|false}} */
    let annotations = {};

    let keys = [...atomKeys];
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];

        if (overrides[key] === false) {
            continue;
        }

        if (typeof obj[key] === "function") {
            continue;
        }

        if (Array.isArray(obj[key])) {
            annotations[key] = "collection";
            continue;
        }

        if (isPlainObject(obj[key])) {
            annotations[key] = "reactiveProps";
            continue;
        }

        annotations[key] = "atom";
    }

    keys = [...computedKeys];
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];

        if (overrides[key] === false) {
            continue;
        }

        annotations[key] = "computed";
    }

    annotations = Object.assign({}, annotations, overrides);

    return makeObservable(obj, annotations, _options);
}

export { Atom, Collection, Computed, ReactiveList, ReactivePrimitive, ReactiveProps, Store, atom, autorun, batch, collection, computed, extendObservable, fromPromise, getNow, makeAutoObservable, makeObservable, reaction, reactiveProps, runInAction, untrack, waitTrue, when };
