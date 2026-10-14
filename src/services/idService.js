// @ts-check

/**
 * Service that generates unique numeric identifiers for reactive items.
 *
 * Each context owns its own instance so that ordering stays deterministic
 * inside one store tree and isolated between contexts (SSR, tests, etc.).
 */
class IdService {
    /** @type {number} */
    #counter = 0;

    /**
     * Generates a new unique numeric identifier.
     * @returns {number} A monotonic unique number.
     */
    generateId() {
        return this.#counter++;
    }

    /**
     * Compares two numeric identifiers.
     * @param {number} a
     * @param {number} b
     * @returns {number} -1 if a < b, 1 if a > b, 0 if equal.
     */
    compareIds(a, b) {
        if (a < b) {
            return -1;
        }
        if (a > b) {
            return 1;
        }
        return 0;
    }

    /**
     * Resets the internal counter. Useful in tests.
     */
    reset() {
        this.#counter = 0;
    }
}

/**
 * Default process-wide instance. Kept for backward compatibility; new code
 * should obtain an instance via a `Store2Context`.
 */
const idService = new IdService();

export { IdService, idService };
