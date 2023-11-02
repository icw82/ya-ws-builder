import { readlink, unlink } from 'node:fs/promises';
import type { Stats } from 'node:fs';
import { resolve } from 'node:path';

import { is } from './is.js';


const unlinkEmptySymlink = async (
    path: string,
    lstat: Stats
): Promise<boolean> => {
    if (lstat.isSymbolicLink()) {
        const linkString = await readlink(path);

        if (
            !is.file(linkString) &&
            !is.directory(linkString)
        ) {
            await unlink(path);

            console.log('Unlinked (Протухшая ссылка):', resolve(path));
        }

        return true;
    }

    return false;
};


export {
    unlinkEmptySymlink,
};
