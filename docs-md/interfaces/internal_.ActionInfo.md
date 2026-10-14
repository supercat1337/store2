[@supercat1337/store2](../README.md) / [Modules](../modules.md) / [\<internal\>](../modules/internal_.md) / ActionInfo

# Interface: ActionInfo

[\<internal\>](../modules/internal_.md).ActionInfo

Metadata about a single logical user action.

Actions are the unit of work that DevTools, loggers, and time-travel
plugins reason about. An `ActionInfo` is created by
`Store2Context.action()` and passed to middleware and lifecycle hooks.

## Table of contents

### Properties

- [endTime](internal_.ActionInfo.md#endtime)
- [error](internal_.ActionInfo.md#error)
- [id](internal_.ActionInfo.md#id)
- [name](internal_.ActionInfo.md#name)
- [parentId](internal_.ActionInfo.md#parentid)
- [payload](internal_.ActionInfo.md#payload)
- [startTime](internal_.ActionInfo.md#starttime)

## Properties

### endTime

• **endTime**: `number`

Wall-clock timestamp when the action finished, or `null` while the
action body is still running.

#### Defined in

[src/types.ts:64](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L64)

___

### error

• **error**: `Error`

Error thrown by the action body, or `null` on success.

#### Defined in

[src/types.ts:69](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L69)

___

### id

• **id**: `string`

Unique identifier, monotonic within the owning context.

#### Defined in

[src/types.ts:36](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L36)

___

### name

• **name**: `string`

Human-readable action name, e.g. `"add todo"`.

#### Defined in

[src/types.ts:41](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L41)

___

### parentId

• **parentId**: `string`

Id of the enclosing action when actions are nested, or `null` for
top-level actions.

#### Defined in

[src/types.ts:52](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L52)

___

### payload

• **payload**: `any`

Optional payload passed to `action()`.

#### Defined in

[src/types.ts:46](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L46)

___

### startTime

• **startTime**: `number`

Wall-clock timestamp (milliseconds since epoch) when the action
started.

#### Defined in

[src/types.ts:58](https://github.com/supercat1337/store2/blob/16b98b1eeb525c194544e8c7935c505c824c9de2/src/types.ts#L58)
