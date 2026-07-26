## Comparison: store2 vs MobX

Both libraries solve the same problem — reactive state management. They are inspired by the same principles but implement them differently.

---

### Similarities

- **Reactive primitives**:  
  Both libraries have the concept of a reactive value (MobX: `observable.box`, store2: `Atom`), computed values (`computed`), and reactions (`autorun`, `reaction`, `when`).

- **Batched updates**:  
  `batch` in store2 and `action`/`runInAction` in MobX allow grouping changes so that notifications are sent only once.

- **Observable objects and classes**:  
  Both libraries provide ways to make existing objects and classes reactive via `makeObservable` and `makeAutoObservable`.

- **Unsubscriptions and lifecycle**:  
  Subscriptions can be cancelled using returned functions or `AbortSignal`. Both support `onHasSubscribers` / `onNoSubscribers` for resource management.

- **Asynchronous support**:  
  Both libraries support promises, though the approaches differ.

---

### Differences

| Aspect                      | MobX                                                                                                                                | store2                                                                                                                                           |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Core approach**           | **Transparent reactivity** – any object/class can be made observable; changes are tracked automatically via proxies and decorators. | **Explicit reactive containers** – users create `Atom`, `Computed`, `Collection`, `Store`, etc. Reactivity only arises through these containers. |
| **Deep reactivity**         | All properties of an object are reactive at all nesting levels by default.                                                          | Only top‑level properties are reactive by default (via `ShallowReactive`); nested objects require manual wrapping or `makeObservable`.           |
| **Arrays**                  | `observable.array` provides a familiar array with all methods (push, pop, splice).                                                  | Two approaches: `Collection` (proxy‑based array, similar to MobX) and `ReactiveList` (list with add/setItem/remove, designed for objects).       |
| **React integration**       | Official package `mobx-react` provides `useObserver`, `observer` HOC, ready‑to‑use hooks.                                           | No built‑in integration; can be used manually via `useEffect` and `subscribe`.                                                                   |
| **Decorators**              | Supported (`@observable`, `@computed`, `@action`).                                                                                  | Not supported; only `makeObservable` / `makeAutoObservable`.                                                                                     |
| **DevTools**                | MobX DevTools (browser extension) with visual dependency graph, action debugging, and tracing.                                      | No DevTools; only manual logging.                                                                                                                |
| **Asynchronous operations** | `flow` — generators for async actions with automatic cancellation.                                                                  | `fromPromise` — wrapper around Promise with reactive states; async actions need manual implementation with `async/await` and `runInAction`.      |
| **Strict mode**             | Can enable `enforceActions: "always"`, prohibiting mutations outside actions.                                                       | Only blocks mutations during notifications (`subscribersMode`); no global enforcement.                                                           |
| **Size**                    | ~15 KB (minified) plus optional React‑integration packages.                                                                         | ~10 KB + one tiny dependency (`@supercat1337/event-emitter`).                                                                                    |
| **Dependencies**            | No external dependencies (except optional React packages).                                                                          | One dependency (event emitter).                                                                                                                  |
| **Maturity and ecosystem**  | Stable, widely adopted, many examples, plugins, and integrations.                                                                   | Young library; ecosystem is still evolving.                                                                                                      |

---

### When to choose MobX

- You need **deep reactivity** out of the box.
- Your project uses React and you want ready‑made integration.
- You are comfortable with decorators and the “magic” of MobX.
- You need powerful debugging, DevTools, and strict control.
- You are working on a large enterprise application with complex relationships.

---

### When to choose store2

- You prefer **explicit data structures** and want to control exactly what is reactive.
- You need a lightweight library with minimal dependencies and small bundle size.
- You work in environments where React integration is not required (Vanilla JS, Node.js, other frameworks).
- You value simplicity and predictability over “magic”.
- You are building a library or plugin and don't want to drag heavy dependencies.

---

### Conclusion

`store2` is a **lightweight alternative to MobX** that preserves the core principles of reactivity but makes them more explicit and controllable. It fits about 80% of use cases where reactivity is needed without excessive complexity. MobX remains the better choice for complex enterprise applications and projects with deep relationships, where debugging and scalability are critical.

Ultimately, the choice depends on your preferences and project requirements. If you need power and flexibility — choose MobX. If you want lightness, simplicity, and control — store2 is an excellent option.
