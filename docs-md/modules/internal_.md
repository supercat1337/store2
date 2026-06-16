[@supercat1337/store2](../README.md) / [Modules](../modules.md) / \<internal\>

# Module: \<internal\>

## Table of contents

### Classes

- [BatchSnapshot](../classes/internal_.BatchSnapshot.md)
- [Dictionary](../classes/internal_.Dictionary.md)
- [Engine](../classes/internal_.Engine.md)
- [EventEmitterExt](../classes/internal_.EventEmitterExt.md)
- [SubscribeController](../classes/internal_.SubscribeController.md)
- [UpdateDataRecord](../classes/internal_.UpdateDataRecord.md)
- [UpdateDataRecordManager](../classes/internal_.UpdateDataRecordManager.md)

### Interfaces

- [ArrayLike](../interfaces/internal_.ArrayLike.md)
- [PropertyDescriptor](../interfaces/internal_.PropertyDescriptor.md)
- [ProxyHandler](../interfaces/internal_.ProxyHandler.md)

### Type Aliases

- [CompareFunction](internal_.md#comparefunction)
- [Unsubscriber](internal_.md#unsubscriber)
- [WeakKey](internal_.md#weakkey)

## Type Aliases

### CompareFunction

Ƭ **CompareFunction**: (`a`: `any`, `b`: `any`) => `boolean`

#### Type declaration

▸ (`a`, `b`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `any` |
| `b` | `any` |

##### Returns

`boolean`

#### Defined in

[src/types.d.ts:2](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/types.d.ts#L2)

___

### Unsubscriber

Ƭ **Unsubscriber**\<\>: () => `void`

#### Type declaration

▸ (): `void`

##### Returns

`void`

#### Defined in

[src/core/subscribeController.js:7](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/subscribeController.js#L7)

___

### WeakKey

Ƭ **WeakKey**: `WeakKeyTypes`[keyof `WeakKeyTypes`]

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1687
