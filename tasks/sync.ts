import { promises as fs, Dirent, Stats } from 'node:fs';
import { resolve, relative, join, extname, basename, dirname } from 'node:path';

import { watch } from 'gulp';
import globby = require('globby');

import { settings, ISettings } from './../lib/settings';
import { is } from './../lib/is';
import { makeMirror } from './../lib/makeMirror';
import { CONVERTING, ORIGIN } from './../lib/constants';


interface IFileObject {
    name: string;
    path: string;
    dirent: Dirent;
    stats: Stats;
}


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

        glob.add(`${ base }/**/*.(ts|tsx|js|less|css|xhtml|tmpl|wml)`);
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

        glob.add(`${ rel }/**/*.(ts|tsx|js|less|css|xhtml|tmpl|wml)`);
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

    await makeMirror(path, dest);

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

    if (lstat.isSymbolicLink()) {
        const linkString = await fs.readlink(file.path);

        if (!is.file(linkString)) {
            await fs.unlink(file.path);

            console.log('Unlinked (Протухшая ссылка):', resolve(file.path));
        }
    } else if (lstat.isFile()) {
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
        // Очистка сборки от битых ссылок

        const files = await globby(destGlob, {
            onlyFiles: false,
            stats: true,
        }) as unknown[];

        await Promise.all(files.map(checkDestFile));
    }

    {
        const files = await globby(glob, {
            onlyFiles: true,
        }) as unknown[];

        await Promise.all(files.map(syncSourceFile));
    }
};

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
