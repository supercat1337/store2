// @ts-check

import { atom, autorun } from "../../dist/store2.bundle.esm.js";

const counterElement = /** @type {HTMLDivElement} */ (document.getElementById("counter"));
const incrementButton = /** @type {HTMLButtonElement} */ (document.getElementById("increment"));
const decrementButton = /** @type {HTMLButtonElement} */ (document.getElementById("decrement"));
const resetButton = /** @type {HTMLButtonElement} */ (document.getElementById("reset"));

const counter = atom(0, { name: "counter" });

autorun(() => {
    counterElement.textContent = counter.value.toString();
});

incrementButton.addEventListener("click", () => {
    counter.value++;
});
decrementButton.addEventListener("click", () => {
    counter.value--;
});
resetButton.addEventListener("click", () => {
    counter.value = 0;
});