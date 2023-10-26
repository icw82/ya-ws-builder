import { resolve, join, relative } from 'node:path';
import { readdirSync, mkdirSync } from 'node:fs';
import { argv } from 'node:process';

import { default as ts } from 'typescript';
import yargsFunc from 'yargs'
import { hideBin } from 'yargs/helpers'

// import { env } from 'process';
// import * as chalk from 'chalk';
// import { stdin as input, stdout as output } from 'node:process';
// import { createInterface } from 'node:readline';

import { getParams, IArguments, IParams } from './arguments.js';
import { is } from './is.js';


interface ISettings extends IParams {
    /** Список модулей, находящихся в целевых директориях */
    modules: Map<string, string>;

    /** Путь до развёрнутого стенда */
    dest: string;

    /** Путь до UI-ресурсов развёрнутого стенда */
    destModulesPath: string;

    /** Путь до SDK */
    sdkPath: string;

    /** Путь до UI-модулей SDK */
    sdkModulesPath: string;

    /** Базовая директория сборщика */
    baseDir: string;
}

// // const chalk = new Chalk();
// // const rl = createInterface({ input, output });

const IGNORE = [
    '.vscode',
];

/**
 * Возвращает список модулей, находящихся в целевых директориях
 * @param targets список целевых директорий
 */
const getModules = (
    targets: Set<string>,
): Map<string, string> => {
    const modules = new Map() as Map<string, string>;

    targets.forEach((target: string): void => {
        const list = readdirSync(target);

        list.forEach((name: string): void => {
            if (
                !IGNORE.includes(name) &&
                !is.file(join(target, name)) // не is.directory, может быть ещё не создана
            ) {
                modules.set(name, target);
            }
        });
    });

    return modules;
};

/** Возвращает настройки для сборщика */
const getSettings = (argv: IArguments): ISettings => {
    const baseDir = resolve();
    const params = getParams(argv);

    console.log('Конфигурация', params);

    const modules = getModules(params.targets);

    const dest = resolve(relative(baseDir, params.dest));

    if (!is.directory(dest)) {
        // const q = `По адресу ${ dest }\nНе не обнаружена папка развёрнутого стенда\nСоздать её?`;

        // rl.question(q, (answer) => {
        //         console.log(`Ответ ёпты: ${answer}`);

        //         rl.close();

        //         mkdirSync(dest, { recursive: true });
        //         console.warn('Не найдена папка развёрнутого стенда. Создана новая');

        //     }
        // );

        mkdirSync(dest, { recursive: true });

        console.warn('Не найдена папка развёрнутого стенда. Создана новая');
        console.warn('➤', dest);
    }

    const destModulesPath = join(dest, 'build-ui/resources');

    if (!is.directory(destModulesPath)) {
        mkdirSync(destModulesPath, { recursive: true });

        console.warn('Не найдена папка UI-ресурсов. Создана новая');
        console.warn('➤', destModulesPath);
    }

    const sdkPath = params.sdkPath;

    if (!is.directory(sdkPath)) {
        console.error(`Не найдена папка SDK: ${ sdkPath }`);
        throw new Error();
    }

    const sdkModulesPath = join(sdkPath, 'ui-modules');

    if (!is.directory(sdkModulesPath)) {
        throw new Error('Не найдена папка c модулями SDK');
    }

    const distro = params.distro;

    if (!is.directory(distro)) {
        console.error(
            `Не найдена папка c распакованным дистрибутивом: ${ distro }`
        );
        throw new Error();
    }

    return {
        ...params,
        baseDir,
        dest,
        destModulesPath,
        distro,
        modules,
        sdkModulesPath,
        sdkPath,
    };
};

const yargs = yargsFunc(hideBin(argv));

yargs
    .scriptName('npm run build')
    .usage('Использование: $0 -- [ --опция <value> ]')
    .wrap(yargs.terminalWidth())
    .help();

// yargs.example([
//     [
//         `$0 -- \`
//         --target 'C:\work\online\root\client' \`
//         --target 'C:\work\online\eo\client' \`
//         --sdk 'C:\Users\%USERNAME%\SBISPlatformSDK\SBISPlatformSDK_241000' \`
//         --dest 'C:\work\online\build' \`
//         --distro 'C:\work\online\version\24.1100\ext' \`
//         --output 'es5'
//     `],
// ]);

yargs
    .option('target', {
        alias: 't',
        demandOption: true,
        // default: '/default-way',
        describe: 'Один или несколько рабочих каталогов «client», ' +
            'содержащие модули фронтенда',
        type: 'array'
    })
    .option('dest', {
        demandOption: true,
        // default: '/default-way',
        describe: 'Путь сборки (куда обычно разворачивается стенд)',
        type: 'string'
    })
    .option('distro', {
        // demandOption: true,
        // default: '/default-way',
        describe: 'Расположение распакованного дистрибутива',
        type: 'string'
    })
    .option('sdk', {
        // demandOption: true,
        // default: '/default-way',
        describe: 'Расположение SDK',
        type: 'string'
    })
    .option('output', {
        // demandOption: true,
        default: 'es2020',
        describe: 'Версия ECMAScript на выходе',
        // type: string,

        // ts.ScriptTarget
        choices: [
            'es3',
            'es5',
            'es2015',
            'es2016',
            'es2017',
            'es2018',
            'es2019',
            'es2020',
            'es2021',
        ]
    })

const settings = getSettings(yargs.argv as unknown as IArguments);


export {
    settings as default,
    settings,

    ISettings,
};
