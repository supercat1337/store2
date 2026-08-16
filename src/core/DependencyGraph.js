// @ts-check

import { sortReactiveItems } from '../helpers/tools.js';

/**
 * Manages the dependency graph for a reactive item.
 * Handles adding/removing dependencies and dependents, and propagating messages through the graph.
 */
export class DependencyGraph {
    /** @type {Set<import('../types.d.ts').ReactiveItem>} */
    #dependencies;
    /** @type {Set<import('../types.d.ts').ReactiveItem>} */
    #dependents;
    /** @type {import('../types.d.ts').ReactiveItem} */
    #reactiveItem;

    /**
     * @param {Set<import('../types.d.ts').ReactiveItem>} dependencies - The engine's dependencies set.
     * @param {Set<import('../types.d.ts').ReactiveItem>} dependents - The engine's dependents set.
     * @param {import('../types.d.ts').ReactiveItem} reactiveItem - The owning reactive item.
     */
    constructor(dependencies, dependents, reactiveItem) {
        this.#dependencies = dependencies;
        this.#dependents = dependents;
        this.#reactiveItem = reactiveItem;
    }

    /**
     * Adds a single dependency.
     * @param {import('../types.d.ts').ReactiveItem} dependency
     */
    addDependency(dependency) {
        if (!this.#dependencies.has(dependency)) {
            this.#dependencies.add(dependency);
        }
    }

    /**
     * Adds multiple dependencies, sorted by id, and registers this reactive item as a dependent on each.
     * @param {Set<import('../types.d.ts').ReactiveItem>} deps - Set of dependencies to add.
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
     * @param {import('../types.d.ts').ReactiveItem} dependent
     */
    removeDependent(dependent) {
        this.#dependents.delete(dependent);
    }

    /**
     * Adds a dependent to the dependents set.
     * @param {import('../types.d.ts').ReactiveItem} dependent
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
     * @returns {Set<import('../types.d.ts').ReactiveItem>}
     */
    getDeepDependents() {
        const result = new Set();
        const queue = [this.#reactiveItem];
        const visited = new Set();
        while (queue.length) {
            const current = queue.shift();
            if (!current || visited.has(current)) {continue;}
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
     * @returns {Array<import('../types.d.ts').ReactiveItem>}
     */
    getDeepDependentsArray() {
        const array = Array.from(this.getDeepDependents());
        array.sort(sortReactiveItems);
        return array;
    }

    /**
     * Notifies all dependents of a message.
     * @param {number} message - The message code (EngineMessages).
     * @param {{ sender: import('../types.d.ts').ReactiveItem, recipients: Set<import('../types.d.ts').ReactiveItem> }} ctx - Context containing sender and recipient set.
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
     * @param {{ sender: import('../types.d.ts').ReactiveItem, recipients: Set<import('../types.d.ts').ReactiveItem> }} ctx
     */
    notifyDependencies(message, ctx) {
        for (const dependency of this.#dependencies) {
            ctx.recipients.add(dependency);
            dependency.engine.getMessage(message, ctx);
        }
    }

    /**
     * Updates the dependency set to a new set.
     * @param {Set<import('../types.d.ts').ReactiveItem>} newDeps - New set of dependencies.
     */
    updateDependencies(newDeps) {
        // Remove old dependencies no longer needed
        for (const oldDep of this.#dependencies) {
            if (!newDeps.has(oldDep)) {
                this.#dependencies.delete(oldDep);
                oldDep.engine.removeDependent(this.#reactiveItem);
            }
        }
        // Add new dependencies
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
}
