[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / GraphDumpItem

# Interface: GraphDumpItem

[\<internal\>](../modules/internal_.md).GraphDumpItem

A single node in the dependency graph returned by
`Store2Context.dumpGraph()`.

## Table of contents

### Properties

- [id](internal_.GraphDumpItem.md#id)
- [name](internal_.GraphDumpItem.md#name)
- [type](internal_.GraphDumpItem.md#type)
- [version](internal_.GraphDumpItem.md#version)

## Properties

### id

• **id**: `number`

Monotonic id assigned by the context's id service.

#### Defined in

[src/types.ts:359](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L359)

___

### name

• **name**: `string`

Debug name of the reactive item, or `''` if not set.

#### Defined in

[src/types.ts:364](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L364)

___

### type

• **type**: [`ReactiveItemType`](../modules/internal_.md#reactiveitemtype)

Reactive item type tag:
`1` Atom, `2` Computed, `3` Collection, `4` ShallowReactive.

#### Defined in

[src/types.ts:370](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L370)

___

### version

• **version**: `number`

Current version counter of the item.

#### Defined in

[src/types.ts:375](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L375)
