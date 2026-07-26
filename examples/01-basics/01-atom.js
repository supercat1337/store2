// @ts-check

/**
 * =============================================
 * 1. Basic Atom
 * =============================================
 * Atom is a reactive container for a single value.
 * When the value changes, all subscribers are notified.
 *
 * Key methods:
 * - .value – get/set the current value
 * - .subscribe(fn) – subscribe to changes
 * - .onHasSubscribers(fn) – fires when first subscriber appears
 * - .onNoSubscribers(fn) – fires when last subscriber leaves
 *
 */

import { Atom } from '@supercat1337/store2';

// Create an atom with initial value 0
const counter = new Atom(0, { name: 'counter' });

// Subscribe to changes
const unsubscribe = counter.subscribe(updates => {
    // updates is a Map<string, UpdateDataRecord> containing change details
    console.log(`Counter changed: ${counter.value}`);
});

// Change value – subscriber is called
counter.value = 1; // Counter changed: 1

// Unsubscribe
unsubscribe();

// Now changes are not logged
counter.value = 2; // (nothing logged)

// Check if there are subscribers
console.log('Has subscribers:', counter.hasSubscribers()); // false

// Clear all subscribers (if needed)
counter.clearSubscribers();
