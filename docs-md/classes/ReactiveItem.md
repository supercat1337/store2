[@supercat1337/store2](../README.md) / [Modules](../modules.md) / ReactiveItem

# Class: ReactiveItem

ReactiveItem is the base class for all reactive items. It provides methods for subscribing to changes,
getting the current value, and checking for errors.

## Hierarchy

- **`ReactiveItem`**

  ↳ [`Atom`](Atom.md)

  ↳ [`Computed`](Computed.md)

  ↳ [`Collection`](Collection.md)

  ↳ [`ShallowReactive`](ShallowReactive.md)

## Table of contents

### Constructors

- [constructor](ReactiveItem.md#constructor)

### Properties

- [engine](ReactiveItem.md#engine)
- [name](ReactiveItem.md#name)

### Accessors

- [isDestroyed](ReactiveItem.md#isdestroyed)

### Methods

- [clearAllSubscribers](ReactiveItem.md#clearallsubscribers)
- [clearSubscribers](ReactiveItem.md#clearsubscribers)
- [destroy](ReactiveItem.md#destroy)
- [equals](ReactiveItem.md#equals)
- [getLastError](ReactiveItem.md#getlasterror)
- [getValue](ReactiveItem.md#getvalue)
- [hasError](ReactiveItem.md#haserror)
- [hasSubscribers](ReactiveItem.md#hassubscribers)
- [onDestroy](ReactiveItem.md#ondestroy)
- [onHasSubscribers](ReactiveItem.md#onhassubscribers)
- [onNoSubscribers](ReactiveItem.md#onnosubscribers)
- [peekValue](ReactiveItem.md#peekvalue)
- [subscribe](ReactiveItem.md#subscribe)

## Constructors

### constructor

• **new ReactiveItem**(`type`): [`ReactiveItem`](ReactiveItem.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | ``1`` \| ``2`` \| ``3`` \| ``4`` |

#### Returns

[`ReactiveItem`](ReactiveItem.md)

#### Defined in

[src/reactives/ReactiveItem.js:22](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/reactives/ReactiveItem.js#L22)

## Properties

### engine

• **engine**: [`Engine`](internal_.Engine.md)

#### Defined in

[src/reactives/ReactiveItem.js:14](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/reactives/ReactiveItem.js#L14)

___

### name

• **name**: `string` = `''`

#### Defined in

[src/reactives/ReactiveItem.js:16](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/reactives/ReactiveItem.js#L16)

## Accessors

### isDestroyed

• `get` **isDestroyed**(): `boolean`

#### Returns

`boolean`

True if the reactive item has been destroyed, false otherwise.

#### Defined in

[src/reactives/ReactiveItem.js:181](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/reactives/ReactiveItem.js#L181)

## Methods

### clearAllSubscribers

▸ **clearAllSubscribers**(): `void`

Removes all subscribers, including listeners for "#has-subscribers" and "#no-subscribers" events.

#### Returns

`void`

#### Defined in

[src/reactives/ReactiveItem.js:48](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/reactives/ReactiveItem.js#L48)

___

### clearSubscribers

▸ **clearSubscribers**(): `void`

Removes all "change" subscribers. Listeners for "#has-subscribers" and "#no-subscribers" are not removed.

#### Returns

`void`

#### Defined in

[src/reactives/ReactiveItem.js:41](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/reactives/ReactiveItem.js#L41)

___

### destroy

▸ **destroy**(): `void`

Destroys the reactive item. This method is useful for cleaning up after a reactive item
that is no longer needed. It calls destroy on the engine of the reactive item, which
removes all dependencies, dependents and subscribers, and marks the engine as destroyed.

#### Returns

`void`

#### Defined in

[src/reactives/ReactiveItem.js:154](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/reactives/ReactiveItem.js#L154)

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

[src/reactives/ReactiveItem.js:166](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/reactives/ReactiveItem.js#L166)

___

### getLastError

▸ **getLastError**(): `Error`

Returns the last error that occurred while calculating the value of the reactive item,
or null if there is no error.

#### Returns

`Error`

The last error that occurred, or null if there is no error.

#### Defined in

[src/reactives/ReactiveItem.js:91](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/reactives/ReactiveItem.js#L91)

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

[src/reactives/ReactiveItem.js:66](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/reactives/ReactiveItem.js#L66)

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

[src/reactives/ReactiveItem.js:103](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/reactives/ReactiveItem.js#L103)

___

### hasSubscribers

▸ **hasSubscribers**(): `boolean`

Returns true if there are any subscribers, false otherwise.

#### Returns

`boolean`

Whether there are any subscribers.

#### Defined in

[src/reactives/ReactiveItem.js:56](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/reactives/ReactiveItem.js#L56)

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

#### Defined in

[src/reactives/ReactiveItem.js:139](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/reactives/ReactiveItem.js#L139)

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

[src/reactives/ReactiveItem.js:119](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/reactives/ReactiveItem.js#L119)

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

[src/reactives/ReactiveItem.js:129](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/reactives/ReactiveItem.js#L129)

___

### peekValue

▸ **peekValue**(): `any`

Retrieves the current value of the reactive item.

#### Returns

`any`

The current value of the reactive item.

#### Defined in

[src/reactives/ReactiveItem.js:82](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/reactives/ReactiveItem.js#L82)

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

[src/reactives/ReactiveItem.js:34](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/reactives/ReactiveItem.js#L34)
