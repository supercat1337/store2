[@supercat1337/store2](../README.md) / [Modules](../modules.md) / Computed

# Class: Computed\<T\>

Computed is a reactive item whose value is derived from other reactive
sources.

The function passed to the constructor runs once at construction time to
establish dependencies and compute the initial value. It runs again
whenever a dependency changes and the recomputed value differs from the
cached one. Because equality is checked before notifying subscribers, a
computed whose dependencies change but whose output stays the same does
not cause any downstream work.

`Computed` is derived state and is never persisted — `serialize()`
returns `null`, and the value is recalculated from its dependencies on
hydration.

## Type parameters

| Name |
| :------ |
| `T` |

## Hierarchy

- [`ReactiveItem`](ReactiveItem.md)

  ↳ **`Computed`**

## Table of contents

### Constructors

- [constructor](Computed.md#constructor)

### Properties

- [#cachedDependentsVersionString](Computed.md##cacheddependentsversionstring)
- [#currentValue](Computed.md##currentvalue)
- [#fn](Computed.md##fn)
- [#warnedAboutReference](Computed.md##warnedaboutreference)
- [engine](Computed.md#engine)
- [name](Computed.md#name)
- [options](Computed.md#options)
- [path](Computed.md#path)

### Accessors

- [isDestroyed](Computed.md#isdestroyed)
- [type](Computed.md#type)
- [value](Computed.md#value)
- [valueUntracked](Computed.md#valueuntracked)

### Methods

- [#areDependenciesStale](Computed.md##aredependenciesstale)
- [#calc](Computed.md##calc)
- [#collectDependenciesAndInitValue](Computed.md##collectdependenciesandinitvalue)
- [#getDependenciesVersionString](Computed.md##getdependenciesversionstring)
- [#hasAnyDependencyVersionChanged](Computed.md##hasanydependencyversionchanged)
- [#hasReactiveContainerDependency](Computed.md##hasreactivecontainerdependency)
- [clearAllSubscribers](Computed.md#clearallsubscribers)
- [clearSubscribers](Computed.md#clearsubscribers)
- [destroy](Computed.md#destroy)
- [equals](Computed.md#equals)
- [getLastError](Computed.md#getlasterror)
- [getValue](Computed.md#getvalue)
- [getVersion](Computed.md#getversion)
- [hasError](Computed.md#haserror)
- [hasSubscribers](Computed.md#hassubscribers)
- [hydrate](Computed.md#hydrate)
- [isStale](Computed.md#isstale)
- [onDestroy](Computed.md#ondestroy)
- [onHasSubscribers](Computed.md#onhassubscribers)
- [onNoSubscribers](Computed.md#onnosubscribers)
- [peekValue](Computed.md#peekvalue)
- [serialize](Computed.md#serialize)
- [subscribe](Computed.md#subscribe)
- [toJSON](Computed.md#tojson)
- [toObservable](Computed.md#toobservable)

## Constructors

### constructor

• **new Computed**\<`T`\>(`fn`, `options?`): [`Computed`](Computed.md)\<`T`\>

Creates a new Computed.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `unknown` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fn` | () => `T` | The derivation function. Must read at least one reactive value. |
| `options?` | `Object` |  |
| `options.compareFunction` | (`a`: `T`, `b`: `T`) => `boolean` | Custom equality function. Defaults to shallow comparison. |
| `options.name` | `string` | Debug name used in error messages. |
| `options.smartRecompute` | `boolean` | When `true`, the value is recalculated only if the version of a dependency actually changed, avoiding recomputation when dependencies toggled back to their previous values within a batch. |

#### Returns

[`Computed`](Computed.md)\<`T`\>

#### Overrides

[ReactiveItem](ReactiveItem.md).[constructor](ReactiveItem.md#constructor)

#### Defined in

src/reactives/Computed.js:56

## Properties

### #cachedDependentsVersionString

• `Private` **#cachedDependentsVersionString**: `string` = `''`

#### Defined in

src/reactives/Computed.js:34

___

### #currentValue

• `Private` **#currentValue**: `T`

#### Defined in

src/reactives/Computed.js:28

___

### #fn

• `Private` **#fn**: () => `T`

#### Type declaration

▸ (): `T`

##### Returns

`T`

#### Defined in

src/reactives/Computed.js:31

___

### #warnedAboutReference

• `Private` **#warnedAboutReference**: `boolean` = `false`

#### Defined in

src/reactives/Computed.js:37

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

src/reactives/Computed.js:70

___

### options

• **options**: `Object`

Read-only view of the options passed to the constructor. Currently
exposes `smartRecompute`.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `smartRecompute` | `boolean` |

#### Defined in

src/reactives/Computed.js:43

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

The computed value.

Reading this property recalculates if a dependency changed and
registers a dependency in the enclosing tracked scope.

#### Returns

`T`

#### Defined in

src/reactives/Computed.js:240

___

### valueUntracked

• `get` **valueUntracked**(): `T`

Returns the computed value without registering a dependency.

Shorthand for `getValue({ untracked: true })`. The value is still
recalculated if stale — only dependency registration is skipped.

#### Returns

`T`

#### Defined in

src/reactives/Computed.js:265

## Methods

### #areDependenciesStale

▸ **#areDependenciesStale**(): `boolean`

#### Returns

`boolean`

#### Defined in

src/reactives/Computed.js:172

___

### #calc

▸ **#calc**(): `T`

#### Returns

`T`

#### Defined in

src/reactives/Computed.js:272

___

### #collectDependenciesAndInitValue

▸ **#collectDependenciesAndInitValue**(): `T`

#### Returns

`T`

#### Defined in

src/reactives/Computed.js:102

___

### #getDependenciesVersionString

▸ **#getDependenciesVersionString**(): `string`

#### Returns

`string`

#### Defined in

src/reactives/Computed.js:84

___

### #hasAnyDependencyVersionChanged

▸ **#hasAnyDependencyVersionChanged**(): `boolean`

Returns true if at least one dependency has been notified of a change
since the previous computation. We cannot know the "previous" version
exactly, but the version counter on each dependency is monotonic, so
any dependency with `shouldRecalc === true` or a version bump that
the computed has not seen yet qualifies. A simpler proxy: check
whether any dependency's engine has pending updates.

#### Returns

`boolean`

#### Defined in

src/reactives/Computed.js:390

___

### #hasReactiveContainerDependency

▸ **#hasReactiveContainerDependency**(): `boolean`

Returns true if any direct dependency is a Collection or
ShallowReactive (both expose a proxy whose identity does not change
when contents change).

#### Returns

`boolean`

#### Defined in

src/reactives/Computed.js:370

___

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

Returns the computed value, recalculating first if any dependency
changed.

When `options.untracked` is `false` (the default), registers this
computed as a dependency of the enclosing tracked scope. Pass
`{ untracked: true }` to read without creating a dependency.

Throws if the derivation function throws, or if the item has been
destroyed.

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

src/reactives/Computed.js:199

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

#### Inherited from

[ReactiveItem](ReactiveItem.md).[hydrate](ReactiveItem.md#hydrate)

#### Defined in

[src/reactives/ReactiveItem.js:317](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/reactives/ReactiveItem.js#L317)

___

### isStale

▸ **isStale**(): `boolean`

Returns `true` if the cached value is out of date and a read would
trigger recalculation.

A computed is stale if one of its dependencies notified a change, or
if its last evaluation threw an error.

#### Returns

`boolean`

#### Defined in

src/reactives/Computed.js:157

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

▸ **peekValue**(): `T`

Returns the last cached value without triggering recalculation.

If the computed is stale, this returns the previous value — not a
fresh one. Useful for debugging and for reading without causing side
effects, but the value may be out of date.

#### Returns

`T`

#### Overrides

[ReactiveItem](ReactiveItem.md).[peekValue](ReactiveItem.md#peekvalue)

#### Defined in

src/reactives/Computed.js:253

___

### serialize

▸ **serialize**(): ``null``

Always returns `null`. Computed items are derived state and are never
persisted — they are recalculated from their dependencies on
hydration.

#### Returns

``null``

#### Overrides

[ReactiveItem](ReactiveItem.md).[serialize](ReactiveItem.md#serialize)

#### Defined in

src/reactives/Computed.js:359

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
