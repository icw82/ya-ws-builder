import { join, relative, resolve, extname, basename } from 'node:path';

// import { resolve, relative, join, dirname } from 'node:path';

import { ISettings } from '../lib/settings';
import { CONVERTING } from './constants';


interface IFilePaths {
    /** Абсолютный путь до исходного файла */
    absolute: string;

    /** Путь внутри модуля включая сам модуль */
    commonPath: string;

    /** Путь до файла в сборке */
    dest: string;

    /** Путь до репозитория, где находится исходный файл */
    targetRepository: string;
}

const getDest = (commonPath: string, settings: ISettings): string => {
    const dest = join(settings.destModulesPath, commonPath).replace(/\\/g, '/');

    const extension = extname(commonPath).slice(1);
    const isConvertible = CONVERTING.has(extension);

    if (isConvertible) {
        return dest.replace(/\.[^/.]+$/, '.' + CONVERTING.get(extension));
    }

    return dest;
};

const getFilePaths = (
    path: string,
    settings: ISettings
): IFilePaths => {
    const targetRepository = [
        ...settings.targets,
    ].find((target: string): boolean =>
        !relative(target, path).includes('..')
    );

    const commonPath =
        relative(targetRepository, path).replace(/\\/g, '/');

    return {
        absolute: resolve(path).replace(/\\/g, '/'),
        commonPath,
        dest: getDest(commonPath, settings),
        targetRepository,
    };
};


export {
    IFilePaths,
    getFilePaths,
};
