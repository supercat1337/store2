[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / DependencyGraph

# Class: DependencyGraph

[\<internal\>](../modules/internal_.md).DependencyGraph

Manages the dependency graph for a reactive item.
Handles adding/removing dependencies and dependents, and propagating messages through the graph.

## Table of contents

### Constructors

- [constructor](internal_.DependencyGraph.md#constructor)

### Properties

- [#dependencies](internal_.DependencyGraph.md##dependencies)
- [#dependents](internal_.DependencyGraph.md##dependents)
- [#reactiveItem](internal_.DependencyGraph.md##reactiveitem)

### Methods

- [addDependencies](internal_.DependencyGraph.md#adddependencies)
- [addDependency](internal_.DependencyGraph.md#adddependency)
- [addDependent](internal_.DependencyGraph.md#adddependent)
- [clear](internal_.DependencyGraph.md#clear)
- [getDeepDependents](internal_.DependencyGraph.md#getdeepdependents)
- [getDeepDependentsArray](internal_.DependencyGraph.md#getdeepdependentsarray)
- [notifyDependencies](internal_.DependencyGraph.md#notifydependencies)
- [notifyDependents](internal_.DependencyGraph.md#notifydependents)
- [removeDependent](internal_.DependencyGraph.md#removedependent)
- [updateDependencies](internal_.DependencyGraph.md#updatedependencies)

## Constructors

### constructor

• **new DependencyGraph**(`dependencies`, `dependents`, `reactiveItem`): [`DependencyGraph`](internal_.DependencyGraph.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `dependencies` | `Set`\<[`ReactiveItem`](ReactiveItem.md)\> | The engine's dependencies set. |
| `dependents` | `Set`\<[`ReactiveItem`](ReactiveItem.md)\> | The engine's dependents set. |
| `reactiveItem` | [`ReactiveItem`](ReactiveItem.md) | The owning reactive item. |

#### Returns

[`DependencyGraph`](internal_.DependencyGraph.md)

#### Defined in

src/core/DependencyGraph.js:22

## Properties

### #dependencies

• `Private` **#dependencies**: `Set`\<[`ReactiveItem`](ReactiveItem.md)\>

#### Defined in

src/core/DependencyGraph.js:11

___

### #dependents

• `Private` **#dependents**: `Set`\<[`ReactiveItem`](ReactiveItem.md)\>

#### Defined in

src/core/DependencyGraph.js:13

___

### #reactiveItem

• `Private` **#reactiveItem**: [`ReactiveItem`](ReactiveItem.md)

#### Defined in

src/core/DependencyGraph.js:15

## Methods

### addDependencies

▸ **addDependencies**(`deps`): `void`

Adds multiple dependencies, sorted by id, and registers this reactive item as a dependent on each.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deps` | `Set`\<[`ReactiveItem`](ReactiveItem.md)\> | Set of dependencies to add. |

#### Returns

`void`

#### Defined in

src/core/DependencyGraph.js:42

___

### addDependency

▸ **addDependency**(`dependency`): `void`

Adds a single dependency.

#### Parameters

| Name | Type |
| :------ | :------ |
| `dependency` | [`ReactiveItem`](ReactiveItem.md) |

#### Returns

`void`

#### Defined in

src/core/DependencyGraph.js:32

___

### addDependent

▸ **addDependent**(`dependent`): `boolean`

Adds a dependent to the dependents set.

#### Parameters

| Name | Type |
| :------ | :------ |
| `dependent` | [`ReactiveItem`](ReactiveItem.md) |

#### Returns

`boolean`

True if the dependent was added (i.e., not already present).

#### Defined in

src/core/DependencyGraph.js:69

___

### clear

▸ **clear**(): `void`

Clears the graph (removes all dependencies and dependents).

#### Returns

`void`

#### Defined in

src/core/DependencyGraph.js:157

___

### getDeepDependents

▸ **getDeepDependents**(): `Set`\<[`ReactiveItem`](ReactiveItem.md)\>

Returns all dependents of this reactive item (direct and indirect).

#### Returns

`Set`\<[`ReactiveItem`](ReactiveItem.md)\>

#### Defined in

src/core/DependencyGraph.js:81

___

### getDeepDependentsArray

▸ **getDeepDependentsArray**(): [`ReactiveItem`](ReactiveItem.md)[]

Returns sorted array of deep dependents.

#### Returns

[`ReactiveItem`](ReactiveItem.md)[]

#### Defined in

src/core/DependencyGraph.js:103

___

### notifyDependencies

▸ **notifyDependencies**(`message`, `ctx`): `void`

Notifies all dependencies of a message.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `number` | The message code. |
| `ctx` | `Object` |  |
| `ctx.recipients` | `Set`\<[`ReactiveItem`](ReactiveItem.md)\> | - |
| `ctx.sender` | [`ReactiveItem`](ReactiveItem.md) | - |

#### Returns

`void`

#### Defined in

src/core/DependencyGraph.js:126

___

### notifyDependents

▸ **notifyDependents**(`message`, `ctx`): `void`

Notifies all dependents of a message.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `number` | The message code (EngineMessages). |
| `ctx` | `Object` | Context containing sender and recipient set. |
| `ctx.recipients` | `Set`\<[`ReactiveItem`](ReactiveItem.md)\> | - |
| `ctx.sender` | [`ReactiveItem`](ReactiveItem.md) | - |

#### Returns

`void`

#### Defined in

src/core/DependencyGraph.js:114

___

### removeDependent

▸ **removeDependent**(`dependent`): `void`

Removes a dependent from the dependents set.

#### Parameters

| Name | Type |
| :------ | :------ |
| `dependent` | [`ReactiveItem`](ReactiveItem.md) |

#### Returns

`void`

#### Defined in

src/core/DependencyGraph.js:60

___

### updateDependencies

▸ **updateDependencies**(`newDeps`): `void`

Updates the dependency set to a new set.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `newDeps` | `Set`\<[`ReactiveItem`](ReactiveItem.md)\> | New set of dependencies. |

#### Returns

`void`

#### Defined in

src/core/DependencyGraph.js:137
