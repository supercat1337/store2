import { idService } from "./idService.js";

import test from "ava";

test("idService: timestamp === lastTimestamp && innerIndex === Number.MAX_SAFE_INTEGER", (t) => {
    let id = idService.generateId();
    idService.lastInnerIndex = Number.MAX_SAFE_INTEGER - 1;
    let id2 = idService.generateId();
    t.log(`id = ${id.toString()}, id2 = ${id2.toString()}`);
    t.is(idService.compareIds(id, id2), -1);
});

test("idService: MAX_SAFE_INTEGER", (t) => {
    idService.lastInnerIndex = Number.MAX_SAFE_INTEGER - 1;
    let id = idService.generateId();
    t.is(id.innerIndex, 0);
});

test("idService: compareIds", (t) => {
    let id = idService.generateId();
    let id2 = idService.generateId();

    new Promise((resolve) => {
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
