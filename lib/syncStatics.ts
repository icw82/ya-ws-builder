import { promises as fs, Dirent, Stats } from 'node:fs';
import { resolve, join, extname, basename, dirname } from 'node:path';

import { CONVERTING, ORIGIN } from './constants.js';
import { getDirectoriesOnly } from './filesystem/getDirectoriesOnly.js';
import { is } from './filesystem/is.js';
import { makeMirror } from './makeMirror.js';
import settings, { ISettings } from './settings.js';
import { unlinkEmptySymlink } from './filesystem/unlinkEmptySymlink.js';
import { getPathInModule } from './getPathInModule.js';


interface IFileObject {
    name: string;
    path: string;
    dirent: Dirent;
    stats: Stats;
}

/**
 * Синхронизирует исходный файл
 * @param path путь к исходному файлу
 */
const syncSourceFile = async (
    path: string,
): Promise<void> => {
    const pathInModule = getPathInModule(path);

    /**
     * Если файл не относится к целевым модулям, он игнорируется
     */
    if (!pathInModule) {
        return;
    }

    const extension = extname(path).slice(1);
    const name = basename(path, extname(path));

    /**
     * Файл может быть результатом компиляции,
     * проверка наличия исходного файла
     */
    if (ORIGIN.has(extension)) {
        /**
         * Путь к предполагаемому одноимённому исходному файлу
         */
        const origin = join(
            dirname(path),
            `${name}.${ORIGIN.get(extension)}`,
        );

        /**
         * Если есть одноимённый исходный файл
         */
        if (is.file(origin)) {
            console.error(path);
            console.error(origin);

            // TODO: удалять по флагу

            throw new Error();
        }
    }

    // Файл является исходным, нужно создать ссылку в сборке

    /** Путь до файла в сборке */
    const dest = resolve(
        join(settings.destModulesPath, pathInModule),
    );

    try {
        await makeMirror(path, dest);
    } catch (error) {
        console.error('Ошибка при выполнении makeMirror');
        console.log('path:', path);
        console.log('dest:', dest);

        throw error;
    }

    // На данном этапе создана ссылка на оригинальный файл
    // NOTE: ссылки нужны для работы ts в vs code, так как импорты часто указаны
    //       относительно директории со всеми модулями

    if (CONVERTING.has(extension)) {
        // Проверка наличия одноименного конвертированного файла в билде
        const destCompiled =
            dest.replace(/\.[^/.]+$/, '.' + CONVERTING.get(extension));

        try {
            await fs.unlink(destCompiled);

            // console.log(
            //     'Unlinked (удаление сконвертированного):',
            //     resolve(destCompiled)
            // );
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.log(error);
            }
        }
    }
};

const checkDestFile = async (
    file: IFileObject
): Promise<void> => {
    const lstat = await fs.lstat(file.path);

    if (await unlinkEmptySymlink(file.path, lstat)) {
        return;
    }

    if (lstat.isFile()) {
        const ext = extname(file.name);

        if (['.ts', '.tsx', '.less'].includes(ext)) {
            await fs.unlink(file.path);

            console.log('Unlinked: (замена на ссылку)', resolve(file.path));
        }
    }
};

const sync = async (): Promise<void> => {
    // console.log('settings', settings);

    // {
    //     console.log('Очистка сборки от битых ссылок на директории');

    //     const directories = getDirectoriesOnly(settings.destModulesPath, true);

    //     await Promise.all(directories.map(
    //         async (dir: string): Promise<void> => {
    //             const path = join(settings.destModulesPath, dir);

    //             const lstat = await fs.lstat(path);

    //             await unlinkEmptySymlink(path, lstat);
    //         }
    //     ));
    // }

    // {
    //     console.log('Очистка сборки от битых ссылок на файлы');

    //     const files = await globby(destGlob, {
    //         onlyFiles: false,
    //         stats: true,
    //     }) as unknown[] as IFileObject[];

    //     await Promise.all(files.map(checkDestFile));
    // }

    // {
    //     console.log('Синхронизация файлов');

    //     const files = await globby(glob, {
    //         onlyFiles: true,
    //     }) as unknown[];

    //     await Promise.all(files.map(syncSourceFile));
    // }
};


export {
    syncSourceFile,
}
