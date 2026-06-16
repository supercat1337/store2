[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / UpdateDataRecord

# Class: UpdateDataRecord

[\<internal\>](../modules/internal_.md).UpdateDataRecord

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

Initializes an instance of UpdateDataRecord with the provided type, old value, and new value.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `type` | ``"set"`` \| ``"delete"`` | The action performed, either "set" or "delete". |
| `oldValue` | `any` | The previous value before the update. |
| `value` | `any` | The new value after the update. |
| `reactiveItem?` | [`ReactiveItem`](ReactiveItem.md) | The reactive item that triggered the update. |

#### Returns

[`UpdateDataRecord`](internal_.UpdateDataRecord.md)

#### Defined in

[src/core/UpdateDataRecord.js:23](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/UpdateDataRecord.js#L23)

## Properties

### oldValue

• **oldValue**: `any`

#### Defined in

[src/core/UpdateDataRecord.js:11](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/UpdateDataRecord.js#L11)

___

### reactiveItem

• **reactiveItem**: [`ReactiveItem`](ReactiveItem.md)

#### Defined in

[src/core/UpdateDataRecord.js:14](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/UpdateDataRecord.js#L14)

___

### type

• **type**: ``"set"`` \| ``"delete"``

#### Defined in

[src/core/UpdateDataRecord.js:5](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/UpdateDataRecord.js#L5)

___

### value

• **value**: `any`

#### Defined in

[src/core/UpdateDataRecord.js:8](https://github.com/supercat1337/store2/blob/db27dff8135ce0b18c8545168f48050df8eeffe0/src/core/UpdateDataRecord.js#L8)
