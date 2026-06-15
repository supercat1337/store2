// @ts-check

import { Atom, batch, Computed } from '@supercat1337/store2';

const a = new Atom(0, { name: 'a' });
const b = new Atom(0, { name: 'b' });

const c = new Computed(() => a.value + b.value, { name: 'c' });

batch(() => {
    a.value = 1;
    b.value = 1;
    a.value++;
});

console.log('a = ', a.value);
console.log('c = ', c.value);
// Output:
// a = 2
// c = 3
console.log('==================================');

batch(() => {
    a.value++;
    b.value++;
});

console.log('a = ', a.value);
console.log('c = ', c.value);
// Output:
// a = 3
// c = 5

console.log('==================================');

batch(() => {
    a.value = 3;
});

console.log('a = ', a.value);
console.log('c = ', c.value);

// Output:
// a = 3
// c = 5
console.log('==================================');
