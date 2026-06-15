// @ts-check

import { ReactiveList } from "@supercat1337/store2";

const list = new ReactiveList();
const item1 = { name: "item1" };
const item2 = { name: "item2" };
const item3 = { name: "item3" };

list.subscribe((updates) => {
    console.log("updates: ", Array.from(updates.keys()));
    console.log("list.length = ", list.length);
    console.log("list.items = ", list.getItems());
    console.log("=====================================");
});

list.setItems([item1, item2, item3]);
// Outputs:
// updates:  [ '0.name', '1.name', '2.name', 'length' ]
// list.length =  3
// list.items =  [ { name: 'item1' }, { name: 'item2' }, { name: 'item3' } ]

list.setItems([item1]);
// Outputs:
// updates:  [ '1', '2', 'length' ]
// list.length =  1
// list.items =  [ { name: 'item1' } ]

list.setItem(0, { name: "updated" });
// Outputs:
// updates:  [ '0.name' ]
// list.length =  1
// list.items =  [ { name: 'updated' } ]
