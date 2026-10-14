[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / IdService

# Class: IdService

[\<internal\>](../modules/internal_.md).IdService

Service that generates unique numeric identifiers for reactive items.

Each context owns its own instance so that ordering stays deterministic
inside one store tree and isolated between contexts (SSR, tests, etc.).

## Table of contents

### Constructors

- [constructor](internal_.IdService.md#constructor)

### Properties

- [#counter](internal_.IdService.md##counter)

### Methods

- [compareIds](internal_.IdService.md#compareids)
- [generateId](internal_.IdService.md#generateid)
- [reset](internal_.IdService.md#reset)

## Constructors

### constructor

• **new IdService**(): [`IdService`](internal_.IdService.md)

#### Returns

[`IdService`](internal_.IdService.md)

## Properties

### #counter

• `Private` **#counter**: `number` = `0`

#### Defined in

[src/services/idService.js:11](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/idService.js#L11)

## Methods

### compareIds

▸ **compareIds**(`a`, `b`): `number`

Compares two numeric identifiers.

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `number` |
| `b` | `number` |

#### Returns

`number`

-1 if a < b, 1 if a > b, 0 if equal.

#### Defined in

[src/services/idService.js:27](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/idService.js#L27)

___

### generateId

▸ **generateId**(): `number`

Generates a new unique numeric identifier.

#### Returns

`number`

A monotonic unique number.

#### Defined in

[src/services/idService.js:17](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/idService.js#L17)

___

### reset

▸ **reset**(): `void`

Resets the internal counter. Useful in tests.

#### Returns

`void`

#### Defined in

[src/services/idService.js:40](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/idService.js#L40)
