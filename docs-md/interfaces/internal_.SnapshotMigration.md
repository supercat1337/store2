[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / SnapshotMigration

# Interface: SnapshotMigration

[\<internal\>](../modules/internal_.md).SnapshotMigration

Snapshot version migration.

Migrations are applied by `context.hydrate()` before the roots are
unpacked. A migration registered for `from: 1, to: 2` is invoked when
the incoming snapshot has `version === 1`; the returned snapshot must
declare `version === 2`. The chain continues until the snapshot version
matches the current `SNAPSHOT_VERSION`.

## Table of contents

### Properties

- [from](internal_.SnapshotMigration.md#from)
- [to](internal_.SnapshotMigration.md#to)

### Methods

- [migrate](internal_.SnapshotMigration.md#migrate)

## Properties

### from

• **from**: `number`

Snapshot version this migration expects as input.

#### Defined in

[src/types.ts:149](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L149)

___

### to

• **to**: `number`

Snapshot version this migration produces as output.

#### Defined in

[src/types.ts:154](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L154)

## Methods

### migrate

▸ **migrate**(`snapshot`): [`ContextSnapshot`](internal_.ContextSnapshot.md)

Returns a new snapshot compatible with version `to`. Must not
mutate the input.

#### Parameters

| Name | Type |
| :------ | :------ |
| `snapshot` | [`ContextSnapshot`](internal_.ContextSnapshot.md) |

#### Returns

[`ContextSnapshot`](internal_.ContextSnapshot.md)

#### Defined in

[src/types.ts:160](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L160)
