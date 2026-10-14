[@supercat1337/store2](../README.md) / [Modules](../modules.md) / Store

# Class: Store

Store is a reactive container for reactive items and nested stores.

It collects the individual subscriptions of its children and re-emits
them as a single batched notification. Subscribing to a Store is
therefore equivalent to subscribing to every item inside it, without
registering a listener per item.

Update keys are dot-separated paths. For a root store holding an atom
named `count`, a write to `count.value` produces the update key `count`.
For a child store named `settings` holding an atom `theme`, the update
key is `settings.theme`.

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
- [#parentStore](Store.md##parentstore)
- [#pendingUpdate](Store.md##pendingupdate)
- [#subscriber](Store.md##subscriber)
- [#unsubscribers](Store.md##unsubscribers)
- [#updates](Store.md##updates)
- [#updatesManager](Store.md##updatesmanager)
- [#version](Store.md##version)
- [path](Store.md#path)

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
- [getPath](Store.md#getpath)
- [getVersion](Store.md#getversion)
- [hasItem](Store.md#hasitem)
- [hydrate](Store.md#hydrate)
- [isMuted](Store.md#ismuted)
- [muteUpdates](Store.md#muteupdates)
- [onDestroy](Store.md#ondestroy)
- [removeItem](Store.md#removeitem)
- [serialize](Store.md#serialize)
- [subscribe](Store.md#subscribe)
- [toJSON](Store.md#tojson)
- [toMap](Store.md#tomap)
- [toObservable](Store.md#toobservable)
- [unmuteUpdates](Store.md#unmuteupdates)

## Constructors

### constructor

• **new Store**(): [`Store`](Store.md)

Creates a new empty Store.

#### Returns

[`Store`](Store.md)

#### Defined in

src/complex/Store.js:67

## Properties

### #childStores

• `Private` **#childStores**: `Map`\<`string`, [`Store`](Store.md)\>

#### Defined in

src/complex/Store.js:34

___

### #eventEmitter

• `Private` **#eventEmitter**: [`EventEmitter`](internal_.EventEmitter.md)\<`string`\>

#### Defined in

src/complex/Store.js:37

___

### #isDestroyed

• `Private` **#isDestroyed**: `boolean` = `false`

#### Defined in

src/complex/Store.js:40

___

### #items

• `Private` **#items**: `Map`\<`string`, [`ReactiveItem`](ReactiveItem.md)\>

#### Defined in

src/complex/Store.js:31

___

### #keys

• `Private` **#keys**: `WeakMap`\<[`WeakKey`](../modules/internal_.md#weakkey), `any`\>

#### Defined in

src/complex/Store.js:51

___

### #muted

• `Private` **#muted**: `boolean` = `false`

#### Defined in

src/complex/Store.js:55

___

### #parentStore

• `Private` **#parentStore**: [`Store`](Store.md) = `null`

#### Defined in

src/complex/Store.js:59

___

### #pendingUpdate

• `Private` **#pendingUpdate**: `boolean` = `false`

#### Defined in

src/complex/Store.js:56

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

src/complex/Store.js:53

___

### #unsubscribers

• `Private` **#unsubscribers**: `Map`\<`string`, `Set`\<`Function`\>\>

#### Defined in

src/complex/Store.js:43

___

### #updates

• `Private` **#updates**: `Map`\<`string`, [`UpdateDataRecord`](internal_.UpdateDataRecord.md)\>

#### Defined in

src/complex/Store.js:46

___

### #updatesManager

• `Private` **#updatesManager**: [`UpdateDataRecordManager`](internal_.UpdateDataRecordManager.md)

#### Defined in

src/complex/Store.js:49

___

### #version

• `Private` **#version**: `number` = `0`

#### Defined in

src/complex/Store.js:62

___

### path

• **path**: `string` = `''`

Local path of this store within its parent. Empty for the root store.
The full path is available via `getPath()`.

#### Defined in

src/complex/Store.js:28

## Accessors

### isDestroyed

• `get` **isDestroyed**(): `boolean`

Returns `true` after `destroy()` has been called.

After destruction, all mutating methods throw and only this getter
remains safe to call.

#### Returns

`boolean`

#### Defined in

src/complex/Store.js:110

## Methods

### #addReactiveItem

▸ **#addReactiveItem**(`key`, `reactiveItem`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |
| `reactiveItem` | [`ReactiveItem`](ReactiveItem.md) |

#### Returns

`void`

#### Defined in

src/complex/Store.js:188

___

### #addStore

▸ **#addStore**(`storeName`, `store`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `storeName` | `string` |
| `store` | [`Store`](Store.md) |

#### Returns

`void`

#### Defined in

src/complex/Store.js:218

___

### #childStoresToJSON

▸ **#childStoresToJSON**(): `Object`

#### Returns

`Object`

#### Defined in

src/complex/Store.js:542

___

### #destroyChildStore

▸ **#destroyChildStore**(`key`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`void`

#### Defined in

src/complex/Store.js:270

___

### #destroyReactiveItem

▸ **#destroyReactiveItem**(`key`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`void`

#### Defined in

src/complex/Store.js:350

___

### #getChildStore

▸ **#getChildStore**(`key`): [`Store`](Store.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

[`Store`](Store.md)

#### Defined in

src/complex/Store.js:447

___

### #getReactiveItem

▸ **#getReactiveItem**(`key`): [`ReactiveItem`](ReactiveItem.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

[`ReactiveItem`](ReactiveItem.md)

#### Defined in

src/complex/Store.js:439

___

### #itemsToJSON

▸ **#itemsToJSON**(): `Object`

#### Returns

`Object`

#### Defined in

src/complex/Store.js:533

___

### #notifySubscribers

▸ **#notifySubscribers**(): `void`

#### Returns

`void`

#### Defined in

src/complex/Store.js:174

___

### #removeChildStore

▸ **#removeChildStore**(`key`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`void`

#### Defined in

src/complex/Store.js:325

___

### #removeReactiveItem

▸ **#removeReactiveItem**(`key`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`void`

#### Defined in

src/complex/Store.js:301

___

### addItems

▸ **addItems**(`items`): `void`

Adds reactive items or child stores to the store under the given keys.

Throws if a key is already registered, or if a value is neither a
`ReactiveItem` nor a `Store`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `items` | `Object` |

#### Returns

`void`

#### Defined in

src/complex/Store.js:253

___

### destroy

▸ **destroy**(): `void`

Destroys the store and every item and child store inside it.

After this call, all mutating methods throw. Idempotent — subsequent
calls are no-ops.

#### Returns

`void`

#### Defined in

src/complex/Store.js:384

___

### destroyItem

▸ **destroyItem**(`key`): `void`

Destroys the item or child store registered under `key`.

When `key` refers to a reactive item, the item is removed from the
store and then destroyed. When it refers to a child store, the child
store and every item inside it is destroyed recursively. No-op if
the key is not present.

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`void`

#### Defined in

src/complex/Store.js:289

___

### detachAll

▸ **detachAll**(): `void`

Removes all items and child stores without destroying them.

After this call the store is empty, but the detached items continue
to work and can be re-added elsewhere.

#### Returns

`void`

#### Defined in

src/complex/Store.js:417

___

### getItem

▸ **getItem**(`key`): [`ReactiveItem`](ReactiveItem.md) \| [`Store`](Store.md)

Returns the item or child store registered under `key`, or `null` if
the key is not present.

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

[`ReactiveItem`](ReactiveItem.md) \| [`Store`](Store.md)

#### Defined in

src/complex/Store.js:458

___

### getItemNames

▸ **getItemNames**(`filter?`): `string`[]

Returns the keys of the store's contents.

The `filter` argument narrows the result: `"reactives"` returns only
reactive items, `"stores"` returns only child stores, `"all"` (the
default) returns both, reactives first.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `filter?` | ``"all"`` \| ``"reactives"`` \| ``"stores"`` | `'all'` |

#### Returns

`string`[]

#### Defined in

src/complex/Store.js:489

___

### getPath

▸ **getPath**(): `string`

Returns the full path of this store by walking up the parent chain.

For a root store, returns `path` — which is `''` unless the user set
it manually. For a child store, returns `"parent.getPath() + '.' +
this.path"`.

#### Returns

`string`

#### Defined in

src/complex/Store.js:123

___

### getVersion

▸ **getVersion**(): `number`

Monotonic version counter, bumped on every store-level notification.

The value is stable between notifications, which makes it suitable
as a snapshot token for `useSyncExternalStore` and similar APIs.

#### Returns

`number`

#### Defined in

src/complex/Store.js:139

___

### hasItem

▸ **hasItem**(`key`): `boolean`

Returns `true` if `key` is registered as either a reactive item or a
child store.

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`boolean`

#### Defined in

src/complex/Store.js:472

___

### hydrate

▸ **hydrate**(`data`): `void`

Applies serialized data produced by `serialize()`.

Keys absent from `data` are left untouched; keys present in `data`
but not in this store are ignored. Malformed input is a no-op.
Runs entirely inside the caller's batch — the context wraps hydration
in a batch already.

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `any` |

#### Returns

`void`

#### Defined in

src/complex/Store.js:624

___

### isMuted

▸ **isMuted**(): `boolean`

Returns `true` if change notifications are currently suppressed.

#### Returns

`boolean`

#### Defined in

src/complex/Store.js:720

___

### muteUpdates

▸ **muteUpdates**(): `void`

Suppresses change notifications until `unmuteUpdates()` is called.

Mutations that happen while muted are still applied and their
updates accumulated; subscribers are notified once, with everything,
when the store is unmuted.

#### Returns

`void`

#### Defined in

src/complex/Store.js:691

___

### onDestroy

▸ **onDestroy**(`fn`): () => `void`

Registers a callback fired when the store is destroyed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | (`store`: [`Store`](Store.md)) => `void` |

#### Returns

`fn`

An unsubscribe function.

▸ (): `void`

##### Returns

`void`

#### Defined in

src/complex/Store.js:676

___

### removeItem

▸ **removeItem**(`key`): `void`

Removes the item or child store registered under `key` from the
store, without destroying it.

The removed item remains usable and can be re-added to a store (this
one or another). No-op if the key is not present.

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`void`

#### Defined in

src/complex/Store.js:369

___

### serialize

▸ **serialize**(): `any`

Serializes the store and its children.

Items whose `serialize()` returns `null` — notably `Computed` — are
omitted. The output is suitable for `hydrate()` and for JSON
transport.

#### Returns

`any`

#### Defined in

src/complex/Store.js:591

___

### subscribe

▸ **subscribe**(`fn`): () => `void`

Subscribes a function to changes across the store's contents.

The callback receives a `Map` of dot-separated update paths to
`UpdateDataRecord` instances, plus this store as the second
argument. It is invoked once per child change propagated up to this
store.

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | (`update`: `Map`\<`string`, [`UpdateDataRecord`](internal_.UpdateDataRecord.md)\>, `store`: [`Store`](Store.md)) => `void` |

#### Returns

`fn`

An unsubscribe function.

▸ (): `void`

##### Returns

`void`

#### Defined in

src/complex/Store.js:659

___

### toJSON

▸ **toJSON**(`filter?`): `any`

Returns the store's current values as a plain object.

Computed values are included — this is a full state dump, not a
persistence payload. For persistence, prefer `serialize()`, which
omits derived state.

The `filter` argument narrows the result the same way as in
`getItemNames()`.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `filter?` | ``"all"`` \| ``"reactives"`` \| ``"stores"`` | `'all'` |

#### Returns

`any`

#### Defined in

src/complex/Store.js:564

___

### toMap

▸ **toMap**(`filter?`): `Map`\<`string`, [`ReactiveItem`](ReactiveItem.md) \| [`Store`](Store.md)\>

Returns the store's contents as a `Map`.

The `filter` argument narrows the result the same way as in
`getItemNames()`.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `filter?` | ``"all"`` \| ``"reactives"`` \| ``"stores"`` | `'all'` |

#### Returns

`Map`\<`string`, [`ReactiveItem`](ReactiveItem.md) \| [`Store`](Store.md)\>

#### Defined in

src/complex/Store.js:512

___

### toObservable

▸ **toObservable**(): [`ObservableValue`](../interfaces/internal_.ObservableValue.md)\<`any`\>

Returns a minimal observable facade for framework adapters.

- `get()` returns a fresh plain-object snapshot via `toJSON()`.
- `subscribe(fn)` invokes `fn` with the snapshot on every effective
  store-level change.
- `version()` returns the monotonic version, suitable as a token for
  `useSyncExternalStore`.

#### Returns

[`ObservableValue`](../interfaces/internal_.ObservableValue.md)\<`any`\>

#### Defined in

src/complex/Store.js:157

___

### unmuteUpdates

▸ **unmuteUpdates**(): `void`

Resumes change notifications after `muteUpdates()`.

If any updates accumulated while muted, subscribers are notified
immediately with the full set.

#### Returns

`void`

#### Defined in

src/complex/Store.js:704
