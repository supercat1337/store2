# AI_DOCS.md – Technical Architecture of @supercat1337/store2

This document provides an in‑depth technical overview of the `store2` reactive library. It is intended for AI assistants and developers who need to understand the internal mechanics for debugging, extending, or integrating the library.

---

## 1. High‑Level Architecture

The library is built around the concept of **Reactive Items**. Every piece of reactive state (atom, computed, collection, shallow reactive) is an instance of `ReactiveItem` (or its subclasses). Each reactive item has an associated **Engine** that manages dependencies, subscribers, and updates.

**Main layers:**

- **Reactive Items** (`Atom`, `Computed`, `Collection`, `ShallowReactive`) – the user‑facing reactive containers.
- **Engine** – core dependency graph, update propagation, batching, and subscription management.
- **Services** – global controllers for batching (`modeController`), change tracking (`changedItemsController`), dependency tracking (`dependencyTracker`), and ID generation (`idService`).
- **Containers** – `Store` and `ReactiveList` that compose multiple reactive items.
- **API functions** – `autorun`, `reaction`, `batch`, `makeObservable`, etc. – high‑level utilities that build on the core primitives.

---

## 2. Core Classes

### 2.1. `ReactiveItem` (abstract base)

- **Purpose**: Base class for all reactive items.
- **Properties**:
    - `engine`: instance of `Engine` (see below).
    - `name`: optional string for debugging.
- **Methods**:
    - `subscribe(fn, options)` – adds a listener for changes.
    - `onHasSubscribers(fn)` / `onNoSubscribers(fn)` – lifecycle hooks.
    - `destroy()` – cleans up the item.
    - `getValue(options)` – retrieves the current value (tracks dependency if `untracked=false`).
    - `peekValue()` – returns value without tracking.
    - `equals(a,b)` – compares two values using a custom comparator if provided.

### 2.2. `Engine`

- **Purpose**: Manages dependencies, dependents, updates, and notifications for a single reactive item.
- **Key properties**:
    - `dependencies`: `Set<ReactiveItem>` – items this item depends on.
    - `dependents`: `Set<ReactiveItem>` – items that depend on this item.
    - `id`: unique numeric ID (for ordering).
    - `updates`: `Map<string, UpdateDataRecord>` – pending changes.
    - `subscribeController`: `SubscribeController` – manages subscribers.
    - `batchSnapshot`: `BatchSnapshot` – stores original values during batch.
    - `shouldRecalc`: boolean – flag indicating need to recompute (for computed).
    - `error`: `Error | null` – last error (for computed).
- **Methods**:
    - `addUpdate(property, type, oldValue, newValue)` – records a change, returns true if effective.
    - `notifyDependents(message, ctx)` – propagates dependency change/destroy messages.
    - `getMessage(message, ctx)` – handles incoming messages (change, destroy, error).
    - `destroy(ctx)` – tears down the engine and notifies dependents.
    - `checkChangesTemporary()` – after batch ends, removes updates that reverted to original values.

### 2.3. `SubscribeController`

- **Purpose**: Manages change subscribers for a reactive item.
- **Features**:
    - Uses an `EventEmitterExt` for `change` events.
    - Supports debouncing and AbortSignal.
    - Emits internal `#has-listeners` / `#no-listeners` events for lifecycle hooks.

### 2.4. `BatchSnapshot`

- **Purpose**: Stores original values of properties at the start of a batch. Used to detect whether a property actually changed after a series of mutations inside the batch.

### 2.5. `UpdateDataRecord`

- **Purpose**: Represents a single mutation state passed to subscribers.
- **Structure**:

```typescript
interface UpdateDataRecord {
    type: 'set' | 'delete';
    oldValue: any;
    newValue: any;
}
```

- Used by the `updates` map (`Map<string, UpdateDataRecord>`) in `Engine`.

---

## 3. Dependency Tracking & Computed Recalculation

### 3.1. DependencyTracker (global service)

- A singleton `Tracker` that is activated during the first run of a computed or when collecting dependencies for `autorun`/`reaction`.
- When active, any `getValue()` call on a reactive item adds that item to the tracker’s internal set.
- After the tracked function finishes, the collected set is used to establish dependencies in the `Engine`.

