import { Op } from 'sequelize';
import {
    uniq, find, get, replace,
} from 'lodash';
import dayjs from 'dayjs';
import {
    Flow, Node, Plugin, FlowHistory,
} from '../models';


/* eslint-disable */
export const runNodes = async (flowNodes, previewData, processLog) => {
    const conditioned = flowNodes.filter(n => n.signal === 'ANY');// 需要执行的node
    if (previewData && previewData.code === true) {
        conditioned.push(...(flowNodes.filter(n => n.signal === 'SUCCESS')));
    }
    if (previewData && previewData.code === false) {
        conditioned.push(...(flowNodes.filter(n => n.signal === 'FAILURE')));
    }

    for (let i = 0, len = conditioned.length; i < len; i += 1) {
        const currentNode = conditioned[i];
        const { Execute } = require(currentNode.pluginInfo.pluginCompiledPath);
        // process plugin configuration use preview data
        const configurations = JSON.parse(currentNode.configurations);

        Object.keys(configurations).forEach((key) => {
            const v = configurations[key];
            if (v.indexOf('${preview}') > -1) {
                configurations[key] = get(previewData, replace(v, '${preview}', 'data'));
            }
        });
        try {

            const nextData = await Execute({ data: configurations });

            Logger.log(`[SUCCESS] Flow(${currentNode.flowId})/Node(${currentNode.nodeId}) - ${currentNode.signal}`)
            if (processLog && processLog instanceof Array) {
                processLog.push(Object.assign({
                    flowId: currentNode.flowId,
                    nodeId: currentNode.nodeId,
                    signal: currentNode.signal,
                    previewData: previewData,
                }, nextData));
            }
            if (currentNode.children && currentNode.children.length > 0) {
                await runNodes(currentNode.children, nextData, processLog);
            } else {
                return true;
            }
        } catch (exp) {
            // 如果插件没有handle住异常，agent构建信息向下传递
            const nextData = {
                code: false,
                error: exp,
                data: {},
            };
            Logger.log(`[FAILURE] Flow(${currentNode.flowId})/Node(${currentNode.nodeId}) - ${currentNode.signal}, ${exp.message}`)
            if (processLog && processLog instanceof Array) {
                processLog.push(Object.assign({
                    flowId: currentNode.flowId,
                    nodeId: currentNode.nodeId,
                    signal: currentNode.signal,
                    previewData: previewData,
                }, nextData));
            }
            if (currentNode.children && currentNode.children.length > 0) {
                await runNodes(currentNode.children, nextData, processLog);
            } else {
                return true;
            }
        }
    }
};
/* eslint-disable */

/*
const rst = {
        code: response.statusCode && /^2/.test(`${response.statusCode}`),
        data: response,
    };
*/
export const runTypeC = async (flowId, triggerdTime) => {
    const start = new Date();
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
    const executeLog = []
    // 迭代执行所有分支
    const rstss = await runNodes(nodes, undefined, executeLog);
    const end = new Date();
    await FlowHistory.create({
        flowId: flowId,
        triggeredAt: dayjs(triggerdTime).toDate(),
        executeStartAt: start,
        executeEndAt: end,
        processInfo: JSON.stringify(executeLog),
        createdAt: new Date()
    });
};

export const run = async () => {
    // get triggered by redis
    const triggered = await redis.rpop('croned');
    if (!triggered) {
        // no job triggered. run refresh job
        return;
    }
    // c_1_2018-08-27 09:50:00
    const [flowType, flowId, triggerdTime] = triggered.split('_');
    // 查询flow、plugin信息
    if (flowType === 'c') {
        return runTypeC(flowId, triggerdTime);
    }
    throw new Error(`cannot match this triggered flow type of ${flowType}, raw is ${triggered}`);
};
