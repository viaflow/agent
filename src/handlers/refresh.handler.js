// refresh plugins
import { spawnSync } from 'child_process';
import rimraf from 'rimraf';
import { Plugin } from '../models';
import { clone, checkout } from '../../utils/git.utils';
import { applicationConf } from '../init/config';
import { isExistsDir } from '../../utils/fs.utils';
/* *
 * 查询数据库中存在的所有plugin
 * clone checkout
 * babel
 * npm install
 * */

export default async () => {
    // const dirName = rename || _.trim(repoUri.split('/')[repoUri.split('/').length - 1], '.git');
    // const cwd = join(process.cwd(), `./plugins/${dirName}`);

    const plugins = await Plugin.findAll({ raw: true });
    plugins.forEach((plugin) => {
        Logger.log(`Process plugin ${plugin.pluginName} to ${plugin.pluginPath}`);
        // rm dir
        if (isExistsDir(plugin.pluginPath)) {
            rimraf.sync(plugin.pluginPath);
        }
        // git clone
        clone(plugin.pluginRepo, plugin.pluginTargetDir);
        // git checkout
        checkout(plugin.pluginPath);
        // babel
        spawnSync(applicationConf.babelCmd, applicationConf.babelParams, { cwd: plugin.pluginPath });
        // npm install
        spawnSync(applicationConf.npmCmd, applicationConf.npmParams, {
            cwd: plugin.pluginCompiledPath,
        });
    });
    return true;
};
