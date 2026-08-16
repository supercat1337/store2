// @ts-check

import { EventEmitter } from '@supercat1337/event-emitter';
import { debounce } from '../helpers/tools.js';

/**
 * Manages change subscriptions and lifecycle hooks for a reactive item.
 * Uses a single EventEmitter for all events: 'change' and 'destroy'.
 */
class SubscribeController {
    /** @type {EventEmitter} */
    #emitter;
    #reactiveItem;

    /**
     * @param {import('../types.js').ReactiveItem} reactiveItem
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
        return this.#emitter.getListeners('change');
    }

    /**
     * Subscribes a callback to the 'change' event.
     *
     * @param {(updates: Map<string, import('../types.js').UpdateDataRecord>) => void} fn
     * @param {{ delay?: number, signal?: AbortSignal }} [options]
     * @returns {() => void}
     */
    subscribe(fn, options) {
        const { delay = 0, signal } = options || {};
        const wrappedFn = delay > 0 ? debounce(fn, delay) : fn;

        const unsubscribe = this.#emitter.on('change', wrappedFn, { signal });
        /*
        console.log(
            `[SubscribeController] subscribe for ${this.#reactiveItem?.name || 'unknown'}, listener added`
        );
        */

        return () => {
            /*
            console.log(
                `[SubscribeController] unsubscribe called for ${this.#reactiveItem?.name || 'unknown'}`
            );
            */
            unsubscribe();
        };
    }

    /**
     * Removes all 'change' subscribers.
     * Internal listeners (has/no subscribers) remain intact.
     */
    clearSubscribers() {
        /*
        console.log(
            `[SubscribeController] clearSubscribers called for ${this.#reactiveItem?.name || 'unknown'}`
        );
        */
        this.#emitter.removeAllListenersOf('change');
    }

    /**
     * Removes all subscribers, including internal listeners.
     */
    clearAllSubscribers() {
        /*
        console.log(
            `[SubscribeController] clearAllSubscribers called for ${this.#reactiveItem?.name || 'unknown'}`
        );
        */
        this.#emitter.removeAllListeners({ removeInternalListeners: true });
    }

    /**
     * Returns whether there are any 'change' subscribers.
     * @returns {boolean}
     */
    hasSubscribers() {
        return this.#emitter.hasListeners('change');
    }

    /**
     * Destroys the controller, emits 'destroy', and removes all listeners.
     */
    destroy() {
        /*
        console.log(
            `[SubscribeController] destroy called for ${this.#reactiveItem?.name || 'unknown'}`
        );
        */
        this.#emitter.emit('destroy');
        this.#emitter.removeAllListeners({ removeInternalListeners: true });
    }

    /**
     * Registers a callback that fires when the first 'change' subscriber is added.
     * @param {() => void} callback
     * @returns {() => void}
     */
    onHasSubscribers(callback) {
        return this.#emitter.onHasEventListeners('change', () => callback());
    }

    /**
     * Registers a callback that fires when the last 'change' subscriber is removed.
     * @param {() => void} callback
     * @returns {() => void}
     */
    onNoSubscribers(callback) {
        return this.#emitter.onNoEventListeners('change', () => callback());
    }

    /**
     * Registers a callback that fires when the controller is destroyed.
     * @param {() => void} callback
     * @returns {() => void}
     */
    onDestroy(callback) {
        return this.#emitter.on('destroy', callback);
    }
}

export { SubscribeController };
