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
export { Engine } from './core/Engine.js';
export { UpdateDataRecord } from './core/UpdateDataRecord.js';

export {
    SNAPSHOT_VERSION,
    PLUGIN_API_VERSION,
    Store2Context,
    defaultContext,
    getCurrentContext,
    runWithContext,
    runWithContextAsync,
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

export { IdService } from './services/idService.js';
export { ModeControllerService } from './services/modeController.js';
export { Tracker } from './services/dependencyTracker.js';
export { ChangedItemsController } from './services/changedItemsController.js';

// Type-only exports
export type {
    ActionInfo,
    BatchInfo,
    ActionMiddleware,
    ContextSnapshot,
    SnapshotMigration,
    SnapshotRoot,
    Store2Plugin,
    CompareFunction,
    ReactiveItemType,
    ObservableValue,
    GraphDump,
    GraphDumpItem,
    GraphDumpEdge,
} from './types.js';
