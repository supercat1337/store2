import { ReactivePrimitive } from "./reactivePrimitive.js";
import test from "ava";

test("ReactivePrimitive: getValue", (t) => {
    const a = new ReactivePrimitive();
    t.throws(() => a.getValue());
});
