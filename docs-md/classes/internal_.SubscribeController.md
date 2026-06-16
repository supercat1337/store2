[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / SubscribeController

# Class: SubscribeController

[\<internal\>](../modules/internal_.md).SubscribeController

## Table of contents

### Constructors

- [constructor](internal_.SubscribeController.md#constructor)

### Properties

- [#additionalEvents](internal_.SubscribeController.md##additionalevents)
- [#eventEmitter](internal_.SubscribeController.md##eventemitter)

### Methods

- [clearAllSubscribers](internal_.SubscribeController.md#clearallsubscribers)
- [clearSubscribers](internal_.SubscribeController.md#clearsubscribers)
- [destroy](internal_.SubscribeController.md#destroy)
- [getSubscribers](internal_.SubscribeController.md#getsubscribers)
- [hasSubscribers](internal_.SubscribeController.md#hassubscribers)
- [onDestroy](internal_.SubscribeController.md#ondestroy)
- [onHasSubscribers](internal_.SubscribeController.md#onhassubscribers)
- [onNoSubscribers](internal_.SubscribeController.md#onnosubscribers)
- [subscribe](internal_.SubscribeController.md#subscribe)

## Constructors

### constructor

• **new SubscribeController**(): [`SubscribeController`](internal_.SubscribeController.md)

#### Returns

[`SubscribeController`](internal_.SubscribeController.md)

#### Defined in

[src/core/subscribeController.js:16](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/subscribeController.js#L16)

## Properties

### #additionalEvents

• `Private` **#additionalEvents**: [`EventEmitterExt`](internal_.EventEmitterExt.md)\<``"#has-listeners"`` \| ``"#no-listeners"`` \| ``"destroy"``\>

#### Defined in

[src/core/subscribeController.js:15](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/subscribeController.js#L15)

___

### #eventEmitter

• `Private` **#eventEmitter**: [`EventEmitterExt`](internal_.EventEmitterExt.md)\<``"change"``\>

#### Defined in

[src/core/subscribeController.js:12](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/subscribeController.js#L12)

## Methods

### clearAllSubscribers

▸ **clearAllSubscribers**(): `void`

Removes all event listeners from the event emitter. This method is useful for
cleaning up all subscribers that are no longer needed.

#### Returns

`void`

#### Defined in

[src/core/subscribeController.js:99](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/subscribeController.js#L99)

___

### clearSubscribers

▸ **clearSubscribers**(): `void`

Removes all "change" event listeners from the event emitter. This method is useful for cleaning up
"change" subscribers that are no longer needed.

#### Returns

`void`

#### Defined in

[src/core/subscribeController.js:111](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/subscribeController.js#L111)

___

### destroy

▸ **destroy**(): `void`

Destroys the SubscribeController. This method is useful for cleaning up after a SubscribeController
that is no longer needed. It calls clearSubscribers, which removes all subscribers.

#### Returns

`void`

#### Defined in

[src/core/subscribeController.js:127](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/subscribeController.js#L127)

___

### getSubscribers

▸ **getSubscribers**(): `Function`[]

Returns an array of functions that have been subscribed to the subscribeController.

#### Returns

`Function`[]

The functions that have been subscribed.

#### Defined in

[src/core/subscribeController.js:30](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/subscribeController.js#L30)

___

### hasSubscribers

▸ **hasSubscribers**(): `boolean`

Returns true if there are any subscribers, false otherwise.

#### Returns

`boolean`

Whether there are any subscribers.

#### Defined in

[src/core/subscribeController.js:119](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/subscribeController.js#L119)

___

### onDestroy

▸ **onDestroy**(`callback`): [`Unsubscriber`](../modules/internal_.md#unsubscriber)

Subscribes a function to be called when the SubscribeController is destroyed.
The function is called with no arguments.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callback` | `Function` | The function to be called. |

#### Returns

[`Unsubscriber`](../modules/internal_.md#unsubscriber)

A function that unsubscribes the given function.

#### Defined in

[src/core/subscribeController.js:159](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/subscribeController.js#L159)

___

### onHasSubscribers

▸ **onHasSubscribers**(`callback`): [`Unsubscriber`](../modules/internal_.md#unsubscriber)

Subscribes a function to be called whenever a subscriber is added to the subscribeController.
The function is called with no arguments.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callback` | () => `void` | The function to be called. |

#### Returns

[`Unsubscriber`](../modules/internal_.md#unsubscriber)

A function that unsubscribes the given function.

#### Defined in

[src/core/subscribeController.js:139](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/subscribeController.js#L139)

___

### onNoSubscribers

▸ **onNoSubscribers**(`callback`): [`Unsubscriber`](../modules/internal_.md#unsubscriber)

Subscribes a function to be called whenever there are no longer any subscribers.
The function is called with no arguments.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callback` | () => `void` | The function to be called. |

#### Returns

[`Unsubscriber`](../modules/internal_.md#unsubscriber)

A function that unsubscribes the given function.

#### Defined in

[src/core/subscribeController.js:149](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/subscribeController.js#L149)

___

### subscribe

▸ **subscribe**(`fn`, `options?`): [`Unsubscriber`](../modules/internal_.md#unsubscriber)

Subscribes a function to be called whenever the subscribeController schedules a task.
The function is called with no arguments.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fn` | (`updates`: `Map`\<`string`, [`UpdateDataRecord`](internal_.UpdateDataRecord.md)\>) => `void` | The function to be called. |
| `options?` | `Object` |  |
| `options.delay?` | `number` | - |
| `options.signal?` | `AbortSignal` | - |

#### Returns

[`Unsubscriber`](../modules/internal_.md#unsubscriber)

A function that unsubscribes the given function.

#### Defined in

[src/core/subscribeController.js:41](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/subscribeController.js#L41)
