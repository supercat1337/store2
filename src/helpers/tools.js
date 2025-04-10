// @ts-check

import { idService } from "../services/idService.js";
import { ReactivePrimitive } from "../reactives/reactivePrimitive.js";

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
    let all = new Set();
    items.forEach((item) => {
        if (!(item instanceof Set)) {
            all.add(item);
        } else {
            item.forEach((i) => all.add(i));
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
export function compareAny(a, b) {
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
export function debounce(func, wait) {
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
export function clone(obj) {
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
 * A Promise-based sleep function.
 * @param {number} ms - The amount of milliseconds to sleep for.
 * @returns {Promise<void>}
 */
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Gets all property descriptors of an object, including its prototype and all its ancestors.
 * The descriptors are returned as a plain object.
 * @param {Object} obj - The object to get the property descriptors from.
 * @returns {{[x: string]: TypedPropertyDescriptor<any>;} & { [x: string]: PropertyDescriptor;}} A plain object with all property descriptors of the object.
 */
export function getAllPropertyDescriptors(obj) {
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
