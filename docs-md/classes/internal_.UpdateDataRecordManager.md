[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / UpdateDataRecordManager

# Class: UpdateDataRecordManager

[\<internal\>](../modules/internal_.md).UpdateDataRecordManager

## Table of contents

### Constructors

- [constructor](internal_.UpdateDataRecordManager.md#constructor)

### Properties

- [data](internal_.UpdateDataRecordManager.md#data)

### Methods

- [removeItem](internal_.UpdateDataRecordManager.md#removeitem)

## Constructors

### constructor

• **new UpdateDataRecordManager**(`data`): [`UpdateDataRecordManager`](internal_.UpdateDataRecordManager.md)

Initializes an instance of UpdateDataRecordManager with the given data.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | `Map`\<`string`, [`UpdateDataRecord`](internal_.UpdateDataRecord.md)\> | The data to be managed. |

#### Returns

[`UpdateDataRecordManager`](internal_.UpdateDataRecordManager.md)

#### Defined in

[src/core/UpdateDataRecord.js:36](https://github.com/supercat1337/store2/blob/092e7aaba8ac2329715b3d46c6a0217f1d1972eb/src/core/UpdateDataRecord.js#L36)

## Properties

### data

• **data**: `Map`\<`string`, [`UpdateDataRecord`](internal_.UpdateDataRecord.md)\>

#### Defined in

[src/core/UpdateDataRecord.js:37](https://github.com/supercat1337/store2/blob/092e7aaba8ac2329715b3d46c6a0217f1d1972eb/src/core/UpdateDataRecord.js#L37)

## Methods

### removeItem

▸ **removeItem**(`itemName`): `void`

Removes the specified item and its related sub-items from the data map.
Replaces the deleted items with new UpdateDataRecord instances indicating the "delete" action.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `itemName` | `string` | The name of the item to be destroyed. |

#### Returns

`void`

#### Defined in

[src/core/UpdateDataRecord.js:45](https://github.com/supercat1337/store2/blob/092e7aaba8ac2329715b3d46c6a0217f1d1972eb/src/core/UpdateDataRecord.js#L45)
