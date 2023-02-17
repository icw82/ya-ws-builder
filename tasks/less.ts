import { join, relative } from 'node:path';

import {
    dest,
    parallel,
    src,
    TaskFunction,
    watch as gulpWatch,
} from 'gulp';

import insert = require('gulp-insert');
import gulpLess = require('gulp-less');
// import debug = require('gulp-debug');

import { settings } from '../lib/settings';
import { getFilePaths } from '../lib/getFilePaths';
import { compileLess } from '../lib/compileLess';


const getCompileLessTask = (
    glob: string[],
    destination: string
): any => src(glob)
    // .pipe(insert.prepend('@import \'SBIS3.CONTROLS/themes/online/_variables\';'))
    .pipe(insert.prepend('@import \'Controls-default-theme/_mixins\';'))
    .pipe(insert.prepend('@themeName: \'SHIT\';'))
    .pipe(gulpLess({
        paths: [
            settings.destModulesPath,
            settings.sdkModulesPath,
        ],
    }))
    // .pipe(debug({ title: destination + '→' }))
    .pipe(dest(destination));

const glob = [...settings.targets]
    .reduce((result: string[], item: string): string[] => {
        const rel = relative(settings.baseDir, item).replace(/\\/g, '/');

        result.push(`${ rel }/**/*.less`);
        result.push(`!${ rel }/**/node_modules/*`);

        return result;
    }, [] as string[]);

const subTasks: (() => any)[] = [];

settings.modules.forEach(
    (value: string, key: string): void => {
        const rel = relative(
            settings.baseDir,
            join(value, key)
        ).replace(/\\/g, '/') + '/**/*.less';

        const dest = join(settings.destModulesPath, key);
        const glob = [rel];

        // console.log('GLOB', glob);

        const subTask = (): any => getCompileLessTask(glob, dest);
        // const subTask = (): any => (): void => null;

        subTask.displayName = `LESS → ${ key }`;

        subTasks.push(subTask);
    }
);

const compileLessTask: TaskFunction = parallel(...subTasks);

const watchLess: TaskFunction = (): void => {
    const watcher = gulpWatch(glob);

    watcher.on('change', (path: string): void => {
        const { absolute: source, dest } = getFilePaths(path, settings);

        console.log(`File ${ source } has been changed`);
        // console.log(dest);

        void compileLess({ source, dest }).then((): void => {
            console.log(`LESS:compiled → ${ dest }`);
        });
    });
};


export {
    compileLessTask as compileLess,
    watchLess,
};
