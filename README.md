# Supercat Store2

A lightweight, efficient, and easy-to-use reactive state management system for JavaScript applications.

## Install

```bash
npm i @supercat1337/store2
```

## Overview

Supercat Store2 is a reactive state management system for JavaScript applications. It provides a simple and intuitive way to manage and update state in a reactive way, allowing components to automatically re‑render when the state changes. It's designed to be flexible and scalable, making it suitable for a wide range of applications, from small web apps to large‑scale enterprise systems.

Store2 is based on the concept of **reactive items** – atoms, computed values, collections, and shallow reactive objects. These items can be observed and updated, triggering notifications to dependent components.

Store2 takes inspiration from other reactive state management systems, such as signals and MobX, and refines them to provide a more efficient and intuitive way to manage state in JavaScript applications.

The full documentation is available at [https://supercat1337.github.io/store2/docs/index.html](https://supercat1337.github.io/store2/docs/index.html).

## Important Notes / Known Limitations

- **Static dependency collection in `autorun` and `reaction`**  
  Dependencies are collected **only once** – during the first execution of the tracked function.  
  If your function contains conditional branches that use different reactive items, changes in dependencies that were not used during the first run **will not** trigger the effect.  
  **Workaround**: Use `computed` or restructure your code to always touch all possible dependencies.

- **`Atom` clones objects shallowly**  
  When you assign an object or array to an `Atom`, the value is shallow‑cloned (`Object.assign` or `slice`).  
  Mutating nested properties of the stored value **will not** trigger reactivity. Treat `Atom` as a container for immutable data or primitives.

- **`Store` removal notifications**  
  Currently, when an item is removed from a `Store` via `removeItem` or `destroyItem`, **subscribers of the Store are not notified** about the deletion.  
  This is a known limitation that will be addressed in a future version.

- **`Collection` returns a Proxy**  
  The array returned by `collection()` or `new Collection().value` is a reactive Proxy.  
  Mutations via index assignment or array methods (push, pop, splice, etc.) are reactive.  
  Accessing the raw array via `.getRawValue()` is **not reactive**.

- **`shallowReactive` returns a Proxy**  
  The function `shallowReactive(obj)` returns a reactive Proxy of the original object.  
  Only direct property changes are tracked; nested objects are not made reactive.

## Atoms and Computeds

Atoms store individual values. Computed values derive from other reactive sources and update automatically when those sources change.

```js
import { atom, computed } from '@supercat1337/store2';

const a = atom(0);
const b = atom(0);

const c = computed(() => a.value + b.value);

c.subscribe(() => {
    console.log('c', c.value);
});

a.value = 1;
// Output: c 1

b.value = 2;
// Output: c 3
```

## Collections

A `Collection` holds an array reactively. You can use the `collection()` function for convenience.

```js
import { collection, computed } from '@supercat1337/store2';

const items = collection([1, 2, 3]);

items.subscribe(updates => {
    console.log('Collection changed:', Array.from(updates.keys()));
});

const len = computed(() => items.length);

items.push(4);
// Output: Collection changed: ["length", "3"]

console.log(len.value); // 4
```

## Shallow Reactive Objects

`shallowReactive` makes an object’s direct properties reactive.

```js
import { shallowReactive } from '@supercat1337/store2';

const state = shallowReactive({ count: 0 });

state.subscribe(() => {
    console.log('state changed:', state.count);
});

state.count = 1; // triggers the subscriber
```

## Reactive Containers

### Store

`Store` is a container for multiple reactive items (atoms, computeds, other stores). It batches updates and notifies subscribers.

```js
import { Store, atom, computed, batch } from '@supercat1337/store2';

const store = new Store();
const a = atom(0);
const b = atom(0);
const sum = computed(() => a.value + b.value);

store.addItems({ a, b, sum });

store.subscribe(updates => {
    console.log('Changed:', Array.from(updates.keys()));
});

// Suppress temporary notifications
store.suppressNotifications();
a.value = 3;
b.value = 4;
store.unmuteUpdates();
// Output: Changed: ["a", "sum", "b"]

// Batch multiple changes into one notification
batch(() => {
    a.value = 1;
    b.value = 2;
});
// Output: Changed: ["a", "sum", "b"]
```

### ReactiveList

`ReactiveList` manages a list of items, automatically wrapping primitives in `Atom` and objects in `ShallowReactive`.

```js
import { ReactiveList } from '@supercat1337/store2';

const list = new ReactiveList();

list.subscribe(() => {
    console.log('List updated:', list.getItems());
});

list.add({ name: 'item1' }, { name: 'item2' });
list.setItem(0, { name: 'updated' });
list.splice(1, 1); // remove second item
```

## Advanced APIs

The library also provides functions for more complex reactive patterns:

- `autorun` – run a function whenever its dependencies change (static dependencies).
- `batch` – group multiple updates into one notification.
- `reaction` – track specific data and run an effect when it changes.
- `when` / `waitTrue` – wait for a condition to become true.
- `fromPromise` – observe a promise's pending/resolved/rejected state.
- `getNow` – a reactive timestamp that updates periodically.
- `makeObservable` / `makeAutoObservable` / `extendObservable` – add reactivity to existing objects.
- `runInAction` – defer mutations until after subscribers are done.
- `untrack` – read reactive values without creating a dependency.

### Example: `autorun` and `batch`

```js
const a = atom(0);
const b = atom(0);

let count = 0;
autorun(() => {
    a.value; // dependency
    b.value; // dependency
    count++;
});

console.log(count); // 1

batch(() => {
    a.value = 1;
    b.value = 2;
});
console.log(count); // 2 (only one notification)
```

### Example: `makeAutoObservable`

```js
import { makeAutoObservable, autorun } from '@supercat1337/store2';

let obj = {
    value: 0,
    get double() {
        return this.value * 2;
    },
    increment() {
        this.value++;
    },
};

makeAutoObservable(obj);

let runs = 0;
autorun(() => {
    obj.double; // tracks both `value` and `double`
    runs++;
});

console.log(runs); // 1
obj.increment();
console.log(runs); // 2
```

## License

MIT

Copyright (c) 2025 Albert Bazaleev
