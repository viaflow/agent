
import { existsSync, mkdirSync, statSync } from 'fs';
import { join } from 'path';

const pluginDirPath = join(process.cwd(), './plugins');

if (existsSync(pluginDirPath) && statSync(pluginDirPath).isDirectory()) {
    Logger.log('Plugin folder mission completed.');
} else {
    // create folder
    mkdirSync(pluginDirPath);
}
