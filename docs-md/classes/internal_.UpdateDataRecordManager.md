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

[src/core/UpdateDataRecord.js:45](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/UpdateDataRecord.js#L45)

## Properties

### data

• **data**: `Map`\<`string`, [`UpdateDataRecord`](internal_.UpdateDataRecord.md)\>

#### Defined in

[src/core/UpdateDataRecord.js:46](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/UpdateDataRecord.js#L46)

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

[src/core/UpdateDataRecord.js:54](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/UpdateDataRecord.js#L54)
