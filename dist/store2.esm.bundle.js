// src/services/idService.js
var IdService = class {
  /** @type {number} */
  #counter = 0;
  /**
   * Generates a new unique numeric identifier.
   * @returns {number} A monotonic unique number.
   */
  generateId() {
    return this.#counter++;
  }
  /**
   * Compares two numeric identifiers.
   * @param {number} a
   * @param {number} b
   * @returns {number} -1 if a < b, 1 if a > b, 0 if equal.
   */
  compareIds(a, b) {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  }
  /**
   * Resets the internal counter. Useful in tests.
   */
  reset() {
    this.#counter = 0;
  }
};
var idService = new IdService();

// node_modules/@supercat1337/event-emitter/src/event-emitter-lite.js
var ORIGINAL = /* @__PURE__ */ Symbol("original");
var EventEmitterLite = class {
  /**
   * @type {Object.<Events extends string | symbol ? Events : keyof Events, Function[]>}
   */
  events = /* @__PURE__ */ Object.create(null);
  /**
   * @type {Function[]}
   * List of listeners that will be invoked for every emitted event.
   * Each listener receives (eventName, ...args).
   */
  anyListeners = [];
  /**
   * logErrors indicates whether errors thrown by listeners should be logged to the console.
   * @type {boolean}
   */
  logErrors = true;
  /**
   * on is used to add a callback function that's going to be executed when the event is triggered
   * @template {Events extends string | symbol ? Events : keyof Events} K
   * @param {K} event
   * @param {Function} listener
   * @param {{ signal?: AbortSignal }} [options]
   * @returns {() => void}
   */
  on(event, listener, options = {}) {
    if (typeof listener !== "function") {
      throw new TypeError("listener must be a function");
    }
    const { signal } = options;
    if (signal?.aborted) {
      return () => {
      };
    }
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    const cleanup = () => {
      this.removeListener(event, listener);
      signal?.removeEventListener("abort", cleanup);
    };
    if (signal) {
      signal.addEventListener("abort", cleanup, { once: true });
    }
    return cleanup;
  }
  /**
   * Add a one-time listener
   * @template {Events extends string | symbol ? Events : keyof Events} K
   * @param {K} event
   * @param {Function} listener
   * @param {{ signal?: AbortSignal }} [options]
   * @returns {()=>void}
   */
  once(event, listener, options = {}) {
    if (typeof listener !== "function") {
      throw new TypeError("listener must be a function");
    }
    const { signal } = options;
    if (signal?.aborted) {
      return () => {
      };
    }
    let cleanup;
    const wrapper = (...args) => {
      if (cleanup) {
        cleanup();
      }
      listener.apply(this, args);
    };
    wrapper[ORIGINAL] = listener;
    cleanup = this.on(event, wrapper, options);
    return cleanup;
  }
  /**
   * off is an alias for removeListener
   * @template {Events extends string | symbol ? Events : keyof Events} K
   * @param {K} event
   * @param {Function} listener
   */
  off(event, listener) {
    return this.removeListener(event, listener);
  }
  /**
   * Remove an event listener from an event
   * @template {Events extends string | symbol ? Events : keyof Events} K
   * @param {K} event
   * @param {Function} listener
   */
  removeListener(event, listener) {
    if (typeof listener !== "function") return;
    const listeners = this.events[event];
    if (!listeners) return;
    const idx = listeners.findIndex((l) => l === listener || l[ORIGINAL] === listener);
    if (idx > -1) {
      listeners.splice(idx, 1);
      if (listeners.length === 0) delete this.events[event];
    }
  }
  /**
   * Adds a listener that will be invoked for every emitted event.
   * @param {Function} listener - The callback (eventName, ...args) => void.
   * @param {{ signal?: AbortSignal }} [options]
   * @returns {() => void}
   */
  onAny(listener, options = {}) {
    if (typeof listener !== "function") {
      throw new TypeError("listener must be a function");
    }
    const { signal } = options;
    if (signal?.aborted) {
      return () => {
      };
    }
    this.anyListeners.push(listener);
    const cleanup = () => {
      this.offAny(listener);
      signal?.removeEventListener("abort", cleanup);
    };
    if (signal) {
      signal.addEventListener("abort", cleanup, { once: true });
    }
    return cleanup;
  }
  /**
   * Removes a listener added via onAny.
   * @param {Function} listener - The listener function to remove.
   */
  offAny(listener) {
    const idx = this.anyListeners.indexOf(listener);
    if (idx > -1) {
      this.anyListeners.splice(idx, 1);
    }
  }
  /**
   * emit is used to trigger an event
   * @template {Events extends string | symbol ? Events : keyof Events} K
   * @param {K} event
   * @param {...any} args
   */
  emit(event, ...args) {
    const listeners = this.events[event];
    if (listeners) {
      const queue = listeners.slice();
      const length = queue.length;
      for (let i = 0; i < length; i++) {
        try {
          queue[i].apply(this, args);
        } catch (e) {
          if (this.logErrors) {
            console.error(`Error in listener for event "${String(event)}":`, e);
          }
        }
      }
    }
    this._emitAny(event, args);
  }
  /**
   * Protected method to invoke any-listeners.
   * @param {string | symbol} event
   * @param {any[]} args
   * @protected
   */
  _emitAny(event, args) {
    const anyListeners = this.anyListeners;
    if (anyListeners.length > 0) {
      const anyQueue = anyListeners.slice();
      const eventName = String(event);
      for (let i = 0; i < anyQueue.length; i++) {
        try {
          anyQueue[i].apply(this, [eventName, ...args]);
        } catch (e) {
          if (this.logErrors) {
            console.error(`Error in any-listener for event "${eventName}":`, e);
          }
        }
      }
    }
  }
  /**
   * Checks if an event has any listeners.
   * @param {Events extends string | symbol ? Events : keyof Events} event
   * @returns {boolean}
   */
  hasListeners(event) {
    const listeners = this.events[event];
    return !!(listeners && listeners.length > 0);
  }
  /**
   * Returns the number of listeners for a specific event.
   * @param {Events extends string | symbol ? Events : keyof Events} event
   * @returns {number}
   */
  listenerCount(event) {
    const listeners = this.events[event];
    return listeners ? listeners.length : 0;
  }
  /**
   * Returns an array of event names that have at least one listener (including Symbols).
   * @returns {(Events extends string | symbol ? Events : keyof Events)[]}
   */
  eventNames() {
    return Reflect.ownKeys(this.events);
  }
  /**
   * Returns a copy of the listeners array for the specified event.
   * @param {Events extends string | symbol ? Events : keyof Events} event
   * @returns {Function[]}
   */
  getListeners(event) {
    const listeners = this.events[event];
    return listeners ? listeners.slice() : [];
  }
  /**
   * Removes all listeners from all events.
   * @returns {void}
   */
  removeAllListeners() {
    this.events = /* @__PURE__ */ Object.create(null);
  }
  /**
   * Alias for removeAllListeners().
   * @deprecated Use removeAllListeners() instead.
   * @returns {void}
   */
  clear() {
    return this.removeAllListeners();
  }
  /**
   * Removes all listeners for a specific event.
   * Does not affect any-listeners.
   * @param {Events extends string | symbol ? Events : keyof Events} event
   * @returns {void}
   */
  removeAllListenersOf(event) {
    if (this.events[event]) {
      delete this.events[event];
    }
  }
};

