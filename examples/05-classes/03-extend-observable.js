// @ts-check

/**
 * =============================================
 * 3. extendObservable (Adding Reactive Properties)
 * =============================================
 * extendObservable adds new reactive properties to an existing observable object.
 *
 * Useful for:
 * - Adding state dynamically
 * - Extending classes with new reactive fields
 * - Mixing reactivity into plain objects
 *
 */

import { extendObservable, makeAutoObservable, autorun } from '@supercat1337/store2';

// Example 1: Adding a reactive property to a class instance
class User {
    constructor(name) {
        this.name = name;
        makeAutoObservable(this);
    }

    get greeting() {
        return `Hello, ${this.name}`;
    }
}

const user = new User('Alice');

// Later, add a new reactive property 'age'
extendObservable(user, { age: 30 });

autorun(() => {
    console.log(`${user.name} is ${user.age} years old`);
});
// Output: Alice is 30 years old

user.age = 31;
// Output: Alice is 31 years old

// Example 2: Adding reactive properties to a plain object
const settings = { theme: 'dark' };
makeAutoObservable(settings);

// Extend with new properties
extendObservable(settings, { notifications: true });

autorun(() => {
    console.log(`Theme: ${settings.theme}, Notifications: ${settings.notifications}`);
});
// Output: Theme: dark, Notifications: true

settings.notifications = false;
// Output: Theme: dark, Notifications: false

// Example 3: Override annotations
const state = { count: 0, label: 'Counter' };
makeAutoObservable(state);

// Extend and override type
extendObservable(state, { items: [1, 2, 3] }, { items: 'collection' });
// Now items will be a reactive Collection

autorun(() => {
    console.log(`Items length: ${state.items.length}`);
});
// Output: Items length: 3

state.items.push(4);
// Output: Items length: 4