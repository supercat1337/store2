// @ts-check

import { Engine as _Engine } from './Engine.js';

/**
 * Message codes used in the engine.
 * @enum {number}
 */
export const EngineMessages = {
    DEPENDENCY_CHANGED: 1,
    DEPENDENCY_DESTROYED: 2,
    HAS_ERROR: 3,
    DEPENDENT_DESTROYED: 4,
};

/**
 * Handles incoming messages from dependencies/dependents.
 * All logic is stateless; it mutates the engine's state via callbacks.
 */
export class MessageHandler {
    /**
     * Processes an incoming message.
     * @param {number} message - The message code.
     * @param {{ sender: import('../types.d.ts').ReactiveItem, recipients: Set<import('../types.d.ts').ReactiveItem> }} ctx - Context.
     * @param {_Engine} engineState - The engine's state container (provides getters/setters).
     * @param {Function} setError - Callback to set the engine's error.
     * @param {Function} setShouldRecalc - Callback to set the shouldRecalc flag.
     * @param {Function} notifyDependents - Callback to notify dependents of a message.
     * @param {Function} removeDependent - Callback to remove a dependent.
     * @param {Function} destroyEngine - Callback to destroy the engine.
     */
    handleMessage(
        message,
        ctx,
        engineState,
        setError,
        setShouldRecalc,
        notifyDependents,
        removeDependent,
        destroyEngine
    ) {
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
                    // Optionally re-notify dependents about the error
                    notifyDependents(message, ctx);
                }
                break;

            default:
                // Ignore unknown messages
                break;
        }
    }
}
