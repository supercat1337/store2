import { EventEmitterExt } from '@supercat1337/event-emitter-ext';
import { EventEmitterLite } from '@supercat1337/event-emitter';
import { Dictionary } from '@supercat1337/dictionary';

// @ts-check

/**
 * A service that generates unique numeric identifiers for reactive items.
 * Ensures deterministic ordering based on creation time.
 */
class IdService {
    /** @type {number} */
    #counter = 0;

    /**
     * Generates a new unique numeric identifier.
     * @returns {number} A new unique number.
     */
    generateId() {
        return this.#counter++;
    }

    /**
     * Compares two numeric identifiers.
     * @param {number} a - First identifier.
     * @param {number} b - Second identifier.
     * @returns {number} Negative if a < b, positive if a > b, zero if equal.
     */
    compareIds(a, b) {
        if (a < b) {return -1;}
        if (a > b) {return 1;}
        return 0;
    }

    /**
     * Resets the counter to zero (useful for testing).
     */
    reset() {
        this.#counter = 0;
    }
}

const idService = new IdService();

// @ts-check


/**
 * Sorts reactive items by their internal id. This is used to
 * ensure that reactive items are processed in a consistent order
 * when they are notified of changes.
 * @param {ReactiveItem} a - The first item to compare
 * @param {ReactiveItem} b - The second item to compare
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
    return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
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
 * @param {object} a - The first object to compare.
 * @param {object} b - The second object to compare.
 * @returns {boolean} True if the two objects are equal, false otherwise.
 */
function comparePlainObjects(a, b) {
    if (a === b) {
        return true;
    }
    if (!isPlainObject(a) || !isPlainObject(b)) {
        return false;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) {
        return false;
    }

    for (let i = 0; i < keysA.length; i++) {
        const key = keysA[i];
        const hasProperty = Object.prototype.hasOwnProperty.call(b, key);
        if (!hasProperty) {
            return false;
        }

        // @ts-ignore
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
    if (a === b) {
        return true;
    }
    if (typeof a !== typeof b) {
        return false;
    }

    if (a === null || b === null) {
        return false;
    }
    if (a === undefined || b === undefined) {
        return false;
    }

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
    /** @type {ReturnType<typeof setTimeout>|null} */
    let timeout;
    // @ts-ignore
    const f = (...args) => {
        // @ts-ignore
        const context = this;
        const later = function () {
            timeout = null;
            func.apply(context, args);
        };
        // @ts-ignore
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
    } else if (typeof obj === 'object' && obj !== null) {
        return Object.assign({}, obj);
    } else {
        return obj;
    }
}

/**
 * Gets all property descriptors of an object, including its prototype and all its ancestors.
 * The descriptors are returned as a plain object.
 * @param {object} obj - The object to get the property descriptors from.
 * @param {number} [depth=0]
 * @param {number} [maxDepth=100]
 * @returns {{[x: string]: TypedPropertyDescriptor<any>;} & { [x: string]: PropertyDescriptor;}} A plain object with all property descriptors of the object.
 */
function getAllPropertyDescriptors(obj, depth = 0, maxDepth = 100) {
    if (!obj || depth > maxDepth) {
        return Object.create(null);
    }
    const proto = Object.getPrototypeOf(obj);
    return {
        ...getAllPropertyDescriptors(proto, depth + 1, maxDepth),
        ...Object.getOwnPropertyDescriptors(obj),
    };
}

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
function getError(e) {
    return e instanceof Error ? e : new Error(String(e));
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
        this.#eventEmitter.registerEvents('change');

        this.#additionalEvents = new EventEmitterExt();
        this.#additionalEvents.registerEvents('destroy', '#has-listeners', '#no-listeners');
        // @ts-ignore
        this.#additionalEvents.noLimitsToEmit = true;
    }

    /**
     * Returns an array of functions that have been subscribed to the subscribeController.
     * @returns {Function[]} The functions that have been subscribed.
     */
    getSubscribers() {
        return this.#eventEmitter.getListeners('change');
    }

    /**
     * Subscribes a function to be called whenever the subscribeController schedules a task.
     * The function is called with no arguments.
     * @param {(updates: Map<string, import("./UpdateDataRecord.js").UpdateDataRecord>)=>void} fn - The function to be called.
     * @param {{delay?:number, signal?:AbortSignal}} [options]
     * @returns {Unsubscriber} A function that unsubscribes the given function.
     */
    subscribe(fn, options) {
        /** @type {{delay?:number, signal?:AbortSignal}} */
        const _options = Object.assign({ delay: 0, signal: undefined }, options);

        const delay = _options.delay || 0;

        /** @type {Function} */
        const _fn = delay > 0 ? debounce(fn, delay) : fn;

        const hasListeners = this.#eventEmitter.hasListeners('change');

        const unsubscriberInner = this.#eventEmitter.on('change', _fn);

        const unsubscriber = () => {
            const hasListeners = this.#eventEmitter.hasListeners('change');
            if (!hasListeners) {
                return;
            }

            if (_options.signal instanceof AbortSignal) {
                _options.signal.removeEventListener('abort', unsubscriber);
            }

            unsubscriberInner();

            const hasListeners_2 = this.#eventEmitter.hasListeners('change');
            if (!hasListeners_2) {
                /*
                runInAction(() => {
                    this.#additionalEvents.emit("#no-listeners");
                });
                //*/
                this.#additionalEvents.emit('#no-listeners');
            }
        };

        if (_options.signal instanceof AbortSignal) {
            _options.signal.addEventListener('abort', unsubscriber);
        }

        // If there are no listeners, emit the #has-listeners event.
        if (!hasListeners) {
            /*
            runInAction(() => {
                this.#additionalEvents.emit("#has-listeners");
            });
            //*/

            this.#additionalEvents.emit('#has-listeners');
        }

        return unsubscriber;
    }

    /**
     * Removes all event listeners from the event emitter. This method is useful for
     * cleaning up all subscribers that are no longer needed.
     */
    clearAllSubscribers() {
        this.#eventEmitter.removeAllListeners('change');

        this.#additionalEvents.removeAllListeners('destroy');
        this.#additionalEvents.removeAllListeners('#has-listeners');
        this.#additionalEvents.removeAllListeners('#no-listeners');
    }

    /**
     * Removes all "change" event listeners from the event emitter. This method is useful for cleaning up
     * "change" subscribers that are no longer needed.
     */
    clearSubscribers() {
        this.#eventEmitter.removeAllListeners('change');
    }

    /**
     * Returns true if there are any subscribers, false otherwise.
     * @returns {boolean} Whether there are any subscribers.
     */
    hasSubscribers() {
        return this.#eventEmitter.hasListeners('change');
    }

    /**
     * Destroys the SubscribeController. This method is useful for cleaning up after a SubscribeController
     * that is no longer needed. It calls clearSubscribers, which removes all subscribers.
     */
    destroy() {
        this.#additionalEvents.emit('destroy');
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
        return this.#additionalEvents.on('#has-listeners', callback);
    }

    /**
     * Subscribes a function to be called whenever there are no longer any subscribers.
     * The function is called with no arguments.
     * @param {function():void} callback - The function to be called.
     * @returns {Unsubscriber} A function that unsubscribes the given function.
     */
    onNoSubscribers(callback) {
        return this.#additionalEvents.on('#no-listeners', callback);
    }

    /**
     * Subscribes a function to be called when the SubscribeController is destroyed.
     * The function is called with no arguments.
     * @param {Function} callback - The function to be called.
     * @returns {Unsubscriber} A function that unsubscribes the given function.
     */
    onDestroy(callback) {
        return this.#additionalEvents.on('destroy', callback);
    }
}

// @ts-check


class ModeControllerService {
    isComputing = false;
    untrackMode = false;
    throwErrorInSubscribers = true;

    #batchDepth = 0;
    #subscribersMode = false;

    /** @type {EventEmitterExt<"batchModeStart"|"batchModeEnd"|"beforeBatchModeEnd">} */
    batchModeEvents;

    /** @type {EventEmitterExt<"subscribersModeEnd">} */
    subscribersModeEvents;

    constructor() {
        this.batchModeEvents = new EventEmitterExt();
        this.batchModeEvents.registerEvents('batchModeStart', 'beforeBatchModeEnd', 'batchModeEnd');
        this.batchModeEvents.setListenerRunnerStrategy(1);

        this.subscribersModeEvents = new EventEmitterExt();
        this.subscribersModeEvents.noLimitsToEmit = true;
        this.subscribersModeEvents.registerEvents('subscribersModeEnd');
    }

    /**
     * Subscribes a function to be called whenever the given event is triggered.
     * @param {"batchModeStart"|"batchModeEnd"|"beforeBatchModeEnd"} event - The event to subscribe to.
     * @param {function():void} callback - The function to be called.
     * @returns {()=>void} A function that unsubscribes the given function.
     */
    on(event, callback) {
        return this.batchModeEvents.on(event, callback);
    }

    /**
     * Returns true if currently inside a batch (batch depth > 0).
     * @returns {boolean}
     */
    get batchMode() {
        return this.#batchDepth > 0;
    }

    /**
     * Enters a batch mode. Increments the batch depth.
     * Emits "batchModeStart" when entering the first batch.
     */
    enterBatch() {
        const wasInBatch = this.batchMode;
        this.#batchDepth++;
        if (!wasInBatch) {
            this.batchModeEvents.emit('batchModeStart');
        }
    }

    /**
     * Exits a batch mode. Decrements the batch depth.
     * If exiting the last batch, emits "beforeBatchModeEnd" and then "batchModeEnd".
     */
    exitBatch() {
        if (this.#batchDepth === 0) {return;}
        const isLast = this.#batchDepth === 1;
        if (isLast) {
            this.batchModeEvents.emit('beforeBatchModeEnd');
        }
        this.#batchDepth--;
        if (isLast) {
            this.batchModeEvents.emit('batchModeEnd');
        }
    }

    /**
     * Retrieves whether any subscribers are currently running.
     * @returns {boolean}
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
        if (!this.#subscribersMode) {return;}
        this.#subscribersMode = false;
        this.subscribersModeEvents.emit('subscribersModeEnd');
    }

    /**
     * Subscribes a function to be called once after all subscribers have finished running.
     * @param {Function} callback
     */
    runAfterSubscribers(callback) {
        this.subscribersModeEvents.once('subscribersModeEnd', callback);
    }
}

const modeController = new ModeControllerService();

// @ts-check


/**
 * Controller that manages changed reactive items and coordinates subscriber notifications.
 * Handles batching, dependency recalculation, and error aggregation.
 */
class ChangedItemsController {
    /** @type {Set<ReactiveItem>} */
    items = new Set();

