[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / UpdateDataRecord

# Class: UpdateDataRecord

[\<internal\>](../modules/internal_.md).UpdateDataRecord

## Table of contents

### Constructors

- [constructor](internal_.UpdateDataRecord.md#constructor)

### Properties

- [oldValue](internal_.UpdateDataRecord.md#oldvalue)
- [reactiveItem](internal_.UpdateDataRecord.md#reactiveitem)
- [value](internal_.UpdateDataRecord.md#value)
- [verb](internal_.UpdateDataRecord.md#verb)

## Constructors

### constructor

• **new UpdateDataRecord**(`verb`, `oldValue`, `value`, `reactiveItem?`): [`UpdateDataRecord`](internal_.UpdateDataRecord.md)

Initializes an instance of UpdateDataRecord with the provided verb, old value, and new value.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `verb` | ``"set"`` \| ``"delete"`` | The action performed, either "set" or "delete". |
| `oldValue` | `any` | The previous value before the update. |
| `value` | `any` | The new value after the update. |
| `reactiveItem?` | [`ReactivePrimitive`](ReactivePrimitive.md) | The reactive item that triggered the update. |

#### Returns

[`UpdateDataRecord`](internal_.UpdateDataRecord.md)

#### Defined in

[src/core/UpdateDataRecord.js:23](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/core/UpdateDataRecord.js#L23)

## Properties

### oldValue

• **oldValue**: `any`

#### Defined in

[src/core/UpdateDataRecord.js:11](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/core/UpdateDataRecord.js#L11)

___

### reactiveItem

• **reactiveItem**: [`ReactivePrimitive`](ReactivePrimitive.md)

#### Defined in

[src/core/UpdateDataRecord.js:14](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/core/UpdateDataRecord.js#L14)

___

### value

• **value**: `any`

#### Defined in

[src/core/UpdateDataRecord.js:8](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/core/UpdateDataRecord.js#L8)

___

### verb

• **verb**: ``"set"`` \| ``"delete"``

#### Defined in

[src/core/UpdateDataRecord.js:5](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/core/UpdateDataRecord.js#L5)
