// @ts-check

import { Atom, Computed, batch} from "../src/index.js";

/**
 * @param {number} num
 * @returns {string}
 */
function zeroPad(num){
    if (num < 10) return ("0" + num);
    return String(num);

}

const sec = new Atom(0);
const min = new Atom(0);
const hour = new Atom(0);

hour.subscribe(()=>{
    console.log("hour");
});

const time = new Computed(()=>{
    return `${zeroPad(hour.value)}:${zeroPad(min.value)}:${zeroPad(sec.value)}`; 
});

time.subscribe(()=>{
    console.log(time.value);
});

function tick(){
    sec.value++;
    if (sec.value == 60) {
        min.value++;
        sec.value = 0;
    }

    if (min.value == 60) {
        hour.value++;
        min.value = 0;
    }

    if (hour.value == 0 && min.value == 1 && sec.value == 10) {
        clearInterval(intervalId);
    }
}

let intervalId = setInterval(()=>{
    batch(tick);
}, 100);