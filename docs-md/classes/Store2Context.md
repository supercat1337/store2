[@supercat1337/store2](../README.md) / [Modules](../modules.md) / Store2Context

# Class: Store2Context

A Store2 context owns the per-root services that drive reactivity and
tracks the roots (stores, lists) it should snapshot and hydrate.

## Table of contents

### Constructors

- [constructor](Store2Context.md#constructor)

### Properties

- [#disposed](Store2Context.md##disposed)
- [#items](Store2Context.md##items)
- [#middlewares](Store2Context.md##middlewares)
- [#migrations](Store2Context.md##migrations)
- [#plugins](Store2Context.md##plugins)
- [#pluginsSuspended](Store2Context.md##pluginssuspended)
- [#roots](Store2Context.md##roots)
- [changedItemsController](Store2Context.md#changeditemscontroller)
- [dependencyTracker](Store2Context.md#dependencytracker)
- [idService](Store2Context.md#idservice)
- [modeController](Store2Context.md#modecontroller)
- [name](Store2Context.md#name)

### Accessors

- [middlewares](Store2Context.md#middlewares)
- [plugins](Store2Context.md#plugins)

### Methods

- [#applyMigrations](Store2Context.md##applymigrations)
- [action](Store2Context.md#action)
- [addMiddleware](Store2Context.md#addmiddleware)
- [batch](Store2Context.md#batch)
- [dispose](Store2Context.md#dispose)
- [dumpGraph](Store2Context.md#dumpgraph)
- [emitPlugin](Store2Context.md#emitplugin)
- [emitPluginDirect](Store2Context.md#emitplugindirect)
- [flush](Store2Context.md#flush)
- [flushSync](Store2Context.md#flushsync)
- [getRoot](Store2Context.md#getroot)
- [getRootNames](Store2Context.md#getrootnames)
- [hydrate](Store2Context.md#hydrate)
- [onAnyUpdate](Store2Context.md#onanyupdate)
- [registerItem](Store2Context.md#registeritem)
- [registerMigration](Store2Context.md#registermigration)
- [registerRoot](Store2Context.md#registerroot)
- [snapshot](Store2Context.md#snapshot)
- [unregisterItem](Store2Context.md#unregisteritem)
- [unregisterRoot](Store2Context.md#unregisterroot)
- [use](Store2Context.md#use)

## Constructors

### constructor

• **new Store2Context**(`options?`): [`Store2Context`](Store2Context.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | `Object` |
| `options.changedItemsController` | [`ChangedItemsController`](internal_.ChangedItemsController.md) |
| `options.dependencyTracker` | [`Tracker`](internal_.Tracker.md) |
| `options.idService` | [`IdService`](internal_.IdService.md) |
| `options.modeController` | [`ModeControllerService`](internal_.ModeControllerService.md) |
| `options.name` | `string` |

#### Returns

[`Store2Context`](Store2Context.md)

#### Defined in

[src/core/context.js:113](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L113)

## Properties

### #disposed

• `Private` **#disposed**: `boolean` = `false`

#### Defined in

[src/core/context.js:103](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L103)

___

### #items

• `Private` **#items**: `Set`\<[`ReactiveItem`](ReactiveItem.md)\>

#### Defined in

[src/core/context.js:94](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L94)

___

### #middlewares

• `Private` **#middlewares**: [`ActionMiddleware`](../modules/internal_.md#actionmiddleware)[] = `[]`

#### Defined in

[src/core/context.js:88](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L88)

___

### #migrations

• `Private` **#migrations**: `Map`\<`number`, [`SnapshotMigration`](../interfaces/internal_.SnapshotMigration.md)\>

#### Defined in

[src/core/context.js:97](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L97)

___

### #plugins

• `Private` **#plugins**: [`Store2Plugin`](../interfaces/internal_.Store2Plugin.md)[] = `[]`

#### Defined in

[src/core/context.js:85](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L85)

___

### #pluginsSuspended

• `Private` **#pluginsSuspended**: `boolean` = `false`

#### Defined in

[src/core/context.js:100](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L100)

___

### #roots

• `Private` **#roots**: `Map`\<`string`, [`SnapshotRoot`](../interfaces/internal_.SnapshotRoot.md)\>

#### Defined in

[src/core/context.js:91](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L91)

___

### changedItemsController

• **changedItemsController**: [`ChangedItemsController`](internal_.ChangedItemsController.md)

#### Defined in

[src/core/context.js:79](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L79)

___

### dependencyTracker

• **dependencyTracker**: [`Tracker`](internal_.Tracker.md)

#### Defined in

[src/core/context.js:76](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L76)

___

### idService

• **idService**: [`IdService`](internal_.IdService.md)

#### Defined in

[src/core/context.js:70](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L70)

___

### modeController

• **modeController**: [`ModeControllerService`](internal_.ModeControllerService.md)

#### Defined in

[src/core/context.js:73](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L73)

___

### name

• **name**: `string`

#### Defined in

[src/core/context.js:82](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L82)

## Accessors

### middlewares

• `get` **middlewares**(): [`ActionMiddleware`](../modules/internal_.md#actionmiddleware)[]

Returns a copy of the middleware chain installed via
`addMiddleware()`.

#### Returns

[`ActionMiddleware`](../modules/internal_.md#actionmiddleware)[]

#### Defined in

[src/core/context.js:276](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L276)

___

### plugins

• `get` **plugins**(): [`Store2Plugin`](../interfaces/internal_.Store2Plugin.md)[]

Returns a copy of the plugins installed via `use()`.

#### Returns

[`Store2Plugin`](../interfaces/internal_.Store2Plugin.md)[]

#### Defined in

[src/core/context.js:266](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L266)

## Methods

### #applyMigrations

▸ **#applyMigrations**(`snapshot`): [`ContextSnapshot`](../interfaces/internal_.ContextSnapshot.md)

Returns a snapshot whose version matches `SNAPSHOT_VERSION`, applying
registered migrations in a loop.

#### Parameters

| Name | Type |
| :------ | :------ |
| `snapshot` | [`ContextSnapshot`](../interfaces/internal_.ContextSnapshot.md) |

#### Returns

[`ContextSnapshot`](../interfaces/internal_.ContextSnapshot.md)

#### Defined in

[src/core/context.js:585](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L585)

___

### action

▸ **action**(`name`, `fn`, `payload?`): `Promise`\<`any`\>

Runs `fn` as a named action. Supports async bodies and middleware.

The action body is executed inside `runWithContext(this, ...)` so
that reactive items created synchronously inside the body bind to
this context. On runtimes with `AsyncLocalStorage`, the binding
survives `await` boundaries — the correct behaviour for SSR.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `name` | `string` | `undefined` |
| `fn` | (`action`: [`ActionInfo`](../interfaces/internal_.ActionInfo.md)) => `any` | `undefined` |
| `payload?` | `any` | `undefined` |

#### Returns

`Promise`\<`any`\>

#### Defined in

[src/core/context.js:451](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L451)

___

### addMiddleware

▸ **addMiddleware**(`middleware`): [`Store2Context`](Store2Context.md)

Registers an action middleware.

#### Parameters

| Name | Type |
| :------ | :------ |
| `middleware` | [`ActionMiddleware`](../modules/internal_.md#actionmiddleware) |

#### Returns

[`Store2Context`](Store2Context.md)

#### Defined in

[src/core/context.js:180](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L180)

___

### batch

▸ **batch**(`nameOrFn`, `fn?`): `any`

Runs `fn` inside a batch. Supports two signatures:

    ctx.batch(() => { ... })
    ctx.batch('update todos', () => { ... })

#### Parameters

| Name | Type |
| :------ | :------ |
| `nameOrFn` | `string` \| `Function` |
| `fn?` | `Function` |

#### Returns

`any`

#### Defined in

[src/core/context.js:424](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L424)

___

### dispose

▸ **dispose**(): `void`

Releases the context and forgets all installed plugins, roots, and
migrations.

#### Returns

`void`

#### Defined in

[src/core/context.js:610](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L610)

___

### dumpGraph

▸ **dumpGraph**(): [`GraphDump`](../interfaces/internal_.GraphDump.md)

Returns a serializable snapshot of the dependency graph for every
live reactive item registered with this context.

Edges are directed: `{ from: A, to: B, kind: 'dep' }` means A
depends on B. Each dependency relation appears exactly once,
derived from the source item's `dependencies` set.

Items whose `isDestroyed` is `true` are skipped.

#### Returns

[`GraphDump`](../interfaces/internal_.GraphDump.md)

#### Defined in

[src/core/context.js:339](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L339)

___

### emitPlugin

▸ **emitPlugin**(`hook`, `...args`): `void`

Invokes a lifecycle hook on every installed plugin. Plugin errors are
caught and logged. When plugins are suspended (e.g. during time-travel),
calls are ignored.

#### Parameters

| Name | Type |
| :------ | :------ |
| `hook` | `string` |
| `...args` | `any`[] |

#### Returns

`void`

#### Defined in

[src/core/context.js:385](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L385)

___

### emitPluginDirect

▸ **emitPluginDirect**(`hook`, `...args`): `void`

Same as `emitPlugin`, but ignores the suspension flag. Used for
hooks that must fire regardless of time-travel state — notably
`onHydrateStart` / `onHydrateEnd`, which persistence adapters rely
on to observe every hydration.

#### Parameters

| Name | Type |
| :------ | :------ |
| `hook` | `string` |
| `...args` | `any`[] |

#### Returns

`void`

#### Defined in

[src/core/context.js:401](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L401)

___

### flush

▸ **flush**(): `void`

Flushes pending subscribers synchronously.

Safe to call inside a batch — the batch snapshot is intentionally
consumed at that point. Framework adapters that expect a
`flushSync`-named method (e.g. React's `act()`) may call
`flushSync()` instead.

#### Returns

`void`

#### Defined in

[src/core/context.js:492](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L492)

___

### flushSync

▸ **flushSync**(): `void`

Semantic alias for `flush()`. Named to match framework conventions
(React `act`, Vue `nextTick`).

#### Returns

`void`

#### Defined in

[src/core/context.js:501](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L501)

___

### getRoot

▸ **getRoot**(`name`): [`SnapshotRoot`](../interfaces/internal_.SnapshotRoot.md)

Returns the root registered under `name`, or `null` if it is not
registered.

Persistence adapters and SSR transports use this to inspect or
serialize individual roots.

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[`SnapshotRoot`](../interfaces/internal_.SnapshotRoot.md)

#### Defined in

[src/core/context.js:247](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L247)

___

### getRootNames

▸ **getRootNames**(): `string`[]

Returns the names of all roots currently registered with
`registerRoot()`.

#### Returns

`string`[]

#### Defined in

[src/core/context.js:257](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L257)

___

### hydrate

▸ **hydrate**(`snapshot`, `options?`): `void`

Applies a snapshot to every registered root. The whole operation runs
in one batch.

Before unpacking, the snapshot is migrated to the current format
version using migrations registered via `registerMigration()`. If a
migration is missing for the incoming version, `hydrate()` throws —
silently accepting an incompatible snapshot is worse than failing
loudly.

When `timeTravel` is `true`, plugin hooks are suppressed for the
duration of the hydration so that a DevTools-style plugin does not
re-record the rehydration as a new action. `onHydrateStart` and
`onHydrateEnd` still fire — persistence adapters need to observe
every hydration, including time-travel rewinds.

Roots present in the snapshot but not registered here are ignored.
Roots registered here but missing from the snapshot are left untouched.

#### Parameters

| Name | Type |
| :------ | :------ |
| `snapshot` | [`ContextSnapshot`](../interfaces/internal_.ContextSnapshot.md) |
| `options?` | `Object` |
| `options.timeTravel?` | `boolean` |

#### Returns

`void`

#### Defined in

[src/core/context.js:544](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L544)

___

### onAnyUpdate

▸ **onAnyUpdate**(`callback`): () => `void`

Subscribes a callback invoked after every round of change
propagation that ran subscribers.

Persistence adapters use this as a "state is dirty, consider
saving" hook without having to install a full plugin.

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | () => `void` |

#### Returns

`fn`

An unsubscribe function.

▸ (): `void`

##### Returns

`void`

#### Defined in

[src/core/context.js:290](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L290)

___

### registerItem

▸ **registerItem**(`item`): `void`

Registers a reactive item with this context. Called by `Engine` at
construction. Idempotent — registering the same item twice is a
no-op.

This registry is what powers `dumpGraph()` and any future
context-wide diagnostics. It is not exposed as a public API for
iteration; use `dumpGraph()` if you need to enumerate items.

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | [`ReactiveItem`](ReactiveItem.md) |

#### Returns

`void`

#### Defined in

[src/core/context.js:310](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L310)

___

### registerMigration

▸ **registerMigration**(`migration`): [`Store2Context`](Store2Context.md)

Registers a snapshot migration. Only one migration per `from`
version is allowed — a second registration for the same `from`
overwrites the first.

#### Parameters

| Name | Type |
| :------ | :------ |
| `migration` | [`SnapshotMigration`](../interfaces/internal_.SnapshotMigration.md) |

#### Returns

[`Store2Context`](Store2Context.md)

#### Defined in

[src/core/context.js:223](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L223)

___

### registerRoot

▸ **registerRoot**(`name`, `root`): [`Store2Context`](Store2Context.md)

Registers a root for snapshot/hydrate. The root must implement
`serialize()` and `hydrate(data)`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `root` | [`SnapshotRoot`](../interfaces/internal_.SnapshotRoot.md) |

#### Returns

[`Store2Context`](Store2Context.md)

#### Defined in

[src/core/context.js:195](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L195)

___

### snapshot

▸ **snapshot**(): [`ContextSnapshot`](../interfaces/internal_.ContextSnapshot.md)

Captures a serializable snapshot of every registered root.

#### Returns

[`ContextSnapshot`](../interfaces/internal_.ContextSnapshot.md)

#### Defined in

[src/core/context.js:509](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L509)

___

### unregisterItem

▸ **unregisterItem**(`item`): `void`

Removes a reactive item from this context's registry. Called by
`Engine.destroy()`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | [`ReactiveItem`](ReactiveItem.md) |

#### Returns

`void`

#### Defined in

[src/core/context.js:323](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L323)

___

### unregisterRoot

▸ **unregisterRoot**(`name`): `boolean`

Unregisters a previously registered root.

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

`boolean`

#### Defined in

[src/core/context.js:211](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L211)

___

### use

▸ **use**(`plugin`): [`Store2Context`](Store2Context.md)

Installs a plugin into this context.

#### Parameters

| Name | Type |
| :------ | :------ |
| `plugin` | [`Store2Plugin`](../interfaces/internal_.Store2Plugin.md) |

#### Returns

[`Store2Context`](Store2Context.md)

#### Defined in

[src/core/context.js:157](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L157)
