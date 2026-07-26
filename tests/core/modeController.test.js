// @ts-check

import test from 'ava';
import { modeController } from '../../src/services/modeController.js';

test('modeController: exitBatch when depth 0 does nothing', t => {
    t.false(modeController.batchMode);
    modeController.exitBatch();
    t.false(modeController.batchMode);
});

test('modeController: enterBatch and exitBatch', t => {
    t.false(modeController.batchMode);
    modeController.enterBatch();
    t.true(modeController.batchMode);
    modeController.exitBatch();
    t.false(modeController.batchMode);
});

test('modeController: runAfterSubscribers when subscribersMode false', t => {
    let called = false;
    modeController.runAfterSubscribers(() => {
        called = true;
    });
    // Так как subscribersMode false, callback должен выполниться сразу?
    // В реализации runAfterSubscribers добавляет слушатель на событие subscribersModeEnd.
    // Если subscribersMode false, событие не произойдёт, пока не завершится режим.
    // Но мы можем принудительно вызвать endSubscribersMode.
    modeController.startSubscribersMode();
    modeController.endSubscribersMode();
    t.true(called);
});

test('modeController: on batchModeStart and batchModeEnd', t => {
    let start = 0,
        end = 0;
    modeController.on('batchModeStart', () => start++);
    modeController.on('batchModeEnd', () => end++);
    modeController.enterBatch();
    t.is(start, 1);
    modeController.exitBatch();
    t.is(end, 1);
});

test('modeController: endSubscribersMode when not active does nothing', t => {
    t.false(modeController.subscribersMode);
    modeController.endSubscribersMode(); // покрывает return
    t.false(modeController.subscribersMode);
});