[@supercat1337/store2](../README.md) / [Modules](../modules.md) / \<internal\>

# Module: \<internal\>

## Table of contents

### Classes

- [BatchSnapshot](../classes/internal_.BatchSnapshot.md)
- [Engine](../classes/internal_.Engine.md)
- [EventEmitter](../classes/internal_.EventEmitter.md)
- [EventEmitterLite](../classes/internal_.EventEmitterLite.md)
- [SubscribeController](../classes/internal_.SubscribeController.md)
- [UpdateDataRecord](../classes/internal_.UpdateDataRecord.md)
- [UpdateDataRecordManager](../classes/internal_.UpdateDataRecordManager.md)

### Interfaces

- [ArrayLike](../interfaces/internal_.ArrayLike.md)
- [PropertyDescriptor](../interfaces/internal_.PropertyDescriptor.md)
- [ProxyHandler](../interfaces/internal_.ProxyHandler.md)

### Type Aliases

- [CompareFunction](internal_.md#comparefunction)
- [Record](internal_.md#record)
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

[src/types.d.ts:2](https://github.com/supercat1337/store2/blob/e60081710ee7e24f7bcf3bcbc43ae5661fe35f53/src/types.d.ts#L2)

___

### Record

Ƭ **Record**\<`K`, `T`\>: \{ [P in K]: T }

Construct a type with a set of properties K of type T

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends keyof `any` |
| `T` | `T` |

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1606

___

### Unsubscriber

Ƭ **Unsubscriber**\<\>: () => `void`

#### Type declaration

▸ (): `void`

##### Returns

`void`

#### Defined in

[src/core/subscribeController.js:7](https://github.com/supercat1337/store2/blob/e60081710ee7e24f7bcf3bcbc43ae5661fe35f53/src/core/subscribeController.js#L7)

___

### WeakKey

Ƭ **WeakKey**: `WeakKeyTypes`[keyof `WeakKeyTypes`]

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1687
