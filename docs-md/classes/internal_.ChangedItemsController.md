[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / ChangedItemsController

# Class: ChangedItemsController

[\<internal\>](../modules/internal_.md).ChangedItemsController

Coordinates notification of changed reactive items: collects them,
recalculates stale computed values in a deterministic order, and invokes
subscribers.

One instance per `Store2Context`. The class receives the owning
`ModeControllerService` in its constructor so that batching and subscriber
modes can be controlled independently for each context.

## Table of contents

### Constructors

- [constructor](internal_.ChangedItemsController.md#constructor)

### Properties

- [#modeController](internal_.ChangedItemsController.md##modecontroller)
- [items](internal_.ChangedItemsController.md#items)

### Methods

- [addItem](internal_.ChangedItemsController.md#additem)
- [clear](internal_.ChangedItemsController.md#clear)
- [removeItem](internal_.ChangedItemsController.md#removeitem)
- [runSubscribers](internal_.ChangedItemsController.md#runsubscribers)

## Constructors

### constructor

• **new ChangedItemsController**(`modeController`): [`ChangedItemsController`](internal_.ChangedItemsController.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `modeController` | [`ModeControllerService`](internal_.ModeControllerService.md) |

#### Returns

[`ChangedItemsController`](internal_.ChangedItemsController.md)

#### Defined in

[src/services/changedItemsController.js:37](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/changedItemsController.js#L37)

## Properties

### #modeController

• `Private` **#modeController**: [`ModeControllerService`](internal_.ModeControllerService.md)

#### Defined in

[src/services/changedItemsController.js:32](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/changedItemsController.js#L32)

___

### items

• **items**: `Set`\<[`ReactiveItem`](ReactiveItem.md)\>

#### Defined in

[src/services/changedItemsController.js:29](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/changedItemsController.js#L29)

## Methods

### addItem

▸ **addItem**(`item`): `void`

Marks an item as changed. Outside a batch, immediately runs subscribers
and clears the pending set.

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | [`ReactiveItem`](ReactiveItem.md) |

#### Returns

`void`

#### Defined in

[src/services/changedItemsController.js:46](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/changedItemsController.js#L46)

___

### clear

▸ **clear**(): `void`

Clears the pending set.

#### Returns

`void`

#### Defined in

[src/services/changedItemsController.js:65](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/changedItemsController.js#L65)

___

### removeItem

▸ **removeItem**(`item`): `void`

Removes an item from the pending set.

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | [`ReactiveItem`](ReactiveItem.md) |

#### Returns

`void`

#### Defined in

[src/services/changedItemsController.js:58](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/changedItemsController.js#L58)

___

### runSubscribers

▸ **runSubscribers**(): `void`

Runs all pending subscribers.

The outer loop re-checks `this.items` after each notification round so
that updates added during subscriber execution (e.g. via `runInAction`)
are processed in the same call.

Iterations that produce no subscribers to run are short-circuited:
they still clean up update records, but do not enter subscribers-mode
and therefore do not emit `subscribersModeEnd`. This keeps the
subscribers-mode lifecycle aligned with actual subscriber execution —
a single mutation emits exactly one `subscribersModeEnd`.

#### Returns

`void`

#### Defined in

[src/services/changedItemsController.js:82](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/services/changedItemsController.js#L82)
