[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / UpdateDataRecord

# Class: UpdateDataRecord

[\<internal\>](../modules/internal_.md).UpdateDataRecord

A single mutation state passed to subscribers.

Every entry in the `updates` map received by a subscriber is an instance
of this class.

## Table of contents

### Constructors

- [constructor](internal_.UpdateDataRecord.md#constructor)

### Properties

- [oldValue](internal_.UpdateDataRecord.md#oldvalue)
- [reactiveItem](internal_.UpdateDataRecord.md#reactiveitem)
- [type](internal_.UpdateDataRecord.md#type)
- [value](internal_.UpdateDataRecord.md#value)

## Constructors

### constructor

• **new UpdateDataRecord**(`type`, `oldValue`, `value`, `reactiveItem?`): [`UpdateDataRecord`](internal_.UpdateDataRecord.md)

Creates a new update record.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `type` | ``"set"`` \| ``"delete"`` | The operation that produced the change. |
| `oldValue` | `any` | Value before the change. |
| `value` | `any` | Value after the change. |
| `reactiveItem?` | [`ReactiveItem`](ReactiveItem.md) | The reactive item that triggered the update. |

#### Returns

[`UpdateDataRecord`](internal_.UpdateDataRecord.md)

#### Defined in

[src/core/UpdateDataRecord.js:32](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/UpdateDataRecord.js#L32)

## Properties

### oldValue

• **oldValue**: `any`

#### Defined in

[src/core/UpdateDataRecord.js:19](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/UpdateDataRecord.js#L19)

___

### reactiveItem

• **reactiveItem**: [`ReactiveItem`](ReactiveItem.md)

#### Defined in

[src/core/UpdateDataRecord.js:22](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/UpdateDataRecord.js#L22)

___

### type

• **type**: ``"set"`` \| ``"delete"``

#### Defined in

[src/core/UpdateDataRecord.js:13](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/UpdateDataRecord.js#L13)

___

### value

• **value**: `any`

#### Defined in

[src/core/UpdateDataRecord.js:16](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/UpdateDataRecord.js#L16)
