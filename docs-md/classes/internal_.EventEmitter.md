[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / EventEmitter

# Class: EventEmitter\<Events\>

[\<internal\>](../modules/internal_.md).EventEmitter

## Type parameters

| Name | Type |
| :------ | :------ |
| `Events` | extends `string` \| `symbol` \| [`Record`](../modules/internal_.md#record)\<`string` \| `symbol`, `any`[]\> = `string` |

## Hierarchy

- [`EventEmitterLite`](internal_.EventEmitterLite.md)\<`Events`\>

  ↳ **`EventEmitter`**

## Table of contents

### Constructors

- [constructor](internal_.EventEmitter.md#constructor)

### Properties

- [#private](internal_.EventEmitter.md##private)
- [anyListeners](internal_.EventEmitter.md#anylisteners)
- [events](internal_.EventEmitter.md#events)
- [logErrors](internal_.EventEmitter.md#logerrors)

### Accessors

- [isDestroyed](internal_.EventEmitter.md#isdestroyed)

### Methods

- [\_emitAny](internal_.EventEmitter.md#_emitany)
- [clear](internal_.EventEmitter.md#clear)
- [clearEventListeners](internal_.EventEmitter.md#cleareventlisteners)
- [destroy](internal_.EventEmitter.md#destroy)
- [emit](internal_.EventEmitter.md#emit)
- [eventNames](internal_.EventEmitter.md#eventnames)
- [getListeners](internal_.EventEmitter.md#getlisteners)
- [hasListeners](internal_.EventEmitter.md#haslisteners)
- [listenerCount](internal_.EventEmitter.md#listenercount)
- [off](internal_.EventEmitter.md#off)
- [offAny](internal_.EventEmitter.md#offany)
- [on](internal_.EventEmitter.md#on)
- [onAny](internal_.EventEmitter.md#onany)
- [onHasEventListeners](internal_.EventEmitter.md#onhaseventlisteners)
- [onListenerError](internal_.EventEmitter.md#onlistenererror)
- [onNoEventListeners](internal_.EventEmitter.md#onnoeventlisteners)
- [once](internal_.EventEmitter.md#once)
- [removeAllInternalListenersOf](internal_.EventEmitter.md#removeallinternallistenersof)
- [removeAllListeners](internal_.EventEmitter.md#removealllisteners)
- [removeAllListenersOf](internal_.EventEmitter.md#removealllistenersof)
- [removeListener](internal_.EventEmitter.md#removelistener)
- [waitForAnyEvent](internal_.EventEmitter.md#waitforanyevent)
- [waitForEvent](internal_.EventEmitter.md#waitforevent)

## Constructors

### constructor

• **new EventEmitter**\<`Events`\>(): [`EventEmitter`](internal_.EventEmitter.md)\<`Events`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Events` | extends `string` \| `symbol` \| [`Record`](../modules/internal_.md#record)\<`string` \| `symbol`, `any`[]\> = `string` |

#### Returns

[`EventEmitter`](internal_.EventEmitter.md)\<`Events`\>

#### Inherited from

[EventEmitterLite](internal_.EventEmitterLite.md).[constructor](internal_.EventEmitterLite.md#constructor)

## Properties

### #private

• `Private` **#private**: `any`

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter.d.ts:63

___

### anyListeners

• **anyListeners**: `Function`[]

#### Inherited from

[EventEmitterLite](internal_.EventEmitterLite.md).[anyListeners](internal_.EventEmitterLite.md#anylisteners)

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter-lite.d.ts:15

___

### events

• **events**: `any`

#### Inherited from

[EventEmitterLite](internal_.EventEmitterLite.md).[events](internal_.EventEmitterLite.md#events)

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter-lite.d.ts:9

___

### logErrors

• **logErrors**: `boolean`

logErrors indicates whether errors thrown by listeners should be logged to the console.

#### Inherited from

[EventEmitterLite](internal_.EventEmitterLite.md).[logErrors](internal_.EventEmitterLite.md#logerrors)

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter-lite.d.ts:20

## Accessors

### isDestroyed

• `get` **isDestroyed**(): `boolean`

#### Returns

`boolean`

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter.d.ts:9

## Methods

### \_emitAny

▸ **_emitAny**(`event`, `args`): `void`

Protected method to invoke any-listeners.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `string` \| `symbol` |
| `args` | `any`[] |

#### Returns

`void`

#### Inherited from

[EventEmitterLite](internal_.EventEmitterLite.md).[_emitAny](internal_.EventEmitterLite.md#_emitany)

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter-lite.d.ts:84

___

### clear

▸ **clear**(): `void`

Alias for removeAllListeners().

#### Returns

`void`

**`Deprecated`**

Use removeAllListeners() instead.

#### Inherited from

[EventEmitterLite](internal_.EventEmitterLite.md).[clear](internal_.EventEmitterLite.md#clear)

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter-lite.d.ts:118

___

### clearEventListeners

▸ **clearEventListeners**(`event`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `Events` extends `string` \| `symbol` ? `Events`\<`Events`\> : keyof `Events` |

#### Returns

`void`

**`Deprecated`**

Use removeAllListenersOf() instead.

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter.d.ts:40

___

### destroy

▸ **destroy**(): `void`

Destroys the event emitter.

#### Returns

`void`

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter.d.ts:34

___

### emit

▸ **emit**\<`K`\>(`event`, `...args`): `void`

emit is used to trigger an event

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends `string` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `K` |
| `...args` | `any`[] |

#### Returns

`void`

#### Inherited from

[EventEmitterLite](internal_.EventEmitterLite.md).[emit](internal_.EventEmitterLite.md#emit)

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter-lite.d.ts:77

___

### eventNames

▸ **eventNames**(): `Events` extends `string` \| `symbol` ? `Events`\<`Events`\> : keyof `Events`[]

Returns an array of event names that have at least one listener (including Symbols).

#### Returns

`Events` extends `string` \| `symbol` ? `Events`\<`Events`\> : keyof `Events`[]

#### Inherited from

[EventEmitterLite](internal_.EventEmitterLite.md).[eventNames](internal_.EventEmitterLite.md#eventnames)

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter-lite.d.ts:101

___

### getListeners

▸ **getListeners**(`event`): `Function`[]

Returns a copy of the listeners array for the specified event.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `Events` extends `string` \| `symbol` ? `Events`\<`Events`\> : keyof `Events` |

#### Returns

`Function`[]

#### Inherited from

[EventEmitterLite](internal_.EventEmitterLite.md).[getListeners](internal_.EventEmitterLite.md#getlisteners)

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter-lite.d.ts:107

___

### hasListeners

▸ **hasListeners**(`event`): `boolean`

Checks if an event has any listeners.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `Events` extends `string` \| `symbol` ? `Events`\<`Events`\> : keyof `Events` |

#### Returns

`boolean`

#### Inherited from

[EventEmitterLite](internal_.EventEmitterLite.md).[hasListeners](internal_.EventEmitterLite.md#haslisteners)

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter-lite.d.ts:90

___

### listenerCount

▸ **listenerCount**(`event`): `number`

Returns the number of listeners for a specific event.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `Events` extends `string` \| `symbol` ? `Events`\<`Events`\> : keyof `Events` |

#### Returns

`number`

#### Inherited from

[EventEmitterLite](internal_.EventEmitterLite.md).[listenerCount](internal_.EventEmitterLite.md#listenercount)

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter-lite.d.ts:96

___

### off

▸ **off**\<`K`\>(`event`, `listener`): `void`

off is an alias for removeListener

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends `string` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `K` |
| `listener` | `Function` |

#### Returns

`void`

#### Inherited from

[EventEmitterLite](internal_.EventEmitterLite.md).[off](internal_.EventEmitterLite.md#off)

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter-lite.d.ts:49

___

### offAny

▸ **offAny**(`listener`): `void`

Removes a listener added via onAny.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `listener` | `Function` | The listener function to remove. |

#### Returns

`void`

#### Inherited from

[EventEmitterLite](internal_.EventEmitterLite.md).[offAny](internal_.EventEmitterLite.md#offany)

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter-lite.d.ts:70

___

### on

▸ **on**\<`K`\>(`event`, `listener`, `options?`): () => `void`

on is used to add a callback function that's going to be executed when the event is triggered

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends `string` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `K` |
| `listener` | `Function` |
| `options?` | `Object` |
| `options.signal?` | `AbortSignal` |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Inherited from

[EventEmitterLite](internal_.EventEmitterLite.md).[on](internal_.EventEmitterLite.md#on)

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter-lite.d.ts:29

___

### onAny

▸ **onAny**(`listener`, `options?`): () => `void`

Adds a listener that will be invoked for every emitted event.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `listener` | `Function` | The callback (eventName, ...args) => void. |
| `options?` | `Object` |  |
| `options.signal?` | `AbortSignal` | - |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Inherited from

[EventEmitterLite](internal_.EventEmitterLite.md).[onAny](internal_.EventEmitterLite.md#onany)

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter-lite.d.ts:63

___

### onHasEventListeners

▸ **onHasEventListeners**(`event`, `callback`): () => `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `string` \| `symbol` |
| `callback` | `Function` |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter.d.ts:51

___

### onListenerError

▸ **onListenerError**(`callback`): () => `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | `Function` |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter.d.ts:62

___

### onNoEventListeners

▸ **onNoEventListeners**(`event`, `callback`): () => `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `string` \| `symbol` |
| `callback` | `Function` |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter.d.ts:57

___

### once

▸ **once**\<`K`\>(`event`, `listener`, `options?`): () => `void`

Add a one-time listener

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends `string` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `K` |
| `listener` | `Function` |
| `options?` | `Object` |
| `options.signal?` | `AbortSignal` |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Inherited from

[EventEmitterLite](internal_.EventEmitterLite.md).[once](internal_.EventEmitterLite.md#once)

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter-lite.d.ts:40

___

### removeAllInternalListenersOf

▸ **removeAllInternalListenersOf**(`event`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `Events` extends `string` \| `symbol` ? `Events`\<`Events`\> : keyof `Events` |

#### Returns

`void`

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter.d.ts:45

___

### removeAllListeners

▸ **removeAllListeners**(`options?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | `Object` |
| `options.removeInternalListeners?` | `boolean` |

#### Returns

`void`

#### Overrides

[EventEmitterLite](internal_.EventEmitterLite.md).[removeAllListeners](internal_.EventEmitterLite.md#removealllisteners)

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter.d.ts:28

___

### removeAllListenersOf

▸ **removeAllListenersOf**(`event`): `void`

Removes all listeners for a specific event.
Does not affect any-listeners.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `Events` extends `string` \| `symbol` ? `Events`\<`Events`\> : keyof `Events` |

#### Returns

`void`

#### Inherited from

[EventEmitterLite](internal_.EventEmitterLite.md).[removeAllListenersOf](internal_.EventEmitterLite.md#removealllistenersof)

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter-lite.d.ts:125

___

### removeListener

▸ **removeListener**\<`K`\>(`event`, `listener`): `void`

Remove an event listener from an event

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends `string` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `K` |
| `listener` | `Function` |

#### Returns

`void`

#### Inherited from

[EventEmitterLite](internal_.EventEmitterLite.md).[removeListener](internal_.EventEmitterLite.md#removelistener)

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter-lite.d.ts:56

___

### waitForAnyEvent

▸ **waitForAnyEvent**\<`K`\>(`events`, `max_wait_ms?`): `Promise`\<`boolean`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends `string` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `events` | `K`[] |
| `max_wait_ms?` | `number` |

#### Returns

`Promise`\<`boolean`\>

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter.d.ts:23

___

### waitForEvent

▸ **waitForEvent**\<`K`\>(`event`, `max_wait_ms?`): `Promise`\<`boolean`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends `string` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `K` |
| `max_wait_ms?` | `number` |

#### Returns

`Promise`\<`boolean`\>

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter.d.ts:16
