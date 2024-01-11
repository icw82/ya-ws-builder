import { promises as fs } from 'node:fs';
import { lstat } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { instanceOfNodeError } from './filesystem/instanceOfNodeError.js';

import { makeSymLink } from './filesystem/makeSymLink.js';


const makeMirror = async (
    src: string,
    dest: string,
): Promise<void> => {
    try {
        /** Предполагаемый путь в сборке */
        const destFileStats = await lstat(resolve(dest));

        if (destFileStats.isFile()) {
            // Замена файла на ссылку

            await fs.unlink(dest);

            // console.log('Unlinked (замена файла на ссылку):', resolve(dest));

            try {
                await makeSymLink(dest, src);
            } catch (error) {
                console.log(' → isFile', destFileStats);
                throw error;
            }
        } else if (destFileStats.isDirectory()) {
            // Замена папки на ссылку
            await fs.rm(dest, { recursive: true, force: true });

            // console.log('Unlinked (замена папки на ссылку):', resolve(dest));

            try {
                await makeSymLink(dest, src);
            } catch (error) {
                console.log(' → isDirectory', destFileStats);
                throw error;
            }
        } else if (destFileStats.isSymbolicLink()) {
            // Оставляет только ту ссылку в билде,
            // что ссылается на исходный файл
            const symlinkTarget = await fs.readlink(dest);

            // NOTE: Как получить тип линки? В винде она может быть трёх видов;

            if (relative(symlinkTarget, src) !== '') {
                // Ссылка левая
                await fs.unlink(dest);

                // console.log('Unlinked (левая ссылка):', resolve(dest));
                console.log(symlinkTarget);

                try {
                    await makeSymLink(dest, src);
                } catch (error) {
                    console.log(' → isSymbolicLink', destFileStats);
                    throw error;
                }
            }
        } else {
            console.log('Какой ещё может быть вариант?');
            console.log(destFileStats);
        }
    } catch (error) {
        if (!(error instanceof Error)) {
            console.log('makeMirror 1 >>>');
            throw error;
        }

        if ('code' in error) {
            if (error.code === 'ENOENT') {
                try {
                    await makeSymLink(dest, src);

                    return;
                } catch (e) {
                    console.log(' → ENOENT', dest);
                    throw e;
                }
            }
        }

        console.log('makeMirror 2 >>>', error);
        throw error;
    }
};


export {
    makeMirror,
};
