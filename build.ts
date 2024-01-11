import { join } from 'node:path';

import sanitize from 'sanitize-filename';

import { Builder } from './classes/Builder.js';
import { Server } from './classes/Server.js';
import { FileIndexCache } from './classes/FileIndexCache.js';
import { handleSourceChanges } from './lib/handleFileIndexEvent.js';
import { settings } from './lib/settings.js';
import { syncDistro } from './lib/syncDistro.js';
import { syncSDK } from './lib/syncSDK.js';
import { processPageX } from './lib/processPageX.js';


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
        writeDebounceTime: 2000,
        path
    });

    // await cache.clear();

    const builder = new Builder({
        targets: settings.targets,
        cache,
        watch: {
            debounceTime: 1000,
        },

        onChanges: handleSourceChanges,
    });


    const server = new Server({
        port: 3082,
        processPageX
    });

    server.run();
};

void main();
