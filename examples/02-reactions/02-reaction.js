// @ts-check

/**
 * =============================================
 * 2. Reaction
 * =============================================
 * reaction separates dependency tracking (dataFn) from side-effect (effectFn).
 * This allows you to react to specific dependencies without running
 * the effect on every change.
 *
 * Useful when you want to:
 * - Perform expensive operations only when certain state changes
 * - Avoid running effect on initial call
 * - Control exactly which dependencies trigger the effect
 *
 */

import { Atom, reaction } from '@supercat1337/store2';

// Create atoms
const a = new Atom(0, { name: 'a' });
const b = new Atom(0, { name: 'b' });

// Reaction: when a changes, log both a and b
// b is not tracked – it will not trigger the reaction
reaction(
    () => a.value, // data function – tracks a
    () => {
        console.log(`a = ${a.value}, b = ${b.value}`);
    }
);

// Initially, reaction does NOT run (unlike autorun)

// Change a – reaction runs
a.value = 1; // a = 1, b = 0

// Change b – reaction does NOT run
b.value = 5; // (nothing)

// Change a again – reaction runs
a.value = 2; // a = 2, b = 5

// You can also use an array of dependencies
reaction(
    () => [a.value, b.value], // tracks both a and b
    () => {
        console.log(`Both changed: a=${a.value}, b=${b.value}`);
    }
);

// Now changing either a or b triggers the reaction
a.value = 3; // Both changed: a=3, b=5
b.value = 6; // Both changed: a=3, b=6
