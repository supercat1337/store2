// @ts-check

/**
 * =============================================
 * Collection – reactive array via Proxy
 * =============================================
 * Collection wraps an array and makes all mutations reactive.
 * You can use standard array methods: push, pop, splice, index assignment, etc.
 *
 * Access the reactive array via `.value` property.
 * Subscribe to changes with `.subscribe()`.
 *
 */

import { Collection, computed } from '@supercat1337/store2';

// Create a reactive collection from an array
const numbers = new Collection([1, 2, 3], { name: 'numbers' });

// Subscribe to all changes in the collection
numbers.subscribe(updates => {
    console.log('Collection changed:');
    for (const [key, record] of updates) {
        console.log(`  ${key}: ${record.type} (old: ${record.oldValue}, new: ${record.value})`);
    }
});

// Computed value: sum of all elements
const sum = computed(() => {
    let total = 0;
    // `.value` gives the proxied array – use forEach to iterate safely
    numbers.value.forEach(num => {
        total += num;
    });
    return total;
});

sum.subscribe(() => {
    console.log(`Sum: ${sum.value}`);
});

// Push new element
numbers.value.push(4);
// Output:
// Collection changed:
//   length: set (old: 3, new: 4)
//   3: set (old: undefined, new: 4)
// Sum: 10

// Update existing element
numbers.value[0] = 10;
// Output:
// Collection changed:
//   0: set (old: 1, new: 10)
// Sum: 13

// Pop element
numbers.value.pop();
// Output:
// Collection changed:
//   3: delete (old: 4, new: undefined)
//   length: set (old: 4, new: 3)
// Sum: 12

// Iterate over the current state using forEach (safer than for...of)
console.log('Current values:');
numbers.value.forEach(item => {
    console.log(`  ${item}`);
});
// Expected: 10, 2, 3
