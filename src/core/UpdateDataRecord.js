// @ts-check

/**
 * A single mutation state passed to subscribers.
 *
 * Every entry in the `updates` map received by a subscriber is an instance
 * of this class.
 *
 * @public
 */
export class UpdateDataRecord {
    /** @type {"set"|"delete"} */
    type;

    /** @type {any} */
    value;

    /** @type {any} */
    oldValue;

    /** @type {import('../reactives/ReactiveItem.js').ReactiveItem|undefined} */
    reactiveItem;

    /**
     * Creates a new update record.
     *
     * @param {"set"|"delete"} type - The operation that produced the change.
     * @param {any} oldValue - Value before the change.
     * @param {any} value - Value after the change.
     * @param {import('../reactives/ReactiveItem.js').ReactiveItem} [reactiveItem] - The reactive item that triggered the update.
     */
    constructor(type, oldValue, value, reactiveItem) {
        this.type = type;
        this.oldValue = oldValue;
        this.value = value;
        this.reactiveItem = reactiveItem;
    }
}

export class UpdateDataRecordManager {
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
        this.data.set(itemName, new UpdateDataRecord('delete', undefined, undefined, undefined));

        /** @type {string[]} */
        const keysToDelete = [];

        this.data.forEach((item, key) => {
            if (key.startsWith(itemName + '.')) {
                keysToDelete.push(key);
            }
        });

        keysToDelete.forEach(key => {
            this.data.delete(key);
        });
    }
}
