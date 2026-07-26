// @ts-check

/**
 * =============================================
 * 1. Store (Container for Reactive Items)
 * =============================================
 * Store is a container that groups multiple reactive items (atoms, computed, stores).
 * It notifies subscribers about any changes to its child items.
 *
 * Key features:
 * - Add/remove items by key
 * - Subscribe to all changes in one place
 * - Mute/unmute updates
 * - Nested stores
 *
 */

import { Store, Atom, Computed } from '@supercat1337/store2';

// Create a store
const store = new Store();

// Create reactive items
const name = new Atom('Alice', { name: 'name' });
const age = new Atom(30, { name: 'age' });
const fullName = new Computed(() => `${name.value} (${age.value})`, { name: 'fullName' });

// Add items to store
store.addItems({ name, age, fullName });

// Subscribe to store changes
store.subscribe(updates => {
    console.log('Store changed:');
    for (const [key, record] of updates) {
        console.log(`  ${key}: ${record.type} (${record.oldValue} -> ${record.value})`);
    }
});

// Change an item – store notifies
name.value = 'Bob';
// Output:
// Store changed:
//   name: set (Alice -> Bob)
//   fullName: set (Alice (30) -> Bob (30))

age.value = 31;
// Output:
// Store changed:
//   age: set (30 -> 31)
//   fullName: set (Bob (30) -> Bob (31))

// Mute updates – batch multiple changes
store.muteUpdates();
name.value = 'Charlie';
age.value = 25;
store.unmuteUpdates();
// Output: (after unmute, single notification with both changes)
// Store changed:
//   name: set (Bob -> Charlie)
//   age: set (31 -> 25)
//   fullName: set (Bob (31) -> Charlie (25))

// Remove an item
store.removeItem('name');
// Now name and fullName are removed from store

// Check if item exists
console.log('Has name?', store.hasItem('name')); // false
console.log('Has age?', store.hasItem('age')); // true
