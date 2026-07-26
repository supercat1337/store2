// @ts-check

/**
 * =============================================
 * 4. Untracking Dependencies
 * =============================================
 * untrack() executes a function without tracking reactive dependencies.
 * Useful for accessing values without creating a dependency relationship.
 *
 * Use cases:
 * - Reading values inside computed without triggering recalc
 * - Avoiding circular dependencies
 * - Performance optimization (skip unnecessary tracking)
 *
 */

import { Atom, Computed, untrack, autorun } from '@supercat1337/store2';

// Create atoms
const a = new Atom(1, { name: 'a' });
const b = new Atom(2, { name: 'b' });

// Computed that uses untrack to read b without creating dependency
const c = new Computed(
    () => {
        // a is tracked normally
        const valA = a.value;
        // b is read without tracking
        const valB = untrack(() => b.value);
        return valA + valB;
    },
    { name: 'c' }
);

// Subscribe to c
c.subscribe(() => {
    console.log(`c = ${c.value}`);
});

console.log(`Initial c: ${c.value}`); // 3

// Change a – triggers c recalculation (a is a dependency)
a.value = 5; // c = 7

// Change b – does NOT trigger c recalculation (b is not tracked)
b.value = 10; // (no logging)

// However, if we read c again, it will recompute with current values
console.log(`c after b change: ${c.value}`); // 15 (5 + 10)

// untrack is also useful in autorun to avoid unnecessary reactions
let runCount = 0;
autorun(() => {
    runCount++;
    const valA = a.value;
    const valB = untrack(() => b.value);
    console.log(`Autorun: a=${valA}, b=${valB} (run #${runCount})`);
});
// Output: Autorun: a=5, b=10 (run #1)

a.value = 6; // triggers autorun: Autorun: a=6, b=10 (run #2)
b.value = 20; // does NOT trigger autorun (b is untracked)

console.log(`Autorun runs: ${runCount}`); // 2
