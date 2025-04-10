//@ts-check

import { Collection, computed } from "../src/index.js";

let c = new Collection([1, 2, 3]);
c.subscribe((updates) => {
    let data = [];
    updates.forEach((update, key) => {
        data.push(
            `verb = ${update.verb}; key = ${key}; value = ${update.value}`
        );
    });
    console.log("c.subscribe:\n" + data.join("\n"));
});

let len = computed(() => c.data.length);

len.subscribe((updates) => {
    console.log("len.subscribe:\nlength =", len.value);
});

c.data.push(4);
// Outputs:
// c.subscribe:
// verb = set; key = length; value = 4
// verb = set; key = 3; value = 4

// len.subscribe:
// length = 4

c.data[0] = 100;
// Outputs
// c.subscribe:
// verb = set; key = 0; value = 100

c.data.pop();
// Outputs:
// verb = delete; key = 3; value = undefined
// verb = set; key = length; value = 3

// len.subscribe:
// length = 3
