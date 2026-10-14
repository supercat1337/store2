[@supercat1337/store2](../README.md) / [Modules](../modules.md) / ReactiveItem

# Class: ReactiveItem

ReactiveItem is the base class for all reactive items. It provides methods
for subscribing to changes, reading values, and lifecycle management.

Concrete subclasses are `Atom`, `Computed`, `Collection`, and
`ShallowReactive`. User code rarely instantiates this class directly; use
the factory functions exported from the package root instead.

## Hierarchy

- **`ReactiveItem`**

  ↳ [`Atom`](Atom.md)

  ↳ [`Computed`](Computed.md)

  ↳ [`Collection`](Collection.md)

  ↳ [`ShallowReactive`](ShallowReactive.md)

## Table of contents

### Constructors

- [constructor](ReactiveItem.md#constructor)

### Properties

- [engine](ReactiveItem.md#engine)
- [name](ReactiveItem.md#name)
- [path](ReactiveItem.md#path)

### Accessors

- [isDestroyed](ReactiveItem.md#isdestroyed)
- [type](ReactiveItem.md#type)

### Methods

- [clearAllSubscribers](ReactiveItem.md#clearallsubscribers)
- [clearSubscribers](ReactiveItem.md#clearsubscribers)
- [destroy](ReactiveItem.md#destroy)
- [equals](ReactiveItem.md#equals)
- [getLastError](ReactiveItem.md#getlasterror)
- [getValue](ReactiveItem.md#getvalue)
- [getVersion](ReactiveItem.md#getversion)
- [hasError](ReactiveItem.md#haserror)
- [hasSubscribers](ReactiveItem.md#hassubscribers)
- [hydrate](ReactiveItem.md#hydrate)
- [onDestroy](ReactiveItem.md#ondestroy)
- [onHasSubscribers](ReactiveItem.md#onhassubscribers)
- [onNoSubscribers](ReactiveItem.md#onnosubscribers)
- [peekValue](ReactiveItem.md#peekvalue)
- [serialize](ReactiveItem.md#serialize)
- [subscribe](ReactiveItem.md#subscribe)
- [toJSON](ReactiveItem.md#tojson)
- [toObservable](ReactiveItem.md#toobservable)

## Constructors

### constructor

• **new ReactiveItem**(`type`): [`ReactiveItem`](ReactiveItem.md)

Creates a new reactive item. Subclasses pass their own type tag.

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`ReactiveItemType`](../modules/internal_.md#reactiveitemtype) |

#### Returns

[`ReactiveItem`](ReactiveItem.md)

#### Defined in

[src/reactives/ReactiveItem.js:50](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L50)

## Properties

### engine

• **engine**: [`Engine`](Engine.md)

The reactive engine driving this item. Provides access to the
dependency graph, version counter, and type tag — the machinery
ecosystem packages (DevTools, diagnostics, structural sharing)
need to inspect.

Treat the engine as read-only from outside the library. Constructing
reactive items directly (via `ReactiveItem` factories) is the only
supported way to create an engine.

#### Defined in

[src/reactives/ReactiveItem.js:29](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L29)

___

### name

• **name**: `string` = `''`

Debug name assigned at construction. Used in error messages and
DevTools listings. Empty string when not set.

#### Defined in

[src/reactives/ReactiveItem.js:36](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L36)

___

### path

• **path**: `string` = `''`

Local path assigned by the immediate container. Top-level items get a
path equal to their key in the root store; standalone items keep `''`.

#### Defined in

[src/reactives/ReactiveItem.js:43](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L43)

## Accessors

### isDestroyed

• `get` **isDestroyed**(): `boolean`

Returns `true` if `destroy()` has been called.

After destruction, reads and writes throw. This getter is the only
operation that remains safe to call.

#### Returns

`boolean`

#### Defined in

[src/reactives/ReactiveItem.js:276](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L276)

___

### type

• `get` **type**(): [`ReactiveItemType`](../modules/internal_.md#reactiveitemtype)

The numeric type tag of this item: `1` for `Atom`, `2` for `Computed`,
`3` for `Collection`, `4` for `ShallowReactive`.

#### Returns

[`ReactiveItemType`](../modules/internal_.md#reactiveitemtype)

#### Defined in

[src/reactives/ReactiveItem.js:60](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L60)

## Methods

### clearAllSubscribers

▸ **clearAllSubscribers**(): `void`

Removes all subscribers, including lifecycle listeners.

After this call, the item no longer invokes any user callbacks until
a new subscription is made.

#### Returns

`void`

#### Defined in

[src/reactives/ReactiveItem.js:109](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L109)

___

### clearSubscribers

▸ **clearSubscribers**(): `void`

Removes all change subscribers, keeping lifecycle listeners
registered via `onHasSubscribers`, `onNoSubscribers`, and
`onDestroy`.

#### Returns

`void`

#### Defined in

[src/reactives/ReactiveItem.js:99](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L99)

___

### destroy

▸ **destroy**(): `void`

Destroys the item and tears down its dependency graph.

All subscribers are detached, all dependencies are released, and any
further read or write throws. Idempotent — subsequent calls are
no-ops.

#### Returns

`void`

#### Defined in

[src/reactives/ReactiveItem.js:240](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L240)

___

### equals

▸ **equals**(`a`, `b?`): `boolean`

Returns `true` if the two values are considered equal by this item's
comparator.

When the second argument is omitted, it is compared against the
item's current value. Uses the custom `compareFunction` if one was
provided at construction, otherwise falls back to shallow equality.

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `any` |
| `b?` | `any` |

#### Returns

`boolean`

#### Defined in

[src/reactives/ReactiveItem.js:256](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L256)

___

### getLastError

▸ **getLastError**(): `Error`

Returns the last error produced by this item, or `null`.

For `Computed`, this is the error thrown during the most recent
evaluation. The error is preserved until a dependency changes.

#### Returns

`Error`

#### Defined in

[src/reactives/ReactiveItem.js:166](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L166)

___

### getValue

▸ **getValue**(`options?`): `any`

Reads the current value, tracking the item as a dependency unless
`untracked` is `true`.

Throws if the item has been destroyed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | `Object` |
| `options.untracked` | `boolean` |

#### Returns

`any`

#### Defined in

[src/reactives/ReactiveItem.js:133](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L133)

___

### getVersion

▸ **getVersion**(): `number`

Monotonic version counter, bumped on every effective change.

Useful as a stable token for `useSyncExternalStore` and for cache
invalidation: comparing two `getVersion()` results tells you whether
the value changed, without reading it.

#### Returns

`number`

#### Defined in

[src/reactives/ReactiveItem.js:73](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L73)

___

### hasError

▸ **hasError**(): `boolean`

Returns `true` if reading the value currently throws or has thrown.

For `Computed`, this forces a read to determine whether the current
dependencies are valid.

#### Returns

`boolean`

#### Defined in

[src/reactives/ReactiveItem.js:178](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L178)

___

### hasSubscribers

▸ **hasSubscribers**(): `boolean`

Returns `true` if at least one change subscriber is currently
registered.

#### Returns

`boolean`

#### Defined in

[src/reactives/ReactiveItem.js:119](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L119)

___

### hydrate

▸ **hydrate**(`_data`): `void`

Restores state previously produced by `serialize()`.

The base implementation is a no-op. Subclasses override this to apply
the given data. Implementations must be idempotent and must not throw
on malformed input — silently ignore what they cannot apply.

#### Parameters

| Name | Type |
| :------ | :------ |
| `_data` | `any` |

#### Returns

`void`

#### Defined in

[src/reactives/ReactiveItem.js:317](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L317)

___

### onDestroy

▸ **onDestroy**(`fn`): () => `void`

Registers a callback that fires when the item is destroyed.

The callback receives the destroyed item as its only argument.

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | (`reactiveItem`: [`ReactiveItem`](ReactiveItem.md)) => `void` |

#### Returns

`fn`

An unsubscribe function.

▸ (): `void`

##### Returns

`void`

#### Defined in

[src/reactives/ReactiveItem.js:224](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L224)

___

### onHasSubscribers

▸ **onHasSubscribers**(`fn`): () => `void`

Registers a callback that fires when the first change subscriber is
added.

Useful for lazy initialisation: start expensive work only when
somebody actually listens.

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | () => `void` |

#### Returns

`fn`

An unsubscribe function.

▸ (): `void`

##### Returns

`void`

#### Defined in

[src/reactives/ReactiveItem.js:198](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L198)

___

### onNoSubscribers

▸ **onNoSubscribers**(`fn`): () => `void`

Registers a callback that fires when the last change subscriber is
removed.

Useful for cleanup: stop timers or subscriptions that only make sense
while somebody is listening.

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | () => `void` |

#### Returns

`fn`

An unsubscribe function.

▸ (): `void`

##### Returns

`void`

#### Defined in

[src/reactives/ReactiveItem.js:212](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L212)

___

### peekValue

▸ **peekValue**(): `any`

Returns the current value without registering a dependency and
without triggering recalculation for `Computed`.

For `Computed`, this returns the last cached value even if it is
stale. To force a fresh value, use `.value` or `.getValue()`.

#### Returns

`any`

#### Defined in

[src/reactives/ReactiveItem.js:154](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L154)

___

### serialize

▸ **serialize**(): `any`

Returns a plain data representation suitable for storage or transport.

The base implementation returns `null`, signalling that the item must
not be persisted. `Atom`, `Collection`, `ShallowReactive`, and `Store`
override this method. `Computed` deliberately keeps the `null`
default — derived state is recalculated on hydration, never restored.

#### Returns

`any`

#### Defined in

[src/reactives/ReactiveItem.js:290](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L290)

___

### subscribe

▸ **subscribe**(`fn`, `options?`): () => `void`

Subscribes a function to changes of this item.

The callback receives a `Map` of property paths to
`UpdateDataRecord` instances. It is invoked once per batch of
effective changes.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fn` | (`updates`: `Map`\<`string`, [`UpdateDataRecord`](internal_.UpdateDataRecord.md)\>) => `void` |  |
| `options?` | `Object` |  |
| `options.delay` | `number` | Debounce delay in milliseconds. |
| `options.signal` | `AbortSignal` | Cancels the subscription when aborted. |

#### Returns

`fn`

An unsubscribe function.

▸ (): `void`

##### Returns

`void`

#### Defined in

[src/reactives/ReactiveItem.js:90](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L90)

___

### toJSON

▸ **toJSON**(): `any`

Returns the current value as a plain JavaScript value, for use with
`JSON.stringify()`. Subclasses override this to return their raw
value without proxies.

This is a debug/inspection convenience, not a persistence protocol —
use `serialize()` for snapshots.

#### Returns

`any`

#### Defined in

[src/reactives/ReactiveItem.js:304](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L304)

___

### toObservable

▸ **toObservable**(): [`ObservableValue`](../interfaces/internal_.ObservableValue.md)\<`any`\>

Returns a minimal observable facade for framework adapters.

- `get()` returns the current value without tracking a dependency.
- `subscribe(fn)` invokes `fn` with the current value on every
  effective change.
- `version()` returns the monotonic version, suitable as a token
  for `useSyncExternalStore`.

#### Returns

[`ObservableValue`](../interfaces/internal_.ObservableValue.md)\<`any`\>

#### Defined in

[src/reactives/ReactiveItem.js:332](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L332)
