// @ts-check

import test from "ava";
import { ReactiveList } from "./reactiveList.js";
import { ReactiveProps } from "../reactives/reactiveProps.js";

test("ReactiveList: add, getItem", (t) => {
    const list = new ReactiveList();
    const item1 = { name: "item1" };
    const item2 = { name: "item2" };

    list.add(item1, item2);

    t.deepEqual(list.getItem(0), item1);
    t.deepEqual(list.getItem(1), item2);
    t.is(list.getItem(2), undefined);
});

test("ReactiveList: setItem", (t) => {
    const list = new ReactiveList();
    const item1 = { name: "item1" };
    const item2 = { name: "item2" };

    list.add(item1, item2);

    list.setItem(0, { name: "updatedItem1" });

    t.deepEqual(list.getItem(0), { name: "updatedItem1" });
    t.deepEqual(list.getItem(1), item2);
});

test("ReactiveList: length", (t) => {
    const list = new ReactiveList();
    const item1 = { name: "item1" };
    const item2 = { name: "item2" };

    list.add(item1, item2);

    t.is(list.length, 2);
});

test("ReactiveList: remove", (t) => {
    const list = new ReactiveList();
    const item1 = { name: "item1" };
    const item2 = { name: "item2" };

    list.add(item1, item2);

    list.removeItem(0);

    t.is(list.length, 1);
});

test("ReactiveList: clear", (t) => {
    const list = new ReactiveList();
    const item1 = { name: "item1" };
    const item2 = { name: "item2" };

    list.add(item1, item2);

    list.clear();

    t.is(list.length, 0);
});

test("ReactiveList: splice", (t) => {
    const list = new ReactiveList();
    const item1 = { name: "item1" };
    const item2 = { name: "item2" };

    list.add(item1, item2);

    t.notThrows(() => {
        list.splice(2, -1);
    });
    t.notThrows(() => {
        list.splice(-2, 1);
    });
    list.splice(0, 1);
    t.is(list.length, 1);
});

test("ReactiveList: removeLastItem", (t) => {
    const list = new ReactiveList();
    const item1 = { name: "item1" };
    const item2 = { name: "item2" };

    list.add(item1, item2);
    list.removeLastItem();

    t.is(list.length, 1);
});

test("ReactiveList: add with no items", (t) => {
    const list = new ReactiveList();
    t.is(list.length, 0);
});

test("ReactiveList: add with one item", (t) => {
    const list = new ReactiveList();
    const item1 = { name: "item1" };

    list.add(item1);

    t.is(list.length, 1);
});

test("ReactiveList: add with multiple items", (t) => {
    const list = new ReactiveList();
    const item1 = { name: "item1" };
    const item2 = { name: "item2" };

    list.add(item1, item2);

    t.is(list.length, 2);
});

test("ReactiveList: setItems with no items", (t) => {
    const list = new ReactiveList();
    list.setItems([]);
    t.is(list.length, 0);
});

test("ReactiveList: setItems with one item", (t) => {
    const list = new ReactiveList();
    const item1 = { name: "item1" };

    list.setItems([item1]);

    t.is(list.length, 1);
});

test("ReactiveList: setItems with multiple items", (t) => {
    const list = new ReactiveList();
    const item1 = { name: "item1" };

    list.setItems([item1]);
    t.is(list.length, 1);

    const item2 = { name: "item2" };
    list.setItems([item1, item2]);
    t.deepEqual(list.getItems(), [item1, item2]);

    t.is(list.length, 2);
});

test("ReactiveList: setItems with multiple items #2", (t) => {
    const list = new ReactiveList();
    const item1 = { name: "item1" };
    const item2 = { name: "item2" };
    const item3 = { name: "item3" };

    list.setItems([item1, item2, item3]);
    t.is(list.length, 3);

    list.setItems([item1, item2]);

    t.is(list.length, 2);
});

test("ReactiveList: setItems with empty array", (t) => {
    const list = new ReactiveList();
    list.setItems([]);
    t.is(list.length, 0);
});

test("ReactiveList: setItems with array of items", (t) => {
    const list = new ReactiveList();
    const item1 = { name: "item1" };
    const item2 = { name: "item2" };

    list.setItems([item1, item2]);

    t.is(list.length, 2);
});

test("ReactiveList: destroy", (t) => {
    const list = new ReactiveList();
    const item1 = { name: "item1" };
    const item2 = { name: "item2" };

    list.add(item1, item2);

    list.destroy();
    list.destroy();

    t.is(list.length, 0);
    t.is(list.isDestroyed, true);
});

test("ReactiveList: after destroy", (t) => {
    const list = new ReactiveList();
    const item1 = { name: "item1" };
    const item2 = { name: "item2" };

    list.destroy();

    t.throws(() => {
        list.subscribe(() => {});
    });

    t.throws(() => {
        list.add(item1, item2);
    });
    t.throws(() => {
        list.splice(0, 1);
    });
    t.throws(() => {
        list.removeItem(0);
    });
    t.throws(() => {
        list.removeLastItem();
    });
    t.throws(() => {
        list.clear();
    });
    t.throws(() => {
        list.setItems([]);
    });
    t.throws(() => {
        list.setItem(0, item1);
    });
    t.throws(() => {
        list.getItem(0);
    });
    t.throws(() => {
        list.getItems();
    });
    t.notThrows(() => {
        list.length;
    });
    t.throws(() => {
        list.removeFirstItem();
    });
    t.pass();
});

test("ReactiveList: subscribe", (t) => {
    const list = new ReactiveList();

    const item1 = { name: "item1" };
    const item2 = { name: "item2" };

    let count = 0;

    list.subscribe((updates) => {
        count++;
    });

    list.add(item1, item2);

    t.is(count, 1);
    list.setItem(0, { name: "updatedItem1" });
    t.deepEqual(list.getItem(0), { name: "updatedItem1" });
    t.is(count, 2);
});

test("ReactiveList: getItems()", (t) => {
    const list = new ReactiveList();
    const item1 = { name: "item1" };
    const item2 = { name: "item2" };

    list.add(item1, item2);

    t.deepEqual(list.getItems(), [item1, item2]);
});
