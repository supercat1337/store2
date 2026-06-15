[@supercat1337/store2](../README.md) / [Modules](../modules.md) / ReactivePrimitive

# Class: ReactivePrimitive

ReactivePrimitive is the base class for all reactive items. It provides methods for subscribing to changes,
getting the current value, and checking for errors.

## Hierarchy

- **`ReactivePrimitive`**

  ↳ [`Atom`](Atom.md)

  ↳ [`Computed`](Computed.md)

  ↳ [`Collection`](Collection.md)

  ↳ [`ShallowReactive`](ShallowReactive.md)

## Table of contents

### Constructors

- [constructor](ReactivePrimitive.md#constructor)

### Properties

- [engine](ReactivePrimitive.md#engine)
- [name](ReactivePrimitive.md#name)

### Accessors

- [isDestroyed](ReactivePrimitive.md#isdestroyed)

### Methods

- [clearAllSubscribers](ReactivePrimitive.md#clearallsubscribers)
- [clearSubscribers](ReactivePrimitive.md#clearsubscribers)
- [destroy](ReactivePrimitive.md#destroy)
- [equals](ReactivePrimitive.md#equals)
- [getLastError](ReactivePrimitive.md#getlasterror)
- [getValue](ReactivePrimitive.md#getvalue)
- [hasError](ReactivePrimitive.md#haserror)
- [hasSubscribers](ReactivePrimitive.md#hassubscribers)
- [onDestroy](ReactivePrimitive.md#ondestroy)
- [onHasSubscribers](ReactivePrimitive.md#onhassubscribers)
- [onNoSubscribers](ReactivePrimitive.md#onnosubscribers)
- [peekValue](ReactivePrimitive.md#peekvalue)
- [subscribe](ReactivePrimitive.md#subscribe)

## Constructors

### constructor

• **new ReactivePrimitive**(`type`): [`ReactivePrimitive`](ReactivePrimitive.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | ``1`` \| ``2`` \| ``3`` \| ``4`` |

#### Returns

[`ReactivePrimitive`](ReactivePrimitive.md)

#### Defined in

src/reactives/ReactivePrimitive.js:21

## Properties

### engine

• **engine**: [`Engine`](internal_.Engine.md)

#### Defined in

src/reactives/ReactivePrimitive.js:13

___

### name

• **name**: `string` = `''`

#### Defined in

src/reactives/ReactivePrimitive.js:15

## Accessors

### isDestroyed

• `get` **isDestroyed**(): `boolean`

#### Returns

`boolean`

True if the reactive item has been destroyed, false otherwise.

#### Defined in

src/reactives/ReactivePrimitive.js:180

## Methods

### clearAllSubscribers

▸ **clearAllSubscribers**(): `void`

Removes all subscribers, including listeners for "#has-subscribers" and "#no-subscribers" events.

#### Returns

`void`

#### Defined in

src/reactives/ReactivePrimitive.js:47

___

### clearSubscribers

▸ **clearSubscribers**(): `void`

Removes all "change" subscribers. Listeners for "#has-subscribers" and "#no-subscribers" are not removed.

#### Returns

`void`

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

#### Defined in

src/reactives/ReactivePrimitive.js:90

___

### getValue

▸ **getValue**(`options?`): `any`

Retrieves the current value of the reactive item.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | `Object` | Optional options. |
| `options.untracked` | `boolean` | If `true`, the value will not be added to the dependencyTracker. |

#### Returns

`any`

The current value of the reactive item.

#### Defined in

src/reactives/ReactivePrimitive.js:65

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

#### Defined in

src/reactives/ReactivePrimitive.js:102

___

### hasSubscribers

▸ **hasSubscribers**(): `boolean`

Returns true if there are any subscribers, false otherwise.

#### Returns

`boolean`

Whether there are any subscribers.

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

#### Defined in

src/reactives/ReactivePrimitive.js:128

___

### peekValue

▸ **peekValue**(): `any`

Retrieves the current value of the reactive item.

#### Returns

`any`

The current value of the reactive item.

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

#### Defined in

src/reactives/ReactivePrimitive.js:33