### 3.2. Computed Recalculation

- A `Computed` stores its last computed value and a version string (when `smartRecompute` is enabled).
- When a dependency notifies a change, the computed sets `shouldRecalc = true`.
- On next `getValue()`, it checks:
    - if `smartRecompute` is false: always recompute.
    - if `smartRecompute` is true: compare the version string of dependencies; only recompute if changed.
- Recalculation runs the user function inside a new dependency collection pass, updates the dependency graph, and compares the new value with the old. If different, an update record is created and subscribers are notified.

### 3.3. Important Note: Computed + Collection Reference Stability

When a `Computed` depends on a `Collection`, the dependency is established on the proxy object returned by `collection.value`. This proxy object **remains the same reference** even when the underlying array content changes. Because `Computed` uses `equals` to decide whether the value has changed (and thus whether to notify subscribers), by default it compares references (`a === b`). When the proxy reference stays the same, `equals` returns `true` even if the content changed, so the computed does not notify subscribers.

**To ensure reactivity in such cases, you must either:**

1. **Return a new array** (e.g., `[...all]` or `all.slice()`) to break reference equality:

    ```js
    const filteredTodos = computed(() => {
        const all = todos.value;
        if (filter.value === 'all') return [...all];
        return all.filter(t => t.done);
    });
    ```

2. **Provide a custom `compareFunction`** that performs deep content comparison:
    ```js
    const filteredTodos = computed(() => todos.value.filter(t => t.done), {
        compareFunction: (a, b) => JSON.stringify(a) === JSON.stringify(b),
    });
    ```

The first approach is preferred because it avoids extra comparison overhead and works with the default equality check.

> **Note:** A future version of the library may improve the default `compareAny` to perform deep comparison for objects and arrays even when references are equal. However, for now, users must handle this case explicitly when deriving computed values from `Collection` or `ShallowReactive` where the proxy reference remains constant.

### 3.4. Working with Deep Objects

`store2` does **not** automatically track nested mutations (i.e., changes to properties of objects stored inside an `Atom` or `Collection`). This is a deliberate design choice to keep the library lightweight and predictable. Instead, it encourages **immutable updates** or explicit state decomposition.

**Why nested mutations are not detected**:

- `Atom` and `Collection` use reference equality (`===`) by default to detect changes (or a custom `compareFunction`).
- Mutating a nested property (e.g., `user.value.profile.age = 26`) does **not** change the reference of the top-level object or array.
- Therefore, `equals` returns `true` and no update is triggered.

**Recommended patterns**:

1. **Immutable updates** – Create a new object/array when updating nested fields:

    ```js
    const user = atom({ name: 'Alex', profile: { age: 25 } });
    user.value = { ...user.value, profile: { ...user.value.profile, age: 26 } };
    ```

    For `Collection`, always return a new array (e.g., `[...all]`) in computed values to break reference equality.

2. **Atomization** – Split deep state into multiple atoms, each responsible for a specific part:

    ```js
    const userName = atom('Alex');
    const userAge = atom(25);
    ```

3. **`makeAutoObservable`** – For classes or deeply nested objects, use `makeAutoObservable` to make all properties reactive automatically (including nested objects and arrays):

    ```js
    class User {
        name = 'Alex';
        profile = { age: 25 };
        constructor() {
            makeAutoObservable(this);
        }
    }
    const user = new User();
    // Now `user.profile.age = 26` triggers reactivity
    ```

4. **Custom `compareFunction`** – As an escape hatch, provide a deep equality function to `Atom` or `Computed`. However, this can be expensive for large structures; use with caution.

> **Performance note:** Immutable updates and atomization are preferred for predictability and performance. Avoid deep comparisons unless absolutely necessary.

---

## 4. Batching and Change Propagation

### 4.1. ModeController (global service)

- Manages **batch depth** (`batchMode`) and **subscribers mode**.
- `batch()` increments depth; `exitBatch()` decrements and, when depth reaches zero, triggers `beforeBatchModeEnd` event.
- During batch, changes are recorded in `updates` but not immediately notified. At the end of the outermost batch, `changedItemsController` processes all accumulated changes.

