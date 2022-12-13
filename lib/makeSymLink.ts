import { promises as fs } from 'node:fs';
import { resolve, dirname } from 'node:path';

import { is } from './is';


const makeSymLink = async (
    path: string,
    value: string,
): Promise<void> => {
    const target = resolve(value);

    const dir = dirname(path);

    // Прокладывание дороги
    if (!is.directory(dir)) {
        await fs.mkdir(dir, { recursive: true });
    }

    if (is.directory(target)) {
        await fs.symlink(target, path, 'dir');

        return;
    }

    await fs.symlink(target, path, 'file');
};


export {
    makeSymLink,
};
