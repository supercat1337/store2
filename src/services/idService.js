// @ts-check

/**
 * A class representing an id for a reactive item.
 */
export class ItemId {
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

export const idService = new IdService();
