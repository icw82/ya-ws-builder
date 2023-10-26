// import { clearBuild } from './clearBuild.js';
// import { transferImmutable } from './transferImmutable.js';
// import { buildTypescript } from './typescript.js';

import { watch, promises as fs } from 'node:fs';
import { join } from 'node:path';

import { minimatch } from 'minimatch';
import sanitize from 'sanitize-filename';

import { settings } from './lib/settings.js';
// import { getFilePaths } from './lib/getFilePaths';

import {
    FileIndex,
    FileIndexEventType,
    IFileIndexEvent
} from './classes/FileIndex.js';
import { EventProcessor } from './classes/EventProcessor.js';
import { transpile } from './lib/transpile.js';


const handleFileIndexEvent = async (
    event: IFileIndexEvent
): Promise<void> => {
    if (event.isFolder) {
        console.log('Изменение папки?');

        return;
    }

    if (event.type === FileIndexEventType.removed) {
        console.log('Удаление файла?');

        return;
    }

    if (
        event.type === FileIndexEventType.changed ||
        event.type === FileIndexEventType.added
    ) {
        // Передача в обработку компиляторам

        // TS
        // https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API
        if (minimatch(event.path, '**/*.ts')) {
            console.log('Изменение TS', event.path);

            const source = await fs.readFile(event.path);
            const content = transpile(source.toString());

            console.log(content);

            // settings.targets

            // await fs.writeFile()
        }

        // LESS

        // Локализация

        // Статика

        return;
    }

    console.error('Обработка события неизвестного типа:', event);
}

const main = async (): Promise<void> => {
    console.log('— Индексация —');

    const pattern = [...settings.targets].map((target: string): string => {
        return `${ target }/**/*`.replace(/\\/g, '/');
    });

    const index = new FileIndex({
        path: join(
            settings.baseDir,
            'index',
            sanitize(settings.dest, { replacement: '_' })
        ),
        pattern
    });

    const changes = await index.update();

    for (const change of changes) {
        await handleFileIndexEvent(change);
    }

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

        onChanges: handleFileIndexEvent
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
