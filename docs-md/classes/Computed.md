[@supercat1337/store2](../README.md) / [Modules](../modules.md) / Computed

# Class: Computed\<T\>

Computed is a reactive item that holds a value that is computed from other reactive values.
It is the base unit of reactive state.

**`Example`**

```js
const a = new Atom(0); // same as const a = atom(0);
const b = new Atom(0);

const c = new Computed(() => a.value + b.value);

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
// Output:
//a 1
//c 1

a.value = 2;
// Output:
//a 2
//c 2
b.value = 2;
// Output:
//b 2
//c 4

a.value = 3;
// Output:
//a 3
//c 5

a.value = 3;
// Output: nothing
```

## Type parameters

| Name |
| :------ |
| `T` |

## Hierarchy

- [`ReactiveItem`](ReactiveItem.md)

  ↳ **`Computed`**

## Table of contents

### Constructors

- [constructor](Computed.md#constructor)

### Properties

- [#currentValue](Computed.md##currentvalue)
- [#fn](Computed.md##fn)
- [\_\_cachedDependentsVersionString](Computed.md#__cacheddependentsversionstring)
- [engine](Computed.md#engine)
- [name](Computed.md#name)
- [options](Computed.md#options)

### Accessors

- [isDestroyed](Computed.md#isdestroyed)
- [value](Computed.md#value)
- [valueUntracked](Computed.md#valueuntracked)

### Methods

- [#areDependenciesStale](Computed.md##aredependenciesstale)
- [#calc](Computed.md##calc)
- [#collectDependenciesAndInitValue](Computed.md##collectdependenciesandinitvalue)
- [#getDependenciesVersionString](Computed.md##getdependenciesversionstring)
- [clearAllSubscribers](Computed.md#clearallsubscribers)
- [clearSubscribers](Computed.md#clearsubscribers)
- [destroy](Computed.md#destroy)
- [equals](Computed.md#equals)
- [getLastError](Computed.md#getlasterror)
- [getValue](Computed.md#getvalue)
- [hasError](Computed.md#haserror)
- [hasSubscribers](Computed.md#hassubscribers)
- [isStale](Computed.md#isstale)
- [onDestroy](Computed.md#ondestroy)
- [onHasSubscribers](Computed.md#onhassubscribers)
- [onNoSubscribers](Computed.md#onnosubscribers)
- [peekValue](Computed.md#peekvalue)
- [subscribe](Computed.md#subscribe)

## Constructors

### constructor

• **new Computed**\<`T`\>(`fn`, `options?`): [`Computed`](Computed.md)\<`T`\>

Initializes an Atom instance with a given value.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `unknown` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fn` | () => `T` | function that returns the value of the Computed |
| `options?` | `Object` | Options |
| `options.compareFunction` | (`a`: `T`, `b`: `T`) => `boolean` | A function that compares two values for equality. |
| `options.name` | `string` | The name of the Computed instance. |
| `options.smartRecompute` | `boolean` | When true, the computed value will be recalculated only when the version string of its dependencies changes, rather than on every dependency notification. This avoids unnecessary recalculations when dependencies change but their final values remain the same (e.g., toggling back and forth). Defaults to false. |

#### Returns

[`Computed`](Computed.md)\<`T`\>

#### Overrides

[ReactiveItem](ReactiveItem.md).[constructor](ReactiveItem.md#constructor)

#### Defined in

src/reactives/Computed.js:82

## Properties

### #currentValue

• `Private` **#currentValue**: `T`

#### Defined in

src/reactives/Computed.js:58

___

### #fn

• `Private` **#fn**: () => `T`

#### Type declaration

▸ (): `T`

##### Returns

`T`

#### Defined in

src/reactives/Computed.js:61

___

### \_\_cachedDependentsVersionString

• **\_\_cachedDependentsVersionString**: `string` = `''`

#### Defined in

src/reactives/Computed.js:64

___

### engine

• **engine**: [`Engine`](internal_.Engine.md)

#### Inherited from

[ReactiveItem](ReactiveItem.md).[engine](ReactiveItem.md#engine)

#### Defined in

[src/reactives/ReactiveItem.js:13](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/reactives/ReactiveItem.js#L13)

___

### name

• **name**: `string`

#### Inherited from

[ReactiveItem](ReactiveItem.md).[name](ReactiveItem.md#name)

#### Defined in

src/reactives/Computed.js:96

___

### options

• **options**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `smartRecompute` | `boolean` |

#### Defined in

src/reactives/Computed.js:66

## Accessors

### isDestroyed

• `get` **isDestroyed**(): `boolean`

#### Returns

`boolean`

True if the reactive item has been destroyed, false otherwise.

#### Inherited from

ReactiveItem.isDestroyed

#### Defined in

[src/reactives/ReactiveItem.js:180](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/reactives/ReactiveItem.js#L180)

___

### value

• `get` **value**(): `T`

Returns the current value of the Computed value.

#### Returns

`T`

The current value of the Computed value.

#### Defined in

src/reactives/Computed.js:239

___

### valueUntracked

• `get` **valueUntracked**(): `T`

Returns the current value of the Computed value without tracking it for dependency management.
This is useful when you want to access the value without affecting its reactive state.

#### Returns

`T`

The current value of the Computed value.

**`Example`**

```js
const a = atom(0);
const b = atom(0);
const c = computed(() => a.value + 1);
const d = computed(() => c.valueUntracked + b.value);

d.subscribe(() => {
    console.log(`d = ${d.value}`);
});

console.log(`c = ${c.value}`);
// Outputs: c = 1
a.value++;
// a = 1
// Outputs: nothing
console.log(`c = ${c.value}`);
// Outputs: c = 2

b.value++;
// Outputs: d = 3
```

#### Defined in

src/reactives/Computed.js:300

## Methods

### #areDependenciesStale

▸ **#areDependenciesStale**(): `boolean`

#### Returns

`boolean`

#### Defined in

src/reactives/Computed.js:183

___

### #calc

▸ **#calc**(): `T`

#### Returns

`T`

#### Defined in

src/reactives/Computed.js:304

___

### #collectDependenciesAndInitValue

▸ **#collectDependenciesAndInitValue**(): `T`

#### Returns

`T`

#### Defined in

src/reactives/Computed.js:130

___

### #getDependenciesVersionString

▸ **#getDependenciesVersionString**(): `string`

Returns a string representation of the dependencies of the Computed value.

#### Returns

`string`

#### Defined in

src/reactives/Computed.js:111

___

### clearAllSubscribers

▸ **clearAllSubscribers**(): `void`

Removes all subscribers, including listeners for "#has-subscribers" and "#no-subscribers" events.

#### Returns

`void`

#### Inherited from

[ReactiveItem](ReactiveItem.md).[clearAllSubscribers](ReactiveItem.md#clearallsubscribers)

#### Defined in

[src/reactives/ReactiveItem.js:47](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/reactives/ReactiveItem.js#L47)

___

### clearSubscribers

▸ **clearSubscribers**(): `void`

Removes all "change" subscribers. Listeners for "#has-subscribers" and "#no-subscribers" are not removed.

#### Returns

`void`

#### Inherited from

[ReactiveItem](ReactiveItem.md).[clearSubscribers](ReactiveItem.md#clearsubscribers)

#### Defined in

[src/reactives/ReactiveItem.js:40](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/reactives/ReactiveItem.js#L40)

___

### destroy

▸ **destroy**(): `void`

Destroys the reactive item. This method is useful for cleaning up after a reactive item
that is no longer needed. It calls destroy on the engine of the reactive item, which
removes all dependencies, dependents and subscribers, and marks the engine as destroyed.

#### Returns

`void`

#### Inherited from

[ReactiveItem](ReactiveItem.md).[destroy](ReactiveItem.md#destroy)

#### Defined in

[src/reactives/ReactiveItem.js:153](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/reactives/ReactiveItem.js#L153)

___

### equals

▸ **equals**(`a`, `b?`): `boolean`

Checks if two values are equal. If the compareFn property is a function, it is used to compare the two values.
If the compareFn property is not a function, the values are compared using the === operator.
If the optional second argument is not provided, the value of the reactive item is used.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `a` | `any` | The first value to compare. |
| `b?` | `any` | The second value to compare. If not provided, the value of the reactive item is used. |

#### Returns

`boolean`

True if the two values are equal, false otherwise.

#### Inherited from

[ReactiveItem](ReactiveItem.md).[equals](ReactiveItem.md#equals)

#### Defined in

[src/reactives/ReactiveItem.js:165](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/reactives/ReactiveItem.js#L165)

___

### getLastError

▸ **getLastError**(): `Error`

Returns the last error that occurred while calculating the value of the reactive item,
or null if there is no error.

#### Returns

`Error`

The last error that occurred, or null if there is no error.

#### Inherited from

[ReactiveItem](ReactiveItem.md).[getLastError](ReactiveItem.md#getlasterror)

#### Defined in

[src/reactives/ReactiveItem.js:90](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/reactives/ReactiveItem.js#L90)

___

### getValue

▸ **getValue**(`options?`): `T`

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | `Object` | Optional options. If `untracked` is `false`, the Computed value will be added to the dependencyTracker. |
| `options.untracked?` | `boolean` | - |

#### Returns

`T`

The current value of the Computed value.

#### Overrides

[ReactiveItem](ReactiveItem.md).[getValue](ReactiveItem.md#getvalue)

#### Defined in

src/reactives/Computed.js:201

___

### hasError

▸ **hasError**(): `boolean`

Returns true if there has been an error while calculating the value of the reactive item,
false otherwise. This method returns true if the reactive item has been destroyed, if the
reactive item has an error, or if the calculation of the value of the reactive item has
thrown an error.

#### Returns

`boolean`

Whether there has been an error while calculating the value of the
reactive item.

#### Inherited from

[ReactiveItem](ReactiveItem.md).[hasError](ReactiveItem.md#haserror)

#### Defined in

[src/reactives/ReactiveItem.js:102](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/reactives/ReactiveItem.js#L102)

___

### hasSubscribers

▸ **hasSubscribers**(): `boolean`

Returns true if there are any subscribers, false otherwise.

#### Returns

`boolean`

Whether there are any subscribers.

#### Inherited from

[ReactiveItem](ReactiveItem.md).[hasSubscribers](ReactiveItem.md#hassubscribers)

#### Defined in

[src/reactives/ReactiveItem.js:55](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/reactives/ReactiveItem.js#L55)

___

### isStale

▸ **isStale**(): `boolean`

Checks whether the Computed value needs to be recalculated. A recalculation is needed if the engine's shouldRecalc
property is true, if the engine has an error, or if the version string of the dependencies has changed.

#### Returns

`boolean`

true if the Computed value needs to be recalculated, false if it does not.

#### Defined in

src/reactives/Computed.js:169

___

### onDestroy

▸ **onDestroy**(`fn`): () => `void`

Subscribes a function to be called when the reactive item is destroyed.
The function is called with no arguments.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fn` | (`reactiveItem`: [`ReactiveItem`](ReactiveItem.md)) => `void` | The function to be called. |

#### Returns

`fn`

A function that unsubscribes the given function.

▸ (): `void`

##### Returns

`void`

#### Inherited from

[ReactiveItem](ReactiveItem.md).[onDestroy](ReactiveItem.md#ondestroy)

#### Defined in

[src/reactives/ReactiveItem.js:138](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/reactives/ReactiveItem.js#L138)

___

### onHasSubscribers

▸ **onHasSubscribers**(`fn`): () => `void`

Subscribes a function to be called whenever a subscriber is added to the reactive item.
The function is called with no arguments.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fn` | () => `void` | The function to be called. |

#### Returns

`fn`

A function that unsubscribes the given function.

▸ (): `void`

##### Returns

`void`

#### Inherited from

[ReactiveItem](ReactiveItem.md).[onHasSubscribers](ReactiveItem.md#onhassubscribers)

#### Defined in

[src/reactives/ReactiveItem.js:118](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/reactives/ReactiveItem.js#L118)

___

### onNoSubscribers

▸ **onNoSubscribers**(`fn`): () => `void`

Subscribes a function to be called whenever there are no longer any subscribers.
The function is called with no arguments.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fn` | () => `void` | The function to be called. |

#### Returns

`fn`

A function that unsubscribes the given function.

▸ (): `void`

##### Returns

`void`

#### Inherited from

[ReactiveItem](ReactiveItem.md).[onNoSubscribers](ReactiveItem.md#onnosubscribers)

#### Defined in

[src/reactives/ReactiveItem.js:128](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/reactives/ReactiveItem.js#L128)

___

### peekValue

▸ **peekValue**(): `T`

Returns the current cached value of the computed without triggering a recalculation
and without tracking dependencies.

Unlike the `value` getter, this method does not check if dependencies have changed
and does not recompute the value if it's stale. It simply returns the last
computed value. This is useful for debugging or for accessing the value
without causing side effects (e.g., inside an untracked context).

If the computed has an error, this method will still return the last cached
value (which may be undefined or a previous value) without rethrowing the error.

#### Returns

`T`

The cached value.

**`Example`**

```js
const a = atom(1);
const b = computed(() => a.value * 2);

console.log(b.peekValue()); // 2 (without tracking dependencies)
a.value = 2;
console.log(b.peekValue()); // still 2 (stale, not recomputed)
console.log(b.value);       // 4 (recomputed now)
```

#### Overrides

[ReactiveItem](ReactiveItem.md).[peekValue](ReactiveItem.md#peekvalue)

#### Defined in

src/reactives/Computed.js:269

___

### subscribe

▸ **subscribe**(`fn`, `options?`): () => `void`

Subscribes a function to be called whenever the value of this reactive item changes.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fn` | (`updates`: `Map`\<`string`, [`UpdateDataRecord`](internal_.UpdateDataRecord.md)\>) => `void` | The function to be called whenever the value of this reactive item changes. |
| `options?` | `Object` | Optional options. |
| `options.delay` | `number` | The delay in milliseconds before the function is called. |
| `options.signal` | `AbortSignal` | The signal to abort the subscription. |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Inherited from

[ReactiveItem](ReactiveItem.md).[subscribe](ReactiveItem.md#subscribe)

#### Defined in

[src/reactives/ReactiveItem.js:33](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/reactives/ReactiveItem.js#L33)
