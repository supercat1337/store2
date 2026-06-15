// @ts-check

import { atom, autorun } from '@supercat1337/store2';

const counterElement = /** @type {HTMLDivElement} */ (document.getElementById('counter'));
const incrementButton = /** @type {HTMLButtonElement} */ (document.getElementById('increment'));
const decrementButton = /** @type {HTMLButtonElement} */ (document.getElementById('decrement'));
const resetButton = /** @type {HTMLButtonElement} */ (document.getElementById('reset'));

const counter = atom(0, { name: 'counter' });

autorun(() => {
    counterElement.textContent = counter.value.toString();
});

incrementButton.addEventListener('click', () => {
    counter.value++;
});
decrementButton.addEventListener('click', () => {
    counter.value--;
});
resetButton.addEventListener('click', () => {
    counter.value = 0;
});
