import { Op } from 'sequelize';
import { uniq, find } from 'lodash';
import {
    Flow, Node, Plugin,
} from '../models';

export const runTypeC = async (flowId, triggerdTime) => {
    const flow = await Flow.findOne({ where: { flowId }, raw: false });
    if (flow.flowState !== 'ACTIVE') {
        // flow已停止，本次不指定
    }
    let nodes = await Node.findAll({
        where: {
            flowId,
        },
        order: [['parentId', 'ASC'], ['sequence', 'ASC']],
        raw: true,
    });
    // TODO: 检查插件是否最新状态，如果不是，提前刷新agent插件环境

    // 需要用到的plugins
    const plugins = await Plugin.findAll({
        where: {
            pluginId: {
                [Op.in]: uniq(nodes.map(n => n.pluginId)),
            },
        },
        raw: true,
    });
    for (let i = 0, len = nodes.length; i < len; i += 1) {
        const item = nodes[i];
        item.pluginInfo = find(plugins, { pluginId: item.pluginId });
        item.children = nodes.filter(node => node.parentId === item.nodeId);
    }
    nodes = nodes.filter(n => n.parentId === 0);
};

export const run = async () => {
    // get triggered by redis
    const triggered = await redis.rpop('croned');
    if (!triggered) {
        // no job triggered. run refresh job
    }
    // c_1_2018-08-27 09:50:00
    const [flowType, flowId, triggerdTime] = triggered.split('_');
    // 查询flow、plugin信息
    if (flowType === 'c') {
        return runTypeC(flowId, triggerdTime);
    }
    throw new Error(`cannot match this triggered flow type of ${flowType}, raw is ${triggered}`);
};
