import { idService } from '../../src/services/idService.js';

import test from 'ava';

test('idService: compareIds', t => {
    let id = idService.generateId();
    let id2 = idService.generateId();

    new Promise(resolve => {
        setTimeout(() => {
            resolve(1);
        }, 1);
    }).then(() => {
        let id3 = idService.generateId();
        t.log(`id = ${id.toString()}, id3 = ${id3.toString()}`);

        t.is(idService.compareIds(id, id3), -1);
        t.is(idService.compareIds(id3, id), 1);
    });

    t.log(`id = ${id.toString()}, id2 = ${id2.toString()}`);

    t.is(idService.compareIds(id, id2), -1);
    t.is(idService.compareIds(id2, id), 1);
    t.is(idService.compareIds(id, id), 0);
});

test('idService: reset', t => {
    const id1 = idService.generateId();
    idService.reset();
    const id2 = idService.generateId();
    t.is(id2, 0);
    // id1 может быть больше 0, но после сброса следующий id = 0
});
