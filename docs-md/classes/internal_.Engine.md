[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / Engine

# Class: Engine

[\<internal\>](../modules/internal_.md).Engine

## Table of contents

### Constructors

- [constructor](internal_.Engine.md#constructor)

### Properties

- [#batchSnapshot](internal_.Engine.md##batchsnapshot)
- [#error](internal_.Engine.md##error)
- [compareFn](internal_.Engine.md#comparefn)
- [dependencies](internal_.Engine.md#dependencies)
- [dependents](internal_.Engine.md#dependents)
- [id](internal_.Engine.md#id)
- [isDestroyed](internal_.Engine.md#isdestroyed)
- [reactiveItem](internal_.Engine.md#reactiveitem)
- [shouldRecalc](internal_.Engine.md#shouldrecalc)
- [subscribeController](internal_.Engine.md#subscribecontroller)
- [suppressNotifications](internal_.Engine.md#suppressnotifications)
- [type](internal_.Engine.md#type)
- [updates](internal_.Engine.md#updates)
- [version](internal_.Engine.md#version)

### Accessors

- [error](internal_.Engine.md#error)

### Methods

- [#commitChange](internal_.Engine.md##commitchange)
- [#recordChange](internal_.Engine.md##recordchange)
- [addDependencies](internal_.Engine.md#adddependencies)
- [addDependency](internal_.Engine.md#adddependency)
- [addDependent](internal_.Engine.md#adddependent)
- [addUpdate](internal_.Engine.md#addupdate)
- [checkChangesTemporary](internal_.Engine.md#checkchangestemporary)
- [clearError](internal_.Engine.md#clearerror)
- [clearUpdates](internal_.Engine.md#clearupdates)
- [destroy](internal_.Engine.md#destroy)
- [getDeepDependents](internal_.Engine.md#getdeepdependents)
- [getDeepDependentsArray](internal_.Engine.md#getdeepdependentsarray)
- [getMessage](internal_.Engine.md#getmessage)
- [hasUpdates](internal_.Engine.md#hasupdates)
- [isEffectiveChange](internal_.Engine.md#iseffectivechange)
- [isEffectiveChangeWithOld](internal_.Engine.md#iseffectivechangewithold)
- [notifyDependencies](internal_.Engine.md#notifydependencies)
- [notifyDependents](internal_.Engine.md#notifydependents)
- [prepareSetValue](internal_.Engine.md#preparesetvalue)
- [removeDependent](internal_.Engine.md#removedependent)
- [setError](internal_.Engine.md#seterror)
- [updateDependencies](internal_.Engine.md#updatedependencies)
- [valueChangedCallback](internal_.Engine.md#valuechangedcallback)

## Constructors

### constructor

• **new Engine**(`reactiveItem`, `type`): [`Engine`](internal_.Engine.md)

Creates an Engine instance.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `reactiveItem` | [`ReactiveItem`](ReactiveItem.md) | The reactive item. |
| `type` | ``1`` \| ``2`` \| ``3`` \| ``4`` | The type. |

#### Returns

[`Engine`](internal_.Engine.md)

#### Defined in

[src/core/Engine.js:109](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L109)

## Properties

### #batchSnapshot

• `Private` **#batchSnapshot**: [`BatchSnapshot`](internal_.BatchSnapshot.md) = `null`

Snapshot of original values when inside a batch.

#### Defined in

[src/core/Engine.js:90](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L90)

___

### #error

• `Private` **#error**: `Error` = `null`

#### Defined in

[src/core/Engine.js:70](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L70)

___

### compareFn

• **compareFn**: [`CompareFunction`](../modules/internal_.md#comparefunction) = `null`

Comparison function for equality.

#### Defined in

[src/core/Engine.js:96](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L96)

___

### dependencies

• **dependencies**: `Set`\<[`ReactiveItem`](ReactiveItem.md)\>

The set of dependencies of the engine.

#### Defined in

[src/core/Engine.js:29](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L29)

___

### dependents

• **dependents**: `Set`\<[`ReactiveItem`](ReactiveItem.md)\>

The set of dependents of the engine.

#### Defined in

[src/core/Engine.js:35](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L35)

___

### id

• **id**: `number`

Unique identifier for ordering.

#### Defined in

[src/core/Engine.js:41](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L41)

___

### isDestroyed

• **isDestroyed**: `boolean` = `false`

Indicates whether the engine has been destroyed.

#### Defined in

[src/core/Engine.js:65](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L65)

___

### reactiveItem

• **reactiveItem**: [`ReactiveItem`](ReactiveItem.md)

Reference to the reactive item.

#### Defined in

[src/core/Engine.js:53](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L53)

___

### shouldRecalc

• **shouldRecalc**: `boolean` = `false`

Flag indicating that the value should be recalculated.

#### Defined in

[src/core/Engine.js:59](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L59)

___

### subscribeController

• **subscribeController**: [`SubscribeController`](internal_.SubscribeController.md)

#### Defined in

[src/core/Engine.js:72](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L72)

___

### suppressNotifications

• **suppressNotifications**: `boolean` = `false`

Prevents updates from being propagated (used during mass updates).

#### Defined in

[src/core/Engine.js:102](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L102)

___

### type

• **type**: `number`

The type of the reactive item.

#### Defined in

[src/core/Engine.js:78](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L78)

___

### updates

• **updates**: `Map`\<`string`, [`UpdateDataRecord`](internal_.UpdateDataRecord.md)\>

Map of pending updates (property -> UpdateDataRecord).

#### Defined in

[src/core/Engine.js:84](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L84)

___

### version

• **version**: `number` = `0`

Version number (currently unused, kept for potential future use).

#### Defined in

[src/core/Engine.js:47](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L47)

## Accessors

### error

• `get` **error**(): `Error`

#### Returns

`Error`

#### Defined in

[src/core/Engine.js:115](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L115)

## Methods

### #commitChange

▸ **#commitChange**(`property`, `type`, `oldValue`, `newValue`): `boolean`

Commits a change: creates an UpdateDataRecord, adds to updates, and schedules notification.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `property` | `string` | The property key. |
| `type` | ``"set"`` \| ``"delete"`` | The operation. |
| `oldValue` | `any` | The previous value (immediate before this change). |
| `newValue` | `any` | The new value. |

#### Returns

`boolean`

True if committed (i.e., value actually changed).

#### Defined in

[src/core/Engine.js:178](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L178)

___

### #recordChange

▸ **#recordChange**(`property`, `oldValue`): `void`

Records a change attempt. In batch mode, stores the original value.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `property` | `string` | The property key. |
| `oldValue` | `any` | The value before the change. |

#### Returns

`void`

#### Defined in

[src/core/Engine.js:124](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L124)

___

### addDependencies

▸ **addDependencies**(`dependencies`): `void`

Adds dependencies to this engine.

#### Parameters

| Name | Type |
| :------ | :------ |
| `dependencies` | `Set`\<[`ReactiveItem`](ReactiveItem.md)\> |

#### Returns

`void`

#### Defined in

[src/core/Engine.js:236](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L236)

___

### addDependency

▸ **addDependency**(`dependency`): `void`

Adds a single dependency.

#### Parameters

| Name | Type |
| :------ | :------ |
| `dependency` | [`ReactiveItem`](ReactiveItem.md) |

#### Returns

`void`

#### Defined in

[src/core/Engine.js:254](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L254)

___

### addDependent

▸ **addDependent**(`dependent`): `boolean`

Adds a dependent.

#### Parameters

| Name | Type |
| :------ | :------ |
| `dependent` | [`ReactiveItem`](ReactiveItem.md) |

#### Returns

`boolean`

#### Defined in

[src/core/Engine.js:265](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L265)

___

### addUpdate

▸ **addUpdate**(`property`, `type`, `oldValue`, `value`): `boolean`

Legacy method for backward compatibility. Delegates to recordChange + #commitChange.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `property` | `string` | The property key. |
| `type` | ``"set"`` \| ``"delete"`` | The operation. |
| `oldValue` | `any` | The previous value. |
| `value` | `any` | The new value. |

#### Returns

`boolean`

True if an update was added.

#### Defined in

[src/core/Engine.js:227](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L227)

___

### checkChangesTemporary

▸ **checkChangesTemporary**(): `boolean`

Processes temporary changes after batch ends.
Removes updates for properties that reverted to original values.

#### Returns

`boolean`

True if any changes remain.

#### Defined in

[src/core/Engine.js:439](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L439)

___

### clearError

▸ **clearError**(): `void`

Clears the current error.

#### Returns

`void`

#### Defined in

[src/core/Engine.js:390](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L390)

___

### clearUpdates

▸ **clearUpdates**(): `void`

Clears all pending updates.

#### Returns

`void`

#### Defined in

[src/core/Engine.js:422](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L422)

___

### destroy

▸ **destroy**(`ctx?`): `void`

Destroys the engine.

#### Parameters

| Name | Type |
| :------ | :------ |
| `ctx?` | `Object` |
| `ctx.recipients` | `Set`\<[`ReactiveItem`](ReactiveItem.md)\> |
| `ctx.sender` | [`ReactiveItem`](ReactiveItem.md) |

#### Returns

`void`

#### Defined in

[src/core/Engine.js:398](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L398)

___

### getDeepDependents

▸ **getDeepDependents**(): `Set`\<[`ReactiveItem`](ReactiveItem.md)\>

Returns all dependents recursively.

#### Returns

`Set`\<[`ReactiveItem`](ReactiveItem.md)\>

#### Defined in

[src/core/Engine.js:287](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L287)

___

### getDeepDependentsArray

▸ **getDeepDependentsArray**(): [`ReactiveItem`](ReactiveItem.md)[]

Returns sorted array of deep dependents.

#### Returns

[`ReactiveItem`](ReactiveItem.md)[]

#### Defined in

[src/core/Engine.js:311](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L311)

___

### getMessage

▸ **getMessage**(`message`, `ctx`): `void`

Handles incoming messages.

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `number` |
| `ctx` | `Object` |
| `ctx.recipients` | `Set`\<[`ReactiveItem`](ReactiveItem.md)\> |
| `ctx.sender` | [`ReactiveItem`](ReactiveItem.md) |

#### Returns

`void`

#### Defined in

[src/core/Engine.js:349](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L349)

___

### hasUpdates

▸ **hasUpdates**(): `boolean`

Checks if there are any pending updates.

#### Returns

`boolean`

#### Defined in

[src/core/Engine.js:430](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L430)

___

### isEffectiveChange

▸ **isEffectiveChange**(`property`, `newValue`): `boolean`

Determines whether a change actually affects the final value (considering batch).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `property` | `string` | The property key. |
| `newValue` | `any` | The new value. |

#### Returns

`boolean`

True if the change is effective.

#### Defined in

[src/core/Engine.js:139](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L139)

___

### isEffectiveChangeWithOld

▸ **isEffectiveChangeWithOld**(`property`, `oldValue`, `newValue`): `boolean`

Alternative version that accepts explicit oldValue (preferred).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `property` | `string` | The property key. |
| `oldValue` | `any` | The previous value (immediate before this change). |
| `newValue` | `any` | The new value. |

#### Returns

`boolean`

#### Defined in

[src/core/Engine.js:162](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L162)

___

### notifyDependencies

▸ **notifyDependencies**(`message`, `ctx`): `void`

Notifies dependencies (reverse direction).

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `number` |
| `ctx` | `Object` |
| `ctx.recipients` | `Set`\<[`ReactiveItem`](ReactiveItem.md)\> |
| `ctx.sender` | [`ReactiveItem`](ReactiveItem.md) |

#### Returns

`void`

#### Defined in

[src/core/Engine.js:337](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L337)

___

### notifyDependents

▸ **notifyDependents**(`message`, `ctx?`): `void`

Notifies dependents of a message.

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `number` |
| `ctx?` | `Object` |
| `ctx.recipients` | `Set`\<[`ReactiveItem`](ReactiveItem.md)\> |
| `ctx.sender` | [`ReactiveItem`](ReactiveItem.md) |

#### Returns

`void`

#### Defined in

[src/core/Engine.js:322](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L322)

___

### prepareSetValue

▸ **prepareSetValue**(): `void`

Prepares the engine for setting a new value.

#### Returns

`void`

**`Throws`**

If destroyed or in subscribers mode.

#### Defined in

[src/core/Engine.js:486](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L486)

___

### removeDependent

▸ **removeDependent**(`dependent`): `void`

Removes a dependent.

#### Parameters

| Name | Type |
| :------ | :------ |
| `dependent` | [`ReactiveItem`](ReactiveItem.md) |

#### Returns

`void`

#### Defined in

[src/core/Engine.js:279](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L279)

___

### setError

▸ **setError**(`error`, `ctx?`): `void`

Sets an error and notifies dependents.

#### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `Error` |
| `ctx?` | `Object` |
| `ctx.recipients` | `Set`\<[`ReactiveItem`](ReactiveItem.md)\> |
| `ctx.sender` | [`ReactiveItem`](ReactiveItem.md) |

#### Returns

`void`

#### Defined in

[src/core/Engine.js:374](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L374)

___

### updateDependencies

▸ **updateDependencies**(`newDeps`): `void`

Updates dependencies to a new set.

#### Parameters

| Name | Type |
| :------ | :------ |
| `newDeps` | `Set`\<[`ReactiveItem`](ReactiveItem.md)\> |

#### Returns

`void`

#### Defined in

[src/core/Engine.js:499](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L499)

___

### valueChangedCallback

▸ **valueChangedCallback**(): `void`

Called after a value change to schedule notifications.

#### Returns

`void`

#### Defined in

[src/core/Engine.js:475](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/Engine.js#L475)
