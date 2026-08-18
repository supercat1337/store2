# @supercat1337/store2

A lightweight, efficient, and fully reactive state management library for JavaScript.

[![npm version](https://badge.fury.io/js/%40supercat1337%2Fstore2.svg)](https://www.npmjs.com/package/@supercat1337/store2)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@supercat1337/store2)](https://bundlephobia.com/package/@supercat1337/store2)

---

## Why store2?

- **Lightweight** — Zero runtime dependencies (only `@supercat1337/event-emitter` under the hood)
- **MobX‑inspired DX** — Transparent reactive graph, but with a smaller footprint
- **Framework‑agnostic** — Works with vanilla JS, React, Vue, Svelte, or any DOM environment
- **Predictable batching** — Updates are batched by default, no subtle race conditions
- **Full TypeScript support** — Typed via JSDoc, no separate `@types` package needed

---

## Features

- **MobX-inspired mental model** – predictable transparent reactive graph, but lightweight and dependency‑free (only one tiny dependency: `@supercat1337/event-emitter`).
- **Reactive primitives** – `Atom`, `Computed`, `Collection`, `ShallowReactive`.
- **Reactive containers** – `Store` (key‑value store) and `ReactiveList` (array‑like list).
- **Declarative APIs** – `autorun`, `reaction`, `when`, `waitUntil`.
- **Batched updates** – group changes with `batch()` to reduce notifications.
- **Observable objects** – `makeObservable`, `makeAutoObservable`, `extendObservable`.
- **Promise integration** – `fromPromise` to observe pending/resolved/rejected states.
- **Tiny and fast** – only one external dependency (event emitter), fully typed via JSDoc.

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
const display = document.getElementById('display');

autorun(() => {
    display.textContent = `Clicks: ${count.value}`;
});

btn.addEventListener('click', () => count.value++);
```

---

## Examples

Check out the [`examples/`](./examples) folder for runnable demos covering all features:

- **Basics** – atoms, computed, batch, untrack
- **Reactions** – autorun, reaction, when, waitUntil
- **Collections** – collection, shallowReactive, ReactiveList
- **Stores** – Store, nested stores
- **Classes** – makeObservable, makeAutoObservable, extendObservable
- **Async** – fromPromise, getNow

---

## Core Concepts

| Primitive           | Purpose                   | Example                                           |
| ------------------- | ------------------------- | ------------------------------------------------- |
| `atom()`            | Single mutable value      | `const count = atom(0)`                           |
| `computed()`        | Derived value (cached)    | `const double = computed(() => count.value * 2)`  |
| `collection()`      | Reactive array            | `const items = collection([1, 2, 3])`             |
| `shallowReactive()` | Reactive object (shallow) | `const state = shallowReactive({ name: 'Alex' })` |

### Atoms

An `Atom` holds a single value. It is the most basic reactive unit.

```js
const count = atom(0);
count.subscribe(() => console.log('count changed:', count.value));
count.value++; // triggers the subscriber
```

📖 Full documentation: [`Atom`](docs-md/classes/Atom.md)

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

📖 Full documentation: [`Computed`](docs-md/classes/Computed.md)

### Collection

A `Collection` wraps an array and makes its mutations (push, pop, splice, index assignment) reactive.

```js
import { collection } from '@supercat1337/store2';

const items = collection([1, 2, 3]);
items.subscribe(() => console.log('array changed'));
items.value.push(4); // triggers notification
console.log(items.value); // [1, 2, 3, 4]
```

📖 Full documentation: [`Collection`](docs-md/classes/Collection.md)

### ShallowReactive

`shallowReactive` turns a plain object into a reactive proxy. Only direct property changes are tracked (nested objects are not made reactive).

```js
import { shallowReactive } from '@supercat1337/store2';

const state = shallowReactive({ name: 'Alice', age: 30 });
state.subscribe(() => console.log('state updated'));
state.age = 31; // triggers notification
```

📖 Full documentation: [`ShallowReactive`](docs-md/classes/ShallowReactive.md)

---

## ⚠️ Important: Nested Mutations Are Not Tracked

`store2` uses reference equality (`===`) by default to detect changes. This means:

```js
const user = atom({ name: 'Alex', age: 25 });
user.value.age = 26; // ❌ Does NOT trigger reactivity
```

**Always use immutable updates:**

```js
user.value = { ...user.value, age: 26 }; // ✅ Triggers reactivity
```

For deeply nested structures, consider:

- **Atomization** – split state into multiple atoms:
    ```js
    const userName = atom('Alex');
    const userAge = atom(25);
    ```
- **`makeAutoObservable`** – for classes with nested objects:
    ```js
    class User {
        name = 'Alex';
        profile = { age: 25 };
        constructor() {
            makeAutoObservable(this);
        }
    }
    const user = new User();
    user.profile.age = 26; // ✅ Works!
    ```

📖 See the [full documentation on deep objects](docs-md/README.md#working-with-deep-objects) for more details.

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

📖 Full documentation: [`Store`](docs-md/classes/Store.md)

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

📖 Full documentation: [`ReactiveList`](docs-md/classes/ReactiveList.md)

---

## Advanced APIs

### `autorun(fn, options)`

Runs `fn` immediately and re‑runs it whenever any reactive value used inside changes.  
Dependencies are re‑collected on every run by default (unless `recomputeDependencies: false` is set).  
Unlike `reaction`, `autorun` does **not** receive a `updates` map – it simply re‑executes the whole function.

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

Tracks dependencies inside `dataFn` and runs `effectFn` whenever those dependencies change.  
By default, `effectFn` receives a `Map` containing the exact updates (property paths → `UpdateDataRecord`) that triggered the reaction. This is useful for fine-grained DOM updates, logging, or optimising expensive operations.

```js
import { reaction, atom } from '@supercat1337/store2';

const a = atom(1);
const b = atom(2);

reaction(
    () => [a.value, b.value],
    updates => {
        console.log('Changed keys:', Array.from(updates.keys()));
        // updates contains: oldValue, newValue, type for each changed key
    }
);

a.value = 10; // triggers reaction with updates
```

**Options:**

- `passUpdates` (boolean, default `true`) – if `true`, passes a `Map` of updates to `effectFn`. Set to `false` to disable.
- `recomputeDependencies` (default `true`) – if `true`, dependencies are re‑collected on every run. Set to `false` to capture dependencies only once (static collection).
- `delay` (number) – debounce delay in milliseconds.
- `signal` (AbortSignal) – cancellation signal.
- `onError` (function) – error handler.

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

📖 Full API documentation: [`docs-md/README.md`](docs-md/README.md)

---

## Migration from MobX (Quick Reference)

| MobX                       | store2                     |
| -------------------------- | -------------------------- |
| `observable({ ... })`      | `shallowReactive({ ... })` |
| `computed(() => ...)`      | `computed(() => ...)`      |
| `autorun(() => ...)`       | `autorun(() => ...)`       |
| `action(() => ...)`        | `batch(() => ...)`         |
| `makeAutoObservable(this)` | `makeAutoObservable(this)` |
| `observable([])`           | `collection([])`           |
| `observable.map()`         | `Store`                    |

---

## Important Notes / Known Limitations

> **Dynamic dependency collection in `autorun` and `reaction`**  
> By default, dependencies are **re‑collected on every execution** of the tracked function. This means that conditional reads (e.g., inside an `if` statement) are handled correctly: if a condition changes and a new reactive item is read, it will be added to the dependency set for subsequent runs.  
> However, note that **only the items actually read during a particular execution are tracked** for that run. If a reactive item is not read because a condition is false, a change to that item will **not** trigger a re‑run until the item is read again (i.e., when the condition becomes true in some later execution).  
> If you need to **fix the dependency set once** (static collection), set the `recomputeDependencies: false` option. This can improve performance in cases where dependencies never change, but be cautious with conditional logic.

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

- **`autorun` vs `reaction` for updates**  
  `autorun` does **not** receive `updates` – it re‑runs the entire effect. If you need fine‑grained change information (e.g., for selective DOM updates), use `reaction` with `passUpdates: true` (the default).

---

## TypeScript Support

This library is written in plain JavaScript with JSDoc annotations. Type definitions are generated automatically and shipped with the package. You get full IntelliSense and type checking in supporting editors.

---

## Documentation & Examples

- **Full API Documentation**: [`docs-md/README.md`](docs-md/README.md)
- **Examples**: Check out the [`examples/`](./examples) folder for runnable code snippets covering all features.
- **Architecture Overview**: For a deep dive into the internal architecture, dependency graph, batching, and core engine mechanics, see [`AGENTS.md`](./AGENTS.md) — this file is also intended for AI assistants and advanced developers.

---

## License

MIT © 2025–2026 Albert Bazaleev

---

## Links

- [GitHub Repository](https://github.com/supercat1337/store2)
- [NPM Package](https://www.npmjs.com/package/@supercat1337/store2)
