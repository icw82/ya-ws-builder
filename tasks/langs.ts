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


const glob = [...settings.targets]
    .reduce((result: string[], item: string): string[] => {
        const rel = relative(settings.baseDir, item).replace(/\\/g, '/');

        result.push(`${ rel }/*/langs/**/*.json`);
        result.push(`!${ rel }/**/node_modules/*`);

        return result;
    }, [] as string[]);

const subTasks: (() => any)[] = [];

const compileLessTask: TaskFunction = parallel(...subTasks);

const watchLang: TaskFunction = (): void => {
    const watcher = gulpWatch(glob);

    console.log('*****************');

    watcher.on('change', (path: string): void => {
        const { absolute: source, dest } = getFilePaths(path, settings);

        console.log(`File ${ source } has been changed`);
        console.log(dest);
    });
};


export {
    // compileLessTask as compileLang,
    watchLang,
};
