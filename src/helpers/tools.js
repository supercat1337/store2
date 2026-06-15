// @ts-check

import { ReactivePrimitive } from '../reactives/ReactivePrimitive.js';
import { idService } from '../services/idService.js';

/**
 * Sorts reactive items by their internal id. This is used to
 * ensure that reactive items are processed in a consistent order
 * when they are notified of changes.
 * @param {ReactivePrimitive} a - The first item to compare
 * @param {ReactivePrimitive} b - The second item to compare
 * @returns {number} -1 if a should come before b, 0 if a and b are equal, 1 if a should come after b
 */
export function sortReactiveItems(a, b) {
    return idService.compareIds(a.engine.id, b.engine.id);
}

/**
 * Combines multiple reactive items or sets of reactive items into a single set,
 * ensuring that each item appears only once. The combined set is then converted
 * to an array and sorted by the internal id of the reactive items.
 *
 * @param {...(ReactivePrimitive|Set<ReactivePrimitive>)} items - Reactive items or sets of reactive items to combine and sort.
 * @returns {Array<ReactivePrimitive>} A sorted array of unique reactive items.
 */

export function getSortedReactiveItems(...items) {
    const all = new Set();
    items.forEach(item => {
        if (!(item instanceof Set)) {
            all.add(item);
        } else {
            item.forEach(i => all.add(i));
        }
    });

    return Array.from(all).sort(sortReactiveItems);
}

/**
 * Checks if a given value is a plain object.
 * @param {*} obj - The value to check.
 * @returns {boolean} true if the value is a plain object, false otherwise.
 */
export function isPlainObject(obj) {
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
export function compareAny(a, b) {
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
export function debounce(func, wait) {
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
export function clone(obj) {
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
 * A Promise-based sleep function.
 * @param {number} ms - The amount of milliseconds to sleep for.
 * @returns {Promise<void>}
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Gets all property descriptors of an object, including its prototype and all its ancestors.
 * The descriptors are returned as a plain object.
 * @param {object} obj - The object to get the property descriptors from.
 * @param {number} [depth=0]
 * @param {number} [maxDepth=100]
 * @returns {{[x: string]: TypedPropertyDescriptor<any>;} & { [x: string]: PropertyDescriptor;}} A plain object with all property descriptors of the object.
 */
export function getAllPropertyDescriptors(obj, depth = 0, maxDepth = 100) {
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
export function getError(e) {
    return e instanceof Error ? e : new Error(String(e));
}

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
export function getItemNamesFromSet(
    items,
    options = { includeId: false, fallback: 'unnamed', sorted: true }
) {
    const { includeId = false, fallback = 'unnamed', sorted = true } = options;

    const result = [];

    for (const item of items) {
        if (!(item instanceof ReactivePrimitive)) {
            continue;
        }

        const namePart = item.name && item.name.trim() !== '' ? item.name : fallback;
        if (includeId) {
            result.push(`${namePart}:${item.engine.id}`);
        } else {
            result.push(namePart);
        }
    }

    if (sorted) {
        result.sort((a, b) => a.localeCompare(b));
    }

    return result;
}
