// @ts-check

/**
 * =============================================
 * 1. Autorun
 * =============================================
 * autorun runs a function immediately and re-runs it whenever
 * any reactive dependency used inside changes.
 *
 * Dependencies are collected during the first run.
 * If you conditionally use different dependencies, only those
 * used in the first run will be tracked.
 *
 */

import { Atom, autorun } from '@supercat1337/store2';

// Create atoms
const firstName = new Atom('John', { name: 'firstName' });
const lastName = new Atom('Doe', { name: 'lastName' });

// Autorun logs full name
autorun(() => {
    console.log(`Full name: ${firstName.value} ${lastName.value}`);
});
// Output: Full name: John Doe

// Change first name – autorun re-runs
firstName.value = 'Jane'; // Full name: Jane Doe

// Change last name – autorun re-runs
lastName.value = 'Smith'; // Full name: Jane Smith

// You can also use autorun with cleanup
const unsub = autorun(() => {
    console.log(`Last name: ${lastName.value}`);
});
// Output: Last name: Smith

// Unsubscribe – no more logging
unsub();
lastName.value = 'Brown';
// Output: Full name: Jane Brown
