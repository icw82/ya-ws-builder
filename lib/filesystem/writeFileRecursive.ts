import { dirname } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';

import { is } from './is.js';


const writeFileRecursive = async(
    ...params: Parameters<typeof writeFile>
) => {
    const [ dest ] = params;

    if (typeof dest !== 'string') {
        throw new TypeError(
            'Нет реализации для файла, назначенного не строкой'
        );
    }

    const dir = dirname(dest);

    if (!is.directory(dir)) {
        try {
            await mkdir(dir, { recursive: true });
        } catch (error) {
            console.error('Ошибка при попытке создания директории', dir);

            throw error;
        }
    }

    await writeFile(...params);
};


export {
    writeFileRecursive
}
