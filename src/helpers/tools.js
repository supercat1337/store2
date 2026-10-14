// @ts-check

/**
 * Sorts reactive items by their internal id. This is used to
 * ensure that reactive items are processed in a consistent order
 * when they are notified of changes.
 * @param {import('../reactives/ReactiveItem.js').ReactiveItem} a
 * @param {import('../reactives/ReactiveItem.js').ReactiveItem} b
 * @returns {number} -1 if a should come before b, 0 if a and b are equal, 1 if a should come after b
 */
export function sortReactiveItems(a, b) {
    const idA = a.engine.id;
    const idB = b.engine.id;
    return idA < idB ? -1 : idA > idB ? 1 : 0;
}

/**
 * Combines multiple reactive items or sets of reactive items into a single set,
 * ensuring that each item appears only once. The combined set is then converted
 * to an array and sorted by the internal id of the reactive items.
 *
 * @param {...(import('../reactives/ReactiveItem.js').ReactiveItem | Set<import('../reactives/ReactiveItem.js').ReactiveItem>)} items
 * @returns {Array<import('../reactives/ReactiveItem.js').ReactiveItem>}
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
 * @param {*} obj
 * @returns {boolean} true if the value is a plain object, false otherwise.
 */
export function isPlainObject(obj) {
    return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

/**
 * Checks if two arrays are equal. If the arrays are not the same length, then this function returns false.
 * Otherwise, this function checks if each element of the two arrays is equal, using the compareAny function.
 * @param {any[]} a
 * @param {any[]} b
 * @returns {boolean}
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
 * Checks if two plain objects are equal.
 * @param {object} a
 * @param {object} b
 * @returns {boolean}
 */
export function comparePlainObjects(a, b) {
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
 * Checks if two values are equal.
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

    if (Array.isArray(a) || Array.isArray(b)) {
        if (!(Array.isArray(a) && Array.isArray(b))) {
            return false;
        }

        return compareArrays(a, b);
    }

    // @ts-ignore
    return comparePlainObjects(a, b);
}

/**
 * Debounce function.
 * @template {Function} T
 * @param {T} func
 * @param {number} wait
 * @returns {T}
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
 * Clones an object shallowly.
 * @template T
 * @param {T} obj
 * @returns {T}
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
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Gets all property descriptors of an object, including its prototype and all its ancestors.
 * The descriptors are returned as a plain object.
 * @param {object | null | undefined} obj
 * @param {number} [depth=0]
 * @param {number} [maxDepth=100]
 * @returns {{[x: string]: PropertyDescriptor}}
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
 * @param {unknown} e
 * @returns {Error}
 */
export function getError(e) {
    return e instanceof Error ? e : new Error(String(e));
}

/**
 * Extracts names (and optionally ids) from a Set of reactive items.
 *
 * Uses duck typing (`item.engine && item.name`) to avoid importing from
 * `reactives/` — that keeps `tools.js` free of circular dependencies.
 *
 * @param {Set<import('../reactives/ReactiveItem.js').ReactiveItem> | Iterable<import('../reactives/ReactiveItem.js').ReactiveItem>} items
 * @param {{includeId?: boolean, fallback?: string, sorted?: boolean}} [options]
 * @returns {string[]}
 */
export function getItemNamesFromSet(
    items,
    options = { includeId: false, fallback: 'unnamed', sorted: true }
) {
    const { includeId = false, fallback = 'unnamed', sorted = true } = options;

    const result = [];

    for (const item of items) {
        if (!item || !item.engine) {
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
