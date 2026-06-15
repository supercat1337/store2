# Supercat Store2

A lightweight, efficient, and easy-to-use reactive state management system for JavaScript applications.

## Install

```bash
npm i @supercat1337/store2
```

## Overview

Supercat Store2 is a reactive state management system for JavaScript applications. It provides a simple and intuitive way to manage and update state in a reactive way, allowing components to automatically re-render when the state changes. It's designed to be flexible and scalable, making it suitable for a wide range of applications, from small web apps to large-scale enterprise systems.

Store2 is based on the concept of "reactive items" which can be atoms, computed values, collections, or reactive props objects. These items can be observed and updated, triggering notifications to dependent components.

Store2 takes inspiration from other reactive state management systems, such as signals and MobX, and refines them to provide a more efficient and intuitive way to manage state in JavaScript applications.

The full documentation for Store2 is available at https://supercat1337.github.io/store2/docs/index.html.

### Atoms and Computeds

Atoms are the basic reactive elements that store individual values. Computed values derive their values from other reactive sources and automatically update when those sources change. Subscriptions allow you to react to changes in these values.

```js
import { atom, computed } from "@supercat1337/store2";

const a = atom(0); // same as const a = new Atom(0);
const b = atom(0);

const c = computed(() => a.value + b.value); // same as const c = new Computed(() => a.value + b.value);

c.subscribe(() => {
    console.log("c", c.value);
});

a.subscribe(() => {
    console.log("a", a.value);
});

b.subscribe(() => {
    console.log("b", b.value);
});

a.value = 1;
// Outputs:
//a 1
//c 1

a.value = 2;
// Outputs:
//a 2
//c 2
b.value = 2;
// Outputs:
//b 2
//c 4

a.value = 3;
// Outputs:
//a 3
//c 5

a.value = 3;
// Outputs: nothing because value is not changed
```

### Collections

A Collection is a reactive primitive that holds an array of values.

```js
import { Collection, computed } from "@supercat1337/store2";

let c = new Collection([1, 2, 3]);
c.subscribe((updates) => {
    let data = [];
    updates.forEach((update, key) => {
        data.push(
            `verb = ${update.verb}; key = ${key}; value = ${update.value}`
        );
    });
    console.log("c.subscribe:\n" + data.join("\n"));
});

let len = computed(() => c.data.length);

len.subscribe((updates) => {
    console.log("len.subscribe:\nlength =", len.value);
});

c.data.push(4);
// Outputs:
// c.subscribe:
// verb = set; key = length; value = 4
// verb = set; key = 3; value = 4

// len.subscribe:
// length = 4

c.data[0] = 100;
// Outputs:
// c.subscribe:
// verb = set; key = 0; value = 100

c.data.pop();
// Outputs:
// verb = delete; key = 3; value = undefined
// verb = set; key = length; value = 3

// len.subscribe:
// length = 3
```

### Reactive Properties (shallowReactive)

shallowReactive is a fundamental reactive primitive designed to manage a shallow object. It serves as the foundational element of reactive state management. This object is shallowly reactive, meaning it detects and responds only to changes in its direct properties, not the properties of any nested objects.

```js
const b = new shallowReactive({ foo: 1 });

let bar = 0;

b.subscribe(() => {
    bar += 1;
});

const props = b.data;
props.foo = 2;

console.log(bar);
// Outputs: 1
```

## Reactive Containers

### Store

Store is a reactive container that manages a collection of reactive items.
Items can be added, removed, and accessed through methods provided by this class.
The Store emits events when items are added, removed, or updated.

```js
const store = new Store();
const a = atom(0);
const b = atom(0);

const childStore = new Store();
const sum = computed(() => a.value + b.value);
childStore.addItems({ sum });

store.addItems({ a, b, childStore });

store.subscribe((updates) => {
    let updatesArr = Array.from(updates.keys());
    console.log("props", updatesArr);
});

// mute updates
store.muteUpdates();
childStore.removeItem("childStore");
a.value = 3;
b.value = 4;
store.unmuteUpdates();
// Outputs:
// props [ 'a', 'childStore.sum', 'b' ]

// without mute updates

a.value = 1;
// Outputs:
// props [ 'a' ]
// props [ 'childStore.sum' ]

b.value = 2;
// Outputs:
//props [ 'b' ]
//props [ 'childStore.sum' ]

// using batch
batch(() => {
    a.value = 2;
    b.value = 3;
});
// Outputs:
// props [ 'a' ]
// props [ 'childStore.sum' ]
```

### ReactiveList

ReactiveList is a class designed to handle a list of shallowReactive items reactively.
It supports operations for adding, removing, and updating list items, ensuring that changes are propagated.

```js
const list = new ReactiveList();
const item1 = { name: "item1" };
const item2 = { name: "item2" };
const item3 = { name: "item3" };

list.subscribe((updates) => {
    console.log("updates: ", Array.from(updates.keys()));
    console.log("list.length = ", list.length);
    console.log("list.items = ", list.getItems());
    console.log("=====================================");
});

list.setItems([item1, item2, item3]);
// Outputs:
// updates:  [ '0.name', '1.name', '2.name', 'length' ]
// list.length =  3
// list.items =  [ { name: 'item1' }, { name: 'item2' }, { name: 'item3' } ]

list.setItems([item1]);
// Outputs:
// updates:  [ '1', '2', 'length' ]
// list.length =  1
// list.items =  [ { name: 'item1' } ]

list.setItem(0, { name: "updated" });
// Outputs:
// updates:  [ '0.name' ]
// list.length =  1
// list.items =  [ { name: 'updated' } ]
```

## More Advanced APIs

The library also provides a range of advanced functions for more complex use cases, including:

-   autorun() - run a function whenever any of its dependencies change.
-   batch() - group multiple reactive updates into a single update.
-   collection() - create a reactive collection.
-   fromPromise() - convert a promise to an observable.
-   getNow() - get the current time.
-   makeAutoObservable() - automatically infer observability from an object's properties.
-   makeObservable() - explicitly add observability to an object.
-   extendObservable() - add observability to a previously non-observable object.
-   reaction() - create a custom reaction to changes in one or more reactive items.
-   shallowReactive() - create a reactive version of an object with reactive properties.
-   runInAction() - run a function within a reactive context.
-   untrack() - manually opt-out of tracking for a reactive item.
-   waitTrue() - wait for a reactive value to become true.
-   when() - create a custom reaction to a reactive item reaching a certain value.

### Batch and autorun usage example

```js
const a = atom(0);
const b = atom(0);

let updateCount = 0;

autorun(() => {
    a.value; // track dependency
    b.value; // track dependency
    updateCount++;
});

console.log(a.value, b.value, updateCount); // 0 0 1

batch(() => {
    a.value++;
    b.value++;
});

console.log(a.value, b.value, updateCount); // 1 1 2
```

### makeAutoObservable

```js
let object = {
    value: 0,
    get double() {
        return this.value * 2;
    },
    increment() {
        this.value++;
    },
};

makeAutoObservable(object);

let foo = 0;

autorun(() => {
    foo++;
    object.double;
});
console.log(foo); // 1

object.increment();
console.log(foo); // 2

object.increment();
console.log(foo); // 3
```

## License

MIT

Copyright (c) 2025 Albert Bazaleev
