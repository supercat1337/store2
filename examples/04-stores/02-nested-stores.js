// @ts-check

/**
 * =============================================
 * Nested Stores – hierarchical state management
 * =============================================
 * Store can contain other Stores, creating a nested structure.
 * Changes in nested stores propagate to the parent store.
 *
 * Methods:
 * - removeItem(key) – detaches the item from the store WITHOUT destroying it.
 * - destroyItem(key) – detaches AND destroys the item.
 *
 */

import { Store, atom, shallowReactive } from '@supercat1337/store2';

// Create root store
const rootStore = new Store();

// Create nested stores
const userStore = new Store();
const settingsStore = new Store();

// Add items to nested stores
userStore.addItems({
    name: atom('Alice'),
    age: atom(30),
});

settingsStore.addItems({
    theme: atom('dark'),
    language: atom('en'),
});

// Add nested stores to root
rootStore.addItems({
    user: userStore,
    settings: settingsStore,
});

// Subscribe to root store changes
rootStore.subscribe(updates => {
    console.log('Root store changed:');
    for (const [key, record] of updates) {
        const oldVal =
            typeof record.oldValue === 'object' ? JSON.stringify(record.oldValue) : record.oldValue;
        const newVal =
            typeof record.value === 'object' ? JSON.stringify(record.value) : record.value;
        console.log(`  ${key}: ${record.type} (old: ${oldVal}, new: ${newVal})`);
    }
});

// Change a nested atom – propagates to root
userStore.getItem('name').value = 'Bob';
// Output: Root store changed: user.name: set (old: Alice, new: Bob)

settingsStore.getItem('theme').value = 'light';
// Output: Root store changed: settings.theme: set (old: dark, new: light)

// Access nested value
console.log('User name:', userStore.getItem('name').value); // Bob

// 1. Remove the `user` store from root – detaches but does NOT destroy
rootStore.removeItem('user');
// Output: Root store changed: user: delete (old: undefined, new: undefined)

console.log('After removeItem, userStore still exists:', userStore.isDestroyed); // false
console.log('userStore still has items:', userStore.hasItem('name')); // true

// 2. Destroy the `settings` store – detaches AND destroys
rootStore.destroyItem('settings');
// Output: Root store changed: settings: delete (...)
console.log('After destroyItem, settingsStore is destroyed:', settingsStore.isDestroyed); // true