### 4.2. ChangedItemsController (global service)

- Collects all changed items (via `addItem`).
- When not in batch, it immediately runs all subscribers and clears the set.
- When a batch ends, it is called by `modeController` to process all queued items.
- Processing steps:
    1. For each item, check if its `updates` map is non‑empty (after `checkChangesTemporary()` for batch mode).
    2. Find all deep dependents (recursively) that have subscribers, and force recalculate them (by calling `getValue()`).
    3. Collect final updates from all changed items.
    4. Sort items by their `id` to ensure deterministic order.
    5. Enter `subscribersMode` to prevent further mutations during notification.
    6. Invoke each subscriber (deduplicated) with the item’s `updates` map.
    7. Clear all `updates` maps and the global set.
    8. Exit `subscribersMode`.

### 4.3. Subscribers Mode

- When `subscribersMode` is active, any attempt to modify a reactive item throws an error. This prevents re‑entrancy and infinite loops.
- `runInAction` defers mutations until after subscribers finish by listening to `subscribersModeEnd`.

---

## 5. Store and ReactiveList Implementation Details

### 5.1. Store

- Internally uses two maps: `#items` (ReactiveItem) and `#childStores` (Store).
- Each item or store is assigned a key. The Store wraps its own `subscribeController` (via event emitter) and forwards updates from child items.
- When a child item changes, it notifies the Store, which collects the update and passes it to its own subscribers.
- `muteUpdates()` and `unmuteUpdates()` temporarily suppress notifications.

### 5.2. ReactiveList

- Uses a `Store` internally to hold items indexed by string (e.g., `"0"`, `"1"`).
- Maintains a separate `Atom` for `length`.
- When items are added, they are wrapped in `Atom` (for primitives) or `ShallowReactive` (for objects/arrays).
- Mutations (add, set, remove, splice) are batched using `muteUpdates()`/`unmuteUpdates()` on the internal Store to emit only one notification per operation.

---

## 6. Error Handling

- Computed functions that throw are caught, and the error is stored in `engine.error`.
- The computed will re‑throw that error on subsequent reads until dependencies change.
- Subscriber errors are caught and aggregated; by default they are re‑thrown after all subscribers are processed (controlled by `modeController.throwErrorInSubscribers`).

---

## 7. Asynchronous Helpers

- `getNow`: creates an Atom that updates on a timer when there are subscribers.
- `fromPromise`: uses an Atom to hold the promise state and provides a `case` method to react to state transitions.

---

## 8. Performance Considerations

- Dependency graphs are maintained using `Set` and `Map` for O(1) operations.
- Change propagation is batched and deduplicated.
- `smartRecompute` avoids recomputing when dependencies change but the final value remains the same.
- Proxies (for `Collection` and `ShallowReactive`) intercept only property access/set, with minimal overhead.

---

## 9. Testing Strategy

- Unit tests cover each reactive primitive, containers, and API functions.
- Integration tests verify batching, dependency tracking, and error propagation.
- The library is designed to be fully deterministic; IDs are assigned sequentially to ensure consistent ordering.

---

## 10. Core Architectural Invariants (Guards for AI)

When modifying code or writing complex workflows, ensure these core engine rules are strictly followed:

1. **No Mutations in Subscribers (State Lockdown):** Modifying any reactive state inside a `subscribe()` callback or during the notification phase is strictly forbidden. It will throw an error due to `subscribersMode` being active. Use `runInAction()` to defer side-effect mutations.
2. **Zombie State Prevention:** Once `destroy()` is invoked on a `ReactiveItem`, its entire engine graph is torn down. Any subsequent operations (reads/writes) except `isDestroyed` must check for lifecycle validity and will throw errors if handled incorrectly.
3. **Deterministic Graph Sorting:** The global `changedItemsController` relies on the deterministic, sequential numeric `id` generated by `idService` to sort elements before firing subscribers. Never bypass or manually mock item IDs in production tracks.

---

This document should serve as a concise reference for understanding the internal workings of `@supercat1337/store2`. For API usage, refer to the main README and the full documentation.
