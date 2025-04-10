// @ts-check

import { autorun, makeObservable } from "../src/index.js";

class List {
    data = [];

    constructor(data) {
        this.data = data;
        makeObservable(this, { data: "collection" });
    }

    // not reactive property
    get length() {
        return this.data.length;
    }
}

const list = new List([1, 2, 3]);

let foo = 0;

autorun((updates) => {
    console.log(`list.length = ${list.length}`);
    foo++;
});
// Outputs: list.length = 3

console.log(foo);
// Outputs: 1

list.data.push(4);
// Outputs: list.length = 4
console.log(foo);
// Outputs: 2

list.data.pop();
// set last element to undefined. foo++
// Outputs: list.length = 4
// set new value of length/ foo++
// Outputs: list.length = 3

console.log(foo);
// Outputs: 4
