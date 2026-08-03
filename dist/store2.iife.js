var Store2 = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.js
  var index_exports = {};
  __export(index_exports, {
    Atom: () => Atom,
    Collection: () => Collection,
    Computed: () => Computed,
    ReactiveItem: () => ReactiveItem,
    ReactiveList: () => ReactiveList,
    ShallowReactive: () => ShallowReactive,
    Store: () => Store,
    atom: () => atom,
    autorun: () => autorun,
    batch: () => batch,
    clone: () => clone,
    collection: () => collection,
    compareAny: () => compareAny,
    comparePlainObjects: () => comparePlainObjects,
    computed: () => computed,
    debounce: () => debounce,
    extendObservable: () => extendObservable,
    fromPromise: () => fromPromise,
    getAllPropertyDescriptors: () => getAllPropertyDescriptors,
    getError: () => getError,
    getItemNamesFromSet: () => getItemNamesFromSet,
    getNow: () => getNow,
    getSortedReactiveItems: () => getSortedReactiveItems,
    isPlainObject: () => isPlainObject,
    makeAutoObservable: () => makeAutoObservable,
    makeObservable: () => makeObservable,
    reaction: () => reaction,
    runInAction: () => runInAction,
    shallowReactive: () => shallowReactive,
    sleep: () => sleep,
    sortReactiveItems: () => sortReactiveItems,
    untrack: () => untrack,
    waitUntil: () => waitUntil,
    when: () => when
  });

  // src/services/idService.js
  var IdService = class {
    /** @type {number} */
    #counter = 0;
    /**
     * Generates a new unique numeric identifier.
     * @returns {number} A new unique number.
     */
    generateId() {
      return this.#counter++;
    }
    /**
     * Compares two numeric identifiers.
     * @param {number} a - First identifier.
     * @param {number} b - Second identifier.
     * @returns {number} Negative if a < b, positive if a > b, zero if equal.
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
     * Resets the counter to zero (useful for testing).
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

  // src/helpers/tools.js
  function sortReactiveItems(a, b) {
    return idService.compareIds(a.engine.id, b.engine.id);
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
      if (a === null || typeof a !== "object") {
        return true;
      }
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
      if (!(item instanceof ReactiveItem)) {
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

  // src/core/subscribeController.js
  var SubscribeController = class {
    /** @type {EventEmitter} */
    #emitter;
    constructor() {
      this.#emitter = new EventEmitter();
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
     * @param {(updates: Map<string, UpdateDataRecord>) => void} fn
     * @param {{ delay?: number, signal?: AbortSignal }} [options]
     * @returns {() => void}
     */
    subscribe(fn, options) {
      const { delay = 0, signal } = options || {};
      const wrappedFn = delay > 0 ? debounce(fn, delay) : fn;
      return this.#emitter.on("change", wrappedFn, { signal });
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

  // src/services/modeController.js
  var ModeControllerService = class {
    isComputing = false;
    untrackMode = false;
    throwErrorInSubscribers = true;
    #batchDepth = 0;
    #subscribersMode = false;
    /** @type {EventEmitter<"batchModeStart"|"batchModeEnd"|"beforeBatchModeEnd">} */
    batchModeEvents;
    /** @type {EventEmitter<"subscribersModeEnd">} */
    subscribersModeEvents;
    constructor() {
      this.batchModeEvents = new EventEmitter();
      this.subscribersModeEvents = new EventEmitter();
    }
    /**
     * Subscribes a function to be called whenever the given event is triggered.
     * @param {"batchModeStart"|"batchModeEnd"|"beforeBatchModeEnd"} event - The event to subscribe to.
     * @param {function():void} callback - The function to be called.
     * @returns {()=>void} A function that unsubscribes the given function.
     */
    on(event, callback) {
      return this.batchModeEvents.on(event, callback);
    }
    /**
     * Returns true if currently inside a batch (batch depth > 0).
     * @returns {boolean}
     */
    get batchMode() {
      return this.#batchDepth > 0;
    }
    /**
     * Enters a batch mode. Increments the batch depth.
     * Emits "batchModeStart" when entering the first batch.
     */
    enterBatch() {
      const wasInBatch = this.batchMode;
      this.#batchDepth++;
      if (!wasInBatch) {
        this.batchModeEvents.emit("batchModeStart");
      }
    }
    /**
     * Exits a batch mode. Decrements the batch depth.
     * If exiting the last batch, emits "beforeBatchModeEnd" and then "batchModeEnd".
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
      }
    }
    /**
     * Retrieves whether any subscribers are currently running.
     * @returns {boolean}
     */
    get subscribersMode() {
      return this.#subscribersMode;
    }
    /**
     * Sets the state to indicate that subscribers are currently running.
     */
    startSubscribersMode() {
      this.#subscribersMode = true;
    }
    /**
     * Sets the state to indicate that no subscribers are currently running.
     */
    endSubscribersMode() {
      if (!this.#subscribersMode) {
        return;
      }
      this.#subscribersMode = false;
      this.subscribersModeEvents.emit("subscribersModeEnd");
    }
    /**
     * Subscribes a function to be called once after all subscribers have finished running.
     * @param {Function} callback
     */
    runAfterSubscribers(callback) {
      this.subscribersModeEvents.once("subscribersModeEnd", callback);
    }
  };
  var modeController = new ModeControllerService();

  // src/services/changedItemsController.js
  var ChangedItemsController = class {
    /** @type {Set<ReactiveItem>} */
    items = /* @__PURE__ */ new Set();
    /**
     * Adds a reactive item to the set of changed items.
     * If not in batch mode, immediately runs subscribers and clears the set.
     * @param {ReactiveItem} item - The reactive item that changed.
     */
    addItem(item) {
      this.items.add(item);
      if (!modeController.batchMode) {
        this.runSubscribers();
        this.clear();
      }
    }
    /**
     * @param {ReactiveItem} item
     */
    removeItem(item) {
      this.items.delete(item);
    }
    /**
     * Removes all items from the changed items set.
     */
    clear() {
      this.items.clear();
    }
    /**
     * Runs all subscribers for the changed items.
     * Processes dependency trees, recalculates stale computed values,
     * and invokes subscriber callbacks with update records.
     * Handles errors and aggregates them if multiple occur.
     */
    runSubscribers() {
      const changedItemsWithUpdates = /* @__PURE__ */ new Set();
      this.items.forEach((item) => {
        if (modeController.batchMode === true) {
          if (item.engine.checkChangesTemporary()) {
            changedItemsWithUpdates.add(item);
          }
        } else {
          if (item.engine.hasUpdates()) {
            changedItemsWithUpdates.add(item);
          }
        }
      });
      const itemsToRecalc = /* @__PURE__ */ new Set();
      changedItemsWithUpdates.forEach((item) => {
        item.engine.getDeepDependents().forEach((dep) => {
          if (dep.hasSubscribers()) {
            itemsToRecalc.add(dep);
          }
        });
      });
      Array.from(itemsToRecalc).sort(sortReactiveItems).forEach((item) => {
        item.getValue();
      });
      itemsToRecalc.clear();
      changedItemsWithUpdates.clear();
      if (modeController.batchMode === true) {
        this.items.forEach((item) => {
          if (item.engine.checkChangesTemporary()) {
            changedItemsWithUpdates.add(item);
          }
        });
      } else {
        this.items.forEach((item) => {
          if (item.engine.hasUpdates()) {
            changedItemsWithUpdates.add(item);
          }
        });
      }
      const changedItemsWithUpdatesSorted = Array.from(changedItemsWithUpdates).filter((item) => item.hasSubscribers()).sort(sortReactiveItems);
      modeController.startSubscribersMode();
      const usedSubscribers = /* @__PURE__ */ new Set();
      const errors = [];
      for (let i = 0; i < changedItemsWithUpdatesSorted.length; i++) {
        const item = changedItemsWithUpdatesSorted[i];
        const itemSubscribers = item.engine.subscribeController.getSubscribers();
        for (const subscriber of itemSubscribers) {
          if (usedSubscribers.has(subscriber)) {
            continue;
          }
          usedSubscribers.add(subscriber);
          try {
            subscriber(item.engine.updates);
          } catch (e) {
            const err = getError(e);
            const error = new Error(`Error in ${item.name}: ${err.message}`, { cause: item });
            error.stack = err.stack;
            errors.push(error);
          }
        }
        item.engine.clearUpdates();
      }
      this.items.forEach((item) => {
        item.engine.clearUpdates();
      });
      usedSubscribers.clear();
      this.items.clear();
      modeController.endSubscribersMode();
      if (modeController.throwErrorInSubscribers) {
        for (let i = 0; i < errors.length; i++) {
          const error = errors[i];
          throw error;
        }
      }
    }
  };
  modeController.on("beforeBatchModeEnd", () => {
    changedItemsController.runSubscribers();
    changedItemsController.clear();
  });
  var changedItemsController = new ChangedItemsController();

  // src/core/UpdateDataRecord.js
  var UpdateDataRecord = class {
    /** @type {"set"|"delete"} */
    type;
    /** @type {any} */
    value;
    /** @type {any} */
    oldValue;
    /** @type {ReactiveItem|undefined} */
    reactiveItem;
    /**
     * Initializes an instance of UpdateDataRecord with the provided type, old value, and new value.
     * @param {"set"|"delete"} type - The action performed, either "set" or "delete".
     * @param {any} oldValue - The previous value before the update.
     * @param {any} value - The new value after the update.
     * @param {ReactiveItem} [reactiveItem] - The reactive item that triggered the update.
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
      this.data.set(
        itemName,
        new UpdateDataRecord("delete", void 0, void 0, void 0)
      );
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
     * @type {ReactiveItem}
     */
    #reactiveItem;
    /**
     * Creates a new BatchSnapshot instance.
     * @param {ReactiveItem} reactiveItem - The reactive item to snapshot.
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

  // src/core/Engine.js
  var EngineMessages = {
    DEPENDENCY_CHANGED: 1,
    DEPENDENCY_DESTROYED: 2,
    HAS_ERROR: 3,
    DEPENDENT_DESTROYED: 4
  };
  var ATOM = 1;
  var COMPUTED = 2;
  var COLLECTION = 3;
  var SHALLOW_REACTIVE = 4;
  var Engine = class {
    /**
     * The set of dependencies of the engine.
     * @type {Set<ReactiveItem>}
     */
    dependencies = /* @__PURE__ */ new Set();
    /**
     * The set of dependents of the engine.
     * @type {Set<ReactiveItem>}
     */
    dependents = /* @__PURE__ */ new Set();
    /**
     * Unique identifier for ordering.
     * @type {number}
     */
    id = idService.generateId();
    /**
     * Version number (currently unused, kept for potential future use).
     * @type {number}
     */
    version = 0;
    /**
     * Reference to the reactive item.
     * @type {ReactiveItem}
     */
    reactiveItem;
    /**
     * Flag indicating that the value should be recalculated.
     * @type {boolean}
     */
    shouldRecalc = false;
    /**
     * Indicates whether the engine has been destroyed.
     * @type {boolean}
     */
    isDestroyed = false;
    /**
     * @type {null|Error}
     */
    #error = null;
    subscribeController = new SubscribeController();
    /**
     * The type of the reactive item.
     * @type {number}
     */
    type;
    /**
     * Map of pending updates (property -> UpdateDataRecord).
     * @type {Map<string, UpdateDataRecord>}
     */
    updates = /* @__PURE__ */ new Map();
    /**
     * Snapshot of original values when inside a batch.
     * @type {BatchSnapshot|null}
     */
    #batchSnapshot = null;
    /**
     * Comparison function for equality.
     * @type {CompareFunction|null}
     */
    compareFn = null;
    /**
     * Prevents updates from being propagated (used during mass updates).
     * @type {boolean}
     */
    suppressNotifications = false;
    /**
     * Creates an Engine instance.
     * @param {ReactiveItem} reactiveItem - The reactive item.
     * @param {ATOM|COMPUTED|COLLECTION|SHALLOW_REACTIVE} type - The type.
     */
    constructor(reactiveItem, type) {
      this.reactiveItem = reactiveItem;
      this.type = type;
    }
    /** @type {Error|null} */
    get error() {
      return this.#error;
    }
    /**
     * Records a change attempt. In batch mode, stores the original value.
     * @param {string} property - The property key.
     * @param {any} oldValue - The value before the change.
     */
    #recordChange(property, oldValue) {
      if (modeController.batchMode) {
        if (!this.#batchSnapshot) {
          this.#batchSnapshot = new BatchSnapshot(this.reactiveItem);
        }
        this.#batchSnapshot.record(property, oldValue);
      }
    }
    /**
     * Alternative version that accepts explicit oldValue (preferred).
     * @param {string} property - The property key.
     * @param {any} oldValue - The previous value (immediate before this change).
     * @param {any} newValue - The new value.
     * @returns {boolean}
     */
    isEffectiveChangeWithOld(property, oldValue, newValue) {
      if (modeController.batchMode && this.#batchSnapshot?.has(property)) {
        const original = this.#batchSnapshot.getOriginal(property);
        return !this.reactiveItem.equals(original, newValue);
      }
      return !this.reactiveItem.equals(oldValue, newValue);
    }
    /**
     * Commits a change: creates an UpdateDataRecord, adds to updates, and schedules notification.
     * @param {string} property - The property key.
     * @param {"set"|"delete"} type - The operation.
     * @param {any} oldValue - The previous value (immediate before this change).
     * @param {any} newValue - The new value.
     * @returns {boolean} True if committed (i.e., value actually changed).
     */
    #commitChange(property, type, oldValue, newValue) {
      let reportedOld = oldValue;
      let compareOld = oldValue;
      if (modeController.batchMode && this.#batchSnapshot?.has(property)) {
        const original = this.#batchSnapshot.getOriginal(property);
        reportedOld = original;
        compareOld = original;
      }
      const hasMutation = property === "" ? !this.reactiveItem.equals(oldValue, newValue) : oldValue !== newValue;
      if (!hasMutation) {
        return false;
      }
      this.notifyDependents(EngineMessages.DEPENDENCY_CHANGED);
      changedItemsController.addItem(this.reactiveItem);
      const isEffective = property === "" ? !this.reactiveItem.equals(compareOld, newValue) : compareOld !== newValue;
      if (!isEffective) {
        this.updates.delete(property);
        return false;
      }
      const record = new UpdateDataRecord(type, reportedOld, newValue, this.reactiveItem);
      this.updates.set(property, record);
      this.version++;
      return true;
    }
    /**
     * Legacy method for backward compatibility. Delegates to recordChange + #commitChange.
     * @param {string} property - The property key.
     * @param {"set"|"delete"} type - The operation.
     * @param {any} oldValue - The previous value.
     * @param {any} value - The new value.
     * @returns {boolean} True if an update was added.
     */
    addUpdate(property, type, oldValue, value) {
      this.#recordChange(property, oldValue);
      return this.#commitChange(property, type, oldValue, value);
    }
    /**
     * Adds dependencies to this engine.
     * @param {Set<ReactiveItem>} dependencies
     */
    addDependencies(dependencies) {
      const array = [];
      for (const dependency of dependencies) {
        if (!this.dependencies.has(dependency)) {
          array.push(dependency);
          dependency.engine.addDependent(this.reactiveItem);
        }
      }
      array.sort(sortReactiveItems);
      for (let i = 0; i < array.length; i++) {
        this.addDependency(array[i]);
      }
    }
    /**
     * Adds a single dependency.
     * @param {ReactiveItem} dependency
     */
    addDependency(dependency) {
      if (!this.dependencies.has(dependency)) {
        this.dependencies.add(dependency);
      }
    }
    /**
     * Adds a dependent.
     * @param {ReactiveItem} dependent
     * @returns {boolean}
     */
    addDependent(dependent) {
      if (this.isDestroyed) {
        return false;
      }
      if (!this.dependents.has(dependent)) {
        this.dependents.add(dependent);
      }
      return true;
    }
    /**
     * Removes a dependent.
     * @param {ReactiveItem} dependent
     */
    removeDependent(dependent) {
      this.dependents.delete(dependent);
    }
    /**
     * Returns all dependents recursively.
     * @returns {Set<ReactiveItem>}
     */
    getDeepDependents() {
      const result = /* @__PURE__ */ new Set();
      const queue = [this.reactiveItem];
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
     * @returns {Array<ReactiveItem>}
     */
    getDeepDependentsArray() {
      const array = Array.from(this.getDeepDependents());
      array.sort(sortReactiveItems);
      return array;
    }
    /**
     * Notifies dependents of a message.
     * @param {EngineMessages} message
     * @param {{sender: ReactiveItem, recipients: Set<ReactiveItem>}} [ctx]
     */
    notifyDependents(message, ctx) {
      if (ctx === void 0) {
        ctx = { sender: this.reactiveItem, recipients: /* @__PURE__ */ new Set() };
      }
      for (const dependent of this.dependents) {
        ctx.recipients.add(dependent);
        dependent.engine.getMessage(message, ctx);
      }
    }
    /**
     * Notifies dependencies (reverse direction).
     * @param {EngineMessages} message
     * @param {{sender: ReactiveItem, recipients: Set<ReactiveItem>}} ctx
     */
    notifyDependencies(message, ctx) {
      for (const dependency of this.dependencies) {
        ctx.recipients.add(dependency);
        dependency.engine.getMessage(message, ctx);
      }
    }
    /**
     * Handles incoming messages.
     * @param {EngineMessages} message
     * @param {{sender: ReactiveItem, recipients: Set<ReactiveItem>}} ctx
     */
    getMessage(message, ctx) {
      switch (message) {
        case EngineMessages.DEPENDENT_DESTROYED:
          this.dependents.delete(ctx.sender);
          break;
        case EngineMessages.DEPENDENCY_CHANGED:
          this.#error = null;
          this.shouldRecalc = true;
          this.notifyDependents(message, ctx);
          break;
        case EngineMessages.DEPENDENCY_DESTROYED:
          this.destroy(ctx);
          break;
        case EngineMessages.HAS_ERROR:
          this.shouldRecalc = true;
          this.setError(ctx.sender.engine.error, ctx);
          break;
      }
    }
    /**
     * Sets an error and notifies dependents.
     * @param {Error|null} error
     * @param {{sender: ReactiveItem, recipients: Set<ReactiveItem>}} [ctx]
     */
    setError(error, ctx) {
      if (error === null) {
        return;
      }
      if (ctx === void 0) {
        ctx = { sender: this.reactiveItem, recipients: /* @__PURE__ */ new Set() };
      }
      this.version++;
      this.#error = error;
      this.shouldRecalc = true;
      this.notifyDependents(EngineMessages.HAS_ERROR, ctx);
    }
    /**
     * Clears the current error.
     */
    clearError() {
      this.#error = null;
    }
    /**
     * Destroys the engine.
     * @param {{sender: ReactiveItem, recipients: Set<ReactiveItem>}} [ctx]
     */
    destroy(ctx) {
      if (this.isDestroyed) {
        return;
      }
      if (ctx === void 0) {
        ctx = { sender: this.reactiveItem, recipients: /* @__PURE__ */ new Set() };
      }
      this.#error = null;
      this.notifyDependents(EngineMessages.DEPENDENCY_DESTROYED, ctx);
      this.notifyDependencies(EngineMessages.DEPENDENT_DESTROYED, ctx);
      this.isDestroyed = true;
      this.dependencies.clear();
      this.dependents.clear();
      this.subscribeController.destroy();
      this.clearUpdates();
      if (this.#batchSnapshot) {
        this.#batchSnapshot.clear();
        this.#batchSnapshot = null;
      }
    }
    /**
     * Clears all pending updates.
     */
    clearUpdates() {
      this.updates.clear();
    }
    /**
     * Checks if there are any pending updates.
     * @returns {boolean}
     */
    hasUpdates() {
      return this.updates.size > 0;
    }
    /**
     * Processes temporary changes after batch ends.
     * Removes updates for properties that reverted to original values.
     * @returns {boolean} True if any changes remain.
     */
    checkChangesTemporary() {
      if (!this.#batchSnapshot) {
        return this.hasUpdates();
      }
      const getCurrent = (prop) => {
        if (prop === "") {
          return this.reactiveItem.peekValue();
        }
        const val = this.reactiveItem.peekValue();
        return val ? val[prop] : void 0;
      };
      const changedProps = this.#batchSnapshot.getChangedProperties(getCurrent);
      for (const key of this.updates.keys()) {
        if (!changedProps.includes(key)) {
          this.updates.delete(key);
        }
      }
      const hasChanges = this.updates.size > 0;
      this.#batchSnapshot.clear();
      this.#batchSnapshot = null;
      return hasChanges;
    }
    /**
     * Called after a value change to schedule notifications.
     */
    valueChangedCallback() {
      if (this.suppressNotifications) {
        return;
      }
      changedItemsController.addItem(this.reactiveItem);
    }
    /**
     * Prepares the engine for setting a new value.
     * @throws {Error} If destroyed or in subscribers mode.
     */
    prepareSetValue() {
      if (this.isDestroyed) {
        throw new Error("The reactive item has been destroyed");
      }
      if (modeController.subscribersMode) {
        throw new Error("Cannot set value while subscribers are running");
      }
    }
    /**
     * Updates dependencies to a new set.
     * @param {Set<ReactiveItem>} newDeps
     */
    updateDependencies(newDeps) {
      for (const oldDep of this.dependencies) {
        if (!newDeps.has(oldDep)) {
          this.dependencies.delete(oldDep);
          oldDep.engine.removeDependent(this.reactiveItem);
        }
      }
      for (const newDep of newDeps) {
        if (!this.dependencies.has(newDep)) {
          this.dependencies.add(newDep);
          newDep.engine.addDependent(this.reactiveItem);
        }
      }
    }
  };

  // src/services/dependencyTracker.js
  var Tracker = class {
    #isActive = false;
    /** @type {Set<ReactiveItem>} */
    #store = /* @__PURE__ */ new Set();
    #eventEmitter = new EventEmitterLite();
    /** @type {object} */
    ctx = {};
    /**
     * Returns the current contents of the tracker's store, which is a set of all reactive items that have been
     * accessed since the tracker was last turned on. This is useful for debugging and testing purposes.
     * @returns {Set<ReactiveItem>} The current contents of the tracker's store.
     */
    get data() {
      return /* @__PURE__ */ new Set([...this.#store]);
    }
    /**
     * Returns a sorted array of all reactive items in the tracker's store. The items are sorted by their internal id,
     * ensuring consistent processing order when notified of changes.
     * @returns {Array<ReactiveItem>} A sorted array of reactive items.
     */
    getAsSortedArray() {
      return Array.from(this.#store).sort(sortReactiveItems);
    }
    /**
     * Adds a reactive item to the tracker's store if the tracker is turned on. If the tracker is not turned on, this
     * method does nothing.
     * @param {ReactiveItem} item - The reactive item to add to the tracker's store.
     * @param {string} [_key=""]
     */
    add(item, _key = "") {
      if (modeController.untrackMode) {
        return;
      }
      if (this.#isActive) {
        this.#store.add(item);
        this.#eventEmitter.emit("add", item);
      }
    }
    /**
     *
     * @param {(reactiveItem:ReactiveItem)=>void} callback
     * @returns {()=>void}
     */
    onAdd(callback) {
      return this.#eventEmitter.on("add", callback);
    }
    /**
     * Returns whether the tracker is currently turned on or not.
     * @returns {boolean} true if the tracker is on, false if it is off.
     */
    isActive() {
      return this.#isActive;
    }
    /**
     * Turns the tracker on and clears its store. If the tracker is already turned on, an error is thrown.
     * @param {object} [ctx={}] - The context to use when the tracker is turned on.
     * are tracked. If filter is a function, it is called with each reactive item as its argument, and if it returns false, the
     * reactive item is not tracked.
     */
    enable(ctx = {}) {
      if (this.#isActive) {
        throw new Error("The tracker is already turned on");
      }
      this.ctx = ctx;
      this.#isActive = true;
      this.#store.clear();
    }
    /**
     * Disables the tracker. When the tracker is disabled, it will not watch any set operations and will not report
     * anything to any registered listeners. The tracker is off by default.
     */
    disable() {
      this.#isActive = false;
    }
  };
  var dependencyTracker = new Tracker();
  function getSetOfUsedReactiveItems(fn, ...args) {
    dependencyTracker.enable();
    try {
      fn(...args);
    } finally {
      dependencyTracker.disable();
    }
    return dependencyTracker.data;
  }

  // src/reactives/ReactiveItem.js
  var ReactiveItem = class {
    engine;
    name = "";
    /**
     *
     * @param {1|2|3|4} type
     */
    constructor(type) {
      this.engine = new Engine(this, type);
    }
    /**
     * Subscribes a function to be called whenever the value of this reactive item changes.
     * @param {(updates: Map<string, UpdateDataRecord>)=>void} fn - The function to be called whenever the value of this reactive item changes.
     * @param {object} [options] - Optional options.
     * @param {number} [options.delay] - The delay in milliseconds before the function is called.
     * @param {AbortSignal} [options.signal] - The signal to abort the subscription.
     * @returns {()=>void}
     */
    subscribe(fn, options) {
      return this.engine.subscribeController.subscribe(fn, options);
    }
    /**
     * Removes all "change" subscribers. Listeners for "#has-subscribers" and "#no-subscribers" are not removed.
     */
    clearSubscribers() {
      this.engine.subscribeController.clearSubscribers();
    }
    /**
     * Removes all subscribers, including listeners for "#has-subscribers" and "#no-subscribers" events.
     */
    clearAllSubscribers() {
      this.engine.subscribeController.clearAllSubscribers();
    }
    /**
     * Returns true if there are any subscribers, false otherwise.
     * @returns {boolean} Whether there are any subscribers.
     */
    hasSubscribers() {
      return this.engine.subscribeController.hasSubscribers();
    }
    /**
     * Retrieves the current value of the reactive item.
     * @param {object} [options] - Optional options.
     * @param {boolean} [options.untracked=false] - If `true`, the value will not be added to the dependencyTracker.
     * @returns {any} The current value of the reactive item.
     */
    getValue(options) {
      if (this.engine.isDestroyed) {
        throw new Error("The reactive item has been destroyed");
      }
      const _options = Object.assign({ untracked: false }, options);
      if (_options.untracked === false) {
        dependencyTracker.add(this);
      }
    }
    /**
     * Retrieves the current value of the reactive item.
     * @returns {any} The current value of the reactive item.
     */
    peekValue() {
      return this.getValue({ untracked: true });
    }
    /**
     * Returns the last error that occurred while calculating the value of the reactive item,
     * or null if there is no error.
     * @returns {Error|null} The last error that occurred, or null if there is no error.
     */
    getLastError() {
      return this.engine.error;
    }
    /**
     * Returns true if there has been an error while calculating the value of the reactive item,
     * false otherwise. This method returns true if the reactive item has been destroyed, if the
     * reactive item has an error, or if the calculation of the value of the reactive item has
     * thrown an error.
     * @returns {boolean} Whether there has been an error while calculating the value of the
     * reactive item.
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
     * Subscribes a function to be called whenever a subscriber is added to the reactive item.
     * The function is called with no arguments.
     * @param {function():void} fn - The function to be called.
     * @returns {()=>void} A function that unsubscribes the given function.
     */
    onHasSubscribers(fn) {
      return this.engine.subscribeController.onHasSubscribers(fn);
    }
    /**
     * Subscribes a function to be called whenever there are no longer any subscribers.
     * The function is called with no arguments.
     * @param {function():void} fn - The function to be called.
     * @returns {()=>void} A function that unsubscribes the given function.
     */
    onNoSubscribers(fn) {
      return this.engine.subscribeController.onNoSubscribers(fn);
    }
    /**
     * Subscribes a function to be called when the reactive item is destroyed.
     * The function is called with no arguments.
     * @param {(reactiveItem:ReactiveItem)=>void} fn - The function to be called.
     * @returns {()=>void} A function that unsubscribes the given function.
     */
    onDestroy(fn) {
      const that = this;
      const callback = () => {
        fn(that);
      };
      const unsubscriber = this.engine.subscribeController.onDestroy(callback);
      return unsubscriber;
    }
    /**
     * Destroys the reactive item. This method is useful for cleaning up after a reactive item
     * that is no longer needed. It calls destroy on the engine of the reactive item, which
     * removes all dependencies, dependents and subscribers, and marks the engine as destroyed.
     */
    destroy() {
      this.engine.destroy();
    }
    /**
     * Checks if two values are equal. If the compareFn property is a function, it is used to compare the two values.
     * If the compareFn property is not a function, the values are compared using the === operator.
     * If the optional second argument is not provided, the value of the reactive item is used.
     * @param {any} a - The first value to compare.
     * @param {any} [b] - The second value to compare. If not provided, the value of the reactive item is used.
     * @returns {boolean} True if the two values are equal, false otherwise.
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
     * @returns {boolean} True if the reactive item has been destroyed, false otherwise.
     */
    get isDestroyed() {
      return this.engine.isDestroyed;
    }
  };

  // src/reactives/Atom.js
  var Atom = class extends ReactiveItem {
    /** @type {T} */
    #currentValue;
    /**
     * Initializes an Atom instance with a given value.
     * @param {T} value - The initial value of the Atom.
     * @param {object} [options] - Options.
     * @param {string} [options.name] - The name of the Atom.
     * @param {((a:T, b:T)=>boolean)|null} [options.compareFunction] - A function that compares two values for equality.
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
    /**
     * Sets the value of the Atom. If the new value is the same as the current value, no action is taken.
     * Updates the current value to the new value if they are different.
     * @param {T} value - The new value to set for the Atom.
     */
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
     * Retrieves the current value of the Atom. If the engine is destroyed, an error is thrown.
     * Tracks the Atom for dependency management.
     * @param {{untracked?: boolean}} [options] - Optional options. If `untracked` is `false`, the Atom value will be added to the dependencyTracker.
     * @returns {T} The current value of the Atom.
     */
    getValue(options) {
      super.getValue(options);
      return this.#currentValue;
    }
    /**
     * Returns the current value of the Atom. If the engine is destroyed, an error is thrown.
     * @returns {T} The current value of the Atom.
     */
    get value() {
      return this.getValue();
    }
    /**
     * Returns the current value of the Atom without tracking it for dependency management.
     * This is useful when you want to access the value without affecting its reactive state.
     * @returns {T} The current value of the Atom.
     * @example
     * ```js
     * const a = atom(0);
     * const b = atom(0);
     * const c = computed(() => a.value + b.valueUntracked, {
     *     name: "c",
     * });
     *
     * c.subscribe(() => {
     *     console.log(c.name, c.value);
     * });
     * console.log("change b.value");
     * b.value++;
     * b.value++;
     * console.log("change a.value");
     * a.value++;
     * // Output: c 3
     * a.value++;
     * // Output: c 4
     * ```
     */
    get valueUntracked() {
      return this.getValue({ untracked: true });
    }
  };

  // src/reactives/Computed.js
  var Computed = class extends ReactiveItem {
    /** @type {T} */
    #currentValue;
    /** @type {function():T} */
    #fn;
    /** @type {string} */
    __cachedDependentsVersionString = "";
    options = {
      smartRecompute: false
    };
    /**
     * Initializes an Atom instance with a given value.
     * @param {function():T} fn - function that returns the value of the Computed
     * @param {object} [options] - Options
     * @param {string} [options.name] - The name of the Computed instance.
     * @param {((a:T, b:T)=>boolean)|null} [options.compareFunction] - A function that compares two values for equality.
     * @param {boolean} [options.smartRecompute] - When true, the computed value will be
     *        recalculated only when the version string of its dependencies changes,
     *        rather than on every dependency notification. This avoids unnecessary
     *        recalculations when dependencies change but their final values remain
     *        the same (e.g., toggling back and forth). Defaults to false.
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
        this.__cachedDependentsVersionString = this.#getDependenciesVersionString();
      }
    }
    /**
     * Returns a string representation of the dependencies of the Computed value.
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
    #collectDependenciesAndInitValue() {
      dependencyTracker.enable();
      modeController.isComputing = true;
      let value;
      try {
        value = this.#fn();
        if (value instanceof ReactiveItem) {
          throw new Error(
            `Computed${this.name ? ` (${this.name})` : ""}: Return value must not be a reactive item`
          );
        }
      } catch (e) {
        this.engine.setError(getError(e));
      }
      modeController.isComputing = false;
      dependencyTracker.disable();
      if (this.engine.error) {
        throw this.engine.error;
      }
      if (dependencyTracker.data.size === 0) {
        throw new Error(`Computed${this.name ? ` (${this.name})` : ""}: No dependencies`);
      }
      this.engine.addDependencies(dependencyTracker.data);
      return value;
    }
    /**
     * Checks whether the Computed value needs to be recalculated. A recalculation is needed if the engine's shouldRecalc
     * property is true, if the engine has an error, or if the version string of the dependencies has changed.
     * @returns {boolean} true if the Computed value needs to be recalculated, false if it does not.
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
    #areDependenciesStale() {
      const engine = this.engine;
      const dependentsVersionString = this.#getDependenciesVersionString();
      if (dependentsVersionString !== this.__cachedDependentsVersionString) {
        this.__cachedDependentsVersionString = dependentsVersionString;
        engine.shouldRecalc = true;
        return true;
      }
      return false;
    }
    /**
     * @param {{untracked?: boolean}} [options] - Optional options. If `untracked` is `false`, the Computed value will be added to the dependencyTracker.
     * @returns {T} The current value of the Computed value.
     */
    getValue(options) {
      super.getValue(options);
      const engine = this.engine;
      if (engine.error !== null && !engine.shouldRecalc) {
        throw engine.error;
      }
      if (modeController.isComputing) {
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
     * Returns the current value of the Computed value.
     * @returns {T} The current value of the Computed value.
     */
    get value() {
      return this.getValue();
    }
    /**
     * Returns the current cached value of the computed without triggering a recalculation
     * and without tracking dependencies.
     *
     * Unlike the `value` getter, this method does not check if dependencies have changed
     * and does not recompute the value if it's stale. It simply returns the last
     * computed value. This is useful for debugging or for accessing the value
     * without causing side effects (e.g., inside an untracked context).
     *
     * If the computed has an error, this method will still return the last cached
     * value (which may be undefined or a previous value) without rethrowing the error.
     *
     * @override
     * @returns {T} The cached value.
     *
     * @example
     * ```js
     * const a = atom(1);
     * const b = computed(() => a.value * 2);
     *
     * console.log(b.peekValue()); // 2 (without tracking dependencies)
     * a.value = 2;
     * console.log(b.peekValue()); // still 2 (stale, not recomputed)
     * console.log(b.value);       // 4 (recomputed now)
     * ```
     */
    peekValue() {
      return this.#currentValue;
    }
    /**
     * Returns the current value of the Computed value without tracking it for dependency management.
     * This is useful when you want to access the value without affecting its reactive state.
     * @returns {T} The current value of the Computed value.
     * @example
     * ```js
     * const a = atom(0);
     * const b = atom(0);
     * const c = computed(() => a.value + 1);
     * const d = computed(() => c.valueUntracked + b.value);
     *
     * d.subscribe(() => {
     *     console.log(`d = ${d.value}`);
     * });
     *
     * console.log(`c = ${c.value}`);
     * // Outputs: c = 1
     * a.value++;
     * // a = 1
     * // Outputs: nothing
     * console.log(`c = ${c.value}`);
     * // Outputs: c = 2
     *
     * b.value++;
     * // Outputs: d = 3
     * ```
     */
    get valueUntracked() {
      return this.getValue({ untracked: true });
    }
    #calc() {
      const engine = this.engine;
      engine.shouldRecalc = false;
      engine.clearError();
      const newDeps = /* @__PURE__ */ new Set();
      const unsubscribe = dependencyTracker.onAdd((item) => {
        newDeps.add(item);
      });
      let value;
      try {
        value = this.#fn();
      } catch (e) {
        const error = getError(e);
        engine.setError(
          new Error(`Computed${this.name ? ` (${this.name})` : ""}: ` + error.message, {
            cause: this
          })
        );
        throw engine.error;
      } finally {
        unsubscribe();
      }
      if (this.equals(this.#currentValue, value)) {
        this.engine.clearUpdates();
        return this.#currentValue;
      }
      const oldValue = this.#currentValue;
      this.#currentValue = clone(value);
      const newValue = this.#currentValue;
      if (engine.addUpdate("", "set", oldValue, newValue)) {
        engine.valueChangedCallback();
      }
      return this.#currentValue;
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
     * Initializes a Collection instance with an initial array.
     *
     * @param {T[]} value - The initial array value.
     * @param {object} [options] - Configuration options.
     * @param {string} [options.name] - The name of the Collection (for debugging).
     * @param {CompareFunction|null} [options.compareFunction] - Custom equality function for values.
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
     * Initializes the proxy handler for array interception.
     *
     * @returns {ProxyHandler<T[]>} The proxy handler object.
     */
    #initHandler = () => {
      const that = this;
      return {
        /**
         * Intercepts property assignments on the array.
         *
         * @param {T[]} target - The target array.
         * @param {string|symbol} key - The property key.
         * @param {any} value - The value to set.
         * @returns {boolean} True if the operation succeeded.
         */
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
        /**
         * Intercepts property accesses on the array.
         *
         * @param {T[]} target - The target array.
         * @param {string|symbol} key - The property key.
         * @returns {any} The property value.
         */
        get: (target, key) => {
          that.getValue();
          return target[key];
        },
        /**
         * Intercepts property deletions on the array.
         *
         * @param {T[]} target - The target array.
         * @param {string|symbol} key - The property key.
         * @returns {boolean} True if the operation succeeded.
         */
        deleteProperty: (target, key) => {
          if (typeof key === "symbol") {
            delete target[key];
            return true;
          }
          if (modeController.subscribersMode) {
            throw new Error(
              `Collection${this.name ? ` (${this.name})` : ""}: Cannot delete property while subscribers are running`
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
    };
    /**
     * Sets the entire array, replacing all elements.
     * Only triggers reactivity if the new array differs from the current one.
     *
     * @param {T[]} value - The new array value.
     */
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
     * Returns the proxied array value.
     * Tracks this Collection as a dependency when accessed.
     *
     * @param {{untracked?: boolean}} [options] - If `untracked` is true, does not add to dependency tracker.
     * @returns {T[]} The reactive array proxy.
     */
    getValue(options) {
      super.getValue(options);
      return this.#proxy;
    }
    /**
     * Returns the proxied array value (same as getValue()).
     *
     * @returns {T[]} The reactive array proxy.
     */
    get value() {
      return this.getValue();
    }
    /**
     * Returns the raw, unproxied target array.
     * Warning: Mutating the raw array directly does NOT trigger reactivity.
     *
     * @returns {T[]} The raw array.
     */
    getRawValue() {
      return this.#target;
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
     * Initializes a ShallowReactive instance with a given value.
     * @param {T} value - The initial value of the ShallowReactive.
     * @param {object} [options] - Options.
     * @param {string} [options.name] - The name of the ShallowReactive.
     */
    constructor(value, options = {
      name: ""
    }) {
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
    #initHandler() {
      const that = this;
      return {
        /**
         * Sets a property on the ShallowReactive. If the property already exists, its value is updated. If not, a new property is added.
         * @param {T} target - The ShallowReactive to set the property on.
         * @param {string} key - The key of the property to set.
         * @param {any} value - The value to set for the property.
         * @returns {boolean} true if the property was successfully set.
         */
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
          if (engine.addUpdate(key, "set", oldValue, value)) {
            engine.valueChangedCallback();
          }
          return true;
        },
        /**
         * Gets a property from the ShallowReactive. If the property is not found, undefined is returned.
         * @param {T} target - The ShallowReactive to get the property from.
         * @param {string} key - The key of the property to get.
         * @returns {any} The value of the property, or undefined if it was not found.
         */
        get: (target, key) => {
          that.getValue();
          return target[key];
        },
        /**
         * Deletes a property from the ShallowReactive. If the property is not found, an error is thrown.
         * @param {T} target - The ShallowReactive to delete the property from.
         * @param {string} key - The key of the property to delete.
         * @returns {boolean} true if the property was deleted, false if it was not.
         */
        deleteProperty: (target, key) => {
          if (typeof key === "symbol") {
            delete target[key];
            return true;
          }
          if (modeController.subscribersMode) {
            throw new Error(
              `ShallowReactive${this.name ? ` (${this.name})` : ""}: Cannot delete property while subscribers are running`
            );
          }
          const engine = that.engine;
          if (engine.addUpdate(key, "delete", target[key], void 0)) {
            delete target[key];
            engine.valueChangedCallback();
          }
          return true;
        }
      };
    }
    /**
     * Retrieves the proxied value of the ShallowReactive. If the engine is destroyed, an error is thrown.
     * Tracks the ShallowReactive for dependency management.
     * @param {{untracked?: boolean}} [options] - Optional options. If `untracked` is `false`, the ShallowReactive value will be added to the dependencyTracker.
     * @returns {T} The proxied value of the ShallowReactive.
     */
    getValue(options) {
      super.getValue(options);
      return this.#proxy;
    }
    /**
     * Sets the value of the ShallowReactive. If the value is an object, it will be proxied and reactive.
     * @param {T} value - The new value of the ShallowReactive.
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
    /**
     * Sets the value of the ShallowReactive. If the value is an object, it will be proxied and reactive.
     * @param {T} value - The new value of the ShallowReactive.
     */
    set value(value) {
      this.setValue(value);
    }
    /**
     * Retrieves the proxied value of the ShallowReactive. If the engine is destroyed, an error is thrown.
     * Tracks the ShallowReactive for dependency management.
     * @returns {T} The proxied value of the ShallowReactive.
     */
    get value() {
      return this.getValue();
    }
    /**
     * Returns the raw, unproxied value of the ShallowReactive. This is generally not recommended as it breaks reactivity.
     * @returns {T} The raw, unproxied value of the ShallowReactive.
     */
    getRawValue() {
      return this.#target;
    }
  };

  // src/complex/Store.js
  var Store = class _Store {
    /**
     * @type {Map<string, ReactiveItem>}
     */
    #items = /* @__PURE__ */ new Map();
    /**
     * @type {Map<string, Store>}
     */
    #childStores = /* @__PURE__ */ new Map();
    /** @type {EventEmitter} */
    #eventEmitter;
    /** @type {boolean} */
    #isDestroyed = false;
    /** @type {Map<string, Set<Function>>} */
    #unsubscribers = /* @__PURE__ */ new Map();
    /** @type {Map<string, UpdateDataRecord>} */
    #updates;
    /** @type {UpdateDataRecordManager} */
    #updatesManager;
    #keys = /* @__PURE__ */ new WeakMap();
    #subscriber;
    #muted = false;
    #pendingUpdate = false;
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
     * @type {boolean}
     */
    get isDestroyed() {
      return this.#isDestroyed;
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
     * Adds a reactive item to the store with the given key.
     * @param {string} key - The key to use when adding the item to the store.
     * @param {ReactiveItem} reactiveItem - The reactive item to add to the store.
     * @throws {Error} If an item with the given key already exists in the store.
     */
    #addReactiveItem(key, reactiveItem) {
      if (this.#items.has(key)) {
        throw new Error(`Item with key ${key} already exists in the store.`);
      }
      this.#items.set(key, reactiveItem);
      this.#keys.set(reactiveItem, key);
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
     * Adds a child store with the given key to this store.
     * @param {string} storeName - The key to use when adding the child store to this store.
     * @param {Store} store - The child store to add to this store.
     * @throws {Error} If a child store with the given key already exists in this store.
     */
    #addStore(storeName, store) {
      if (this.#childStores.has(storeName)) {
        throw new Error(`Child store with key ${storeName} already exists in this store.`);
      }
      this.#childStores.set(storeName, store);
      const that = this;
      this.#keys.set(store, storeName);
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
     * Adds one or more reactive items to the store.
     * @param {{[key: string]: ReactiveItem|Store}} items
     * @throws {Error} If an item with the given key already exists in the store.
     * @throws {Error} If the store is destroyed.
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
     * Destroys the child store with the given key.
     * @param {string} key - The key of the child store to destroy.
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
     * Destroys the item with the given key, whether it's a reactive item or a child store.
     * @param {string} key - The key of the item or child store to destroy.
     */
    destroyItem(key) {
      if (this.isDestroyed) {
        throw new Error("Store has been destroyed");
      }
      this.#destroyReactiveItem(key);
      this.#destroyChildStore(key);
    }
    /**
     * Removes a reactive item from the store WITHOUT destroying it.
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
     * Removes a child store WITHOUT destroying it.
     * @param {string} key
     */
    #removeChildStore(key) {
      const store = this.#childStores.get(key);
      if (!store) {
        return;
      }
      this.#childStores.delete(key);
      this.#keys.delete(store);
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
     * Removes and DESTROYS a reactive item.
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
     * Removes the reactive item with the given key from the store (without destroying it).
     * @param {string} key - The key of the item to remove.
     */
    removeItem(key) {
      if (this.isDestroyed) {
        throw new Error("Store has been destroyed");
      }
      this.#removeReactiveItem(key);
      this.#removeChildStore(key);
    }
    /**
     * Destroys all reactive items stored in the Store.
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
     * Clears all reactive items from the store without destroying them.
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
     * Retrieves the reactive item with the given key.
     * @param {string} key
     * @returns {ReactiveItem|null}
     */
    #getReactiveItem(key) {
      return this.#items.get(key) || null;
    }
    /**
     * Retrieves the child store with the given key.
     * @param {string} key
     * @returns {Store|null}
     */
    #getChildStore(key) {
      return this.#childStores.get(key) || null;
    }
    /**
     * Retrieves the item with the given key.
     * @param {string} key
     * @returns {ReactiveItem|Store|null}
     */
    getItem(key) {
      if (this.isDestroyed) {
        throw new Error("Store has been destroyed");
      }
      return this.#getReactiveItem(key) || this.#getChildStore(key) || null;
    }
    /**
     * Checks if an item with the given key exists.
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
     * Retrieves the names of items stored.
     * @param {"all"|"reactives"|"stores"} [filter="all"]
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
     * Retrieves all items stored.
     * @param {"all"|"reactives"|"stores"} [filter="all"]
     * @returns {Map<string, ReactiveItem|Store>}
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
     * Retrieves the value of this Store as a plain object.
     * @param {"all"|"reactives"|"stores"} [filter="all"]
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
     * Subscribes a function to be called whenever the value of this Store changes.
     * @param {(update: Map<string, UpdateDataRecord>, store: Store)=>void} fn
     * @returns {()=>void}
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
     * Subscribes a function to be called when this Store is destroyed.
     * @param {(store:Store)=>void} fn
     * @returns {()=>void}
     */
    onDestroy(fn) {
      if (this.isDestroyed) {
        throw new Error("Store has been destroyed");
      }
      return this.#eventEmitter.on("destroy", fn);
    }
    /**
     * Mutes the event emitter, preventing any updates from being triggered.
     */
    muteUpdates() {
      if (this.isDestroyed) {
        throw new Error("Store has been destroyed");
      }
      this.#muted = true;
    }
    /**
     * Unmutes the event emitter, allowing updates to be triggered.
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
     * Returns whether the event emitter is currently muted.
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
     * Creates a reactive wrapper for the given value.
     * Uses ShallowReactive for objects/arrays, Atom for items.
     *
     * @param {any} value - The value to wrap.
     * @param {string} name - The name to assign to the reactive item (used for debugging).
     * @returns {ReactiveWrapper<any>} The reactive wrapper.
     */
    #createReactiveItem(value, name) {
      if (isPlainObject(value) || Array.isArray(value)) {
        return new ShallowReactive(value, { name });
      }
      return new Atom(value, { name });
    }
    /**
     * Updates the value of a reactive wrapper.
     * Works for both Atom and ShallowReactive.
     *
     * @param {ReactiveWrapper<any>} wrapper - The reactive wrapper.
     * @param {any} newValue - The new value to set.
     */
    #updateReactiveItem(wrapper, newValue) {
      wrapper.value = newValue;
    }
    /**
     * Adds one or more items to the end of the list.
     *
     * @param {...T} values - The values to add. Primitives are wrapped in `Atom`,
     *                        objects and arrays are wrapped in `ShallowReactive`.
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
        const wrapper = this.#createReactiveItem(values[i], idx.toString());
        wrappers[idx] = wrapper;
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
     * Retrieves the value at the given index.
     *
     * @param {number} index - The index of the item to retrieve.
     * @returns {T | undefined} The value, or undefined if the index is out of bounds.
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
     * @returns {T[]} An array containing all values.
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
     * Updates the value at the specified index.
     *
     * @param {number} index - The index to update.
     * @param {T} value - The new value. Primitives become `Atom`, objects/arrays become `ShallowReactive`.
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
     * Returns the current length of the list.
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
     * @param {T[]} values - The new array of values. Wrapping follows the same rules as `add()`.
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
     * Removes elements from the list starting at `startIndex` and removing `count` items.
     * Remaining elements are shifted left. The operation is batched to emit only one notification.
     *
     * @param {number} startIndex - The index at which to start removal.
     * @param {number} count - The number of elements to remove.
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
     * @param {number} index - The index of the item to remove.
     */
    removeItem(index) {
      this.removeRange(index, 1);
    }
    /**
     * Removes the last item of the list.
     */
    removeLastItem() {
      this.removeRange(this.#lengthAtom.value - 1, 1);
    }
    /**
     * Removes the first item of the list.
     */
    removeFirstItem() {
      this.removeRange(0, 1);
    }
    /**
     * Removes all items from the list.
     */
    clear() {
      this.removeRange(0, this.#lengthAtom.value);
    }
    /**
     * Destroys the list, releasing all internal resources.
     * After destruction, any method call (except `isDestroyed`) will throw an error.
     */
    destroy() {
      if (this.isDestroyed) {
        return;
      }
      this.#store.destroy();
    }
    /**
     * Indicates whether the list has been destroyed.
     *
     * @returns {boolean}
     */
    get isDestroyed() {
      return this.#store.isDestroyed;
    }
    /**
     * Subscribes a callback to be invoked whenever the list changes.
     * The callback receives a Map of updates with details about changed items.
     *
     * @param {(updates: Map<string, UpdateDataRecord>) => void} fn - The callback function.
     * @returns {() => void} A function to unsubscribe the callback.
     */
    subscribe(fn) {
      if (this.isDestroyed) {
        throw new Error("ReactiveList has been destroyed");
      }
      return this.#store.subscribe(fn);
    }
  };

  // src/api/api.js
  function autorun(fn, options) {
    const _options = Object.assign(
      {
        name: void 0,
        delay: 0,
        signal: void 0,
        onError: void 0,
        type: "autorun"
      },
      options
    );
    if (modeController.untrackMode) {
      throw new Error(
        `Autorun${_options.name ? ` (${_options.name})` : ""}: cannot initialize when untrackMode is on.`
      );
    }
    return reaction(fn, fn, _options);
  }
  function reaction(dataFunction, fn, options) {
    const _options = Object.assign(
      { name: void 0, delay: 0, signal: void 0, type: "reaction" },
      options
    );
    if (modeController.untrackMode) {
      throw new Error(
        `Reaction${_options.name ? ` (${_options.name})` : ""}: cannot initialize when untrackMode is on.`
      );
    }
    if (_options.delay > 0) {
      fn = debounce(fn, _options.delay);
      _options.delay = 0;
    }
    const unsubscribers = [];
    const items = getSetOfUsedReactiveItems(dataFunction);
    if (items.size === 0) {
      throw new Error(
        `Autorun/Reaction${_options.name ? ` (${_options.name})` : ""}: No reactive items found.`
      );
    }
    for (const item of items) {
      unsubscribers.push(item.subscribe(fn, _options));
    }
    const unsubscriber = () => {
      for (let i = 0; i < unsubscribers.length; i++) {
        unsubscribers[i]();
      }
    };
    return unsubscriber;
  }
  function when(predicate, fn, options) {
    const computed2 = new Computed(predicate);
    const timeout = options?.timeout || 0;
    let timer;
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
      const computed2 = new Computed(predicate);
      const timeout = options?.timeout || 0;
      let timer;
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
    if (modeController.subscribersMode) {
      modeController.runAfterSubscribers(fn);
    } else {
      fn();
    }
  }
  function batch(fn) {
    modeController.enterBatch();
    try {
      fn();
    } finally {
      modeController.exitBatch();
    }
  }
  function untrack(fn) {
    const untrackMode = modeController.untrackMode;
    let result;
    modeController.untrackMode = true;
    try {
      result = fn();
    } catch (e) {
      modeController.untrackMode = untrackMode;
      throw e;
    }
    modeController.untrackMode = untrackMode;
    return result;
  }
  function getNow(interval = 1e3) {
    const atom2 = new Atom(0, { name: "now" });
    let intervalId;
    atom2.onHasSubscribers(() => {
      intervalId = setInterval(() => {
        runInAction(() => {
          atom2.value = Date.now();
        });
      }, interval);
    });
    atom2.onNoSubscribers(() => {
      clearInterval(intervalId);
      runInAction(() => {
        atom2.value = 0;
      });
    });
    atom2.onDestroy(() => {
      clearInterval(intervalId);
    });
    return atom2;
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
    return {
      case: caseMethod
    };
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
        /** @type {Array<string|boolean>} */
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
  return __toCommonJS(index_exports);
})();
