import { readdirSync, Dirent } from 'node:fs';


/** Получить директории первого уровня по адресу */
const getDirectoriesOnly = (
    path: string,
    symlink: boolean = false
): string[] => {
    return readdirSync(path, { withFileTypes: true })
        .filter((dirent: Dirent): boolean => {
            if (symlink === true) {
                return dirent.isSymbolicLink();
            }

            return dirent.isDirectory();
        })
        .map((dirent: Dirent): string => dirent.name);
};


export {
    getDirectoriesOnly,
};
