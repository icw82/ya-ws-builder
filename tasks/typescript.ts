import { relative, join } from 'node:path';

import * as File from 'vinyl';

import { parallel, src, dest, watch as gulpWatch } from 'gulp';
import { createProject } from 'gulp-typescript';

import { settings } from '../lib/settings';

// TODO: Индикатор прогресса

const tsProject = createProject({
    alwaysStrict: true,
    baseUrl: settings.destModulesPath,
    importHelpers: true,
    isolatedModules: true,
    lib: [
        'es2015',
        'es2016',
        'es2017',
        'dom',
    ],
    jsx: 'react-jsxdev',
    module: 'amd',
    moduleResolution: 'Classic', // 'node'
    // noUnusedLocals: true,
    paths: {
        'Core/*': ['WS.Core/core/*'],
        'Lib/*': ['WS.Core/lib/*'],
        'Transport/*': ['WS.Core/transport/*'],
    },
    // Пока морда стенда крутится на старых нодах типа 12 версии,
    // красота типа ?. ?? не будет работать
    target: settings.output || 'es2020',

    // declaration: true,
    // noImplicitReturns: true,
    // noUnusedParameters: false,
    // forceConsistentCasingInFileNames: true,
});

// FIXME: Название
const convert = (
    result: string[],
    item: string
): string[] => {
    const rel = relative(settings.baseDir, item).replace(/\\/g, '/');

    result.push(`${ rel }/**/*.ts`);
    result.push(`${ rel }/**/*.tsx`);
    result.push(`!${ rel }/**/node_modules/**/*`);

    return result;
};

const globToSync = [...settings.targets].reduce(convert, []);

const globToCompile = [...settings.modules.keys()].map(
    (module: string): string => `${ settings.destModulesPath }/${ module }`
).reduce(convert, []);

globToCompile.unshift(
    relative(
        settings.baseDir,
        `${ settings.sdkModulesPath }/WS.Core/ws.d.ts`,
    ).replace(/\\/g, '/'),
);

const compileTypescript = (): any => src(globToCompile)
    .pipe(tsProject())
    .pipe(dest((file: File): string => {
        return join(
            settings.destModulesPath,
            relative(settings.destModulesPath, file.base),
        );
    }));

const watchTypescript = (): void => {
    const watcher = gulpWatch(globToSync);

    watcher.on('change', parallel(compileTypescript));
    watcher.on('add', parallel(compileTypescript));
};


export {
    compileTypescript,
    watchTypescript,
};
