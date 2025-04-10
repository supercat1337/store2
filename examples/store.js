// @ts-check

import { atom, batch, computed, Store } from "../src/index.js";

const store = new Store();
const a = atom(0);
const b = atom(0);

const childStore = new Store();
const sum = computed(() => a.value + b.value);
childStore.addItems({ sum });

store.addItems({ a, b, childStore });

store.subscribe((updates) => {
    let updatesArr = Array.from(updates.keys());
    console.log("props", updatesArr);
});

// mute updates
store.muteUpdates();
childStore.removeItem("childStore");
a.value = 3;
b.value = 4;
store.unmuteUpdates();
// outputs
// props [ 'a', 'childStore.sum', 'b' ]

// without mute updates

a.value = 1;
// outputs
// props [ 'a' ]
// props [ 'childStore.sum' ]

b.value = 2;
// outputs
//props [ 'b' ]
//props [ 'childStore.sum' ]

// using batch
batch(() => {
    a.value = 2;
    b.value = 3;
});
// outputs
// props [ 'a' ]
// props [ 'childStore.sum' ]
