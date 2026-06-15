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

export const idService = new IdService();
