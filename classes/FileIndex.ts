import { existsSync, readFileSync, writeFileSync } from 'node:fs';

import { glob } from 'glob';
// import type { Path } from 'glob';

import { calculateFileHash } from '../lib/calculateFileHash.js';


interface IFileIndexParams {
    path: string;
    pattern: string | string[];
}

interface IFileIndexItem {
    modified: number;
    hash: string;
}


class FileIndex {
    #index: Map<string, IFileIndexItem> = new Map();

    // #hashes: Map<string, IFileIndexItem[]> = new Map();

    readonly path: string;
    readonly pattern: string | string[];

    constructor({ path, pattern }: IFileIndexParams) {
        this.path = path;
        this.pattern = pattern;

        if (!existsSync(path)) {
            return;
        }

        const data = readFileSync(path).toString().split('\n');

        data.forEach((line: string): void => {
            const [path, modified, hash] = line.split('\t');
            this.#index.set(path, {
                modified: parseFloat(modified),
                hash,
            });
        });
    }

    get size(): number {
        return this.#index.size;
    }

    has(path: string): boolean {
        return this.#index.has(path);
    }

    get(path: string): IFileIndexItem | undefined {
        return this.#index.get(path);
    }

    set(path: string, value: IFileIndexItem): void {
        this.#index.set(path, value);
    }

    async update(): Promise<Set<string>> {
        const list = await glob(this.pattern, {
            ignore: 'node_modules/**',
            stat: true,
            nodir: true,
            // windowsPathsNoEscape:true,
            withFileTypes: true,
        });

        const newIndex = new Map<string, IFileIndexItem>();

        for (const file of list) {
            const path = file.fullpath();

            newIndex.set(path, {
                modified: file.mtimeMs,
                hash: await calculateFileHash(path)
            });
        }

        const changes: Set<string> = new Set();

        newIndex.forEach((item: IFileIndexItem, path: string): void => {
            const prev = this.#index.get(path);

            if (
                !prev ||
                prev.modified !== item.modified ||
                prev.hash !== item.hash
            ) {
                changes.add(path);
                this.#index.set(path, item);
            }
        });

        return changes;
    }

    save() {
        const data = [...this.#index].map(([path, stats]) => {
            return `${ path }\t${ stats.modified }\t${ stats.hash }`;
        });

        writeFileSync(this.path, data.join('\n'));
    }
}


export {
    FileIndex
}

export type {
    IFileIndexItem
}
