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

| Name | Type | Description |
| :------ | :------ | :------ |
| `updates` | `Map`\<`string`, [`UpdateDataRecord`](internal_.UpdateDataRecord.md)\> | The engine's updates map. |
| `reactiveItem` | [`ReactiveItem`](ReactiveItem.md) | The owning reactive item. |
| `engine` | [`Engine`](internal_.Engine.md) | The owning engine (for version and batch snapshot access). |

#### Returns

[`UpdateTracker`](internal_.UpdateTracker.md)

#### Defined in

src/core/UpdateTracker.js:26

## Properties

### #batchSnapshot

• `Private` **#batchSnapshot**: [`BatchSnapshot`](internal_.BatchSnapshot.md) = `null`

#### Defined in

src/core/UpdateTracker.js:17

___

### #engine

• `Private` **#engine**: [`Engine`](internal_.Engine.md)

#### Defined in

src/core/UpdateTracker.js:19

___

### #reactiveItem

• `Private` **#reactiveItem**: [`ReactiveItem`](ReactiveItem.md)

#### Defined in

src/core/UpdateTracker.js:15

___

### #updates

• `Private` **#updates**: `Map`\<`string`, [`UpdateDataRecord`](internal_.UpdateDataRecord.md)\>

#### Defined in

src/core/UpdateTracker.js:13

## Methods

### #recordChange

▸ **#recordChange**(`property`, `oldValue`): `void`

Records a change attempt. In batch mode, stores the original value in a snapshot.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `property` | `string` | The property key. |
| `oldValue` | `any` | The value before the change. |

#### Returns

`void`

#### Defined in

src/core/UpdateTracker.js:37

___

### addUpdate

▸ **addUpdate**(`property`, `type`, `oldValue`, `newValue`, `compareFn`, `notifyDependentsCallback`, `addToChangedItemsCallback`): `boolean`

Adds an update record if the change is effective.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `property` | `string` | The property key. |
| `type` | ``"set"`` \| ``"delete"`` | The operation type. |
| `oldValue` | `any` | The previous value (immediate). |
| `newValue` | `any` | The new value. |
| `compareFn` | [`CompareFunction`](../modules/internal_.md#comparefunction) | Equality function. |
| `notifyDependentsCallback` | () => `void` | Callback to notify dependents of a change. |
| `addToChangedItemsCallback` | () => `void` | Callback to add the item to the changed items controller. |

#### Returns

`boolean`

True if an update was added.

#### Defined in

src/core/UpdateTracker.js:79

___

### checkChangesTemporary

▸ **checkChangesTemporary**(`getCurrentValue`): `boolean`

Processes temporary changes after batch ends.
Removes updates for properties that reverted to original values.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `getCurrentValue` | (`prop`: `string`) => `any` | Function to get current value for a property. |

#### Returns

`boolean`

True if any changes remain.

#### Defined in

src/core/UpdateTracker.js:160

___

### clearUpdates

▸ **clearUpdates**(): `void`

Clears all pending updates and resets the batch snapshot.

#### Returns

`void`

#### Defined in

src/core/UpdateTracker.js:146

___

### hasUpdates

▸ **hasUpdates**(): `boolean`

Checks if there are any pending updates.

#### Returns

`boolean`

#### Defined in

src/core/UpdateTracker.js:139

___

### isEffectiveChange

▸ **isEffectiveChange**(`property`, `oldValue`, `newValue`, `compareFn`): `boolean`

Determines if a change is effective (i.e., not reverted) considering batch snapshots.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `property` | `string` | The property key. |
| `oldValue` | `any` | The immediate previous value. |
| `newValue` | `any` | The new value. |
| `compareFn` | [`CompareFunction`](../modules/internal_.md#comparefunction) | Equality function. |

#### Returns

`boolean`

#### Defined in

src/core/UpdateTracker.js:54
