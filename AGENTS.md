# AGENTS.md – Technical Architecture of @supercat1337/store2

This document provides an in‑depth technical overview of the `store2` reactive library. It is intended for AI assistants and developers who need to understand the internal mechanics for debugging, extending, or integrating the library.

---

## Table of Contents

- [1. High‑Level Architecture](#1-highlevel-architecture)
- [2. Core Classes](#2-core-classes)
    - [2.1. ReactiveItem (abstract base)](#21-reactiveitem-abstract-base)
    - [2.2. Engine](#22-engine)
    - [2.3. SubscribeController](#23-subscribecontroller)
    - [2.4. BatchSnapshot](#24-batchsnapshot)
    - [2.5. UpdateDataRecord](#25-updatedatarecord)
- [3. Dependency Tracking & Computed Recalculation](#3-dependency-tracking--computed-recalculation)
    - [3.1. DependencyTracker (per-context service)](#31-dependencytracker-per-context-service)
    - [3.2. Computed Recalculation](#32-computed-recalculation)
    - [3.3. Important Note: Computed + Collection Reference Stability](#33-important-note-computed--collection-reference-stability)
    - [3.4. Working with Deep Objects](#34-working-with-deep-objects)
- [4. Batching and Change Propagation](#4-batching-and-change-propagation)
    - [4.1. ModeController (per-context service)](#41-modecontroller-per-context-service)
    - [4.2. ChangedItemsController (per-context service)](#42-changeditemscontroller-per-context-service)
    - [4.3. Subscribers Mode](#43-subscribers-mode)
- [5. Store and ReactiveList Implementation Details](#5-store-and-reactivelist-implementation-details)
    - [5.1. Store](#51-store)
    - [5.2. ReactiveList](#52-reactivelist)
- [6. Error Handling](#6-error-handling)
- [7. Asynchronous Helpers](#7-asynchronous-helpers)
- [8. Performance Considerations](#8-performance-considerations)
- [9. Testing Strategy](#9-testing-strategy)
- [10. Core Architectural Invariants (Guards for AI)](#10-core-architectural-invariants-guards-for-ai)
- [11. Common Pitfalls for AI-Generated Code](#11-common-pitfalls-for-ai-generated-code)
- [12. Store2Context](#12-store2context)
- [13. Plugins](#13-plugins)
- [14. Actions and Middleware](#14-actions-and-middleware)
- [15. Serialization and Time-Travel](#15-serialization-and-time-travel)
- [16. DevTools](#16-devtools)
- [17. Additional Architectural Invariants](#17-additional-architectural-invariants)
- [18. Additional Common Pitfalls](#18-additional-common-pitfalls)

---

## 1. High‑Level Architecture

The library is built around the concept of **Reactive Items**. Every piece of reactive state (atom, computed, collection, shallow reactive) is an instance of `ReactiveItem` (or its subclasses). Each reactive item has an associated **Engine** that manages dependencies, subscribers, and updates.

**Main layers:**

- **Reactive Items** (`Atom`, `Computed`, `Collection`, `ShallowReactive`) – the user‑facing reactive containers.
- **Engine** – core dependency graph, update propagation, batching, and subscription management.
- **Services** – context‑local controllers for batching (`modeController`), change tracking (`changedItemsController`), dependency tracking (`dependencyTracker`), and ID generation (`idService`). Each `Store2Context` owns one instance of each service; the process‑wide singletons form the default context.
- **Containers** – `Store` and `ReactiveList` that compose multiple reactive items.
- **API functions** – `autorun`, `reaction`, `batch`, `makeObservable`, etc. – high-level utilities that build on the core primitives. `reaction` supports an optional `passUpdates` flag to receive a `Map` of change details.
- **Contexts & Plugins** – `Store2Context` bundles the services and exposes plugin/middleware/root registries. The DevTools plugin, snapshot/hydrate protocol, and SSR isolation all build on this layer.

---

## 2. Core Classes

### 2.1. `ReactiveItem` (abstract base)

- **Purpose**: Base class for all reactive items.
- **Properties**:
    - `engine`: instance of `Engine` (see below).
    - `name`: optional string for debugging.
    - `path`: local path assigned by the immediate container (a key in a `Store`, or a stringified index in a `ReactiveList`).
- **Methods**:
    - `subscribe(fn, options)` – adds a listener for changes.
    - `onHasSubscribers(fn)` / `onNoSubscribers(fn)` – lifecycle hooks.
    - `destroy()` – cleans up the item.
    - `getValue(options)` – retrieves the current value (tracks dependency if `untracked=false`).
    - `peekValue()` – returns value without tracking.
    - `equals(a,b)` – compares two values using a custom comparator if provided.
    - `getVersion()` – monotonic version counter, bumped on every effective change.
    - `serialize()` / `hydrate(data)` – persistence protocol (see §15).

### 2.2. `Engine`

- **Purpose**: Manages dependencies, dependents, updates, and notifications for a single reactive item.
- **Key properties**:
    - `context`: the `Store2Context` this item was created in. Captured once in the constructor and never changes.
    - `dependencies`: `Set<ReactiveItem>` – items this item depends on.
    - `dependents`: `Set<ReactiveItem>` – items that depend on this item.
    - `id`: unique numeric ID (for ordering), generated by the context's `idService`.
    - `updates`: `Map<string, UpdateDataRecord>` – pending changes.
    - `subscribeController`: `SubscribeController` – manages subscribers.
    - `batchSnapshot`: `BatchSnapshot` – stores original values during batch.
    - `shouldRecalc`: boolean – flag indicating need to recompute (for computed).
    - `error`: `Error | null` – last error (for computed).
- **Methods**:
    - `addUpdate(property, type, oldValue, newValue)` – records a change, returns true if effective, and emits `onUpdate` on the context's plugins.
    - `notifyDependents(message, ctx)` – propagates dependency change/destroy messages.
    - `getMessage(message, ctx)` – handles incoming messages (change, destroy, error).
    - `destroy(ctx)` – tears down the engine and notifies dependents; emits `onDestroy`.
    - `checkChangesTemporary()` – after batch ends, removes updates that reverted to original values.

### 2.3. `SubscribeController`

- **Purpose**: Manages change subscribers for a reactive item.
- **Features**:
    - Uses an `EventEmitter` for `change` and `destroy` events.
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
    value: any;
    reactiveItem?: ReactiveItem;
}
```

- Used by the `updates` map (`Map<string, UpdateDataRecord>`) in `Engine`.

---

## 3. Dependency Tracking & Computed Recalculation

### 3.1. DependencyTracker (per-context service)

- A `Tracker` instance owned by each context. It is activated during the first run of a computed or when collecting dependencies for `autorun`/`reaction`.
- When active, any `getValue()` call on a reactive item adds that item to the tracker's internal set.
- After the tracked function finishes, the collected set is used to establish dependencies in the `Engine`.
- Scopes are nested: each `enable()` pushes a fresh store and each `disable()` restores the previous one. Nested computed construction and re-entrant tracking are safe.

### 3.2. Computed Recalculation

- A `Computed` stores its last computed value and a version string (when `smartRecompute` is enabled).
- When a dependency notifies a change, the computed sets `shouldRecalc = true`.
- On next `getValue()`, it checks:
    - if `smartRecompute` is false: always recompute.
    - if `smartRecompute` is true: compare the version string of dependencies; only recompute if changed.
- Recalculation runs the user function inside a new dependency collection pass and **calls `engine.updateDependencies(newDeps)`** so that the dependency graph tracks dynamic reads across runs. It then compares the new value with the old. If different, an update record is created, subscribers are notified, and `onComputedRecalc` is emitted.

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

### 4.1. ModeController (per-context service)

- Manages **batch depth** (`batchMode`), **subscribers mode**, and the **action stack**.
- `batch(name?, fn)` increments depth; `exitBatch()` decrements and, when depth reaches zero, triggers `beforeBatchModeEnd` followed by `batchModeEnd`. The current batch name is preserved until after `batchModeEnd` listeners run, then cleared.
- During batch, changes are recorded in `updates` but not immediately notified. At the end of the outermost batch, `changedItemsController` processes all accumulated changes.

### 4.2. ChangedItemsController (per-context service)

- Collects all changed items (via `addItem`).
- When not in batch, it immediately runs all subscribers and clears the set.
- When a batch ends, it is called by `modeController` to process all queued items.
- Processing steps:
    1. For each item, check if its `updates` map is non‑empty (after `checkChangesTemporary()` for batch mode).
    2. Find all deep dependents (recursively) that have subscribers, and force recalculate them (by calling `getValue()`).
    3. Collect final updates from all changed items.
    4. Sort items by their `id` to ensure deterministic order.
    5. Enter `subscribersMode` to prevent further mutations during notification.
    6. Emit `onSubscriberRun` on the context's plugins, then invoke each subscriber (deduplicated) with the item's `updates` map.
    7. Clear all `updates` maps and the global set.
    8. Exit `subscribersMode`.

#### Collecting updates in reaction

When a subscriber is invoked, it receives the `item.engine.updates` map (see Step 6 in the processing steps above). The high-level `reaction` API uses this mechanism to collect all updates from the dependencies it tracks. In `createReactiveSubscription`, each dependency's subscriber callback (`onChange`) accumulates updates into a local `Map`. When the effect runs, a fresh copy of this accumulated map is passed to `effectFn` if the `passUpdates` option is `true` (default for `reaction`), and the internal accumulator is cleared immediately so the next cycle starts empty. This enables fine‑grained change detection without re‑executing the entire effect.

- `passUpdates: true` (default) – passes a `Map` of updates to `effectFn`.
- `passUpdates: false` – disables this behaviour (useful for performance when updates are not needed).

### 4.3. Subscribers Mode

- When `subscribersMode` is active, any attempt to modify a reactive item throws an error. This prevents re‑entrancy and infinite loops.
- `runInAction` defers mutations until after subscribers finish by listening to `subscribersModeEnd`.

---

## 5. Store and ReactiveList Implementation Details

### 5.1. Store

- Internally uses two maps: `#items` (ReactiveItem) and `#childStores` (Store).
- Each item or store is assigned a key. The Store wraps its own `subscribeController` (via event emitter) and forwards updates from child items.
- When a child item changes, it notifies the Store, which collects the update and passes it to its own subscribers as a dot‑separated path (`childStoreName.localKey`).
- `muteUpdates()` and `unmuteUpdates()` temporarily suppress notifications.
- `serialize()` / `hydrate(data)` implement the recursive snapshot protocol (see §15).

**Example:**

```js
import { Store, atom, computed } from '@supercat1337/store2';

const store = new Store();
const count = atom(0);
const doubled = computed(() => count.value * 2);
store.addItems({ count, doubled });

store.subscribe(updates => {
    console.log('Store changed:', Array.from(updates.keys()));
});

count.value = 5; // logs: Store changed: ['count', 'doubled']
```

### 5.2. ReactiveList

- Uses a `Store` internally to hold items indexed by string (e.g., `"0"`, `"1"`).
- Maintains a separate `Atom` for `length`.
- When items are added, they are wrapped in `Atom` (for primitives) or `ShallowReactive` (for objects/arrays). Each wrapper receives a `path` equal to its stringified index.
- Mutations (add, set, remove, splice) are batched using `muteUpdates()`/`unmuteUpdates()` on the internal Store to emit only one notification per operation.
- `serialize()` returns `{ type: 'list', value: [...] }`; `hydrate(data)` delegates to `setItems`.

**Example:**

```js
import { ReactiveList } from '@supercat1337/store2';

const list = new ReactiveList();
list.subscribe(() => console.log('List changed'));

list.add('a', 'b', 'c'); // internal store gets keys '0','1','2'
list.setItem(1, 'x'); // updates value at index 1
list.removeItem(0); // removes first item, reindexes
console.log(list.toArray()); // ['x', 'c']
```

---

## 6. Error Handling

- Computed functions that throw are caught, and the error is stored in `engine.error` with the computed's name as a prefix.
- The computed will re‑throw that error on subsequent reads until dependencies change.
- Errors propagate to dependents via `EngineMessages.HAS_ERROR` and are emitted on the context's plugins as `onError`.
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

**Additional guidance:**

- For large collections (>10,000 items), prefer `Collection` over `ShallowReactive` for arrays to avoid proxy overhead on each element.
- Avoid deep `compareFunction` in `computed` – use immutable updates instead.
- Use `batch()` for bulk updates to reduce notification overhead.
- The `passUpdates` option in `reaction` introduces a small overhead of collecting updates into a `Map`. This is negligible for most use cases, but for extremely high‑frequency updates, consider setting `passUpdates: false` if you don't need the update details.

---

## 9. Testing Strategy

- Unit tests cover each reactive primitive, containers, and API functions.
- Integration tests verify batching, dependency tracking, and error propagation.
- The library is designed to be fully deterministic; IDs are assigned sequentially to ensure consistent ordering.
- Context isolation is the recommended way to write tests: create a fresh `Store2Context` for each test case and run all setup inside `runWithContext(ctx, () => { ... })`.

---

## 10. Core Architectural Invariants (Guards for AI)

When modifying code or writing complex workflows, ensure these core engine rules are strictly followed:

1. **No Mutations in Subscribers (State Lockdown):** Modifying any reactive state inside a `subscribe()` callback or during the notification phase is strictly forbidden. It will throw an error due to `subscribersMode` being active. Use `runInAction()` to defer side-effect mutations.
2. **Zombie State Prevention:** Once `destroy()` is invoked on a `ReactiveItem`, its entire engine graph is torn down. Any subsequent operations (reads/writes) except `isDestroyed` must check for lifecycle validity and will throw errors if handled incorrectly.
3. **Deterministic Graph Sorting:** The context‑local `changedItemsController` relies on the deterministic, sequential numeric `id` generated by the context's `idService` to sort elements before firing subscribers. Never bypass or manually mock item IDs in production tracks.

---

## 11. Common Pitfalls for AI-Generated Code

When generating code that uses `store2`, be aware of these frequent mistakes to avoid bugs and unexpected behavior:

1. **Mutating nested objects directly**  
   ❌ `user.value.profile.age = 26` – does not trigger reactivity.  
   ✅ Always use immutable updates: `user.value = { ...user.value, profile: { ...user.value.profile, age: 26 } }`  
   Or use `makeAutoObservable` for deep reactivity.

2. **Destructuring reactive values**  
   ❌ `const { value } = atom` – breaks reactivity.  
   ✅ Always use `atom.value` directly in tracked contexts (autorun, computed, reaction).

3. **Forgetting to return a new array from `computed` that depends on `Collection`**  
   ❌ `computed(() => collection.value.filter(...))` – won't update because the proxy reference stays the same.  
   ✅ `computed(() => [...collection.value.filter(...)])` – returns a new array.

4. **Modifying state inside `subscribe()`**  
   ❌ `atom.subscribe(() => { anotherAtom.value = ... })` – throws because `subscribersMode` is active.  
   ✅ Use `runInAction(() => { anotherAtom.value = ... })` to defer the mutation.

5. **Conditional dependencies in `autorun` / `reaction`**  
   ❌ `autorun(() => { if (flag.value) { use(a.value) } })` – if `flag` is `false` on the first run, `a` is not yet tracked. When `flag` later becomes `true`, the effect re‑runs (because `flag` is tracked) and `a` will then be added to the dependency set. However, changes to `a` that occur **before** `flag` becomes `true` will **not** trigger the effect. This behaviour is often desired, but if you need `a` to be tracked regardless of `flag`, restructure your code to read `a` unconditionally (e.g., using a `computed` that always reads `a` but returns a conditional value).

6. **Not cleaning up subscriptions**  
   ❌ Subscribing without storing the unsubscribe function can cause memory leaks.  
   ✅ Store the returned unsubscribe function and call it when the component/effect is disposed.

7. **Using `peekValue()` inside an `autorun`**  
   ❌ `autorun(() => { console.log(atom.peekValue()) })` – this does NOT track the atom, so changes won't trigger the effect.  
   ✅ Use `.value` to establish a dependency.

8. **Assuming `batch()` automatically returns a promise**  
   ❌ `await batch(() => { ... })` – `batch` is synchronous and does not return a promise.  
   ✅ Use `batch` synchronously; for async workflows, call `batch` inside async functions.

9. **Confusing `autorun` and `reaction` for updates**  
   ❌ `autorun(() => { console.log('changed'); })` – does **not** receive `updates`.  
   ✅ Use `reaction` with `passUpdates: true` (the default) to get a `Map` of changes:
    ```js
    reaction(
        () => [a.value, b.value],
        updates => {
            console.log('Changed keys:', Array.from(updates.keys()));
        }
    );
    ```

---

## 12. Store2Context

A **context** owns the services that drive reactivity. Every `Engine`
captures a context reference at construction time. All coordination — ID
generation, batch/subscriber modes, dependency tracking, change propagation
— goes through that context.

### Why contexts exist

Chunks A and B converted the four global singletons (`IdService`,
`ModeControllerService`, `Tracker`, `ChangedItemsController`) into
classes. A context is the bundle of one instance of each, plus the plugin
and root registries.

This gives four things that were impossible with process-wide singletons:

1. **SSR request isolation.** Each request gets its own context. State from
   one request never leaks into another.
2. **Parallel tests.** Tests create a fresh context and never pollute each
   other.
3. **Multiple root stores.** An embedded widget and the host page can each
   own a context, with independent IDs, batches, and subscriptions.
4. **DevTools scoping.** A DevTools plugin attached to one context does not
   observe updates from another.

### API

```js
import {
    createStore2Context,
    runWithContext,
    getCurrentContext,
    defaultContext,
} from '@supercat1337/store2';

const ctx = createStore2Context({ name: 'app' });

runWithContext(ctx, () => {
    const a = atom(0); // binds to ctx
    a.engine.context === ctx; // true
});

// Outside the run: reads use the default context again.
getCurrentContext() === defaultContext; // true
```

- `createStore2Context(options?)` — new isolated context. `name` is used in
  logs and DevTools. Service instances can be overridden for testing.
- `runWithContext(ctx, fn)` — installs `ctx` as the current context for the
  duration of `fn`. Restores the previous context even if `fn` throws.
  Nesting is safe.
- `getCurrentContext()` — returns the currently installed context, or the
  `defaultContext` if none is installed.
- `defaultContext` — a process-wide context whose services are the module
  singletons. Legacy code that imports `modeController`, `idService`, etc.
  directly continues to observe the same state as the context-aware engine.

### Context members

| Member                       | Purpose                                                    |
| ---------------------------- | ---------------------------------------------------------- |
| `idService`                  | Per-context monotonic ID generator.                        |
| `modeController`             | Batch depth, subscriber mode, `untrackMode`, action stack. |
| `dependencyTracker`          | Records reads during tracked executions.                   |
| `changedItemsController`     | Collects changed items, runs subscribers.                  |
| `use(plugin)`                | Installs a plugin.                                         |
| `addMiddleware(mw)`          | Registers an action middleware.                            |
| `batch(nameOrFn, fn?)`       | Named or unnamed batch.                                    |
| `action(name, fn, payload?)` | Named, async, middleware-aware action.                     |
| `flush()`                    | Runs pending subscribers synchronously.                    |
| `snapshot()`                 | Serializes all registered roots.                           |
| `hydrate(snap, opts?)`       | Applies a snapshot inside one batch.                       |
| `registerRoot(name, root)`   | Registers a root for snapshot/hydrate.                     |
| `unregisterRoot(name)`       | Removes a root.                                            |
| `getRootNames()`             | Lists registered roots.                                    |
| `emitPlugin(hook, ...args)`  | Invokes a hook on every installed plugin.                  |
| `dispose()`                  | Clears plugins, middlewares, and roots.                    |

> **Note:** The service fields (`idService`, `modeController`,
> `dependencyTracker`, `changedItemsController`) are exposed because
> internal packages and plugins need them. Application code should prefer
> the context's own methods — `action`, `batch`, `snapshot`, `hydrate`,
> `registerRoot`, `flush` — rather than touching services directly.

---

## 13. Plugins

A plugin is an object with a `name`, an `install(context)` method, and any
subset of lifecycle hooks. Plugins are installed with `ctx.use(plugin)`.
Hooks are dispatched by `context.emitPlugin(hook, ...args)`.

### Hook contract

```ts
interface Store2Plugin {
    name: string;
    install(context: Store2Context): void;

    onActionStart?(action: ActionInfo): void;
    onActionEnd?(action: ActionInfo): void;

    onBatchStart?(info: BatchInfo): void;
    onBatchEnd?(info: BatchInfo): void;

    onUpdate?(item: ReactiveItem, property: string, record: UpdateDataRecord): void;
    onComputedRecalc?(item: ReactiveItem, oldValue: any, newValue: any): void;
    onSubscriberRun?(item: ReactiveItem, updates: Map<string, UpdateDataRecord>): void;

    onDestroy?(item: ReactiveItem): void;
    onError?(item: ReactiveItem, error: Error): void;
}
```

### Emission points

| Hook                            | Emitted from                                                                       |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| `onUpdate`                      | `Engine.addUpdate()` — for each effective change.                                  |
| `onComputedRecalc`              | `Computed.#calc()` — after a real value change.                                    |
| `onError`                       | `Engine.setError()` — when a computed's error propagates.                          |
| `onDestroy`                     | `Engine.destroy()` — after teardown completes.                                     |
| `onSubscriberRun`               | `ChangedItemsController.runSubscribers()` — before invoking each subscriber.       |
| `onActionStart` / `onActionEnd` | Forwarded from `ModeControllerService`'s `actionStart` / `actionEnd` events.       |
| `onBatchStart` / `onBatchEnd`   | Forwarded from `ModeControllerService`'s `batchModeStart` / `batchModeEnd` events. |

### Error isolation

Plugin errors are caught and logged via `console.error`. A plugin cannot
break reactivity by throwing. This is enforced by `context.emitPlugin()`.

### Suspension during time-travel

When `context.hydrate(snapshot, { timeTravel: true })` is active, plugin
hooks are silently ignored. This lets a DevTools plugin call `hydrate()`
without recording the rehydration as a new action.

Subscribers still run — the UI must update — but plugin hooks do not.

---

## 14. Actions and Middleware

Actions are the unit of work that DevTools, logger, and time-travel plugins
reason about.

Every action has an `ActionInfo`. While the action body is running, it is
the _current action_ of the context's mode controller, accessible via
`context.modeController.currentAction`. Nested actions push onto an
internal stack and expose the parent's id via `ActionInfo.parentId`. The
stack is emptied as each action ends.

### ActionInfo

```ts
interface ActionInfo {
    id: string; // "1", "2", ...
    name: string; // human-readable, e.g. "add todo"
    payload: any; // optional
    parentId: string | null; // nested actions record their parent
    startTime: number; // Date.now()
    endTime: number | null;
    error: Error | null;
}
```

### Running an action

```js
await ctx.action('add todo', async action => {
    todos.value = [...todos.value, newTodo];
});
```

`action` returns a promise. The body may be synchronous or async; the
action remains on the stack until the promise settles. On error, the error
is attached to `ActionInfo.error` before propagation.

### Middleware

```js
ctx.addMiddleware(async (action, next) => {
    console.log('→', action.name);
    try {
        return await next();
    } finally {
        console.log('←', action.name);
    }
});
```

Middleware form a Koa-style chain. Each middleware receives the `ActionInfo`
and a `next()` callback. Calling `next()` invokes the next middleware; the
last one invokes the action body. Not calling `next()` short-circuits the
action. Calling `next()` more than once throws.

Middleware run in registration order. `addMiddleware` may be called before
or after the first action; only actions started after registration see the
new middleware.

### Batch names

`ctx.batch(name, fn)` passes `name` to `ModeControllerService.enterBatch`.
Plugins receive it in `BatchInfo.name`. For nested batches, the outermost
name wins and is recorded for the entire lifetime of the batch. The name
is cleared only after `batchModeEnd` listeners have run, so `onBatchEnd`
sees the correct name.

---

## 15. Serialization and Time-Travel

Every reactive item implements `serialize(): any` and `hydrate(data): void`.
`Computed` returns `null` from `serialize()` — derived state is never
persisted; it recalculates from its restored dependencies.

### Per-item protocol

| Item              | `serialize()` output                             | `hydrate(data)` behaviour             |
| ----------------- | ------------------------------------------------ | ------------------------------------- |
| `Atom`            | `{ type: 'atom', value }`                        | Sets `.value`.                        |
| `Collection`      | `{ type: 'collection', value: [...] }`           | Sets `.value` to a shallow copy.      |
| `ShallowReactive` | `{ type: 'shallowReactive', value: {...} }`      | Sets `.value` to a shallow copy.      |
| `Computed`        | `null`                                           | No-op.                                |
| `Store`           | `{ type: 'store', items: {...}, stores: {...} }` | Recurses into items and child stores. |
| `ReactiveList`    | `{ type: 'list', value: [...] }`                 | Calls `setItems`.                     |

Keys not present in the snapshot are left untouched. Keys in the snapshot
not present in the current tree are silently ignored. Malformed snapshots
(`null`, wrong `type`) are no-ops, not errors.

### Context snapshot format

```ts
interface ContextSnapshot {
    version: number; // currently 1
    timestamp: number; // Date.now() at capture
    roots: { [name: string]: any }; // each root's serialize() output
}
```

### Roots

Nothing is snapshotted unless it is registered:

```js
ctx.registerRoot('app', store);
ctx.registerRoot('todos', todosList);

const snap = ctx.snapshot();
// { version: 1, timestamp, roots: { app: {...}, todos: {...} } }
```

Registering a root requires `serialize()` and `hydrate(data)`. Both `Store`
and `ReactiveList` satisfy this out of the box.

### Hydration

```js
ctx.hydrate(snap); // normal restore
ctx.hydrate(snap, { timeTravel: true }); // DevTools rewind
```

`hydrate` runs entirely inside one batch, so subscribers fire once per
root regardless of how many properties changed. Nested stores compose into
a single notification because `Store.subscribe` forwards from children.

### Time-travel semantics

`{ timeTravel: true }` suspends plugin hooks for the duration of the
hydration. Subscribers still run. This is the mechanism DevTools uses to
rewind without recording the rewind as a new action.

### Persistence

For `localStorage` / `IndexedDB` / SSR transport, the snapshot is JSON-safe
by construction — every `serialize()` returns plain objects, arrays, and
primitives. Encode and decode with `JSON.stringify` / `JSON.parse`.

Migration logic (schema versions, shape changes) belongs in the persistence
adapter (`store2-persist`), not in the core. The core only guarantees the
`version` field so adapters can dispatch on it.

---

## 16. DevTools

DevTools live in a separate package: `@supercat1337/store2-devtools`.

The core provides the primitives the package needs:

- `Store2Plugin` interface with lifecycle hooks (`onActionStart/End`,
  `onBatchStart/End`, `onUpdate`, `onComputedRecalc`, `onSubscriberRun`,
  `onDestroy`, `onError`).
- `Store2Context.snapshot()` / `hydrate()` for state capture and
  time-travel.
- `Store2Context.dumpGraph()` for dependency-graph introspection.
- `PLUGIN_API_VERSION` for compatibility checks.

The DevTools package uses only these public APIs. It never touches
`Engine` internals, `SubscribeController`, or `ChangedItemsController`
directly. This keeps the core free of UI concerns and lets DevTools
evolve on its own release cycle.

See `@supercat1337/store2-devtools` for the reference implementation.

---

## 17. Additional Architectural Invariants

Extend §10 with the following rules. They are as load-bearing as the ones
already listed.

4. **Context binding is permanent.** Once an `Engine` captures a context
   in its constructor, that binding never changes. Reactive items created
   inside `runWithContext(A, () => ...)` belong to `A` for their entire
   lifetime, even if read outside the run. To relocate an item, recreate
   it.

5. **Plugin hooks are advisory.** A plugin must never assume its hook will
   run at a specific time, or at all. `emitPlugin` suspends hooks during
   time-travel. Hooks may be added or removed by installing another plugin.
   Plugins that need persistent state (e.g. DevTools history) must own it
   themselves.

6. **Serialization is lossy for computed values.** `Computed.serialize()`
   returns `null` by design. Never persist derived state; recalculate it.
   A `Store.serialize()` output is not a full state dump — it is the
   minimum needed for `hydrate()` to reconstruct observable state.

7. **Time-travel must be idempotent.** Calling `hydrate(snap, { timeTravel:
true })` twice with the same snapshot must produce the same observable
   state. If your item type violates this (e.g. it counts hydration calls),
   it is a bug.

---

## 18. Additional Common Pitfalls

Add these to §11.

10. **Creating reactive items outside `runWithContext`.** ⚠️ `atom(0)` at
    module top level binds to `defaultContext`. If the surrounding code is
    rendered per-request on the server, all requests share the same atom.
    ✅ Always create items inside `runWithContext(ctx, () => ...)` when the
    context is request-scoped.

11. **Forgetting to register roots.** ⚠️ `ctx.snapshot()` returns
    `{ roots: {} }` if no roots are registered. `ctx.hydrate()` silently
    does nothing. ✅ Call `ctx.registerRoot(name, store)` before snapshot.
    Register **after** `addItems()`, so the baseline captures the initial
    state.

12. **Calling `jumpTo` outside an action.** ⚠️ A `jumpTo` that is not
    wrapped in an action will not be recorded in the DevTools history. If
    you want the jump itself to appear as an action, wrap it:
    `await ctx.action('jump to 3', () => devtools.jumpTo(3))`. Otherwise,
    jumpTo performs a silent rewind, which is usually what you want.

13. **Persisting `Computed` values via `toJSON()`.** ⚠️ `Store.toJSON()`
    still includes computed values for backward compatibility.
    `Store.serialize()` does not. Persist with `serialize()`, not
    `toJSON()`. If you need `toJSON()`-style output for a non-persistence
    reason (e.g. logging), it is fine.

14. **Reusing a disposed context.** ⚠️ `context.dispose()` clears plugins,
    middlewares, and roots, and makes further `use` / `addMiddleware` /
    `registerRoot` calls throw. ✅ `dispose()` is terminal. Create a new
    context if you need to reset. `dispose()` is idempotent.

15. **Assuming `defaultContext` is empty.** ⚠️ The default context shares
    the module singletons. Items created at module top level (without a
    context) live in it. In tests, prefer `createStore2Context()` for
    isolation.

By following these guidelines, AI-generated code will work correctly and efficiently with `store2`.

---

This document should serve as a concise reference for understanding the internal workings of `@supercat1337/store2`. For API usage, refer to the main README and the full documentation.
