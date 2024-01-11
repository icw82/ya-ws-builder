import { access, mkdir, readFile, rm } from 'node:fs/promises';
import {  dirname, extname, join } from 'node:path';

import { minimatch } from 'minimatch';
import { default as ts } from 'typescript';

import { getDest } from './getFilePaths.js';
import { renderLess } from './renderLess.js';
import { syncSourceFile } from './syncStatics.js';
import { ITranspileOptions, transpile } from './transpile.js';
import { writeFileRecursive } from './filesystem/writeFileRecursive.js';
import settings from './settings.js';

import {
    FileIndexEventType,
    IFileIndexChange
} from '../classes/IFileIndex.js';

const { JsxEmit } = ts;

/**
 * Обработчик событий индекса
 *
 * @param change Событие индекса
 * @returns Успешно ли обработано событие
 */
const handleSourceChanges = async (
    change: IFileIndexChange
): Promise<boolean> => {

    const {
        isFolder,
        path,
        type,
        target
    } = change;

    const absolutePath = join(target.toString(), path);
    const dest = join(
        settings.destModulesPath,
        path
    ); //.replace(/\\/g, '/');

    if (isFolder) {
        if (type === FileIndexEventType.removed) {
            console.log('Удаление папки', absolutePath);
            // console.log('>', change);

            try {
                await access(dest);
                // Доступно,
                await rm(dest, { recursive: true });

            } catch (error) {
                console.log('Нельзя удалить?');
            }

            return true;
        }

        if (type === FileIndexEventType.added) {
            console.log('Добавление папки', absolutePath);
            // console.log('>', change);

            try {
                await access(dest);
                // Уже существует, ничего не делать
                return true;
            } catch (error) {
                await mkdir(dest, { recursive: true });

                return true;
            }
        }

        if (type === FileIndexEventType.changed) {
            // console.log('Изменение папки', absolutePath);
            // Ничего не делать
            return true;
        }
    }

    if (type === FileIndexEventType.removed) {
        console.log('Удаление файла', absolutePath);
        console.log('>', change);

        try {
            await access(dest);
            // Доступно,
            await rm(dest, { recursive: true });

        } catch (error) {
            console.log('Нельзя удалить?');
        }

        return true;
    }

    if (
        type === FileIndexEventType.changed ||
        type === FileIndexEventType.added
    ) {
        // Передача в обработку компиляторам

        // TS
        // https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API
        if (minimatch(absolutePath, '**/*.+(ts|tsx)')) {
            const source = (await readFile(absolutePath)).toString();
            const ext = extname(path);

            const options: ITranspileOptions = {};

            if (ext === '.tsx') {
                options.jsx = JsxEmit.ReactJSXDev;
            }

            const content = transpile(source, options);

            console.log('Изменение TS →', path);

            const dest = getDest(path, settings.destModulesPath);

            await writeFileRecursive(dest, content);

            return true;
        }

        // LESS
        if (minimatch(absolutePath, '**/*.less')) {
            const source = (await readFile(absolutePath)).toString();

            const content = await renderLess(
                '@import \'SBIS3.CONTROLS/themes/online/_variables\';' +
                '@import \'Controls-default-theme/_mixins\';\n' +
                '@themeName: \'SHIT\';\n' +
                source,
                {
                    paths: [
                        dirname(absolutePath),
                        target.toString(),
                        settings.destModulesPath,
                        settings.sdkModulesPath,
                    ],
                }
            );

            console.log('Изменение LESS →', path);

            const dest = getDest(path, settings.destModulesPath);

            if (content.result) {
                await writeFileRecursive(dest, content.result);

                return true;
            } else {
                console.error('LESS: Нет результата');

                return false;
            }
        }

        // Локализация
        if (minimatch(absolutePath, '**/lang/**/*.json')) {
            const source = (await readFile(absolutePath)).toString();

            console.log('Локализация', path);

            const content =
                `define('${
                    path.replace(/\\/g, '/')
                }',[],function(){return ${
                    source
                };});\n`;

            const dest = getDest(path, settings.destModulesPath) + '.js';

            await writeFileRecursive(dest, content);
        }

        // Статика

        await syncSourceFile(absolutePath);

        return true;
    }

    console.error('Обработка события неизвестного типа:', change);

    return false;
}


export {
    handleSourceChanges
}
