/**
 * =============================================
 * 3. Batching Updates
 * =============================================
 * batch() groups multiple mutations into a single notification cycle.
 * Nested batches are supported – only the outermost batch triggers notifications.
 *
 * Use cases:
 * - Performance: reduce number of subscriber calls
 * - Consistency: avoid intermediate states
 *
 */

import { Atom, Computed, batch } from '@supercat1337/store2';

// Create reactive state
const a = new Atom(0, { name: 'a' });
const b = new Atom(0, { name: 'b' });
const sum = new Computed(() => a.value + b.value, { name: 'sum' });

// Subscribe to sum changes
let callCount = 0;
sum.subscribe(() => {
    callCount++;
    console.log(`Sum changed: ${sum.value} (call #${callCount})`);
});

// Without batch – each mutation triggers a notification
console.log('--- Without batch ---');
a.value = 1; // Sum: 1 (call #1)
b.value = 2; // Sum: 3 (call #2)

// With batch – only one notification
console.log('--- With batch ---');
batch(() => {
    a.value = 3;
    b.value = 4;
    // No notification yet
});
// After batch ends: Sum: 7 (call #3)

// Nested batch – still only one notification
console.log('--- Nested batch ---');
batch(() => {
    a.value = 5;
    batch(() => {
        b.value = 6;
    });
    // No notification yet
});
// After outer batch ends: Sum: 11 (call #4)

console.log(`Total subscriber calls: ${callCount}`); // 4
