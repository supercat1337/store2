[@supercat1337/store2](README.md) / Modules

# @supercat1337/store2

## Table of contents

### Modules

- [\<internal\>](modules/internal_.md)

### Classes

- [Atom](classes/Atom.md)
- [Collection](classes/Collection.md)
- [Computed](classes/Computed.md)
- [Engine](classes/Engine.md)
- [ReactiveItem](classes/ReactiveItem.md)
- [ReactiveList](classes/ReactiveList.md)
- [ShallowReactive](classes/ShallowReactive.md)
- [Store](classes/Store.md)
- [Store2Context](classes/Store2Context.md)

### Variables

- [PLUGIN\_API\_VERSION](modules.md#plugin_api_version)
- [SNAPSHOT\_VERSION](modules.md#snapshot_version)
- [defaultContext](modules.md#defaultcontext)

### Functions

- [action](modules.md#action)
- [atom](modules.md#atom)
- [autorun](modules.md#autorun)
- [batch](modules.md#batch)
- [clone](modules.md#clone)
- [collection](modules.md#collection)
- [compareAny](modules.md#compareany)
- [comparePlainObjects](modules.md#compareplainobjects)
- [computed](modules.md#computed)
- [createStore2Context](modules.md#createstore2context)
- [debounce](modules.md#debounce)
- [extendObservable](modules.md#extendobservable)
- [fromPromise](modules.md#frompromise)
- [getAllPropertyDescriptors](modules.md#getallpropertydescriptors)
- [getCurrentContext](modules.md#getcurrentcontext)
- [getError](modules.md#geterror)
- [getItemNamesFromSet](modules.md#getitemnamesfromset)
- [getNow](modules.md#getnow)
- [getSortedReactiveItems](modules.md#getsortedreactiveitems)
- [isPlainObject](modules.md#isplainobject)
- [makeAutoObservable](modules.md#makeautoobservable)
- [makeObservable](modules.md#makeobservable)
- [reaction](modules.md#reaction)
- [runInAction](modules.md#runinaction)
- [runWithContext](modules.md#runwithcontext)
- [runWithContextAsync](modules.md#runwithcontextasync)
- [shallowReactive](modules.md#shallowreactive)
- [sleep](modules.md#sleep)
- [sortReactiveItems](modules.md#sortreactiveitems)
- [untrack](modules.md#untrack)
- [waitUntil](modules.md#waituntil)
- [when](modules.md#when)

## Variables

### PLUGIN\_API\_VERSION

• `Const` **PLUGIN\_API\_VERSION**: ``1``

Plugin API version. Bumped whenever the plugin hook contract changes in
a way that existing plugins cannot survive unchanged. Plugins that
declare an `apiVersion` are rejected if it does not match.

#### Defined in

[src/core/context.js:26](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L26)

___

### SNAPSHOT\_VERSION

• `Const` **SNAPSHOT\_VERSION**: ``1``

Current snapshot format version.

#### Defined in

[src/core/context.js:19](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L19)

___

### defaultContext

• `Const` **defaultContext**: [`Store2Context`](classes/Store2Context.md)

The default context adopts the process-wide service singletons so that
legacy code paths that import them directly continue to observe the same
state as the context-aware engine.

#### Defined in

[src/core/context.js:628](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L628)

## Functions

### action

▸ **action**(`name`, `fn`, `payload?`): `Promise`\<`any`\>

Runs `fn` as a named, optionally asynchronous action. Middleware installed
on the current context is applied around the body.

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `fn` | (`action`: [`ActionInfo`](interfaces/internal_.ActionInfo.md)) => `any` |
| `payload?` | `any` |

#### Returns

`Promise`\<`any`\>

#### Defined in

[src/api/api.js:360](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/api/api.js#L360)

___

### atom

▸ **atom**\<`T`\>(`value`, `options?`): [`Atom`](classes/Atom.md)\<`T`\>

Creates a new reactive Atom holding the given value.

An Atom is the base unit of reactive state — a single mutable cell. Reads
inside tracked contexts register a dependency; writes schedule a change.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `T` |
| `options?` | `Object` |
| `options.compareFunction` | (`a`: `T`, `b`: `T`) => `boolean` |
| `options.name` | `string` |

#### Returns

[`Atom`](classes/Atom.md)\<`T`\>

#### Defined in

[src/api/api.js:503](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/api/api.js#L503)

___

### autorun

▸ **autorun**(`fn`, `options?`): () => `void`

Autorun – runs the effect immediately and re-runs it on any dependency
change.

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | () => `void` |
| `options?` | `Object` |
| `options.delay` | `number` |
| `options.name` | `string` |
| `options.onError` | `Function` |
| `options.recomputeDependencies` | `boolean` |
| `options.signal` | `AbortSignal` |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Defined in

[src/api/api.js:209](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/api/api.js#L209)

___

### batch

▸ **batch**(`nameOrFn`, `fn?`): `any`

Groups multiple updates into a single notification round.

    batch(() => { ... })
    batch('update todos', () => { ... })

#### Parameters

| Name | Type |
| :------ | :------ |
| `nameOrFn` | `string` \| `Function` |
| `fn?` | `Function` |

#### Returns

`any`

#### Defined in

[src/api/api.js:347](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/api/api.js#L347)

___

### clone

▸ **clone**\<`T`\>(`obj`): `T`

Clones an object shallowly.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `T` |

#### Returns

`T`

#### Defined in

[src/helpers/tools.js:168](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/helpers/tools.js#L168)

___

### collection

▸ **collection**\<`T`\>(`value`, `options?`): [`Collection`](classes/Collection.md)\<`T`\>

Creates a new reactive Collection wrapping an array.

Array mutations (`push`, `pop`, `splice`, index assignment) trigger
reactivity. The `.value` property returns a Proxy; direct mutations
through it are tracked.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `T`[] |
| `options?` | `Object` |
| `options.compareFunction` | (`a`: `T`, `b`: `T`) => `boolean` |
| `options.name` | `string` |

#### Returns

[`Collection`](classes/Collection.md)\<`T`\>

#### Defined in

[src/api/api.js:541](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/api/api.js#L541)

___

### compareAny

▸ **compareAny**(`a`, `b`): `boolean`

Checks if two values are equal.

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `unknown` |
| `b` | `unknown` |

#### Returns

`boolean`

#### Defined in

[src/helpers/tools.js:111](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/helpers/tools.js#L111)

___

### comparePlainObjects

▸ **comparePlainObjects**(`a`, `b`): `boolean`

Checks if two plain objects are equal.

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `any` |
| `b` | `any` |

#### Returns

`boolean`

#### Defined in

[src/helpers/tools.js:74](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/helpers/tools.js#L74)

___

### computed

▸ **computed**\<`T`\>(`fn`, `options?`): [`Computed`](classes/Computed.md)\<`T`\>

Creates a new reactive Computed whose value is derived from other
reactive sources.

The function passed as `fn` runs once at construction, then again
whenever one of its dependencies changes and the recomputed value
differs.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | () => `T` |
| `options?` | `Object` |
| `options.compareFunction` | (`a`: `T`, `b`: `T`) => `boolean` |
| `options.name` | `string` |
| `options.smartRecompute` | `boolean` |

#### Returns

[`Computed`](classes/Computed.md)\<`T`\>

#### Defined in

[src/api/api.js:523](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/api/api.js#L523)

___

### createStore2Context

▸ **createStore2Context**(`options?`): [`Store2Context`](classes/Store2Context.md)

Creates a new isolated context.

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | `any` |

#### Returns

[`Store2Context`](classes/Store2Context.md)

#### Defined in

[src/core/context.js:705](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L705)

___

### debounce

▸ **debounce**\<`T`\>(`func`, `wait`): `T`

Debounce function.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Function` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `func` | `T` |
| `wait` | `number` |

#### Returns

`T`

#### Defined in

[src/helpers/tools.js:143](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/helpers/tools.js#L143)

___

### extendObservable

▸ **extendObservable**\<`T`, `R`\>(`target`, `properties`, `overrides?`, `options?`): `T` & `R`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` |
| `R` | extends `Object` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `T` |
| `properties` | `R` |
| `overrides?` | `Object` |
| `options?` | `Object` |
| `options.name` | `string` |

#### Returns

`T` & `R`

#### Defined in

[src/api/api.js:661](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/api/api.js#L661)

___

### fromPromise

▸ **fromPromise**\<`T`\>(`promise`): `Object`

Observes a promise's state. The returned object exposes a single method
`case({ pending, resolved, rejected })`.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `promise` | `Promise`\<`T`\> |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `case` | (`param0`: \{ `pending?`: () => `void` ; `rejected?`: (`error`: `Error`) => `void` ; `resolved?`: (`value`: `T`) => `void`  }) => `Promise`\<`void`\> |

#### Defined in

[src/api/api.js:425](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/api/api.js#L425)

___

### getAllPropertyDescriptors

▸ **getAllPropertyDescriptors**(`obj`, `depth?`, `maxDepth?`): `Object`

Gets all property descriptors of an object, including its prototype and all its ancestors.
The descriptors are returned as a plain object.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `obj` | `any` | `undefined` |
| `depth?` | `number` | `0` |
| `maxDepth?` | `number` | `100` |

#### Returns

`Object`

#### Defined in

[src/helpers/tools.js:196](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/helpers/tools.js#L196)

___

### getCurrentContext

▸ **getCurrentContext**(): [`Store2Context`](classes/Store2Context.md)

Returns the currently installed context, or the default one.

On runtimes with `AsyncLocalStorage`, returns the context associated
with the current async chain — safe to call from server-render
components after an `await`.

#### Returns

[`Store2Context`](classes/Store2Context.md)

#### Defined in

[src/core/context.js:648](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L648)

___

### getError

▸ **getError**(`e`): `Error`

Converts any value to an Error object.

#### Parameters

| Name | Type |
| :------ | :------ |
| `e` | `unknown` |

#### Returns

`Error`

#### Defined in

[src/helpers/tools.js:212](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/helpers/tools.js#L212)

___

### getItemNamesFromSet

▸ **getItemNamesFromSet**(`items`, `options?`): `string`[]

Extracts names (and optionally ids) from a Set of reactive items.

Uses duck typing (`item.engine && item.name`) to avoid importing from
`reactives/` — that keeps `tools.js` free of circular dependencies.

#### Parameters

| Name | Type |
| :------ | :------ |
| `items` | `Set`\<[`ReactiveItem`](classes/ReactiveItem.md)\> \| [`Iterable`](interfaces/internal_.Iterable.md)\<[`ReactiveItem`](classes/ReactiveItem.md)\> |
| `options?` | `Object` |
| `options.fallback?` | `string` |
| `options.includeId?` | `boolean` |
| `options.sorted?` | `boolean` |

#### Returns

`string`[]

#### Defined in

[src/helpers/tools.js:226](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/helpers/tools.js#L226)

___

### getNow

▸ **getNow**(`interval?`): [`Atom`](classes/Atom.md)\<`number`\>

Returns an Atom that ticks at the given interval while it has subscribers.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `interval?` | `number` | `1000` |

#### Returns

[`Atom`](classes/Atom.md)\<`number`\>

#### Defined in

[src/api/api.js:387](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/api/api.js#L387)

___

### getSortedReactiveItems

▸ **getSortedReactiveItems**(`...items`): [`ReactiveItem`](classes/ReactiveItem.md)[]

Combines multiple reactive items or sets of reactive items into a single set,
ensuring that each item appears only once. The combined set is then converted
to an array and sorted by the internal id of the reactive items.

#### Parameters

| Name | Type |
| :------ | :------ |
| `...items` | ([`ReactiveItem`](classes/ReactiveItem.md) \| `Set`\<[`ReactiveItem`](classes/ReactiveItem.md)\>)[] |

#### Returns

[`ReactiveItem`](classes/ReactiveItem.md)[]

#### Defined in

[src/helpers/tools.js:25](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/helpers/tools.js#L25)

___

### isPlainObject

▸ **isPlainObject**(`obj`): `boolean`

Checks if a given value is a plain object.

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `any` |

#### Returns

`boolean`

true if the value is a plain object, false otherwise.

#### Defined in

[src/helpers/tools.js:43](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/helpers/tools.js#L43)

___

### makeAutoObservable

▸ **makeAutoObservable**\<`T`\>(`obj`, `overrides?`, `options?`, `filter?`): `T`

Same as `makeObservable` but infers annotations automatically.

Plain objects become `shallowReactive`, arrays become `collection`,
getters become `computed`, and everything else becomes `atom`. Pass
`overrides` to correct the inference or disable a property with `false`.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `T` |
| `overrides?` | `Object` |
| `options?` | `Object` |
| `options.name` | `string` |
| `filter?` | `Set`\<`string`\> |

#### Returns

`T`

#### Defined in

[src/api/api.js:682](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/api/api.js#L682)

___

### makeObservable

▸ **makeObservable**\<`T`\>(`obj`, `annotations`, `options?`): `T`

Enhances an object with reactive properties using explicit annotations.

Each key maps to one of `"atom"`, `"computed"`, `"collection"`,
`"shallowReactive"`, or `false` to leave the property untouched.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `T` |
| `annotations` | `Object` |
| `options?` | `Object` |
| `options.name` | `string` |

#### Returns

`T`

#### Defined in

[src/api/api.js:569](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/api/api.js#L569)

___

### reaction

▸ **reaction**(`dataFn`, `effectFn`, `options?`): () => `void`

Reaction – tracks dependencies via `dataFn` and runs `effectFn` when they
change. The effect is NOT run at setup time.

#### Parameters

| Name | Type |
| :------ | :------ |
| `dataFn` | () => `any` |
| `effectFn` | (`updates?`: `Map`\<`string`, [`UpdateDataRecord`](classes/internal_.UpdateDataRecord.md)\>) => `void` |
| `options?` | `Object` |
| `options.delay` | `number` |
| `options.name` | `string` |
| `options.onError` | `Function` |
| `options.passUpdates` | `boolean` |
| `options.recomputeDependencies` | `boolean` |
| `options.signal` | `AbortSignal` |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Defined in

[src/api/api.js:233](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/api/api.js#L233)

___

### runInAction

▸ **runInAction**(`fn`): `void`

Defers mutations until after subscribers finish, so it is safe to call
from inside a subscriber callback.

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | `Function` |

#### Returns

`void`

#### Defined in

[src/api/api.js:326](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/api/api.js#L326)

___

### runWithContext

▸ **runWithContext**\<`T`\>(`context`, `fn`): `T`

Runs `fn` with `context` installed as the active context.

On runtimes with `AsyncLocalStorage` (Node 22.3+), the context binding
survives `await` boundaries — a server-render function that awaits an
async operation will still see the correct context afterwards. On older
runtimes and in browsers, the binding only holds for the synchronous
execution of `fn`.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `context` | [`Store2Context`](classes/Store2Context.md) |
| `fn` | () => `T` |

#### Returns

`T`

#### Defined in

[src/core/context.js:669](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L669)

___

### runWithContextAsync

▸ **runWithContextAsync**\<`T`\>(`context`, `fn`): `Promise`\<`T`\>

Async-aware variant of `runWithContext`. On runtimes with
`AsyncLocalStorage`, behaves identically to `runWithContext` for async
functions. On runtimes without it, this is an explicit marker that the
caller expects context propagation across `await`, and will lose it
after the first `await` — the same limitation as `runWithContext`.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `context` | [`Store2Context`](classes/Store2Context.md) |
| `fn` | () => `Promise`\<`T`\> |

#### Returns

`Promise`\<`T`\>

#### Defined in

[src/core/context.js:696](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/core/context.js#L696)

___

### shallowReactive

▸ **shallowReactive**\<`T`\>(`value`, `options?`): [`ShallowReactive`](classes/ShallowReactive.md)\<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Object` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `T` |
| `options?` | `Object` |
| `options.name` | `string` |

#### Returns

[`ShallowReactive`](classes/ShallowReactive.md)\<`T`\>

#### Defined in

[src/api/api.js:552](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/api/api.js#L552)

___

### sleep

▸ **sleep**(`ms`): `Promise`\<`void`\>

A Promise-based sleep function.

#### Parameters

| Name | Type |
| :------ | :------ |
| `ms` | `number` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/helpers/tools.js:184](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/helpers/tools.js#L184)

___

### sortReactiveItems

▸ **sortReactiveItems**(`a`, `b`): `number`

Sorts reactive items by their internal id. This is used to
ensure that reactive items are processed in a consistent order
when they are notified of changes.

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | [`ReactiveItem`](classes/ReactiveItem.md) |
| `b` | [`ReactiveItem`](classes/ReactiveItem.md) |

#### Returns

`number`

-1 if a should come before b, 0 if a and b are equal, 1 if a should come after b

#### Defined in

[src/helpers/tools.js:11](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/helpers/tools.js#L11)

___

### untrack

▸ **untrack**\<`T`\>(`fn`): `T`

Runs `fn` without tracking reactive reads. Nesting is safe: the previous
state is restored on exit even if `fn` throws.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | () => `T` |

#### Returns

`T`

#### Defined in

[src/api/api.js:371](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/api/api.js#L371)

___

### waitUntil

▸ **waitUntil**(`predicate`, `options?`): `Promise`\<`void`\>

Returns a promise that resolves when `predicate` becomes true.

#### Parameters

| Name | Type |
| :------ | :------ |
| `predicate` | () => `boolean` |
| `options?` | `Object` |
| `options.timeout` | `number` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/api/api.js:289](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/api/api.js#L289)

___

### when

▸ **when**(`predicate`, `fn`, `options?`): () => `void`

Waits for `predicate` to become true, then runs `fn` once.

#### Parameters

| Name | Type |
| :------ | :------ |
| `predicate` | () => `boolean` |
| `fn` | () => `void` |
| `options?` | `Object` |
| `options.delay` | `number` |
| `options.signal` | `AbortSignal` |
| `options.timeout` | `number` |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Defined in

[src/api/api.js:252](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/api/api.js#L252)
