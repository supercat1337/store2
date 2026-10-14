[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / ContextSnapshot

# Interface: ContextSnapshot

[\<internal\>](../modules/internal_.md).ContextSnapshot

A serializable snapshot of an entire context.

`roots` maps the name given at `registerRoot()` time to that root's own
`serialize()` output. The snapshot is JSON-safe by construction — every
`serialize()` implementation returns plain objects, arrays, and
primitives.

## Table of contents

### Properties

- [meta](internal_.ContextSnapshot.md#meta)
- [roots](internal_.ContextSnapshot.md#roots)
- [timestamp](internal_.ContextSnapshot.md#timestamp)
- [version](internal_.ContextSnapshot.md#version)

## Properties

### meta

• `Optional` **meta**: [`Record`](../modules/internal_.md#record)\<`string`, `unknown`\>

Adapter-defined metadata. The core never inspects this field —
`store2-persist` and `store2-ssr` may store TTL, hashes, encryption
parameters, adapter name, etc. here.

#### Defined in

[src/types.ts:131](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L131)

___

### roots

• **roots**: `Object`

Snapshot data keyed by the root name passed to `registerRoot()`.

#### Index signature

▪ [rootName: `string`]: `any`

#### Defined in

[src/types.ts:124](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L124)

___

### timestamp

• **timestamp**: `number`

Wall-clock timestamp (milliseconds since epoch) when the snapshot
was captured.

#### Defined in

[src/types.ts:119](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L119)

___

### version

• **version**: `number`

Snapshot format version. Persistence adapters should dispatch on
this field for migrations.

#### Defined in

[src/types.ts:113](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L113)
