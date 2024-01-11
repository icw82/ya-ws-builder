import { existsSync, unlinkSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ITargets, Target } from '../lib/arguments.js';
import { debounce } from '../lib/debounce.js';
import { writeFileRecursive } from '../lib/filesystem/writeFileRecursive.js';
import { FileIndex } from './FileIndex.js';
import type { IFileIndexItem, TFilePath } from './IFileIndex.js';


interface IFileIndexCacheParams {
    /** Путь до файла с индексацией */
    path: string;

    /** Список целевых директорий */
    targets: ITargets

    /** Демпфирующая задержка перед сохранением [мс] */
    writeDebounceTime?: number;
}

type IFileIndexCacheFormat = [
    TFilePath,
    0 | 1,
    number,
    string
]

// const splitIndexBy


class FileIndexCache {
    /** Путь до файла с индексацией */
    #path: string;

    /** Список целевых директорий */
    #targets: ITargets;

    /** Демпфирующая задержка перед сохранением */
    #writeDebounceTime: number = 2000;

    constructor(params: IFileIndexCacheParams) {
        this.#path = params.path;
        this.#targets = params.targets;

        if (params.writeDebounceTime && params.writeDebounceTime > 100) {
            this.#writeDebounceTime = params.writeDebounceTime;
        }
    }

    #forTargets<R>(callback: (target: Target) => R): Promise<R[]> {
        return Promise.all(
            [...this.#targets].map(
                async ([, target]: [string, Target]) => {
                    return callback(target);
                }
            )
        );
    }

    async read(): Promise<FileIndex> {
        console.log('* Read cache');

        const result: FileIndex = new FileIndex();

        if (existsSync(this.#path)) {
            await this.#forTargets(async (target: Target): Promise<void> => {
                const path = join(this.#path, target.hash);

                if (!existsSync(path)) {
                    return;
                }

                const content = (await readFile(path)).toString();
                const index = this.#convertFromFileContents(content, target);

                result.merge(index);
            });
        }

        return result;
    }

    async #write(index: FileIndex) {
        console.log('* Write cache');

        const indexes = index.splitByTargets();

        await this.#forTargets(async (target: Target): Promise<void> => {
            const content = this.#convertToFileContents(indexes.get(target));

            await writeFileRecursive(
                join(this.#path, target.hash),
                content
            );
        });
    }

    #convertToFileContents(index?: FileIndex): string {
        if (!index) {
            return '';
        }

        const data = [...index].map(
            ([, item]: [string, IFileIndexItem]) => {
                const { path, isFolder, modified, hash } = item;

                const values: IFileIndexCacheFormat = [
                    path,
                    isFolder ? 1 : 0,
                    modified,
                    hash? hash : '',
                ];

                return values.join('\t');
            }
        );

        return data.join('\n')
    }

    #convertFromFileContents(
        content: string,
        target: Target
    ): FileIndex {
        const index = new FileIndex();
        const rows = content.split('\n');

        rows.forEach((row: string) => {
            const [
                path,
                isFolder,
                modified,
                hash
            ] = row.split('\t');

            index.set(path, {
                hash,
                isFolder: isFolder === '1',
                modified: parseFloat(modified),
                path,
                target
            });
        });

        return index;
    }

    /** Сохранение индекса в файл */
    write = debounce(
        this.#write,
        this.#writeDebounceTime
    );

    async clear(): Promise<void> {
        console.log('* Clear cache');

        await this.#forTargets(async (target: Target): Promise<void> => {
            const path = join(this.#path, target.hash);

            if (existsSync(path)) {
                unlinkSync(path);
            };
        });
    }
}


export {
    FileIndexCache,
}

export type {
    IFileIndexCacheParams,
}
