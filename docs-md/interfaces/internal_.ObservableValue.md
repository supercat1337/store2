[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / ObservableValue

# Interface: ObservableValue\<T\>

[\<internal\>](../modules/internal_.md).ObservableValue

Minimal observable surface returned by `ReactiveItem.toObservable()`,
`Store.toObservable()`, and `ReactiveList.toObservable()`.

Ecosystem packages (`store2-react`, `store2-vue`, `store2-svelte`,
`store2-solid`) wrap this into their framework-native primitive. The
three methods together cover the requirements of
`useSyncExternalStore` (React), `shallowRef` (Vue), `Readable`/`Writable`
(Svelte), and `createSignal` (Solid).

The object returned by `toObservable()` is intentionally stateless: it
reads through to the underlying reactive item and subscribes to its
changes. Calling `get()` does not register a dependency in any tracked
scope — reads are always untracked.

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

## Table of contents

### Methods

- [get](internal_.ObservableValue.md#get)
- [subscribe](internal_.ObservableValue.md#subscribe)
- [version](internal_.ObservableValue.md#version)

## Methods

### get

▸ **get**(): `T`

Returns the current value without registering a dependency.

Safe to call at any time, including outside a tracked scope. For
`Computed` items, triggers recalculation if the value is stale;
otherwise returns the cached value directly.

For `Store` and `ReactiveList`, returns a fresh plain-object or
array snapshot on each call. Identity is not preserved between
calls — use `version()` as a stable token instead.

#### Returns

`T`

#### Defined in

[src/types.ts:322](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L322)

___

### subscribe

▸ **subscribe**(`fn`): () => `void`

Subscribes `fn` to effective changes.

The callback receives the current value after each change. It does
not receive an updates map — for fine-grained change information,
subscribe to the underlying reactive item directly.

The subscription fires once per batch of effective changes, matching
the behaviour of `ReactiveItem.subscribe`. Returns an unsubscribe
function.

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | (`value`: `T`) => `void` |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Defined in

[src/types.ts:335](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L335)

___

### version

▸ **version**(): `number`

Returns a monotonic version number, bumped on every effective change.

The value is stable between notifications: two consecutive calls
return the same number unless a change occurred in between. This
makes it suitable as a snapshot token for `useSyncExternalStore`
and similar APIs that require a cheap, referentially-stable
comparison value.

#### Returns

`number`

#### Defined in

[src/types.ts:346](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L346)
