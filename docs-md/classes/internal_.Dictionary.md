[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / Dictionary

# Class: Dictionary\<T\>

[\<internal\>](../modules/internal_.md).Dictionary

The Dictionary class is a data structure that maps keys to arrays of values, enabling efficient storage and retrieval of multiple values per key.

## Type parameters

| Name |
| :------ |
| `T` |

## Table of contents

### Constructors

- [constructor](internal_.Dictionary.md#constructor)

### Properties

- [#private](internal_.Dictionary.md##private)

### Accessors

- [size](internal_.Dictionary.md#size)

### Methods

- [add](internal_.Dictionary.md#add)
- [clear](internal_.Dictionary.md#clear)
- [exists](internal_.Dictionary.md#exists)
- [get](internal_.Dictionary.md#get)
- [getLastValue](internal_.Dictionary.md#getlastvalue)
- [iterate](internal_.Dictionary.md#iterate)
- [iterateAll](internal_.Dictionary.md#iterateall)
- [keys](internal_.Dictionary.md#keys)
- [remove](internal_.Dictionary.md#remove)
- [removeAll](internal_.Dictionary.md#removeall)

## Constructors

### constructor

• **new Dictionary**\<`T`\>(): [`Dictionary`](internal_.Dictionary.md)\<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Returns

[`Dictionary`](internal_.Dictionary.md)\<`T`\>

## Properties

### #private

• `Private` **#private**: `any`

#### Defined in

node_modules/@supercat1337/dictionary/dist/dictionary.esm.d.ts:66

## Accessors

### size

• `get` **size**(): `number`

The number of keys in the dictionary.

#### Returns

`number`

#### Defined in

node_modules/@supercat1337/dictionary/dist/dictionary.esm.d.ts:45

## Methods

### add

▸ **add**(`key`, `...values`): `void`

Adds a value to a key in the dictionary. If the key is not in the dictionary, it will be added.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key to add the value to. |
| `...values` | `T`[] | The values to add to the key. |

#### Returns

`void`

#### Defined in

node_modules/@supercat1337/dictionary/dist/dictionary.esm.d.ts:11

___

### clear

▸ **clear**(`key`): `void`

Clears the values associated with the given key in the dictionary, setting it to an empty array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key whose values are to be cleared. |

#### Returns

`void`

#### Defined in

node_modules/@supercat1337/dictionary/dist/dictionary.esm.d.ts:40

___

### exists

▸ **exists**(`key`): `boolean`

Checks if a key exists in the dictionary.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key to check. |

#### Returns

`boolean`

true if the key exists, false otherwise.

#### Defined in

node_modules/@supercat1337/dictionary/dist/dictionary.esm.d.ts:22

___

### get

▸ **get**(`key`): `T`[]

Returns the array of values for the given key.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key to retrieve the values for. |

#### Returns

`T`[]

The array of values for the given key, or undefined if the key does not exist in the dictionary.

#### Defined in

node_modules/@supercat1337/dictionary/dist/dictionary.esm.d.ts:28

___

### getLastValue

▸ **getLastValue**(`key`): `T`

Returns the last value associated with the given key in the dictionary.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key to retrieve the last value for. |

#### Returns

`T`

The last value associated with the given key, or undefined if the key does not exist in the dictionary.

#### Defined in

node_modules/@supercat1337/dictionary/dist/dictionary.esm.d.ts:34

___

### iterate

▸ **iterate**(`key`, `callback`): `void`

Calls the given callback function for each value associated with the given key in the dictionary.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key to retrieve the values for. |
| `callback` | (`value`: `T`) => `void` | The function to call for each value in the dictionary. |

#### Returns

`void`

#### Defined in

node_modules/@supercat1337/dictionary/dist/dictionary.esm.d.ts:65

___

### iterateAll

▸ **iterateAll**(`callback`): `void`

Calls the given callback function for each value in the dictionary.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callback` | (`key`: `string`, `value`: `T`) => `void` | The function to call for each value in the dictionary. |

#### Returns

`void`

#### Defined in

node_modules/@supercat1337/dictionary/dist/dictionary.esm.d.ts:59

___

### keys

▸ **keys**(): `string`[]

Returns an array of keys in the dictionary.

#### Returns

`string`[]

The keys in the dictionary.

#### Defined in

node_modules/@supercat1337/dictionary/dist/dictionary.esm.d.ts:16

___

### remove

▸ **remove**(`key`): `void`

Removes the given key from the dictionary.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key to remove. |

#### Returns

`void`

#### Defined in

node_modules/@supercat1337/dictionary/dist/dictionary.esm.d.ts:50

___

### removeAll

▸ **removeAll**(): `void`

Removes all keys from the dictionary.

#### Returns

`void`

#### Defined in

node_modules/@supercat1337/dictionary/dist/dictionary.esm.d.ts:54
