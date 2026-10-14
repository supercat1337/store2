[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / SnapshotRoot

# Interface: SnapshotRoot

[\<internal\>](../modules/internal_.md).SnapshotRoot

Minimal interface a context root must satisfy to be snapshotted.

`Store` and `ReactiveList` implement this interface out of the box.

## Table of contents

### Methods

- [hydrate](internal_.SnapshotRoot.md#hydrate)
- [serialize](internal_.SnapshotRoot.md#serialize)

## Methods

### hydrate

▸ **hydrate**(`data`): `void`

Restores state previously produced by `serialize()`. Called by
`context.hydrate()` inside a batch. Implementations must be
idempotent and must not throw on malformed input.

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `any` |

#### Returns

`void`

#### Defined in

[src/types.ts:182](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L182)

___

### serialize

▸ **serialize**(): `any`

Returns a plain data representation of the root suitable for storage
or transport. Called by `context.snapshot()`.

#### Returns

`any`

#### Defined in

[src/types.ts:175](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L175)
