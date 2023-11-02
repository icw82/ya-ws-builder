import { join } from 'node:path';

import sanitize from 'sanitize-filename';

import { FileWatcher } from './classes/FileWatcher.js';
import { FileIndexCache } from './classes/FileIndexCache.js';
import { handleSourceChanges } from './lib/handleFileIndexEvent.js';
import { settings } from './lib/settings.js';
import { syncDistro } from './lib/syncDistro.js';
import { syncSDK } from './lib/syncSDK.js';


const main = async (): Promise<void> => {
    {
        console.log('— Синхронизация дистрибутива —');
        await syncDistro();
    }

    {
        console.log('— Синхронизация SDK —');
        await syncSDK();
    }

    console.log('— Индексация целевых директорий —');

    /** Путь до индекс-файла */
    const path = join(
        settings.baseDir,
        'index',
        sanitize(settings.dest, { replacement: '_' })
    );

    const cache = new FileIndexCache({
        targets: settings.targets,
        path
    });

    // await cache.clear();

    const index = new FileWatcher({
        targets: settings.targets,
        cache,
        watch: {
            debounceTime: 1000,
        },

        onChanges: handleSourceChanges,
    });

};

void main();
