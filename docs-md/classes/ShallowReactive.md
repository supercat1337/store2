[@supercat1337/store2](../README.md) / [Modules](../modules.md) / ShallowReactive

# Class: ShallowReactive\<T\>

ShallowReactive is a reactive primitive that holds a shallow object. It is the base unit of reactive state.
It is a shallow reactive object, meaning that it only tracks changes to the properties of the object itself, not its nested properties.

**`Example`**

```js
const b = new ShallowReactive({ foo: 1 });

let bar = 0;

b.subscribe(() => {
    bar += 1;
});

const props = b.data;
props.foo = 2;

console.log(bar);
// Outputs: 1
```

**`Example`**

```js
class A {
    foo = 1;

    inc() {
        this.foo++;
    }
}

let bar = 0;
const b = new ShallowReactive(new A(), { name: "b" });

b.subscribe(() => {
    bar++;
});

console.log(b.data.foo);
// Outputs: 1

b.data.foo = 2;
console.log(b.data.foo);
// Outputs: 2

console.log(bar);
// Outputs: 1

b.data.inc();
console.log(b.data.foo);
// Outputs: 3
console.log(bar);
// Outputs: 2
```

## Type parameters

| Name | Description |
| :------ | :------ |
| `T` | * |

## Hierarchy

- [`ReactivePrimitive`](ReactivePrimitive.md)

  ↳ **`ShallowReactive`**

## Table of contents

### Constructors

- [constructor](ShallowReactive.md#constructor)

### Properties

- [#handler](ShallowReactive.md##handler)
- [#proxy](ShallowReactive.md##proxy)
- [#target](ShallowReactive.md##target)
- [engine](ShallowReactive.md#engine)
- [name](ShallowReactive.md#name)

### Accessors

- [data](ShallowReactive.md#data)
- [isDestroyed](ShallowReactive.md#isdestroyed)
- [value](ShallowReactive.md#value)

### Methods

- [#initHandler](ShallowReactive.md##inithandler)
- [clearAllSubscribers](ShallowReactive.md#clearallsubscribers)
- [clearSubscribers](ShallowReactive.md#clearsubscribers)
- [destroy](ShallowReactive.md#destroy)
- [equals](ShallowReactive.md#equals)
- [getLastError](ShallowReactive.md#getlasterror)
- [getRawValue](ShallowReactive.md#getrawvalue)
- [getValue](ShallowReactive.md#getvalue)
- [hasError](ShallowReactive.md#haserror)
- [hasSubscribers](ShallowReactive.md#hassubscribers)
- [onDestroy](ShallowReactive.md#ondestroy)
- [onHasSubscribers](ShallowReactive.md#onhassubscribers)
- [onNoSubscribers](ShallowReactive.md#onnosubscribers)
- [peekValue](ShallowReactive.md#peekvalue)
- [setValue](ShallowReactive.md#setvalue)
- [subscribe](ShallowReactive.md#subscribe)

## Constructors

### constructor

• **new ShallowReactive**\<`T`\>(`value`, `options?`): [`ShallowReactive`](ShallowReactive.md)\<`T`\>

Initializes a ShallowReactive instance with a given value.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Object` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `T` | The initial value of the ShallowReactive. |
| `options?` | `Object` | Options. |
| `options.name` | `string` | The name of the ShallowReactive. |

#### Returns

[`ShallowReactive`](ShallowReactive.md)\<`T`\>

#### Overrides

[ReactivePrimitive](ReactivePrimitive.md).[constructor](ReactivePrimitive.md#constructor)

#### Defined in

src/reactives/ShallowReactive.js:80

## Properties

### #handler

• `Private` **#handler**: [`ProxyHandler`](../interfaces/internal_.ProxyHandler.md)\<`T`\>

#### Defined in

src/reactives/ShallowReactive.js:72

___

### #proxy

• `Private` **#proxy**: `T`

#### Defined in

src/reactives/ShallowReactive.js:69

___

### #target

• `Private` **#target**: `T`

#### Defined in

src/reactives/ShallowReactive.js:66

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

src/reactives/ShallowReactive.js:88

## Accessors

### data

• `get` **data**(): `T`

Retrieves the proxied value of the ShallowReactive. If the engine is destroyed, an error is thrown.
Tracks the ShallowReactive for dependency management.

#### Returns

`T`

The proxied value of the ShallowReactive.

#### Defined in

src/reactives/ShallowReactive.js:237

• `set` **data**(`value`): `void`

Sets the value of the ShallowReactive. If the value is an object, it will be proxied and reactive.
This is a synonym for `set value(value)`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `T` | The new value of the ShallowReactive. |

#### Returns

`void`

#### Defined in

src/reactives/ShallowReactive.js:219

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

• `get` **value**(): `T`

Retrieves the proxied value of the ShallowReactive. If the engine is destroyed, an error is thrown.
Tracks the ShallowReactive for dependency management.

#### Returns

`T`

The proxied value of the ShallowReactive.

#### Defined in

src/reactives/ShallowReactive.js:228

• `set` **value**(`value`): `void`

Sets the value of the ShallowReactive. If the value is an object, it will be proxied and reactive.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `T` | The new value of the ShallowReactive. |

#### Returns

`void`

#### Defined in

src/reactives/ShallowReactive.js:210

## Methods

### #initHandler

▸ **#initHandler**(): `Object`

#### Returns

`Object`

| Name | Type | Description |
| :------ | :------ | :------ |
| `deleteProperty` | (`target`: `T`, `key`: `string`) => `boolean` | - |
| `get` | (`target`: `T`, `key`: `string`) => `any` | - |
| `set` | (`target`: `T`, `key`: `string`, `value`: `any`) => `boolean` | - |

#### Defined in

src/reactives/ShallowReactive.js:101

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

▸ **getRawValue**(): `T`

Returns the raw, unproxied value of the ShallowReactive. This is generally not recommended as it breaks reactivity.

#### Returns

`T`

The raw, unproxied value of the ShallowReactive.

#### Defined in

src/reactives/ShallowReactive.js:245

___

### getValue

▸ **getValue**(`options?`): `T`

Retrieves the proxied value of the ShallowReactive. If the engine is destroyed, an error is thrown.
Tracks the ShallowReactive for dependency management.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | `Object` | Optional options. If `untracked` is `false`, the ShallowReactive value will be added to the dependencyTracker. |
| `options.untracked?` | `boolean` | - |

#### Returns

`T`

The proxied value of the ShallowReactive.

#### Overrides

[ReactivePrimitive](ReactivePrimitive.md).[getValue](ReactivePrimitive.md#getvalue)

#### Defined in

src/reactives/ShallowReactive.js:177

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

### setValue

▸ **setValue**(`value`): `void`

Sets the value of the ShallowReactive. If the value is an object, it will be proxied and reactive.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `T` | The new value of the ShallowReactive. |

#### Returns

`void`

#### Defined in

src/reactives/ShallowReactive.js:186

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
