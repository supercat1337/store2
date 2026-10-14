[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / Store2Plugin

# Interface: Store2Plugin

[\<internal\>](../modules/internal_.md).Store2Plugin

Plugin contract. Every hook is optional.

Plugins are installed via `context.use(plugin)`. Plugin errors are caught
and logged; a plugin cannot break reactivity by throwing.

## Table of contents

### Properties

- [apiVersion](internal_.Store2Plugin.md#apiversion)
- [name](internal_.Store2Plugin.md#name)

### Methods

- [install](internal_.Store2Plugin.md#install)
- [onActionEnd](internal_.Store2Plugin.md#onactionend)
- [onActionStart](internal_.Store2Plugin.md#onactionstart)
- [onBatchEnd](internal_.Store2Plugin.md#onbatchend)
- [onBatchStart](internal_.Store2Plugin.md#onbatchstart)
- [onComputedRecalc](internal_.Store2Plugin.md#oncomputedrecalc)
- [onDestroy](internal_.Store2Plugin.md#ondestroy)
- [onError](internal_.Store2Plugin.md#onerror)
- [onHydrateEnd](internal_.Store2Plugin.md#onhydrateend)
- [onHydrateStart](internal_.Store2Plugin.md#onhydratestart)
- [onSubscriberRun](internal_.Store2Plugin.md#onsubscriberrun)
- [onUpdate](internal_.Store2Plugin.md#onupdate)

## Properties

### apiVersion

• `Optional` **apiVersion**: `number`

Plugin API version this plugin was written against. Optional for
backward compatibility. When present, the context rejects plugins
whose version does not match the core's `PLUGIN_API_VERSION`.

#### Defined in

[src/types.ts:204](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L204)

___

### name

• **name**: `string`

Debug name, used in error logs. Should be unique per context.

#### Defined in

[src/types.ts:197](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L197)

## Methods

### install

▸ **install**(`context`): `void`

Called once when the plugin is installed. Receives the context the
plugin will observe.

#### Parameters

| Name | Type |
| :------ | :------ |
| `context` | [`Store2Context`](../classes/Store2Context.md) |

#### Returns

`void`

#### Defined in

[src/types.ts:210](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L210)

___

### onActionEnd

▸ **onActionEnd**(`action`): `void`

Called when an action finishes, successfully or with an error. The
`action.error` field is set when the body threw.

#### Parameters

| Name | Type |
| :------ | :------ |
| `action` | [`ActionInfo`](internal_.ActionInfo.md) |

#### Returns

`void`

#### Defined in

[src/types.ts:221](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L221)

___

### onActionStart

▸ **onActionStart**(`action`): `void`

Called when an action begins.

#### Parameters

| Name | Type |
| :------ | :------ |
| `action` | [`ActionInfo`](internal_.ActionInfo.md) |

#### Returns

`void`

#### Defined in

[src/types.ts:215](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L215)

___

### onBatchEnd

▸ **onBatchEnd**(`info`): `void`

Called when the outermost batch ends.

#### Parameters

| Name | Type |
| :------ | :------ |
| `info` | [`BatchInfo`](internal_.BatchInfo.md) |

#### Returns

`void`

#### Defined in

[src/types.ts:231](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L231)

___

### onBatchStart

▸ **onBatchStart**(`info`): `void`

Called when the outermost batch begins.

#### Parameters

| Name | Type |
| :------ | :------ |
| `info` | [`BatchInfo`](internal_.BatchInfo.md) |

#### Returns

`void`

#### Defined in

[src/types.ts:226](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L226)

___

### onComputedRecalc

▸ **onComputedRecalc**(`item`, `oldValue`, `newValue`): `void`

Called after a computed's value changes, with the previous and new
values.

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | [`ReactiveItem`](../classes/ReactiveItem.md) |
| `oldValue` | `any` |
| `newValue` | `any` |

#### Returns

`void`

#### Defined in

[src/types.ts:246](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L246)

___

### onDestroy

▸ **onDestroy**(`item`): `void`

Called after a reactive item is destroyed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | [`ReactiveItem`](../classes/ReactiveItem.md) |

#### Returns

`void`

#### Defined in

[src/types.ts:264](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L264)

___

### onError

▸ **onError**(`item`, `error`): `void`

Called when a computed throws during evaluation.

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | [`ReactiveItem`](../classes/ReactiveItem.md) |
| `error` | `Error` |

#### Returns

`void`

#### Defined in

[src/types.ts:269](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L269)

___

### onHydrateEnd

▸ **onHydrateEnd**(`snapshot`, `opts`): `void`

Called after `context.hydrate()` has applied the snapshot and the
hydration batch has closed. Fires even during time-travel.

#### Parameters

| Name | Type |
| :------ | :------ |
| `snapshot` | [`ContextSnapshot`](internal_.ContextSnapshot.md) |
| `opts` | `Object` |
| `opts.timeTravel` | `boolean` |

#### Returns

`void`

#### Defined in

[src/types.ts:282](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L282)

___

### onHydrateStart

▸ **onHydrateStart**(`snapshot`, `opts`): `void`

Called before `context.hydrate()` unpacks the snapshot. Fires even
during time-travel, so persistence adapters can react to any
hydration.

#### Parameters

| Name | Type |
| :------ | :------ |
| `snapshot` | [`ContextSnapshot`](internal_.ContextSnapshot.md) |
| `opts` | `Object` |
| `opts.timeTravel` | `boolean` |

#### Returns

`void`

#### Defined in

[src/types.ts:276](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L276)

___

### onSubscriberRun

▸ **onSubscriberRun**(`item`, `updates`): `void`

Called before a subscriber runs, with the item and its pending
updates.

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | [`ReactiveItem`](../classes/ReactiveItem.md) |
| `updates` | `Map`\<`string`, [`UpdateDataRecord`](../classes/internal_.UpdateDataRecord.md)\> |

#### Returns

`void`

#### Defined in

[src/types.ts:256](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L256)

___

### onUpdate

▸ **onUpdate**(`item`, `property`, `record`): `void`

Called for every effective property change on a reactive item.

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | [`ReactiveItem`](../classes/ReactiveItem.md) |
| `property` | `string` |
| `record` | [`UpdateDataRecord`](../classes/internal_.UpdateDataRecord.md) |

#### Returns

`void`

#### Defined in

[src/types.ts:236](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L236)
