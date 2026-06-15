[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / ProxyHandler

# Interface: ProxyHandler\<T\>

[\<internal\>](../modules/internal_.md).ProxyHandler

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `object` |

## Table of contents

### Methods

- [apply](internal_.ProxyHandler.md#apply)
- [construct](internal_.ProxyHandler.md#construct)
- [defineProperty](internal_.ProxyHandler.md#defineproperty)
- [deleteProperty](internal_.ProxyHandler.md#deleteproperty)
- [get](internal_.ProxyHandler.md#get)
- [getOwnPropertyDescriptor](internal_.ProxyHandler.md#getownpropertydescriptor)
- [getPrototypeOf](internal_.ProxyHandler.md#getprototypeof)
- [has](internal_.ProxyHandler.md#has)
- [isExtensible](internal_.ProxyHandler.md#isextensible)
- [ownKeys](internal_.ProxyHandler.md#ownkeys)
- [preventExtensions](internal_.ProxyHandler.md#preventextensions)
- [set](internal_.ProxyHandler.md#set)
- [setPrototypeOf](internal_.ProxyHandler.md#setprototypeof)

## Methods

### apply

▸ **apply**(`target`, `thisArg`, `argArray`): `any`

A trap method for a function call.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `T` | The original callable object which is being proxied. |
| `thisArg` | `any` | - |
| `argArray` | `any`[] | - |

#### Returns

`any`

#### Defined in

node_modules/typescript/lib/lib.es2015.proxy.d.ts:24

___

### construct

▸ **construct**(`target`, `argArray`, `newTarget`): `object`

A trap for the `new` operator.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `T` | The original object which is being proxied. |
| `argArray` | `any`[] | - |
| `newTarget` | `Function` | The constructor that was originally called. |

#### Returns

`object`

#### Defined in

node_modules/typescript/lib/lib.es2015.proxy.d.ts:31

___

### defineProperty

▸ **defineProperty**(`target`, `property`, `attributes`): `boolean`

A trap for `Object.defineProperty()`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `T` | The original object which is being proxied. |
| `property` | `string` \| `symbol` | - |
| `attributes` | [`PropertyDescriptor`](internal_.PropertyDescriptor.md) | - |

#### Returns

`boolean`

A `Boolean` indicating whether or not the property has been defined.

#### Defined in

node_modules/typescript/lib/lib.es2015.proxy.d.ts:38

___

### deleteProperty

▸ **deleteProperty**(`target`, `p`): `boolean`

A trap for the `delete` operator.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `T` | The original object which is being proxied. |
| `p` | `string` \| `symbol` | The name or `Symbol` of the property to delete. |

#### Returns

`boolean`

A `Boolean` indicating whether or not the property was deleted.

#### Defined in

node_modules/typescript/lib/lib.es2015.proxy.d.ts:46

___

### get

▸ **get**(`target`, `p`, `receiver`): `any`

A trap for getting a property value.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `T` | The original object which is being proxied. |
| `p` | `string` \| `symbol` | The name or `Symbol` of the property to get. |
| `receiver` | `any` | The proxy or an object that inherits from the proxy. |

#### Returns

`any`

#### Defined in

node_modules/typescript/lib/lib.es2015.proxy.d.ts:54

___

### getOwnPropertyDescriptor

▸ **getOwnPropertyDescriptor**(`target`, `p`): [`PropertyDescriptor`](internal_.PropertyDescriptor.md)

A trap for `Object.getOwnPropertyDescriptor()`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `T` | The original object which is being proxied. |
| `p` | `string` \| `symbol` | The name of the property whose description should be retrieved. |

#### Returns

[`PropertyDescriptor`](internal_.PropertyDescriptor.md)

#### Defined in

node_modules/typescript/lib/lib.es2015.proxy.d.ts:61

___

### getPrototypeOf

▸ **getPrototypeOf**(`target`): `object`

A trap for the `[[GetPrototypeOf]]` internal method.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `T` | The original object which is being proxied. |

#### Returns

`object`

#### Defined in

node_modules/typescript/lib/lib.es2015.proxy.d.ts:67

___

### has

▸ **has**(`target`, `p`): `boolean`

A trap for the `in` operator.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `T` | The original object which is being proxied. |
| `p` | `string` \| `symbol` | The name or `Symbol` of the property to check for existence. |

#### Returns

`boolean`

#### Defined in

node_modules/typescript/lib/lib.es2015.proxy.d.ts:74

___

### isExtensible

▸ **isExtensible**(`target`): `boolean`

A trap for `Object.isExtensible()`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `T` | The original object which is being proxied. |

#### Returns

`boolean`

#### Defined in

node_modules/typescript/lib/lib.es2015.proxy.d.ts:80

___

### ownKeys

▸ **ownKeys**(`target`): [`ArrayLike`](internal_.ArrayLike.md)\<`string` \| `symbol`\>

A trap for `Reflect.ownKeys()`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `T` | The original object which is being proxied. |

#### Returns

[`ArrayLike`](internal_.ArrayLike.md)\<`string` \| `symbol`\>

#### Defined in

node_modules/typescript/lib/lib.es2015.proxy.d.ts:86

___

### preventExtensions

▸ **preventExtensions**(`target`): `boolean`

A trap for `Object.preventExtensions()`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `T` | The original object which is being proxied. |

#### Returns

`boolean`

#### Defined in

node_modules/typescript/lib/lib.es2015.proxy.d.ts:92

___

### set

▸ **set**(`target`, `p`, `newValue`, `receiver`): `boolean`

A trap for setting a property value.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `T` | The original object which is being proxied. |
| `p` | `string` \| `symbol` | The name or `Symbol` of the property to set. |
| `newValue` | `any` | - |
| `receiver` | `any` | The object to which the assignment was originally directed. |

#### Returns

`boolean`

A `Boolean` indicating whether or not the property was set.

#### Defined in

node_modules/typescript/lib/lib.es2015.proxy.d.ts:101

___

### setPrototypeOf

▸ **setPrototypeOf**(`target`, `v`): `boolean`

A trap for `Object.setPrototypeOf()`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `T` | The original object which is being proxied. |
| `v` | `object` | - |

#### Returns

`boolean`

#### Defined in

node_modules/typescript/lib/lib.es2015.proxy.d.ts:108
