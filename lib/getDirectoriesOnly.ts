import { readdirSync, Dirent } from 'node:fs';


/** Получить директории первого уровня по адресу */
const getDirectoriesOnly = (path: string): string[] => {
    return readdirSync(path, { withFileTypes: true })
        .filter((dirent: Dirent): boolean => dirent.isDirectory())
        .map((dirent: Dirent): string => dirent.name);
};


export {
    getDirectoriesOnly,
};
