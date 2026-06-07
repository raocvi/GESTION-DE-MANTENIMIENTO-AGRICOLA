const { min, max, addDays, differenceInDays } = require('date-fns');

const tasks = [
  { startDate: '2026-05-26T00:00:00Z', endDate: '2026-06-23T00:00:00Z', progress: 36 }
];

const validStarts = tasks
    .map(t => t.startDate ? new Date(t.startDate) : null)
    .filter(d => d !== null && !isNaN(d.getTime()));

const validEnds = tasks
    .map(t => t.endDate ? new Date(t.endDate) : null)
    .filter(d => d !== null && !isNaN(d.getTime()));

const projectStart = min(validStarts);
const projectEnd = max(validEnds);

console.log("validStarts:", validStarts);
console.log("projectStart:", projectStart);

const chartStart = addDays(projectStart, -2);
const chartEnd = addDays(projectEnd, 5);
const totalDays = Math.max(1, differenceInDays(chartEnd, chartStart));

console.log("chartStart:", chartStart);
console.log("totalDays:", totalDays);

const startDate = new Date(tasks[0].startDate);
const endDate = new Date(tasks[0].endDate);
const startOffset = differenceInDays(startDate, chartStart);
const duration = differenceInDays(endDate, startDate) || 1;
const startPercentage = Math.max(0, (startOffset / totalDays) * 100);
const widthPercentage = Math.min(100 - startPercentage, (duration / totalDays) * 100);

console.log("startPercentage:", startPercentage);
console.log("widthPercentage:", widthPercentage);
