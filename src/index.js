// import dayjs from 'dayjs';
import init from './init';

init.forEach((i) => {
    i();
});

const setIntervalAsync = (callback, ms) => {
    callback().then(() => {
        setTimeout(() => setIntervalAsync(callback, ms), ms);
    });
};

const delayReport = deplayMs => new Promise((resolve) => {
    setTimeout(resolve, deplayMs);
});

setIntervalAsync(async () => {
    try {
        const seed = Math.floor((Math.random() * 100) + 1);
        if (seed % 2 === 0) {
            Logger.log(now());
            await delayReport(500);
        } else {
            throw new Error('get a random error');
        }
    } catch (e) {
        Logger.error(e);
    }
}, 1000);

// more logic here or in setIntervalAsync callback
