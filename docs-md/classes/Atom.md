[@supercat1337/store2](../README.md) / [Modules](../modules.md) / Atom

# Class: Atom\<T\>

Atom is a reactive item that holds a single value.

It is the base unit of reactive state — a single mutable cell. Reads
inside a tracked scope (a `Computed` body, an `autorun`, or a `reaction`)
register a dependency; writes schedule a change notification.

Objects assigned to an Atom are shallow-cloned, so mutating nested
properties does not trigger reactivity. Use `Collection` or
`ShallowReactive` for structures that need deep updates.

## Type parameters

| Name |
| :------ |
| `T` |

## Hierarchy

- [`ReactiveItem`](ReactiveItem.md)

  ↳ **`Atom`**

## Table of contents

### Constructors

- [constructor](Atom.md#constructor)

### Properties

- [#currentValue](Atom.md##currentvalue)
- [engine](Atom.md#engine)
- [name](Atom.md#name)
- [path](Atom.md#path)

### Accessors

- [isDestroyed](Atom.md#isdestroyed)
- [type](Atom.md#type)
- [value](Atom.md#value)
- [valueUntracked](Atom.md#valueuntracked)

### Methods

- [clearAllSubscribers](Atom.md#clearallsubscribers)
- [clearSubscribers](Atom.md#clearsubscribers)
- [destroy](Atom.md#destroy)
- [equals](Atom.md#equals)
- [getLastError](Atom.md#getlasterror)
- [getValue](Atom.md#getvalue)
- [getVersion](Atom.md#getversion)
- [hasError](Atom.md#haserror)
- [hasSubscribers](Atom.md#hassubscribers)
- [hydrate](Atom.md#hydrate)
- [onDestroy](Atom.md#ondestroy)
- [onHasSubscribers](Atom.md#onhassubscribers)
- [onNoSubscribers](Atom.md#onnosubscribers)
- [peekValue](Atom.md#peekvalue)
- [serialize](Atom.md#serialize)
- [subscribe](Atom.md#subscribe)
- [toJSON](Atom.md#tojson)
- [toObservable](Atom.md#toobservable)

## Constructors

### constructor

• **new Atom**\<`T`\>(`value`, `options?`): [`Atom`](Atom.md)\<`T`\>

Creates a new Atom with the given initial value.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `T` | The initial value. |
| `options?` | `Object` |  |
| `options.compareFunction` | (`a`: `T`, `b`: `T`) => `boolean` | Custom equality function. Defaults to shallow comparison. |
| `options.name` | `string` | Debug name used in error messages. |

#### Returns

[`Atom`](Atom.md)\<`T`\>

#### Overrides

[ReactiveItem](ReactiveItem.md).[constructor](ReactiveItem.md#constructor)

#### Defined in

src/reactives/Atom.js:34

## Properties

### #currentValue

• `Private` **#currentValue**: `T`

#### Defined in

src/reactives/Atom.js:24

___

### engine

• **engine**: [`Engine`](Engine.md)

The reactive engine driving this item. Provides access to the
dependency graph, version counter, and type tag — the machinery
ecosystem packages (DevTools, diagnostics, structural sharing)
need to inspect.

Treat the engine as read-only from outside the library. Constructing
reactive items directly (via `ReactiveItem` factories) is the only
supported way to create an engine.

#### Inherited from

[ReactiveItem](ReactiveItem.md).[engine](ReactiveItem.md#engine)

#### Defined in

[src/reactives/ReactiveItem.js:29](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L29)

___

### name

• **name**: `string`

Debug name assigned at construction. Used in error messages and
DevTools listings. Empty string when not set.

#### Inherited from

[ReactiveItem](ReactiveItem.md).[name](ReactiveItem.md#name)

#### Defined in

src/reactives/Atom.js:49

___

### path

• **path**: `string` = `''`

Local path assigned by the immediate container. Top-level items get a
path equal to their key in the root store; standalone items keep `''`.

#### Inherited from

[ReactiveItem](ReactiveItem.md).[path](ReactiveItem.md#path)

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

#### Inherited from

ReactiveItem.isDestroyed

#### Defined in

[src/reactives/ReactiveItem.js:276](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L276)

___

### type

• `get` **type**(): [`ReactiveItemType`](../modules/internal_.md#reactiveitemtype)

The numeric type tag of this item: `1` for `Atom`, `2` for `Computed`,
`3` for `Collection`, `4` for `ShallowReactive`.

#### Returns

[`ReactiveItemType`](../modules/internal_.md#reactiveitemtype)

#### Inherited from

ReactiveItem.type

#### Defined in

[src/reactives/ReactiveItem.js:60](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L60)

___

### value

• `get` **value**(): `T`

The current value.

Reading this property inside a tracked scope registers a dependency.
Writing it schedules a change if the new value differs from the
current one.

#### Returns

`T`

#### Defined in

src/reactives/Atom.js:101

• `set` **value**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `T` |

#### Returns

`void`

#### Defined in

src/reactives/Atom.js:54

___

### valueUntracked

• `get` **valueUntracked**(): `T`

Returns the current value without registering a dependency.

Shorthand for `getValue({ untracked: true })`. Useful when you need
to peek at an atom inside a `Computed` or `autorun` without making it
re-run when the atom changes.

#### Returns

`T`

#### Defined in

src/reactives/Atom.js:114

## Methods

### clearAllSubscribers

▸ **clearAllSubscribers**(): `void`

Removes all subscribers, including lifecycle listeners.

After this call, the item no longer invokes any user callbacks until
a new subscription is made.

#### Returns

`void`

#### Inherited from

[ReactiveItem](ReactiveItem.md).[clearAllSubscribers](ReactiveItem.md#clearallsubscribers)

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

#### Inherited from

[ReactiveItem](ReactiveItem.md).[clearSubscribers](ReactiveItem.md#clearsubscribers)

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

#### Inherited from

[ReactiveItem](ReactiveItem.md).[destroy](ReactiveItem.md#destroy)

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

#### Inherited from

[ReactiveItem](ReactiveItem.md).[equals](ReactiveItem.md#equals)

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

#### Inherited from

[ReactiveItem](ReactiveItem.md).[getLastError](ReactiveItem.md#getlasterror)

#### Defined in

[src/reactives/ReactiveItem.js:166](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L166)

___

### getValue

▸ **getValue**(`options?`): `T`

Returns the current value.

When `options.untracked` is `false` (the default), registers this
atom as a dependency of the enclosing tracked scope. Pass
`{ untracked: true }` to read without creating a dependency.

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | `Object` |
| `options.untracked?` | `boolean` |

#### Returns

`T`

#### Overrides

[ReactiveItem](ReactiveItem.md).[getValue](ReactiveItem.md#getvalue)

#### Defined in

src/reactives/Atom.js:87

___

### getVersion

▸ **getVersion**(): `number`

Monotonic version counter, bumped on every effective change.

Useful as a stable token for `useSyncExternalStore` and for cache
invalidation: comparing two `getVersion()` results tells you whether
the value changed, without reading it.

#### Returns

`number`

#### Inherited from

[ReactiveItem](ReactiveItem.md).[getVersion](ReactiveItem.md#getversion)

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

#### Inherited from

[ReactiveItem](ReactiveItem.md).[hasError](ReactiveItem.md#haserror)

#### Defined in

[src/reactives/ReactiveItem.js:178](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L178)

___

### hasSubscribers

▸ **hasSubscribers**(): `boolean`

Returns `true` if at least one change subscriber is currently
registered.

#### Returns

`boolean`

#### Inherited from

[ReactiveItem](ReactiveItem.md).[hasSubscribers](ReactiveItem.md#hassubscribers)

#### Defined in

[src/reactives/ReactiveItem.js:119](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L119)

___

### hydrate

▸ **hydrate**(`data`): `void`

Applies data previously produced by `serialize()`.

Silently ignores malformed input.

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `any` |

#### Returns

`void`

#### Overrides

[ReactiveItem](ReactiveItem.md).[hydrate](ReactiveItem.md#hydrate)

#### Defined in

src/reactives/Atom.js:137

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

#### Inherited from

[ReactiveItem](ReactiveItem.md).[onDestroy](ReactiveItem.md#ondestroy)

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

#### Inherited from

[ReactiveItem](ReactiveItem.md).[onHasSubscribers](ReactiveItem.md#onhassubscribers)

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

#### Inherited from

[ReactiveItem](ReactiveItem.md).[onNoSubscribers](ReactiveItem.md#onnosubscribers)

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

#### Inherited from

[ReactiveItem](ReactiveItem.md).[peekValue](ReactiveItem.md#peekvalue)

#### Defined in

[src/reactives/ReactiveItem.js:154](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L154)

___

### serialize

▸ **serialize**(): `any`

Returns a serializable representation of the current value.

#### Returns

`any`

#### Overrides

[ReactiveItem](ReactiveItem.md).[serialize](ReactiveItem.md#serialize)

#### Defined in

src/reactives/Atom.js:123

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

#### Inherited from

[ReactiveItem](ReactiveItem.md).[subscribe](ReactiveItem.md#subscribe)

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

#### Inherited from

[ReactiveItem](ReactiveItem.md).[toJSON](ReactiveItem.md#tojson)

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

#### Inherited from

[ReactiveItem](ReactiveItem.md).[toObservable](ReactiveItem.md#toobservable)

#### Defined in

[src/reactives/ReactiveItem.js:332](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L332)
