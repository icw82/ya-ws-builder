interface IArguments {
    dest: string;
    output: string;
    sdk: string;
    target: string;

    distro?: string;
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


/** Возвращает текущие настройки сборщика */
const getParams = ({
    dest,
    sdk,
    target,

    distro,
    output,
}: IArguments): IParams => {

    if (typeof sdk === 'undefined') {
        throw new TypeError('Отсутствует аргумент sdk');
    }

    if (typeof sdk !== 'string') {
        throw new TypeError('Аргумент sdk — не строка');
    }

    if (typeof dest === 'undefined') {
        throw new TypeError('Отсутствует аргумент dest');
    }

    if (typeof dest !== 'string') {
        throw new TypeError('Аргумент dest — не строка');
    }

    if (
        typeof distro !== 'undefined' &&
        typeof distro !== 'string'
    ) {
        throw new TypeError(`distro — не строка, а ${ typeof distro }`);
    }

    if (
        typeof output !== 'undefined' &&
        typeof output !== 'string'
    ) {
        throw new TypeError(`output — не строка, а ${ typeof output }`);
    }

    const targets = Array.isArray(target) ? target : [target];

    targets.forEach((item: unknown): void => {
        if (typeof item !== 'string') {
            throw new TypeError(`target — не строка, а ${ typeof item }`);
        }
    });

    const result: IParams = {
        dest,
        sdkPath: sdk,
        targets: new Set(targets),
    };

    if (distro) {
        result.distro = distro;
    }

    if (output) {
        result.output = output;
    }

    return result;
};


export {
    getParams,

    IArguments,
    IParams,
};
