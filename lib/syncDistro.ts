import { readdirSync } from 'node:fs';
import { resolve, join } from 'path';

import { settings } from './settings.js';
import { makeMirror } from './makeMirror.js';


const syncDistro = async (): Promise<void> => {
    if (!settings.distro) {
        return;
    }

    const distroModulesPath = join(settings.distro, 'Модули интерфейса');
    const distroUiContent = readdirSync(distroModulesPath);
    const sdkContent = readdirSync(settings.sdkModulesPath);

    await Promise.all(
        distroUiContent.map((item: string): Promise<void> => {
            if (settings.modules.has(item)) {
                // Пропуск целевых модулей
                return;
            }

            if (sdkContent.includes(item)) {
                // Пропуск модулей SDK
                return;
            }

            return makeMirror(
                resolve( join(distroModulesPath, item) ),
                resolve( join(settings.destModulesPath, item) ),
            );
        }),
    );
};


export {
    syncDistro,
};
