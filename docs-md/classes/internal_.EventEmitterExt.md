[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / EventEmitterExt

# Class: EventEmitterExt\<T\>

[\<internal\>](../modules/internal_.md).EventEmitterExt

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `string` |

## Table of contents

### Constructors

- [constructor](internal_.EventEmitterExt.md#constructor)

### Properties

- [#private](internal_.EventEmitterExt.md##private)
- [autoRegister](internal_.EventEmitterExt.md#autoregister)
- [name](internal_.EventEmitterExt.md#name)
- [noLimitsToEmit](internal_.EventEmitterExt.md#nolimitstoemit)

### Methods

- [emit](internal_.EventEmitterExt.md#emit)
- [emitMany](internal_.EventEmitterExt.md#emitmany)
- [getEventNames](internal_.EventEmitterExt.md#geteventnames)
- [getListenerRunnerStrategy](internal_.EventEmitterExt.md#getlistenerrunnerstrategy)
- [getListeners](internal_.EventEmitterExt.md#getlisteners)
- [getNumberOfListeners](internal_.EventEmitterExt.md#getnumberoflisteners)
- [hasEvent](internal_.EventEmitterExt.md#hasevent)
- [hasListeners](internal_.EventEmitterExt.md#haslisteners)
- [isMuted](internal_.EventEmitterExt.md#ismuted)
- [mute](internal_.EventEmitterExt.md#mute)
- [off](internal_.EventEmitterExt.md#off)
- [on](internal_.EventEmitterExt.md#on)
- [onAny](internal_.EventEmitterExt.md#onany)
- [once](internal_.EventEmitterExt.md#once)
- [registerEvents](internal_.EventEmitterExt.md#registerevents)
- [removeAllListeners](internal_.EventEmitterExt.md#removealllisteners)
- [removeListener](internal_.EventEmitterExt.md#removelistener)
- [setListenerRunnerStrategy](internal_.EventEmitterExt.md#setlistenerrunnerstrategy)
- [unmute](internal_.EventEmitterExt.md#unmute)
- [unregisterAllEvents](internal_.EventEmitterExt.md#unregisterallevents)
- [unregisterEvents](internal_.EventEmitterExt.md#unregisterevents)
- [waitForAnyEvent](internal_.EventEmitterExt.md#waitforanyevent)
- [waitForEvent](internal_.EventEmitterExt.md#waitforevent)

## Constructors

### constructor

• **new EventEmitterExt**\<`T`\>(): [`EventEmitterExt`](internal_.EventEmitterExt.md)\<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `string` |

#### Returns

[`EventEmitterExt`](internal_.EventEmitterExt.md)\<`T`\>

## Properties

### #private

• `Private` **#private**: `any`

#### Defined in

node_modules/@supercat1337/event-emitter-ext/dist/event-emitter-ext.esm.d.ts:147

___

### autoRegister

• **autoRegister**: `boolean`

#### Defined in

node_modules/@supercat1337/event-emitter-ext/dist/event-emitter-ext.esm.d.ts:6

___

### name

• **name**: `string`

#### Defined in

node_modules/@supercat1337/event-emitter-ext/dist/event-emitter-ext.esm.d.ts:10

___

### noLimitsToEmit

• **noLimitsToEmit**: `boolean`

#### Defined in

node_modules/@supercat1337/event-emitter-ext/dist/event-emitter-ext.esm.d.ts:8

## Methods

### emit

▸ **emit**(`event`, `...args`): `void`

emit is used to trigger an event

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `T` |
| `...args` | `any`[] |

#### Returns

`void`

#### Defined in

node_modules/@supercat1337/event-emitter-ext/dist/event-emitter-ext.esm.d.ts:108

___

### emitMany

▸ **emitMany**(`events`, `...args`): `void`

emitMany is used to trigger multiple events at the same time

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `events` | `T`[] | Array of events to trigger |
| `...args` | `any`[] | Arguments to pass to the event listeners |

#### Returns

`void`

#### Defined in

node_modules/@supercat1337/event-emitter-ext/dist/event-emitter-ext.esm.d.ts:114

___

### getEventNames

▸ **getEventNames**(): `string`[]

Get the names of all events that have been registered.

#### Returns

`string`[]

- An array of the names of all events that have been registered.

#### Defined in

node_modules/@supercat1337/event-emitter-ext/dist/event-emitter-ext.esm.d.ts:146

___

### getListenerRunnerStrategy

▸ **getListenerRunnerStrategy**(): `number`

Get the strategy for running listeners. The strategy is used to determine the order in which listeners are called.

#### Returns

`number`

- The strategy to use. The following values are supported:
0 - Iterate over the listeners in the order they were registered .
1 - Iterate over listeners in the order they were registered, grouped by events.

#### Defined in

node_modules/@supercat1337/event-emitter-ext/dist/event-emitter-ext.esm.d.ts:24

___

### getListeners

▸ **getListeners**(`event`): `Function`[]

Get the listeners for a specific event

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | `T` | The event to get the listeners for |

#### Returns

`Function`[]

- An array of the listeners for the event

#### Defined in

node_modules/@supercat1337/event-emitter-ext/dist/event-emitter-ext.esm.d.ts:141

___

### getNumberOfListeners

▸ **getNumberOfListeners**(`event`): `number`

Get the number of listeners registered for a specific event

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | `T` | The event to get the number of listeners for |

#### Returns

`number`

- The number of listeners for the event

#### Defined in

node_modules/@supercat1337/event-emitter-ext/dist/event-emitter-ext.esm.d.ts:102

___

### hasEvent

▸ **hasEvent**(`event`): `boolean`

Check if an event is registered with the event emitter

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `T` |

#### Returns

`boolean`

#### Defined in

node_modules/@supercat1337/event-emitter-ext/dist/event-emitter-ext.esm.d.ts:90

___

### hasListeners

▸ **hasListeners**(`event`): `boolean`

Check if there are any listeners registered for a specific event

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | `T` | The event to check for listeners |

#### Returns

`boolean`

- Returns true if there are listeners for the event, false otherwise

#### Defined in

node_modules/@supercat1337/event-emitter-ext/dist/event-emitter-ext.esm.d.ts:96

___

### isMuted

▸ **isMuted**(): `boolean`

Returns whether the event emitter is currently muted.

#### Returns

`boolean`

#### Defined in

node_modules/@supercat1337/event-emitter-ext/dist/event-emitter-ext.esm.d.ts:40

___

### mute

▸ **mute**(): `void`

Set the event emitter to a muted state. While muted, any calls to emit or emitMany
will not trigger any event listeners. Instead, the events and their arguments will be
stored to be triggered when the event emitter is unmuted.

#### Returns

`void`

#### Defined in

node_modules/@supercat1337/event-emitter-ext/dist/event-emitter-ext.esm.d.ts:30

___

### off

▸ **off**(`event`, `listener`): `void`

Alias for removeListener

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `T` |
| `listener` | `Function` |

#### Returns

`void`

#### Defined in

node_modules/@supercat1337/event-emitter-ext/dist/event-emitter-ext.esm.d.ts:84

___

### on

▸ **on**(`event`, `listener`): () => `void`

on is used to add a callback function that's going to be executed when the event is triggered

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `T` |
| `listener` | `Function` |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Defined in

node_modules/@supercat1337/event-emitter-ext/dist/event-emitter-ext.esm.d.ts:60

___

### onAny

▸ **onAny**(`events`, `listener`): () => `void`

Add a callback function that's going to be executed when any of the events are triggered

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `events` | `T`[] | Array of events to listen to |
| `listener` | `Function` | Callback to execute when any of the events are triggered |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Defined in

node_modules/@supercat1337/event-emitter-ext/dist/event-emitter-ext.esm.d.ts:67

___

### once

▸ **once**(`event`, `listener`): () => `void`

Add a one-time listener

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `T` |
| `listener` | `Function` |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Defined in

node_modules/@supercat1337/event-emitter-ext/dist/event-emitter-ext.esm.d.ts:121

___

### registerEvents

▸ **registerEvents**(`...events`): `void`

Register events to be emitted. This should be called before any other methods on this class.
The order of the events in the `events` array determines the order in which the event listeners are triggered.
This method can be called multiple times to register multiple events.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...events` | `T`[] | Array of events to register |

#### Returns

`void`

#### Defined in

node_modules/@supercat1337/event-emitter-ext/dist/event-emitter-ext.esm.d.ts:47

___

### removeAllListeners

▸ **removeAllListeners**(`event`): `void`

Remove all event listeners from an event

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `T` |

#### Returns

`void`

#### Defined in

node_modules/@supercat1337/event-emitter-ext/dist/event-emitter-ext.esm.d.ts:78

___

### removeListener

▸ **removeListener**(`event`, `listener`): `void`

Remove an event listener from an event

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `T` |
| `listener` | `Function` |

#### Returns

`void`

#### Defined in

node_modules/@supercat1337/event-emitter-ext/dist/event-emitter-ext.esm.d.ts:73

___

### setListenerRunnerStrategy

▸ **setListenerRunnerStrategy**(`strategy`): `void`

Set the strategy for running listeners. The strategy is used to determine the order in which listeners are called.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `strategy` | `number` | The strategy to use. The following values are supported: 0 - Iterate over the listeners in the order they were registered . 1 - Iterate over listeners in the order they were registered, grouped by events. |

#### Returns

`void`

#### Defined in

node_modules/@supercat1337/event-emitter-ext/dist/event-emitter-ext.esm.d.ts:17

___

### unmute

▸ **unmute**(): `void`

Unmutes the event emitter, allowing events to be triggered.
Any events that were scheduled while muted will be executed.

#### Returns

`void`

#### Defined in

node_modules/@supercat1337/event-emitter-ext/dist/event-emitter-ext.esm.d.ts:35

___

### unregisterAllEvents

▸ **unregisterAllEvents**(): `void`

#### Returns

`void`

#### Defined in

node_modules/@supercat1337/event-emitter-ext/dist/event-emitter-ext.esm.d.ts:53

___

### unregisterEvents

▸ **unregisterEvents**(`...events`): `void`

Unregister events from being emitted. If the event is not already registered, this has no effect.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...events` | `T`[] | Array of events to unregister |

#### Returns

`void`

#### Defined in

node_modules/@supercat1337/event-emitter-ext/dist/event-emitter-ext.esm.d.ts:52

___

### waitForAnyEvent

▸ **waitForAnyEvent**(`events`, `max_wait_ms?`): `Promise`\<`boolean`\>

Wait for any of the specified events to be emitted

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `events` | `T`[] | Array of event names to wait for |
| `max_wait_ms?` | `number` | Maximum time to wait in ms. If 0, the function will wait indefinitely. |

#### Returns

`Promise`\<`boolean`\>

- Resolves with true if any event was emitted, false if the time ran out.

#### Defined in

node_modules/@supercat1337/event-emitter-ext/dist/event-emitter-ext.esm.d.ts:135

___

### waitForEvent

▸ **waitForEvent**(`event`, `max_wait_ms?`): `Promise`\<`boolean`\>

Wait for an event to be emitted

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | `T` |  |
| `max_wait_ms?` | `number` | Maximum time to wait in ms. If 0, the function will wait indefinitely. |

#### Returns

`Promise`\<`boolean`\>

- Resolves with true if the event was emitted, false if the time ran out.

#### Defined in

node_modules/@supercat1337/event-emitter-ext/dist/event-emitter-ext.esm.d.ts:128