    /**
     * Adds a reactive item to the set of changed items.
     * If not in batch mode, immediately runs subscribers and clears the set.
     * @param {ReactiveItem} item - The reactive item that changed.
     */
    addItem(item) {
        this.items.add(item);
        if (!modeController.batchMode) {
            this.runSubscribers();
            this.clear();
        }
    }

    /**
     * @param {ReactiveItem} item
     */
    removeItem(item) {
        this.items.delete(item);
    }

    /**
     * Removes all items from the changed items set.
     */
    clear() {
        this.items.clear();
    }

    /**
     * Runs all subscribers for the changed items.
     * Processes dependency trees, recalculates stale computed values,
     * and invokes subscriber callbacks with update records.
     * Handles errors and aggregates them if multiple occur.
     */
    runSubscribers() {
        /** @type {Set<ReactiveItem>} */
        const changedItemsWithUpdates = new Set();

        // get atoms whose value has changed. compare values
        this.items.forEach(item => {
            if (modeController.batchMode === true) {
                if (item.engine.checkChangesTemporary()) {
                    changedItemsWithUpdates.add(item);
                }
            } else {
                if (item.engine.hasUpdates()) {
                    changedItemsWithUpdates.add(item);
                }
            }
        });

        /** @type {Set<ReactiveItem>} */
        const itemsToRecalc = new Set();

        // get reactive items whose dependents have subscribers
        changedItemsWithUpdates.forEach(item => {
            item.engine.getDeepDependents().forEach(dep => {
                if (dep.hasSubscribers()) {
                    itemsToRecalc.add(dep);
                }
            });
        });

        // changed items will be recalculated and added to this.items
        Array.from(itemsToRecalc)
            .sort(sortReactiveItems)
            .forEach(item => {
                item.getValue();
            });

        itemsToRecalc.clear();
        changedItemsWithUpdates.clear();

        if (modeController.batchMode === true) {
            this.items.forEach(item => {
                if (item.engine.checkChangesTemporary()) {
                    changedItemsWithUpdates.add(item);
                }
            });
        } else {
            this.items.forEach(item => {
                if (item.engine.hasUpdates()) {
                    changedItemsWithUpdates.add(item);
                }
            });
        }

        // create an array of reactive elements, sorted by ID (order of creation)
        const changedItemsWithUpdatesSorted = Array.from(changedItemsWithUpdates)
            .filter(item => item.hasSubscribers())
            .sort(sortReactiveItems);

        modeController.startSubscribersMode();

        const usedSubscribers = new Set();
        const errors = [];

        for (let i = 0; i < changedItemsWithUpdatesSorted.length; i++) {
            const item = changedItemsWithUpdatesSorted[i];

            const itemSubscribers = item.engine.subscribeController.getSubscribers();

            for (const subscriber of itemSubscribers) {
                if (usedSubscribers.has(subscriber)) {
                    continue;
                }

                usedSubscribers.add(subscriber);
                try {
                    subscriber(item.engine.updates);
                } catch (e) {
                    const err = getError(e);
                    const error = new Error(`Error in ${item.name}: ${err.message}`, { cause: item });
                    error.stack = err.stack;
                    errors.push(error);
                }
            }

            item.engine.clearUpdates();
        }

        this.items.forEach(item => {
            item.engine.clearUpdates();
        });

        usedSubscribers.clear();
        this.items.clear();

        modeController.endSubscribersMode();

        if (modeController.throwErrorInSubscribers) {
            for (let i = 0; i < errors.length; i++) {
                const error = errors[i];
                throw error;
            }
        }
    }
}

// Hook into batch mode lifecycle
modeController.on('beforeBatchModeEnd', () => {
    changedItemsController.runSubscribers();
    changedItemsController.clear();
});

const changedItemsController = new ChangedItemsController();

// @ts-check

class UpdateDataRecord {
    /** @type {"set"|"delete"} */
    type;

    /** @type {any} */
    value;

    /** @type {any} */
    oldValue;

    /** @type {ReactiveItem|undefined} */
    reactiveItem;

    /**
     * Initializes an instance of UpdateDataRecord with the provided type, old value, and new value.
     * @param {"set"|"delete"} type - The action performed, either "set" or "delete".
     * @param {any} oldValue - The previous value before the update.
     * @param {any} value - The new value after the update.
     * @param {ReactiveItem} [reactiveItem] - The reactive item that triggered the update.
     */
    constructor(type, oldValue, value, reactiveItem) {
        this.type = type;
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
        const keysToDelete = [];

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
 * BatchSnapshot stores the original values of properties at the start of a batch operation.
 * It allows detecting which properties have actually changed after a series of mutations
 * inside a batch, and whether they have reverted to their original values.
 */
class BatchSnapshot {
    /**
     * Map storing original values for each property key.
     * @type {Map<string, any>}
     */
    #initialValues = new Map();

    /**
     * Reference to the reactive item this snapshot belongs to.
     * Used to access the equality comparison function.
     * @type {ReactiveItem}
     */
    #reactiveItem;

    /**
     * Creates a new BatchSnapshot instance.
     * @param {ReactiveItem} reactiveItem - The reactive item to snapshot.
     */
    constructor(reactiveItem) {
        this.#reactiveItem = reactiveItem;
    }

    /**
     * Records the original value for a property if not already recorded in this batch.
     * @param {string} property - The property key.
     * @param {any} value - The original value at the start of the batch.
     */
    record(property, value) {
        if (!this.#initialValues.has(property)) {
            this.#initialValues.set(property, value);
        }
    }

    /**
     * Returns the original value recorded for a property.
     * @param {string} property - The property key.
     * @returns {any | undefined} The original value, or undefined if not recorded.
     */
    getOriginal(property) {
        return this.#initialValues.get(property);
    }

    /**
     * Checks whether a property has been recorded in this snapshot.
     * @param {string} property - The property key.
     * @returns {boolean} True if the property was recorded.
     */
    has(property) {
        return this.#initialValues.has(property);
    }

    /**
     * Returns an array of property keys that have changed compared to their original values.
     * Uses the reactive item's equality comparison function.
     * @param {(property: string) => any} getCurrentValue - Function that returns the current value for a given property.
     * @returns {string[]} Array of property keys that actually changed.
     */
    getChangedProperties(getCurrentValue) {
        const changed = [];
        for (const [prop, original] of this.#initialValues.entries()) {
            const current = getCurrentValue(prop);
            if (!this.#reactiveItem.equals(original, current)) {
                changed.push(prop);
            }
        }
        return changed;
    }

    /**
     * Clears all recorded initial values.
     */
    clear() {
        this.#initialValues.clear();
    }

    /**
     * Returns the number of recorded properties.
     * @returns {number}
     */
    get size() {
        return this.#initialValues.size;
    }
}

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
const SHALLOW_REACTIVE = 4;

class Engine {
    /**
     * The set of dependencies of the engine.
     * @type {Set<ReactiveItem>}
     */
    dependencies = new Set();

    /**
     * The set of dependents of the engine.
     * @type {Set<ReactiveItem>}
     */
    dependents = new Set();

    /**
     * Unique identifier for ordering.
     * @type {number}
     */
    id = idService.generateId();

    /**
     * Version number (currently unused, kept for potential future use).
     * @type {number}
     */
    version = 0;

    /**
     * Reference to the reactive item.
     * @type {ReactiveItem}
     */
    reactiveItem;

    /**
     * Flag indicating that the value should be recalculated.
     * @type {boolean}
     */
    shouldRecalc = false;

    /**
     * Indicates whether the engine has been destroyed.
     * @type {boolean}
     */
    isDestroyed = false;

    /**
     * @type {null|Error}
     */
    #error = null;

    subscribeController = new SubscribeController();

    /**
     * The type of the reactive item.
     * @type {number}
     */
    type;

    /**
     * Map of pending updates (property -> UpdateDataRecord).
     * @type {Map<string, UpdateDataRecord>}
     */
    updates = new Map();

    /**
     * Snapshot of original values when inside a batch.
     * @type {BatchSnapshot|null}
     */
    #batchSnapshot = null;

    /**
     * Comparison function for equality.
     * @type {CompareFunction|null}
     */
    compareFn = null;

    /**
     * Prevents updates from being propagated (used during mass updates).
     * @type {boolean}
     */
    suppressNotifications = false;

    /**
     * Creates an Engine instance.
     * @param {ReactiveItem} reactiveItem - The reactive item.
     * @param {ATOM|COMPUTED|COLLECTION|SHALLOW_REACTIVE} type - The type.
     */
    constructor(reactiveItem, type) {
        this.reactiveItem = reactiveItem;
        this.type = type;
    }

    /** @type {Error|null} */
    get error() {
        return this.#error;
    }

    /**
     * Records a change attempt. In batch mode, stores the original value.
     * @param {string} property - The property key.
     * @param {any} oldValue - The value before the change.
     */
    #recordChange(property, oldValue) {
        if (modeController.batchMode) {
            if (!this.#batchSnapshot) {
                this.#batchSnapshot = new BatchSnapshot(this.reactiveItem);
            }
            this.#batchSnapshot.record(property, oldValue);
        }
    }

    /**
     * Determines whether a change actually affects the final value (considering batch).
     * @param {string} property - The property key.
     * @param {any} newValue - The new value.
     * @returns {boolean} True if the change is effective.
     */
    isEffectiveChange(property, newValue) {
        let effectiveOld;
        if (modeController.batchMode && this.#batchSnapshot?.has(property)) {
            effectiveOld = this.#batchSnapshot.getOriginal(property);
        } else {
            // When not in batch or property not recorded, we treat oldValue as unknown.
            // In practice, this method is called after recordChange, so oldValue is known.
            // We'll rely on the caller passing the correct oldValue, but here we need a baseline.
            // For simplicity, we assume that if no snapshot, the change is always effective?
            // Better to have the caller pass oldValue. We'll change signature.
            // But to keep compatibility with existing calls, we'll require oldValue parameter.
            throw new Error('isEffectiveChange requires oldValue when not in batch mode');
        }
        return !this.reactiveItem.equals(effectiveOld, newValue);
    }

    /**
     * Alternative version that accepts explicit oldValue (preferred).
     * @param {string} property - The property key.
     * @param {any} oldValue - The previous value (immediate before this change).
     * @param {any} newValue - The new value.
     * @returns {boolean}
     */
    isEffectiveChangeWithOld(property, oldValue, newValue) {
        if (modeController.batchMode && this.#batchSnapshot?.has(property)) {
            const original = this.#batchSnapshot.getOriginal(property);
            return !this.reactiveItem.equals(original, newValue);
        }
        return !this.reactiveItem.equals(oldValue, newValue);
    }

    /**
     * Commits a change: creates an UpdateDataRecord, adds to updates, and schedules notification.
     * @param {string} property - The property key.
     * @param {"set"|"delete"} type - The operation.
     * @param {any} oldValue - The previous value (immediate before this change).
     * @param {any} newValue - The new value.
     * @returns {boolean} True if committed (i.e., value actually changed).
     */
    #commitChange(property, type, oldValue, newValue) {
        let reportedOld = oldValue;
        let compareOld = oldValue;
        if (modeController.batchMode && this.#batchSnapshot?.has(property)) {
            const original = this.#batchSnapshot.getOriginal(property);
            reportedOld = original;
            compareOld = original;
        }

        // 1. Проверяем, произошла ли реальная мутация (изменение значения)
        const hasMutation =
            property === '' ? !this.reactiveItem.equals(oldValue, newValue) : oldValue !== newValue;

        if (!hasMutation) {
            return false;
        }

        // 2. Всегда уведомляем зависимых и добавляем элемент в changedItemsController
        //    (даже если в batch и значение позже вернётся к исходному)
        this.notifyDependents(EngineMessages.DEPENDENCY_CHANGED);
        changedItemsController.addItem(this.reactiveItem);

        // 3. Определяем, изменилось ли значение относительно стабильного (или старого вне batch)
        const isEffective =
            property === ''
                ? !this.reactiveItem.equals(compareOld, newValue)
                : compareOld !== newValue;

        if (!isEffective) {
            // Значение вернулось к исходному – удаляем запись обновления
            this.updates.delete(property);
            return false;
        }

        // 4. Создаём или обновляем запись в updates
        const record = new UpdateDataRecord(type, reportedOld, newValue, this.reactiveItem);
        this.updates.set(property, record);
        this.version++;
        return true;
    }

