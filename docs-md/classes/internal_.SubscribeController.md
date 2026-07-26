[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / SubscribeController

# Class: SubscribeController

[\<internal\>](../modules/internal_.md).SubscribeController

Manages change subscriptions and lifecycle hooks for a reactive item.
Uses a single EventEmitter for all events: 'change' and 'destroy'.

## Table of contents

### Constructors

- [constructor](internal_.SubscribeController.md#constructor)

### Properties

- [#emitter](internal_.SubscribeController.md##emitter)

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

[src/core/subscribeController.js:18](https://github.com/supercat1337/store2/blob/e60081710ee7e24f7bcf3bcbc43ae5661fe35f53/src/core/subscribeController.js#L18)

## Properties

### #emitter

• `Private` **#emitter**: [`EventEmitter`](internal_.EventEmitter.md)\<`string`\>

#### Defined in

[src/core/subscribeController.js:16](https://github.com/supercat1337/store2/blob/e60081710ee7e24f7bcf3bcbc43ae5661fe35f53/src/core/subscribeController.js#L16)

## Methods

### clearAllSubscribers

▸ **clearAllSubscribers**(): `void`

Removes all subscribers, including internal listeners.

#### Returns

`void`

#### Defined in

[src/core/subscribeController.js:55](https://github.com/supercat1337/store2/blob/e60081710ee7e24f7bcf3bcbc43ae5661fe35f53/src/core/subscribeController.js#L55)

___

### clearSubscribers

▸ **clearSubscribers**(): `void`

Removes all 'change' subscribers.
Internal listeners (has/no subscribers) remain intact.

#### Returns

`void`

#### Defined in

[src/core/subscribeController.js:48](https://github.com/supercat1337/store2/blob/e60081710ee7e24f7bcf3bcbc43ae5661fe35f53/src/core/subscribeController.js#L48)

___

### destroy

▸ **destroy**(): `void`

Destroys the controller, emits 'destroy', and removes all listeners.

#### Returns

`void`

#### Defined in

[src/core/subscribeController.js:70](https://github.com/supercat1337/store2/blob/e60081710ee7e24f7bcf3bcbc43ae5661fe35f53/src/core/subscribeController.js#L70)

___

### getSubscribers

▸ **getSubscribers**(): `Function`[]

Returns a copy of the current 'change' subscriber list.

#### Returns

`Function`[]

#### Defined in

[src/core/subscribeController.js:26](https://github.com/supercat1337/store2/blob/e60081710ee7e24f7bcf3bcbc43ae5661fe35f53/src/core/subscribeController.js#L26)

___

### hasSubscribers

▸ **hasSubscribers**(): `boolean`

Returns whether there are any 'change' subscribers.

#### Returns

`boolean`

#### Defined in

[src/core/subscribeController.js:63](https://github.com/supercat1337/store2/blob/e60081710ee7e24f7bcf3bcbc43ae5661fe35f53/src/core/subscribeController.js#L63)

___

### onDestroy

▸ **onDestroy**(`callback`): [`Unsubscriber`](../modules/internal_.md#unsubscriber)

Registers a callback that fires when the controller is destroyed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | () => `void` |

#### Returns

[`Unsubscriber`](../modules/internal_.md#unsubscriber)

#### Defined in

[src/core/subscribeController.js:98](https://github.com/supercat1337/store2/blob/e60081710ee7e24f7bcf3bcbc43ae5661fe35f53/src/core/subscribeController.js#L98)

___

### onHasSubscribers

▸ **onHasSubscribers**(`callback`): [`Unsubscriber`](../modules/internal_.md#unsubscriber)

Registers a callback that fires when the first 'change' subscriber is added.

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | () => `void` |

#### Returns

[`Unsubscriber`](../modules/internal_.md#unsubscriber)

#### Defined in

[src/core/subscribeController.js:80](https://github.com/supercat1337/store2/blob/e60081710ee7e24f7bcf3bcbc43ae5661fe35f53/src/core/subscribeController.js#L80)

___

### onNoSubscribers

▸ **onNoSubscribers**(`callback`): [`Unsubscriber`](../modules/internal_.md#unsubscriber)

Registers a callback that fires when the last 'change' subscriber is removed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | () => `void` |

#### Returns

[`Unsubscriber`](../modules/internal_.md#unsubscriber)

#### Defined in

[src/core/subscribeController.js:89](https://github.com/supercat1337/store2/blob/e60081710ee7e24f7bcf3bcbc43ae5661fe35f53/src/core/subscribeController.js#L89)

___

### subscribe

▸ **subscribe**(`fn`, `options?`): [`Unsubscriber`](../modules/internal_.md#unsubscriber)

Subscribes a callback to the 'change' event.

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | (`updates`: `Map`\<`string`, [`UpdateDataRecord`](internal_.UpdateDataRecord.md)\>) => `void` |
| `options?` | `Object` |
| `options.delay?` | `number` |
| `options.signal?` | `AbortSignal` |

#### Returns

[`Unsubscriber`](../modules/internal_.md#unsubscriber)

#### Defined in

[src/core/subscribeController.js:37](https://github.com/supercat1337/store2/blob/e60081710ee7e24f7bcf3bcbc43ae5661fe35f53/src/core/subscribeController.js#L37)
