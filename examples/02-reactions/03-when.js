/**
 * =============================================
 * when – conditional reaction
 * =============================================
 * when(predicate, effect) runs `effect` once when `predicate` becomes true.
 * It automatically unsubscribes after the effect runs.
 *
 * IMPORTANT: Mutating reactive state inside the effect is not allowed because
 * the effect runs inside `subscribersMode`. To safely change state, wrap the
 * mutation with `runInAction`.
 *
 */

import { atom, when, runInAction } from '@supercat1337/store2';

// Create a reactive atom with initial value 1
const data = atom(1);

console.log('init data:', data.value); // 1

// Subscribe to changes of `data` for debugging
data.subscribe(() => {
    console.log(`data = ${data.value}`);
});

// Simulate an async operation that changes `data` after 1 second
setTimeout(() => {
    data.value = 2; // triggers the `when` condition
}, 1000);

// Wait until `data.value > 1` becomes true, then run the effect
when(
    () => data.value > 1,
    () => {
        // Inside the effect we cannot directly mutate reactive state.
        // `runInAction` defers the mutation until `subscribersMode` ends.
        runInAction(() => {
            data.value = 3;
        });
        console.log('Data loaded:', data.value);
    }
);

// Expected output:
// init data: 1
// (after 1 second) data = 2
// Data loaded: 3
// (then) data = 3
