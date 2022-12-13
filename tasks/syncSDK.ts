import { readdirSync } from 'node:fs';
import { resolve, join } from 'path';

import { settings } from './../lib/settings';
import { makeMirror } from './../lib/makeMirror';


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
                return;
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
