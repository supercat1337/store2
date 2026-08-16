[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / MessageHandler

# Class: MessageHandler

[\<internal\>](../modules/internal_.md).MessageHandler

Handles incoming messages from dependencies/dependents.
All logic is stateless; it mutates the engine's state via callbacks.

## Table of contents

### Constructors

- [constructor](internal_.MessageHandler.md#constructor)

### Methods

- [handleMessage](internal_.MessageHandler.md#handlemessage)

## Constructors

### constructor

• **new MessageHandler**(): [`MessageHandler`](internal_.MessageHandler.md)

#### Returns

[`MessageHandler`](internal_.MessageHandler.md)

## Methods

### handleMessage

▸ **handleMessage**(`message`, `ctx`, `engineState`, `setError`, `setShouldRecalc`, `notifyDependents`, `removeDependent`, `destroyEngine`): `void`

Processes an incoming message.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `number` | The message code. |
| `ctx` | `Object` | Context. |
| `ctx.recipients` | `Set`\<[`ReactiveItem`](ReactiveItem.md)\> | - |
| `ctx.sender` | [`ReactiveItem`](ReactiveItem.md) | - |
| `engineState` | [`Engine`](internal_.Engine.md) | The engine's state container (provides getters/setters). |
| `setError` | `Function` | Callback to set the engine's error. |
| `setShouldRecalc` | `Function` | Callback to set the shouldRecalc flag. |
| `notifyDependents` | `Function` | Callback to notify dependents of a message. |
| `removeDependent` | `Function` | Callback to remove a dependent. |
| `destroyEngine` | `Function` | Callback to destroy the engine. |

#### Returns

`void`

#### Defined in

src/core/MessageHandler.js:32
