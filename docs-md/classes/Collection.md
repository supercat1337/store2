[@supercat1337/store2](../README.md) / [Modules](../modules.md) / Collection

# Class: Collection\<T\>

Collection is a reactive primitive that holds an array of values.
It provides reactivity for array operations (push, pop, splice, etc.)
and allows tracking changes to individual elements and the array length.

**`Example`**

```js
const coll = new Collection([1, 2, 3]);
coll.subscribe((updates) => {
    console.log('Collection changed:', Array.from(updates.keys()));
});
coll.value.push(4); // triggers reactivity
```

## Type parameters

| Name |
| :------ |
| `T` |

## Hierarchy

- [`ReactivePrimitive`](ReactivePrimitive.md)

  ↳ **`Collection`**

## Table of contents

### Constructors

- [constructor](Collection.md#constructor)

### Properties

- [#handler](Collection.md##handler)
- [#length](Collection.md##length)
- [#proxy](Collection.md##proxy)
- [#target](Collection.md##target)
- [engine](Collection.md#engine)
- [name](Collection.md#name)

### Accessors

- [data](Collection.md#data)
- [isDestroyed](Collection.md#isdestroyed)
- [value](Collection.md#value)

### Methods

- [#initHandler](Collection.md##inithandler)
- [clearAllSubscribers](Collection.md#clearallsubscribers)
- [clearSubscribers](Collection.md#clearsubscribers)
- [destroy](Collection.md#destroy)
- [equals](Collection.md#equals)
- [getLastError](Collection.md#getlasterror)
- [getRawValue](Collection.md#getrawvalue)
- [getValue](Collection.md#getvalue)
- [hasError](Collection.md#haserror)
- [hasSubscribers](Collection.md#hassubscribers)
- [onDestroy](Collection.md#ondestroy)
- [onHasSubscribers](Collection.md#onhassubscribers)
- [onNoSubscribers](Collection.md#onnosubscribers)
- [peekValue](Collection.md#peekvalue)
- [subscribe](Collection.md#subscribe)

## Constructors

### constructor

• **new Collection**\<`T`\>(`value`, `options?`): [`Collection`](Collection.md)\<`T`\>

Initializes a Collection instance with an initial array.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `T`[] | The initial array value. |
| `options?` | `Object` | Configuration options. |
| `options.compareFunction` | [`CompareFunction`](../modules/internal_.md#comparefunction) | Custom equality function for values. |
| `options.name` | `string` | The name of the Collection (for debugging). |

#### Returns

[`Collection`](Collection.md)\<`T`\>

#### Overrides

[ReactivePrimitive](ReactivePrimitive.md).[constructor](ReactivePrimitive.md#constructor)

#### Defined in

src/reactives/Collection.js:41

## Properties

### #handler

• `Private` **#handler**: [`ProxyHandler`](../interfaces/internal_.ProxyHandler.md)\<`T`[]\>

#### Defined in

src/reactives/Collection.js:31

___

### #length

• `Private` **#length**: `number` = `0`

#### Defined in

src/reactives/Collection.js:29

___

### #proxy

• `Private` **#proxy**: `T`[]

#### Defined in

src/reactives/Collection.js:27

___

### #target

• `Private` **#target**: `T`[]

#### Defined in

src/reactives/Collection.js:25

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

src/reactives/Collection.js:43

## Accessors

### data

• `get` **data**(): `T`[]

Alias for `value` getter.

#### Returns

`T`[]

The reactive array proxy.

#### Defined in

src/reactives/Collection.js:217

• `set` **data**(`value`): `void`

Alias for `value` setter.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `T`[] | The new array value. |

#### Returns

`void`

#### Defined in

src/reactives/Collection.js:208

___

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

• `get` **value**(): `T`[]

Returns the proxied array value (same as getValue()).

#### Returns

`T`[]

The reactive array proxy.

#### Defined in

src/reactives/Collection.js:199

• `set` **value**(`value`): `void`

Sets the entire array, replacing all elements.
Only triggers reactivity if the new array differs from the current one.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `T`[] | The new array value. |

#### Returns

`void`

#### Defined in

src/reactives/Collection.js:160

## Methods

### #initHandler

▸ **#initHandler**(): [`ProxyHandler`](../interfaces/internal_.ProxyHandler.md)\<`T`[]\>

Initializes the proxy handler for array interception.

#### Returns

[`ProxyHandler`](../interfaces/internal_.ProxyHandler.md)\<`T`[]\>

The proxy handler object.

#### Defined in

src/reactives/Collection.js:60

___

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

### getRawValue

▸ **getRawValue**(): `T`[]

Returns the raw, unproxied target array.
Warning: Mutating the raw array directly does NOT trigger reactivity.

#### Returns

`T`[]

The raw array.

#### Defined in

src/reactives/Collection.js:227

___

### getValue

▸ **getValue**(`options?`): `T`[]

Returns the proxied array value.
Tracks this Collection as a dependency when accessed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | `Object` | If `untracked` is true, does not add to dependency tracker. |
| `options.untracked?` | `boolean` | - |

#### Returns

`T`[]

The reactive array proxy.

#### Overrides

[ReactivePrimitive](ReactivePrimitive.md).[getValue](ReactivePrimitive.md#getvalue)

#### Defined in

src/reactives/Collection.js:189

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
