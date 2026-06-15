[@supercat1337/store2](README.md) / Modules

# @supercat1337/store2

## Table of contents

### Modules

- [\<internal\>](modules/internal_.md)

### Classes

- [Atom](classes/Atom.md)
- [Collection](classes/Collection.md)
- [Computed](classes/Computed.md)
- [ReactiveList](classes/ReactiveList.md)
- [ReactivePrimitive](classes/ReactivePrimitive.md)
- [ShallowReactive](classes/ShallowReactive.md)
- [Store](classes/Store.md)

### Functions

- [atom](modules.md#atom)
- [autorun](modules.md#autorun)
- [batch](modules.md#batch)
- [collection](modules.md#collection)
- [computed](modules.md#computed)
- [extendObservable](modules.md#extendobservable)
- [fromPromise](modules.md#frompromise)
- [getNow](modules.md#getnow)
- [makeAutoObservable](modules.md#makeautoobservable)
- [makeObservable](modules.md#makeobservable)
- [reaction](modules.md#reaction)
- [runInAction](modules.md#runinaction)
- [shallowReactive](modules.md#shallowreactive)
- [untrack](modules.md#untrack)
- [waitTrue](modules.md#waittrue)
- [when](modules.md#when)

## Functions

### atom

▸ **atom**\<`T`\>(`value`, `options?`): [`Atom`](classes/Atom.md)\<`T`\>

Creates a new Atom instance. An Atom is a reactive primitive that holds a value. Same as `atom` but
returns a new Atom instance.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `T` | The initial value of the Atom. |
| `options?` | `Object` | Options |
| `options.compareFunction` | (`a`: `T`, `b`: `T`) => `boolean` | A function that compares two values to determine if they are equal. |
| `options.name` | `string` | The name of Atom. |

#### Returns

[`Atom`](classes/Atom.md)\<`T`\>

A new Atom instance with the given value and options.

**`Example`**

```js
const count = atom(0);

count.subscribe(() => {
    console.log(count.value);
});

count.value = 1;
```

#### Defined in

[src/api/api.js:558](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/api/api.js#L558)

___

### autorun

▸ **autorun**(`fn`, `options?`): () => `void`

Automatically tracks and subscribes to changes in reactive items used by the specified function.
This allows the function to be re-executed whenever any of its dependencies change, maintaining
up-to-date results.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fn` | (`updates?`: `Map`\<`string`, [`UpdateDataRecord`](classes/internal_.UpdateDataRecord.md)\>) => `void` | The function to track and reactively execute. |
| `options?` | `Object` | The options for the autorun function. |
| `options.delay` | `number` | The number of milliseconds to delay the execution of the callback function. |
| `options.name` | `string` | An optional name for the autorun. |
| `options.onError` | `Function` | An optional function to handle errors. |
| `options.signal` | `AbortSignal` | An optional AbortSignal to cancel the autorun. |

#### Returns

`fn`

A function that can be called to unsubscribe the callback function from changes in the tracked dependencies.

▸ (): `void`

##### Returns

`void`

**`Example`**

```js
const a = atom(0, { name: "a" });
const b = atom(0, { name: "b" });
let foo = 0;

autorun(() => {
    a.value;
    b.value;
    foo++;
});

console.log(a.value, b.value, foo); // 0 0 1

a.value++;
console.log(a.value, b.value, foo); // 1 0 2

b.value++;
console.log(a.value, b.value, foo); // 1 1 3

batch(() => {
    a.value++;
    b.value++;
});

console.log(a.value, b.value, foo); // 2 2 4
```

#### Defined in

[src/api/api.js:51](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/api/api.js#L51)

___

### batch

▸ **batch**(`fn`): `void`

Executes the specified function while batching notifications to reactive items.
This is useful for operations that make multiple changes to reactive items, as
it prevents the notifications from being sent until all changes have been made.
Supports nested batch calls.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fn` | `Function` | The function to execute while batching notifications. |

#### Returns

`void`

**`Example`**

```js
const a = atom(0);
const b = atom(0);

let foo = 0;

autorun(() => {
    a.value;
    b.value;
    foo++;
});

console.log(a.value, b.value, foo); // 0 0 1

batch(() => {
    a.value++;
    b.value++;
});

console.log(a.value, b.value, foo); // 1 1 2
```

#### Defined in

[src/api/api.js:342](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/api/api.js#L342)

___

### collection

▸ **collection**\<`T`\>(`value`, `options?`): `T`[]

Creates a new Collection instance. A Collection is a reactive primitive that holds an array of values. Same as `collection` but
returns a new Collection instance.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `T`[] | The array to observe. |
| `options?` | `Object` | Options |
| `options.compareFunction` | (`a`: `T`, `b`: `T`) => `boolean` | A function that compares two values to determine if they are equal. |
| `options.name` | `string` | The name of Collection object. |

#### Returns

`T`[]

The observed array

**`Example`**

```js
const items = collection([1, 2, 3]);

items.subscribe(() => {
    console.log(items.value);
});

items.value.push(4);
// output: [1, 2, 3, 4]
```

#### Defined in

[src/api/api.js:609](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/api/api.js#L609)

___

### computed

▸ **computed**\<`T`\>(`fn`, `options?`): [`Computed`](classes/Computed.md)\<`T`\>

Creates a new Computed instance. Computed is a reactive primitive that holds a value that is computed from other reactive values.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fn` | () => `T` | The function that returns the value of the Computed |
| `options?` | `Object` | Options |
| `options.compareFunction` | (`a`: `T`, `b`: `T`) => `boolean` | A function that compares two values to determine if they are equal. |
| `options.name` | `string` | The name of Computed. |
| `options.smartRecompute` | `boolean` | Whether the function is a hard function. If true, it prevents calling the function by comparing the string representation of the dependencies. |

#### Returns

[`Computed`](classes/Computed.md)\<`T`\>

A new Computed instance with the given function and options.

**`Example`**

```js
const a = atom(0);
const b = computed(() => a.value + 1);

b.subscribe(() => {
    console.log(b.value);
});

a.value = 1;
// b = 2
```

#### Defined in

[src/api/api.js:584](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/api/api.js#L584)

___

### extendObservable

▸ **extendObservable**\<`T`, `R`\>(`target`, `properties`, `overrides?`, `options?`): `T` & `R`

Extends an object with new properties and makes them observable.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` |
| `R` | extends `Object` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `T` | The object to be extended and observed. |
| `properties` | `R` | The properties to add to the target object. |
| `overrides?` | `Object` | Optional overrides to define the type of the reactive property. If an override is false, the key will be ignored. |
| `options?` | `Object` | Options to configure the observable behavior. |
| `options.name` | `string` | The name of the observable object. Defaults to an empty string. Using as prefix for reactive property names. |

#### Returns

`T` & `R`

The extended object with observable properties.

**`Example`**

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

makeObservable(object, { value: "atom", double: "computed" });
extendObservable(object, {a: 1, b: 2});

let foo = 0;

autorun(() => {
    foo++;
    object.a;
});

console.log(foo); // 1
object.a++;
console.log(foo); // 2
```

#### Defined in

[src/api/api.js:846](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/api/api.js#L846)

___

### fromPromise

▸ **fromPromise**\<`T`\>(`promise`): `Object`

Creates an object that provides a way to handle the result of a Promise.
The object has a single method called `case` which takes an object with
three optional methods: `resolved`, `rejected`, and `pending`. The appropriate
method will be called based on the state of the promise.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `promise` | `Promise`\<`T`\> | The promise to handle. |

#### Returns

`Object`

An object with a single method called `case`.

| Name | Type |
| :------ | :------ |
| `case` | (`param0`: \{ `pending?`: () => `void` ; `rejected?`: (`error`: `Error`) => `void` ; `resolved?`: (`value`: `T`) => `void`  }) => `Promise`\<`void`\> |

**`Example`**

```js
const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve("Hello, world!");
    }, 1000);
});

const fromPromiseResult = fromPromise(promise);

await fromPromiseResult.case({
    resolved: (value) => {
        console.log("Resolved:", value); // Resolved: Hello, world!
    },
    rejected: () => {
        console.log("Rejected");
    },
    pending: () => {
        console.log("Pending"); // Pending
    },
});
```

#### Defined in

[src/api/api.js:471](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/api/api.js#L471)

___

### getNow

▸ **getNow**(`interval?`): [`Atom`](classes/Atom.md)\<`number`\>

Returns an Atom that automatically updates its value to the current time
at the given interval. The interval is specified in milliseconds and
defaults to 1000. When there are subscribers, the Atom updates its value
at the specified interval. When there are no subscribers, the interval
is cleared and the Atom's value is reset to 0.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `interval?` | `number` | `1000` | The interval in milliseconds at which the Atom should update its value. |

#### Returns

[`Atom`](classes/Atom.md)\<`number`\>

An Atom that automatically updates its value to the current time at the given interval.

**`Example`**

```js
const now = getNow();
console.log(now.value); // 0

const unsubscribe = now.subscribe(() => {
    console.log(now.value); // Current time in milliseconds
});
```

#### Defined in

[src/api/api.js:413](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/api/api.js#L413)

___

### makeAutoObservable

▸ **makeAutoObservable**\<`T`\>(`obj`, `overrides?`, `options?`, `filter?`): `T`

Makes existing object properties observable. Same as [makeObservable](modules.md#makeobservable) but infers all the properties.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `obj` | `T` | The object to observe. |
| `overrides?` | `Object` | The overrides to use to define type of the reactive property. If an override is false, the key will be ignored. |
| `options?` | `Object` | Options to configure the observable behavior. |
| `options.name` | `string` | The name of the observable object. Defaults to an empty string. Using as prefix for reactive property names. |
| `filter?` | `Set`\<`string`\> | A set of property keys to selectively apply annotations. |

#### Returns

`T`

**`Example`**

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

#### Defined in

[src/api/api.js:890](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/api/api.js#L890)

___

### makeObservable

▸ **makeObservable**\<`T`\>(`obj`, `annotations`, `options?`): `T`

Enhances an object to make its properties observable using specified annotations.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `obj` | `T` | The object to be observed. |
| `annotations` | `Object` | Annotations defining the type of reactivity for each property. Properties with a 'false' annotation will be ignored. |
| `options?` | `Object` | Options to configure the observable behavior. |
| `options.name` | `string` | The name of the observable object. Defaults to an empty string. Using as prefix for reactive property names. |

#### Returns

`T`

The input object with enhanced reactive properties.

**`Example`**

```js
class List {
    data = [];

    constructor(data) {
        this.data = data;
        makeObservable(this, { data: "collection" });
    }

    // not reactive property
    get length() {
        return this.data.length;
    }
}

const list = new List([1, 2, 3]);

let foo = 0;

autorun((updates) => {
    console.log(`list.length = ${list.length}`);
    foo++;
});
// Outputs: list.length = 3

console.log(foo);
// Outputs: 1

list.data.push(4);
// Outputs: list.length = 4
console.log(foo);
// Outputs: 2

list.data.pop();
// set last element to undefined. foo++
// Outputs: list.length = 4
// set new value of length/ foo++
// Outputs: list.length = 3

console.log(foo);
// Outputs: 4
```

**`Example`**

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

makeObservable(object, { value: "atom", double: "computed" });

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

#### Defined in

[src/api/api.js:725](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/api/api.js#L725)

___

### reaction

▸ **reaction**(`dataFunction`, `fn`, `options?`): () => `void`

Tracks reactive items used by the specified data function and subscribes
the provided callback function to changes in these items. This ensures
that the callback is executed whenever any of the tracked dependencies
change, allowing for reactive updates based on the data function.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `dataFunction` | () => `any` | The function whose reactive dependencies are tracked. |
| `fn` | (`updates?`: `Map`\<`string`, [`UpdateDataRecord`](classes/internal_.UpdateDataRecord.md)\>) => `void` | The callback function to execute when tracked dependencies change. |
| `options?` | `Object` | The options for the reaction function. |
| `options.delay` | `number` | The number of milliseconds to delay the execution of the callback function. |
| `options.name` | `string` | An optional name for the reaction. |
| `options.signal` | `AbortSignal` | An optional signal to abort the reaction. |
| `options.type` | `string` | An optional type for the reaction. Defaults to "reaction". |

#### Returns

`fn`

A function that can be called to unsubscribe the callback function from changes in the tracked dependencies.

▸ (): `void`

##### Returns

`void`

**`Example`**

```js
const a = atom(0);
const b = atom(0);

let foo = 0;

// runs only data-function to get dependencies
// and then subscribes to changes in a and b
reaction(
    () => [a.value, b.value],
    () => {
        foo++;
    }
);

console.log(a.value, b.value, foo); // 0 0 0

a.value++;
console.log(a.value, b.value, foo); // 1 0 1

b.value++;
console.log(a.value, b.value, foo); // 1 1 2

batch(() => {
    a.value++;
    b.value++;
});

console.log(a.value, b.value, foo); // 2 2 3
```

#### Defined in

[src/api/api.js:120](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/api/api.js#L120)

___

### runInAction

▸ **runInAction**(`fn`): `void`

Runs the given function in an action, i.e. when there are no active
subscribers. This is useful for making changes to reactive items without
triggering subscribers.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fn` | `Function` | The function to be run in an action. |

#### Returns

`void`

**`Example`**

```js
let a = atom(0, { name: "a" });
let b = atom(0, { name: "b" });

let count = 0;

a.subscribe(() => {
    count++;
    runInAction(() => {
        b.value = a.value;
    });
});

a.value++;
console.log(a.value, b.value, count); // 1 1 1
```

#### Defined in

[src/api/api.js:303](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/api/api.js#L303)

___

### shallowReactive

▸ **shallowReactive**\<`T`\>(`value`, `options?`): `T`

Creates a new ShallowReactive instance. An ShallowReactive is a reactive primitive that holds a value. Same as `shallowReactive` but
returns a new ShallowReactive instance.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `T` | The object to observe. |
| `options?` | `Object` | Options to configure the observable behavior. |
| `options.name` | `string` | The name of ShallowReactive object. |

#### Returns

`T`

The observed object

**`Example`**

```js
const obj = shallowReactive({ a: 1, b: 2 });

obj.subscribe(() => {
    console.log(obj.value);
});

obj.value.a = 3;
// output: { a: 3, b: 2 }
```

#### Defined in

[src/api/api.js:634](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/api/api.js#L634)

___

### untrack

▸ **untrack**\<`T`\>(`fn`): `T`

Executes the specified function while not tracking reactive items.
This is useful for operations that access reactive items without
actually depending on them.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fn` | () => `T` | The function to execute while not tracking reactive items. |

#### Returns

`T`

The result of executing the function.

**`Example`**

```js
const a = atom(0);
const b = atom(0);

let foo = 0;

autorun(() => {
    a.value;
    untrack(() => {
        b.value;
    });
    foo++;
});
console.log(a.value, b.value, foo); // 0 0 1

a.value++;
console.log(a.value, b.value, foo); // 1 0 2
b.value++;
console.log(a.value, b.value, foo); // 1 1 2
```

#### Defined in

[src/api/api.js:380](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/api/api.js#L380)

___

### waitTrue

▸ **waitTrue**(`predicate`, `options?`): `Promise`\<`void`\>

Waits until the given predicate evaluates to true.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | () => `boolean` | The predicate that should be evaluated. |
| `options?` | `Object` | Optional options. |
| `options.timeout` | `number` | The number of milliseconds to wait before timing out. |

#### Returns

`Promise`\<`void`\>

A promise that resolves when the predicate evaluates to true.

**`Example`**

```js
const a = atom(0, { name: "a" });
let foo = 0;

waitTrue(() => a.value > 3).then(() => {
    foo++;
});

a.value = 2; // foo = 0
a.value = 3; // foo = 0
a.value = 4; // foo = 1
```

#### Defined in

[src/api/api.js:247](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/api/api.js#L247)

___

### when

▸ **when**(`predicate`, `fn`, `options?`): () => `void`

Automatically calls the given function whenever the given predicate evaluates to true.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | () => `boolean` | The predicate that should be evaluated. |
| `fn` | () => `void` | The function to be called when the predicate evaluates to true. |
| `options?` | `Object` | Optional options. |
| `options.delay` | `number` | The number of milliseconds to wait before calling the function. |
| `options.signal` | `AbortSignal` | An AbortSignal to cancel the function call. |
| `options.timeout` | `number` | The number of milliseconds to wait before timing out. |

#### Returns

`fn`

A function that can be called to unsubscribe the callback function from changes in the tracked dependencies.

▸ (): `void`

##### Returns

`void`

**`Example`**

```js
const a = atom(0, { name: "a" });
let foo = 0;

when(
    () => a.value > 3,
    () => {
        foo++;
    }
);

a.value = 2; // foo = 0
a.value = 3; // foo = 0
a.value = 4; // foo = 1
a.value = 5; // foo = 1
a.value = 3; // foo = 1
a.value = 4; // foo = 2
a.value = 5; // foo = 2
```

#### Defined in

[src/api/api.js:195](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/api/api.js#L195)
