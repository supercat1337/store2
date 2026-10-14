[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / Tracker

# Class: Tracker

[\<internal\>](../modules/internal_.md).Tracker

Records reactive items read during a tracked execution (inside `Computed`,
`autorun`, or `reaction`).

Scopes are nested: each `enable()` pushes a fresh store and each
`disable()` restores the previous one. This makes nested computed
construction and re-entrant tracking safe.

## Table of contents

### Constructors

- [constructor](internal_.Tracker.md#constructor)

### Properties

- [#eventEmitter](internal_.Tracker.md##eventemitter)
- [#isActive](internal_.Tracker.md##isactive)
- [#modeController](internal_.Tracker.md##modecontroller)
- [#stack](internal_.Tracker.md##stack)
- [#store](internal_.Tracker.md##store)
- [ctx](internal_.Tracker.md#ctx)

### Accessors

- [data](internal_.Tracker.md#data)

### Methods

- [add](internal_.Tracker.md#add)
- [disable](internal_.Tracker.md#disable)
- [enable](internal_.Tracker.md#enable)
- [getAsSortedArray](internal_.Tracker.md#getassortedarray)
- [isActive](internal_.Tracker.md#isactive)
- [onAdd](internal_.Tracker.md#onadd)

## Constructors

### constructor

• **new Tracker**(`modeController?`): [`Tracker`](internal_.Tracker.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `modeController?` | [`ModeControllerService`](internal_.ModeControllerService.md) | Used to honour `untrackMode`. Optional so that the tracker can be constructed in isolation for tests. |

#### Returns

[`Tracker`](internal_.Tracker.md)

#### Defined in

[src/services/dependencyTracker.js:38](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/dependencyTracker.js#L38)

## Properties

### #eventEmitter

• `Private` **#eventEmitter**: [`EventEmitterLite`](internal_.EventEmitterLite.md)\<``"add"``\>

#### Defined in

[src/services/dependencyTracker.js:25](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/dependencyTracker.js#L25)

___

### #isActive

• `Private` **#isActive**: `boolean` = `false`

#### Defined in

[src/services/dependencyTracker.js:16](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/dependencyTracker.js#L16)

___

### #modeController

• `Private` **#modeController**: [`ModeControllerService`](internal_.ModeControllerService.md)

#### Defined in

[src/services/dependencyTracker.js:28](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/dependencyTracker.js#L28)

___

### #stack

• `Private` **#stack**: \{ `ctx`: `any` ; `isActive`: `boolean` ; `store`: `Set`\<[`ReactiveItem`](ReactiveItem.md)\>  }[] = `[]`

#### Defined in

[src/services/dependencyTracker.js:22](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/dependencyTracker.js#L22)

___

### #store

• `Private` **#store**: `Set`\<[`ReactiveItem`](ReactiveItem.md)\>

#### Defined in

[src/services/dependencyTracker.js:19](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/dependencyTracker.js#L19)

___

### ctx

• **ctx**: `any` = `{}`

#### Defined in

[src/services/dependencyTracker.js:31](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/dependencyTracker.js#L31)

## Accessors

### data

• `get` **data**(): `Set`\<[`ReactiveItem`](ReactiveItem.md)\>

Returns a copy of the currently tracked items.

#### Returns

`Set`\<[`ReactiveItem`](ReactiveItem.md)\>

#### Defined in

[src/services/dependencyTracker.js:46](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/dependencyTracker.js#L46)

## Methods

### add

▸ **add**(`item`, `_key?`): `void`

Records a reactive item if tracking is active and untracked reads are
not currently suppressed.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `item` | [`ReactiveItem`](ReactiveItem.md) | `undefined` |
| `_key?` | `string` | `''` |

#### Returns

`void`

#### Defined in

[src/services/dependencyTracker.js:68](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/dependencyTracker.js#L68)

___

### disable

▸ **disable**(): `void`

Pops the current tracking scope and restores the previous one.

#### Returns

`void`

#### Defined in

[src/services/dependencyTracker.js:113](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/dependencyTracker.js#L113)

___

### enable

▸ **enable**(`ctx?`): `void`

Pushes a new tracking scope.

#### Parameters

| Name | Type |
| :------ | :------ |
| `ctx?` | `any` |

#### Returns

`void`

#### Defined in

[src/services/dependencyTracker.js:99](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/dependencyTracker.js#L99)

___

### getAsSortedArray

▸ **getAsSortedArray**(): [`ReactiveItem`](ReactiveItem.md)[]

Returns the currently tracked items sorted by engine id.

#### Returns

[`ReactiveItem`](ReactiveItem.md)[]

#### Defined in

[src/services/dependencyTracker.js:54](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/dependencyTracker.js#L54)

___

### isActive

▸ **isActive**(): `boolean`

Returns true while tracking is active.

#### Returns

`boolean`

#### Defined in

[src/services/dependencyTracker.js:91](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/dependencyTracker.js#L91)

___

### onAdd

▸ **onAdd**(`callback`): () => `void`

Registers a listener called for every tracked item.

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | (`item`: [`ReactiveItem`](ReactiveItem.md)) => `void` |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Defined in

[src/services/dependencyTracker.js:83](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/dependencyTracker.js#L83)
