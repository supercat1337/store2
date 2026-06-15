//@ts-check

import { Collection, Computed } from "@supercat1337/store2";

let collection = new Collection([{ foo: 0 }, { foo: 1 }, { foo: 2 }]);

collection.subscribe((updates) => {
    console.log("updated", updates);
});

let sum = new Computed(() => {
    let sum = 0;
    let content = collection.data;

    for (let i = 0; i < content.length; i++) {
        sum += content[i].foo;
    }

    return sum;
});

sum.subscribe((updates) => {
    console.log("sum updated", updates);
});

collection.data.push({ foo: 5 });
