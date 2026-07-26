// @ts-check

/**
 * =============================================
 * ShallowReactive – shallow reactive object via Proxy
 * =============================================
 * ShallowReactive tracks changes only at the top level of an object.
 * Nested properties are NOT reactive.
 *
 * Use `.value` to access the proxied object.
 * Mutations like `state.value.key = newValue` or `delete state.value.key` trigger reactivity.
 *
 */

import { ShallowReactive } from '@supercat1337/store2';

// Create a shallow reactive object
const state = new ShallowReactive(
    {
        user: { name: 'Alice', age: 30 },
        loggedIn: false,
    },
    { name: 'state' }
);

// Subscribe to top-level changes
state.subscribe(updates => {
    console.log('State changed:');
    for (const [key, record] of updates) {
        // Use JSON.stringify to show objects properly
        const oldVal =
            record.oldValue !== undefined ? JSON.stringify(record.oldValue) : 'undefined';
        const newVal = record.value !== undefined ? JSON.stringify(record.value) : 'undefined';
        console.log(`  ${key}: ${record.type} (old: ${oldVal}, new: ${newVal})`);
    }
});

// Change a top-level property
state.value.loggedIn = true;
// Output: State changed: loggedIn: set (old: false, new: true)

// Replace the entire `user` object (top-level change)
state.value.user = { name: 'Bob', age: 25 };
// Output: State changed: user: set (old: {"name":"Alice","age":30}, new: {"name":"Bob","age":25})

// Mutate nested property – this does NOT trigger reactivity
state.value.user.age = 40;
// No output because it's a nested mutation (not tracked)

// However, if we replace the whole object again, it triggers
state.value.user = { name: 'Charlie', age: 40 };
// Output: State changed: user: set (old: {"name":"Bob","age":25}, new: {"name":"Charlie","age":40})

// Read the current state
console.log('User info:', state.value.user.name, '(' + state.value.user.age + ')');
// Expected: Charlie (40)

// Delete a top-level property
delete state.value.loggedIn;
// Output: State changed: loggedIn: delete (old: true, new: undefined)
