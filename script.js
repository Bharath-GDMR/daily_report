
const dateElement = document.getElementById('date');

const today = new Date();
const day = today.getDate();
const month = today.toLocaleString('default', { month: 'long' });
const year = today.getFullYear();

let suffix = 'th';
if (day === 1 || day === 21 || day === 31) {
    suffix = 'st';
} else if (day === 2 || day === 22) {
    suffix = 'nd';
} else if (day === 3 || day === 23) {
    suffix = 'rd';
}

dateElement.textContent = `${day}${suffix} ${month} ${year}`;
