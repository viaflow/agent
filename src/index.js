
import init from './init';

init.forEach((i) => {
    i();
});
const entry = require('./handlers/run.handler');
/**
 * 轮询Job队列（以后可能替换掉redis）
 * 如果存在被触发的Job，去数据库检查Plugin的最后更新日期信息
 * 检查当前Job所有引用的插件，如果在日志中发现有引用，则需要更新当前agent的plugins
 * 如果没有引用，则需要在Job执行完毕后，触发async callback，更新当前agent插件
 *
 * 如果没有被触发的Job，执行plugin检查逻辑
 */

const setIntervalAsync = (callback, ms) => {
    callback().then(() => {
        setTimeout(() => setIntervalAsync(callback, ms), ms);
    });
};

// const delayReport = deplayMs => new Promise((resolve) => {
//     setTimeout(resolve, deplayMs);
// });

setIntervalAsync(async () => {
    try {
        await entry.run();
    } catch (e) {
        Logger.error(e);
    }
}, 1000);

// more logic here or in setIntervalAsync callback
