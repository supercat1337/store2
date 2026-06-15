// @ts-check

/**
 * BatchSnapshot stores the original values of properties at the start of a batch operation.
 * It allows detecting which properties have actually changed after a series of mutations
 * inside a batch, and whether they have reverted to their original values.
 */
export class BatchSnapshot {
    /**
     * Map storing original values for each property key.
     * @type {Map<string, any>}
     */
    #initialValues = new Map();

    /**
     * Reference to the reactive item this snapshot belongs to.
     * Used to access the equality comparison function.
     * @type {ReactivePrimitive}
     */
    #reactiveItem;

    /**
     * Creates a new BatchSnapshot instance.
     * @param {ReactivePrimitive} reactiveItem - The reactive item to snapshot.
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
