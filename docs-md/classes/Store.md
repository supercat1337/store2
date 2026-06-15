[@supercat1337/store2](../README.md) / [Modules](../modules.md) / Store

# Class: Store

Store is a reactive container that holds a collection of reactive items.
You can add, remove and access items via methods of this class.
It also emits events when items are added, removed or updated.

**`Example`**

```js
const store = new Store();
const a = atom(0);
const b = atom(0);

const childStore = new Store();
const sum = computed(() => a.value + b.value);
childStore.addItems({ sum });

store.addItems({ a, b, childStore });

store.subscribe((updates) => {
    let updatesArr = Array.from(updates.keys());
    console.log("props", updatesArr);
});

// mute updates
store.suppressNotifications();
childStore.removeItem("childStore");
a.value = 3;
b.value = 4;
store.unmuteUpdates();
// outputs
// props [ 'a', 'childStore.sum', 'b' ]

// without mute updates

a.value = 1;
// outputs
// props [ 'a' ]
// props [ 'childStore.sum' ]

b.value = 2;
// outputs
//props [ 'b' ]
//props [ 'childStore.sum' ]

// using batch
batch(() => {
    a.value = 2;
    b.value = 3;
});
// outputs
// props [ 'a' ]
// props [ 'childStore.sum' ]
```

## Table of contents

### Constructors

