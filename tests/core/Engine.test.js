// @ts-check

import { Computed } from '../../src/reactives/Computed.js';
import { Atom } from '../../src/reactives/Atom.js';
import test from 'ava';
import { batch } from '../../src/api/api.js';

test('Engine: notifyDependents with no context', t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });
    const c = new Computed(() => a.value + b.value, { name: 'c' });

    t.false(c.engine.shouldRecalc);
    a.engine.notifyDependents(EngineMessages.DEPENDENCY_CHANGED);
    t.true(c.engine.shouldRecalc);
});

test('Engine: notifyDependents with context', t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });
    const c = new Computed(() => a.value + b.value, { name: 'c' });

    const ctx = {
        sender: a,
        recipients: new Set(),
    };

    a.engine.notifyDependents(EngineMessages.DEPENDENCY_CHANGED, ctx);

    t.true(ctx.recipients.has(c));
});

test('Engine: hasUpdates', t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });
    const c = new Computed(() => a.value + b.value, { name: 'c' });

    batch(() => {
        a.value++;
        b.value++;
        t.true(a.engine.hasUpdates());

        a.value = 0;

        t.false(a.engine.hasUpdates());

        t.true(b.engine.hasUpdates());
        t.false(c.engine.hasUpdates());

        let foo = c.value + 1;
        t.true(c.engine.hasUpdates());
    });

    t.false(c.engine.hasUpdates());
    t.false(a.engine.hasUpdates());
    t.false(b.engine.hasUpdates());
});

test('Engine: Computed addDependent while destroyed', t => {
    const a = new Atom(0, { name: 'a' });

    const c = new Computed(() => a.value, { name: 'c' });

    c.destroy();

    const b = new Atom(0, { name: 'b' });

    t.false(c.engine.addDependent(b));
    t.is(a.engine.dependents.size, 0);
});

test('Engine: Computed notifyDependencies', t => {
    const a = new Atom(0, { name: 'a' });
    const b = new Atom(0, { name: 'b' });
    const c = new Computed(() => a.value + b.value, { name: 'c' });

    const ctx = {
        sender: c,
        recipients: new Set(),
    };

    c.engine.notifyDependencies(EngineMessages.DEPENDENT_DESTROYED, ctx);

    t.true(ctx.recipients.has(a));
    t.true(ctx.recipients.has(b));
});

test('Engine: setError(null)', t => {
    const a = new Atom(0, { name: 'a' });
    a.engine.setError(null);
    t.is(a.engine.error, null);
});

import { Collection } from '../../src/reactives/Collection.js';
import { EngineMessages } from '../../src/core/MessageHandler.js';

test('Engine: Computed with error propagation to dependent', t => {
    const a = new Atom(0);
    const c = new Computed(() => {
        if (a.value > 10) throw new Error('too big');
        return a.value;
    });
    const d = new Computed(() => c.value * 2);

    t.is(d.value, 0);
    a.value = 20;
    t.true(d.hasError());
    t.true(d.getLastError()?.message.includes('too big'));
});

test('Engine: setError with context', t => {
    const a = new Atom(0);
    const b = new Computed(() => a.value);
    const ctx = { sender: a, recipients: new Set() };
    a.engine.setError(new Error('test'), ctx);
    t.true(ctx.recipients.has(b));
    t.true(b.engine.shouldRecalc);
});

test('Engine: destroy with context', t => {
    const a = new Atom(0);
    const b = new Computed(() => a.value);
    const ctx = { sender: a, recipients: new Set() };
    a.engine.destroy(ctx);
    t.true(ctx.recipients.has(b));
    t.true(a.engine.isDestroyed);
    t.true(b.engine.isDestroyed);
});

test('Engine: notifyDependencies sends DEPENDENT_DESTROYED', t => {
    const a = new Atom(0);
    const b = new Computed(() => a.value);
    const ctx = { sender: b, recipients: new Set() };
    b.engine.notifyDependencies(EngineMessages.DEPENDENT_DESTROYED, ctx);
    t.true(ctx.recipients.has(a));
    // Проверяем, что a удалил b из своих dependents (это происходит в getMessage)
    t.false(a.engine.dependents.has(b));
});

test('Engine: hasUpdates after value change in Collection', t => {
    const coll = new Collection([1, 2]);
    let called = 0;
    /** @type {(Map<string, import('../../src/types.js').UpdateDataRecord>)|null} */
    let updatesMap = null;
    coll.subscribe(updates => {
        called++;
        updatesMap = new Map(updates);
    });

    batch(() => {
        coll.value[0] = 10;
        // внутри батча обновления ещё не очищены
        t.true(coll.engine.hasUpdates());
        t.true(coll.engine.updates.has('0'));
    });

    t.is(called, 1);
    t.true(updatesMap instanceof Map);
    t.true(updatesMap.has('0'));
    // после батча hasUpdates может быть false, но нам важнее проверить подписчика
});

test('Engine: addDependency and addDependent', t => {
    const a = new Atom(0);
    const b = new Atom(0);
    a.engine.addDependency(b);
    t.true(a.engine.dependencies.has(b));
    b.engine.addDependent(a);
    t.true(b.engine.dependents.has(a));
});

test('Engine: removeDependent', t => {
    const a = new Atom(0);
    const b = new Computed(() => a.value);
    a.engine.removeDependent(b);
    t.false(a.engine.dependents.has(b));
});

test('Engine: isEffectiveChangeWithOld in batch mode', t => {
    const a = new Atom(0);
    batch(() => {
        a.value = 1;
        const result = a.engine.isEffectiveChangeWithOld('', 0, 1);
        t.true(result);
    });
});

test('Engine: isEffectiveChangeWithOld outside batch', t => {
    const a = new Atom(0);
    const result = a.engine.isEffectiveChangeWithOld('', 0, 1);
    t.true(result);
});

test('Engine: isEffectiveChangeWithOld returns false when values equal', t => {
    const a = new Atom(0);
    const result = a.engine.isEffectiveChangeWithOld('', 0, 0);
    t.false(result);
});

test('Engine: getDeepDependents handles cycles', t => {
    const a = new Atom(0);
    const b = new Computed(() => a.value);
    const c = new Computed(() => a.value);
    // Ручное добавление циклической зависимости (только для теста)
    b.engine.addDependency(c);
    c.engine.addDependency(b);
    // Теперь b и c зависят друг от друга
    const result = a.engine.getDeepDependents();
    t.true(result.has(b));
    t.true(result.has(c));
    // visited должен предотвратить бесконечный цикл
});
