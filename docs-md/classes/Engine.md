[@supercat1337/store2](../README.md) / [Modules](../modules.md) / Engine

# Class: Engine

Engine is the core reactive engine for a single reactive item.
It manages dependencies, updates, lifecycle, and plugin notifications.

Every engine holds a reference to the `Store2Context` it was created in.
All coordination with the id service, mode controller, and changed-items
controller goes through that context, so multiple isolated roots can
coexist in one process.

The public surface of this class is intentionally narrow: only the
fields an ecosystem package (DevTools, diagnostics, structural sharing)
needs to inspect. Everything else is marked `@internal` and is not part
of the supported API.

## Table of contents

### Constructors

- [constructor](Engine.md#constructor)

### Properties

- [#error](Engine.md##error)
- [#graph](Engine.md##graph)
- [#messageHandler](Engine.md##messagehandler)
- [#updateTracker](Engine.md##updatetracker)
- [context](Engine.md#context)
- [dependencies](Engine.md#dependencies)
- [dependents](Engine.md#dependents)
- [id](Engine.md#id)
- [isDestroyed](Engine.md#isdestroyed)
- [reactiveItem](Engine.md#reactiveitem)
- [shouldRecalc](Engine.md#shouldrecalc)
- [type](Engine.md#type)
- [updates](Engine.md#updates)
- [version](Engine.md#version)

### Accessors

- [error](Engine.md#error)

## Constructors

### constructor

• **new Engine**(`reactiveItem`, `type`): [`Engine`](Engine.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `reactiveItem` | [`ReactiveItem`](ReactiveItem.md) |
| `type` | [`ReactiveItemType`](../modules/internal_.md#reactiveitemtype) |

#### Returns

[`Engine`](Engine.md)

#### Defined in

[src/core/Engine.js:141](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/Engine.js#L141)

## Properties

### #error

• `Private` **#error**: `Error` = `null`

#### Defined in

[src/core/Engine.js:93](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/Engine.js#L93)

___

### #graph

• `Private` **#graph**: [`DependencyGraph`](internal_.DependencyGraph.md)

#### Defined in

[src/core/Engine.js:129](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/Engine.js#L129)

___

### #messageHandler

• `Private` **#messageHandler**: [`MessageHandler`](internal_.MessageHandler.md)

#### Defined in

[src/core/Engine.js:135](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/Engine.js#L135)

___

### #updateTracker

• `Private` **#updateTracker**: [`UpdateTracker`](internal_.UpdateTracker.md)

#### Defined in

[src/core/Engine.js:132](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/Engine.js#L132)

___

### context

• **context**: [`Store2Context`](Store2Context.md)

The context this engine belongs to. Captured once at construction and
never changes.

#### Defined in

[src/core/Engine.js:36](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/Engine.js#L36)

___

### dependencies

• **dependencies**: `Set`\<[`ReactiveItem`](ReactiveItem.md)\>

The set of items this engine depends on. Populated by `Computed`
during dependency collection and by explicit `addDependency` calls.

#### Defined in

[src/core/Engine.js:43](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/Engine.js#L43)

___

### dependents

• **dependents**: `Set`\<[`ReactiveItem`](ReactiveItem.md)\>

The set of items that depend on this engine's reactive item. Maintained
in sync with each dependency's `dependencies` set.

#### Defined in

[src/core/Engine.js:50](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/Engine.js#L50)

___

### id

• **id**: `number`

Monotonic numeric id, assigned by the owning context's id service.
Used for deterministic ordering of subscriber notifications.

#### Defined in

[src/core/Engine.js:57](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/Engine.js#L57)

___

### isDestroyed

• **isDestroyed**: `boolean` = `false`

Set to `true` after `destroy()` completes. Subsequent reads and
writes throw.

#### Defined in

[src/core/Engine.js:83](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/Engine.js#L83)

___

### reactiveItem

• **reactiveItem**: [`ReactiveItem`](ReactiveItem.md)

The reactive item this engine drives.

#### Defined in

[src/core/Engine.js:69](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/Engine.js#L69)

___

### shouldRecalc

• **shouldRecalc**: `boolean` = `false`

Set to `true` when a dependency has notified a change and the
computed value must be recalculated on the next read.

#### Defined in

[src/core/Engine.js:76](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/Engine.js#L76)

___

### type

• **type**: [`ReactiveItemType`](../modules/internal_.md#reactiveitemtype)

The numeric type tag of the reactive item.

#### Defined in

[src/core/Engine.js:108](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/Engine.js#L108)

___

### updates

• **updates**: `Map`\<`string`, [`UpdateDataRecord`](internal_.UpdateDataRecord.md)\>

Pending updates, keyed by property path. Read by plugins via
`onSubscriberRun` and by `Store` to build notification payloads.

#### Defined in

[src/core/Engine.js:90](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/Engine.js#L90)

___

### version

• **version**: `number` = `0`

Monotonic version counter, bumped on every effective change.

#### Defined in

[src/core/Engine.js:63](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/Engine.js#L63)

## Accessors

### error

• `get` **error**(): `Error`

Returns the last error produced by this engine, or `null`.

For `Computed`, this is the error thrown during the most recent
evaluation. The error is preserved until a dependency changes.

#### Returns

`Error`

#### Defined in

[src/core/Engine.js:163](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/Engine.js#L163)
