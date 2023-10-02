import { series, parallel } from 'gulp';

import { syncSDK } from './syncSDK';
import { syncDistro } from './syncDistro';

import {
    sync,
    syncWatch,
} from './sync';

import {
    compileTypescript,
    watchTypescript,
} from './typescript';

import {
    compileLess,
    watchLess,
} from './less';

import {
    compileLang,
    watchLang,
} from './langs';


const compile = parallel(
    compileTypescript,
    compileLess,
    // compileLang,
);

const watch = parallel(
    syncWatch,
    watchTypescript,
    watchLess,
    watchLang,
);

const defaultTask = series(
    syncDistro,
    syncSDK,
    sync,
    compile,
    watch,
);


export {
    defaultTask as default,

    sync,

    compile,
    watch,
};
