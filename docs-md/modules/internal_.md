[@supercat1337/store2](../README.md) / [Modules](../modules.md) / \<internal\>

# Module: \<internal\>

## Table of contents

### Classes

- [BatchSnapshot](../classes/internal_.BatchSnapshot.md)
- [ChangedItemsController](../classes/internal_.ChangedItemsController.md)
- [DependencyGraph](../classes/internal_.DependencyGraph.md)
- [EventEmitter](../classes/internal_.EventEmitter.md)
- [EventEmitterLite](../classes/internal_.EventEmitterLite.md)
- [IdService](../classes/internal_.IdService.md)
- [MessageHandler](../classes/internal_.MessageHandler.md)
- [ModeControllerService](../classes/internal_.ModeControllerService.md)
- [SubscribeController](../classes/internal_.SubscribeController.md)
- [Tracker](../classes/internal_.Tracker.md)
- [UpdateDataRecord](../classes/internal_.UpdateDataRecord.md)
- [UpdateDataRecordManager](../classes/internal_.UpdateDataRecordManager.md)
- [UpdateTracker](../classes/internal_.UpdateTracker.md)

### Interfaces

- [ActionInfo](../interfaces/internal_.ActionInfo.md)
- [ArrayLike](../interfaces/internal_.ArrayLike.md)
- [BatchInfo](../interfaces/internal_.BatchInfo.md)
- [ContextSnapshot](../interfaces/internal_.ContextSnapshot.md)
- [GraphDump](../interfaces/internal_.GraphDump.md)
- [GraphDumpEdge](../interfaces/internal_.GraphDumpEdge.md)
- [GraphDumpItem](../interfaces/internal_.GraphDumpItem.md)
- [Iterable](../interfaces/internal_.Iterable.md)
- [Iterator](../interfaces/internal_.Iterator.md)
- [IteratorReturnResult](../interfaces/internal_.IteratorReturnResult.md)
- [IteratorYieldResult](../interfaces/internal_.IteratorYieldResult.md)
- [ObservableValue](../interfaces/internal_.ObservableValue.md)
- [PropertyDescriptor](../interfaces/internal_.PropertyDescriptor.md)
- [ProxyHandler](../interfaces/internal_.ProxyHandler.md)
- [SnapshotMigration](../interfaces/internal_.SnapshotMigration.md)
- [SnapshotRoot](../interfaces/internal_.SnapshotRoot.md)
- [Store2Plugin](../interfaces/internal_.Store2Plugin.md)

### Type Aliases

- [ActionMiddleware](internal_.md#actionmiddleware)
- [CompareFunction](internal_.md#comparefunction)
- [IteratorResult](internal_.md#iteratorresult)
- [ReactiveItemType](internal_.md#reactiveitemtype)
- [Record](internal_.md#record)
- [WeakKey](internal_.md#weakkey)

## Type Aliases

### ActionMiddleware

Ƭ **ActionMiddleware**: (`action`: [`ActionInfo`](../interfaces/internal_.ActionInfo.md), `next`: () => `Promise`\<`any`\>) => `Promise`\<`any`\>

Middleware invoked for every action. Must call `next()` to continue the
chain. Returning without calling `next()` short-circuits the action.

#### Type declaration

▸ (`action`, `next`): `Promise`\<`any`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `action` | [`ActionInfo`](../interfaces/internal_.ActionInfo.md) |
| `next` | () => `Promise`\<`any`\> |

##### Returns

`Promise`\<`any`\>

#### Defined in

[src/types.ts:291](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L291)

___

### CompareFunction

Ƭ **CompareFunction**: (`a`: `any`, `b`: `any`) => `boolean`

A function that compares two values for equality. Used by reactive items
to decide whether a mutation is effective.

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

[src/types.ts:21](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L21)

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

### ReactiveItemType

Ƭ **ReactiveItemType**: ``1`` \| ``2`` \| ``3`` \| ``4``

The numeric type tag of a reactive item.

- `1` — `Atom`
- `2` — `Computed`
- `3` — `Collection`
- `4` — `ShallowReactive`

#### Defined in

[src/types.ts:13](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L13)

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
