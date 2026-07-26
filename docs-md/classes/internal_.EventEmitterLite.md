[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / EventEmitterLite

# Class: EventEmitterLite\<Events\>

[\<internal\>](../modules/internal_.md).EventEmitterLite

## Type parameters

| Name | Type |
| :------ | :------ |
| `Events` | extends `string` \| `symbol` \| [`Record`](../modules/internal_.md#record)\<`string` \| `symbol`, `any`[]\> = `string` |

## Hierarchy

- **`EventEmitterLite`**

  ↳ [`EventEmitter`](internal_.EventEmitter.md)

## Table of contents

### Constructors

- [constructor](internal_.EventEmitterLite.md#constructor)

### Properties

- [anyListeners](internal_.EventEmitterLite.md#anylisteners)
- [events](internal_.EventEmitterLite.md#events)
- [logErrors](internal_.EventEmitterLite.md#logerrors)

### Methods

- [\_emitAny](internal_.EventEmitterLite.md#_emitany)
- [clear](internal_.EventEmitterLite.md#clear)
- [emit](internal_.EventEmitterLite.md#emit)
- [eventNames](internal_.EventEmitterLite.md#eventnames)
- [getListeners](internal_.EventEmitterLite.md#getlisteners)
- [hasListeners](internal_.EventEmitterLite.md#haslisteners)
- [listenerCount](internal_.EventEmitterLite.md#listenercount)
- [off](internal_.EventEmitterLite.md#off)
- [offAny](internal_.EventEmitterLite.md#offany)
- [on](internal_.EventEmitterLite.md#on)
- [onAny](internal_.EventEmitterLite.md#onany)
- [once](internal_.EventEmitterLite.md#once)
- [removeAllListeners](internal_.EventEmitterLite.md#removealllisteners)
- [removeAllListenersOf](internal_.EventEmitterLite.md#removealllistenersof)
- [removeListener](internal_.EventEmitterLite.md#removelistener)

## Constructors

### constructor

• **new EventEmitterLite**\<`Events`\>(): [`EventEmitterLite`](internal_.EventEmitterLite.md)\<`Events`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Events` | extends `string` \| `symbol` \| [`Record`](../modules/internal_.md#record)\<`string` \| `symbol`, `any`[]\> = `string` |

#### Returns

[`EventEmitterLite`](internal_.EventEmitterLite.md)\<`Events`\>

## Properties

### anyListeners

• **anyListeners**: `Function`[]

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter-lite.d.ts:15

___

### events

• **events**: `any`

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter-lite.d.ts:9

___

### logErrors

• **logErrors**: `boolean`

logErrors indicates whether errors thrown by listeners should be logged to the console.

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter-lite.d.ts:20

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

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter-lite.d.ts:118

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

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter-lite.d.ts:77

___

### eventNames

▸ **eventNames**(): `Events` extends `string` \| `symbol` ? `Events`\<`Events`\> : keyof `Events`[]

Returns an array of event names that have at least one listener (including Symbols).

#### Returns

`Events` extends `string` \| `symbol` ? `Events`\<`Events`\> : keyof `Events`[]

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

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter-lite.d.ts:63

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

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter-lite.d.ts:40

___

### removeAllListeners

▸ **removeAllListeners**(): `void`

Removes all listeners from all events.

#### Returns

`void`

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter-lite.d.ts:112

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

#### Defined in

node_modules/@supercat1337/event-emitter/src/event-emitter-lite.d.ts:56
