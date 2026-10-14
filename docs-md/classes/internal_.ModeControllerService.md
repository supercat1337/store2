[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / ModeControllerService

# Class: ModeControllerService

[\<internal\>](../modules/internal_.md).ModeControllerService

Coordinates global reactivity modes: batching, subscriber notification,
untracked reads, and named actions.

Each `Store2Context` owns its own instance so that multiple root stores
can coexist (SSR requests, parallel tests, embedded widgets).

## Table of contents

### Constructors

- [constructor](internal_.ModeControllerService.md#constructor)

### Properties

- [#actionCounter](internal_.ModeControllerService.md##actioncounter)
- [#actionStack](internal_.ModeControllerService.md##actionstack)
- [#batchDepth](internal_.ModeControllerService.md##batchdepth)
- [#currentBatchName](internal_.ModeControllerService.md##currentbatchname)
- [#subscribersMode](internal_.ModeControllerService.md##subscribersmode)
- [isComputing](internal_.ModeControllerService.md#iscomputing)
- [throwErrorInSubscribers](internal_.ModeControllerService.md#throwerrorinsubscribers)
- [untrackMode](internal_.ModeControllerService.md#untrackmode)

### Accessors

- [batchDepth](internal_.ModeControllerService.md#batchdepth)
- [batchMode](internal_.ModeControllerService.md#batchmode)
- [currentAction](internal_.ModeControllerService.md#currentaction)
- [currentBatchName](internal_.ModeControllerService.md#currentbatchname)
- [subscribersMode](internal_.ModeControllerService.md#subscribersmode)

### Methods

- [beginAction](internal_.ModeControllerService.md#beginaction)
- [endAction](internal_.ModeControllerService.md#endaction)
- [endSubscribersMode](internal_.ModeControllerService.md#endsubscribersmode)
- [enterBatch](internal_.ModeControllerService.md#enterbatch)
- [exitBatch](internal_.ModeControllerService.md#exitbatch)
- [on](internal_.ModeControllerService.md#on)
- [onAction](internal_.ModeControllerService.md#onaction)
- [runAfterSubscribers](internal_.ModeControllerService.md#runaftersubscribers)
- [startSubscribersMode](internal_.ModeControllerService.md#startsubscribersmode)

## Constructors

### constructor

• **new ModeControllerService**(): [`ModeControllerService`](internal_.ModeControllerService.md)

#### Returns

[`ModeControllerService`](internal_.ModeControllerService.md)

#### Defined in

[src/services/modeController.js:50](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/modeController.js#L50)

## Properties

### #actionCounter

• `Private` **#actionCounter**: `number` = `0`

#### Defined in

[src/services/modeController.js:39](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/modeController.js#L39)

___

### #actionStack

• `Private` **#actionStack**: [`ActionInfo`](../interfaces/internal_.ActionInfo.md)[] = `[]`

#### Defined in

[src/services/modeController.js:36](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/modeController.js#L36)

___

### #batchDepth

• `Private` **#batchDepth**: `number` = `0`

#### Defined in

[src/services/modeController.js:27](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/modeController.js#L27)

___

### #currentBatchName

• `Private` **#currentBatchName**: `string` = `''`

#### Defined in

[src/services/modeController.js:30](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/modeController.js#L30)

___

### #subscribersMode

• `Private` **#subscribersMode**: `boolean` = `false`

#### Defined in

[src/services/modeController.js:33](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/modeController.js#L33)

___

### isComputing

• **isComputing**: `boolean` = `false`

#### Defined in

[src/services/modeController.js:14](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/modeController.js#L14)

___

### throwErrorInSubscribers

• **throwErrorInSubscribers**: `boolean` = `true`

#### Defined in

[src/services/modeController.js:17](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/modeController.js#L17)

___

### untrackMode

• **untrackMode**: `boolean` = `false`

When `true`, tracked reads are suppressed. `untrack()` saves and
restores this value, so nesting is safe.

#### Defined in

[src/services/modeController.js:24](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/modeController.js#L24)

## Accessors

### batchDepth

• `get` **batchDepth**(): `number`

Returns the current batch depth.

#### Returns

`number`

#### Defined in

[src/services/modeController.js:97](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/modeController.js#L97)

___

### batchMode

• `get` **batchMode**(): `boolean`

Returns true while the controller is inside a batch.

#### Returns

`boolean`

#### Defined in

[src/services/modeController.js:89](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/modeController.js#L89)

___

### currentAction

• `get` **currentAction**(): [`ActionInfo`](../interfaces/internal_.ActionInfo.md)

Returns the currently running action, or `null` if no action is in
flight.

#### Returns

[`ActionInfo`](../interfaces/internal_.ActionInfo.md)

#### Defined in

[src/services/modeController.js:184](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/modeController.js#L184)

___

### currentBatchName

• `get` **currentBatchName**(): `string`

Returns the name of the currently running outermost batch, or ''.

#### Returns

`string`

#### Defined in

[src/services/modeController.js:105](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/modeController.js#L105)

___

### subscribersMode

• `get` **subscribersMode**(): `boolean`

Returns true while subscribers are running.

#### Returns

`boolean`

#### Defined in

[src/services/modeController.js:148](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/modeController.js#L148)

## Methods

### beginAction

▸ **beginAction**(`name`, `payload?`): [`ActionInfo`](../interfaces/internal_.ActionInfo.md)

Starts a new named action.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `name` | `string` | `undefined` |
| `payload?` | `any` | `undefined` |

#### Returns

[`ActionInfo`](../interfaces/internal_.ActionInfo.md)

#### Defined in

[src/services/modeController.js:198](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/modeController.js#L198)

___

### endAction

▸ **endAction**(`action`, `error?`): `void`

Ends an action previously started with `beginAction`.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `action` | [`ActionInfo`](../interfaces/internal_.ActionInfo.md) | `undefined` |
| `error?` | `Error` | `null` |

#### Returns

`void`

#### Defined in

[src/services/modeController.js:220](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/modeController.js#L220)

___

### endSubscribersMode

▸ **endSubscribersMode**(): `void`

Marks the end of subscriber notification and flushes deferred callbacks.

#### Returns

`void`

#### Defined in

[src/services/modeController.js:162](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/modeController.js#L162)

___

### enterBatch

▸ **enterBatch**(`name?`): `void`

Increments the batch depth. Emits `batchModeStart` on the first entry.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `name?` | `string` | `''` | Optional human-readable name for the batch. |

#### Returns

`void`

#### Defined in

[src/services/modeController.js:113](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/modeController.js#L113)

___

### exitBatch

▸ **exitBatch**(): `void`

Decrements the batch depth. Emits `beforeBatchModeEnd`, then
`batchModeEnd` when leaving the outermost batch.

#### Returns

`void`

#### Defined in

[src/services/modeController.js:128](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/modeController.js#L128)

___

### on

▸ **on**(`event`, `callback`): () => `void`

Subscribes to a lifecycle event.

Batch events (`batchModeStart`, `batchModeEnd`, `beforeBatchModeEnd`)
and the subscribers-mode-end event (`subscribersModeEnd`) are
dispatched through this single public entry point. Internally they
use two different emitters, but callers should not care.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"batchModeStart"`` \| ``"batchModeEnd"`` \| ``"beforeBatchModeEnd"`` \| ``"subscribersModeEnd"`` |
| `callback` | () => `void` |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Defined in

[src/services/modeController.js:68](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/modeController.js#L68)

___

### onAction

▸ **onAction**(`event`, `callback`): () => `void`

Subscribes to an action lifecycle event.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"actionStart"`` \| ``"actionEnd"`` |
| `callback` | (`action`: [`ActionInfo`](../interfaces/internal_.ActionInfo.md)) => `void` |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Defined in

[src/services/modeController.js:81](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/modeController.js#L81)

___

### runAfterSubscribers

▸ **runAfterSubscribers**(`callback`): `void`

Registers a callback to run once after subscribers finish.

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | () => `void` |

#### Returns

`void`

#### Defined in

[src/services/modeController.js:174](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/modeController.js#L174)

___

### startSubscribersMode

▸ **startSubscribersMode**(): `void`

Marks the start of subscriber notification.

#### Returns

`void`

#### Defined in

[src/services/modeController.js:155](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/modeController.js#L155)
