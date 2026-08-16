// @ts-check

import test from 'ava';
import { Atom, batch, Computed } from '../src/index.js';

test("Computed: test reactivity / Karlovsky's test", t => {
    let res = [];
    /** @type {string[]} */
    let output = [];

    const numbers = Array.from({ length: 5 }, (_, i) => i);
    /**
     *
     * @param {number} n
     * @returns {number}
     */
    const fib = n => (n < 2 ? 1 : fib(n - 1) + fib(n - 2));

    /**
     *
     * @param {number} n
     * @param {string} l
     * @returns
     */
    const hard = (n, l) => {
        output.push(l);
        return n + fib(16);
    };

    const A = new Atom(0, { name: 'A' });
    const B = new Atom(0, { name: 'B' });

    const C = new Computed(() => (A.value % 2) + (B.value % 2), { name: 'C' });

    const D = new Computed(() => numbers.map(i => ({ x: i + (A.value % 2) - (B.value % 2) })), {
        name: 'D',
    });

    const E = new Computed(() => hard(C.value + A.value + D.value[0].x, 'E'), {
        name: 'E',
        smartRecompute: true,
    });

    const F = new Computed(() => hard(D.value[2].x || B.value, 'F'), {
        name: 'F',
        smartRecompute: true,
    });

    const G = new Computed(
        () => {
            return C.value + (C.value || E.value % 2) + D.value[4].x + F.value;
        },
        {
            name: 'G',
        }
    );

    t.log('  G.value =', G.value);
    t.log('  C.value =', C.value);
    t.log('  E.value =', E.value);
    t.log('  F.value =', F.value);

    const H = G.subscribe(() => {
        console.log('[H] subscriber called');
        res.push(hard(G.value, 'H'));
    });

    const I = G.subscribe(() => res.push(G.value));

    console.log('G.hasSubscribers() after subscriptions:', G.hasSubscribers());
    console.log(
        'G.subscribeController.getSubscribers().length:',
        G.engine.subscribeController.getSubscribers().length
    );

    const J = F.subscribe(() => res.push(hard(F.value, 'J')));

    t.log(
        'A dependents',
        A.engine
            .getDeepDependentsArray()
            .map(d => d.name)
            .join(', ')
    );
    t.log(
        'B dependents',
        B.engine
            .getDeepDependentsArray()
            .map(d => d.name)
            .join(', ')
    );
    t.log(
        'C dependents',
        C.engine
            .getDeepDependentsArray()
            .map(d => d.name)
            .join(', ')
    );
    t.log(
        'D dependents',
        D.engine
            .getDeepDependentsArray()
            .map(d => d.name)
            .join(', ')
    );
    t.log(
        'E dependents',
        E.engine
            .getDeepDependentsArray()
            .map(d => d.name)
            .join(', ')
    );
    t.log(
        'F dependents',
        F.engine
            .getDeepDependentsArray()
            .map(d => d.name)
            .join(', ')
    );
    t.log(
        'G dependents',
        G.engine
            .getDeepDependentsArray()
            .map(d => d.name)
            .join(', ')
    );

    res.length = 0;

    console.log(
        'G.dependencies:',
        Array.from(G.engine.dependencies).map(d => d.name)
    );
    console.log(
        'E.dependents:',
        Array.from(E.engine.dependents).map(d => d.name)
    );
    console.log(
        'F.dependents:',
        Array.from(F.engine.dependents).map(d => d.name)
    );

    for (let i = 0; i < 10; i++) {
        output = [];

        batch(() => {
            t.log('1st round');
            A.value = 1 + i * 2;
            B.value = 1;

            //t.log('A.engine.updates =', Array.from(A.engine.updates.entries()));
            //t.log('B.engine.updates =', Array.from(B.engine.updates.entries()));
            //t.log('C.engine.updates =', Array.from(C.engine.updates.entries()));
            //t.log('D.engine.updates =', Array.from(D.engine.updates.entries()));
            t.log('E.engine.updates =', Array.from(E.engine.updates.entries()));
            t.log('F.engine.updates =', Array.from(F.engine.updates.entries()));
            t.log('G.engine.updates =', Array.from(G.engine.updates.entries()));
        });

        //t.log('C.engine.shouldRecalc', C.engine.shouldRecalc);
        //t.log('D.engine.shouldRecalc', D.engine.shouldRecalc);
        //t.log('E.engine.shouldRecalc', E.engine.shouldRecalc);
        //t.log('F.engine.shouldRecalc', F.engine.shouldRecalc);
        //t.log('G.engine.shouldRecalc', G.engine.shouldRecalc);

        t.is(output.join(', '), 'H');
        // H
        t.log(output.join(', '));

        output = [];
        batch(() => {
            t.log('2nd round');
            A.value = 2 + i * 2;
            B.value = 2;

            //t.log('A.engine.updates =', Array.from(A.engine.updates.entries()));
            //t.log('B.engine.updates =', Array.from(B.engine.updates.entries()));
            //t.log('C.engine.updates =', Array.from(C.engine.updates.entries()));
            //t.log('D.engine.updates =', Array.from(D.engine.updates.entries()));
            t.log('E.engine.updates =', Array.from(E.engine.updates.entries()));
            t.log('F.engine.updates =', Array.from(F.engine.updates.entries()));
            t.log('G.engine.updates =', Array.from(G.engine.updates.entries()));
        });

        // E, H
        t.is(output.join(', '), 'E, H');
        t.log(output.join(', '));

        output = [];
    }
});
