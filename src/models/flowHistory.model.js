import Sequelize from 'sequelize';

export default sequelize.define('flow_history', {
    historyId: { type: Sequelize.BIGINT(11), primaryKey: true, autoIncrement: true },
    flowId: Sequelize.BIGINT(11),
    triggeredAt: Sequelize.DATE,
    executeStartAt: Sequelize.DATE,
    executeEndAt: Sequelize.DATE,
    processInfo: Sequelize.STRING,
    createdAt: Sequelize.DATE,
}, {
    updatedAt: false,
    tableName: 'flow_history',
});
