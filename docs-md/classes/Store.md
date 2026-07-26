[@supercat1337/store2](../README.md) / [Modules](../modules.md) / Store

# Class: Store

Store is a reactive container that holds a collection of reactive items.
You can add, remove and access items via methods of this class.
It also emits events when items are added, removed or updated.

## Table of contents

### Constructors

- [constructor](Store.md#constructor)

### Properties

- [#childStores](Store.md##childstores)
- [#eventEmitter](Store.md##eventemitter)
- [#isDestroyed](Store.md##isdestroyed)
- [#items](Store.md##items)
- [#keys](Store.md##keys)
- [#muted](Store.md##muted)
- [#pendingUpdate](Store.md##pendingupdate)
- [#subscriber](Store.md##subscriber)
- [#unsubscribers](Store.md##unsubscribers)
- [#updates](Store.md##updates)
- [#updatesManager](Store.md##updatesmanager)

### Accessors

- [isDestroyed](Store.md#isdestroyed)

### Methods

- [#addReactiveItem](Store.md##addreactiveitem)
- [#addStore](Store.md##addstore)
- [#childStoresToJSON](Store.md##childstorestojson)
- [#destroyChildStore](Store.md##destroychildstore)
- [#destroyReactiveItem](Store.md##destroyreactiveitem)
- [#getChildStore](Store.md##getchildstore)
- [#getReactiveItem](Store.md##getreactiveitem)
- [#itemsToJSON](Store.md##itemstojson)
- [#notifySubscribers](Store.md##notifysubscribers)
- [#removeChildStore](Store.md##removechildstore)
- [#removeReactiveItem](Store.md##removereactiveitem)
- [addItems](Store.md#additems)
- [destroy](Store.md#destroy)
- [destroyItem](Store.md#destroyitem)
- [detachAll](Store.md#detachall)
- [getItem](Store.md#getitem)
- [getItemNames](Store.md#getitemnames)
- [hasItem](Store.md#hasitem)
- [isMuted](Store.md#ismuted)
- [muteUpdates](Store.md#muteupdates)
- [onDestroy](Store.md#ondestroy)
- [removeItem](Store.md#removeitem)
- [subscribe](Store.md#subscribe)
- [toJSON](Store.md#tojson)
- [toMap](Store.md#tomap)
- [unmuteUpdates](Store.md#unmuteupdates)

## Constructors

### constructor

• **new Store**(): [`Store`](Store.md)

#### Returns

[`Store`](Store.md)

#### Defined in

src/complex/Store.js:45

## Properties

### #childStores

• `Private` **#childStores**: `Map`\<`string`, [`Store`](Store.md)\>

#### Defined in

src/complex/Store.js:21

___

### #eventEmitter

• `Private` **#eventEmitter**: [`EventEmitter`](internal_.EventEmitter.md)\<`string`\>

#### Defined in

src/complex/Store.js:24

___

### #isDestroyed

• `Private` **#isDestroyed**: `boolean` = `false`

#### Defined in

src/complex/Store.js:27

___

### #items

• `Private` **#items**: `Map`\<`string`, [`ReactiveItem`](ReactiveItem.md)\>

#### Defined in

src/complex/Store.js:16

___

### #keys

• `Private` **#keys**: `WeakMap`\<[`WeakKey`](../modules/internal_.md#weakkey), `any`\>

#### Defined in

src/complex/Store.js:38

___

### #muted

• `Private` **#muted**: `boolean` = `false`

#### Defined in

src/complex/Store.js:42

___

### #pendingUpdate

• `Private` **#pendingUpdate**: `boolean` = `false`

#### Defined in

src/complex/Store.js:43

___

### #subscriber

• `Private` **#subscriber**: (`updates`: `Map`\<`string`, [`UpdateDataRecord`](internal_.UpdateDataRecord.md)\>, `store`: [`Store`](Store.md)) => `void`

#### Type declaration

▸ (`updates`, `store`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `updates` | `Map`\<`string`, [`UpdateDataRecord`](internal_.UpdateDataRecord.md)\> | **`Type`** |
| `store` | [`Store`](Store.md) | **`Type`** |

##### Returns

`void`

#### Defined in

src/complex/Store.js:40

___

### #unsubscribers

• `Private` **#unsubscribers**: `Map`\<`string`, `Set`\<`Function`\>\>

#### Defined in

src/complex/Store.js:30

___

### #updates

• `Private` **#updates**: `Map`\<`string`, [`UpdateDataRecord`](internal_.UpdateDataRecord.md)\>

#### Defined in

src/complex/Store.js:33

___

### #updatesManager

• `Private` **#updatesManager**: [`UpdateDataRecordManager`](internal_.UpdateDataRecordManager.md)

#### Defined in

src/complex/Store.js:36

## Accessors

### isDestroyed

• `get` **isDestroyed**(): `boolean`

#### Returns

`boolean`

#### Defined in

src/complex/Store.js:83

## Methods

### #addReactiveItem

▸ **#addReactiveItem**(`key`, `reactiveItem`): `void`

Adds a reactive item to the store with the given key.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key to use when adding the item to the store. |
| `reactiveItem` | [`ReactiveItem`](ReactiveItem.md) | The reactive item to add to the store. |

#### Returns

`void`

**`Throws`**

If an item with the given key already exists in the store.

#### Defined in

src/complex/Store.js:102

___

### #addStore

▸ **#addStore**(`storeName`, `store`): `void`

Adds a child store with the given key to this store.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `storeName` | `string` | The key to use when adding the child store to this store. |
| `store` | [`Store`](Store.md) | The child store to add to this store. |

#### Returns

`void`

**`Throws`**

If a child store with the given key already exists in this store.

#### Defined in

src/complex/Store.js:134

___

### #childStoresToJSON

▸ **#childStoresToJSON**(): `Object`

#### Returns

`Object`

#### Defined in

src/complex/Store.js:430

___

### #destroyChildStore

▸ **#destroyChildStore**(`key`): `void`

Destroys the child store with the given key.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key of the child store to destroy. |

#### Returns

`void`

#### Defined in

src/complex/Store.js:183

___

### #destroyReactiveItem

▸ **#destroyReactiveItem**(`key`): `void`

Removes and DESTROYS a reactive item.

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`void`

#### Defined in

src/complex/Store.js:260

___

### #getChildStore

▸ **#getChildStore**(`key`): [`Store`](Store.md)

Retrieves the child store with the given key.

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

[`Store`](Store.md)

#### Defined in

src/complex/Store.js:348

___

### #getReactiveItem

▸ **#getReactiveItem**(`key`): [`ReactiveItem`](ReactiveItem.md)

Retrieves the reactive item with the given key.

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

[`ReactiveItem`](ReactiveItem.md)

#### Defined in

src/complex/Store.js:339

___

### #itemsToJSON

▸ **#itemsToJSON**(): `Object`

#### Returns

`Object`

#### Defined in

src/complex/Store.js:421

___

### #notifySubscribers

▸ **#notifySubscribers**(): `void`

#### Returns

`void`

#### Defined in

src/complex/Store.js:87

___

### #removeChildStore

▸ **#removeChildStore**(`key`): `void`

Removes a child store WITHOUT destroying it.

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`void`

#### Defined in

src/complex/Store.js:235

___

### #removeReactiveItem

▸ **#removeReactiveItem**(`key`): `void`

Removes a reactive item from the store WITHOUT destroying it.

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`void`

#### Defined in

src/complex/Store.js:209

___

### addItems

▸ **addItems**(`items`): `void`

Adds one or more reactive items to the store.

#### Parameters

| Name | Type |
| :------ | :------ |
| `items` | `Object` |

#### Returns

`void`

**`Throws`**

If an item with the given key already exists in the store.

**`Throws`**

If the store is destroyed.

#### Defined in

src/complex/Store.js:165

___

### destroy

▸ **destroy**(): `void`

Destroys all reactive items stored in the Store.

#### Returns

`void`

#### Defined in

src/complex/Store.js:286

___

### destroyItem

▸ **destroyItem**(`key`): `void`

Destroys the item with the given key, whether it's a reactive item or a child store.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key of the item or child store to destroy. |

#### Returns

`void`

#### Defined in

src/complex/Store.js:196

___

### detachAll

▸ **detachAll**(): `void`

Clears all reactive items from the store without destroying them.

#### Returns

`void`

#### Defined in

src/complex/Store.js:316

___

### getItem

▸ **getItem**(`key`): [`ReactiveItem`](ReactiveItem.md) \| [`Store`](Store.md)

Retrieves the item with the given key.

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

[`ReactiveItem`](ReactiveItem.md) \| [`Store`](Store.md)

#### Defined in

src/complex/Store.js:357

___

### getItemNames

▸ **getItemNames**(`filter?`): `string`[]

Retrieves the names of items stored.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `filter?` | ``"all"`` \| ``"reactives"`` \| ``"stores"`` | `'all'` |

#### Returns

`string`[]

#### Defined in

src/complex/Store.js:381

___

### hasItem

▸ **hasItem**(`key`): `boolean`

Checks if an item with the given key exists.

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`boolean`

#### Defined in

src/complex/Store.js:369

___

### isMuted

▸ **isMuted**(): `boolean`

Returns whether the event emitter is currently muted.

#### Returns

`boolean`

#### Defined in

src/complex/Store.js:519

___

### muteUpdates

▸ **muteUpdates**(): `void`

Mutes the event emitter, preventing any updates from being triggered.

#### Returns

`void`

#### Defined in

src/complex/Store.js:494

___

### onDestroy

▸ **onDestroy**(`fn`): () => `void`

Subscribes a function to be called when this Store is destroyed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | (`store`: [`Store`](Store.md)) => `void` |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Defined in

src/complex/Store.js:483

___

### removeItem

▸ **removeItem**(`key`): `void`

Removes the reactive item with the given key from the store (without destroying it).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key of the item to remove. |

#### Returns

`void`

#### Defined in

src/complex/Store.js:274

___

### subscribe

▸ **subscribe**(`fn`): () => `void`

Subscribes a function to be called whenever the value of this Store changes.

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | (`update`: `Map`\<`string`, [`UpdateDataRecord`](internal_.UpdateDataRecord.md)\>, `store`: [`Store`](Store.md)) => `void` |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Defined in

src/complex/Store.js:467

___

### toJSON

▸ **toJSON**(`filter?`): `any`

Retrieves the value of this Store as a plain object.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `filter?` | ``"all"`` \| ``"reactives"`` \| ``"stores"`` | `'all'` |

#### Returns

`any`

#### Defined in

src/complex/Store.js:444

___

### toMap

▸ **toMap**(`filter?`): `Map`\<`string`, [`ReactiveItem`](ReactiveItem.md) \| [`Store`](Store.md)\>

Retrieves all items stored.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `filter?` | ``"all"`` \| ``"reactives"`` \| ``"stores"`` | `'all'` |

#### Returns

`Map`\<`string`, [`ReactiveItem`](ReactiveItem.md) \| [`Store`](Store.md)\>

#### Defined in

src/complex/Store.js:400

___

### unmuteUpdates

▸ **unmuteUpdates**(): `void`

Unmutes the event emitter, allowing updates to be triggered.

#### Returns

`void`

#### Defined in

src/complex/Store.js:504
