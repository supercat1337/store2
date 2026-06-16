[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / BatchSnapshot

# Class: BatchSnapshot

[\<internal\>](../modules/internal_.md).BatchSnapshot

BatchSnapshot stores the original values of properties at the start of a batch operation.
It allows detecting which properties have actually changed after a series of mutations
inside a batch, and whether they have reverted to their original values.

## Table of contents

### Constructors

- [constructor](internal_.BatchSnapshot.md#constructor)

### Properties

- [#initialValues](internal_.BatchSnapshot.md##initialvalues)
- [#reactiveItem](internal_.BatchSnapshot.md##reactiveitem)

### Accessors

- [size](internal_.BatchSnapshot.md#size)

### Methods

- [clear](internal_.BatchSnapshot.md#clear)
- [getChangedProperties](internal_.BatchSnapshot.md#getchangedproperties)
- [getOriginal](internal_.BatchSnapshot.md#getoriginal)
- [has](internal_.BatchSnapshot.md#has)
- [record](internal_.BatchSnapshot.md#record)

## Constructors

### constructor

• **new BatchSnapshot**(`reactiveItem`): [`BatchSnapshot`](internal_.BatchSnapshot.md)

Creates a new BatchSnapshot instance.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `reactiveItem` | [`ReactiveItem`](ReactiveItem.md) | The reactive item to snapshot. |

#### Returns

[`BatchSnapshot`](internal_.BatchSnapshot.md)

#### Defined in

[src/core/BatchSnapshot.js:26](https://github.com/supercat1337/store2/blob/092e7aaba8ac2329715b3d46c6a0217f1d1972eb/src/core/BatchSnapshot.js#L26)

## Properties

### #initialValues

• `Private` **#initialValues**: `Map`\<`string`, `any`\>

Map storing original values for each property key.

#### Defined in

[src/core/BatchSnapshot.js:13](https://github.com/supercat1337/store2/blob/092e7aaba8ac2329715b3d46c6a0217f1d1972eb/src/core/BatchSnapshot.js#L13)

___

### #reactiveItem

• `Private` **#reactiveItem**: [`ReactiveItem`](ReactiveItem.md)

Reference to the reactive item this snapshot belongs to.
Used to access the equality comparison function.

#### Defined in

[src/core/BatchSnapshot.js:20](https://github.com/supercat1337/store2/blob/092e7aaba8ac2329715b3d46c6a0217f1d1972eb/src/core/BatchSnapshot.js#L20)

## Accessors

### size

• `get` **size**(): `number`

Returns the number of recorded properties.

#### Returns

`number`

#### Defined in

[src/core/BatchSnapshot.js:87](https://github.com/supercat1337/store2/blob/092e7aaba8ac2329715b3d46c6a0217f1d1972eb/src/core/BatchSnapshot.js#L87)

## Methods

### clear

▸ **clear**(): `void`

Clears all recorded initial values.

#### Returns

`void`

#### Defined in

[src/core/BatchSnapshot.js:79](https://github.com/supercat1337/store2/blob/092e7aaba8ac2329715b3d46c6a0217f1d1972eb/src/core/BatchSnapshot.js#L79)

___

### getChangedProperties

▸ **getChangedProperties**(`getCurrentValue`): `string`[]

Returns an array of property keys that have changed compared to their original values.
Uses the reactive item's equality comparison function.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `getCurrentValue` | (`property`: `string`) => `any` | Function that returns the current value for a given property. |

#### Returns

`string`[]

Array of property keys that actually changed.

#### Defined in

[src/core/BatchSnapshot.js:65](https://github.com/supercat1337/store2/blob/092e7aaba8ac2329715b3d46c6a0217f1d1972eb/src/core/BatchSnapshot.js#L65)

___

### getOriginal

▸ **getOriginal**(`property`): `any`

Returns the original value recorded for a property.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `property` | `string` | The property key. |

#### Returns

`any`

The original value, or undefined if not recorded.

#### Defined in

[src/core/BatchSnapshot.js:46](https://github.com/supercat1337/store2/blob/092e7aaba8ac2329715b3d46c6a0217f1d1972eb/src/core/BatchSnapshot.js#L46)

___

### has

▸ **has**(`property`): `boolean`

Checks whether a property has been recorded in this snapshot.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `property` | `string` | The property key. |

#### Returns

`boolean`

True if the property was recorded.

#### Defined in

[src/core/BatchSnapshot.js:55](https://github.com/supercat1337/store2/blob/092e7aaba8ac2329715b3d46c6a0217f1d1972eb/src/core/BatchSnapshot.js#L55)

___

### record

▸ **record**(`property`, `value`): `void`

Records the original value for a property if not already recorded in this batch.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `property` | `string` | The property key. |
| `value` | `any` | The original value at the start of the batch. |

#### Returns

`void`

#### Defined in

[src/core/BatchSnapshot.js:35](https://github.com/supercat1337/store2/blob/092e7aaba8ac2329715b3d46c6a0217f1d1972eb/src/core/BatchSnapshot.js#L35)
