// @ts-check

/**
 * =============================================
 * 4. WaitUntil
 * =============================================
 * waitUntil is a promise-based version of when.
 * It returns a promise that resolves when the predicate becomes true.
 *
 * Useful for:
 * - Async workflows that depend on state changes
 * - Awaiting data loading
 * - Synchronising multiple state conditions
 *
 */

import { Atom, waitUntil } from '@supercat1337/store2';

// Create reactive state
const userLoaded = new Atom(false, { name: 'userLoaded' });
const userData = new Atom(null, { name: 'userData' });

// Simulate async user loading
async function loadUser() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    userData.value = { id: 42, name: 'Alice' };
    userLoaded.value = true;
}

// In an async function, wait for user to be loaded
async function main() {
    console.log('Waiting for user data...');

    // Start loading in background
    loadUser();

    // Wait until userLoaded becomes true
    await waitUntil(() => userLoaded.value === true);

    // Now we have data
    console.log('User data loaded:', userData.value);

    // You can also use waitUntil with timeout
    const loaded = await waitUntil(
        () => userLoaded.value === true,
        { timeout: 2000 } // will resolve with false if not true within 2s
    );
    console.log('Loaded within 2s?', loaded);
}

main();
// Output:
// Waiting for user data...
// (after 500ms)
// User data loaded: { id: 42, name: 'Alice' }
// Loaded within 2s? true
