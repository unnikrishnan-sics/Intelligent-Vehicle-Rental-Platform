/* eslint-disable no-restricted-globals */
// worker to avoid browser throttling in background tabs

let intervalId = null;

self.onmessage = (e) => {
    if (e.data.action === 'start') {
        const delay = e.data.delay || 3000;
        if (intervalId) clearInterval(intervalId);

        intervalId = setInterval(() => {
            self.postMessage({ type: 'tick' });
        }, delay);
    } else if (e.data.action === 'stop') {
        if (intervalId) clearInterval(intervalId);
        intervalId = null;
    }
};
