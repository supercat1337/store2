[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / BatchInfo

# Interface: BatchInfo

[\<internal\>](../modules/internal_.md).BatchInfo

Metadata about a batch scope. Emitted to plugins via `onBatchStart` and
`onBatchEnd`.

## Table of contents

### Properties

- [action](internal_.BatchInfo.md#action)
- [depth](internal_.BatchInfo.md#depth)
- [name](internal_.BatchInfo.md#name)

## Properties

### action

• **action**: [`ActionInfo`](internal_.ActionInfo.md)

The action currently running, if the batch is nested inside one, or
`null`.

#### Defined in

[src/types.ts:95](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L95)

___

### depth

• **depth**: `number`

Nesting depth of the batch at the moment of emission. The outermost
batch has depth `1`.

#### Defined in

[src/types.ts:83](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L83)

___

### name

• **name**: `string`

Name passed to `context.batch(name, fn)`, or `''` for unnamed
batches.

#### Defined in

[src/types.ts:89](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L89)