// node_modules/@supercat1337/event-emitter/src/event-emitter.js
var HAS_LISTENERS = /* @__PURE__ */ Symbol("has-listeners");
var NO_LISTENERS = /* @__PURE__ */ Symbol("no-listeners");
var LISTENER_ERROR = /* @__PURE__ */ Symbol("listener-error");
var EventEmitter = class extends EventEmitterLite {
  /**
   * @type {EventEmitterLite<typeof HAS_LISTENERS | typeof NO_LISTENERS | typeof LISTENER_ERROR>}
   */
  #internalEvents = new EventEmitterLite();
  /**
   * @type {Map<string|symbol, Array<{ internalEvent: typeof HAS_LISTENERS | typeof NO_LISTENERS | typeof LISTENER_ERROR, handler: Function }>>}
   */
  #internalListenersMap = /* @__PURE__ */ new Map();
  #isDestroyed = false;
  #isReportingError = false;
  constructor() {
    super();
    this.#internalEvents.logErrors = false;
  }
  /**
   * @type {boolean}
   */
  get isDestroyed() {
    return this.#isDestroyed;
  }
  /**
   * @template {Events extends string | symbol ? Events : keyof Events} K
   * @param {K} event
   * @param {Function} listener
   * @param {{ signal?: AbortSignal }} [options]
   * @returns {() => void}
   */
  on(event, listener, options = {}) {
    if (this.#isDestroyed) throw new Error("EventEmitter is destroyed");
    const hadListeners = this.hasListeners(event);
    const unsubscriber = super.on(event, listener, options);
    if (!hadListeners && this.hasListeners(event)) {
      this.#emitInternal(HAS_LISTENERS, event);
    }
    return unsubscriber;
  }
  /**
   * @template {Events extends string | symbol ? Events : keyof Events} K
   * @param {K} event
   * @param {Function} listener
   */
  removeListener(event, listener) {
    if (typeof listener !== "function") return;
    if (this.#isDestroyed || !this.events[event]) return;
    super.removeListener(event, listener);
    if (!this.events[event]) {
      this.#emitInternal(NO_LISTENERS, event);
    }
  }
  /**
   * @param {typeof HAS_LISTENERS | typeof NO_LISTENERS | typeof LISTENER_ERROR} internalEvent
   * @param {Function} listener
   * @param {string|symbol} [externalEvent]
   * @returns {()=>void}
   */
  #onInternalEvent(internalEvent, listener, externalEvent) {
    const unsub = this.#internalEvents.on(internalEvent, listener);
    if (externalEvent !== void 0) {
      if (!this.#internalListenersMap.has(externalEvent)) {
        this.#internalListenersMap.set(externalEvent, []);
      }
      const entries = this.#internalListenersMap.get(externalEvent);
      if (entries) {
        entries.push({ internalEvent, handler: listener });
      }
    }
    return () => {
      unsub();
      if (externalEvent !== void 0) {
        const entries = this.#internalListenersMap.get(externalEvent);
        if (entries) {
          const idx = entries.findIndex(
            (entry) => entry.handler === listener && entry.internalEvent === internalEvent
          );
          if (idx > -1) {
            entries.splice(idx, 1);
            if (entries.length === 0) {
              this.#internalListenersMap.delete(externalEvent);
            }
          }
        }
      }
    };
  }
  /**
   * @template {Events extends string | symbol ? Events : keyof Events} K
   * @param {K} event
   * @param {...any} args
   */
  emit(event, ...args) {
    if (this.#isDestroyed) return;
    const listeners = this.events[event];
    if (listeners) {
      const queue = listeners.slice();
      for (let i = 0; i < queue.length; i++) {
        try {
          queue[i].apply(this, args);
        } catch (e) {
          this.#emitInternal(LISTENER_ERROR, e, event, ...args);
          if (this.logErrors) {
            console.error(`Error in listener for event "${String(event)}":`, e);
          }
        }
      }
    }
    this._emitAny(event, args);
  }
  /**
   * Override to catch errors in any-listeners and emit LISTENER_ERROR.
   * @param {string | symbol} event
   * @param {any[]} args
   * @protected
   */
  _emitAny(event, args) {
    const anyListeners = this.anyListeners;
    if (anyListeners.length === 0) return;
    const anyQueue = anyListeners.slice();
    const eventName = String(event);
    for (let i = 0; i < anyQueue.length; i++) {
      try {
        anyQueue[i].apply(this, [eventName, ...args]);
      } catch (e) {
        this.#emitInternal(LISTENER_ERROR, e, event, ...args);
        if (this.logErrors) {
          console.error(`Error in any-listener for event "${eventName}":`, e);
        }
      }
    }
  }
  /**
   * @param {typeof HAS_LISTENERS | typeof NO_LISTENERS | typeof LISTENER_ERROR} event
   * @param {...any} args
   */
  #emitInternal(event, ...args) {
    const listeners = this.#internalEvents.events[event];
    if (!listeners || listeners.length === 0) return;
    const queue = listeners.slice();
    for (const fn of queue) {
      try {
        fn.apply(this, args);
      } catch (e) {
        if (event === LISTENER_ERROR || this.#isReportingError) {
          if (this.logErrors) {
            console.error("Critical error in internal listener:", e);
          }
          continue;
        }
        this.#isReportingError = true;
        try {
          this.#emitInternal(LISTENER_ERROR, e, event, ...args);
        } finally {
          this.#isReportingError = false;
        }
      }
    }
  }
  /**
   * @template {Events extends string | symbol? Events : keyof Events} K
   * @param {K} event
   * @param {number} [max_wait_ms=0]
   * @returns {Promise<boolean>}
   */
  waitForEvent(event, max_wait_ms = 0) {
    return this.waitForAnyEvent([event], max_wait_ms);
  }
  /**
   * @template {Events extends string | symbol? Events : keyof Events} K
   * @param {K[]} events
   * @param {number} [max_wait_ms=0]
   * @returns {Promise<boolean>}
   */
  waitForAnyEvent(events, max_wait_ms = 0) {
    if (this.#isDestroyed) throw new Error("EventEmitter is destroyed");
    if (!Array.isArray(events) || events.length === 0) {
      return Promise.resolve(false);
    }
    return new Promise((resolve) => {
      let timeout;
      const unsubscribers = [];
      const cleanup = () => {
        if (timeout) clearTimeout(timeout);
        unsubscribers.forEach((u) => u());
      };
      const onEvent = () => {
        cleanup();
        resolve(true);
      };
      const uniqueEvents = [...new Set(events)];
      uniqueEvents.forEach((event) => {
        unsubscribers.push(this.on(event, onEvent));
      });
      if (max_wait_ms > 0) {
        timeout = setTimeout(() => {
          cleanup();
          resolve(false);
        }, max_wait_ms);
      }
    });
  }
  /**
   * @param {{ removeInternalListeners?: boolean }} [options]
   * @returns {void}
   */
  removeAllListeners(options = {}) {
    if (this.#isDestroyed) return;
    const { removeInternalListeners = false } = options;
    const eventNames = this.eventNames();
    super.removeAllListeners();
    for (const event of eventNames) {
      this.#emitInternal(NO_LISTENERS, event);
    }
    if (removeInternalListeners) {
      this.#clearAllInternalListeners();
    }
  }
  /**
   * @deprecated Use removeAllListeners() instead.
   * @returns {void}
   */
  clear() {
    return this.removeAllListeners();
  }
  /**
   * Destroys the event emitter.
   */
  destroy() {
    if (this.#isDestroyed) return;
    this.removeAllListeners({ removeInternalListeners: true });
    this.anyListeners = [];
    this.#internalEvents = new EventEmitterLite();
    this.#internalEvents.logErrors = false;
    this.#isDestroyed = true;
  }
  /**
   * @param {Events extends string | symbol ? Events : keyof Events} event
   * @returns {void}
   */
  removeAllListenersOf(event) {
    if (this.#isDestroyed) return;
    const hadListeners = this.hasListeners(event);
    super.removeAllListenersOf(event);
    if (hadListeners) {
      this.#emitInternal(NO_LISTENERS, event);
    }
  }
  /**
   * @deprecated Use removeAllListenersOf() instead.
   * @param {Events extends string | symbol ? Events : keyof Events} event
   * @returns {void}
   */
  clearEventListeners(event) {
    return this.removeAllListenersOf(event);
  }
  /**
   * @param {Events extends string | symbol ? Events : keyof Events} event
   * @returns {void}
   */
  removeAllInternalListenersOf(event) {
    if (this.#isDestroyed) return;
    const entries = this.#internalListenersMap.get(event);
    if (entries) {
      for (const { internalEvent, handler } of entries) {
        this.#internalEvents.removeListener(internalEvent, handler);
      }
      this.#internalListenersMap.delete(event);
    }
  }
  /**
   * @param {string|symbol} event
   * @param {Function} callback
   * @returns {()=>void}
   */
  onHasEventListeners(event, callback) {
    if (this.#isDestroyed) throw new Error("EventEmitter is destroyed");
    const handler = (emittedEvent, ...args) => {
      if (emittedEvent === event) {
        callback(emittedEvent, ...args);
      }
    };
    return this.#onInternalEvent(HAS_LISTENERS, handler, event);
  }
  /**
   * @param {string|symbol} event
   * @param {Function} callback
   * @returns {()=>void}
   */
  onNoEventListeners(event, callback) {
    if (this.#isDestroyed) throw new Error("EventEmitter is destroyed");
    const handler = (emittedEvent, ...args) => {
      if (emittedEvent === event) {
        callback(emittedEvent, ...args);
      }
    };
    return this.#onInternalEvent(NO_LISTENERS, handler, event);
  }
  /**
   * @param {Function} callback
   * @returns {()=>void}
   */
  onListenerError(callback) {
    if (this.#isDestroyed) throw new Error("EventEmitter is destroyed");
    return this.#onInternalEvent(LISTENER_ERROR, callback);
  }
  #clearAllInternalListeners() {
    for (const [key, entries] of this.#internalListenersMap) {
      for (const { internalEvent, handler } of entries) {
        this.#internalEvents.removeListener(internalEvent, handler);
      }
    }
    this.#internalListenersMap.clear();
  }
};

// src/services/modeController.js
var ModeControllerService = class {
  /** @type {boolean} */
  isComputing = false;
  /** @type {boolean} */
  throwErrorInSubscribers = true;
  /**
   * When `true`, tracked reads are suppressed. `untrack()` saves and
   * restores this value, so nesting is safe.
   * @type {boolean}
   */
  untrackMode = false;
  /** @type {number} */
  #batchDepth = 0;
  /** @type {string} */
  #currentBatchName = "";
  /** @type {boolean} */
  #subscribersMode = false;
  /** @type {Array<import('../types.js').ActionInfo>} */
  #actionStack = [];
  /** @type {number} */
  #actionCounter = 0;
  /** @type {EventEmitterLite<"batchModeStart"|"batchModeEnd"|"beforeBatchModeEnd">} @internal */
  batchModeEvents;
  /** @type {EventEmitterLite<"subscribersModeEnd">} @internal */
  subscribersModeEvents;
  /** @type {EventEmitterLite<"actionStart"|"actionEnd">} @internal */
  actionEvents;
  constructor() {
    this.batchModeEvents = new EventEmitterLite();
    this.subscribersModeEvents = new EventEmitterLite();
    this.actionEvents = new EventEmitterLite();
  }
  /**
   * Subscribes to a batch lifecycle event.
   * @param {"batchModeStart"|"batchModeEnd"|"beforeBatchModeEnd"} event
   * @param {() => void} callback
   * @returns {() => void}
   */
  on(event, callback) {
    return this.batchModeEvents.on(event, callback);
  }
  /**
   * Subscribes to an action lifecycle event.
   * @param {"actionStart"|"actionEnd"} event
   * @param {(action: import('../types.js').ActionInfo) => void} callback
   * @returns {() => void}
   */
  onAction(event, callback) {
    return this.actionEvents.on(event, callback);
  }
  /**
   * Returns true while the controller is inside a batch.
   * @returns {boolean}
   */
  get batchMode() {
    return this.#batchDepth > 0;
  }
  /**
   * Returns the current batch depth.
   * @returns {number}
   */
  get batchDepth() {
    return this.#batchDepth;
  }
  /**
   * Returns the name of the currently running outermost batch, or ''.
   * @returns {string}
   */
  get currentBatchName() {
    return this.#currentBatchName;
  }
  /**
   * Increments the batch depth. Emits `batchModeStart` on the first entry.
   * @param {string} [name] - Optional human-readable name for the batch.
   */
  enterBatch(name = "") {
    const wasInBatch = this.batchMode;
    this.#batchDepth++;
    if (name || !this.#currentBatchName) {
      this.#currentBatchName = name || this.#currentBatchName;
    }
    if (!wasInBatch) {
      this.batchModeEvents.emit("batchModeStart");
    }
  }
  /**
   * Decrements the batch depth. Emits `beforeBatchModeEnd`, then
   * `batchModeEnd` when leaving the outermost batch.
   */
  exitBatch() {
    if (this.#batchDepth === 0) {
      return;
    }
    const isLast = this.#batchDepth === 1;
    if (isLast) {
      this.batchModeEvents.emit("beforeBatchModeEnd");
    }
    this.#batchDepth--;
    if (isLast) {
      this.batchModeEvents.emit("batchModeEnd");
      this.#currentBatchName = "";
    }
  }
  /**
   * Returns true while subscribers are running.
   * @returns {boolean}
   */
  get subscribersMode() {
    return this.#subscribersMode;
  }
  /**
   * Marks the start of subscriber notification.
   */
  startSubscribersMode() {
    this.#subscribersMode = true;
  }
  /**
   * Marks the end of subscriber notification and flushes deferred callbacks.
   */
  endSubscribersMode() {
    if (!this.#subscribersMode) {
      return;
    }
    this.#subscribersMode = false;
    this.subscribersModeEvents.emit("subscribersModeEnd");
  }
  /**
   * Registers a callback to run once after subscribers finish.
   * @param {() => void} callback
   */
  runAfterSubscribers(callback) {
    this.subscribersModeEvents.once("subscribersModeEnd", callback);
  }
  /**
   * Returns the currently running action, or null if no action is in flight.
   * @returns {import('../types.js').ActionInfo | null}
   */
  get currentAction() {
    if (this.#actionStack.length === 0) {
      return null;
    }
    const last = this.#actionStack[this.#actionStack.length - 1];
    return (
      /** @type {import('../types.js').ActionInfo} */
      last
    );
  }
  /**
   * Starts a new named action.
   * @param {string} name
   * @param {any} [payload]
   * @returns {import('../types.js').ActionInfo}
   */
  beginAction(name, payload = void 0) {
    const parent = this.currentAction;
    const action2 = {
      id: String(++this.#actionCounter),
      name,
      payload,
      parentId: parent ? parent.id : null,
      startTime: Date.now(),
      endTime: null,
      error: null
    };
    this.#actionStack.push(action2);
    this.actionEvents.emit("actionStart", action2);
    return action2;
  }
  /**
   * Ends an action previously started with `beginAction`.
   * @param {import('../types.js').ActionInfo} action
   * @param {Error | null} [error]
   */
  endAction(action2, error = null) {
    action2.endTime = Date.now();
    action2.error = error;
    const index = this.#actionStack.indexOf(action2);
    if (index !== -1) {
      this.#actionStack.splice(index, 1);
    }
    this.actionEvents.emit("actionEnd", action2);
  }
};
var modeController = new ModeControllerService();

// src/services/dependencyTracker.js
var Tracker = class {
  /** @type {boolean} */
  #isActive = false;
  /** @type {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} */
  #store = /* @__PURE__ */ new Set();
  /** @type {Array<{ store: Set<import('../reactives/ReactiveItem.js').ReactiveItem>, ctx: object, isActive: boolean }>} */
  #stack = [];
  /** @type {EventEmitterLite<"add">} */
  #eventEmitter = new EventEmitterLite();
  /** @type {import('../services/modeController.js').ModeControllerService | null} */
  #modeController;
  /** @type {object} */
  ctx = {};
  /**
   * @param {import('../services/modeController.js').ModeControllerService} [modeController]
   *        Used to honour `untrackMode`. Optional so that the tracker can be
   *        constructed in isolation for tests.
   */
  constructor(modeController2) {
    this.#modeController = modeController2 ?? null;
  }
  /**
   * Returns a copy of the currently tracked items.
   * @returns {Set<import('../reactives/ReactiveItem.js').ReactiveItem>}
   */
  get data() {
    return new Set(this.#store);
  }
  /**
   * Returns the currently tracked items sorted by engine id.
   * @returns {Array<import('../reactives/ReactiveItem.js').ReactiveItem>}
   */
  getAsSortedArray() {
    return Array.from(this.#store).sort((a, b) => {
      const idA = a.engine.id;
      const idB = b.engine.id;
      return idA < idB ? -1 : idA > idB ? 1 : 0;
    });
  }
  /**
   * Records a reactive item if tracking is active and untracked reads are
   * not currently suppressed.
   * @param {import('../reactives/ReactiveItem.js').ReactiveItem} item
   * @param {string} [_key]
   */
  add(item, _key = "") {
    if (this.#modeController?.untrackMode) {
      return;
    }
    if (this.#isActive) {
      this.#store.add(item);
      this.#eventEmitter.emit("add", item);
    }
  }
  /**
   * Registers a listener called for every tracked item.
   * @param {(item: import('../reactives/ReactiveItem.js').ReactiveItem) => void} callback
   * @returns {() => void}
   */
  onAdd(callback) {
    return this.#eventEmitter.on("add", callback);
  }
  /**
   * Returns true while tracking is active.
   * @returns {boolean}
   */
  isActive() {
    return this.#isActive;
  }
  /**
   * Pushes a new tracking scope.
   * @param {object} [ctx]
   */
  enable(ctx = {}) {
    this.#stack.push({
      store: this.#store,
      ctx: this.ctx,
      isActive: this.#isActive
    });
    this.#store = /* @__PURE__ */ new Set();
    this.ctx = ctx;
    this.#isActive = true;
  }
  /**
   * Pops the current tracking scope and restores the previous one.
   */
  disable() {
    const previous = this.#stack.pop();
    if (previous) {
      this.#store = previous.store;
      this.ctx = previous.ctx;
      this.#isActive = previous.isActive;
    } else {
      this.#store = /* @__PURE__ */ new Set();
      this.ctx = {};
      this.#isActive = false;
    }
  }
};
var dependencyTracker = new Tracker(modeController);

// src/helpers/tools.js
function sortReactiveItems(a, b) {
  const idA = a.engine.id;
  const idB = b.engine.id;
  return idA < idB ? -1 : idA > idB ? 1 : 0;
}
function getSortedReactiveItems(...items) {
  const all = /* @__PURE__ */ new Set();
  items.forEach((item) => {
    if (!(item instanceof Set)) {
      all.add(item);
    } else {
      item.forEach((i) => all.add(i));
    }
  });
  return Array.from(all).sort(sortReactiveItems);
}
function isPlainObject(obj) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj);
}
function compareArrays(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (!compareAny(a[i], b[i])) {
      return false;
    }
  }
  return true;
}
function comparePlainObjects(a, b) {
  if (a === b) {
    return true;
  }
  if (!isPlainObject(a) || !isPlainObject(b)) {
    return false;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) {
    return false;
  }
  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    const hasProperty = Object.prototype.hasOwnProperty.call(b, key);
    if (!hasProperty) {
      return false;
    }
    if (!compareAny(a[key], b[key])) {
      return false;
    }
  }
  return true;
}
function compareAny(a, b) {
  if (a === b) {
    return true;
  }
  if (typeof a !== typeof b) {
    return false;
  }
  if (a === null || b === null) {
    return false;
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!(Array.isArray(a) && Array.isArray(b))) {
      return false;
    }
    return compareArrays(a, b);
  }
  return comparePlainObjects(a, b);
}
function debounce(func, wait) {
  let timeout;
  const f = (...args) => {
    const context = this;
    const later = function() {
      timeout = null;
      func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
  return (
    /** @type {T} */
    /** @type {any} */
    f
  );
}
function clone(obj) {
  if (Array.isArray(obj)) {
    return obj.slice();
  } else if (typeof obj === "object" && obj !== null) {
    return Object.assign({}, obj);
  } else {
    return obj;
  }
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function getAllPropertyDescriptors(obj, depth = 0, maxDepth = 100) {
  if (!obj || depth > maxDepth) {
    return /* @__PURE__ */ Object.create(null);
  }
  const proto = Object.getPrototypeOf(obj);
  return {
    ...getAllPropertyDescriptors(proto, depth + 1, maxDepth),
    ...Object.getOwnPropertyDescriptors(obj)
  };
}
function getError(e) {
  return e instanceof Error ? e : new Error(String(e));
}
function getItemNamesFromSet(items, options = { includeId: false, fallback: "unnamed", sorted: true }) {
  const { includeId = false, fallback = "unnamed", sorted = true } = options;
  const result = [];
  for (const item of items) {
    if (!item || !item.engine) {
      continue;
    }
    const namePart = item.name && item.name.trim() !== "" ? item.name : fallback;
    if (includeId) {
      result.push(`${namePart}:${item.engine.id}`);
    } else {
      result.push(namePart);
    }
  }
  if (sorted) {
    result.sort((a, b) => a.localeCompare(b));
  }
  return result;
}

// src/services/changedItemsController.js
function sortById(a, b) {
  const idA = a.engine.id;
  const idB = b.engine.id;
  return idA < idB ? -1 : idA > idB ? 1 : 0;
}
var ChangedItemsController = class {
  /** @type {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} */
  items = /* @__PURE__ */ new Set();
  /** @type {import('../services/modeController.js').ModeControllerService} */
  #modeController;
  /**
   * @param {import('../services/modeController.js').ModeControllerService} modeController
   */
  constructor(modeController2) {
    this.#modeController = modeController2;
  }
  /**
   * Marks an item as changed. Outside a batch, immediately runs subscribers
   * and clears the pending set.
   * @param {import('../reactives/ReactiveItem.js').ReactiveItem} item
   */
  addItem(item) {
    this.items.add(item);
    if (!this.#modeController.batchMode) {
      this.runSubscribers();
      this.clear();
    }
  }
  /**
   * Removes an item from the pending set.
   * @param {import('../reactives/ReactiveItem.js').ReactiveItem} item
   */
  removeItem(item) {
    this.items.delete(item);
  }
  /**
   * Clears the pending set.
   */
  clear() {
    this.items.clear();
  }
  /**
   * Runs all pending subscribers.
   *
   * The outer loop re-checks `this.items` after each notification round so
   * that updates added during subscriber execution (e.g. via `runInAction`)
   * are processed in the same call.
   */
  runSubscribers() {
    const changedItemsWithUpdates = /* @__PURE__ */ new Set();
    while (this.items.size > 0) {
      const itemsToProcess = new Set(this.items);
      this.items.clear();
      itemsToProcess.forEach((item) => {
        if (this.#modeController.batchMode) {
          if (item.engine.checkChangesTemporary()) {
            changedItemsWithUpdates.add(item);
          }
        } else if (item.engine.hasUpdates()) {
          changedItemsWithUpdates.add(item);
        }
      });
      const itemsToRecalc = /* @__PURE__ */ new Set();
      changedItemsWithUpdates.forEach((item) => {
        const visitDependent = (dep) => {
          if (dep.hasSubscribers() && !dep.engine.hasUpdates()) {
            itemsToRecalc.add(dep);
          }
        };
        item.engine.getDeepDependents().forEach(visitDependent);
      });
      Array.from(itemsToRecalc).sort(sortById).forEach((item) => {
        item.getValue();
      });
      itemsToRecalc.clear();
      changedItemsWithUpdates.clear();
      if (this.#modeController.batchMode) {
        itemsToProcess.forEach((item) => {
          if (item.engine.checkChangesTemporary()) {
            changedItemsWithUpdates.add(item);
          }
        });
      } else {
        itemsToProcess.forEach((item) => {
          if (item.engine.hasUpdates()) {
            changedItemsWithUpdates.add(item);
          }
        });
      }
      const sorted = Array.from(changedItemsWithUpdates).filter((item) => item.hasSubscribers()).sort(sortById);
      this.#modeController.startSubscribersMode();
      const usedSubscribers = /* @__PURE__ */ new Set();
      const errors = [];
      for (const item of sorted) {
        const itemSubscribers = item.engine.subscribeController.getSubscribers();
        for (const subscriber of itemSubscribers) {
          if (usedSubscribers.has(subscriber)) {
            continue;
          }
          usedSubscribers.add(subscriber);
          try {
            item.engine.context.emitPlugin(
              "onSubscriberRun",
              item,
              item.engine.updates
            );
            subscriber(item.engine.updates);
          } catch (e) {
            const err = getError(e);
            const error = new Error(
              `Error in ${item.name}: ${err.message}`,
              { cause: item }
            );
            error.stack = err.stack;
            errors.push(error);
          }
        }
        item.engine.clearUpdates();
      }
      itemsToProcess.forEach((item) => {
        item.engine.clearUpdates();
      });
      usedSubscribers.clear();
      this.#modeController.endSubscribersMode();
      if (this.#modeController.throwErrorInSubscribers) {
        for (const error of errors) {
          throw error;
        }
      }
    }
  }
};
var changedItemsController = new ChangedItemsController(modeController);
modeController.on("beforeBatchModeEnd", () => {
  changedItemsController.runSubscribers();
  changedItemsController.clear();
});

// src/core/context.js
var SNAPSHOT_VERSION = 1;
var Store2Context = class {
  /** @type {IdService} */
  idService;
  /** @type {ModeControllerService} */
  modeController;
  /** @type {Tracker} */
  dependencyTracker;
  /** @type {ChangedItemsController} */
  changedItemsController;
  /** @type {string} */
  name;
  /** @type {Array<import('../types.js').Store2Plugin>} */
  #plugins = [];
  /** @type {Array<import('../types.js').ActionMiddleware>} */
  #middlewares = [];
  /** @type {Map<string, import('../types.js').SnapshotRoot>} */
  #roots = /* @__PURE__ */ new Map();
  /** @type {boolean} */
  #pluginsSuspended = false;
  /** @type {boolean} */
  #disposed = false;
  /**
   * @param {object} [options]
   * @param {string} [options.name]
   * @param {IdService} [options.idService]
   * @param {ModeControllerService} [options.modeController]
   * @param {Tracker} [options.dependencyTracker]
   * @param {ChangedItemsController} [options.changedItemsController]
   */
  constructor(options = {}) {
    this.name = options.name || "store2";
    this.idService = options.idService || new IdService();
    this.modeController = options.modeController || new ModeControllerService();
    this.dependencyTracker = options.dependencyTracker || new Tracker(this.modeController);
    if (options.changedItemsController) {
      this.changedItemsController = options.changedItemsController;
    } else {
      this.changedItemsController = new ChangedItemsController(this.modeController);
      this.modeController.on("beforeBatchModeEnd", () => {
        this.changedItemsController.runSubscribers();
        this.changedItemsController.clear();
      });
    }
    this.modeController.on("batchModeStart", () => {
      this.emitPlugin("onBatchStart", {
        depth: this.modeController.batchDepth,
        name: this.modeController.currentBatchName,
        action: this.modeController.currentAction
      });
    });
    this.modeController.on("batchModeEnd", () => {
      this.emitPlugin("onBatchEnd", {
        depth: this.modeController.batchDepth,
        name: this.modeController.currentBatchName,
        action: this.modeController.currentAction
      });
    });
    this.modeController.onAction("actionStart", (action2) => {
      this.emitPlugin("onActionStart", action2);
    });
    this.modeController.onAction("actionEnd", (action2) => {
      this.emitPlugin("onActionEnd", action2);
    });
  }
  /**
   * Installs a plugin into this context.
   * @param {import('../types.js').Store2Plugin} plugin
   * @returns {this}
   */
  use(plugin) {
    if (this.#disposed) {
      throw new Error("Context has been disposed");
    }
    if (!plugin || typeof plugin.install !== "function") {
      throw new Error("Plugin must implement install(context)");
    }
    plugin.install(this);
    this.#plugins.push(plugin);
    return this;
  }
  /**
   * Registers an action middleware.
   * @param {import('../types.js').ActionMiddleware} middleware
   * @returns {this}
   */
  addMiddleware(middleware) {
    if (this.#disposed) {
      throw new Error("Context has been disposed");
    }
    this.#middlewares.push(middleware);
    return this;
  }
  /**
   * Registers a root for snapshot/hydrate. The root must implement
   * `serialize()` and `hydrate(data)`.
   * @param {string} name
   * @param {import('../types.js').SnapshotRoot} root
   * @returns {this}
   */
  registerRoot(name, root) {
    if (this.#disposed) {
      throw new Error("Context has been disposed");
    }
    if (!root || typeof root.serialize !== "function" || typeof root.hydrate !== "function") {
      throw new Error("Root must implement serialize() and hydrate(data)");
    }
    this.#roots.set(name, root);
    return this;
  }
  /**
   * Unregisters a previously registered root.
   * @param {string} name
   * @returns {boolean}
   */
  unregisterRoot(name) {
    return this.#roots.delete(name);
  }
  /**
   * Returns the names of all roots currently registered with registerRoot()
   * 
   * @returns {Array<string>}
   */
  getRootNames() {
    return Array.from(this.#roots.keys());
  }
  /**
   * Returns a copy of the plugins installed via use().
   * 
   * @returns {Array<import('../types.js').Store2Plugin>}
   */
  get plugins() {
    return [...this.#plugins];
  }
  /**
   * Returns a copy of the middleware chain installed via addMiddleware()
   * 
   * @returns {Array<import('../types.js').ActionMiddleware>}
   */
  get middlewares() {
    return [...this.#middlewares];
  }
  /**
   * Invokes a lifecycle hook on every installed plugin. Plugin errors are
   * caught and logged. When plugins are suspended (e.g. during time-travel),
   * calls are ignored.
   * @param {string} hook
   * @param {...any} args
   */
  emitPlugin(hook, ...args) {
    if (this.#pluginsSuspended) {
      return;
    }
    for (const plugin of this.#plugins) {
      const fn = (
        /** @type {any} */
        plugin[hook]
      );
      if (typeof fn === "function") {
        try {
          fn.apply(plugin, args);
        } catch (e) {
          console.error(`[store2] plugin "${plugin.name}" threw in ${hook}:`, e);
        }
      }
    }
  }
  /**
   * Runs `fn` inside a batch. Supports two signatures:
   *
   *     ctx.batch(() => { ... })
   *     ctx.batch('update todos', () => { ... })
   *
   * @param {string | Function} nameOrFn
   * @param {Function} [fn]
   * @returns {any}
   */
  batch(nameOrFn, fn) {
    const callback = typeof nameOrFn === "function" ? nameOrFn : fn;
    const name = typeof nameOrFn === "string" ? nameOrFn : "";
    if (typeof callback !== "function") {
      throw new Error("batch() requires a function to run");
    }
    this.modeController.enterBatch(name);
    try {
      return callback();
    } finally {
      this.modeController.exitBatch();
    }
  }
  /**
   * Runs `fn` as a named action. Supports async bodies and middleware.
   * @param {string} name
   * @param {(action: import('../types.js').ActionInfo) => any} fn
   * @param {any} [payload]
   * @returns {Promise<any>}
   */
  async action(name, fn, payload = void 0) {
    const action2 = this.modeController.beginAction(name, payload);
    let index = -1;
    const dispatch = async (i) => {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      const middleware = this.#middlewares[i];
      if (!middleware) {
        return fn(action2);
      }
      return middleware(action2, () => dispatch(i + 1));
    };
    try {
      const result = await dispatch(0);
      this.modeController.endAction(action2);
      return result;
    } catch (error) {
      this.modeController.endAction(action2, getError(error));
      throw error;
    }
  }
  /**
   * Flushes pending subscribers synchronously.
   */
  flush() {
    this.changedItemsController.runSubscribers();
    this.changedItemsController.clear();
  }
  /**
   * Captures a serializable snapshot of every registered root.
   * @returns {import('../types.js').ContextSnapshot}
   */
  snapshot() {
    const roots = {};
    for (const [name, root] of this.#roots) {
      roots[name] = root.serialize();
    }
    return {
      version: SNAPSHOT_VERSION,
      timestamp: Date.now(),
      roots
    };
  }
  /**
   * Applies a snapshot to every registered root. The whole operation runs
   * in one batch.
   *
   * When `timeTravel` is `true`, plugin hooks are suppressed for the
   * duration of the hydration so that a DevTools-style plugin does not
   * re-record the rehydration as a new action. Subscribers still run so
   * the UI updates.
   *
   * Roots present in the snapshot but not registered here are ignored.
   * Roots registered here but missing from the snapshot are left untouched.
   *
   * @param {import('../types.js').ContextSnapshot} snapshot
   * @param {{ timeTravel?: boolean }} [options]
   */
  hydrate(snapshot, options = {}) {
    if (!snapshot || typeof snapshot !== "object" || !snapshot.roots) {
      throw new Error("hydrate() requires a snapshot object with a roots field");
    }
    const { timeTravel = false } = options;
    const previousSuspended = this.#pluginsSuspended;
    if (timeTravel) {
      this.#pluginsSuspended = true;
    }
    this.modeController.enterBatch(timeTravel ? "time-travel" : "hydrate");
    try {
      for (const [name, data] of Object.entries(snapshot.roots)) {
        const root = this.#roots.get(name);
        if (root) {
          root.hydrate(data);
        }
      }
    } finally {
      this.modeController.exitBatch();
      if (timeTravel) {
        this.#pluginsSuspended = previousSuspended;
      }
    }
  }
  /**
   * Releases the context and forgets all installed plugins and roots.
   */
  dispose() {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;
    this.#middlewares.length = 0;
    this.#plugins.length = 0;
    this.#roots.clear();
  }
};
var defaultContext = new Store2Context({
  name: "default",
  idService,
  modeController,
  dependencyTracker,
  changedItemsController
});
var currentContext = null;
function getCurrentContext() {
  return currentContext || defaultContext;
}
function runWithContext(context, fn) {
  const previous = currentContext;
  currentContext = context;
  try {
    return fn();
  } finally {
    currentContext = previous;
  }
}
function createStore2Context(options = {}) {
  return new Store2Context(options);
}

// src/core/SubscribeController.js
var SubscribeController = class {
  /** @type {EventEmitter} */
  #emitter;
  #reactiveItem;
  /**
   * @param {import('../reactives/ReactiveItem.js').ReactiveItem} reactiveItem
   */
  constructor(reactiveItem) {
    this.#emitter = new EventEmitter();
    this.#reactiveItem = reactiveItem;
  }
  /**
   * Returns a copy of the current 'change' subscriber list.
   * @returns {Function[]}
   */
  getSubscribers() {
    return this.#emitter.getListeners("change");
  }
  /**
   * Subscribes a callback to the 'change' event.
   *
   * @param {(updates: Map<string, import('./UpdateDataRecord.js').UpdateDataRecord>) => void} fn
   * @param {{ delay?: number, signal?: AbortSignal }} [options]
   * @returns {() => void}
   */
  subscribe(fn, options) {
    const { delay = 0, signal } = options || {};
    const wrappedFn = delay > 0 ? debounce(fn, delay) : fn;
    const unsubscribe = this.#emitter.on("change", wrappedFn, { signal });
    return () => {
      unsubscribe();
    };
  }
  /**
   * Removes all 'change' subscribers.
   * Internal listeners (has/no subscribers) remain intact.
   */
  clearSubscribers() {
    this.#emitter.removeAllListenersOf("change");
  }
  /**
   * Removes all subscribers, including internal listeners.
   */
  clearAllSubscribers() {
    this.#emitter.removeAllListeners({ removeInternalListeners: true });
  }
  /**
   * Returns whether there are any 'change' subscribers.
   * @returns {boolean}
   */
  hasSubscribers() {
    return this.#emitter.hasListeners("change");
  }
  /**
   * Destroys the controller, emits 'destroy', and removes all listeners.
   */
  destroy() {
    this.#emitter.emit("destroy");
    this.#emitter.removeAllListeners({ removeInternalListeners: true });
  }
  /**
   * Registers a callback that fires when the first 'change' subscriber is added.
   * @param {() => void} callback
   * @returns {() => void}
   */
  onHasSubscribers(callback) {
    return this.#emitter.onHasEventListeners("change", () => callback());
  }
  /**
   * Registers a callback that fires when the last 'change' subscriber is removed.
   * @param {() => void} callback
   * @returns {() => void}
   */
  onNoSubscribers(callback) {
    return this.#emitter.onNoEventListeners("change", () => callback());
  }
  /**
   * Registers a callback that fires when the controller is destroyed.
   * @param {() => void} callback
   * @returns {() => void}
   */
  onDestroy(callback) {
    return this.#emitter.on("destroy", callback);
  }
};

// src/core/DependencyGraph.js
var DependencyGraph = class {
  /** @type {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} */
  #dependencies;
  /** @type {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} */
  #dependents;
  /** @type {import('../reactives/ReactiveItem.js').ReactiveItem} */
  #reactiveItem;
  /**
   * @param {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} dependencies - The engine's dependencies set.
   * @param {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} dependents - The engine's dependents set.
   * @param {import('../reactives/ReactiveItem.js').ReactiveItem} reactiveItem - The owning reactive item.
   */
  constructor(dependencies, dependents, reactiveItem) {
    this.#dependencies = dependencies;
    this.#dependents = dependents;
    this.#reactiveItem = reactiveItem;
  }
  /**
   * Adds a single dependency.
   * @param {import('../reactives/ReactiveItem.js').ReactiveItem} dependency
   */
  addDependency(dependency) {
    if (!this.#dependencies.has(dependency)) {
      this.#dependencies.add(dependency);
    }
  }
  /**
   * Adds multiple dependencies, sorted by id, and registers this reactive item as a dependent on each.
   * @param {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} deps - Set of dependencies to add.
   */
  addDependencies(deps) {
    const array = [];
    for (const dep of deps) {
      if (!this.#dependencies.has(dep)) {
        array.push(dep);
        dep.engine.addDependent(this.#reactiveItem);
      }
    }
    array.sort(sortReactiveItems);
    for (const dep of array) {
      this.#dependencies.add(dep);
    }
  }
  /**
   * Removes a dependent from the dependents set.
   * @param {import('../reactives/ReactiveItem.js').ReactiveItem} dependent
   */
  removeDependent(dependent) {
    this.#dependents.delete(dependent);
  }
  /**
   * Adds a dependent to the dependents set.
   * @param {import('../reactives/ReactiveItem.js').ReactiveItem} dependent
   * @returns {boolean} True if the dependent was added (i.e., not already present).
   */
  addDependent(dependent) {
    if (!this.#dependents.has(dependent)) {
      this.#dependents.add(dependent);
      return true;
    }
    return false;
  }
  /**
   * Returns all dependents of this reactive item (direct and indirect).
   * @returns {Set<import('../reactives/ReactiveItem.js').ReactiveItem>}
   */
  getDeepDependents() {
    const result = /* @__PURE__ */ new Set();
    const queue = [this.#reactiveItem];
    const visited = /* @__PURE__ */ new Set();
    while (queue.length) {
      const current = queue.shift();
      if (!current || visited.has(current)) {
        continue;
      }
      visited.add(current);
      for (const dependent of current.engine.dependents) {
        if (!result.has(dependent)) {
          result.add(dependent);
          queue.push(dependent);
        }
      }
    }
    return result;
  }
  /**
   * Returns sorted array of deep dependents.
   * @returns {Array<import('../reactives/ReactiveItem.js').ReactiveItem>}
   */
  getDeepDependentsArray() {
    const array = Array.from(this.getDeepDependents());
    array.sort(sortReactiveItems);
    return array;
  }
  /**
   * Notifies all dependents of a message.
   * @param {number} message - The message code (EngineMessages).
   * @param {{ sender: import('../reactives/ReactiveItem.js').ReactiveItem, recipients: Set<import('../reactives/ReactiveItem.js').ReactiveItem> }} ctx - Context containing sender and recipient set.
   */
  notifyDependents(message, ctx) {
    for (const dependent of this.#dependents) {
      ctx.recipients.add(dependent);
      dependent.engine.getMessage(message, ctx);
    }
  }
  /**
   * Notifies all dependencies of a message.
   * @param {number} message - The message code.
   * @param {{ sender: import('../reactives/ReactiveItem.js').ReactiveItem, recipients: Set<import('../reactives/ReactiveItem.js').ReactiveItem> }} ctx
   */
  notifyDependencies(message, ctx) {
    for (const dependency of this.#dependencies) {
      ctx.recipients.add(dependency);
      dependency.engine.getMessage(message, ctx);
    }
  }
  /**
   * Updates the dependency set to a new set.
   * @param {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} newDeps - New set of dependencies.
   */
  updateDependencies(newDeps) {
    for (const oldDep of this.#dependencies) {
      if (!newDeps.has(oldDep)) {
        this.#dependencies.delete(oldDep);
        oldDep.engine.removeDependent(this.#reactiveItem);
      }
    }
    for (const newDep of newDeps) {
      if (!this.#dependencies.has(newDep)) {
        this.#dependencies.add(newDep);
        newDep.engine.addDependent(this.#reactiveItem);
      }
    }
  }
  /**
   * Clears the graph (removes all dependencies and dependents).
   */
  clear() {
    this.#dependencies.clear();
    this.#dependents.clear();
  }
};

// src/core/BatchSnapshot.js
var BatchSnapshot = class {
  /**
   * Map storing original values for each property key.
   * @type {Map<string, any>}
   */
  #initialValues = /* @__PURE__ */ new Map();
  /**
   * Reference to the reactive item this snapshot belongs to.
   * Used to access the equality comparison function.
   * @type {import('../reactives/ReactiveItem.js').ReactiveItem}
   */
  #reactiveItem;
  /**
   * Creates a new BatchSnapshot instance.
   * @param {import('../reactives/ReactiveItem.js').ReactiveItem} reactiveItem - The reactive item to snapshot.
   */
  constructor(reactiveItem) {
    this.#reactiveItem = reactiveItem;
  }
  /**
   * Records the original value for a property if not already recorded in this batch.
   * @param {string} property - The property key.
   * @param {any} value - The original value at the start of the batch.
   */
  record(property, value) {
    if (!this.#initialValues.has(property)) {
      this.#initialValues.set(property, value);
    }
  }
  /**
   * Returns the original value recorded for a property.
   * @param {string} property - The property key.
   * @returns {any | undefined} The original value, or undefined if not recorded.
   */
  getOriginal(property) {
    return this.#initialValues.get(property);
  }
  /**
   * Checks whether a property has been recorded in this snapshot.
   * @param {string} property - The property key.
   * @returns {boolean} True if the property was recorded.
   */
  has(property) {
    return this.#initialValues.has(property);
  }
  /**
   * Returns an array of property keys that have changed compared to their original values.
   * Uses the reactive item's equality comparison function.
   * @param {(property: string) => any} getCurrentValue - Function that returns the current value for a given property.
   * @returns {string[]} Array of property keys that actually changed.
   */
  getChangedProperties(getCurrentValue) {
    const changed = [];
    for (const [prop, original] of this.#initialValues.entries()) {
      const current = getCurrentValue(prop);
      if (!this.#reactiveItem.equals(original, current)) {
        changed.push(prop);
      }
    }
    return changed;
  }
  /**
   * Clears all recorded initial values.
   */
  clear() {
    this.#initialValues.clear();
  }
  /**
   * Returns the number of recorded properties.
   * @returns {number}
   */
  get size() {
    return this.#initialValues.size;
  }
};

// src/core/UpdateDataRecord.js
var UpdateDataRecord = class {
  /** @type {"set"|"delete"} */
  type;
  /** @type {any} */
  value;
  /** @type {any} */
  oldValue;
  /** @type {import('../reactives/ReactiveItem.js').ReactiveItem|undefined} */
  reactiveItem;
  /**
   * Creates a new update record.
   *
   * @param {"set"|"delete"} type - The operation that produced the change.
   * @param {any} oldValue - Value before the change.
   * @param {any} value - Value after the change.
   * @param {import('../reactives/ReactiveItem.js').ReactiveItem} [reactiveItem] - The reactive item that triggered the update.
   */
  constructor(type, oldValue, value, reactiveItem) {
    this.type = type;
    this.oldValue = oldValue;
    this.value = value;
    this.reactiveItem = reactiveItem;
  }
};
var UpdateDataRecordManager = class {
  /**
   * Initializes an instance of UpdateDataRecordManager with the given data.
   * @param {Map<string, UpdateDataRecord>} data - The data to be managed.
   */
  constructor(data) {
    this.data = data;
  }
  /**
   * Removes the specified item and its related sub-items from the data map.
   * Replaces the deleted items with new UpdateDataRecord instances indicating the "delete" action.
   * @param {string} itemName - The name of the item to be destroyed.
   */
  removeItem(itemName) {
    this.data.set(itemName, new UpdateDataRecord("delete", void 0, void 0, void 0));
    const keysToDelete = [];
    this.data.forEach((item, key) => {
      if (key.startsWith(itemName + ".")) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => {
      this.data.delete(key);
    });
  }
};

// src/core/UpdateTracker.js
var UpdateTracker = class {
  /** @type {Map<string, import('./UpdateDataRecord.js').UpdateDataRecord>} */
  #updates;
  /** @type {import('../reactives/ReactiveItem.js').ReactiveItem} */
  #reactiveItem;
  /** @type {BatchSnapshot | null} */
  #batchSnapshot = null;
  /** @type {import('./Engine.js').Engine} */
  #engine;
  /**
   * @param {Map<string, import('./UpdateDataRecord.js').UpdateDataRecord>} updates
   * @param {import('../reactives/ReactiveItem.js').ReactiveItem} reactiveItem
   * @param {import('./Engine.js').Engine} engine
   */
  constructor(updates, reactiveItem, engine) {
    this.#updates = updates;
    this.#reactiveItem = reactiveItem;
    this.#engine = engine;
  }
  /**
   * In batch mode, stores the original value in a snapshot.
   * @param {string} property
   * @param {any} oldValue
   */
  #recordChange(property, oldValue) {
    if (this.#engine.context.modeController.batchMode) {
      if (!this.#batchSnapshot) {
        this.#batchSnapshot = new BatchSnapshot(this.#reactiveItem);
      }
      this.#batchSnapshot.record(property, oldValue);
    }
  }
  /**
   * Determines whether a change is effective (i.e. not reverted) considering
   * batch snapshots.
   * @param {string} property
   * @param {any} oldValue
   * @param {any} newValue
   * @param {import('../types.js').CompareFunction | null} compareFn
   * @returns {boolean}
   */
  isEffectiveChange(property, oldValue, newValue, compareFn) {
    const equals = (a, b) => compareFn ? compareFn(a, b) : this.#reactiveItem.equals(a, b);
    const batchMode = this.#engine.context.modeController.batchMode;
    if (batchMode && this.#batchSnapshot?.has(property)) {
      const original = this.#batchSnapshot.getOriginal(property);
      return !equals(original, newValue);
    }
    return !equals(oldValue, newValue);
  }
  /**
   * Adds an update record if the change is effective.
   * @param {string} property
   * @param {"set" | "delete"} type
   * @param {any} oldValue
   * @param {any} newValue
   * @param {import('../types.js').CompareFunction | null} compareFn
   * @param {() => void} notifyDependentsCallback
   * @param {() => void} addToChangedItemsCallback
   * @returns {boolean}
   */
  addUpdate(property, type, oldValue, newValue, compareFn, notifyDependentsCallback, addToChangedItemsCallback) {
    this.#recordChange(property, oldValue);
    const batchMode = this.#engine.context.modeController.batchMode;
    let reportedOld = oldValue;
    let compareOld = oldValue;
    if (batchMode && this.#batchSnapshot?.has(property)) {
      const original = this.#batchSnapshot.getOriginal(property);
      reportedOld = original;
      compareOld = original;
    }
    const equals = (a, b) => compareFn ? compareFn(a, b) : this.#reactiveItem.equals(a, b);
    const hasMutation = property === "" ? !equals(oldValue, newValue) : oldValue !== newValue;
    if (!hasMutation) {
      return false;
    }
    notifyDependentsCallback();
    addToChangedItemsCallback();
    const effective = !equals(compareOld, newValue);
    if (!effective) {
      this.#updates.delete(property);
      return false;
    }
    const record = new UpdateDataRecord(type, reportedOld, newValue, this.#reactiveItem);
    this.#updates.set(property, record);
    this.#engine.version++;
    return true;
  }
  /**
   * @returns {boolean}
   */
  hasUpdates() {
    return this.#updates.size > 0;
  }
  /**
   * Clears all pending updates and resets the batch snapshot.
   */
  clearUpdates() {
    this.#updates.clear();
    if (this.#batchSnapshot) {
      this.#batchSnapshot.clear();
      this.#batchSnapshot = null;
    }
  }
  /**
   * Removes updates for properties that reverted to their original values.
   * @param {(prop: string) => any} getCurrentValue
   * @returns {boolean}
   */
  checkChangesTemporary(getCurrentValue) {
    if (!this.#batchSnapshot) {
      return this.hasUpdates();
    }
    const changedProps = this.#batchSnapshot.getChangedProperties(getCurrentValue);
    for (const key of this.#updates.keys()) {
      if (!changedProps.includes(key)) {
        this.#updates.delete(key);
      }
    }
    const hasChanges = this.#updates.size > 0;
    this.#batchSnapshot.clear();
    this.#batchSnapshot = null;
    return hasChanges;
  }
};

// src/core/MessageHandler.js
var EngineMessages = {
  DEPENDENCY_CHANGED: 1,
  DEPENDENCY_DESTROYED: 2,
  HAS_ERROR: 3,
  DEPENDENT_DESTROYED: 4
};
var MessageHandler = class {
  /**
   * Processes an incoming message.
   * @param {number} message - The message code.
   * @param {{ sender: import('../reactives/ReactiveItem.js').ReactiveItem, recipients: Set<import('../reactives/ReactiveItem.js').ReactiveItem> }} ctx - Context.
   * @param {_Engine} engineState - The engine's state container (provides getters/setters).
   * @param {Function} setError - Callback to set the engine's error.
   * @param {Function} setShouldRecalc - Callback to set the shouldRecalc flag.
   * @param {Function} notifyDependents - Callback to notify dependents of a message.
   * @param {Function} removeDependent - Callback to remove a dependent.
   * @param {Function} destroyEngine - Callback to destroy the engine.
   */
  handleMessage(message, ctx, engineState, setError, setShouldRecalc, notifyDependents, removeDependent, destroyEngine) {
    switch (message) {
      case EngineMessages.DEPENDENT_DESTROYED:
        removeDependent(ctx.sender);
        break;
      case EngineMessages.DEPENDENCY_CHANGED:
        setError(null);
        if (!engineState.shouldRecalc) {
          setShouldRecalc(true);
          notifyDependents(message, ctx);
        }
        break;
      case EngineMessages.DEPENDENCY_DESTROYED:
        destroyEngine(ctx);
        break;
      case EngineMessages.HAS_ERROR:
        setShouldRecalc(true);
        const error = ctx.sender.engine.error;
        if (error) {
          setError(error);
          notifyDependents(message, ctx);
        }
        break;
      default:
        break;
    }
  }
};

// src/core/Engine.js
var ATOM = 1;
var COMPUTED = 2;
var COLLECTION = 3;
var SHALLOW_REACTIVE = 4;
var Engine = class {
  /** @type {import('./context.js').Store2Context} */
  context;
  /** @type {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} */
  dependencies = /* @__PURE__ */ new Set();
  /** @type {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} */
  dependents = /* @__PURE__ */ new Set();
  /** @type {number} */
  id;
  /** @type {number} */
  version = 0;
  /** @type {import('../reactives/ReactiveItem.js').ReactiveItem} */
  reactiveItem;
  /** @type {boolean} */
  shouldRecalc = false;
  /** @type {boolean} */
  isDestroyed = false;
  /** @type {Error | null} */
  #error = null;
  /** @type {SubscribeController} */
  subscribeController;
  /** @type {import('../types.js').ReactiveItemType} */
  type;
  /** @type {Map<string, import('./UpdateDataRecord.js').UpdateDataRecord>} */
  updates = /* @__PURE__ */ new Map();
  /** @type {import('../types.js').CompareFunction | null} */
  compareFn = null;
  /** @type {boolean} */
  suppressNotifications = false;
  /** @type {DependencyGraph} */
  #graph;
  /** @type {UpdateTracker} */
  #updateTracker;
  /** @type {MessageHandler} */
  #messageHandler;
  /**
   * @param {import('../reactives/ReactiveItem.js').ReactiveItem} reactiveItem
   * @param {import('../types.js').ReactiveItemType} type
   */
  constructor(reactiveItem, type) {
    this.reactiveItem = reactiveItem;
    this.type = type;
    this.context = getCurrentContext();
    this.id = this.context.idService.generateId();
    this.#graph = new DependencyGraph(this.dependencies, this.dependents, reactiveItem);
    this.#updateTracker = new UpdateTracker(this.updates, reactiveItem, this);
    this.#messageHandler = new MessageHandler();
    this.subscribeController = new SubscribeController(this.reactiveItem);
  }
  /**
   * @returns {Error | null}
   */
  get error() {
    return this.#error;
  }
  /**
   * Records a change attempt and emits `onUpdate` when the change is
   * effective.
   * @param {string} property
   * @param {"set" | "delete"} type
   * @param {any} oldValue
   * @param {any} value
   * @returns {boolean}
   */
  addUpdate(property, type, oldValue, value) {
    const added = this.#updateTracker.addUpdate(
      property,
      type,
      oldValue,
      value,
      this.compareFn,
      () => this.notifyDependents(EngineMessages.DEPENDENCY_CHANGED),
      () => this.context.changedItemsController.addItem(this.reactiveItem)
    );
    if (added) {
      const record = this.updates.get(property);
      if (record) {
        this.context.emitPlugin("onUpdate", this.reactiveItem, property, record);
      }
    }
    return added;
  }
  /**
   * @param {import('../reactives/ReactiveItem.js').ReactiveItem} dependency
   */
  addDependency(dependency) {
    this.#graph.addDependency(dependency);
  }
  /**
   * @param {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} dependencies
   */
  addDependencies(dependencies) {
    this.#graph.addDependencies(dependencies);
  }
  /**
   * @param {import('../reactives/ReactiveItem.js').ReactiveItem} dependent
   * @returns {boolean}
   */
  addDependent(dependent) {
    if (this.isDestroyed) {
      return false;
    }
    return this.#graph.addDependent(dependent);
  }
  /**
   * @param {import('../reactives/ReactiveItem.js').ReactiveItem} dependent
   */
  removeDependent(dependent) {
    this.#graph.removeDependent(dependent);
  }
  /**
   * @returns {Set<import('../reactives/ReactiveItem.js').ReactiveItem>}
   */
  getDeepDependents() {
    return this.#graph.getDeepDependents();
  }
  /**
   * @returns {Array<import('../reactives/ReactiveItem.js').ReactiveItem>}
   */
  getDeepDependentsArray() {
    return this.#graph.getDeepDependentsArray();
  }
  /**
   * @param {number} message
   * @param {{ sender: import('../reactives/ReactiveItem.js').ReactiveItem, recipients: Set<import('../reactives/ReactiveItem.js').ReactiveItem> }} [ctx]
   */
  notifyDependents(message, ctx) {
    if (!ctx) {
      ctx = { sender: this.reactiveItem, recipients: /* @__PURE__ */ new Set() };
    }
    this.#graph.notifyDependents(message, ctx);
  }
  /**
   * @param {number} message
   * @param {{ sender: import('../reactives/ReactiveItem.js').ReactiveItem, recipients: Set<import('../reactives/ReactiveItem.js').ReactiveItem> }} [ctx]
   */
  notifyDependencies(message, ctx) {
    if (!ctx) {
      ctx = { sender: this.reactiveItem, recipients: /* @__PURE__ */ new Set() };
    }
    this.#graph.notifyDependencies(message, ctx);
  }
  /**
   * @param {number} message
   * @param {{ sender: import('../reactives/ReactiveItem.js').ReactiveItem, recipients: Set<import('../reactives/ReactiveItem.js').ReactiveItem> }} ctx
   */
  getMessage(message, ctx) {
    const setError = (err) => {
      this.#error = err;
    };
    const setShouldRecalc = (val) => {
      this.shouldRecalc = val;
    };
    const notify = (msg, c) => this.notifyDependents(msg, c);
    const removeDep = (dep) => this.removeDependent(dep);
    const destroy = (c) => this.destroy(c);
    this.#messageHandler.handleMessage(
      message,
      ctx,
      this,
      setError,
      setShouldRecalc,
      notify,
      removeDep,
      destroy
    );
  }
  /**
   * Sets an error and notifies dependents. Emits `onError`.
   * @param {Error | null} error
   * @param {{ sender: import('../reactives/ReactiveItem.js').ReactiveItem, recipients: Set<import('../reactives/ReactiveItem.js').ReactiveItem> }} [ctx]
   */
  setError(error, ctx) {
    if (error === null) {
      return;
    }
    this.#error = error;
    this.shouldRecalc = true;
    this.context.emitPlugin("onError", this.reactiveItem, error);
    const c = ctx || { sender: this.reactiveItem, recipients: /* @__PURE__ */ new Set() };
    this.notifyDependents(EngineMessages.HAS_ERROR, c);
  }
  /**
   * Clears the current error.
   */
  clearError() {
    this.#error = null;
  }
  /**
   * Destroys the engine. Emits `onDestroy` after teardown.
   * @param {{ sender: import('../reactives/ReactiveItem.js').ReactiveItem, recipients: Set<import('../reactives/ReactiveItem.js').ReactiveItem> }} [ctx]
   */
  destroy(ctx) {
    if (this.isDestroyed) {
      return;
    }
    const c = ctx || { sender: this.reactiveItem, recipients: /* @__PURE__ */ new Set() };
    this.#error = null;
    this.notifyDependents(EngineMessages.DEPENDENCY_DESTROYED, c);
    this.notifyDependencies(EngineMessages.DEPENDENT_DESTROYED, c);
    this.isDestroyed = true;
    this.#graph.clear();
    this.clearUpdates();
    this.subscribeController.destroy();
    this.context.emitPlugin("onDestroy", this.reactiveItem);
  }
  /**
   * Clears all pending updates.
   */
  clearUpdates() {
    this.#updateTracker.clearUpdates();
  }
  /**
   * @returns {boolean}
   */
  hasUpdates() {
    return this.#updateTracker.hasUpdates();
  }
  /**
   * @returns {boolean}
   */
  checkChangesTemporary() {
    const getCurrent = (prop) => {
      if (prop === "") {
        return this.reactiveItem.peekValue();
      }
      const val = this.reactiveItem.peekValue();
      return val?.[prop];
    };
    return this.#updateTracker.checkChangesTemporary(getCurrent);
  }
  /**
   * @param {Set<import('../reactives/ReactiveItem.js').ReactiveItem>} newDeps
   */
  updateDependencies(newDeps) {
    this.#graph.updateDependencies(newDeps);
  }
  /**
   * @throws {Error} If destroyed or in subscribers mode.
   */
  prepareSetValue() {
    if (this.isDestroyed) {
      throw new Error("The reactive item has been destroyed");
    }
    if (this.context.modeController.subscribersMode) {
      throw new Error("Cannot set value while subscribers are running");
    }
  }
  /**
   * Called after a value change to schedule notifications.
   */
  valueChangedCallback() {
    if (this.suppressNotifications) {
      return;
    }
    this.context.changedItemsController.addItem(this.reactiveItem);
  }
  /**
   * @param {string} property
   * @param {any} oldValue
   * @param {any} newValue
   * @returns {boolean}
   */
  isEffectiveChangeWithOld(property, oldValue, newValue) {
    return this.#updateTracker.isEffectiveChange(property, oldValue, newValue, this.compareFn);
  }
};

// src/reactives/ReactiveItem.js
var ReactiveItem = class {
  /**
   * The reactive engine driving this item. Internal coordination only.
   * @type {Engine}
   * @internal
   */
  engine;
  /**
   * Debug name assigned at construction. Used in error messages and
   * DevTools listings. Empty string when not set.
   * @type {string}
   */
  name = "";
  /**
   * Local path assigned by the immediate container. Top-level items get a
   * path equal to their key in the root store; standalone items keep `''`.
   * @type {string}
   */
  path = "";
  /**
   * Creates a new reactive item. Subclasses pass their own type tag.
   *
   * @param {import('../types.js').ReactiveItemType} type
   */
  constructor(type) {
    this.engine = new Engine(this, type);
  }
  /**
   * The numeric type tag of this item: `1` for `Atom`, `2` for `Computed`,
   * `3` for `Collection`, `4` for `ShallowReactive`.
   *
   * @returns {import('../types.js').ReactiveItemType}
   */
  get type() {
    return this.engine.type;
  }
  /**
   * Monotonic version counter, bumped on every effective change.
   *
   * Useful as a stable token for `useSyncExternalStore` and for cache
   * invalidation: comparing two `getVersion()` results tells you whether
   * the value changed, without reading it.
   *
   * @returns {number}
   */
  getVersion() {
    return this.engine.version;
  }
  /**
   * Subscribes a function to changes of this item.
   *
   * The callback receives a `Map` of property paths to
   * `UpdateDataRecord` instances. It is invoked once per batch of
   * effective changes.
   *
   * @param {(updates: Map<string, import('../core/UpdateDataRecord.js').UpdateDataRecord>) => void} fn
   * @param {object} [options]
   * @param {number} [options.delay] - Debounce delay in milliseconds.
   * @param {AbortSignal} [options.signal] - Cancels the subscription when aborted.
   * @returns {() => void} An unsubscribe function.
   */
  subscribe(fn, options) {
    return this.engine.subscribeController.subscribe(fn, options);
  }
  /**
   * Removes all change subscribers, keeping lifecycle listeners
   * registered via `onHasSubscribers`, `onNoSubscribers`, and
   * `onDestroy`.
   */
  clearSubscribers() {
    this.engine.subscribeController.clearSubscribers();
  }
  /**
   * Removes all subscribers, including lifecycle listeners.
   *
   * After this call, the item no longer invokes any user callbacks until
   * a new subscription is made.
   */
  clearAllSubscribers() {
    this.engine.subscribeController.clearAllSubscribers();
  }
  /**
   * Returns `true` if at least one change subscriber is currently
   * registered.
   *
   * @returns {boolean}
   */
  hasSubscribers() {
    return this.engine.subscribeController.hasSubscribers();
  }
  /**
   * Reads the current value, tracking the item as a dependency unless
   * `untracked` is `true`.
   *
   * Throws if the item has been destroyed.
   *
   * @param {object} [options]
   * @param {boolean} [options.untracked=false]
   * @returns {any}
   */
  getValue(options) {
    if (this.engine.isDestroyed) {
      throw new Error("The reactive item has been destroyed");
    }
    const _options = Object.assign({ untracked: false }, options);
    if (_options.untracked === false) {
      this.engine.context.dependencyTracker.add(this);
    }
  }
  /**
   * Returns the current value without registering a dependency and
   * without triggering recalculation for `Computed`.
   *
   * For `Computed`, this returns the last cached value even if it is
   * stale. To force a fresh value, use `.value` or `.getValue()`.
   *
   * @returns {any}
   */
  peekValue() {
    return this.getValue({ untracked: true });
  }
  /**
   * Returns the last error produced by this item, or `null`.
   *
   * For `Computed`, this is the error thrown during the most recent
   * evaluation. The error is preserved until a dependency changes.
   *
   * @returns {Error | null}
   */
  getLastError() {
    return this.engine.error;
  }
  /**
   * Returns `true` if reading the value currently throws or has thrown.
   *
   * For `Computed`, this forces a read to determine whether the current
   * dependencies are valid.
   *
   * @returns {boolean}
   */
  hasError() {
    try {
      this.getValue();
    } catch (e) {
      this.engine.setError(getError(e));
    }
    return this.engine.error !== null;
  }
  /**
   * Registers a callback that fires when the first change subscriber is
   * added.
   *
   * Useful for lazy initialisation: start expensive work only when
   * somebody actually listens.
   *
   * @param {() => void} fn
   * @returns {() => void} An unsubscribe function.
   */
  onHasSubscribers(fn) {
    return this.engine.subscribeController.onHasSubscribers(fn);
  }
  /**
   * Registers a callback that fires when the last change subscriber is
   * removed.
   *
   * Useful for cleanup: stop timers or subscriptions that only make sense
   * while somebody is listening.
   *
   * @param {() => void} fn
   * @returns {() => void} An unsubscribe function.
   */
  onNoSubscribers(fn) {
    return this.engine.subscribeController.onNoSubscribers(fn);
  }
  /**
   * Registers a callback that fires when the item is destroyed.
   *
   * The callback receives the destroyed item as its only argument.
   *
   * @param {(reactiveItem: ReactiveItem) => void} fn
   * @returns {() => void} An unsubscribe function.
   */
  onDestroy(fn) {
    const that = this;
    const callback = () => {
      fn(that);
    };
    return this.engine.subscribeController.onDestroy(callback);
  }
  /**
   * Destroys the item and tears down its dependency graph.
   *
   * All subscribers are detached, all dependencies are released, and any
   * further read or write throws. Idempotent — subsequent calls are
   * no-ops.
   */
  destroy() {
    this.engine.destroy();
  }
  /**
   * Returns `true` if the two values are considered equal by this item's
   * comparator.
   *
   * When the second argument is omitted, it is compared against the
   * item's current value. Uses the custom `compareFunction` if one was
   * provided at construction, otherwise falls back to shallow equality.
   *
   * @param {any} a
   * @param {any} [b]
   * @returns {boolean}
   */
  equals(a, b) {
    if (b === void 0) {
      b = this.getValue();
    }
    if (this.engine.compareFn) {
      return this.engine.compareFn(a, b);
    }
    return compareAny(a, b);
  }
  /**
   * Returns `true` if `destroy()` has been called.
   *
   * After destruction, reads and writes throw. This getter is the only
   * operation that remains safe to call.
   *
   * @returns {boolean}
   */
  get isDestroyed() {
    return this.engine.isDestroyed;
  }
  /**
   * Returns a plain data representation suitable for storage or transport.
   *
   * The base implementation returns `null`, signalling that the item must
   * not be persisted. `Atom`, `Collection`, `ShallowReactive`, and `Store`
   * override this method. `Computed` deliberately keeps the `null`
   * default — derived state is recalculated on hydration, never restored.
   *
   * @returns {any}
   */
  serialize() {
    return null;
  }
  /**
   * Restores state previously produced by `serialize()`.
   *
   * The base implementation is a no-op. Subclasses override this to apply
   * the given data. Implementations must be idempotent and must not throw
   * on malformed input — silently ignore what they cannot apply.
   *
   * @param {any} _data
   */
  hydrate(_data) {
  }
};

// src/reactives/Atom.js
var Atom = class extends ReactiveItem {
  /** @type {T} */
  #currentValue;
  /**
   * Creates a new Atom with the given initial value.
   *
   * @param {T} value - The initial value.
   * @param {object} [options]
   * @param {string} [options.name] - Debug name used in error messages.
   * @param {((a: T, b: T) => boolean) | null} [options.compareFunction] - Custom equality function. Defaults to shallow comparison.
   */
  constructor(value, options = {
    name: "",
    compareFunction: null
  }) {
    super(ATOM);
    if (value instanceof ReactiveItem) {
      throw new Error(
        `Atom${this.name ? ` (${this.name})` : ""}: value must not be a reactive item`
      );
    }
    this.name = options.name || "";
    this.engine.compareFn = options.compareFunction || null;
    this.#currentValue = value;
  }
  set value(value) {
    if (value instanceof ReactiveItem) {
      throw new Error(
        `Atom${this.name ? ` (${this.name})` : ""}: value must not be a reactive item`
      );
    }
    const engine = this.engine;
    engine.prepareSetValue();
    if (this.equals(value, this.#currentValue)) {
      return;
    }
    const oldValue = this.#currentValue;
    this.#currentValue = clone(value);
    const newValue = this.#currentValue;
    if (engine.addUpdate("", "set", oldValue, newValue)) {
      engine.valueChangedCallback();
    }
  }
  /**
   * Returns the current value.
   *
   * When `options.untracked` is `false` (the default), registers this
   * atom as a dependency of the enclosing tracked scope. Pass
   * `{ untracked: true }` to read without creating a dependency.
   *
   * @param {{ untracked?: boolean }} [options]
   * @returns {T}
   */
  getValue(options) {
    super.getValue(options);
    return this.#currentValue;
  }
  /**
   * The current value.
   *
   * Reading this property inside a tracked scope registers a dependency.
   * Writing it schedules a change if the new value differs from the
   * current one.
   *
   * @returns {T}
   */
  get value() {
    return this.getValue();
  }
  /**
   * Returns the current value without registering a dependency.
   *
   * Shorthand for `getValue({ untracked: true })`. Useful when you need
   * to peek at an atom inside a `Computed` or `autorun` without making it
   * re-run when the atom changes.
   *
   * @returns {T}
   */
  get valueUntracked() {
    return this.getValue({ untracked: true });
  }
  /**
   * Returns a serializable representation of the current value.
   *
   * @returns {any}
   */
  serialize() {
    return {
      type: "atom",
      value: this.#currentValue
    };
  }
  /**
   * Applies data previously produced by `serialize()`.
   *
   * Silently ignores malformed input.
   *
   * @param {any} data
   */
  hydrate(data) {
    if (data && typeof data === "object" && "value" in data) {
      this.value = data.value;
    }
  }
};

// src/reactives/Computed.js
var Computed = class extends ReactiveItem {
  /** @type {T} */
  #currentValue;
  /** @type {() => T} */
  #fn;
  /** @type {string} */
  #cachedDependentsVersionString = "";
  /**
   * Read-only view of the options passed to the constructor. Currently
   * exposes `smartRecompute`.
   */
  options = {
    smartRecompute: false
  };
  /**
   * Creates a new Computed.
   *
   * @param {() => T} fn - The derivation function. Must read at least one reactive value.
   * @param {object} [options]
   * @param {string} [options.name] - Debug name used in error messages.
   * @param {((a: T, b: T) => boolean) | null} [options.compareFunction] - Custom equality function. Defaults to shallow comparison.
   * @param {boolean} [options.smartRecompute] - When `true`, the value is recalculated only if the version of a dependency actually changed, avoiding recomputation when dependencies toggled back to their previous values within a batch.
   */
  constructor(fn, options = {
    name: "",
    compareFunction: null,
    smartRecompute: false
  }) {
    super(COMPUTED);
    this.options = {
      smartRecompute: options.smartRecompute ?? false
    };
    this.name = options.name || "";
    this.engine.compareFn = options.compareFunction || null;
    this.#fn = fn;
    this.#currentValue = this.#collectDependenciesAndInitValue();
    if (this.options.smartRecompute) {
      this.#cachedDependentsVersionString = this.#getDependenciesVersionString();
    }
  }
  /**
   * @returns {string}
   */
  #getDependenciesVersionString() {
    const result = [];
    const engine = this.engine;
    engine.dependencies.forEach((dependency) => {
      if (dependency.engine.shouldRecalc) {
        dependency.getValue();
      }
      result.push(dependency.engine.id.toString() + ":" + dependency.engine.version);
    });
    return result.join(";");
  }
  /**
   * @returns {T}
   */
  #collectDependenciesAndInitValue() {
    const engine = this.engine;
    const tracker = engine.context.dependencyTracker;
    const modeController2 = engine.context.modeController;
    tracker.enable();
    modeController2.isComputing = true;
    let value = (
      /** @type {any} */
      void 0
    );
    let newDeps;
    let thrownError = null;
    try {
      value = this.#fn();
      if (value instanceof ReactiveItem) {
        throw new Error(
          `Computed${this.name ? ` (${this.name})` : ""}: Return value must not be a reactive item`
        );
      }
    } catch (e) {
      thrownError = getError(e);
    } finally {
      newDeps = tracker.data;
      tracker.disable();
      modeController2.isComputing = false;
    }
    if (thrownError) {
      engine.setError(thrownError);
      throw engine.error;
    }
    if (newDeps.size === 0) {
      throw new Error(`Computed${this.name ? ` (${this.name})` : ""}: No dependencies`);
    }
    engine.addDependencies(newDeps);
    return (
      /** @type {T} */
      value
    );
  }
  /**
   * Returns `true` if the cached value is out of date and a read would
   * trigger recalculation.
   *
   * A computed is stale if one of its dependencies notified a change, or
   * if its last evaluation threw an error.
   *
   * @returns {boolean}
   */
  isStale() {
    const engine = this.engine;
    if (engine.error !== null) {
      return true;
    }
    if (engine.shouldRecalc) {
      return true;
    }
    return false;
  }
  /**
   * @returns {boolean}
   */
  #areDependenciesStale() {
    const engine = this.engine;
    const dependentsVersionString = this.#getDependenciesVersionString();
    if (dependentsVersionString !== this.#cachedDependentsVersionString) {
      this.#cachedDependentsVersionString = dependentsVersionString;
      engine.shouldRecalc = true;
      return true;
    }
    return false;
  }
  /**
   * Returns the computed value, recalculating first if any dependency
   * changed.
   *
   * When `options.untracked` is `false` (the default), registers this
   * computed as a dependency of the enclosing tracked scope. Pass
   * `{ untracked: true }` to read without creating a dependency.
   *
   * Throws if the derivation function throws, or if the item has been
   * destroyed.
   *
   * @param {{ untracked?: boolean }} [options]
   * @returns {T}
   */
  getValue(options) {
    super.getValue(options);
    const engine = this.engine;
    if (engine.error !== null && !engine.shouldRecalc) {
      throw engine.error;
    }
    if (engine.context.modeController.isComputing) {
      if (this.isStale()) {
        throw new Error(
          `Computed${this.name ? ` (${this.name})` : ""}: Dependencies cannot be stale`,
          { cause: this }
        );
      }
    }
    if (!this.isStale()) {
      engine.shouldRecalc = false;
      return this.#currentValue;
    }
    if (this.options.smartRecompute) {
      if (!this.#areDependenciesStale()) {
        engine.shouldRecalc = false;
        return this.#currentValue;
      }
    }
    return this.#calc();
  }
  /**
   * The computed value.
   *
   * Reading this property recalculates if a dependency changed and
   * registers a dependency in the enclosing tracked scope.
   *
   * @returns {T}
   */
  get value() {
    return this.getValue();
  }
  /**
   * Returns the last cached value without triggering recalculation.
   *
   * If the computed is stale, this returns the previous value — not a
   * fresh one. Useful for debugging and for reading without causing side
   * effects, but the value may be out of date.
   *
   * @returns {T}
   */
  peekValue() {
    return this.#currentValue;
  }
  /**
   * Returns the computed value without registering a dependency.
   *
   * Shorthand for `getValue({ untracked: true })`. The value is still
   * recalculated if stale — only dependency registration is skipped.
   *
   * @returns {T}
   */
  get valueUntracked() {
    return this.getValue({ untracked: true });
  }
  /**
   * @returns {T}
   */
  #calc() {
    const engine = this.engine;
    const tracker = engine.context.dependencyTracker;
    engine.shouldRecalc = false;
    engine.clearError();
    tracker.enable();
    let value = (
      /** @type {any} */
      void 0
    );
    let newDeps;
    let thrownError = null;
    try {
      value = this.#fn();
    } catch (e) {
      thrownError = getError(e);
    } finally {
      newDeps = tracker.data;
      tracker.disable();
    }
    if (thrownError) {
      engine.setError(
        new Error(`Computed${this.name ? ` (${this.name})` : ""}: ` + thrownError.message, {
          cause: this
        })
      );
      throw engine.error;
    }
    if (newDeps.size > 0) {
      engine.updateDependencies(newDeps);
    }
    if (this.equals(this.#currentValue, value)) {
      engine.clearUpdates();
      return this.#currentValue;
    }
    const oldValue = this.#currentValue;
    this.#currentValue = clone(
      /** @type {any} */
      value
    );
    const newValue = this.#currentValue;
    if (engine.addUpdate("", "set", oldValue, newValue)) {
      engine.valueChangedCallback();
    }
    engine.context.emitPlugin("onComputedRecalc", this, oldValue, newValue);
    return this.#currentValue;
  }
  /**
   * Always returns `null`. Computed items are derived state and are never
   * persisted — they are recalculated from their dependencies on
   * hydration.
   *
   * @returns {null}
   */
  serialize() {
    return null;
  }
};

// src/reactives/Collection.js
var Collection = class extends ReactiveItem {
  /** @type {T[]} */
  #target;
  /** @type {T[]} */
  #proxy;
  /** @type {number} */
  #length = 0;
  /** @type {ProxyHandler<T[]>} */
  #handler;
  /**
   * Creates a new Collection wrapping the given array.
   *
   * The array is copied element-by-element; the caller's array reference
   * is not stored.
   *
   * @param {T[]} value - The initial array.
   * @param {object} [options]
   * @param {string} [options.name] - Debug name used in error messages.
   * @param {import('../types.js').CompareFunction | null} [options.compareFunction] - Custom equality function for element comparison.
   */
  constructor(value, options = { name: "", compareFunction: null }) {
    super(COLLECTION);
    this.name = options.name || "";
    this.engine.compareFn = options.compareFunction || null;
    this.#handler = this.#initHandler();
    this.#target = [];
    this.#proxy = new Proxy(this.#target, this.#handler);
    this.#length = value.length;
    for (let i = 0; i < value.length; i++) {
      this.#target[i] = value[i];
    }
  }
  /**
   * @returns {ProxyHandler<T[]>}
   */
  #initHandler() {
    const that = this;
    return {
      set: (target, key, value) => {
        if (typeof key === "symbol") {
          target[key] = value;
          return true;
        }
        const engine = that.engine;
        engine.prepareSetValue();
        const oldValue = target[key];
        if (that.equals(oldValue, value)) {
          return true;
        }
        target[key] = value;
        if (that.#length !== target.length) {
          const newLength = target.length;
          const oldLength = that.#length;
          that.#length = newLength;
          engine.addUpdate("length", "set", oldLength, newLength);
        }
        if (key !== "length") {
          engine.addUpdate(key, "set", oldValue, value);
        }
        engine.valueChangedCallback();
        return true;
      },
      get: (target, key) => {
        that.getValue();
        return target[key];
      },
      deleteProperty: (target, key) => {
        if (typeof key === "symbol") {
          delete target[key];
          return true;
        }
        if (that.engine.context.modeController.subscribersMode) {
          throw new Error(
            `Collection${that.name ? ` (${that.name})` : ""}: Cannot delete property while subscribers are running`
          );
        }
        const engine = that.engine;
        if (engine.addUpdate(key, "delete", target[
          /** @type {any} */
          key
        ], void 0)) {
          delete target[
            /** @type {any} */
            key
          ];
          engine.valueChangedCallback();
        }
        return true;
      }
    };
  }
  set value(value) {
    if (!Array.isArray(value)) {
      throw new Error(
        `Collection${this.name ? ` (${this.name})` : ""}: Value must be an array`
      );
    }
    const current = this.getValue({ untracked: true });
    if (this.equals(current, value)) {
      return;
    }
    const engine = this.engine;
    engine.prepareSetValue();
    engine.suppressNotifications = true;
    this.#proxy.length = value.length;
    for (let i = 0; i < value.length; i++) {
      this.#proxy[i] = value[i];
    }
    engine.suppressNotifications = false;
    engine.valueChangedCallback();
  }
  /**
   * Returns the proxied array.
   *
   * Mutations through the returned proxy are reactive. When
   * `options.untracked` is `false` (the default), registers this
   * collection as a dependency of the enclosing tracked scope.
   *
   * @param {{ untracked?: boolean }} [options]
   * @returns {T[]}
   */
  getValue(options) {
    super.getValue(options);
    return this.#proxy;
  }
  /**
   * The proxied array.
   *
   * Reading this property registers a dependency. Mutating the returned
   * array — `push`, index assignment, `splice`, and so on — triggers a
   * reactive update.
   *
   * @returns {T[]}
   */
  get value() {
    return this.getValue();
  }
  /**
   * Returns the underlying array without the proxy.
   *
   * Mutations on the returned array do not trigger reactivity. Use for
   * inspection, iteration, or passing to APIs that must receive a plain
   * array — not for state changes.
   *
   * @returns {T[]}
   */
  getRawValue() {
    return this.#target;
  }
  /**
   * Returns a serializable representation of the array contents.
   *
   * @returns {any}
   */
  serialize() {
    return {
      type: "collection",
      value: this.#target.slice()
    };
  }
  /**
   * Applies data previously produced by `serialize()`.
   *
   * Silently ignores malformed input.
   *
   * @param {any} data
   */
  hydrate(data) {
    if (data && typeof data === "object" && Array.isArray(data.value)) {
      this.value = data.value;
    }
  }
};

// src/reactives/ShallowReactive.js
var ShallowReactive = class extends ReactiveItem {
  /** @type {T} */
  #target;
  /** @type {T} */
  #proxy;
  /** @type {ProxyHandler<T>} */
  #handler;
  /**
   * Creates a new ShallowReactive wrapping the given object.
   *
   * @param {T} value - The object to wrap. Must be a plain object.
   * @param {object} [options]
   * @param {string} [options.name] - Debug name used in error messages.
   */
  constructor(value, options = { name: "" }) {
    super(SHALLOW_REACTIVE);
    this.name = options.name || "";
    if (!isPlainObject(value)) {
      throw new Error(
        `ShallowReactive${this.name ? ` (${this.name})` : ""}: value must be an object`
      );
    }
    this.#handler = this.#initHandler();
    this.#target = value;
    this.#proxy = new Proxy(this.#target, this.#handler);
  }
  /**
   * @returns {ProxyHandler<T>}
   */
  #initHandler() {
    const that = this;
    return {
      set: (target, key, value) => {
        if (typeof key === "symbol") {
          target[key] = value;
          return true;
        }
        const engine = that.engine;
        engine.prepareSetValue();
        const oldValue = (
          /** @type {any} */
          target[key]
        );
        if (that.equals(oldValue, value)) {
          return true;
        }
        target[key] = value;
        if (engine.addUpdate(key, "set", oldValue, value)) {
          engine.valueChangedCallback();
        }
        return true;
      },
      get: (target, key) => {
        that.getValue();
        return (
          /** @type {any} */
          target[key]
        );
      },
      deleteProperty: (target, key) => {
        if (typeof key === "symbol") {
          delete /** @type {any} */
          target[key];
          return true;
        }
        if (that.engine.context.modeController.subscribersMode) {
          throw new Error(
            `ShallowReactive${that.name ? ` (${that.name})` : ""}: Cannot delete property while subscribers are running`
          );
        }
        const engine = that.engine;
        if (engine.addUpdate(
          key,
          "delete",
          /** @type {any} */
          target[key],
          void 0
        )) {
          delete /** @type {any} */
          target[key];
          engine.valueChangedCallback();
        }
        return true;
      }
    };
  }
  /**
   * Returns the proxied object.
   *
   * When `options.untracked` is `false` (the default), registers this
   * item as a dependency of the enclosing tracked scope.
   *
   * @param {{ untracked?: boolean }} [options]
   * @returns {T}
   */
  getValue(options) {
    super.getValue(options);
    return this.#proxy;
  }
  /**
   * Replaces the object's properties wholesale.
   *
   * Keys absent from `value` are deleted from the target; new keys are
   * added. The entire operation is batched and produces a single
   * notification.
   *
   * @param {T} value
   */
  setValue(value) {
    this.getValue({ untracked: true });
    this.engine.suppressNotifications = true;
    const currentKeys = Object.keys(this.#proxy);
    const newKeys = Object.keys(value);
    const keysToDelete = currentKeys.filter((key) => !newKeys.includes(key));
    keysToDelete.forEach((key) => delete this.#proxy[key]);
    for (let i = 0; i < newKeys.length; i++) {
      const key = newKeys[i];
      this.#proxy[key] = value[key];
    }
    this.engine.suppressNotifications = false;
    this.engine.valueChangedCallback();
  }
  set value(value) {
    this.setValue(value);
  }
  /**
   * The proxied object.
   *
   * Reading a top-level property registers a dependency on this item.
   * Writing a top-level property schedules an update. Nested properties
   * are not tracked.
   *
   * @returns {T}
   */
  get value() {
    return this.getValue();
  }
  /**
   * Returns the underlying object without the proxy.
   *
   * Mutations on the returned object do not trigger reactivity. Use for
   * inspection or for passing to APIs that must receive a plain object —
   * not for state changes.
   *
   * @returns {T}
   */
  getRawValue() {
    return this.#target;
  }
  /**
   * Returns a serializable representation of the object's own enumerable
   * properties.
   *
   * @returns {any}
   */
  serialize() {
    return {
      type: "shallowReactive",
      value: { ...this.#target }
    };
  }
  /**
   * Applies data previously produced by `serialize()`.
   *
   * Silently ignores malformed input.
   *
   * @param {any} data
   */
  hydrate(data) {
    if (data && typeof data === "object" && isPlainObject(data.value)) {
      this.value = /** @type {T} */
      data.value;
    }
  }
};

// src/complex/Store.js
var Store = class _Store {
  /**
   * Local path of this store within its parent. Empty for the root store.
   * The full path is available via `getPath()`.
   * @type {string}
   */
  path = "";
  /** @type {Map<string, ReactiveItem>} */
  #items = /* @__PURE__ */ new Map();
  /** @type {Map<string, Store>} */
  #childStores = /* @__PURE__ */ new Map();
  /** @type {EventEmitter} */
  #eventEmitter;
  /** @type {boolean} */
  #isDestroyed = false;
  /** @type {Map<string, Set<Function>>} */
  #unsubscribers = /* @__PURE__ */ new Map();
  /** @type {Map<string, import('../core/UpdateDataRecord.js').UpdateDataRecord>} */
  #updates;
  /** @type {UpdateDataRecordManager} */
  #updatesManager;
  #keys = /* @__PURE__ */ new WeakMap();
  #subscriber;
  #muted = false;
  #pendingUpdate = false;
  /** @type {Store | null} */
  #parentStore = null;
  /**
   * Creates a new empty Store.
   */
  constructor() {
    this.#eventEmitter = new EventEmitter();
    this.#updates = /* @__PURE__ */ new Map();
    this.#updatesManager = new UpdateDataRecordManager(this.#updates);
    const that = this;
    this.#eventEmitter.on("clear-updates", () => {
      that.#updates.clear();
    });
    this.#subscriber = (updates, store) => {
      const storeName = that.#keys.get(store) || "";
      updates.forEach((update, localKey) => {
        if (!update.reactiveItem) {
          return;
        }
        if (storeName === "") {
          const key = that.#keys.get(update.reactiveItem);
          const fullPath = localKey === "" ? key : key + "." + localKey;
          that.#updates.set(fullPath, update);
        } else {
          const fullPath = storeName + "." + localKey;
          that.#updates.set(fullPath, update);
        }
      });
      that.#notifySubscribers();
    };
  }
  /**
   * Returns `true` after `destroy()` has been called.
   *
   * After destruction, all mutating methods throw and only this getter
   * remains safe to call.
   *
   * @returns {boolean}
   */
  get isDestroyed() {
    return this.#isDestroyed;
  }
  /**
   * Returns the full path of this store by walking up the parent chain.
   *
   * For a root store, returns `path` — which is `''` unless the user set
   * it manually. For a child store, returns `"parent.getPath() + '.' +
   * this.path"`.
   *
   * @returns {string}
   */
  getPath() {
    if (this.#parentStore) {
      const parentPath = this.#parentStore.getPath();
      return parentPath ? `${parentPath}.${this.path}` : this.path;
    }
    return this.path;
  }
  #notifySubscribers() {
    if (this.#muted) {
      this.#pendingUpdate = true;
    } else {
      this.#eventEmitter.emit("change");
      this.#eventEmitter.emit("clear-updates");
    }
  }
  /**
   * @param {string} key
   * @param {ReactiveItem} reactiveItem
   */
  #addReactiveItem(key, reactiveItem) {
    if (this.#items.has(key)) {
      throw new Error(`Item with key ${key} already exists in the store.`);
    }
    this.#items.set(key, reactiveItem);
    this.#keys.set(reactiveItem, key);
    reactiveItem.path = key;
    const that = this;
    const unsubscriber = reactiveItem.subscribe(this.#subscriber);
    const unsubscriber2 = reactiveItem.onDestroy(() => {
      that.#removeReactiveItem(key);
    });
    if (!this.#unsubscribers.has(key)) {
      this.#unsubscribers.set(key, /* @__PURE__ */ new Set());
    }
    const set = this.#unsubscribers.get(key);
    if (set) {
      set.add(unsubscriber);
      set.add(unsubscriber2);
    }
  }
  /**
   * @param {string} storeName
   * @param {Store} store
   */
  #addStore(storeName, store) {
    if (this.#childStores.has(storeName)) {
      throw new Error(`Child store with key ${storeName} already exists in this store.`);
    }
    this.#childStores.set(storeName, store);
    this.#keys.set(store, storeName);
    store.path = storeName;
    store.#parentStore = this;
    const that = this;
    const unsubscriber = store.subscribe(this.#subscriber);
    const unsubscriber2 = store.onDestroy(() => {
      that.#removeChildStore(storeName);
    });
    if (!this.#unsubscribers.has(storeName)) {
      this.#unsubscribers.set(storeName, /* @__PURE__ */ new Set());
    }
    const set = this.#unsubscribers.get(storeName);
    if (set) {
      set.add(unsubscriber);
      set.add(unsubscriber2);
    }
  }
  /**
   * Adds reactive items or child stores to the store under the given keys.
   *
   * Throws if a key is already registered, or if a value is neither a
   * `ReactiveItem` nor a `Store`.
   *
   * @param {{[key: string]: ReactiveItem | Store}} items
   */
  addItems(items) {
    if (this.isDestroyed) {
      throw new Error("Store has been destroyed");
    }
    for (const [key, item] of Object.entries(items)) {
      if (item instanceof _Store) {
        this.#addStore(key, item);
      } else if (item instanceof ReactiveItem) {
        this.#addReactiveItem(key, item);
      }
    }
  }
  /**
   * @param {string} key
   */
  #destroyChildStore(key) {
    const childStore = this.#childStores.get(key);
    if (!childStore) {
      return;
    }
    this.#removeChildStore(key);
    childStore.destroy();
  }
  /**
   * Destroys the item or child store registered under `key`.
   *
   * When `key` refers to a reactive item, the item is removed from the
   * store and then destroyed. When it refers to a child store, the child
   * store and every item inside it is destroyed recursively. No-op if
   * the key is not present.
   *
   * @param {string} key
   */
  destroyItem(key) {
    if (this.isDestroyed) {
      throw new Error("Store has been destroyed");
    }
    this.#destroyReactiveItem(key);
    this.#destroyChildStore(key);
  }
  /**
   * @param {string} key
   */
  #removeReactiveItem(key) {
    const item = this.#items.get(key);
    if (!item) {
      return;
    }
    this.#items.delete(key);
    this.#keys.delete(item);
    const set = this.#unsubscribers.get(key);
    if (set) {
      for (const fn of set) {
        fn();
      }
      this.#unsubscribers.delete(key);
    }
    this.#updatesManager.removeItem(key);
    this.#notifySubscribers();
  }
  /**
   * @param {string} key
   */
  #removeChildStore(key) {
    const store = this.#childStores.get(key);
    if (!store) {
      return;
    }
    this.#childStores.delete(key);
    this.#keys.delete(store);
    store.#parentStore = null;
    const set = this.#unsubscribers.get(key);
    if (set) {
      for (const fn of set) {
        fn();
      }
      this.#unsubscribers.delete(key);
    }
    this.#updatesManager.removeItem(key);
    this.#notifySubscribers();
  }
  /**
   * @param {string} key
   */
  #destroyReactiveItem(key) {
    const item = this.#items.get(key);
    if (!item) {
      return;
    }
    this.#removeReactiveItem(key);
    item.destroy();
  }
  /**
   * Removes the item or child store registered under `key` from the
   * store, without destroying it.
   *
   * The removed item remains usable and can be re-added to a store (this
   * one or another). No-op if the key is not present.
   *
   * @param {string} key
   */
  removeItem(key) {
    if (this.isDestroyed) {
      throw new Error("Store has been destroyed");
    }
    this.#removeReactiveItem(key);
    this.#removeChildStore(key);
  }
  /**
   * Destroys the store and every item and child store inside it.
   *
   * After this call, all mutating methods throw. Idempotent — subsequent
   * calls are no-ops.
   */
  destroy() {
    if (this.#isDestroyed) {
      return;
    }
    this.#isDestroyed = true;
    this.#items.forEach((item, key) => {
      this.#destroyReactiveItem(key);
    });
    this.#items.clear();
    this.#childStores.forEach((childStore, key) => {
      this.#destroyChildStore(key);
    });
    this.#childStores.clear();
    this.#updates.clear();
    this.#updatesManager = null;
    this.#eventEmitter.emit("destroy", this);
    this.#eventEmitter.removeAllListeners({ removeInternalListeners: true });
    this.#unsubscribers.clear();
  }
  /**
   * Removes all items and child stores without destroying them.
   *
   * After this call the store is empty, but the detached items continue
   * to work and can be re-added elsewhere.
   */
  detachAll() {
    if (this.isDestroyed) {
      throw new Error("Store has been destroyed");
    }
    this.#items.forEach((item, key) => {
      this.#removeReactiveItem(key);
    });
    this.#items.clear();
    this.#childStores.forEach((childStore, key) => {
      this.#removeChildStore(key);
    });
    this.#childStores.clear();
    this.#unsubscribers.clear();
  }
  /**
   * @param {string} key
   * @returns {ReactiveItem | null}
   */
  #getReactiveItem(key) {
    return this.#items.get(key) || null;
  }
  /**
   * @param {string} key
   * @returns {Store | null}
   */
  #getChildStore(key) {
    return this.#childStores.get(key) || null;
  }
  /**
   * Returns the item or child store registered under `key`, or `null` if
   * the key is not present.
   *
   * @param {string} key
   * @returns {ReactiveItem | Store | null}
   */
  getItem(key) {
    if (this.isDestroyed) {
      throw new Error("Store has been destroyed");
    }
    return this.#getReactiveItem(key) || this.#getChildStore(key) || null;
  }
  /**
   * Returns `true` if `key` is registered as either a reactive item or a
   * child store.
   *
   * @param {string} key
   * @returns {boolean}
   */
  hasItem(key) {
    if (this.isDestroyed) {
      throw new Error("Store has been destroyed");
    }
    return this.#items.has(key) || this.#childStores.has(key);
  }
  /**
   * Returns the keys of the store's contents.
   *
   * The `filter` argument narrows the result: `"reactives"` returns only
   * reactive items, `"stores"` returns only child stores, `"all"` (the
   * default) returns both, reactives first.
   *
   * @param {"all" | "reactives" | "stores"} [filter="all"]
   * @returns {Array<string>}
   */
  getItemNames(filter = "all") {
    if (this.isDestroyed) {
      throw new Error("Store has been destroyed");
    }
    if (filter === "reactives") {
      return Array.from(this.#items.keys());
    } else if (filter === "stores") {
      return Array.from(this.#childStores.keys());
    }
    return Array.from(this.#items.keys()).concat(Array.from(this.#childStores.keys()));
  }
  /**
   * Returns the store's contents as a `Map`.
   *
   * The `filter` argument narrows the result the same way as in
   * `getItemNames()`.
   *
   * @param {"all" | "reactives" | "stores"} [filter="all"]
   * @returns {Map<string, ReactiveItem | Store>}
   */
  toMap(filter = "all") {
    if (this.isDestroyed) {
      throw new Error("Store has been destroyed");
    }
    if (filter === "reactives") {
      return this.#items;
    } else if (filter === "stores") {
      return this.#childStores;
    }
    const result = new Map(this.#items);
    this.#childStores.forEach((store, key) => {
      result.set(key, store);
    });
    return result;
  }
  #itemsToJSON() {
    const object = {};
    this.#items.forEach((item, key) => {
      object[key] = item.getValue();
    });
    return object;
  }
  #childStoresToJSON() {
    const object = {};
    this.#childStores.forEach((store, key) => {
      object[key] = store.toJSON();
    });
    return object;
  }
  /**
   * Returns the store's current values as a plain object.
   *
   * Computed values are included — this is a full state dump, not a
   * persistence payload. For persistence, prefer `serialize()`, which
   * omits derived state.
   *
   * The `filter` argument narrows the result the same way as in
   * `getItemNames()`.
   *
   * @param {"all" | "reactives" | "stores"} [filter="all"]
   * @returns {object}
   */
  toJSON(filter = "all") {
    if (this.isDestroyed) {
      throw new Error("Store has been destroyed");
    }
    if (filter === "reactives") {
      return this.#itemsToJSON();
    } else if (filter === "stores") {
      return this.#childStoresToJSON();
    }
    const object = {
      ...this.#itemsToJSON(),
      ...this.#childStoresToJSON()
    };
    return object;
  }
  /**
   * Serializes the store and its children.
   *
   * Items whose `serialize()` returns `null` — notably `Computed` — are
   * omitted. The output is suitable for `hydrate()` and for JSON
   * transport.
   *
   * @returns {any}
   */
  serialize() {
    const items = {};
    this.#items.forEach((item, key) => {
      const data = item.serialize();
      if (data !== null && data !== void 0) {
        items[key] = data;
      }
    });
    const stores = {};
    this.#childStores.forEach((store, key) => {
      stores[key] = store.serialize();
    });
    return {
      type: "store",
      items,
      stores
    };
  }
  /**
   * Applies serialized data produced by `serialize()`.
   *
   * Keys absent from `data` are left untouched; keys present in `data`
   * but not in this store are ignored. Malformed input is a no-op.
   * Runs entirely inside the caller's batch — the context wraps hydration
   * in a batch already.
   *
   * @param {any} data
   */
  hydrate(data) {
    if (!data || typeof data !== "object" || data.type !== "store") {
      return;
    }
    if (data.items && typeof data.items === "object") {
      for (const [key, itemData] of Object.entries(data.items)) {
        const item = this.#items.get(key);
        if (item) {
          item.hydrate(itemData);
        }
      }
    }
    if (data.stores && typeof data.stores === "object") {
      for (const [key, storeData] of Object.entries(data.stores)) {
        const store = this.#childStores.get(key);
        if (store) {
          store.hydrate(storeData);
        }
      }
    }
  }
  /**
   * Subscribes a function to changes across the store's contents.
   *
   * The callback receives a `Map` of dot-separated update paths to
   * `UpdateDataRecord` instances, plus this store as the second
   * argument. It is invoked once per batch of effective changes.
   *
   * @param {(update: Map<string, import('../core/UpdateDataRecord.js').UpdateDataRecord>, store: Store) => void} fn
   * @returns {() => void} An unsubscribe function.
   */
  subscribe(fn) {
    if (this.isDestroyed) {
      throw new Error("Store has been destroyed");
    }
    const that = this;
    return this.#eventEmitter.on("change", () => {
      fn(that.#updates, that);
    });
  }
  /**
   * Registers a callback fired when the store is destroyed.
   *
   * @param {(store: Store) => void} fn
   * @returns {() => void} An unsubscribe function.
   */
  onDestroy(fn) {
    if (this.isDestroyed) {
      throw new Error("Store has been destroyed");
    }
    return this.#eventEmitter.on("destroy", fn);
  }
  /**
   * Suppresses change notifications until `unmuteUpdates()` is called.
   *
   * Mutations that happen while muted are still applied and their
   * updates accumulated; subscribers are notified once, with everything,
   * when the store is unmuted.
   */
  muteUpdates() {
    if (this.isDestroyed) {
      throw new Error("Store has been destroyed");
    }
    this.#muted = true;
  }
  /**
   * Resumes change notifications after `muteUpdates()`.
   *
   * If any updates accumulated while muted, subscribers are notified
   * immediately with the full set.
   */
  unmuteUpdates() {
    if (this.isDestroyed) {
      throw new Error("Store has been destroyed");
    }
    this.#muted = false;
    if (this.#pendingUpdate) {
      this.#pendingUpdate = false;
      this.#notifySubscribers();
    }
  }
  /**
   * Returns `true` if change notifications are currently suppressed.
   *
   * @returns {boolean}
   */
  isMuted() {
    if (this.isDestroyed) {
      throw new Error("Store has been destroyed");
    }
    return this.#muted;
  }
};

