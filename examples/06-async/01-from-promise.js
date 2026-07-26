// @ts-check

/**
 * =============================================
 * fromPromise – observe a Promise reactively
 * =============================================
 * fromPromise wraps a Promise and provides a `.case()` method
 * to react to `pending`, `resolved`, and `rejected` states.
 *
 * IMPORTANT: Inside `resolved` and `rejected` callbacks, the code runs
 * in `subscribersMode`, so you cannot mutate reactive state directly.
 * Use `runInAction` to defer mutations.
 *
 */

import { atom, fromPromise, runInAction } from '@supercat1337/store2';

// Reactive state
const status = atom('idle'); // 'idle' | 'loading' | 'success' | 'error'
const userData = atom(null);
const errorMessage = atom(null);

// Simulate fetching user data
const fetchUser = () => {
    return new Promise((resolve, reject) => {
        console.log('Loading user...');
        // Simulate async request
        setTimeout(() => {
            const success = Math.random() > 0.3; // 70% chance of success
            if (success) {
                resolve({ id: 1, name: 'Alice', email: 'alice@example.com' });
            } else {
                reject(new Error('Failed to fetch user'));
            }
        }, 1500);
    });
};

// Subscribe to status changes for UI feedback
status.subscribe(() => {
    console.log(`Status: ${status.value}`);
});

// Create observable from promise
const promise = fetchUser();
const observable = fromPromise(promise);

// Handle all promise states reactively
await observable.case({
    pending: () => {
        // Inside `pending` we can mutate state directly because
        // it runs before the promise settles (no subscribersMode yet)
        status.value = 'loading';
        console.log('⏳ Loading...');
    },
    resolved: (data) => {
        // Inside `resolved` we are in `subscribersMode`
        // so we must use `runInAction` to mutate state
        runInAction(() => {
            status.value = 'success';
            userData.value = data;
            errorMessage.value = null;
        });
        console.log('User loaded:', data);
    },
    rejected: (error) => {
        // Inside `rejected` we also need `runInAction`
        runInAction(() => {
            status.value = 'error';
            errorMessage.value = error.message;
            userData.value = null;
        });
        console.error('Error:', error.message);
    },
});

// After all states are handled, we can react to the final state
// (but note: the promise is already settled)
console.log('Final user data:', userData.value);