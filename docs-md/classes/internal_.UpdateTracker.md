[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / UpdateTracker

# Class: UpdateTracker

[\<internal\>](../modules/internal_.md).UpdateTracker

Tracks updates and batch snapshots for a reactive item.
Manages the `updates` map and handles batch change detection.

## Table of contents

### Constructors

- [constructor](internal_.UpdateTracker.md#constructor)

### Properties

- [#batchSnapshot](internal_.UpdateTracker.md##batchsnapshot)
- [#engine](internal_.UpdateTracker.md##engine)
- [#reactiveItem](internal_.UpdateTracker.md##reactiveitem)
- [#updates](internal_.UpdateTracker.md##updates)

### Methods

- [#recordChange](internal_.UpdateTracker.md##recordchange)
- [addUpdate](internal_.UpdateTracker.md#addupdate)
- [checkChangesTemporary](internal_.UpdateTracker.md#checkchangestemporary)
- [clearUpdates](internal_.UpdateTracker.md#clearupdates)
- [hasUpdates](internal_.UpdateTracker.md#hasupdates)
- [isEffectiveChange](internal_.UpdateTracker.md#iseffectivechange)

## Constructors

### constructor

• **new UpdateTracker**(`updates`, `reactiveItem`, `engine`): [`UpdateTracker`](internal_.UpdateTracker.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `updates` | `Map`\<`string`, [`UpdateDataRecord`](internal_.UpdateDataRecord.md)\> |
| `reactiveItem` | [`ReactiveItem`](ReactiveItem.md) |
| `engine` | [`Engine`](Engine.md) |

#### Returns

[`UpdateTracker`](internal_.UpdateTracker.md)

#### Defined in

[src/core/UpdateTracker.js:28](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/UpdateTracker.js#L28)

## Properties

### #batchSnapshot

• `Private` **#batchSnapshot**: [`BatchSnapshot`](internal_.BatchSnapshot.md) = `null`

#### Defined in

[src/core/UpdateTracker.js:18](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/UpdateTracker.js#L18)

___

### #engine

• `Private` **#engine**: [`Engine`](Engine.md)

#### Defined in

[src/core/UpdateTracker.js:21](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/UpdateTracker.js#L21)

___

### #reactiveItem

• `Private` **#reactiveItem**: [`ReactiveItem`](ReactiveItem.md)

#### Defined in

[src/core/UpdateTracker.js:15](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/UpdateTracker.js#L15)

___

### #updates

• `Private` **#updates**: `Map`\<`string`, [`UpdateDataRecord`](internal_.UpdateDataRecord.md)\>

#### Defined in

[src/core/UpdateTracker.js:12](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/UpdateTracker.js#L12)

## Methods

### #recordChange

▸ **#recordChange**(`property`, `oldValue`): `void`

In batch mode, stores the original value in a snapshot.

#### Parameters

| Name | Type |
| :------ | :------ |
| `property` | `string` |
| `oldValue` | `any` |

#### Returns

`void`

#### Defined in

[src/core/UpdateTracker.js:39](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/UpdateTracker.js#L39)

___

### addUpdate

▸ **addUpdate**(`property`, `type`, `oldValue`, `newValue`, `compareFn`, `notifyDependentsCallback`, `addToChangedItemsCallback`): `boolean`

Adds an update record if the change is effective.

#### Parameters

| Name | Type |
| :------ | :------ |
| `property` | `string` |
| `type` | ``"set"`` \| ``"delete"`` |
| `oldValue` | `any` |
| `newValue` | `any` |
| `compareFn` | [`CompareFunction`](../modules/internal_.md#comparefunction) |
| `notifyDependentsCallback` | () => `void` |
| `addToChangedItemsCallback` | () => `void` |

#### Returns

`boolean`

#### Defined in

[src/core/UpdateTracker.js:85](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/UpdateTracker.js#L85)

___

### checkChangesTemporary

▸ **checkChangesTemporary**(`getCurrentValue`): `boolean`

Removes updates for properties that reverted to their original values.

#### Parameters

| Name | Type |
| :------ | :------ |
| `getCurrentValue` | (`prop`: `string`) => `any` |

#### Returns

`boolean`

#### Defined in

[src/core/UpdateTracker.js:157](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/UpdateTracker.js#L157)

___

### clearUpdates

▸ **clearUpdates**(): `void`

Clears all pending updates and resets the batch snapshot.

#### Returns

`void`

#### Defined in

[src/core/UpdateTracker.js:144](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/UpdateTracker.js#L144)

___

### hasUpdates

▸ **hasUpdates**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/core/UpdateTracker.js:137](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/UpdateTracker.js#L137)

___

### isEffectiveChange

▸ **isEffectiveChange**(`property`, `oldValue`, `newValue`, `compareFn`): `boolean`

Determines whether a change is effective (i.e. not reverted) considering
batch snapshots.

#### Parameters

| Name | Type |
| :------ | :------ |
| `property` | `string` |
| `oldValue` | `any` |
| `newValue` | `any` |
| `compareFn` | [`CompareFunction`](../modules/internal_.md#comparefunction) |

#### Returns

`boolean`

#### Defined in

[src/core/UpdateTracker.js:57](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/UpdateTracker.js#L57)