// src/complex/ReactiveList.js
function isReactiveWrapper(item) {
  return item instanceof Atom || item instanceof ShallowReactive;
}
var ReactiveList = class {
  /**
   * Local path of this list. Empty unless set by the user. Used by
   * snapshot tooling to build dotted paths when the list is nested inside
   * a `Store`.
   * @type {string}
   */
  path = "";
  /** @type {Atom<number>} */
  #lengthAtom;
  /** @type {Store} */
  #store;
  /**
   * Creates a new empty ReactiveList.
   */
  constructor() {
    this.#store = new Store();
    this.#store.muteUpdates();
    this.#lengthAtom = new Atom(0, { name: "length" });
    this.#store.addItems({ length: this.#lengthAtom });
    this.#store.unmuteUpdates();
  }
  /**
   * @param {any} value
   * @param {string} name
   * @returns {ReactiveWrapper<any>}
   */
  #createReactiveItem(value, name) {
    let item;
    if (isPlainObject(value) || Array.isArray(value)) {
      item = new ShallowReactive(value, { name });
    } else {
      item = new Atom(value, { name });
    }
    item.path = name;
    return item;
  }
  /**
   * @param {ReactiveWrapper<any>} wrapper
   * @param {any} newValue
   */
  #updateReactiveItem(wrapper, newValue) {
    wrapper.value = newValue;
  }
  /**
   * Appends one or more values to the end of the list.
   *
   * Each value is wrapped according to its type — primitives become
   * `Atom`, objects and arrays become `ShallowReactive`. The whole
   * operation produces a single notification, regardless of how many
   * values are added.
   *
   * @param {...T} values
   */
  add(...values) {
    if (this.isDestroyed) {
      throw new Error("ReactiveList has been destroyed");
    }
    if (values.length === 0) {
      return;
    }
    const startIndex = this.#lengthAtom.value;
    const alreadyMuted = this.#store.isMuted();
    this.#store.muteUpdates();
    const wrappers = {};
    for (let i = 0; i < values.length; i++) {
      const idx = startIndex + i;
      wrappers[idx] = this.#createReactiveItem(values[i], idx.toString());
    }
    this.#store.addItems(wrappers);
    for (let i = 0; i < values.length; i++) {
      const idx = startIndex + i;
      this.#updateReactiveItem(wrappers[idx], values[i]);
    }
    this.#lengthAtom.value += values.length;
    if (!alreadyMuted) {
      this.#store.unmuteUpdates();
    }
  }
  /**
   * Returns the value at the given index, or `undefined` if the index is
   * out of bounds.
   *
   * Reads through the reactive wrapper, so a call inside a tracked scope
   * registers a dependency on the item at that index.
   *
   * @param {number} index
   * @returns {T | undefined}
   */
  getItem(index) {
    if (this.isDestroyed) {
      throw new Error("ReactiveList has been destroyed");
    }
    const item = this.#store.getItem(index.toString());
    if (!isReactiveWrapper(item)) {
      return void 0;
    }
    return item.value;
  }
  /**
   * Returns a shallow copy of all items in the list as a plain array.
   *
   * The array is newly allocated on each call; mutating it does not
   * affect the list. Elements that are reactive objects are returned as
   * their underlying values, not as wrappers.
   *
   * @returns {T[]}
   */
  toArray() {
    if (this.isDestroyed) {
      throw new Error("ReactiveList has been destroyed");
    }
    const items = [];
    for (let i = 0; i < this.#lengthAtom.value; i++) {
      const item = this.#store.getItem(i.toString());
      if (isReactiveWrapper(item)) {
        items.push(item.value);
      }
    }
    return items;
  }
  /**
   * Replaces the value at the specified index.
   *
   * The whole operation produces a single notification. No-op if `index`
   * is out of bounds.
   *
   * @param {number} index
   * @param {T} value
   */
  setItem(index, value) {
    if (this.isDestroyed) {
      throw new Error("ReactiveList has been destroyed");
    }
    const wrapper = this.#store.getItem(index.toString());
    if (!isReactiveWrapper(wrapper)) {
      return;
    }
    const alreadyMuted = this.#store.isMuted();
    this.#store.muteUpdates();
    wrapper.value = value;
    if (!alreadyMuted) {
      this.#store.unmuteUpdates();
    }
  }
  /**
   * The current number of items in the list.
   *
   * Reading this property inside a tracked scope registers a dependency,
   * so the enclosing effect re-runs whenever items are added or removed.
   *
   * @returns {number}
   */
  get length() {
    if (this.isDestroyed) {
      throw new Error("ReactiveList has been destroyed");
    }
    return this.#lengthAtom.value;
  }
  /**
   * Replaces the entire content of the list with the given array.
   *
   * Existing positions are updated in place; positions beyond the new
   * length are destroyed; new positions are created. The whole operation
   * produces a single notification.
   *
   * @param {T[]} values
   */
  setItems(values) {
    if (this.isDestroyed) {
      throw new Error("ReactiveList has been destroyed");
    }
    const alreadyMuted = this.#store.isMuted();
    this.#store.muteUpdates();
    const currentLen = this.#lengthAtom.value;
    const newLen = values.length;
    if (newLen < currentLen) {
      for (let i = newLen; i < currentLen; i++) {
        this.#store.destroyItem(i.toString());
      }
      this.#lengthAtom.value = newLen;
      for (let i = 0; i < newLen; i++) {
        const wrapper = this.#store.getItem(i.toString());
        if (isReactiveWrapper(wrapper)) {
          wrapper.value = values[i];
        }
      }
    } else {
      for (let i = 0; i < currentLen; i++) {
        const wrapper = this.#store.getItem(i.toString());
        if (isReactiveWrapper(wrapper)) {
          wrapper.value = values[i];
        }
      }
      const wrappers = {};
      for (let i = currentLen; i < newLen; i++) {
        wrappers[i] = this.#createReactiveItem(values[i], i.toString());
      }
      this.#store.addItems(wrappers);
      for (let i = currentLen; i < newLen; i++) {
        this.#updateReactiveItem(wrappers[i], values[i]);
      }
      this.#lengthAtom.value = newLen;
    }
    if (!alreadyMuted) {
      this.#store.unmuteUpdates();
    }
  }
  /**
   * Removes `count` items starting at `startIndex`.
   *
   * Remaining items shift left to fill the gap; the tail positions are
   * destroyed. The whole operation produces a single notification.
   *
   * No-op if `count <= 0`, `startIndex < 0`, or `startIndex >= length`.
   * If `count` exceeds the number of items from `startIndex` to the end,
   * it is clamped.
   *
   * @param {number} startIndex
   * @param {number} count
   */
  removeRange(startIndex, count) {
    if (this.isDestroyed) {
      throw new Error("ReactiveList has been destroyed");
    }
    if (count <= 0) {
      return;
    }
    const oldLen = this.#lengthAtom.value;
    if (startIndex < 0 || startIndex >= oldLen) {
      return;
    }
    const actualCount = Math.min(count, oldLen - startIndex);
    if (actualCount === 0) {
      return;
    }
    const newLen = oldLen - actualCount;
    const alreadyMuted = this.#store.isMuted();
    this.#store.muteUpdates();
    for (let i = startIndex; i < newLen; i++) {
      const srcIndex = i + actualCount;
      const srcItem = this.#store.getItem(srcIndex.toString());
      const destItem = this.#store.getItem(i.toString());
      if (isReactiveWrapper(srcItem) && isReactiveWrapper(destItem)) {
        destItem.value = srcItem.value;
      } else if (isReactiveWrapper(destItem)) {
        destItem.value = void 0;
      }
    }
    for (let i = newLen; i < oldLen; i++) {
      this.#store.destroyItem(i.toString());
    }
    this.#lengthAtom.value = newLen;
    if (!alreadyMuted) {
      this.#store.unmuteUpdates();
    }
  }
  /**
   * Removes the item at the given index.
   *
   * Shorthand for `removeRange(index, 1)`. No-op if `index` is out of
   * bounds.
   *
   * @param {number} index
   */
  removeItem(index) {
    this.removeRange(index, 1);
  }
  /**
   * Removes the last item. No-op if the list is empty.
   */
  removeLastItem() {
    this.removeRange(this.#lengthAtom.value - 1, 1);
  }
  /**
   * Removes the first item. No-op if the list is empty.
   */
  removeFirstItem() {
    this.removeRange(0, 1);
  }
  /**
   * Removes all items from the list.
   *
   * The length becomes `0` and every item is destroyed.
   */
  clear() {
    this.removeRange(0, this.#lengthAtom.value);
  }
  /**
   * Destroys the list and releases its internal store.
   *
   * After this call, all mutating methods throw. Idempotent — subsequent
   * calls are no-ops.
   */
  destroy() {
    if (this.isDestroyed) {
      return;
    }
    this.#store.destroy();
  }
  /**
   * Returns `true` after `destroy()` has been called.
   *
   * After destruction, all mutating methods throw and only this getter
   * remains safe to call.
   *
   * @returns {boolean}
   */
  get isDestroyed() {
    return this.#store.isDestroyed;
  }
  /**
   * Subscribes a function to changes of the list.
   *
   * The callback receives a `Map` of update paths to `UpdateDataRecord`
   * instances. It is invoked once per batch of effective changes,
   * regardless of how many items were affected.
   *
   * @param {(updates: Map<string, import('../core/UpdateDataRecord.js').UpdateDataRecord>) => void} fn
   * @returns {() => void} An unsubscribe function.
   */
  subscribe(fn) {
    if (this.isDestroyed) {
      throw new Error("ReactiveList has been destroyed");
    }
    return this.#store.subscribe(fn);
  }
  /**
   * Returns a serializable representation of the list's contents.
   *
   * The shape is `{ type: 'list', value: [...] }`, matching the
   * serialization protocol used by reactive items.
   *
   * @returns {any}
   */
  serialize() {
    return {
      type: "list",
      value: this.toArray()
    };
  }
  /**
   * Applies data produced by `serialize()`.
   *
   * Uses `setItems` internally, so the whole replacement is batched and
   * subscribers fire once. Silently ignores malformed input.
   *
   * @param {any} data
   */
  hydrate(data) {
    if (data && typeof data === "object" && data.type === "list" && Array.isArray(data.value)) {
      this.setItems(data.value);
    }
  }
};

// src/api/api.js
function collectDependencies(fn) {
  const tracker = getCurrentContext().dependencyTracker;
  tracker.enable();
  let deps;
  try {
    fn();
    deps = tracker.data;
  } finally {
    tracker.disable();
  }
  return deps;
}
function createReactiveSubscription(dataFn, effectFn, options = {}) {
  const ctx = getCurrentContext();
  const {
    name = "",
    delay = 0,
    signal = void 0,
    onError = void 0,
    recomputeDependencies = true,
    isAutorun = false,
    passUpdates = false
  } = options;
  if (ctx.modeController.untrackMode) {
    throw new Error(
      `Cannot initialize reactive subscription${name ? ` (${name})` : ""} when untrackMode is on.`
    );
  }
  const finalEffect = delay > 0 ? debounce(effectFn, delay) : effectFn;
  let unsubscribers = [];
  let isActive = true;
  let isRunning = false;
  let staticDependencies = null;
  const collectedUpdates = /* @__PURE__ */ new Map();
  const onChange = (updates) => {
    if (updates && passUpdates) {
      for (const [key, record] of updates) {
        collectedUpdates.set(key, record);
      }
    }
    run();
  };
  function subscribeTo(deps) {
    const unsubs = [];
    for (const item of deps) {
      const unsub = item.subscribe(onChange, { signal });
      unsubs.push(unsub);
    }
    return unsubs;
  }
  function run() {
    if (!isActive || isRunning) {
      return;
    }
    isRunning = true;
    try {
      if (recomputeDependencies) {
        for (const unsub of unsubscribers) {
          try {
            unsub();
          } catch (e) {
            console.error(e);
          }
        }
        unsubscribers = [];
        const deps = collectDependencies(dataFn);
        if (deps.size === 0) {
          throw new Error(`No reactive items found${name ? ` (${name})` : ""}.`);
        }
        unsubscribers = subscribeTo(deps);
      }
      const shouldRunEffect = !isAutorun || !recomputeDependencies;
      if (shouldRunEffect) {
        const updatesForEffect = passUpdates && collectedUpdates.size > 0 ? new Map(collectedUpdates) : void 0;
        collectedUpdates.clear();
        ctx.modeController.enterBatch();
        try {
          finalEffect(updatesForEffect);
        } finally {
          ctx.modeController.exitBatch();
        }
      }
    } catch (error) {
      if (onError) {
        onError(error);
      }
      throw error;
    } finally {
      isRunning = false;
    }
  }
  const initialDeps = collectDependencies(dataFn);
  if (initialDeps.size === 0) {
    throw new Error(`No reactive items found${name ? ` (${name})` : ""}.`);
  }
  if (recomputeDependencies) {
    unsubscribers = subscribeTo(initialDeps);
  } else {
    staticDependencies = initialDeps;
    unsubscribers = subscribeTo(staticDependencies);
  }
  return function unsubscribe() {
    isActive = false;
    for (const unsub of unsubscribers) {
      try {
        unsub();
      } catch (e) {
        console.error(e);
      }
    }
    unsubscribers = [];
    staticDependencies = null;
    collectedUpdates.clear();
  };
}
function autorun(fn, options = {}) {
  return createReactiveSubscription(fn, fn, {
    ...options,
    recomputeDependencies: options.recomputeDependencies ?? true,
    isAutorun: true,
    passUpdates: false
  });
}
function reaction(dataFn, effectFn, options = {}) {
  return createReactiveSubscription(dataFn, effectFn, {
    ...options,
    recomputeDependencies: options.recomputeDependencies ?? true,
    passUpdates: options.passUpdates ?? true,
    isAutorun: false
  });
}
function when(predicate, fn, options) {
  const computed2 = new Computed(predicate, { name: "when" });
  const timeout = options?.timeout || 0;
  let timer = null;
  const mainUnsubscriber = function() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    unsubscribe();
    computed2.destroy();
  };
  const unsubscribe = computed2.subscribe(() => {
    if (computed2.value) {
      fn();
    }
  }, options);
  if (timeout > 0) {
    timer = setTimeout(() => {
      mainUnsubscriber();
    }, timeout);
  }
  return mainUnsubscriber;
}
function waitUntil(predicate, options) {
  return new Promise((resolve) => {
    const computed2 = new Computed(predicate, { name: "waitUntil" });
    const timeout = options?.timeout || 0;
    let timer = null;
    const mainUnsubscriber = function() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      unsubscribe();
      computed2.destroy();
    };
    const unsubscribe = computed2.subscribe(() => {
      if (computed2.value) {
        mainUnsubscriber();
        resolve();
      }
    });
    if (timeout > 0) {
      timer = setTimeout(() => {
        mainUnsubscriber();
      }, timeout);
    }
  });
}
function runInAction(fn) {
  const ctx = getCurrentContext();
  if (ctx.modeController.subscribersMode) {
    ctx.modeController.runAfterSubscribers(() => {
      ctx.batch(fn);
    });
  } else {
    ctx.batch(fn);
  }
}
function batch(nameOrFn, fn) {
  return getCurrentContext().batch(nameOrFn, fn);
}
function action(name, fn, payload) {
  return getCurrentContext().action(name, fn, payload);
}
function untrack(fn) {
  const modeController2 = getCurrentContext().modeController;
  const previous = modeController2.untrackMode;
  modeController2.untrackMode = true;
  try {
    return fn();
  } finally {
    modeController2.untrackMode = previous;
  }
}
function getNow(interval = 1e3) {
  const nowAtom = new Atom(0, { name: "now" });
  let intervalId;
  nowAtom.onHasSubscribers(() => {
    intervalId = setInterval(() => {
      runInAction(() => {
        nowAtom.value = Date.now();
      });
    }, interval);
  });
  nowAtom.onNoSubscribers(() => {
    if (intervalId !== void 0) {
      clearInterval(intervalId);
    }
    runInAction(() => {
      nowAtom.value = 0;
    });
  });
  nowAtom.onDestroy(() => {
    if (intervalId !== void 0) {
      clearInterval(intervalId);
    }
  });
  return nowAtom;
}
function fromPromise(promise) {
  const stateAtom = new Atom("pending", { name: "fromPromise" });
  let promiseResult;
  let promiseError;
  async function caseMethod(param0) {
    if (param0.pending) {
      try {
        param0.pending();
      } catch (e) {
        console.error(e);
      }
    }
    stateAtom.subscribe(() => {
      if (stateAtom.value === "resolved") {
        try {
          if (param0.resolved) {
            param0.resolved(promiseResult);
          }
        } catch (e) {
          console.error(e);
        }
      }
      if (stateAtom.value === "rejected") {
        try {
          if (param0.rejected) {
            param0.rejected(promiseError);
          }
        } catch (e) {
          console.error(e);
        }
      }
    });
    return promise.then((value) => {
      promiseResult = value;
      stateAtom.value = "resolved";
    }).catch((e) => {
      promiseError = e;
      stateAtom.value = "rejected";
    }).finally(() => {
      stateAtom.destroy();
    });
  }
  return { case: caseMethod };
}
function atom(value, options) {
  return new Atom(value, options);
}
function computed(fn, options) {
  return new Computed(fn, options);
}
function collection(value, options) {
  return new Collection(value, options);
}
function shallowReactive(value, options) {
  return new ShallowReactive(value, options);
}
function makeObservable(obj, annotations, options) {
  const reactiveStore = {};
  const _options = Object.assign({ name: "" }, options);
  for (const key in annotations) {
    if (annotations[key] === false) {
      continue;
    }
    if (
      /** @type {Array<string | boolean>} */
      [
        "atom",
        "collection",
        "shallowReactive"
      ].includes(annotations[key])
    ) {
      if (annotations[key] === "atom") {
        reactiveStore[key] = new Atom(obj[key], {
          name: _options.name + "." + key
        });
      }
      if (annotations[key] === "collection") {
        reactiveStore[key] = new Collection(obj[key], {
          name: _options.name + "." + key
        });
      }
      if (annotations[key] === "shallowReactive") {
        reactiveStore[key] = new ShallowReactive(obj[key], {
          name: _options.name + "." + key
        });
      }
      const existingDescriptor = Object.getOwnPropertyDescriptor(obj, key);
      Object.defineProperty(obj, key, {
        get() {
          return reactiveStore[key].getValue();
        },
        set(value) {
          reactiveStore[key].value = value;
        },
        enumerable: existingDescriptor?.enumerable ?? true,
        configurable: existingDescriptor?.configurable ?? true
      });
    }
  }
  const allDescriptors = getAllPropertyDescriptors(obj);
  for (const key in annotations) {
    if (annotations[key] === "computed") {
      const descriptor = allDescriptors[key];
      if (descriptor && typeof descriptor.get === "function") {
        const f = descriptor.get;
        reactiveStore[key] = new Computed(
          function() {
            return f.call(obj);
          },
          { name: _options.name + "." + key }
        );
        const existingDescriptor = Object.getOwnPropertyDescriptor(obj, key);
        Object.defineProperty(obj, key, {
          get() {
            return reactiveStore[key].getValue();
          },
          enumerable: existingDescriptor?.enumerable ?? true,
          configurable: existingDescriptor?.configurable ?? true
        });
      }
    }
  }
  return obj;
}
function extendObservable(target, properties, overrides, options) {
  Object.assign(
    /** @type {T & R} */
    /** @type {unknown} */
    target,
    properties
  );
  makeAutoObservable(target, overrides, options, new Set(Object.keys(properties)));
  return (
    /** @type {T & R} */
    target
  );
}
function makeAutoObservable(obj, overrides = {}, options, filter) {
  const _options = Object.assign({ name: "" }, options);
  const allDescriptors = getAllPropertyDescriptors(obj);
  const atomKeys = /* @__PURE__ */ new Set();
  const computedKeys = /* @__PURE__ */ new Set();
  Object.entries(allDescriptors).forEach((descriptorObject) => {
    const key = descriptorObject[0];
    const descriptor = descriptorObject[1];
    if (filter !== void 0 && !filter.has(key)) {
      return;
    }
    if (/^__/.test(key)) {
      return;
    }
    if (descriptor.set || descriptor.enumerable) {
      atomKeys.add(key);
    }
    if (descriptor.get) {
      computedKeys.add(key);
    }
  });
  let annotations = {};
  let keys = [...atomKeys];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (overrides[key] === false) {
      continue;
    }
    if (typeof obj[key] === "function") {
      continue;
    }
    if (Array.isArray(obj[key])) {
      annotations[key] = "collection";
      continue;
    }
    if (isPlainObject(obj[key])) {
      annotations[key] = "shallowReactive";
      continue;
    }
    annotations[key] = "atom";
  }
  keys = [...computedKeys];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (overrides[key] === false) {
      continue;
    }
    annotations[key] = "computed";
  }
  annotations = Object.assign({}, annotations, overrides);
  return makeObservable(obj, annotations, _options);
}

