// @ts-check

/**
 * =============================================
 * 1. makeObservable (Manual Annotations)
 * =============================================
 * makeObservable turns an existing object or class into a reactive one.
 * You explicitly declare which properties should be reactive.
 *
 * Annotations:
 * - 'atom' – a simple value
 * - 'computed' – a getter that depends on other reactive values
 * - 'collection' – an array (wrapped in Collection)
 * - 'shallowReactive' – an object (wrapped in ShallowReactive)
 * - false – exclude from reactivity
 *
 */

import { makeObservable, autorun } from '@supercat1337/store2';

class Person {
    constructor(name, age) {
        // Plain properties
        this.name = name;
        this.age = age;
        this._secret = 'hidden'; // not reactive

        // Mark properties as reactive
        makeObservable(this, {
            name: 'atom',
            age: 'atom',
            fullName: 'computed',
        });
    }

    // Computed getter – will be reactive
    get fullName() {
        return `${this.name} (${this.age})`;
    }

    // Method – not reactive, but can be called
    celebrateBirthday() {
        this.age++;
    }
}

const person = new Person('Alice', 30);

// Subscribe to fullName changes
autorun(() => {
    console.log(`Full name: ${person.fullName}`);
});
// Output: Full name: Alice (30)

// Change name – triggers autorun
person.name = 'Bob';
// Output: Full name: Bob (30)

// Change age – triggers autorun
person.age = 31;
// Output: Full name: Bob (31)

// Non-reactive property – no effect
person._secret = 'public'; // No output
