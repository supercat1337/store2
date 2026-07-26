// @ts-check

/**
 * =============================================
 * 2. getNow (Reactive Current Time)
 * =============================================
 * getNow returns an Atom that automatically updates to the current time
 * at a given interval (in milliseconds) when there are subscribers.
 *
 * The timer stops when there are no subscribers, and the value resets to 0.
 *
 * Use cases:
 * - Real-time clock displays
 * - Timers and countdowns
 * - Periodic updates
 *
 */

import { getNow, autorun } from '@supercat1337/store2';

// Create an Atom with current time, updating every 500ms
const now = getNow(500);

// Subscribe – timer starts
const unsubscribe = now.subscribe(() => {
    const date = new Date(now.value);
    console.log(`Current time: ${date.toLocaleTimeString()}`);
});

// Initially, value is 0 until the first tick
console.log('Initial value:', now.value); // 0

// After 500ms, first update
// After another 500ms, second update, etc.

// Stop subscription – timer stops
setTimeout(() => {
    console.log('Unsubscribing...');
    unsubscribe();
    // Now the timer stops and value resets to 0 after a short delay
    setTimeout(() => {
        console.log('After unsubscribe:', now.value); // 0
    }, 600);
}, 2000);

// You can also use getNow in a computed
import { computed } from '@supercat1337/store2';

const currentTime = getNow(1000);
const timeDisplay = computed(() => {
    const date = new Date(currentTime.value);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
});

// Subscribe to formatted time
autorun(() => {
    console.log(`Formatted time: ${timeDisplay.value}`);
});
