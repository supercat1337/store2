[@supercat1337/store2](../README.md) / [Modules](../modules.md) / Atom

# Class: Atom\<T\>

Atom is a reactive primitive that holds a value. It is the base unit of reactive state.

**`Example`**

```js
const a = new Atom(0); // same as const a = atom(0);
const b = new Atom(0);

const c = new Computed(() => a.value + b.value);

c.subscribe(() => {
    console.log(c.name, c.value);
});

a.subscribe(() => {
    console.log(a.name, a.value);
});

b.subscribe(() => {
    console.log(b.name, b.value);
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

- [`ReactivePrimitive`](ReactivePrimitive.md)

  ↳ **`Atom`**

## Table of contents

### Constructors

- [constructor](Atom.md#constructor)

### Properties

- [#currentValue](Atom.md##currentvalue)
- [engine](Atom.md#engine)
- [name](Atom.md#name)

### Accessors

- [isDestroyed](Atom.md#isdestroyed)
- [value](Atom.md#value)
- [valueUntracked](Atom.md#valueuntracked)

### Methods

- [clearAllSubscribers](Atom.md#clearallsubscribers)
- [clearSubscribers](Atom.md#clearsubscribers)
- [destroy](Atom.md#destroy)
- [equals](Atom.md#equals)
- [getLastError](Atom.md#getlasterror)
- [getValue](Atom.md#getvalue)
- [hasError](Atom.md#haserror)
- [hasSubscribers](Atom.md#hassubscribers)
- [onDestroy](Atom.md#ondestroy)
- [onHasSubscribers](Atom.md#onhassubscribers)
- [onNoSubscribers](Atom.md#onnosubscribers)
- [peekValue](Atom.md#peekvalue)
- [subscribe](Atom.md#subscribe)

## Constructors

### constructor

• **new Atom**\<`T`\>(`value`, `options?`): [`Atom`](Atom.md)\<`T`\>

Initializes an Atom instance with a given value.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `T` | The initial value of the Atom. |
| `options?` | `Object` | Options. |
| `options.compareFunction` | (`a`: `T`, `b`: `T`) => `boolean` | A function that compares two values for equality. |
| `options.name` | `string` | The name of the Atom. |

#### Returns

[`Atom`](Atom.md)\<`T`\>

#### Overrides

[ReactivePrimitive](ReactivePrimitive.md).[constructor](ReactivePrimitive.md#constructor)

#### Defined in

src/reactives/Atom.js:64

## Properties

### #currentValue

• `Private` **#currentValue**: `T`

#### Defined in

src/reactives/Atom.js:55

___

### engine

• **engine**: [`Engine`](internal_.Engine.md)

#### Inherited from

[ReactivePrimitive](ReactivePrimitive.md).[engine](ReactivePrimitive.md#engine)

#### Defined in

src/reactives/ReactivePrimitive.js:13

___

### name

• **name**: `string`

#### Inherited from

[ReactivePrimitive](ReactivePrimitive.md).[name](ReactivePrimitive.md#name)

#### Defined in

src/reactives/Atom.js:79

## Accessors

### isDestroyed

• `get` **isDestroyed**(): `boolean`

#### Returns

`boolean`

True if the reactive item has been destroyed, false otherwise.

#### Inherited from

ReactivePrimitive.isDestroyed

#### Defined in

src/reactives/ReactivePrimitive.js:180

___

### value

• `get` **value**(): `T`

Returns the current value of the Atom. If the engine is destroyed, an error is thrown.

#### Returns

`T`

The current value of the Atom.

#### Defined in

src/reactives/Atom.js:128

• `set` **value**(`value`): `void`

Sets the value of the Atom. If the new value is the same as the current value, no action is taken.
Updates the current value to the new value if they are different.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `T` | The new value to set for the Atom. |

#### Returns

`void`

#### Defined in

src/reactives/Atom.js:89

___

### valueUntracked

• `get` **valueUntracked**(): `T`

Returns the current value of the Atom without tracking it for dependency management.
This is useful when you want to access the value without affecting its reactive state.

#### Returns

`T`

The current value of the Atom.

**`Example`**

```js
const a = atom(0);
const b = atom(0);
const c = computed(() => a.value + b.valueUntracked, {
    name: "c",
});