    /**
     * Legacy method for backward compatibility. Delegates to recordChange + #commitChange.
     * @param {string} property - The property key.
     * @param {"set"|"delete"} type - The operation.
     * @param {any} oldValue - The previous value.
     * @param {any} value - The new value.
     * @returns {boolean} True if an update was added.
     */
    addUpdate(property, type, oldValue, value) {
        this.#recordChange(property, oldValue);
        return this.#commitChange(property, type, oldValue, value);
    }

    /**
     * Adds dependencies to this engine.
     * @param {Set<ReactiveItem>} dependencies
     */
    addDependencies(dependencies) {
        const array = [];
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
     * Adds a single dependency.
     * @param {ReactiveItem} dependency
     */
    addDependency(dependency) {
        if (!this.dependencies.has(dependency)) {
            this.dependencies.add(dependency);
        }
    }

    /**
     * Adds a dependent.
     * @param {ReactiveItem} dependent
     * @returns {boolean}
     */
    addDependent(dependent) {
        if (this.isDestroyed) {
            return false;
        }
        if (!this.dependents.has(dependent)) {
            this.dependents.add(dependent);
        }
        return true;
    }

    /**
     * Removes a dependent.
     * @param {ReactiveItem} dependent
     */
    removeDependent(dependent) {
        this.dependents.delete(dependent);
    }

    /**
     * Returns all dependents recursively.
     * @returns {Set<ReactiveItem>}
     */
    getDeepDependents() {
        const result = new Set();
        const queue = [this.reactiveItem];
        const visited = new Set();
        while (queue.length) {
            const current = queue.shift();
            if (!current || visited.has(current)) {
                continue;
            }
            visited.add(current);
            for (const dependent of current.engine.dependents) {
                if (!result.has(dependent)) {
                    result.add(dependent);
                    queue.push(dependent);
                }
            }
        }
        return result;
    }

    /**
     * Returns sorted array of deep dependents.
     * @returns {Array<ReactiveItem>}
     */
    getDeepDependentsArray() {
        const array = Array.from(this.getDeepDependents());
        array.sort(sortReactiveItems);
        return array;
    }

    /**
     * Notifies dependents of a message.
     * @param {EngineMessages} message
     * @param {{sender: ReactiveItem, recipients: Set<ReactiveItem>}} [ctx]
     */
    notifyDependents(message, ctx) {
        if (ctx === undefined) {
            ctx = { sender: this.reactiveItem, recipients: new Set() };
        }
        for (const dependent of this.dependents) {
            ctx.recipients.add(dependent);
            dependent.engine.getMessage(message, ctx);
        }
    }

    /**
     * Notifies dependencies (reverse direction).
     * @param {EngineMessages} message
     * @param {{sender: ReactiveItem, recipients: Set<ReactiveItem>}} ctx
     */
    notifyDependencies(message, ctx) {
        for (const dependency of this.dependencies) {
            ctx.recipients.add(dependency);
            dependency.engine.getMessage(message, ctx);
        }
    }

    /**
     * Handles incoming messages.
     * @param {EngineMessages} message
     * @param {{sender: ReactiveItem, recipients: Set<ReactiveItem>}} ctx
     */
    getMessage(message, ctx) {
        switch (message) {
            case EngineMessages.DEPENDENT_DESTROYED:
                this.dependents.delete(ctx.sender);
                break;
            case EngineMessages.DEPENDENCY_CHANGED:
                this.#error = null;
                this.shouldRecalc = true;
                this.notifyDependents(message, ctx);
                break;
            case EngineMessages.DEPENDENCY_DESTROYED:
                this.destroy(ctx);
                break;
            case EngineMessages.HAS_ERROR:
                this.shouldRecalc = true;
                this.setError(ctx.sender.engine.error, ctx);
                break;
        }
    }

    /**
     * Sets an error and notifies dependents.
     * @param {Error|null} error
     * @param {{sender: ReactiveItem, recipients: Set<ReactiveItem>}} [ctx]
     */
    setError(error, ctx) {
        if (error === null) {
            return;
        }
        if (ctx === undefined) {
            ctx = { sender: this.reactiveItem, recipients: new Set() };
        }
        this.version++;
        this.#error = error;
        this.shouldRecalc = true;
        this.notifyDependents(EngineMessages.HAS_ERROR, ctx);
    }

    /**
     * Clears the current error.
     */
    clearError() {
        this.#error = null;
    }

    /**
     * Destroys the engine.
     * @param {{sender: ReactiveItem, recipients: Set<ReactiveItem>}} [ctx]
     */
    destroy(ctx) {
        if (this.isDestroyed) {
            return;
        }
        if (ctx === undefined) {
            ctx = { sender: this.reactiveItem, recipients: new Set() };
        }
        this.#error = null;
        this.notifyDependents(EngineMessages.DEPENDENCY_DESTROYED, ctx);
        this.notifyDependencies(EngineMessages.DEPENDENT_DESTROYED, ctx);
        this.isDestroyed = true;
        this.dependencies.clear();
        this.dependents.clear();
        this.subscribeController.destroy();
        this.clearUpdates();
        if (this.#batchSnapshot) {
            this.#batchSnapshot.clear();
            this.#batchSnapshot = null;
        }
    }

    /**
     * Clears all pending updates.
     */
    clearUpdates() {
        this.updates.clear();
    }

    /**
     * Checks if there are any pending updates.
     * @returns {boolean}
     */
    hasUpdates() {
        return this.updates.size > 0;
    }

    /**
     * Processes temporary changes after batch ends.
     * Removes updates for properties that reverted to original values.
     * @returns {boolean} True if any changes remain.
     */
    checkChangesTemporary() {
        if (!this.#batchSnapshot) {
            return this.hasUpdates();
        }

        /**
         *
         * @param {string} prop
         * @returns {any}
         */
        const getCurrent = prop => {
            if (prop === '') {
                return this.reactiveItem.peekValue();
            }
            const val = this.reactiveItem.peekValue();
            return val ? val[prop] : undefined;
        };

        const changedProps = this.#batchSnapshot.getChangedProperties(getCurrent);

        for (const key of this.updates.keys()) {
            if (!changedProps.includes(key)) {
                this.updates.delete(key);
            }
        }

        const hasChanges = this.updates.size > 0;
        this.#batchSnapshot.clear();
        this.#batchSnapshot = null;

        return hasChanges;
    }

    /**
     * Called after a value change to schedule notifications.
     */
    valueChangedCallback() {
        if (this.suppressNotifications) {
            return;
        }
        changedItemsController.addItem(this.reactiveItem);
    }

    /**
     * Prepares the engine for setting a new value.
     * @throws {Error} If destroyed or in subscribers mode.
     */
    prepareSetValue() {
        if (this.isDestroyed) {
            throw new Error('The reactive item has been destroyed');
        }
        if (modeController.subscribersMode) {
            throw new Error('Cannot set value while subscribers are running');
        }
    }

    /**
     * Updates dependencies to a new set.
     * @param {Set<ReactiveItem>} newDeps
     */
    updateDependencies(newDeps) {
        // Remove old dependencies no longer needed
        for (const oldDep of this.dependencies) {
            if (!newDeps.has(oldDep)) {
                this.dependencies.delete(oldDep);
                oldDep.engine.removeDependent(this.reactiveItem);
            }
        }
        // Add new dependencies
        for (const newDep of newDeps) {
            if (!this.dependencies.has(newDep)) {
                this.dependencies.add(newDep);
                newDep.engine.addDependent(this.reactiveItem);
            }
        }
    }
}

// @ts-check


class Tracker {
    #isActive = false;
    /** @type {Set<ReactiveItem>} */
    #store = new Set();
    #eventEmitter = new EventEmitterLite();

    /** @type {object} */
    ctx = {};

