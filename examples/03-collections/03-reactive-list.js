// @ts-check
/**
 * =============================================
 * 3. ReactiveList (Array-like List of Items)
 * =============================================
 * ReactiveList is a reactive list that stores values (primitives or objects).
 * It provides methods to add, remove, update, and clear items.
 *
 * Key differences from Collection:
 * - Collection uses a proxy to intercept array methods (push, pop, etc.)
 * - ReactiveList provides explicit methods (add, setItem, removeRange)
 * - ReactiveList automatically wraps objects in ShallowReactive and primitives in Atom
 *
 */

import { ReactiveList } from '@supercat1337/store2';

// Create a reactive list
const list = new ReactiveList();

// Subscribe to changes
list.subscribe(updates => {
    console.log('List changed:');
    for (const [key, record] of updates) {
        console.log(`  ${key}: ${record.type} (old: ${record.oldValue}, new: ${record.value})`);
    }
    console.log(`  Current length: ${list.length}`);
});

// Add items (primitives are stored in Atom, objects in ShallowReactive)
list.add(10, { name: 'Alice' }, 20);
// Output: List changed: ... (multiple updates)

// Get an item by index
const item = list.getItem(1);
console.log('Item at index 1:', item); // { name: 'Alice' }

// Mutate an object from the list – triggers reactivity
item.name = 'Bob';
// Output: List changed: 1.name: set (old: Alice, new: Bob)

// Set an item (replaces value)
list.setItem(0, 100);
// Output: List changed: 0: set (old: 10, new: 100)

// Remove range
list.removeRange(1, 2); // remove indices 1 and 2
// Output: List changed: ... (length update, etc.)

// Remove first item
list.removeFirstItem();

// Remove last item
list.removeLastItem();

// Clear all
list.clear();

console.log('Final length:', list.length); // 0

// You can also replace entire content
list.setItems([1, 2, 3]);
console.log('After setItems:', list.toArray()); // [1, 2, 3]
