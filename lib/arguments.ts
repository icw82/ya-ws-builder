import { readFileSync } from 'node:fs';


interface IArguments {
    dest: string;
    output: string;
    sdk: string;
    target?: string | string[];

    distro?: string;
}

interface IConfigParams extends IArguments{
    targets?: string[];
}

interface IConfig {
    default: IConfigParams;
}

interface IParams {
    /** Путь до сборки */
    dest: string;

    /** Путь до нужного SDK */
    sdkPath: string;

    /** Список целевых директорий */
    targets: Set<string>;

    /** Версия ES на выходе */
    output?: string;

    /** Расположение дистрибутива (папка или .zip) */
    distro?: string;
}


const checkParams = (args: IConfigParams): void => {
    if (typeof args.sdk === 'undefined') {
        throw new TypeError('Отсутствует аргумент sdk');
    }

    if (typeof args.sdk !== 'string') {
        throw new TypeError('Аргумент sdk — не строка');
    }

    if (typeof args.dest === 'undefined') {
        throw new TypeError('Отсутствует аргумент dest');
    }

    if (typeof args.dest !== 'string') {
        throw new TypeError('Аргумент dest — не строка');
    }

    if (
        typeof args.distro !== 'undefined' &&
        typeof args.distro !== 'string'
    ) {
        throw new TypeError(`distro — не строка, а ${ typeof args.distro }`);
    }

    if (
        typeof args.output !== 'undefined' &&
        typeof args.output !== 'string'
    ) {
        throw new TypeError(`output — не строка, а ${ typeof args.output }`);
    }

    if (args.target) {
        const targets = Array.isArray(args.target) ? args.target : [args.target];

        targets.forEach((item: unknown): void => {
            if (typeof item !== 'string') {
                throw new TypeError(`target — не строка, а ${ typeof item }`);
            }
        });
    }

    if (args.targets && Array.isArray(args.targets)) {
        args.targets.forEach((item: unknown): void => {
            if (typeof item !== 'string') {
                throw new TypeError(`target — не строка, а ${ typeof item }`);
            }
        });
    }

    if (
        typeof args.target === 'undefined' &&
        typeof args.targets === 'undefined'
    ) {
        throw new TypeError('Отсутствует указание целей (target)');
    }
};

/** Прочитать конфигурационный файл */
const readConfig = (): IConfigParams | undefined => {
    try {
        const configRawData = readFileSync('config.json', 'utf8');

        const config = JSON.parse(configRawData) as IConfig;

        checkParams(config.default);

        return config.default;
    } catch (e) {
        // console.error(e);
    }
};

/** Возвращает текущие настройки сборщика */
const getParams = (args: IArguments): IParams => {
    const config = readConfig();

    if (!config) {
        checkParams(args);
    }

    let targets: string[];

    if (args.target) {
        targets = Array.isArray(args.target) ? args.target : [args.target];
    } else {
        targets = config.targets;
    }

    const result: IParams = {
        dest: args.dest ?? config.dest,
        sdkPath: args.sdk ?? config.sdk,
        targets: new Set(targets),
        distro: args.distro ?? config.distro,
        output: args.output ?? config.output,
    };

    return result;
};


export {
    getParams,

    IArguments,
    IParams,
};
