import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import colors from 'colors';
import tracer from 'tracer';
import dayjs from 'dayjs';

// import { tokenConf } from './config';

// region Global variables initialization
const setGlobal = () => {
    global._ = _;
    global.NODE_ENV = process.env.NODE_ENV || 'development';
    global.now = () => dayjs().format('YYYY-MM-DD HH:mm:ss');
};
// endregion

// region Logger module settings, do not use console moudle

/* eslint-disable */
const setLogger = () => {
    const logFormat = '{{level}}_{{title}} {{timestamp}} [{{path}}:{{line}}] {{message}}';

    const logConfig = {
        level: 'log',
        format: [logFormat],
        filters: {
            log: colors.grey,
            trace: colors.magenta,
            debug: colors.blue,
            info: colors.green,
            warn: colors.yellow,
            error: [colors.red, colors.bold],
        },
        dateformat: 'HH:MM:ss',
        preprocess: (data) => {
            switch (data.title) {
                case 'log':
                    data.title += ' ';
                    break;
                case 'info':
                case 'warn':
                    data.title += '@@';
                    break;
                default:
                    data.title += ' ';
                    break;
            }
            data.title = data.title.toUpperCase();
            data.path = data.path.replace(process.cwd(), '').replace('.js', '').replace('.ts', '');
        },
    };

    global.Logger = tracer.colorConsole(logConfig);
    Logger.debug(`
    ################ system booting, start with Logger setup
    ==>> ${now()}`);
    if (process.env.NODE_ENV === 'production') {
        tracer.setLevel('log');
    }
};
/* eslint-disable */

// endregion

// region Database module settings
const setDatabase = () => {
    // db settings required from src/inti/db/*.*
    // initialize database information like mongo/mysql or redis...
    Logger.log(`database setup...`);
    const dbSettingsDir = 'src/init/db';
    const dbFiles = fs.readdirSync(path.join(process.cwd(), dbSettingsDir));
    dbFiles.forEach(dbf => {
        require(path.join(process.cwd(), dbSettingsDir, dbf));
    })
}
// endregion

// region register custom scripts
const setScripts = () => {
    Logger.log(`custom scripts setup...`);
    const customScriptDir = 'src/init/customs';
    const customScripts = fs.readdirSync(path.join(process.cwd(), customScriptDir));
    customScripts.forEach(script => {
        require(path.join(process.cwd(), customScriptDir, script));
    })
}
// endregion

// endregion

export default [setGlobal, setLogger, setDatabase, setScripts];