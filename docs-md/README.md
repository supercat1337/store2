@supercat1337/store2 / [Modules](modules.md)

# @supercat1337/store2

A lightweight, efficient, and fully reactive state management library for JavaScript.

[![npm version](https://badge.fury.io/js/%40supercat1337%2Fstore2.svg)](https://www.npmjs.com/package/@supercat1337/store2)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Features

- **MobX-inspired mental model** – predictable transparent reactive graph, but lightweight and dependency‑free
- **Reactive primitives** – `Atom`, `Computed`, `Collection`, `ShallowReactive`
- **Reactive containers** – `Store` (key‑value store) and `ReactiveList` (array‑like list)
- **Declarative APIs** – `autorun`, `reaction`, `when`, `waitUntil`
- **Batched updates** – group changes with `batch()` to reduce notifications
- **Observable objects** – `makeObservable`, `makeAutoObservable`, `extendObservable`
- **Promise integration** – `fromPromise` to observe pending/resolved/rejected states
- **Tiny and fast** – no external runtime dependencies (except tiny event‑emitter helpers)
- **Fully typed** – via JSDoc and generated `.d.ts` files

---

## Installation

```bash
npm install @supercat1337/store2
```

---

## Quick Start

```js
import { atom, computed, autorun, batch } from '@supercat1337/store2';

// Create reactive atoms
const price = atom(10);
const quantity = atom(2);

// Compute total reactively
const total = computed(() => price.value * quantity.value);

// Autorun – runs whenever its dependencies change
autorun(() => {
    console.log(`Total: ${total.value}`);
});
// Logs: Total: 20

// Update state – autorun fires automatically
price.value = 15; // Logs: Total: 30
quantity.value = 3; // Logs: Total: 45

// Batch multiple updates – only one notification
batch(() => {
    price.value = 20;
    quantity.value = 4;
});
// Logs: Total: 80 (only once)
```

### Simple DOM Binding Example

```js
const count = atom(0);
const btn = document.getElementById('counter-btn');

autorun(() => {
    btn.textContent = `Clicks: ${count.value}`;
});

btn.addEventListener('click', () => count.value++);
```

---

## Core Concepts

### Atoms

An `Atom` holds a single value. It is the most basic reactive unit.

```js
const count = atom(0);
count.subscribe(() => console.log('count changed:', count.value));
count.value++; // triggers the subscriber
```

### Computed

A `Computed` derives its value from other reactive sources. It caches the result and updates only when dependencies change.

```js
const a = atom(2);
const b = atom(3);
const sum = computed(() => a.value + b.value);
console.log(sum.value); // 5
a.value = 5; // sum is automatically recalculated
console.log(sum.value); // 8
```

### Collection

A `Collection` wraps an array and makes its mutations (push, pop, splice, index assignment) reactive.

```js
import { collection } from '@supercat1337/store2';

const items = collection([1, 2, 3]);
items.subscribe(() => console.log('array changed'));
items.value.push(4); // triggers notification
console.log(items.value); // [1, 2, 3, 4]
```

### ShallowReactive

`shallowReactive` turns a plain object into a reactive proxy. Only direct property changes are tracked (nested objects are not made reactive).

```js
import { shallowReactive } from '@supercat1337/store2';

const state = shallowReactive({ name: 'Alice', age: 30 });
state.subscribe(() => console.log('state updated'));
state.age = 31; // triggers notification
```

---

## Reactive Containers

### Store

`Store` is a key‑value container that can hold any reactive items (atoms, computeds, collections, other stores). It batches updates and notifies subscribers about changes.

```js
import { Store, atom, computed } from '@supercat1337/store2';

const store = new Store();
const x = atom(1);
const y = atom(2);
const z = computed(() => x.value + y.value);

store.addItems({ x, y, z });

store.subscribe(updates => {
    console.log('Changed:', Array.from(updates.keys()));
});

x.value = 10; // triggers subscriber with updates: ['x', 'z']
```

You can also mute/unmute notifications temporarily:

```js
store.muteUpdates();
x.value = 100;
y.value = 200;
store.unmuteUpdates(); // only one notification with both changes
```

### ReactiveList

`ReactiveList` is a reactive array‑like list. It automatically wraps primitives in `Atom` and objects in `ShallowReactive`. It provides methods to add, remove, update, and clear items.

```js
import { ReactiveList } from '@supercat1337/store2';

const list = new ReactiveList();
list.subscribe(() => console.log('list changed'));

list.add(1, 2, 3); // primitives → Atoms
list.setItem(1, 42); // update value at index 1
list.removeItem(0); // remove first element
console.log(list.toArray()); // [42, 3]
```

---

## Advanced APIs

### `autorun(fn, options)`

Runs `fn` immediately and re‑runs it whenever any reactive value used inside changes. Dependencies are collected **only during the first run**.

```js
const a = atom(1);
const b = atom(2);
autorun(() => {
    console.log(a.value + b.value);
});
// Output: 3
a.value = 5; // Output: 7
```

### `reaction(dataFn, effectFn, options)`

Tracks dependencies inside `dataFn` and runs `effectFn` whenever those dependencies change. Useful when you need to react to a subset of state.

```js
reaction(
    () => [a.value, b.value],
    () => console.log('a or b changed')
);
```

### `batch(fn)`

Groups multiple updates into a single notification. Nested batches are supported.

```js
batch(() => {
    a.value = 10;
    b.value = 20;
});
// only one notification (if any subscriber exists)
```

### `when(predicate, effect, options)`

Waits for `predicate` to become true, then runs `effect` once and automatically unsubscribes.

```js
const ready = atom(false);
when(
    () => ready.value === true,
    () => {
        console.log('Ready!');
    }
);
ready.value = true; // logs "Ready!"
```

### `waitUntil(predicate, options)`

Returns a promise that resolves when `predicate` becomes true.

```js
await waitUntil(() => dataLoaded.value === true);
console.log('Data loaded');
```

### `fromPromise(promise)`

Observes a promise’s state (pending, resolved, rejected) and lets you react to each phase.

```js
const promise = fetch('/api/data');
const observable = fromPromise(promise);

observable.case({
    pending: () => console.log('Loading...'),
    resolved: data => console.log('Data:', data),
    rejected: err => console.error('Error:', err),
});
```

### `makeObservable`, `makeAutoObservable`, `extendObservable`

These functions add reactivity to existing objects or classes. `makeAutoObservable` automatically infers which properties should be reactive.

```js
class Counter {
    value = 0;
    get double() {
        return this.value * 2;
    }
    increment() {
        this.value++;
    }
}

const counter = new Counter();
makeAutoObservable(counter);

autorun(() => {
    console.log('Double:', counter.double);
});
counter.increment(); // logs "Double: 2"
```

---

## Important Notes / Known Limitations

- **Static dependency collection in `autorun` and `reaction`**  
  Dependencies are captured **only once** – during the first execution of the tracked function. If your function conditionally uses different reactive items, changes to items not used in the first run **will not** trigger the effect. Use `computed` or restructure to ensure all possible dependencies are touched.

- **`Atom` clones objects shallowly**  
  When you assign an object/array to an `Atom`, it is shallow‑cloned (`Object.assign` or `slice`). Mutating nested properties **will not** trigger reactivity. Use `Collection` or `ShallowReactive` for nested structures.

- **`Collection` and `ShallowReactive` return Proxies**  
  The `.value` property of a `Collection` and the result of `shallowReactive()` are reactive Proxies. Direct mutations via the proxy are tracked; using the raw underlying value (via `.getRawValue()`) breaks reactivity.

- **Destructuring breaks reactivity**  
  When using `shallowReactive` or accessing properties of a `Collection`, destructuring fields (e.g., `const { name, age } = state`) breaks reactivity for those variables. Always access properties directly through the reactive object (e.g., `state.age`) to ensure dependencies are tracked correctly.

- **Error handling in Computed**  
  If a `Computed` function throws an error, the error is caught and stored. The computed will re‑throw the same error until its dependencies change, at which point it will try to recompute.

- **Destroyed items**  
  Calling `destroy()` on a reactive item cleans up all subscriptions and dependencies. Further operations (except checking `isDestroyed`) will throw an error.

---

## TypeScript Support

This library is written in plain JavaScript with JSDoc annotations. Type definitions are generated automatically and shipped with the package. You get full IntelliSense and type checking in supporting editors.

---

## License

MIT © 2025 Albert Bazaleev

---

## Links

- [Full Documentation](https://supercat1337.github.io/store2/docs/index.html)
- [GitHub Repository](https://github.com/supercat1337/store2)
- [NPM Package](https://www.npmjs.com/package/@supercat1337/store2)
