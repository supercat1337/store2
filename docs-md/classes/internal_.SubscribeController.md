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

[src/core/subscribeController.js:14](https://github.com/supercat1337/store2/blob/0a79678b73c0883858e42307757f633e90a127e5/src/core/subscribeController.js#L14)

## Properties

### #emitter

• `Private` **#emitter**: [`EventEmitter`](internal_.EventEmitter.md)\<`string`\>

#### Defined in

[src/core/subscribeController.js:12](https://github.com/supercat1337/store2/blob/0a79678b73c0883858e42307757f633e90a127e5/src/core/subscribeController.js#L12)

## Methods

### clearAllSubscribers

▸ **clearAllSubscribers**(): `void`

Removes all subscribers, including internal listeners.

#### Returns

`void`

#### Defined in

[src/core/subscribeController.js:51](https://github.com/supercat1337/store2/blob/0a79678b73c0883858e42307757f633e90a127e5/src/core/subscribeController.js#L51)

___

### clearSubscribers

▸ **clearSubscribers**(): `void`

Removes all 'change' subscribers.
Internal listeners (has/no subscribers) remain intact.

#### Returns

`void`

#### Defined in

[src/core/subscribeController.js:44](https://github.com/supercat1337/store2/blob/0a79678b73c0883858e42307757f633e90a127e5/src/core/subscribeController.js#L44)

___

### destroy

▸ **destroy**(): `void`

Destroys the controller, emits 'destroy', and removes all listeners.

#### Returns

`void`

#### Defined in

[src/core/subscribeController.js:66](https://github.com/supercat1337/store2/blob/0a79678b73c0883858e42307757f633e90a127e5/src/core/subscribeController.js#L66)

___

### getSubscribers

▸ **getSubscribers**(): `Function`[]

Returns a copy of the current 'change' subscriber list.

#### Returns

`Function`[]

#### Defined in

[src/core/subscribeController.js:22](https://github.com/supercat1337/store2/blob/0a79678b73c0883858e42307757f633e90a127e5/src/core/subscribeController.js#L22)

___

### hasSubscribers

▸ **hasSubscribers**(): `boolean`

Returns whether there are any 'change' subscribers.

#### Returns

`boolean`

#### Defined in

[src/core/subscribeController.js:59](https://github.com/supercat1337/store2/blob/0a79678b73c0883858e42307757f633e90a127e5/src/core/subscribeController.js#L59)

___

### onDestroy

▸ **onDestroy**(`callback`): () => `void`

Registers a callback that fires when the controller is destroyed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | () => `void` |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Defined in

[src/core/subscribeController.js:94](https://github.com/supercat1337/store2/blob/0a79678b73c0883858e42307757f633e90a127e5/src/core/subscribeController.js#L94)

___

### onHasSubscribers

▸ **onHasSubscribers**(`callback`): () => `void`

Registers a callback that fires when the first 'change' subscriber is added.

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | () => `void` |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Defined in

[src/core/subscribeController.js:76](https://github.com/supercat1337/store2/blob/0a79678b73c0883858e42307757f633e90a127e5/src/core/subscribeController.js#L76)

___

### onNoSubscribers

▸ **onNoSubscribers**(`callback`): () => `void`

Registers a callback that fires when the last 'change' subscriber is removed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | () => `void` |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Defined in

[src/core/subscribeController.js:85](https://github.com/supercat1337/store2/blob/0a79678b73c0883858e42307757f633e90a127e5/src/core/subscribeController.js#L85)

___

### subscribe

▸ **subscribe**(`fn`, `options?`): () => `void`

Subscribes a callback to the 'change' event.

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | (`updates`: `Map`\<`string`, [`UpdateDataRecord`](internal_.UpdateDataRecord.md)\>) => `void` |
| `options?` | `Object` |
| `options.delay?` | `number` |
| `options.signal?` | `AbortSignal` |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Defined in

[src/core/subscribeController.js:33](https://github.com/supercat1337/store2/blob/0a79678b73c0883858e42307757f633e90a127e5/src/core/subscribeController.js#L33)
