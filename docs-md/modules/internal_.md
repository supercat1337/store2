[@supercat1337/store2](../README.md) / [Modules](../modules.md) / \<internal\>

# Module: \<internal\>

## Table of contents

### Classes

- [BatchSnapshot](../classes/internal_.BatchSnapshot.md)
- [DependencyGraph](../classes/internal_.DependencyGraph.md)
- [Engine](../classes/internal_.Engine.md)
- [EventEmitter](../classes/internal_.EventEmitter.md)
- [EventEmitterLite](../classes/internal_.EventEmitterLite.md)
- [MessageHandler](../classes/internal_.MessageHandler.md)
- [SubscribeController](../classes/internal_.SubscribeController.md)
- [UpdateDataRecord](../classes/internal_.UpdateDataRecord.md)
- [UpdateDataRecordManager](../classes/internal_.UpdateDataRecordManager.md)
- [UpdateTracker](../classes/internal_.UpdateTracker.md)

### Interfaces

- [ArrayLike](../interfaces/internal_.ArrayLike.md)
- [Iterable](../interfaces/internal_.Iterable.md)
- [Iterator](../interfaces/internal_.Iterator.md)
- [IteratorReturnResult](../interfaces/internal_.IteratorReturnResult.md)
- [IteratorYieldResult](../interfaces/internal_.IteratorYieldResult.md)
- [PropertyDescriptor](../interfaces/internal_.PropertyDescriptor.md)
- [ProxyHandler](../interfaces/internal_.ProxyHandler.md)
- [TypedPropertyDescriptor](../interfaces/internal_.TypedPropertyDescriptor.md)

### Type Aliases

- [CompareFunction](internal_.md#comparefunction)
- [IteratorResult](internal_.md#iteratorresult)
- [Record](internal_.md#record)
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

[src/types.d.ts:4](https://github.com/supercat1337/store2/blob/c65c4382ec22e2f61bbc31b786846fc524db2820/src/types.d.ts#L4)

___

### IteratorResult

Ƭ **IteratorResult**\<`T`, `TReturn`\>: [`IteratorYieldResult`](../interfaces/internal_.IteratorYieldResult.md)\<`T`\> \| [`IteratorReturnResult`](../interfaces/internal_.IteratorReturnResult.md)\<`TReturn`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` |
| `TReturn` | `any` |

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:39

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

### WeakKey

Ƭ **WeakKey**: `WeakKeyTypes`[keyof `WeakKeyTypes`]

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1687
