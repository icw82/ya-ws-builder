import { join, relative, resolve, extname } from 'node:path';
import { Target } from './arguments.js';

import { CONVERTING } from './constants.js';
import { ISettings } from './settings.js';


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

const getDest = (commonPath: string, destModulesPath: string): string => {

    const dest = join(destModulesPath, commonPath).replace(/\\/g, '/');

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
    ].find(([ , target]: [string, Target]): boolean =>
        !relative(target.toString(), path).includes('..')
    );

    if (!targetRepository) {
        throw new Error('Не удалось определить целевую директорию');
    }

    const commonPath =
        relative(targetRepository[0], path).replace(/\\/g, '/');

    return {
        absolute: resolve(path).replace(/\\/g, '/'),
        commonPath,
        dest: getDest(commonPath, settings.destModulesPath),
        targetRepository: targetRepository[0],
    };
};


export {
    IFilePaths,
    getFilePaths,
    getDest,
};