c.subscribe(() => {
    console.log(c.name, c.value);
});
console.log("change b.value");
b.value++;
b.value++;
console.log("change a.value");
a.value++;
// Output: c 3
a.value++;
// Output: c 4
```

#### Defined in

src/reactives/Atom.js:157

## Methods

### clearAllSubscribers

▸ **clearAllSubscribers**(): `void`

Removes all subscribers, including listeners for "#has-subscribers" and "#no-subscribers" events.

#### Returns

`void`

#### Inherited from

[ReactivePrimitive](ReactivePrimitive.md).[clearAllSubscribers](ReactivePrimitive.md#clearallsubscribers)

#### Defined in

src/reactives/ReactivePrimitive.js:47

___

### clearSubscribers

▸ **clearSubscribers**(): `void`

Removes all "change" subscribers. Listeners for "#has-subscribers" and "#no-subscribers" are not removed.

#### Returns

`void`

#### Inherited from

[ReactivePrimitive](ReactivePrimitive.md).[clearSubscribers](ReactivePrimitive.md#clearsubscribers)

#### Defined in

src/reactives/ReactivePrimitive.js:40

___

### destroy

▸ **destroy**(): `void`

Destroys the reactive item. This method is useful for cleaning up after a reactive item
that is no longer needed. It calls destroy on the engine of the reactive item, which
removes all dependencies, dependents and subscribers, and marks the engine as destroyed.

#### Returns

`void`

#### Inherited from

[ReactivePrimitive](ReactivePrimitive.md).[destroy](ReactivePrimitive.md#destroy)

#### Defined in

src/reactives/ReactivePrimitive.js:153

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

[ReactivePrimitive](ReactivePrimitive.md).[equals](ReactivePrimitive.md#equals)

#### Defined in

src/reactives/ReactivePrimitive.js:165

___

### getLastError

▸ **getLastError**(): `Error`

Returns the last error that occurred while calculating the value of the reactive item,
or null if there is no error.

#### Returns

`Error`

The last error that occurred, or null if there is no error.

#### Inherited from

[ReactivePrimitive](ReactivePrimitive.md).[getLastError](ReactivePrimitive.md#getlasterror)

#### Defined in

src/reactives/ReactivePrimitive.js:90

___

### getValue

▸ **getValue**(`options?`): `T`

Retrieves the current value of the Atom. If the engine is destroyed, an error is thrown.
Tracks the Atom for dependency management.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | `Object` | Optional options. If `untracked` is `false`, the Atom value will be added to the dependencyTracker. |
| `options.untracked?` | `boolean` | - |

#### Returns

`T`

The current value of the Atom.

#### Overrides

[ReactivePrimitive](ReactivePrimitive.md).[getValue](ReactivePrimitive.md#getvalue)

#### Defined in

src/reactives/Atom.js:119

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

[ReactivePrimitive](ReactivePrimitive.md).[hasError](ReactivePrimitive.md#haserror)

#### Defined in

src/reactives/ReactivePrimitive.js:102

___

### hasSubscribers

▸ **hasSubscribers**(): `boolean`

Returns true if there are any subscribers, false otherwise.

#### Returns

`boolean`

Whether there are any subscribers.

#### Inherited from

[ReactivePrimitive](ReactivePrimitive.md).[hasSubscribers](ReactivePrimitive.md#hassubscribers)

#### Defined in

src/reactives/ReactivePrimitive.js:55

___

### onDestroy

▸ **onDestroy**(`fn`): () => `void`

Subscribes a function to be called when the reactive item is destroyed.
The function is called with no arguments.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fn` | (`reactiveItem`: [`ReactivePrimitive`](ReactivePrimitive.md)) => `void` | The function to be called. |

#### Returns

`fn`

A function that unsubscribes the given function.

▸ (): `void`

##### Returns

`void`

#### Inherited from

[ReactivePrimitive](ReactivePrimitive.md).[onDestroy](ReactivePrimitive.md#ondestroy)

#### Defined in

src/reactives/ReactivePrimitive.js:138

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

[ReactivePrimitive](ReactivePrimitive.md).[onHasSubscribers](ReactivePrimitive.md#onhassubscribers)

#### Defined in

src/reactives/ReactivePrimitive.js:118

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

[ReactivePrimitive](ReactivePrimitive.md).[onNoSubscribers](ReactivePrimitive.md#onnosubscribers)

#### Defined in

src/reactives/ReactivePrimitive.js:128

___

### peekValue

▸ **peekValue**(): `any`

Retrieves the current value of the reactive item.

#### Returns

`any`

The current value of the reactive item.

#### Inherited from

[ReactivePrimitive](ReactivePrimitive.md).[peekValue](ReactivePrimitive.md#peekvalue)

#### Defined in

src/reactives/ReactivePrimitive.js:81

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

[ReactivePrimitive](ReactivePrimitive.md).[subscribe](ReactivePrimitive.md#subscribe)

#### Defined in

src/reactives/ReactivePrimitive.js:33
