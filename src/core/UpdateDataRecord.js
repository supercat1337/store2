// @ts-check

export class UpdateDataRecord {
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
