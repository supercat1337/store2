// @ts-check

import test from 'ava';
import { UpdateDataRecord, UpdateDataRecordManager } from '../../src/core/UpdateDataRecord.js';
import { Atom } from '../../src/reactives/Atom.js';

test('UpdateDataRecord: constructor with reactiveItem', t => {
    const a = new Atom(0);
    const record = new UpdateDataRecord('set', 1, 2, a);
    t.is(record.type, 'set');
    t.is(record.oldValue, 1);
    t.is(record.value, 2);
    t.is(record.reactiveItem, a);
});

test('UpdateDataRecord: constructor without reactiveItem', t => {
    const record = new UpdateDataRecord('delete', undefined, undefined);
    t.is(record.type, 'delete');
    t.is(record.oldValue, undefined);
    t.is(record.value, undefined);
    t.is(record.reactiveItem, undefined);
});

test('UpdateDataRecordManager: removeItem deletes nested keys', t => {
    const data = new Map();
    data.set('a', new UpdateDataRecord('set', 1, 2));
    data.set('a.b', new UpdateDataRecord('set', 3, 4));
    data.set('a.b.c', new UpdateDataRecord('set', 5, 6));
    data.set('x', new UpdateDataRecord('set', 7, 8));

    const manager = new UpdateDataRecordManager(data);
    manager.removeItem('a');

    t.true(data.has('a'));
    const record = data.get('a');
    t.is(record.type, 'delete');
    t.is(record.value, undefined);
    t.is(record.oldValue, undefined);

    t.false(data.has('a.b'));
    t.false(data.has('a.b.c'));
    t.true(data.has('x'));
});
