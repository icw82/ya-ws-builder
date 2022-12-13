import { promises as fs, accessSync, lstatSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { makeSymLink } from './makeSymLink';


const makeMirror = async (
    src: string,
    dest: string,
): Promise<void> => {
    try {
        /** Предполагаемый путь в сборке */
        const destFileStats = await fs.lstat(resolve(dest));

        if (destFileStats.isFile()) {
            // Замена файла на ссылку

            await fs.unlink(dest);

            // console.log('Unlinked (замена файла на ссылку):', resolve(dest));

            await makeSymLink(dest, src);
        } else if (destFileStats.isDirectory()) {
            // Замена папки на ссылку
            await fs.rm(dest, { recursive: true, force: true });

            // console.log('Unlinked (замена папки на ссылку):', resolve(dest));

            await makeSymLink(dest, src);
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

                await makeSymLink(dest, src);
            }
        } else {
            console.log('Какой ещё может быть вариант?');
            console.log(destFileStats);
        }
    } catch (error) {
        // По пути dest ничего нет
        if (error.code === 'ENOENT') {
            await makeSymLink(dest, src);

            // console.error(error);
            // console.log('dest →', dest);
            // console.log('accessSync', accessSync(dest));

        } else {
            console.error(error);
        }
    }
};


export {
    makeMirror,
};
