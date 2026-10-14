[@supercat1337/store2](../README.md) / [Modules](../modules.md) / ReactiveList

# Class: ReactiveList\<T\>

ReactiveList is a reactive array-like structure that stores values of any
type.

Primitives (numbers, strings, booleans) are wrapped in `Atom`; objects
and arrays are wrapped in `ShallowReactive`. Every mutation — adding,
removing, replacing, reordering — is batched into a single notification.

Internally the list is backed by a `Store` indexed by string positions,
plus a separate `Atom` tracking the list length. This is not part of the
public contract; treat the list as an opaque reactive array.

## Type parameters

| Name |
| :------ |
| `T` |

## Table of contents

### Constructors

- [constructor](ReactiveList.md#constructor)

### Properties

- [#lengthAtom](ReactiveList.md##lengthatom)
- [#store](ReactiveList.md##store)
- [path](ReactiveList.md#path)

### Accessors

- [isDestroyed](ReactiveList.md#isdestroyed)
- [length](ReactiveList.md#length)

### Methods

- [#createReactiveItem](ReactiveList.md##createreactiveitem)
- [#updateReactiveItem](ReactiveList.md##updatereactiveitem)
- [add](ReactiveList.md#add)
- [clear](ReactiveList.md#clear)
- [destroy](ReactiveList.md#destroy)
- [getItem](ReactiveList.md#getitem)
- [getItemVersionAt](ReactiveList.md#getitemversionat)
- [getVersion](ReactiveList.md#getversion)
- [hydrate](ReactiveList.md#hydrate)
- [removeFirstItem](ReactiveList.md#removefirstitem)
- [removeItem](ReactiveList.md#removeitem)
- [removeLastItem](ReactiveList.md#removelastitem)
- [removeRange](ReactiveList.md#removerange)
- [serialize](ReactiveList.md#serialize)
- [setItem](ReactiveList.md#setitem)
- [setItems](ReactiveList.md#setitems)
- [subscribe](ReactiveList.md#subscribe)
- [toArray](ReactiveList.md#toarray)
- [toJSON](ReactiveList.md#tojson)
- [toObservable](ReactiveList.md#toobservable)

## Constructors

### constructor

• **new ReactiveList**\<`T`\>(): [`ReactiveList`](ReactiveList.md)\<`T`\>

Creates a new empty ReactiveList.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Returns

[`ReactiveList`](ReactiveList.md)\<`T`\>

#### Defined in

src/complex/ReactiveList.js:55

## Properties

### #lengthAtom

• `Private` **#lengthAtom**: [`Atom`](Atom.md)\<`number`\>

#### Defined in

src/complex/ReactiveList.js:47

___

### #store

• `Private` **#store**: [`Store`](Store.md)

#### Defined in

src/complex/ReactiveList.js:50

___

### path

• **path**: `string` = `''`

Local path of this list. Empty unless set by the user. Used by
snapshot tooling to build dotted paths when the list is nested inside
a `Store`.

#### Defined in

src/complex/ReactiveList.js:44

## Accessors

### isDestroyed

• `get` **isDestroyed**(): `boolean`

Returns `true` after `destroy()` has been called.

After destruction, all mutating methods throw and only this getter
remains safe to call.

#### Returns

`boolean`

#### Defined in

src/complex/ReactiveList.js:382

___

### length

• `get` **length**(): `number`

The current number of items in the list.

Reading this property inside a tracked scope registers a dependency,
so the enclosing effect re-runs whenever items are added or removed.

#### Returns

`number`

#### Defined in

src/complex/ReactiveList.js:208

## Methods

### #createReactiveItem

▸ **#createReactiveItem**(`value`, `name`): [`ShallowReactive`](ShallowReactive.md)\<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `any` |
| `name` | `string` |

#### Returns

[`ShallowReactive`](ShallowReactive.md)\<`any`\>

#### Defined in

src/complex/ReactiveList.js:69

___

### #updateReactiveItem

▸ **#updateReactiveItem**(`wrapper`, `newValue`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `wrapper` | [`ShallowReactive`](ShallowReactive.md)\<`any`\> |
| `newValue` | `any` |

#### Returns

`void`

#### Defined in

src/complex/ReactiveList.js:86

___

### add

▸ **add**(`...values`): `void`

Appends one or more values to the end of the list.

Each value is wrapped according to its type — primitives become
`Atom`, objects and arrays become `ShallowReactive`. The whole
operation produces a single notification, regardless of how many
values are added.

#### Parameters

| Name | Type |
| :------ | :------ |
| `...values` | `T`[] |

#### Returns

`void`

#### Defined in

src/complex/ReactiveList.js:100

___

### clear

▸ **clear**(): `void`

Removes all items from the list.

The length becomes `0` and every item is destroyed.

#### Returns

`void`

#### Defined in

src/complex/ReactiveList.js:357

___

### destroy

▸ **destroy**(): `void`

Destroys the list and releases its internal store.

After this call, all mutating methods throw. Idempotent — subsequent
calls are no-ops.

#### Returns

`void`

#### Defined in

src/complex/ReactiveList.js:367

___

### getItem

▸ **getItem**(`index`): `T`

Returns the value at the given index, or `undefined` if the index is
out of bounds.

Reads through the reactive wrapper, so a call inside a tracked scope
registers a dependency on the item at that index.

#### Parameters

| Name | Type |
| :------ | :------ |
| `index` | `number` |

#### Returns

`T`

#### Defined in

src/complex/ReactiveList.js:141

___

### getItemVersionAt

▸ **getItemVersionAt**(`index`): `number`

Returns the version of the item at the given index, or `-1` if the
index is out of bounds.

Framework adapters use this to implement fine-grained list selectors
without re-rendering the whole list on every change.

#### Parameters

| Name | Type |
| :------ | :------ |
| `index` | `number` |

#### Returns

`number`

#### Defined in

src/complex/ReactiveList.js:468

___

### getVersion

▸ **getVersion**(): `number`

Monotonic version counter, bumped on every effective change of the
list, including changes that come from nested items.

The value is stable between notifications, which makes it suitable
as a snapshot token for `useSyncExternalStore`.

#### Returns

`number`

#### Defined in

src/complex/ReactiveList.js:451

___

### hydrate

▸ **hydrate**(`data`): `void`

Applies data produced by `serialize()`.

Uses `setItems` internally, so the whole replacement is batched and
subscribers fire once. Silently ignores malformed input.

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `any` |

#### Returns

`void`

#### Defined in

src/complex/ReactiveList.js:436

___

### removeFirstItem

▸ **removeFirstItem**(): `void`

Removes the first item. No-op if the list is empty.

#### Returns

`void`

#### Defined in

src/complex/ReactiveList.js:348

___

### removeItem

▸ **removeItem**(`index`): `void`

Removes the item at the given index.

Shorthand for `removeRange(index, 1)`. No-op if `index` is out of
bounds.

#### Parameters

| Name | Type |
| :------ | :------ |
| `index` | `number` |

#### Returns

`void`

#### Defined in

src/complex/ReactiveList.js:334

___

### removeLastItem

▸ **removeLastItem**(): `void`

Removes the last item. No-op if the list is empty.

#### Returns

`void`

#### Defined in

src/complex/ReactiveList.js:341

___

### removeRange

▸ **removeRange**(`startIndex`, `count`): `void`

Removes `count` items starting at `startIndex`.

Remaining items shift left to fill the gap; the tail positions are
destroyed. The whole operation produces a single notification.

No-op if `count <= 0`, `startIndex < 0`, or `startIndex >= length`.
If `count` exceeds the number of items from `startIndex` to the end,
it is clamped.

#### Parameters

| Name | Type |
| :------ | :------ |
| `startIndex` | `number` |
| `count` | `number` |

#### Returns

`void`

#### Defined in

src/complex/ReactiveList.js:282

___

### serialize

▸ **serialize**(): `any`

Returns a serializable representation of the list's contents.

The shape is `{ type: 'list', value: [...] }`, matching the
serialization protocol used by reactive items.

#### Returns

`any`

#### Defined in

src/complex/ReactiveList.js:411

___

### setItem

▸ **setItem**(`index`, `value`): `void`

Replaces the value at the specified index.

The whole operation produces a single notification. No-op if `index`
is out of bounds.

#### Parameters

| Name | Type |
| :------ | :------ |
| `index` | `number` |
| `value` | `T` |

#### Returns

`void`

#### Defined in

src/complex/ReactiveList.js:184

___

### setItems

▸ **setItems**(`values`): `void`

Replaces the entire content of the list with the given array.

Existing positions are updated in place; positions beyond the new
length are destroyed; new positions are created. The whole operation
produces a single notification.

#### Parameters

| Name | Type |
| :------ | :------ |
| `values` | `T`[] |

#### Returns

`void`

#### Defined in

src/complex/ReactiveList.js:224

___

### subscribe

▸ **subscribe**(`fn`): () => `void`

Subscribes a function to changes of the list.

The callback receives a `Map` of update paths to `UpdateDataRecord`
instances. It is invoked once per batch of effective changes,
regardless of how many items were affected.

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | (`updates`: `Map`\<`string`, [`UpdateDataRecord`](internal_.UpdateDataRecord.md)\>) => `void` |

#### Returns

`fn`

An unsubscribe function.

▸ (): `void`

##### Returns

`void`

#### Defined in

src/complex/ReactiveList.js:396

___

### toArray

▸ **toArray**(): `T`[]

Returns a shallow copy of all items in the list as a plain array.

The array is newly allocated on each call; mutating it does not
affect the list. Elements that are reactive objects are returned as
their underlying values, not as wrappers.

#### Returns

`T`[]

#### Defined in

src/complex/ReactiveList.js:161

___

### toJSON

▸ **toJSON**(): `T`[]

Returns the list's contents as a plain array. Enables
`JSON.stringify(list)` to produce useful output.

#### Returns

`T`[]

#### Defined in

src/complex/ReactiveList.js:424

___

### toObservable

▸ **toObservable**(): [`ObservableValue`](../interfaces/internal_.ObservableValue.md)\<`any`[]\>

Returns a minimal observable facade for framework adapters.

- `get()` returns a fresh array via `toArray()`.
- `subscribe(fn)` invokes `fn` with the array on every effective
  change of the list.
- `version()` returns the monotonic version, suitable as a token
  for `useSyncExternalStore`.

#### Returns

[`ObservableValue`](../interfaces/internal_.ObservableValue.md)\<`any`[]\>

#### Defined in

src/complex/ReactiveList.js:490
