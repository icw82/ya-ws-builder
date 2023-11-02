import { join, relative } from 'node:path';
import { Target } from './arguments.js';

import settings, { ISettings } from './settings.js';


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
// const getGlobOfModulesInDest = (
//     settings: ISettings,
// ): string[] => {

//     const glob: Set<string> = new Set();
//     const relPathToResources = relative(
//         settings.baseDir,
//         settings.destModulesPath,
//     );

//     settings.modules.forEach((
//         target: string,
//         module: string,
//     ): void => {
//         const rel = join(relPathToResources, module).replace(/\\/g, '/');

//         glob.add(`${ rel }/**/*.(${ exts.join('|') })`);
//         glob.add(`!${ rel }/**/node_modules/**/*`);
//         glob.add(`!${ rel }/**/*.min.*`);
//     });

//     return [...glob];
// };


// const { glob, relTargets } = getGlobOfSources(
//     [...settings.targets],
//     settings.baseDir
// );

// const destGlob = getGlobOfModulesInDest(settings);

/**
 * Возвращает часть пути к файлу в модуле
 * @param path путь к исходному файлу
 */
 const getPathInModule = (path: string): string => {
    let result: string;

    [...settings.targets].forEach(
        ([ , target]: [string, Target]): void => {
            const targetRel = relative(settings.baseDir, target.toString());
            const relPath = relative(targetRel, path);

            if (!relPath.startsWith('..')) {
                if (result) {
                    throw new Error(
                        'Одинаковый файл в двух целевых папках?'
                    );
                }

                result = relPath;
            }
        }
    );

    return result;
};


export {
    getPathInModule,
}
