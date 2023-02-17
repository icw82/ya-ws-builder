import { promises as fs, Stats } from 'node:fs';
import { resolve } from 'node:path';

import { is } from './../lib/is';


const unlinkEmptySymlink = async (
    path: string,
    lstat: Stats
): Promise<boolean> => {
    if (lstat.isSymbolicLink()) {
        const linkString = await fs.readlink(path);

        if (
            !is.file(linkString) &&
            !is.directory(linkString)
        ) {
            await fs.unlink(path);

            console.log('Unlinked (Протухшая ссылка):', resolve(path));
        }

        return true;
    }

    return false;
};


export {
    unlinkEmptySymlink,
};