- [constructor](Store.md#constructor)

### Properties

- [#childStores](Store.md##childstores)
- [#isDestroyed](Store.md##isdestroyed)
- [#items](Store.md##items)
- [#keys](Store.md##keys)
- [#subscriber](Store.md##subscriber)
- [#unsubscribers](Store.md##unsubscribers)
- [#updates](Store.md##updates)
- [#updatesManager](Store.md##updatesmanager)
- [eventEmitter](Store.md#eventemitter)

### Accessors

- [isDestroyed](Store.md#isdestroyed)

### Methods

- [#addReactiveItem](Store.md##addreactiveitem)
- [#addStore](Store.md##addstore)
- [#childStoresAsPlainObject](Store.md##childstoresasplainobject)
- [#destroyChildStore](Store.md##destroychildstore)
- [#destroyReactiveItem](Store.md##destroyreactiveitem)
- [#getChildStore](Store.md##getchildstore)
- [#getReactiveItem](Store.md##getreactiveitem)
- [#itemsAsPlainObject](Store.md##itemsasplainobject)
- [#notifySubscribers](Store.md##notifysubscribers)
- [#removeChildStore](Store.md##removechildstore)
- [#removeReactiveItem](Store.md##removereactiveitem)
- [addItems](Store.md#additems)
- [asPlainObject](Store.md#asplainobject)
- [clear](Store.md#clear)
- [destroy](Store.md#destroy)
- [destroyItem](Store.md#destroyitem)
- [getItem](Store.md#getitem)
- [getItemNames](Store.md#getitemnames)
- [getItems](Store.md#getitems)
- [hasItem](Store.md#hasitem)
- [isMuted](Store.md#ismuted)
- [onDestroy](Store.md#ondestroy)
- [removeItem](Store.md#removeitem)
- [subscribe](Store.md#subscribe)
- [suppressNotifications](Store.md#suppressnotifications)
- [unmuteUpdates](Store.md#unmuteupdates)

## Constructors

### constructor

• **new Store**(): [`Store`](Store.md)

#### Returns

[`Store`](Store.md)

#### Defined in

[src/complex/store.js:89](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L89)

## Properties

### #childStores

• `Private` **#childStores**: `Map`\<`string`, [`Store`](Store.md)\>

#### Defined in

[src/complex/store.js:68](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L68)

___

### #isDestroyed

• `Private` **#isDestroyed**: `boolean` = `false`

#### Defined in

[src/complex/store.js:74](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L74)

___

### #items

• `Private` **#items**: `Map`\<`string`, [`ReactivePrimitive`](ReactivePrimitive.md)\>

#### Defined in

[src/complex/store.js:64](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L64)

___

### #keys

• `Private` **#keys**: `WeakMap`\<[`WeakKey`](../modules/internal_.md#weakkey), `any`\>

#### Defined in

[src/complex/store.js:85](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L85)

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

[src/complex/store.js:87](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L87)

___

### #unsubscribers

• `Private` **#unsubscribers**: [`Dictionary`](internal_.Dictionary.md)\<() => `void`\>

#### Defined in

[src/complex/store.js:77](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L77)

___

### #updates

• `Private` **#updates**: `Map`\<`string`, [`UpdateDataRecord`](internal_.UpdateDataRecord.md)\>

#### Defined in

[src/complex/store.js:80](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L80)

___

### #updatesManager

• `Private` **#updatesManager**: [`UpdateDataRecordManager`](internal_.UpdateDataRecordManager.md)

#### Defined in

[src/complex/store.js:83](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L83)

___

### eventEmitter

• **eventEmitter**: [`EventEmitterExt`](internal_.EventEmitterExt.md)\<``"change"`` \| ``"destroy"`` \| ``"clear-updates"``\>

#### Defined in

[src/complex/store.js:71](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L71)

## Accessors

### isDestroyed

• `get` **isDestroyed**(): `boolean`

This property is set to true when the store is destroyed, and false otherwise.
It is used to prevent further modifications to the store after it has been destroyed.

#### Returns

`boolean`

**`Example`**

```js
const store = new Store();

const store2 = new Store();
const a = atom(1);

store2.addItems({ a });
store.addItems({ store2 });

console.log(store.hasItem("store2")); // output: true

store2.destroy();
console.log(store2.hasItem("a")); // output: false
console.log(store.hasItem("store2")); // output: false
console.log(a.isDestroyed); // output: true
```

#### Defined in

[src/complex/store.js:150](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L150)

## Methods

### #addReactiveItem

▸ **#addReactiveItem**(`key`, `reactiveItem`): `void`

Adds a reactive item to the store with the given key.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key to use when adding the item to the store. |
| `reactiveItem` | [`ReactivePrimitive`](ReactivePrimitive.md) | The reactive item to add to the store. |

#### Returns

`void`

**`Throws`**

If an item with the given key already exists in the store.

#### Defined in

[src/complex/store.js:165](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L165)

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

[src/complex/store.js:202](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L202)

___

### #childStoresAsPlainObject

▸ **#childStoresAsPlainObject**(): `Object`

#### Returns

`Object`

#### Defined in

[src/complex/store.js:506](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L506)

___

### #destroyChildStore

▸ **#destroyChildStore**(`key`): `void`

Destroys the child store with the given key. This method is useful for cleaning up after a child store
that is no longer needed. It calls destroy on the child store and removes the child store from this store.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key of the child store to destroy. |

#### Returns

`void`

#### Defined in

[src/complex/store.js:255](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L255)

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

[src/complex/store.js:323](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L323)

___

### #getChildStore

▸ **#getChildStore**(`key`): [`Store`](Store.md)

Retrieves the child store with the given key from the store.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key of the child store to retrieve. |

#### Returns

[`Store`](Store.md)

The child store with the given key, or null if no such child store exists in the store.

#### Defined in

[src/complex/store.js:417](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L417)

___

### #getReactiveItem

▸ **#getReactiveItem**(`key`): [`ReactivePrimitive`](ReactivePrimitive.md)

Retrieves the reactive item with the given key from the store.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key of the item to retrieve. |

#### Returns

[`ReactivePrimitive`](ReactivePrimitive.md)

The reactive item with the given key, or null if no such item exists in the store.

#### Defined in

[src/complex/store.js:405](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L405)

___

### #itemsAsPlainObject

▸ **#itemsAsPlainObject**(): `Object`

#### Returns

`Object`

#### Defined in

[src/complex/store.js:495](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L495)

___

### #notifySubscribers

▸ **#notifySubscribers**(): `void`

#### Returns

`void`

#### Defined in

[src/complex/store.js:154](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L154)

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

[src/complex/store.js:303](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L303)

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

[src/complex/store.js:280](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L280)

___

### addItems

▸ **addItems**(`items`): `void`

Adds one or more reactive items to the store. If an item is a child store, it will be added to the store.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `items` | `Object` | An object where the keys are the keys to use when adding the items to the store and the values are the reactive items to add. |

#### Returns

`void`

**`Throws`**

If an item with the given key already exists in the store.

**`Throws`**

If the store is destroyed.

**`Example`**

```js
const store = new Store();
const a = atom(1);
store.addItems({ a });
console.log(store.hasItem("a")); // output: true
```

#### Defined in

[src/complex/store.js:235](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L235)

___

### asPlainObject

▸ **asPlainObject**(`filter?`): `any`

Retrieves the value of this Store as a plain object, optionally filtered by a specified filter.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `filter?` | ``"all"`` \| ``"reactives"`` \| ``"stores"`` | `'all'` | The filter to apply when retrieving items. Default is "all". Possible values can be "all", "reactives", or "stores" (if applicable). |

#### Returns

`any`

A plain object containing the values of the items that match the filter.

**`Example`**

```js
const store = new Store();
const a = atom(1);
const b = atom(2);
const c = new Store();
const d = computed(() => a.value + b.value);
const e = collection([1, 2, 3]);

store.addItems({ a, b, c });
c.addItems({ d, e });

console.log(store.asPlainObject());
// output: { a: 1, b: 2, c: { d: 3, e: [1, 2, 3] } }

console.log(store.asPlainObject("all"));
// output: { a: 1, b: 2, c: { d: 3, e: [1, 2, 3] } }

console.log(store.asPlainObject("reactives"));
// output: { a: 1, b: 2 }

console.log(store.asPlainObject("stores"));
// output: { c: { d: 3, e: [1, 2, 3] } }

store.destroy();

console.log(store.asPlainObject());
// output: {}
```

#### Defined in

[src/complex/store.js:553](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L553)

___

### clear

▸ **clear**(): `void`

Clears all reactive items from the store. This method is useful for resetting a Store to an empty state.
It removes all reactive items from the store and clears all child stores. It does not destroy the reactive items.

#### Returns

`void`

#### Defined in

[src/complex/store.js:386](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L386)

___

### destroy

▸ **destroy**(): `void`

Destroys all reactive items stored in the Store. This method is useful for cleaning
up after a Store that is no longer needed. It calls destroy on each reactive item
in the store and clears the store of all items.

#### Returns

`void`

#### Defined in

[src/complex/store.js:355](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L355)

___

### destroyItem

▸ **destroyItem**(`key`): `void`

Destroys the item with the given key, whether it's a reactive item or a child store.
It first attempts to destroy a reactive item with the specified key, and if not found,
attempts to destroy a child store with the same key.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key of the item or child store to destroy. |

#### Returns

`void`

#### Defined in

[src/complex/store.js:271](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L271)

___

### getItem

▸ **getItem**(`key`): [`ReactivePrimitive`](ReactivePrimitive.md) \| [`Store`](Store.md)

Retrieves the item with the given key from the store. This method first looks for a reactive item with the given key,
and if no such item exists, looks for a child store with the same key.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key of the item to retrieve. |

#### Returns

[`ReactivePrimitive`](ReactivePrimitive.md) \| [`Store`](Store.md)

The item with the given key, or null if no such item exists in the store.

#### Defined in

[src/complex/store.js:430](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L430)

___

### getItemNames

▸ **getItemNames**(`filter?`): `string`[]

Retrieves the names of items stored in the Store, optionally filtered by a specified filter.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `filter?` | ``"all"`` \| ``"reactives"`` \| ``"stores"`` | `'all'` | The filter to apply when retrieving item names. Default is "all". Possible values can be "all", "reactives", or "stores" (if applicable). |

#### Returns

`string`[]

An array containing the names of items that match the filter.

#### Defined in

[src/complex/store.js:453](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L453)

___

### getItems

▸ **getItems**(`filter?`): `Map`\<`string`, [`ReactivePrimitive`](ReactivePrimitive.md) \| [`Store`](Store.md)\>

Retrieves all items stored in the Store, optionally filtered by a specified filter.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `filter?` | ``"all"`` \| ``"reactives"`` \| ``"stores"`` | `'all'` | The filter to apply when retrieving items. Default is "all". Possible values can be "all", "reactives", or "stores" (if applicable). |

#### Returns

`Map`\<`string`, [`ReactivePrimitive`](ReactivePrimitive.md) \| [`Store`](Store.md)\>

A Map containing the items that match the filter.

#### Defined in

[src/complex/store.js:474](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L474)

___

### hasItem

▸ **hasItem**(`key`): `boolean`

Checks if an item with the given key exists in the store.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key of the item to check. |

#### Returns

`boolean`

true if the item exists, false otherwise.

#### Defined in

[src/complex/store.js:439](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L439)

___

### isMuted

▸ **isMuted**(): `boolean`

Returns whether the event emitter is currently muted.

#### Returns

`boolean`

#### Defined in

[src/complex/store.js:651](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L651)

___

### onDestroy

▸ **onDestroy**(`fn`): () => `void`

Subscribes a function to be called when this Store is destroyed.
The function is called with no arguments.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fn` | (`store`: [`Store`](Store.md)) => `void` | The function to be called. |

#### Returns

`fn`

A function that unsubscribes the given function.

▸ (): `void`

##### Returns

`void`

#### Defined in

[src/complex/store.js:623](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L623)

___

### removeItem

▸ **removeItem**(`key`): `void`

Removes the reactive item with the given key from the store. This method does not call destroy on the item.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key of the item to remove. |

#### Returns

`void`

#### Defined in

[src/complex/store.js:338](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L338)

___

### subscribe

▸ **subscribe**(`fn`): () => `void`

Subscribes a function to be called whenever the value of this Store changes.
The function is called with a Map of updates, where the keys are the names of the items that changed, and the values are UpdateDataRecord objects.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fn` | (`update`: `Map`\<`string`, [`UpdateDataRecord`](internal_.UpdateDataRecord.md)\>, `store`: [`Store`](Store.md)) => `void` | The function to be called whenever the value of this Atom changes. |

#### Returns

`fn`

A function that unsubscribes the given function.

▸ (): `void`

##### Returns

`void`

**`Example`**

```js
const store = new Store();
const a = atom(1);
const b = atom(2);

const c = new Store();
const d = new Computed(() => a.value + b.value);
c.addItems({ d });

store.addItems({ a, b, c });

let i = 0;

store.subscribe((updates) => {
    let updatesArr = Array.from(updates.keys());
    console.log(updatesArr);
    i += 1;
});

a.value = 2;
// output: ["a", "c.d"]

b.value = 3;
// output: ["b", "c.d"]

console.log(i); // output: 4
```

#### Defined in

[src/complex/store.js:605](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L605)

___

### suppressNotifications

▸ **suppressNotifications**(): `void`

Mutes the event emitter, preventing any updates from being triggered.
Any updates that are scheduled while muted will be queued and executed when unmuteUpdates is called.

#### Returns

`void`

#### Defined in

[src/complex/store.js:635](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L635)

___

### unmuteUpdates

▸ **unmuteUpdates**(): `void`

Unmutes the event emitter, allowing updates to be triggered.
Any updates that were scheduled while muted will be executed.

#### Returns

`void`

#### Defined in

[src/complex/store.js:643](https://github.com/supercat1337/store2/blob/dcd1ab1b534d7ba2fc0b9fbe897665c53949ace7/src/complex/store.js#L643)
