import { readdirSync } from 'node:fs';
import { resolve, join } from 'path';

import { settings } from './settings.js';
import { makeMirror } from './makeMirror.js';


const syncSDK = async (): Promise<void> => {
    if (!settings.sdkModulesPath) {
        return;
    }

    const sdkContent = readdirSync(settings.sdkModulesPath);

    // console.log('sdkContent', sdkContent);

    await Promise.all(
        sdkContent.map((item: string): Promise<void> => {
            if (settings.modules.has(item)) {
                // Пропуск целевых модулей
                return Promise.resolve();
            }

            return makeMirror(
                resolve( join(settings.sdkModulesPath, item) ),
                resolve( join(settings.destModulesPath, item) ),
            );
        }),
    );
};


export {
    syncSDK,
};
