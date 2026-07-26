// @ts-check
/**
 * =============================================
 * 2. Computed Values
 * =============================================
 * Computed derives its value from other reactive sources.
 * It caches the result and only recomputes when dependencies change.
 *
 * Key methods:
 * - .value – get the current computed value
 * - .subscribe(fn) – subscribe to changes
 * - .peekValue() – get cached value without tracking dependencies
 *
 */

import { Atom, Computed } from '@supercat1337/store2';

// Create two atoms
const price = new Atom(10, { name: 'price' });
const quantity = new Atom(2, { name: 'quantity' });

// Create a computed value for total price
const total = new Computed(() => price.value * quantity.value, {
    name: 'total',
});

// Subscribe to total changes
const unsubscribe = total.subscribe(() => {
    console.log(`Total: ${total.value}`);
});

// Initially total is 10 * 2 = 20
// Subscriber fires immediately? Actually, Computed subscribers fire when value changes.
// But initial value is computed on creation; subscriber only fires on changes.
// To see initial value, we can log it manually.
console.log(`Initial total: ${total.value}`); // 20

// Change price – total recomputes and subscriber fires
price.value = 15; // Total: 30

// Change quantity – total recomputes
quantity.value = 3; // Total: 45

// Unsubscribe
unsubscribe();

// No more logging
price.value = 20;
