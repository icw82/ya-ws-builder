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


const compile = parallel(
    compileTypescript,
    compileLess,
);

const watch = parallel(
    syncWatch,
    watchTypescript,
    watchLess,
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
