// import { clearBuild } from './clearBuild.js';
// import { transferImmutable } from './transferImmutable.js';
// import { buildTypescript } from './typescript.js';

import { watch } from 'node:fs';
import { join } from 'node:path';

import { settings } from './lib/settings.js';
// import { getFilePaths } from './lib/getFilePaths';

import { FileIndex } from './classes/FileIndex.js';
import { EventProcessor } from './classes/EventProcessor.js';


const main = async (): Promise<void> => {
    console.log('— Индексация —');

    const pattern = [...settings.targets].map((target: string): string => {
        return `${ target }/**/*`.replace(/\\/g, '/');
    });

    const index = new FileIndex({
        path: join(settings.baseDir, '.ya-index'),
        pattern
    });

    const changes = await index.update();
    console.log('changes', changes);

    // index.save();

    // console.log('— Очистка директории сборки —');
    // await clearBuild();

    // console.log('— Перенос неизменяемых файлов —');
    // await transferImmutable();

    // console.log('— Сборка TypeScript —');
    // await buildTypescript();

    console.log('— Сборка завершена —');

    console.log('— Начало наблюдения —');

    const eventProcessor = new EventProcessor({
        debounceTime: 1000,
        fileIndex: index,
    });

    settings.targets.forEach((target: string): void => {
        watch(
            target,
            { recursive: true },
            (eventType, filename) => {
                const path = join(target, filename);

                eventProcessor.handleWatchEvent(eventType, path);
            }
        );
    })
};

void main();