// src/plugins/devtools.js
var DevToolsPlugin = class {
  /**
   * Plugin identifier. Also used as the default display name in the
   * Redux DevTools Extension when no `name` option is provided.
   */
  name = "devtools";
  /** @type {import('../core/context.js').Store2Context | null} */
  #context = null;
  /** @type {Array<DevToolsEntry>} */
  #entries = [];
  /** @type {number} */
  #maxAge;
  /** @type {number} */
  #nextId = 0;
  /** @type {number} */
  #currentIndex = -1;
  /** @type {any} */
  #extension = null;
  /** @type {(() => void) | null} */
  #extensionUnsubscribe = null;
  /** @type {boolean} */
  #isTimeTraveling = false;
  /** @type {Set<(entry: DevToolsEntry | null, index: number) => void>} */
  #listeners = /* @__PURE__ */ new Set();
  /** @type {DevToolsOptions} */
  #options;
  /**
   * @param {DevToolsOptions} [options]
   */
  constructor(options = {}) {
    this.#maxAge = options.maxAge ?? 50;
    this.#options = options;
  }
  /**
   * Called by the context when the plugin is registered via `use()`.
   *
   * Captures the initial baseline snapshot and connects to the Redux
   * DevTools Extension when it is available in the host environment.
   *
   * Do not call this method directly — it is part of the plugin
   * installation contract.
   *
   * @param {import('../core/context.js').Store2Context} context
   */
  install(context) {
    this.#context = context;
    this.#recordEntry("@@INIT", 0);
    if (this.#options.connectToExtension !== false) {
      this.#tryConnectToExtension();
    }
  }
  /**
   * Records a new history entry after an action completes.
   *
   * Called by the context's action lifecycle. Ignored while a time-travel
   * jump is in progress, so that rewinding does not itself appear as a
   * new action in the history.
   *
   * @param {import('../types.js').ActionInfo} action
   */
  onActionEnd(action2) {
    if (this.#isTimeTraveling) {
      return;
    }
    const durationMs = action2.endTime !== null ? action2.endTime - action2.startTime : 0;
    const entry = this.#recordEntry(action2.name, durationMs);
    if (this.#extension && entry) {
      try {
        this.#extension.send(action2.name, entry.snapshot);
      } catch (e) {
        console.warn("[store2-devtools] failed to send to extension:", e);
      }
    }
  }
  /**
   * Appends a new entry to the history, truncating any future entries that
   * were superseded by a time-travel followed by a fresh action.
   *
   * @param {string} name
   * @param {number} durationMs
   * @returns {DevToolsEntry | null}
   */
  #recordEntry(name, durationMs) {
    if (!this.#context) {
      return null;
    }
    if (this.#currentIndex < this.#entries.length - 1) {
      this.#entries.splice(this.#currentIndex + 1);
    }
    const entry = {
      id: this.#nextId++,
      name,
      timestamp: Date.now(),
      durationMs,
      snapshot: this.#context.snapshot()
    };
    this.#entries.push(entry);
    while (this.#entries.length > this.#maxAge) {
      this.#entries.shift();
    }
    this.#currentIndex = this.#entries.length - 1;
    this.#emitChange();
    return entry;
  }
  #emitChange() {
    const entry = this.#entries[this.#currentIndex] || null;
    for (const listener of this.#listeners) {
      try {
        listener(entry, this.#currentIndex);
      } catch (e) {
        console.error("[store2-devtools] listener threw:", e);
      }
    }
  }
  /**
   * Returns a shallow copy of the recorded history.
   *
   * The returned array is newly allocated; mutating it does not affect
   * the plugin. The snapshot objects inside each entry are shared by
   * reference — treat them as immutable.
   *
   * @returns {Array<DevToolsEntry>}
   */
  getHistory() {
    return this.#entries.map((e) => ({ ...e }));
  }
  /**
   * Returns the index of the entry the plugin is currently positioned at.
   *
   * Entry `0` is the baseline; higher indices correspond to completed
   * actions in order. Returns `-1` if the plugin has not been installed
   * yet.
   *
   * @returns {number}
   */
  getCurrentIndex() {
    return this.#currentIndex;
  }
  /**
   * Returns the entry at the current history index, or `null` if the
   * history is empty.
   *
   * After `jumpTo(index)`, the returned entry is the one at that index,
   * not the most recent one. Use `getHistory()` to inspect the full
   * history.
   *
   * @returns {DevToolsEntry | null}
   */
  getCurrentEntry() {
    return this.#entries[this.#currentIndex] ?? null;
  }
  /**
   * Travels to a specific history index.
   *
   * Restores the state captured at that entry by calling
   * `context.hydrate(snapshot, { timeTravel: true })`. Plugin hooks are
   * suppressed for the duration of the hydration, so the jump does not
   * appear as a new action. Subscribers still run — the UI updates.
   *
   * No-op if the index is out of range or already current.
   *
   * @param {number} index
   */
  jumpTo(index) {
    if (!this.#context) {
      return;
    }
    if (index < 0 || index >= this.#entries.length) {
      return;
    }
    if (index === this.#currentIndex) {
      return;
    }
    const entry = this.#entries[index];
    this.#isTimeTraveling = true;
    try {
      this.#context.hydrate(entry.snapshot, { timeTravel: true });
      this.#currentIndex = index;
    } finally {
      this.#isTimeTraveling = false;
    }
    this.#emitChange();
  }
  /**
   * Clears the history and records a fresh baseline.
   *
   * Called by the plugin itself in response to a `RESET` message from the
   * Redux DevTools Extension, or directly by user code. After this call,
   * the history contains exactly one entry: the new baseline.
   */
  reset() {
    this.#entries.length = 0;
    this.#currentIndex = -1;
    this.#nextId = 0;
    this.#recordEntry("@@INIT", 0);
  }
  /**
   * Subscribes a listener called whenever the current index or the
   * history changes.
   *
   * The listener receives the current entry (or `null` if the history is
   * empty) and its index. Errors thrown by the listener are caught and
   * logged, so one faulty listener cannot break others.
   *
   * @param {(entry: DevToolsEntry | null, index: number) => void} fn
   * @returns {() => void} An unsubscribe function.
   */
  subscribe(fn) {
    this.#listeners.add(fn);
    return () => {
      this.#listeners.delete(fn);
    };
  }
  /**
   * Detaches from the Redux DevTools Extension, if connected.
   *
   * Safe to call when no extension is connected or after the plugin was
   * installed with `connectToExtension: false`. Idempotent.
   */
  disconnect() {
    if (this.#extensionUnsubscribe) {
      try {
        this.#extensionUnsubscribe();
      } catch (e) {
        console.warn("[store2-devtools] failed to unsubscribe:", e);
      }
      this.#extensionUnsubscribe = null;
    }
    this.#extension = null;
  }
  #tryConnectToExtension() {
    const g = (
      /** @type {any} */
      globalThis
    );
    const ext = g.__REDUX_DEVTOOLS_EXTENSION__;
    if (!ext || typeof ext.connect !== "function") {
      return;
    }
    try {
      this.#extension = ext.connect({
        name: this.#options.name || "store2",
        features: {
          pause: false,
          lock: false,
          persist: false,
          export: true,
          import: "custom",
          jump: true,
          skip: false,
          reorder: false,
          dispatch: false,
          test: false
        }
      });
      if (this.#context) {
        try {
          this.#extension.init(this.#context.snapshot());
        } catch (e) {
          console.warn("[store2-devtools] extension.init failed:", e);
        }
      }
      if (typeof this.#extension.subscribe === "function") {
        const unsubscribe = this.#extension.subscribe(
          /** @param {any} message */
          (message) => {
            this.#handleExtensionMessage(message);
          }
        );
        if (typeof unsubscribe === "function") {
          this.#extensionUnsubscribe = unsubscribe;
        }
      }
    } catch (e) {
      console.warn("[store2-devtools] failed to connect to extension:", e);
      this.#extension = null;
    }
  }
  /**
   * Handles messages from the Redux DevTools Extension.
   *
   * The extension tracks actions independently of our history. We sent the
   * baseline via `init()`, so its action list is offset by one relative to
   * our entry list: extension action `N` corresponds to our entry `N + 1`.
   * `JUMP_TO_STATE` refers to the initial state, i.e. our entry `0`.
   *
   * @param {any} message
   */
  #handleExtensionMessage(message) {
    if (!message || typeof message !== "object") {
      return;
    }
    if (message.type !== "DISPATCH") {
      return;
    }
    const payload = message.payload;
    if (!payload) {
      return;
    }
    if (payload.type === "JUMP_TO_ACTION") {
      const extIndex = Number(payload.actionId);
      if (Number.isFinite(extIndex)) {
        this.jumpTo(extIndex + 1);
      }
    } else if (payload.type === "JUMP_TO_STATE") {
      this.jumpTo(0);
    } else if (payload.type === "RESET") {
      this.reset();
    }
  }
};
function createDevToolsPlugin(options = {}) {
  return new DevToolsPlugin(options);
}
export {
  Atom,
  Collection,
  Computed,
  DevToolsPlugin,
  ReactiveItem,
  ReactiveList,
  ShallowReactive,
  Store,
  Store2Context,
  action,
  atom,
  autorun,
  batch,
  clone,
  collection,
  compareAny,
  comparePlainObjects,
  computed,
  createDevToolsPlugin,
  createStore2Context,
  debounce,
  defaultContext,
  extendObservable,
  fromPromise,
  getAllPropertyDescriptors,
  getCurrentContext,
  getError,
  getItemNamesFromSet,
  getNow,
  getSortedReactiveItems,
  isPlainObject,
  makeAutoObservable,
  makeObservable,
  reaction,
  runInAction,
  runWithContext,
  shallowReactive,
  sleep,
  sortReactiveItems,
  untrack,
  waitUntil,
  when
};