    /**
     * Returns the current contents of the tracker's store, which is a set of all reactive items that have been
     * accessed since the tracker was last turned on. This is useful for debugging and testing purposes.
     * @returns {Set<ReactiveItem>} The current contents of the tracker's store.
     */
    get data() {
        return new Set([...this.#store]);
        //return this.#store;
    }

    /**
     * Returns a sorted array of all reactive items in the tracker's store. The items are sorted by their internal id,
     * ensuring consistent processing order when notified of changes.
     * @returns {Array<ReactiveItem>} A sorted array of reactive items.
     */
    getAsSortedArray() {
        return Array.from(this.#store).sort(sortReactiveItems);
    }

    /**
     * Adds a reactive item to the tracker's store if the tracker is turned on. If the tracker is not turned on, this
     * method does nothing.
     * @param {ReactiveItem} item - The reactive item to add to the tracker's store.
     * @param {string} [_key=""]
     */
    add(item, _key = '') {
        if (modeController.untrackMode) {
            return;
        }

        if (this.#isActive) {
            this.#store.add(item);
            this.#eventEmitter.emit('add', item);
        }
    }

    /**
     *
     * @param {(reactiveItem:ReactiveItem)=>void} callback
     * @returns {()=>void}
     */
    onAdd(callback) {
        return this.#eventEmitter.on('add', callback);
    }

    /**
     * Returns whether the tracker is currently turned on or not.
     * @returns {boolean} true if the tracker is on, false if it is off.
     */
    isTurnedOn() {
        return this.#isActive;
    }

    /**
     * Turns the tracker on and clears its store. If the tracker is already turned on, an error is thrown.
     * @param {object} [ctx={}] - The context to use when the tracker is turned on.
     * are tracked. If filter is a function, it is called with each reactive item as its argument, and if it returns false, the
     * reactive item is not tracked.
     */
    enable(ctx = {}) {
        if (this.#isActive) {
            throw new Error('The tracker is already turned on');
        }

        this.ctx = ctx;
        this.#isActive = true;
        this.#store.clear();
    }

    /**
     * Disables the tracker. When the tracker is disabled, it will not watch any set operations and will not report
     * anything to any registered listeners. The tracker is off by default.
     */
    disable() {
        this.#isActive = false;
    }
}

/**
 * The dependencyTracker is a utility instance that monitors reactive items that are used when a computed item is created. It is used
 * to track the dependencies of a computed item, so that it can be recalculated when any of the dependencies change.
 */
const dependencyTracker = new Tracker();

/**
 * Executes the specified function and tracks reactive items.
 * Returns a Set of used reactive items.
 * @param {Function} fn - The function to execute and track.
 * @param {...any} args - Arguments to pass to the function.
 * @returns {Set<ReactiveItem>} Set of reactive items accessed.
 */
function getSetOfUsedReactiveItems(fn, ...args) {
    dependencyTracker.enable();
    try {
        fn(...args);
    } finally {
        dependencyTracker.disable();
    }
    return dependencyTracker.data;
}

// @ts-check


/**
 * ReactiveItem is the base class for all reactive items. It provides methods for subscribing to changes,
 * getting the current value, and checking for errors.
 * @private
 */
class ReactiveItem {
    engine;

    name = '';

    /**
     *
     * @param {1|2|3|4} type
     */
    constructor(type) {
        this.engine = new Engine(this, type);
    }

    /**
     * Subscribes a function to be called whenever the value of this reactive item changes.
     * @param {(updates: Map<string, import("../core/UpdateDataRecord.js").UpdateDataRecord>)=>void} fn - The function to be called whenever the value of this reactive item changes.
     * @param {object} [options] - Optional options.
     * @param {number} [options.delay] - The delay in milliseconds before the function is called.
     * @param {AbortSignal} [options.signal] - The signal to abort the subscription.
     * @returns {()=>void}
     */
    subscribe(fn, options) {
        return this.engine.subscribeController.subscribe(fn, options);
    }

    /**
     * Removes all "change" subscribers. Listeners for "#has-subscribers" and "#no-subscribers" are not removed.
     */
    clearSubscribers() {
        this.engine.subscribeController.clearSubscribers();
    }

    /**
     * Removes all subscribers, including listeners for "#has-subscribers" and "#no-subscribers" events.
     */
    clearAllSubscribers() {
        this.engine.subscribeController.clearAllSubscribers();
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
     * @param {object} [options] - Optional options.
     * @param {boolean} [options.untracked=false] - If `true`, the value will not be added to the dependencyTracker.
     * @returns {any} The current value of the reactive item.
     */
    getValue(options) {
        if (this.engine.isDestroyed) {
            throw new Error('The reactive item has been destroyed');
        }

        const _options = Object.assign({ untracked: false }, options);

        if (_options.untracked === false) {
            dependencyTracker.add(this);
        }
    }

    /**
     * Retrieves the current value of the reactive item.
     * @returns {any} The current value of the reactive item.
     */
    peekValue() {
        return this.getValue({ untracked: true });
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
        } catch (e) {
            this.engine.setError(getError(e));
        }

        return this.engine.error !== null;
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
     * @param {(reactiveItem:ReactiveItem)=>void} fn - The function to be called.
     * @returns {()=>void} A function that unsubscribes the given function.
     */
    onDestroy(fn) {
        const that = this;
        const callback = () => {
            fn(that);
        };

        const unsubscriber = this.engine.subscribeController.onDestroy(callback);
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
        if (b === undefined) {
            b = this.getValue();
        }

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
 * Atom is a reactive item that holds a value. It is the base unit of reactive state.
 * @augments ReactiveItem
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
class Atom extends ReactiveItem {
    /** @type {T} */
    #currentValue;

    /**
     * Initializes an Atom instance with a given value.
     * @param {T} value - The initial value of the Atom.
     * @param {object} [options] - Options.
     * @param {string} [options.name] - The name of the Atom.
     * @param {((a:T, b:T)=>boolean)|null} [options.compareFunction] - A function that compares two values for equality.
     */
    constructor(
        value,
        options = {
            name: '',
            compareFunction: null,
        }
    ) {
        super(ATOM);

        if (value instanceof ReactiveItem) {
            throw new Error(
                `Atom${this.name ? ` (${this.name})` : ''}: value must not be a reactive item`
            );
        }

        this.name = options.name || '';
        this.engine.compareFn = options.compareFunction || null;
        this.#currentValue = value;
    }

    /**
     * Sets the value of the Atom. If the new value is the same as the current value, no action is taken.
     * Updates the current value to the new value if they are different.
     * @param {T} value - The new value to set for the Atom.
     */
    set value(value) {
        if (value instanceof ReactiveItem) {
            throw new Error(
                `Atom${this.name ? ` (${this.name})` : ''}: value must not be a reactive item`
            );
        }

        const engine = this.engine;

        engine.prepareSetValue();

        if (this.equals(value, this.#currentValue)) {
            return;
        }

        const oldValue = this.#currentValue;
        this.#currentValue = clone(value);

        const newValue = this.#currentValue;
        if (engine.addUpdate('', 'set', oldValue, newValue)) {
            engine.valueChangedCallback();
        }
    }

    /**
     * Retrieves the current value of the Atom. If the engine is destroyed, an error is thrown.
     * Tracks the Atom for dependency management.
     * @param {{untracked?: boolean}} [options] - Optional options. If `untracked` is `false`, the Atom value will be added to the dependencyTracker.
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
 * Computed is a reactive item that holds a value that is computed from other reactive values.
 * It is the base unit of reactive state.
 * @augments ReactiveItem
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
class Computed extends ReactiveItem {
    /** @type {T} */
    #currentValue;

    /** @type {function():T} */
    #fn;

    /** @type {string} */
    __cachedDependentsVersionString = '';

    options = {
        smartRecompute: false,
    };

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
    constructor(
        fn,
        options = {
            name: '',
            compareFunction: null,
            smartRecompute: false,
        }
    ) {
        super(COMPUTED);

        this.options = {
            smartRecompute: options.smartRecompute ?? false,
        };

        this.name = options.name || '';
        this.engine.compareFn = options.compareFunction || null;
        this.#fn = fn;

        this.#currentValue = this.#collectDependenciesAndInitValue();

        if (this.options.smartRecompute) {
            this.__cachedDependentsVersionString = this.#getDependenciesVersionString();
        }
    }

    /**
     * Returns a string representation of the dependencies of the Computed value.
     * @returns {string}
     */
    #getDependenciesVersionString() {
        /** @type {string[]} */
        const result = [];
        const engine = this.engine;

        engine.dependencies.forEach(dependency => {
            // If a dependency is stale (shouldRecalc = true), we must recalculate it
            // to get its most recent version. This is necessary for smartRecompute
            // to correctly detect changes in the dependency graph.
            if (dependency.engine.shouldRecalc) {
                dependency.getValue(); // side effect: forces recomputation
            }

            result.push(dependency.engine.id.toString() + ':' + dependency.engine.version);
        });

        return result.join(';');
    }

    #collectDependenciesAndInitValue() {
        dependencyTracker.enable();
        modeController.isComputing = true;
        /** @type {T} */
        let value;
        try {
            value = this.#fn();
            if (value instanceof ReactiveItem) {
                throw new Error(
                    `Computed${
                        this.name ? ` (${this.name})` : ''
                    }: Return value must not be a reactive item`
                );
            }
        } catch (e) {
            this.engine.setError(getError(e));
        }

        modeController.isComputing = false;
        dependencyTracker.disable();

        if (this.engine.error) {
            throw this.engine.error;
        }

        if (dependencyTracker.data.size === 0) {
            throw new Error(`Computed${this.name ? ` (${this.name})` : ''}: No dependencies`);
        }

        this.engine.addDependencies(dependencyTracker.data);
        // @ts-ignore
        return value;
    }

    /**
     * Checks whether the Computed value needs to be recalculated. A recalculation is needed if the engine's shouldRecalc
     * property is true, if the engine has an error, or if the version string of the dependencies has changed.
     * @returns {boolean} true if the Computed value needs to be recalculated, false if it does not.
     */
    isStale() {
        const engine = this.engine;

        if (engine.error !== null) {
            return true;
        }

        if (engine.shouldRecalc) {
            return true;
        }

        return false;
    }

    #areDependenciesStale() {
        const engine = this.engine;

        const dependentsVersionString = this.#getDependenciesVersionString();
        if (dependentsVersionString !== this.__cachedDependentsVersionString) {
            this.__cachedDependentsVersionString = dependentsVersionString;
            engine.shouldRecalc = true;

            return true;
        }

        return false;
    }

    /**
     * @param {{untracked?: boolean}} [options] - Optional options. If `untracked` is `false`, the Computed value will be added to the dependencyTracker.
     * @returns {T} The current value of the Computed value.
     */
    getValue(options) {
        super.getValue(options);

        const engine = this.engine;

        // If there's an error and dependencies haven't changed, rethrow the same error without recalculating
        if (engine.error !== null && !engine.shouldRecalc) {
            throw engine.error;
        }

        if (modeController.isComputing) {
            if (this.isStale()) {
                throw new Error(
                    `Computed${this.name ? ` (${this.name})` : ''}: Dependencies cannot be stale`,
                    { cause: this }
                );
            }
        }

        if (!this.isStale()) {
            engine.shouldRecalc = false;
            return this.#currentValue;
        }

        if (this.options.smartRecompute) {
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
     * Returns the current cached value of the computed without triggering a recalculation
     * and without tracking dependencies.
     *
     * Unlike the `value` getter, this method does not check if dependencies have changed
     * and does not recompute the value if it's stale. It simply returns the last
     * computed value. This is useful for debugging or for accessing the value
     * without causing side effects (e.g., inside an untracked context).
     *
     * If the computed has an error, this method will still return the last cached
     * value (which may be undefined or a previous value) without rethrowing the error.
     *
     * @override
     * @returns {T} The cached value.
     *
     * @example
     * ```js
     * const a = atom(1);
     * const b = computed(() => a.value * 2);
     *
     * console.log(b.peekValue()); // 2 (without tracking dependencies)
     * a.value = 2;
     * console.log(b.peekValue()); // still 2 (stale, not recomputed)
     * console.log(b.value);       // 4 (recomputed now)
     * ```
     */
    peekValue() {
        return this.#currentValue;
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
        const engine = this.engine;

        engine.shouldRecalc = false;
        engine.clearError();

        // Collect new dependencies if dynamic mode is enabled
        /** @type {Set<ReactiveItem>} */
        const newDeps = new Set();
        const unsubscribe = dependencyTracker.onAdd(item => {
            newDeps.add(item);
        });

        let value;

        //console.log("calc", this.name);
        try {
            value = this.#fn();
        } catch (e) {
            const error = getError(e);
            engine.setError(
                new Error(`Computed${this.name ? ` (${this.name})` : ''}: ` + error.message, {
                    cause: this,
                })
            );
            throw engine.error;
        } finally {
            unsubscribe();
        }

        if (this.equals(this.#currentValue, value)) {
            // Value didn't actually change – remove any pending update
            this.engine.clearUpdates();
            return this.#currentValue;
        }

        const oldValue = this.#currentValue;
        this.#currentValue = clone(value);

        const newValue = this.#currentValue;
        //this.engine.version++;
        if (engine.addUpdate('', 'set', oldValue, newValue)) {
            engine.valueChangedCallback();
        }

        return this.#currentValue;
    }
}

// @ts-check


/**
 * Collection is a reactive item that holds an array of values.
 * It provides reactivity for array operations (push, pop, splice, etc.)
 * and allows tracking changes to individual elements and the array length.
 *
 * @template T
 * @augments ReactiveItem
 * @example
 * ```js
 * const coll = new Collection([1, 2, 3]);
 * coll.subscribe((updates) => {
 *     console.log('Collection changed:', Array.from(updates.keys()));
 * });
 * coll.value.push(4); // triggers reactivity
 * ```
 */
class Collection extends ReactiveItem {
    /** @type {T[]} */
    #target;
    /** @type {T[]} */
    #proxy;
    /** @type {number} */
    #length = 0;
    /** @type {ProxyHandler<T[]>} */
    #handler;

    /**
     * Initializes a Collection instance with an initial array.
     *
     * @param {T[]} value - The initial array value.
     * @param {object} [options] - Configuration options.
     * @param {string} [options.name] - The name of the Collection (for debugging).
     * @param {CompareFunction|null} [options.compareFunction] - Custom equality function for values.
     */
    constructor(value, options = { name: '', compareFunction: null }) {
        super(COLLECTION);
        this.name = options.name || '';
        this.engine.compareFn = options.compareFunction || null;
        this.#handler = this.#initHandler();
        this.#target = [];
        this.#proxy = new Proxy(this.#target, this.#handler);
        this.#length = value.length;
        // Copy initial values
        for (let i = 0; i < value.length; i++) {
            this.#target[i] = value[i];
        }
    }

    /**
     * Initializes the proxy handler for array interception.
     *
     * @returns {ProxyHandler<T[]>} The proxy handler object.
     */
    #initHandler = () => {
        const that = this;
        return {
            /**
             * Intercepts property assignments on the array.
             *
             * @param {T[]} target - The target array.
             * @param {string|symbol} key - The property key.
             * @param {any} value - The value to set.
             * @returns {boolean} True if the operation succeeded.
             */
            set: (target, key, value) => {
                // Ignore symbol keys
                if (typeof key === 'symbol') {return true;}

                const engine = that.engine;
                engine.prepareSetValue();
                if (target[/** @type {any} */ (key)] === value) {return true;}

                if (key !== 'length') {
                    const oldValue = target[/** @type {any} */ (key)];
                    if (that.equals(oldValue, value)) {return true;}
                    target[/** @type {any} */ (key)] = value;
                    if (that.#length !== target.length) {
                        const newLength = target.length;
                        const oldLength = that.#length;
                        that.#length = newLength;
                        engine.addUpdate('length', 'set', oldLength, newLength);
                    }
                    engine.addUpdate(key, 'set', oldValue, value);
                } else {
                    const newLength = /** @type {number} */ (value);
                    const oldLength = that.#length;
                    if (newLength === oldLength) {return true;}
                    if (newLength < oldLength) {
                        for (let i = newLength; i < oldLength; i++) {
                            const itemValue = that.#target[i];
                            engine.addUpdate(i.toString(), 'delete', itemValue, undefined);
                        }
                        that.#target.length = newLength;
                    } else if (newLength > oldLength) {
                        that.#target.length = newLength;
                        for (let i = oldLength; i < newLength; i++) {
                            engine.addUpdate(i.toString(), 'set', that.#target[i], undefined);
                        }
                    }
                    that.#length = newLength;
                    engine.addUpdate('length', 'set', oldLength, newLength);
                }

                engine.valueChangedCallback();

                return true;
            },
            /**
             * Intercepts property accesses on the array.
             *
             * @param {T[]} target - The target array.
             * @param {string|symbol} key - The property key.
             * @returns {any} The property value.
             */
            get: (target, key) => {
                that.getValue();
                // Ignore symbol keys
                if (typeof key === 'symbol') {return undefined;}
                if (typeof target[/** @type {any} */ (key)] === 'function') {
                    return target[/** @type {any} */ (key)];
                }
                return target[/** @type {any} */ (key)];
            },
            /**
             * Intercepts property deletions on the array.
             *
             * @param {T[]} target - The target array.
             * @param {string|symbol} key - The property key.
             * @returns {boolean} True if the operation succeeded.
             */
            deleteProperty: (target, key) => {
                if (typeof key === 'symbol') {return true;}
                if (modeController.subscribersMode) {
                    throw new Error(
                        `Collection${this.name ? ` (${this.name})` : ''}: Cannot delete property while subscribers are running`
                    );
                }
                const engine = that.engine;
                if (engine.addUpdate(key, 'delete', target[/** @type {any} */ (key)], undefined)) {
                    delete target[/** @type {any} */ (key)];
                    engine.valueChangedCallback();
                }
                return true;
            },
        };
    };

    /**
     * Sets the entire array, replacing all elements.
     * Only triggers reactivity if the new array differs from the current one.
     *
     * @param {T[]} value - The new array value.
     */
    set value(value) {
        if (!Array.isArray(value)) {
            throw new Error(
                `Collection${this.name ? ` (${this.name})` : ''}: Value must be an array`
            );
        }
        const current = this.getValue({ untracked: true });
        // Shallow compare to avoid unnecessary updates
        if (this.equals(current, value)) {return;}
        const engine = this.engine;
        engine.prepareSetValue();
        engine.suppressNotifications = true;
        this.#proxy.length = value.length;
        for (let i = 0; i < value.length; i++) {
            this.#proxy[i] = value[i];
        }

        engine.suppressNotifications = false;
        this.#target = value;
        engine.valueChangedCallback();
    }

    /**
     * Returns the proxied array value.
     * Tracks this Collection as a dependency when accessed.
     *
     * @param {{untracked?: boolean}} [options] - If `untracked` is true, does not add to dependency tracker.
     * @returns {T[]} The reactive array proxy.
     */
    getValue(options) {
        super.getValue(options);
        return this.#proxy;
    }

    /**
     * Returns the proxied array value (same as getValue()).
     *
     * @returns {T[]} The reactive array proxy.
     */
    get value() {
        return this.getValue();
    }

    /**
     * Returns the raw, unproxied target array.
     * Warning: Mutating the raw array directly does NOT trigger reactivity.
     *
     * @returns {T[]} The raw array.
     */
    getRawValue() {
        return this.#target;
    }
}

// @ts-check


/**
 * ShallowReactive is a reactive item that holds a shallow object. It is the base unit of reactive state.
 * It is a shallow reactive object, meaning that it only tracks changes to the properties of the object itself, not its nested properties.
 * @augments ReactiveItem
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
 * const props = b.value;
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
 * console.log(b.value.foo);
 * // Outputs: 1
 *
 * b.value.foo = 2;
 * console.log(b.value.foo);
 * // Outputs: 2
 *
 * console.log(bar);
 * // Outputs: 1
 *
 * b.value.inc();
 * console.log(b.value.foo);
 * // Outputs: 3
 * console.log(bar);
 * // Outputs: 2
 * ```
 */
class ShallowReactive extends ReactiveItem {
    /** @type {T} */
    #target;

    /** @type {T} */
    #proxy;

    /** @type {ProxyHandler<T>} */
    #handler;

    /**
     * Initializes a ShallowReactive instance with a given value.
     * @param {T} value - The initial value of the ShallowReactive.
     * @param {object} [options] - Options.
     * @param {string} [options.name] - The name of the ShallowReactive.
     */
    constructor(
        value,
        options = {
            name: '',
        }
    ) {
        super(SHALLOW_REACTIVE);

        this.name = options.name || '';
        if (!isPlainObject(value)) {
            throw new Error(
                `ShallowReactive${this.name ? ` (${this.name})` : ''}: value must be an object`
            );
        }

        this.#handler = this.#initHandler();
        this.#target = value;

        this.#proxy = new Proxy(this.#target, this.#handler);
    }

    #initHandler() {
        const that = this;

        /** @type {ProxyHandler<T>} */
        return {
            /**
             * Sets a property on the ShallowReactive. If the property already exists, its value is updated. If not, a new property is added.
             * @param {T} target - The ShallowReactive to set the property on.
             * @param {string} key - The key of the property to set.
             * @param {any} value - The value to set for the property.
             * @returns {boolean} true if the property was successfully set.
             */
            set: (target, key, value) => {
                const engine = that.engine;
                engine.prepareSetValue();

                const oldValue = target[key];

                if (that.equals(oldValue, value)) {
                    return true;
                }

                // @ts-ignore
                target[key] = value;

                if (engine.addUpdate(key, 'set', oldValue, value)) {
                    engine.valueChangedCallback();
                }

                return true;
            },

            /**
             * Gets a property from the ShallowReactive. If the property is not found, undefined is returned.
             * @param {T} target - The ShallowReactive to get the property from.
             * @param {string} key - The key of the property to get.
             * @returns {any} The value of the property, or undefined if it was not found.
             */
            get: (target, key) => {
                that.getValue();
                return target[key];
            },

            /**
             * Deletes a property from the ShallowReactive. If the property is not found, an error is thrown.
             * @param {T} target - The ShallowReactive to delete the property from.
             * @param {string} key - The key of the property to delete.
             * @returns {boolean} true if the property was deleted, false if it was not.
             */
            deleteProperty: (target, key) => {
                if (modeController.subscribersMode) {
                    throw new Error(
                        `ShallowReactive${
                            this.name ? ` (${this.name})` : ''
                        }: Cannot delete property while subscribers are running`
                    );
                }

                const engine = that.engine;

                if (engine.addUpdate(key, 'delete', target[key], undefined)) {
                    delete target[key];
                    engine.valueChangedCallback();
                }

                return true;
            },
        };
    }

    /**
     * Retrieves the proxied value of the ShallowReactive. If the engine is destroyed, an error is thrown.
     * Tracks the ShallowReactive for dependency management.
     * @param {{untracked?: boolean}} [options] - Optional options. If `untracked` is `false`, the ShallowReactive value will be added to the dependencyTracker.
     * @returns {T} The proxied value of the ShallowReactive.
     */
    getValue(options) {
        super.getValue(options);
        return this.#proxy;
    }

    /**
     * Sets the value of the ShallowReactive. If the value is an object, it will be proxied and reactive.
     * @param {T} value - The new value of the ShallowReactive.
     */
    setValue(value) {
        this.getValue({ untracked: true });

        this.engine.suppressNotifications = true;
        const currentKeys = Object.keys(this.#proxy);
        const newKeys = Object.keys(value);
        const keysToDelete = currentKeys.filter(key => !newKeys.includes(key));
        keysToDelete.forEach(key => delete this.#proxy[key]);

        for (let i = 0; i < newKeys.length; i++) {
            const key = newKeys[i];

            // @ts-ignore
            this.#proxy[key] = value[key];
        }

        this.engine.suppressNotifications = false;
        this.engine.valueChangedCallback();
    }

    /**
     * Sets the value of the ShallowReactive. If the value is an object, it will be proxied and reactive.
     * @param {T} value - The new value of the ShallowReactive.
     */
    set value(value) {
        this.setValue(value);
    }

    /**
     * Retrieves the proxied value of the ShallowReactive. If the engine is destroyed, an error is thrown.
     * Tracks the ShallowReactive for dependency management.
     * @returns {T} The proxied value of the ShallowReactive.
     */
    get value() {
        return this.getValue();
    }

    /**
     * Returns the raw, unproxied value of the ShallowReactive. This is generally not recommended as it breaks reactivity.
     * @returns {T} The raw, unproxied value of the ShallowReactive.
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
     * @type {Map<string, ReactiveItem>}
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

    /** @type {Map<string, import("../core/UpdateDataRecord.js").UpdateDataRecord>} */
    #updates;

    /** @type {UpdateDataRecordManager} */
    #updatesManager;

    #keys = new WeakMap();

    #subscriber;

    constructor() {
        this.eventEmitter = new EventEmitterExt();
        this.eventEmitter.registerEvents('change', 'destroy', 'clear-updates');
        this.eventEmitter.setListenerRunnerStrategy(1);

        this.#updates = new Map();
        this.#updatesManager = new UpdateDataRecordManager(this.#updates);

        const that = this;
        this.eventEmitter.on('clear-updates', () => {
            //console.log("clear-updates");
            //console.log(that.#updates);
            that.#updates.clear();
        });

        this.#subscriber = (
            /** @type {Map<string, import("../core/UpdateDataRecord.js").UpdateDataRecord>} */ updates,
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
        this.eventEmitter.emit('change');
        this.eventEmitter.emit('clear-updates');
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
            throw new Error(`Child store with key ${storeName} already exists in this store.`);
        }

        this.#childStores.set(storeName, store);
        const that = this;

        this.#keys.set(store, storeName);

        const unsubscriber = store.subscribe(this.#subscriber);

        const unsubscriber2 = store.onDestroy(() => {
            that.#removeChildStore(storeName);
            //that.#notifySubscribers();
        });

        this.#unsubscribers.add(storeName, unsubscriber, unsubscriber2);
    }

    /**
     * Adds one or more reactive items to the store. If an item is a child store, it will be added to the store.
     * @param {{[key: string]: ReactiveItem|Store}} items - An object where the keys are the keys to use when adding the items to the store and the values are the reactive items to add.
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
     * Destroys the child store with the given key. This method is useful for cleaning up after a child store
     * that is no longer needed. It calls destroy on the child store and removes the child store from this store.
     * @param {string} key - The key of the child store to destroy.
     * @returns {void}
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
     * It first attempts to destroy a reactive item with the specified key, and if not found,
     * attempts to destroy a child store with the same key.
     * @param {string} key - The key of the item or child store to destroy.
     * @returns {void}
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

        // Remove from store maps
        this.#items.delete(key);
        this.#keys.delete(item);

        // Unsubscribe from the item's change events
        this.#unsubscribers.iterate(key, unsubscriber => {
            unsubscriber();
        });
        this.#unsubscribers.remove(key);

        // Notify about removal (but do NOT destroy the item)
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

        this.#unsubscribers.iterate(key, unsubscriber => {
            unsubscriber();
        });
        this.#unsubscribers.remove(key);

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

        // Finally destroy the reactive item
        item.destroy();
    }

    /**
     * Removes the reactive item with the given key from the store. This method does not call destroy on the item.
     * @param {string} key - The key of the item to remove.
     * @returns {void}
     */
    removeItem(key) {
        if (this.isDestroyed) {
            throw new Error('Store has been destroyed');
        }

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

        this.#isDestroyed = true;

        this.#items.forEach((item, key) => {
            this.#destroyReactiveItem(key);
        });
        this.#items.clear();

        this.#childStores.forEach((childStore, key) => {
            this.#destroyChildStore(key);
        });
        this.#childStores.clear();

        // Clear updates map to release memory
        this.#updates.clear();

        // Clear the reference to the updates manager (optional, helps GC)
        // @ts-ignore
        this.#updatesManager = null;

        this.eventEmitter.emit('destroy', this);
        this.eventEmitter.unregisterAllEvents();

        this.#unsubscribers.removeAll();
    }

    /**
     * Clears all reactive items from the store. This method is useful for resetting a Store to an empty state.
     * It removes all reactive items from the store and clears all child stores. It does not destroy the reactive items.
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

        this.#unsubscribers.removeAll();
    }

    /**
     * Retrieves the reactive item with the given key from the store.
     * @param {string} key - The key of the item to retrieve.
     * @returns {ReactiveItem|null} The reactive item with the given key, or null if no such item exists in the store.
     */
    #getReactiveItem(key) {
        return this.#items.get(key) || null;
    }

    /**
     * Retrieves the child store with the given key from the store.
     * @param {string} key - The key of the child store to retrieve.
     * @returns {Store|null} The child store with the given key, or null if no such child store exists in the store.
     */
    #getChildStore(key) {
        return this.#childStores.get(key) || null;
    }

    /**
     * Retrieves the item with the given key from the store. This method first looks for a reactive item with the given key,
     * and if no such item exists, looks for a child store with the same key.
     * @param {string} key - The key of the item to retrieve.
     * @returns {ReactiveItem|Store|null} The item with the given key, or null if no such item exists in the store.
     */
    getItem(key) {
        if (this.isDestroyed) {
            throw new Error('Store has been destroyed');
        }
        return this.#getReactiveItem(key) || this.#getChildStore(key) || null;
    }

    /**
     * Checks if an item with the given key exists in the store.
     * @param {string} key - The key of the item to check.
     * @returns {boolean} true if the item exists, false otherwise.
     */
    hasItem(key) {
        if (this.isDestroyed) {
            throw new Error('Store has been destroyed');
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
     * Retrieves all items stored in the Store, optionally filtered by a specified filter.
     *
     * @param {"all"|"reactives"|"stores"} [filter="all"] - The filter to apply when retrieving items. Default is "all".
     * Possible values can be "all", "reactives", or "stores" (if applicable).
     * @returns {Map<string, ReactiveItem|Store>} A Map containing the items that match the filter.
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
     * console.log(store.toJSON());
     * // output: { a: 1, b: 2, c: { d: 3, e: [1, 2, 3] } }
     *
     * console.log(store.toJSON("all"));
     * // output: { a: 1, b: 2, c: { d: 3, e: [1, 2, 3] } }
     *
     * console.log(store.toJSON("reactives"));
     * // output: { a: 1, b: 2 }
     *
     * console.log(store.toJSON("stores"));
     * // output: { c: { d: 3, e: [1, 2, 3] } }
     *
     * store.destroy();
     *
     * console.log(store.toJSON());
     * // output: {}
     * ```
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
     * The function is called with a Map of updates, where the keys are the names of the items that changed, and the values are UpdateDataRecord objects.
     * @param {(update: Map<string, import("../core/UpdateDataRecord.js").UpdateDataRecord>, store: Store)=>void} fn - The function to be called whenever the value of this Atom changes.
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
            throw new Error('Store has been destroyed');
        }

        const that = this;

        return this.eventEmitter.on('change', () => {
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
            throw new Error('Store has been destroyed');
        }

        return this.eventEmitter.on('destroy', fn);
    }

    /**
     * Mutes the event emitter, preventing any updates from being triggered.
     * Any updates that are scheduled while muted will be queued and executed when unmuteUpdates is called.
     */
    muteUpdates() {
        if (this.isDestroyed) {
            throw new Error('Store has been destroyed');
        }
        this.eventEmitter.mute();
    }

    /**
     * Unmutes the event emitter, allowing updates to be triggered.
     * Any updates that were scheduled while muted will be executed.
     */
    unmuteUpdates() {
        if (this.isDestroyed) {
            throw new Error('Store has been destroyed');
        }
        this.eventEmitter.unmute();
    }

    /**
     * Returns whether the event emitter is currently muted.
     * @returns {boolean}
     */
    isMuted() {
        if (this.isDestroyed) {
            throw new Error('Store has been destroyed');
        }
        return this.eventEmitter.isMuted();
    }
}

// @ts-check


/**
 * @template T
 * @typedef {T extends object ? ShallowReactive<T> : Atom<T>} ReactiveWrapper
 */

/**
 * Type guard to check if an item is a reactive wrapper with a `value` property.
 * @param {any} item
 * @returns {item is Atom<any> | ShallowReactive<any>}
 */
function isReactiveWrapper(item) {
    return item instanceof Atom || item instanceof ShallowReactive;
}

/**
 * ReactiveList is a reactive array-like structure that stores values of any type.
 * It automatically chooses the appropriate reactive item:
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
 *     console.log('List changed:', list.toArray());
 * });
 *
 * list.add(1, 2, 3);                // numbers -> stored as Atom
 * list.setItem(1, 42);
 * list.removeRange(0, 1);
 * list.setItems([{ a: 1 }, { b: 2 }]); // objects -> stored as ShallowReactive
 * ```
 */
class ReactiveList {
    /** @type {Atom<number>} */
    #lengthAtom;

    /** @type {Store} */
    #store;

    /**
     * Creates a new empty ReactiveList.
     */
    constructor() {
        this.#store = new Store();
        this.#store.muteUpdates();

        this.#lengthAtom = new Atom(0, { name: 'length' });
        this.#store.addItems({ length: this.#lengthAtom });
        this.#store.unmuteUpdates();
    }

    /**
     * Creates a reactive wrapper for the given value.
     * Uses ShallowReactive for objects/arrays, Atom for items.
     *
     * @param {any} value - The value to wrap.
     * @param {string} name - The name to assign to the reactive item (used for debugging).
     * @returns {ReactiveWrapper<any>} The reactive wrapper.
     */
    #createReactiveItem(value, name) {
        if (isPlainObject(value) || Array.isArray(value)) {
            return new ShallowReactive(value, { name });
        }
        // @ts-ignore
        return new Atom(value, { name });
    }

    /**
     * Updates the value of a reactive wrapper.
     * Works for both Atom and ShallowReactive.
     *
     * @param {ReactiveWrapper<any>} wrapper - The reactive wrapper.
     * @param {any} newValue - The new value to set.
     */
    #updateReactiveItem(wrapper, newValue) {
        // Both Atom and ShallowReactive have a `value` setter.
        wrapper.value = newValue;
    }

    /**
     * Adds one or more items to the end of the list.
     *
     * @param {...T} values - The values to add.
     */
    add(...values) {
        if (this.isDestroyed) {throw new Error('ReactiveList has been destroyed');}
        if (values.length === 0) {return;}

        const startIndex = this.#lengthAtom.value;
        const alreadyMuted = this.#store.isMuted();
        this.#store.muteUpdates();

        /** @type {{[key:string]: ReactiveWrapper<any>}} */
        const wrappers = {};
        for (let i = 0; i < values.length; i++) {
            const idx = startIndex + i;
            const wrapper = this.#createReactiveItem(values[i], idx.toString());
            wrappers[idx] = wrapper;
        }

        this.#store.addItems(wrappers);
        for (let i = 0; i < values.length; i++) {
            const idx = startIndex + i;
            this.#updateReactiveItem(wrappers[idx], values[i]);
        }
        this.#lengthAtom.value += values.length;

        if (!alreadyMuted) {this.#store.unmuteUpdates();}
    }

    /**
     * Retrieves the value at the given index.
     *
     * @param {number} index - The index of the item to retrieve.
     * @returns {T | undefined} The value, or undefined if the index is out of bounds.
     */
    getItem(index) {
        if (this.isDestroyed) {throw new Error('ReactiveList has been destroyed');}
        const item = this.#store.getItem(index.toString());
        if (!isReactiveWrapper(item)) {return undefined;}
        return item.value;
    }

    /**
     * Returns a shallow copy of all items in the list as a plain array.
     *
     * @returns {T[]} An array containing all values.
     */
    toArray() {
        if (this.isDestroyed) {throw new Error('ReactiveList has been destroyed');}
        const items = [];
        for (let i = 0; i < this.#lengthAtom.value; i++) {
            const item = this.#store.getItem(i.toString());
            if (isReactiveWrapper(item)) {
                items.push(item.value);
            }
        }
        return items;
    }

    /**
     * Updates the value at the specified index.
     *
     * @param {number} index - The index to update.
     * @param {T} value - The new value.
     */
    setItem(index, value) {
        if (this.isDestroyed) {throw new Error('ReactiveList has been destroyed');}
        const wrapper = this.#store.getItem(index.toString());
        if (!isReactiveWrapper(wrapper)) {return;}
        const alreadyMuted = this.#store.isMuted();
        this.#store.muteUpdates();
        wrapper.value = value;
        if (!alreadyMuted) {this.#store.unmuteUpdates();}
    }

    /**
     * Returns the current length of the list.
     *
     * @returns {number}
     */
    get length() {
        if (this.isDestroyed) {throw new Error('ReactiveList has been destroyed');}
        return this.#lengthAtom.value;
    }

    /**
     * Replaces the entire content of the list with the given array.
     *
     * @param {T[]} values - The new array of values.
     */
    setItems(values) {
        if (this.isDestroyed) {throw new Error('ReactiveList has been destroyed');}
        const alreadyMuted = this.#store.isMuted();
        this.#store.muteUpdates();

        const currentLen = this.#lengthAtom.value;
        const newLen = values.length;

        if (newLen < currentLen) {
            // Remove tail items
            for (let i = newLen; i < currentLen; i++) {
                this.#store.destroyItem(i.toString());
            }
            this.#lengthAtom.value = newLen;
            // Update remaining items
            for (let i = 0; i < newLen; i++) {
                const wrapper = this.#store.getItem(i.toString());
                if (isReactiveWrapper(wrapper)) {
                    wrapper.value = values[i];
                }
            }
        } else {
            // Update existing items
            for (let i = 0; i < currentLen; i++) {
                const wrapper = this.#store.getItem(i.toString());
                if (isReactiveWrapper(wrapper)) {
                    wrapper.value = values[i];
                }
            }
            // Create and add new items
            /** @type {{[key:string]: ReactiveWrapper<any>}} */
            const wrappers = {};
            for (let i = currentLen; i < newLen; i++) {
                wrappers[i] = this.#createReactiveItem(values[i], i.toString());
            }
            this.#store.addItems(wrappers);
            for (let i = currentLen; i < newLen; i++) {
                this.#updateReactiveItem(wrappers[i], values[i]);
            }
            this.#lengthAtom.value = newLen;
        }

        if (!alreadyMuted) {this.#store.unmuteUpdates();}
    }

    /**
     * Removes elements from the list starting at `startIndex` and removing `count` items.
     * Remaining elements are shifted left. The operation is batched to emit only one notification.
     *
     * @param {number} startIndex - The index at which to start removal.
     * @param {number} count - The number of elements to remove.
     */
    removeRange(startIndex, count) {
        if (this.isDestroyed) {throw new Error('ReactiveList has been destroyed');}
        if (count <= 0) {return;}

        const oldLen = this.#lengthAtom.value;
        if (startIndex < 0 || startIndex >= oldLen) {return;}

        const actualCount = Math.min(count, oldLen - startIndex);
        if (actualCount === 0) {return;}

        const newLen = oldLen - actualCount;
        const alreadyMuted = this.#store.isMuted();
        this.#store.muteUpdates();

        // Shift elements left
        for (let i = startIndex; i < newLen; i++) {
            const srcIndex = i + actualCount;
            const srcItem = this.#store.getItem(srcIndex.toString());
            const destItem = this.#store.getItem(i.toString());
            if (isReactiveWrapper(srcItem) && isReactiveWrapper(destItem)) {
                destItem.value = srcItem.value;
            } else if (isReactiveWrapper(destItem)) {
                destItem.value = undefined;
            }
        }

        // Destroy tail items
        for (let i = newLen; i < oldLen; i++) {
            this.#store.destroyItem(i.toString());
        }

        this.#lengthAtom.value = newLen;

        if (!alreadyMuted) {this.#store.unmuteUpdates();}
    }

    /**
     * Removes the item at the given index.
     *
     * @param {number} index - The index of the item to remove.
     */
    removeItem(index) {
        this.removeRange(index, 1);
    }

    /**
     * Removes the last item of the list.
     */
    removeLastItem() {
        this.removeRange(this.#lengthAtom.value - 1, 1);
    }

    /**
     * Removes the first item of the list.
     */
    removeFirstItem() {
        this.removeRange(0, 1);
    }

    /**
     * Removes all items from the list.
     */
    clear() {
        this.removeRange(0, this.#lengthAtom.value);
    }

    /**
     * Destroys the list, releasing all internal resources.
     * After destruction, any method call (except `isDestroyed`) will throw an error.
     */
    destroy() {
        if (this.isDestroyed) {return;}
        this.#store.destroy();
        // No need to nullify #lengthAtom; it will be inaccessible because isDestroyed becomes true.
    }

    /**
     * Indicates whether the list has been destroyed.
     *
     * @returns {boolean}
     */
    get isDestroyed() {
        return this.#store.isDestroyed;
    }

    /**
     * Subscribes a callback to be invoked whenever the list changes.
     * The callback receives a Map of updates with details about changed items.
     *
     * @param {(updates: Map<string, import("../core/UpdateDataRecord.js").UpdateDataRecord>) => void} fn - The callback function.
     * @returns {() => void} A function to unsubscribe the callback.
     */
    subscribe(fn) {
        if (this.isDestroyed) {throw new Error('ReactiveList has been destroyed');}
        return this.#store.subscribe(fn);
    }
}

// @ts-check


/**
 * Automatically tracks and subscribes to changes in reactive items used by the specified function.
 * This allows the function to be re-executed whenever any of its dependencies change, maintaining
 * up-to-date results.
 *
 * @param {(updates?:Map<string, import("./../core/UpdateDataRecord.js").UpdateDataRecord>)=>void} fn - The function to track and reactively execute.
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
function autorun(fn, options) {
    const _options = Object.assign(
        {
            name: undefined,
            delay: 0,
            signal: undefined,
            onError: undefined,
            type: 'autorun',
        },
        options
    );

    if (modeController.untrackMode) {
        throw new Error(
            `Autorun${
                _options.name ? ` (${_options.name})` : ''
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
 * @param {(updates?:Map<string, import("../core/UpdateDataRecord.js").UpdateDataRecord>)=>void} fn - The callback function to execute when tracked dependencies change.
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
function reaction(dataFunction, fn, options) {
    const _options = Object.assign(
        { name: undefined, delay: 0, signal: undefined, type: 'reaction' },
        options
    );

    if (modeController.untrackMode) {
        throw new Error(
            `Reaction${
                _options.name ? ` (${_options.name})` : ''
            }: cannot initialize when untrackMode is on.`
        );
    }

    if (_options.delay > 0) {
        fn = debounce(fn, _options.delay);
        _options.delay = 0;
    }

    /** @type {Function[]} */
    const unsubscribers = [];

    const items = getSetOfUsedReactiveItems(dataFunction);

    if (items.size === 0) {
        throw new Error(
            `Autorun/Reaction${
                _options.name ? ` (${_options.name})` : ''
            }: No reactive items found.`
        );
    }

    for (const item of items) {
        unsubscribers.push(item.subscribe(fn, _options));
    }

    const unsubscriber = () => {
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
function when(predicate, fn, options) {
    const computed = new Computed(predicate);
    const timeout = options?.timeout || 0;
    /** @type {ReturnType<typeof setTimeout>|null} */
    let timer;

    const mainUnsubscriber = function () {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }

        unsubscribe();
        computed.destroy();
    };

    const unsubscribe = computed.subscribe(() => {
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
 * @param {object} [options] - Optional options.
 * @param {number} [options.timeout] - The number of milliseconds to wait before timing out.
 * @returns {Promise<void>} A promise that resolves when the predicate evaluates to true.
 * @example
 * ```js
 * const a = atom(0, { name: "a" });
 * let foo = 0;
 *
 * waitUntil(() => a.value > 3).then(() => {
 *     foo++;
 * });
 *
 * a.value = 2; // foo = 0
 * a.value = 3; // foo = 0
 * a.value = 4; // foo = 1
 * ```
 */
function waitUntil(predicate, options) {
    return new Promise(resolve => {
        const computed = new Computed(predicate);
        const timeout = options?.timeout || 0;
        /** @type {ReturnType<typeof setTimeout>|null} */
        let timer;

        const mainUnsubscriber = function () {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }

            unsubscribe();
            computed.destroy();
        };

        const unsubscribe = computed.subscribe(() => {
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
function batch(fn) {
    modeController.enterBatch();
    try {
        fn();
    } finally {
        modeController.exitBatch();
    }
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
    const untrackMode = modeController.untrackMode;
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
    const atom = new Atom(0, { name: 'now' });
    /** @type {ReturnType<typeof setTimeout>} */
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

    atom.onDestroy(() => {
        clearInterval(intervalId);
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
    const stateAtom = new Atom('pending', { name: 'fromPromise' });
    /** @type {T} */
    let promiseResult;

    /** @type {Error} */
    let promiseError;

    /**
     * Executes the appropriate function based on the current state of the promise.
     * @param {object} param0 - An object containing the functions to execute for each state.
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
            if (stateAtom.value === 'resolved') {
                try {
                    if (param0.resolved) {
                        param0.resolved(promiseResult);
                    }
                } catch (e) {
                    console.error(e);
                }
            }

            if (stateAtom.value === 'rejected') {
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
            .then(value => {
                promiseResult = value;
                stateAtom.value = 'resolved';
            })
            .catch(e => {
                promiseError = e;
                stateAtom.value = 'rejected';
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
 * Creates a new Atom instance. An Atom is a reactive item that holds a value. Same as `atom` but
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
function atom(value, options) {
    return new Atom(value, options);
}

/**
 * Creates a new Computed instance. Computed is a reactive item that holds a value that is computed from other reactive values.
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
function computed(fn, options) {
    return new Computed(fn, options);
}

/**
 * Creates a new reactive Collection instance that holds an array.
 * The Collection provides reactivity for array mutations (push, pop, splice, etc.)
 * and allows subscribing to changes.
 *
 * Unlike the `Atom` and `Computed` factories, this function returns the actual
 * `Collection` instance, not just the proxied array. To access the reactive array,
 * use the `.value` property.
 *
 * @template T
 * @param {T[]} value - The initial array to observe.
 * @param {object} [options] - Configuration options.
 * @param {string} [options.name] - The name of the Collection (used for debugging).
 * @param {(a:T, b:T)=>boolean} [options.compareFunction] - Custom equality function.
 * @returns {Collection<T>} The Collection instance.
 *
 * @example
 * ```js
 * const coll = collection([1, 2, 3]);
 *
 * // Subscribe to changes
 * coll.subscribe(() => console.log('changed'));
 *
 * // Mutate the array via .value
 * coll.value.push(4); // triggers subscriber
 * console.log(coll.value); // [1, 2, 3, 4]
 *
 * // Direct property access also works (proxied)
 * coll.value[0] = 10; // triggers subscriber
 * ```
 */
function collection(value, options) {
    return new Collection(value, options);
}

/**
 * Creates a new reactive ShallowReactive instance that wraps an object.
 * The ShallowReactive provides reactivity for property assignments and deletions
 * on the top level of the object (shallow reactivity).
 *
 * This function returns the actual `ShallowReactive` instance, not just the proxy.
 * To access the reactive object, use the `.value` property.
 *
 * @template T
 * @param {T} value - The object to observe (must be a plain object or an instance).
 * @param {object} [options] - Configuration options.
 * @param {string} [options.name] - The name of the ShallowReactive (used for debugging).
 * @returns {ShallowReactive<T>} The ShallowReactive instance.
 *
 * @example
 * ```js
 * const reactive = shallowReactive({ a: 1, b: 2 });
 *
 * // Subscribe to changes
 * reactive.subscribe(() => console.log('changed'));
 *
 * // Modify the object via .value
 * reactive.value.a = 3; // triggers subscriber
 * console.log(reactive.value); // { a: 3, b: 2 }
 *
 * // Direct property access also works (proxied)
 * reactive.value.b = 5; // triggers subscriber
 * ```
 */
function shallowReactive(value, options) {
    // @ts-ignore
    return new ShallowReactive(value, options);
}

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
function makeObservable(obj, annotations, options) {
    /** @type {{[key:string]:ReactiveItem}} */
    const reactiveStore = {};
    const _options = Object.assign({ name: '' }, options);

    for (const key in annotations) {
        if (annotations[key] === false) {
            continue;
        }

        if (
            /** @type {Array<string|boolean>} */ ([
                'atom',
                'collection',
                'shallowReactive',
            ]).includes(annotations[key])
        ) {
            if (annotations[key] === 'atom') {
                // @ts-ignore
                reactiveStore[key] = new Atom(obj[key], {
                    name: _options.name + '.' + key,
                });
            }

            if (annotations[key] === 'collection') {
                // @ts-ignore
                reactiveStore[key] = new Collection(obj[key], {
                    name: _options.name + '.' + key,
                });
            }

            if (annotations[key] === 'shallowReactive') {
                // @ts-ignore
                reactiveStore[key] = new ShallowReactive(obj[key], {
                    name: _options.name + '.' + key,
                });
            }
            const existingDescriptor = Object.getOwnPropertyDescriptor(obj, key);
            Object.defineProperty(obj, key, {
                get() {
                    return reactiveStore[key].getValue();
                },
                set(value) {
                    // @ts-ignore
                    reactiveStore[key].value = value;
                },
                enumerable: existingDescriptor?.enumerable ?? true,
                configurable: existingDescriptor?.configurable ?? true,
            });
        }
    }
    // @ts-ignore
    const allDescriptors = getAllPropertyDescriptors(obj);

    for (const key in annotations) {
        if (annotations[key] === 'computed') {
            // if class or plain object
            const descriptor = allDescriptors[key];
            //Object.getOwnPropertyDescriptor(obj.prototype || obj, key) || obj[key];  //

            if (descriptor && typeof descriptor.get === 'function') {
                const f = descriptor.get;
                reactiveStore[key] = new Computed(
                    function () {
                        return f.call(obj);
                    },
                    { name: _options.name + '.' + key }
                );
                const existingDescriptor = Object.getOwnPropertyDescriptor(obj, key);
                Object.defineProperty(obj, key, {
                    get() {
                        return reactiveStore[key].getValue();
                    },
                    enumerable: existingDescriptor?.enumerable ?? true,
                    configurable: existingDescriptor?.configurable ?? true,
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
function extendObservable(target, properties, overrides, options) {
    Object.assign(/** @type {T & R} */ (/** @type {unknown} */ (target)), properties);
    makeAutoObservable(target, overrides, options, new Set(Object.keys(properties)));
    return /** @type {T & R} */ (target);
}

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
function makeAutoObservable(obj, overrides = {}, options, filter) {
    const _options = Object.assign({ name: '' }, options);

    // @ts-ignore
    const allDescriptors = getAllPropertyDescriptors(obj);

    /** @type {Set<string>} */
    const atomKeys = new Set();

    /** @type {Set<string>} */
    const computedKeys = new Set();

    Object.entries(allDescriptors).forEach(descriptorObject => {
        const key = descriptorObject[0];
        const descriptor = descriptorObject[1];

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

    /** @type {{[key:string]:"atom"|"computed"|"collection"|"shallowReactive"|false}} */
    let annotations = {};

    let keys = [...atomKeys];
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        if (overrides[key] === false) {
            continue;
        }

        // @ts-ignore
        if (typeof obj[key] === 'function') {
            continue;
        }

        // @ts-ignore
        if (Array.isArray(obj[key])) {
            annotations[key] = 'collection';
            continue;
        }

        // @ts-ignore
        if (isPlainObject(obj[key])) {
            annotations[key] = 'shallowReactive';
            continue;
        }

        annotations[key] = 'atom';
    }

    keys = [...computedKeys];
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        if (overrides[key] === false) {
            continue;
        }

        annotations[key] = 'computed';
    }

    annotations = Object.assign({}, annotations, overrides);

    return makeObservable(obj, annotations, _options);
}

export { Atom, Collection, Computed, ReactiveItem, ReactiveList, ShallowReactive, Store, atom, autorun, batch, collection, computed, extendObservable, fromPromise, getNow, makeAutoObservable, makeObservable, reaction, runInAction, shallowReactive, untrack, waitUntil, when };
