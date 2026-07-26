// @ts-check

import test from 'ava';
import { Atom } from '../../src/reactives/Atom.js';
import { modeController } from '../../src/services/modeController.js';

test('changedItemsController: subscriber error is caught and aggregated', t => {
    const a = new Atom(0);
    a.subscribe(() => {
        throw new Error('subscriber error');
    });

    // По умолчанию throwErrorInSubscribers = true, поэтому выбросится ошибка
    t.throws(
        () => {
            a.value = 1;
        },
        { message: /subscriber error/ }
    );
});

test('changedItemsController: subscriber error is not thrown when throwErrorInSubscribers false', t => {
    const a = new Atom(0);
    a.subscribe(() => {
        throw new Error('subscriber error');
    });

    const original = modeController.throwErrorInSubscribers;
    modeController.throwErrorInSubscribers = false;
    t.notThrows(() => {
        a.value = 1;
    });
    modeController.throwErrorInSubscribers = original;
});

import { changedItemsController } from '../../src/services/changedItemsController.js';
import { batch } from '../../src/index.js';
test('changedItemsController: removeItem removes item', t => {
    const a = new Atom(0);
    batch(() => {
        changedItemsController.addItem(a);
        t.true(changedItemsController.items.has(a));
        changedItemsController.removeItem(a);
        t.false(changedItemsController.items.has(a));
    });
});
