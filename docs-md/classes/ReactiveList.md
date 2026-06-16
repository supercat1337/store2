[@supercat1337/store2](../README.md) / [Modules](../modules.md) / ReactiveList

# Class: ReactiveList\<T\>

ReactiveList is a reactive array-like structure that stores values of any type.
It automatically chooses the appropriate reactive item:
- Objects and arrays are wrapped with `ShallowReactive` (shallow property tracking).
- Primitives (numbers, strings, booleans, etc.) are wrapped with `Atom`.

The list supports adding, removing, updating, and splicing items while maintaining
full reactivity. Subscribers are notified only once per batch of changes.

**`Example`**

```js
const list = new ReactiveList();

list.subscribe(() => {
    console.log('List changed:', list.toArray());
});

list.add(1, 2, 3);                // numbers -> stored as Atom
list.setItem(1, 42);
list.removeRange(0, 1);
list.setItems([{ a: 1 }, { b: 2 }]); // objects -> stored as ShallowReactive
```

## Type parameters

| Name |
| :------ |
| `T` |

## Table of contents

### Constructors

- [constructor](ReactiveList.md#constructor)

### Properties

- [#lengthAtom](ReactiveList.md##lengthatom)
- [#store](ReactiveList.md##store)

### Accessors

- [isDestroyed](ReactiveList.md#isdestroyed)
- [length](ReactiveList.md#length)

### Methods

- [#createReactiveItem](ReactiveList.md##createreactiveitem)
- [#updateReactiveItem](ReactiveList.md##updatereactiveitem)
- [add](ReactiveList.md#add)
- [clear](ReactiveList.md#clear)
- [destroy](ReactiveList.md#destroy)
- [getItem](ReactiveList.md#getitem)
- [removeFirstItem](ReactiveList.md#removefirstitem)
- [removeItem](ReactiveList.md#removeitem)
- [removeLastItem](ReactiveList.md#removelastitem)
- [removeRange](ReactiveList.md#removerange)
- [setItem](ReactiveList.md#setitem)
- [setItems](ReactiveList.md#setitems)
- [subscribe](ReactiveList.md#subscribe)
- [toArray](ReactiveList.md#toarray)

## Constructors

### constructor

• **new ReactiveList**\<`T`\>(): [`ReactiveList`](ReactiveList.md)\<`T`\>

Creates a new empty ReactiveList.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Object` |

#### Returns

[`ReactiveList`](ReactiveList.md)\<`T`\>

#### Defined in

src/complex/ReactiveList.js:57

## Properties

### #lengthAtom

• `Private` **#lengthAtom**: [`Atom`](Atom.md)\<`number`\>

#### Defined in

src/complex/ReactiveList.js:49

___

### #store

• `Private` **#store**: [`Store`](Store.md)

#### Defined in

src/complex/ReactiveList.js:52

## Accessors

### isDestroyed

• `get` **isDestroyed**(): `boolean`

Indicates whether the list has been destroyed.

#### Returns

`boolean`

#### Defined in

src/complex/ReactiveList.js:319

___

### length

• `get` **length**(): `number`

Returns the current length of the list.

#### Returns

`number`

#### Defined in

src/complex/ReactiveList.js:176

## Methods

### #createReactiveItem

▸ **#createReactiveItem**(`value`, `name`): [`ShallowReactive`](ShallowReactive.md)\<`any`\>

Creates a reactive wrapper for the given value.
Uses ShallowReactive for objects/arrays, Atom for items.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `any` | The value to wrap. |
| `name` | `string` | The name to assign to the reactive item (used for debugging). |

#### Returns

[`ShallowReactive`](ShallowReactive.md)\<`any`\>

The reactive wrapper.

#### Defined in

src/complex/ReactiveList.js:74

___

### #updateReactiveItem

▸ **#updateReactiveItem**(`wrapper`, `newValue`): `void`

Updates the value of a reactive wrapper.
Works for both Atom and ShallowReactive.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapper` | [`ShallowReactive`](ShallowReactive.md)\<`any`\> | The reactive wrapper. |
| `newValue` | `any` | The new value to set. |

#### Returns

`void`

#### Defined in

src/complex/ReactiveList.js:89

___

### add

▸ **add**(`...values`): `void`

Adds one or more items to the end of the list.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...values` | `T`[] | The values to add. |

#### Returns

`void`

#### Defined in

src/complex/ReactiveList.js:99

___

### clear

▸ **clear**(): `void`

Removes all items from the list.

#### Returns

`void`

#### Defined in

src/complex/ReactiveList.js:300

___

### destroy

▸ **destroy**(): `void`

Destroys the list, releasing all internal resources.
After destruction, any method call (except `isDestroyed`) will throw an error.

#### Returns

`void`

#### Defined in

src/complex/ReactiveList.js:308

___

### getItem

▸ **getItem**(`index`): `T`

Retrieves the value at the given index.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `index` | `number` | The index of the item to retrieve. |

#### Returns

`T`

The value, or undefined if the index is out of bounds.

#### Defined in

src/complex/ReactiveList.js:131

___

### removeFirstItem

▸ **removeFirstItem**(): `void`

Removes the first item of the list.

#### Returns

`void`

#### Defined in

src/complex/ReactiveList.js:293

___

### removeItem

▸ **removeItem**(`index`): `void`

Removes the item at the given index.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `index` | `number` | The index of the item to remove. |

#### Returns

`void`

#### Defined in

src/complex/ReactiveList.js:279

___

### removeLastItem

▸ **removeLastItem**(): `void`

Removes the last item of the list.

#### Returns

`void`

#### Defined in

src/complex/ReactiveList.js:286

___

### removeRange

▸ **removeRange**(`startIndex`, `count`): `void`

Removes elements from the list starting at `startIndex` and removing `count` items.
Remaining elements are shifted left. The operation is batched to emit only one notification.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `startIndex` | `number` | The index at which to start removal. |
| `count` | `number` | The number of elements to remove. |

#### Returns

`void`

#### Defined in

src/complex/ReactiveList.js:238

___

### setItem

▸ **setItem**(`index`, `value`): `void`

Updates the value at the specified index.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `index` | `number` | The index to update. |
| `value` | `T` | The new value. |

#### Returns

`void`

#### Defined in

src/complex/ReactiveList.js:161

___

### setItems

▸ **setItems**(`values`): `void`

Replaces the entire content of the list with the given array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `values` | `T`[] | The new array of values. |

#### Returns

`void`

#### Defined in

src/complex/ReactiveList.js:186

___

### subscribe

▸ **subscribe**(`fn`): () => `void`

Subscribes a callback to be invoked whenever the list changes.
The callback receives a Map of updates with details about changed items.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fn` | (`updates`: `Map`\<`string`, [`UpdateDataRecord`](internal_.UpdateDataRecord.md)\>) => `void` | The callback function. |

#### Returns

`fn`

A function to unsubscribe the callback.

▸ (): `void`

##### Returns

`void`

#### Defined in

src/complex/ReactiveList.js:330

___

### toArray

▸ **toArray**(): `T`[]

Returns a shallow copy of all items in the list as a plain array.

#### Returns

`T`[]

An array containing all values.

#### Defined in

src/complex/ReactiveList.js:143
