let count = 0;

setInterval(() => {
  count++;
  postMessage(count);
}, 2000);
