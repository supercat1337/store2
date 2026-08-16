[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / Engine

# Class: Engine

[\<internal\>](../modules/internal_.md).Engine

Engine is the core reactive engine for a single reactive item.
It manages dependencies, updates, and lifecycle, delegating to specialised submodules.
All public properties and methods remain unchanged for backward compatibility.

## Table of contents

### Constructors

- [constructor](internal_.Engine.md#constructor)

### Properties

- [#error](internal_.Engine.md##error)
- [#graph](internal_.Engine.md##graph)
- [#messageHandler](internal_.Engine.md##messagehandler)
- [#updateTracker](internal_.Engine.md##updatetracker)
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
| `reactiveItem` | [`ReactiveItem`](ReactiveItem.md) | The owning reactive item. |
| `type` | ``1`` \| ``2`` \| ``3`` \| ``4`` | The type of reactive item. |

#### Returns

[`Engine`](internal_.Engine.md)

#### Defined in

[src/core/Engine.js:75](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L75)

## Properties

### #error

• `Private` **#error**: `Error` = `null`

#### Defined in

[src/core/Engine.js:45](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L45)

___

### #graph

• `Private` **#graph**: [`DependencyGraph`](internal_.DependencyGraph.md)

#### Defined in

[src/core/Engine.js:64](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L64)

___

### #messageHandler

• `Private` **#messageHandler**: [`MessageHandler`](internal_.MessageHandler.md)

#### Defined in

[src/core/Engine.js:68](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L68)

___

### #updateTracker

• `Private` **#updateTracker**: [`UpdateTracker`](internal_.UpdateTracker.md)

#### Defined in

[src/core/Engine.js:66](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L66)

___

### compareFn

• **compareFn**: [`CompareFunction`](../modules/internal_.md#comparefunction) = `null`

#### Defined in

[src/core/Engine.js:57](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L57)

___

### dependencies

• **dependencies**: `Set`\<[`ReactiveItem`](ReactiveItem.md)\>

#### Defined in

[src/core/Engine.js:24](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L24)

___

### dependents

• **dependents**: `Set`\<[`ReactiveItem`](ReactiveItem.md)\>

#### Defined in

[src/core/Engine.js:27](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L27)

___

### id

• **id**: `number`

#### Defined in

[src/core/Engine.js:30](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L30)

___

### isDestroyed

• **isDestroyed**: `boolean` = `false`

#### Defined in

[src/core/Engine.js:42](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L42)

___

### reactiveItem

• **reactiveItem**: [`ReactiveItem`](ReactiveItem.md)

#### Defined in

[src/core/Engine.js:36](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L36)

___

### shouldRecalc

• **shouldRecalc**: `boolean` = `false`

#### Defined in

[src/core/Engine.js:39](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L39)

___

### subscribeController

• **subscribeController**: [`SubscribeController`](internal_.SubscribeController.md)

#### Defined in

[src/core/Engine.js:48](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L48)

___

### suppressNotifications

• **suppressNotifications**: `boolean` = `false`

#### Defined in

[src/core/Engine.js:60](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L60)

___

### type

• **type**: `number`

#### Defined in

[src/core/Engine.js:51](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L51)

___

### updates

• **updates**: `Map`\<`string`, [`UpdateDataRecord`](internal_.UpdateDataRecord.md)\>

#### Defined in

[src/core/Engine.js:54](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L54)

___

### version

• **version**: `number` = `0`

#### Defined in

[src/core/Engine.js:33](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L33)

## Accessors

### error

• `get` **error**(): `Error`

#### Returns

`Error`

#### Defined in

[src/core/Engine.js:87](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L87)

## Methods

### addDependencies

▸ **addDependencies**(`dependencies`): `void`

Adds multiple dependencies.

#### Parameters

| Name | Type |
| :------ | :------ |
| `dependencies` | `Set`\<[`ReactiveItem`](ReactiveItem.md)\> |

#### Returns

`void`

#### Defined in

[src/core/Engine.js:123](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L123)

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

[src/core/Engine.js:115](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L115)

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

[src/core/Engine.js:132](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L132)

___

### addUpdate

▸ **addUpdate**(`property`, `type`, `oldValue`, `value`): `boolean`

Records a change attempt.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `property` | `string` | The property key. |
| `type` | ``"set"`` \| ``"delete"`` | The operation type. |
| `oldValue` | `any` | The previous value. |
| `value` | `any` | The new value. |

#### Returns

`boolean`

True if an update was added.

#### Defined in

[src/core/Engine.js:99](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L99)

___

### checkChangesTemporary

▸ **checkChangesTemporary**(): `boolean`

Processes temporary changes after batch ends.

#### Returns

`boolean`

True if any changes remain.

#### Defined in

[src/core/Engine.js:295](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L295)

___

### clearError

▸ **clearError**(): `void`

Clears the current error.

#### Returns

`void`

#### Defined in

[src/core/Engine.js:254](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L254)

___

### clearUpdates

▸ **clearUpdates**(): `void`

Clears all pending updates.

#### Returns

`void`

#### Defined in

[src/core/Engine.js:279](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L279)

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

[src/core/Engine.js:262](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L262)

___

### getDeepDependents

▸ **getDeepDependents**(): `Set`\<[`ReactiveItem`](ReactiveItem.md)\>

Returns all dependents recursively.

#### Returns

`Set`\<[`ReactiveItem`](ReactiveItem.md)\>

#### Defined in

[src/core/Engine.js:151](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L151)

___

### getDeepDependentsArray

▸ **getDeepDependentsArray**(): [`ReactiveItem`](ReactiveItem.md)[]

Returns sorted array of deep dependents.

#### Returns

[`ReactiveItem`](ReactiveItem.md)[]

#### Defined in

[src/core/Engine.js:159](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L159)

___

### getMessage

▸ **getMessage**(`message`, `ctx`): `void`

Handles incoming messages.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `number` | The message code. |
| `ctx` | `Object` |  |
| `ctx.recipients` | `Set`\<[`ReactiveItem`](ReactiveItem.md)\> | - |
| `ctx.sender` | [`ReactiveItem`](ReactiveItem.md) | - |

#### Returns

`void`

#### Defined in

[src/core/Engine.js:198](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L198)

___

### hasUpdates

▸ **hasUpdates**(): `boolean`

Checks if there are any pending updates.

#### Returns

`boolean`

#### Defined in

[src/core/Engine.js:287](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L287)

___

### isEffectiveChangeWithOld

▸ **isEffectiveChangeWithOld**(`property`, `oldValue`, `newValue`): `boolean`

Checks if a change is effective considering batch mode and snapshots.
This method is kept for backward compatibility.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `property` | `string` | The property key. |
| `oldValue` | `any` | The immediate previous value. |
| `newValue` | `any` | The new value. |

#### Returns

`boolean`

True if the change is effective (not reverted).

#### Defined in

[src/core/Engine.js:353](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L353)

___

### notifyDependencies

▸ **notifyDependencies**(`message`, `ctx?`): `void`

Notifies dependencies (reverse direction).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `number` | The message code. |
| `ctx?` | `Object` |  |
| `ctx.recipients` | `Set`\<[`ReactiveItem`](ReactiveItem.md)\> | - |
| `ctx.sender` | [`ReactiveItem`](ReactiveItem.md) | - |

#### Returns

`void`

#### Defined in

[src/core/Engine.js:180](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L180)

___

### notifyDependents

▸ **notifyDependents**(`message`, `ctx?`): `void`

Notifies dependents of a message.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `number` | The message code. |
| `ctx?` | `Object` |  |
| `ctx.recipients` | `Set`\<[`ReactiveItem`](ReactiveItem.md)\> | - |
| `ctx.sender` | [`ReactiveItem`](ReactiveItem.md) | - |

#### Returns

`void`

#### Defined in

[src/core/Engine.js:168](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L168)

___

### prepareSetValue

▸ **prepareSetValue**(): `void`

Prepares the engine for setting a new value.

#### Returns

`void`

**`Throws`**

If destroyed or in subscribers mode.

#### Defined in

[src/core/Engine.js:322](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L322)

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

[src/core/Engine.js:143](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L143)

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

[src/core/Engine.js:241](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L241)

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

[src/core/Engine.js:314](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L314)

___

### valueChangedCallback

▸ **valueChangedCallback**(): `void`

Called after a value change to schedule notifications.

#### Returns

`void`

#### Defined in

[src/core/Engine.js:334](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/core/Engine.js#L334)
