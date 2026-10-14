/**
 * A lightweight, efficient, and easy-to-use reactive state management
 * system for JavaScript.
 *
 * Zero runtime dependencies beyond a tiny event emitter. Provides atoms,
 * computed values, collections, shallow reactive objects, stores, and a
 * context/plugin system for building ecosystem packages.
 *
 * @packageDocumentation
 */

// Value exports
export { ReactiveItem } from './reactives/ReactiveItem.js';
export { Atom } from './reactives/Atom.js';
export { Computed } from './reactives/Computed.js';
export { Collection } from './reactives/Collection.js';
export { ShallowReactive } from './reactives/ShallowReactive.js';
export { Store } from './complex/Store.js';
export { ReactiveList } from './complex/ReactiveList.js';
export { UpdateDataRecord } from './core/UpdateDataRecord.js';

export {
    Store2Context,
    defaultContext,
    getCurrentContext,
    runWithContext,
    createStore2Context,
} from './core/context.js';

export {
    atom,
    autorun,
    batch,
    action,
    collection,
    computed,
    extendObservable,
    fromPromise,
    getNow,
    makeAutoObservable,
    makeObservable,
    reaction,
    runInAction,
    shallowReactive,
    untrack,
    waitUntil,
    when,
} from './api/api.js';

export {
    clone,
    compareAny,
    comparePlainObjects,
    debounce,
    getAllPropertyDescriptors,
    getError,
    getItemNamesFromSet,
    getSortedReactiveItems,
    isPlainObject,
    sleep,
    sortReactiveItems,
} from './helpers/tools.js';

export { DevToolsPlugin, createDevToolsPlugin } from './plugins/devtools.js';

// Services — публичные по контракту с Store2Context
export { IdService } from './services/idService.js';
export { ModeControllerService } from './services/modeController.js';
export { Tracker } from './services/dependencyTracker.js';
export { ChangedItemsController } from './services/changedItemsController.js';

// Type-only exports — то, ради чего затевался этот файл
export type {
    ActionInfo,
    BatchInfo,
    ActionMiddleware,
    ContextSnapshot,
    SnapshotRoot,
    Store2Plugin,
    CompareFunction,
    ReactiveItemType,
} from './types.js';

export type { DevToolsOptions, DevToolsEntry } from './plugins/devtools.js';
