import { promises as fs, Dirent, Stats } from 'node:fs';
import { resolve, relative, join, extname, basename, dirname } from 'node:path';

import { watch } from 'gulp';
import globby = require('globby');

import { settings, ISettings } from './../lib/settings';
import { is } from './../lib/is';
import { makeMirror } from './../lib/makeMirror';
import { CONVERTING, ORIGIN } from './../lib/constants';
import { unlinkEmptySymlink } from './../lib/unlinkEmptySymlink';
import { getDirectoriesOnly } from './../lib/getDirectoriesOnly';


interface IFileObject {
    name: string;
    path: string;
    dirent: Dirent;
    stats: Stats;
}

const exts = [
    'js',
    'ts',
    'tsx',

    'css',
    'less',

    'tmpl',
    'wml',
    'xhtml',

    'svg',
];

/** Возвращает glob и набор относительных путей к заданным целям */
const getGlobOfSources = (
    targets: string[],
    baseDir: string,
): {
    glob: string[];
    relTargets: Set<string>;
} => {
    const glob: Set<string> = new Set();
    const relTargets: Set<string> = new Set();

    targets.forEach((target: string): void => {
        const rel = relative(baseDir, target);

        relTargets.add(rel);

        const base = rel.replace(/\\/g, '/');

        glob.add(`${ base }/**/*.(${ exts.join('|') })`);
        glob.add(`!${ base }/**/node_modules/**/*`);
    });

    return {
        glob: [...glob],
        relTargets,
    };
};

/**
 * Возвращает Glob файлов модулей в сборке
 */
const getGlobOfModulesInDest = (
    settings: ISettings,
): string[] => {

    const glob: Set<string> = new Set();
    const relPathToResources = relative(
        settings.baseDir,
        settings.destModulesPath,
    );

    settings.modules.forEach((
        target: string,
        module: string,
    ): void => {
        const rel = join(relPathToResources, module).replace(/\\/g, '/');

        glob.add(`${ rel }/**/*.(${ exts.join('|') })`);
        glob.add(`!${ rel }/**/node_modules/**/*`);
        glob.add(`!${ rel }/**/*.min.*`);
    });

    return [...glob];
};

const { glob, relTargets } = getGlobOfSources(
    [...settings.targets],
    settings.baseDir
);

const destGlob = getGlobOfModulesInDest(settings);

// const sdkGlob = [
//     `${ relative(base_dir, settings.sdk_modules) }/*`,
// ];

// src(sdkGlob)
//     .pipe(debug({title: 'Модуль SDK'}))
//     .pipe(symlink(settings.resources));

// const sync = () => src(globToSync)
//     // .pipe(debug())
//     .pipe(symlink(settings.destModulesPath));

/**
 * Возвращает часть пути к файлу в модуле
 * @param path путь к исходному файлу
 */
const getPathInModule = ((path: string): string => {
    let result: string;

    relTargets.forEach((target: string): void => {
        const relPath = relative(target, path);

        if (!relPath.startsWith('..')) {
            if (result) {
                throw new Error();
            }

            result = relPath;
        }
    });

    return result;
});

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

    {
        console.log('Очистка сборки от битых ссылок на директории');

        const directories = getDirectoriesOnly(settings.destModulesPath, true);

        await Promise.all(directories.map(
            async (dir: string): Promise<void> => {
                const path = join(settings.destModulesPath, dir);

                const lstat = await fs.lstat(path);

                await unlinkEmptySymlink(path, lstat);
            }
        ));
    }

    {
        console.log('Очистка сборки от битых ссылок на файлы');

        const files = await globby(destGlob, {
            onlyFiles: false,
            stats: true,
        }) as unknown[] as IFileObject[];

        await Promise.all(files.map(checkDestFile));
    }

    {
        console.log('Синхронизация файлов');

        const files = await globby(glob, {
            onlyFiles: true,
        }) as unknown[];

        await Promise.all(files.map(syncSourceFile));
    }
};

// TODO: Очистка пустых папок в режиме наблюдения
const syncWatch = (): void => {
    const watcher = watch(glob);

    // watcher.on('change', (path: string): void  {
    //     console.log(`File ${ resolve(path) } has been changed`);
    //     // void syncSourceFile(path);
    // });

    watcher.on('add', (path: string): void => {
        console.log(`File ${ resolve(path) } has been added`);
        void syncSourceFile(path);
    });

    // FIXME: Почему не удаляются TS?
    watcher.on('unlink', (path: string): void => {
        console.log(`File ${ resolve(path) } has been removed`);
        void syncSourceFile(path);
    });
};


export {
    sync,
    syncWatch,
};
