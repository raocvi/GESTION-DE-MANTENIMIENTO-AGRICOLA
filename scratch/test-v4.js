const { min, max, addDays, differenceInDays } = require('date-fns');

const d1 = new Date('2026-05-26T00:00:00Z');
const d2 = new Date('2026-06-23T00:00:00Z');

console.log("min([d1, d2]):", min([d1, d2]));
