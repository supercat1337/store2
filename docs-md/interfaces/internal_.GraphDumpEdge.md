[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / GraphDumpEdge

# Interface: GraphDumpEdge

[\<internal\>](../modules/internal_.md).GraphDumpEdge

A directed edge in the dependency graph.

`{ from: A, to: B, kind: 'dep' }` means A depends on B.

## Table of contents

### Properties

- [from](internal_.GraphDumpEdge.md#from)
- [kind](internal_.GraphDumpEdge.md#kind)
- [to](internal_.GraphDumpEdge.md#to)

## Properties

### from

• **from**: `number`

#### Defined in

[src/types.ts:386](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L386)

___

### kind

• **kind**: ``"sub"`` \| ``"dep"``

#### Defined in

[src/types.ts:388](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L388)

___

### to

• **to**: `number`

#### Defined in

[src/types.ts:387](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L387)
