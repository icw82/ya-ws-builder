import { watch } from 'node:fs';
import { stat } from 'node:fs/promises';
import type { WatchEventType, Stats } from 'node:fs';
import { join, relative } from 'node:path';

import { glob } from 'glob';
import type { Path } from 'glob';

import { calculateFileHash } from '../lib/calculateFileHash.js';
import { debounce } from '../lib/debounce.js';

import {
    FileIndexEventType,
    IFileIndexChange,
    IFileIndexItem,
    IFileIndexParams,
    IFileIndexWatchParams,
    IWatchEvent,
} from './IFileIndex.js';
import { FileIndex } from './FileIndex.js';
import { FileIndexChanges } from './FileIndexChanges.js';
import { FileIndexCache } from './FileIndexCache.js';
import { ITargets, Target } from '../lib/arguments.js';


class FileWatcher {
    #index: FileIndex = new FileIndex();

    // #hashes: Map<string, IFileIndexItem[]> = new Map();

    #targets: ITargets;
    get targets(): ITargets { return this.#targets; };

    #cache: FileIndexCache;

    #watchers: Map<Target, ReturnType<typeof watch>> = new Map();

    #watcherEvents: Map<string, IWatchEvent> = new Map();
    #watcherEventsProcessDebounceTime: number = 400;

    #changes: FileIndexChanges = new FileIndexChanges();
    #changesHandlingDebounceTime: number = 600;

    #onChanges: (change: IFileIndexChange) => Promise<boolean>;

    constructor(params: IFileIndexParams) {
        this.#targets = params.targets;

        if (!(params.onChanges instanceof Function)) {
            throw new Error('Должно быть функцией');
        }

        this.#onChanges = params.onChanges;

        this.#init(params);
    }

    async #init(params: IFileIndexParams) {
        if (params.cache instanceof FileIndexCache) {
            this.#cache = params.cache;
        }

        this.#index = await this.#cache.read();

        const changes = FileWatcher.getIndexDifferences(
            this.#index,
            await this.#getNewIndex()
        );

        this.#addChanges(changes);

        this.#setupWatch(params.watch);
    }

    #setupWatch(params: IFileIndexWatchParams | undefined): void {
        if (!params) {
            return;
        }

        if (params.debounceTime > 100) {
            this.#watcherEventsProcessDebounceTime = params.debounceTime;
        }

        console.log('— Начало наблюдения —');

        this.#targets.forEach((target: Target): void => {
            const watcher = watch(
                target.value,
                { recursive: true },
                (eventType, filename) => {
                    this.#handleWatcherEvent({
                        target,
                        filename,
                        eventType
                    });
                }
            );

            this.#watchers.set(target, watcher);
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
        this.#cache?.write(this.#index);
    }

    delete(path: string): void {
        this.#index.delete(path);
        this.#cache?.write(this.#index);
    }

    async #getNewIndex(): Promise<FileIndex> {
        const index: FileIndex = new FileIndex();

        await Promise.all([...this.#targets].map(
            async ([ , target]: [string, Target]): Promise<void> => {
                const pattern = `${ target }/**/*`.replace(/\\/g, '/');

                const fileList = await glob(pattern, {
                    ignore: 'node_modules/**',
                    stat: true,
                    // nodir: true,
                    // windowsPathsNoEscape:true,
                    withFileTypes: true,
                });

                await Promise.all(fileList.map(
                    async (file: Path): Promise<void> => {
                        const absolutePath = file.fullpath();
                        const path = relative(target.toString(), absolutePath);

                        const isFolder = file.isDirectory();
                        const hash = isFolder
                            ? null
                            : await calculateFileHash(absolutePath);

                        index.set(path, {
                            path,
                            isFolder,
                            modified: file.mtimeMs,
                            hash,
                            target
                        });
                    }
                ));
            }
        ));

        return index;
    }

    #addChanges(changes: FileIndexChanges): void {
        this.#changes.merge(changes);

        console.log('#handleChangesDebounced');
        this.#handleChangesDebounced();
    }

    #handleChangesDebounced = debounce(
        this.#handleChanges,
        this.#changesHandlingDebounceTime
    )

    // @debounceMethod(500)
    async #handleChanges(): Promise<void> {
        console.log('#handleChanges');

        if (!this.#changes.size) {
            console.log('#handleChanges → Изменений нет');
            return;
        }

        // Разделение на чанки, чтобы не вызывать все изменения одновременно?
        // Сколько должно быть «потоков?»

        for (const [ , change] of this.#changes) {
            const success = await this.#onChanges(change);

            if (typeof success !== 'boolean') {
                throw new Error(
                    '#onChanges: Ожидается булево значение'
                );
            }

            if (success) {
                this.#applyChanges(change);
            }
        }
    }

    #applyChanges(change: IFileIndexChange): void {
        // console.log('#applyChanges');

        if (change.type === FileIndexEventType.removed) {
            this.delete(change.path);

            return;
        }

        if (
            change.type === FileIndexEventType.added ||
            change.type === FileIndexEventType.changed
        ) {
            this.set(change.path, {
                hash: change.hash,
                isFolder: change.isFolder,
                modified: change.modified,
                path: change.path,
                target: change.target,
            });

            return;
        }

        console.warn(
            'Непредусмотренная ситуация при обновлении индекса',
            change
        );
    }

    #handleWatcherEvent({
        target,
        filename,
        eventType
    }: {
        target: Target;
        filename: string;
        eventType: WatchEventType
    }) {
        if (!target || !filename) {
            console.warn(`Событие без указания файла: ${ eventType }`);

            return;
        }

        // filename — уникальное имя файла в целевых папках, так как
        // содержащаяся в целевых папках структура файлов сливается в одну,
        // и повторение файлов — ошибка
        this.#watcherEvents.set(filename, {
            target,
            path: filename,
            type: eventType,
        });

        // console.log('#processWatcherEventsDebounced');
        this.#processWatcherEventsDebounced();
    }

    #processWatcherEventsDebounced = debounce(
        this.#processWatcherEvents,
        this.#watcherEventsProcessDebounceTime
    )

    async #processWatcherEvents(): Promise<void> {
        console.log('#processWatcherEvents');

        if (this.#watcherEvents.size > 100) {
            console.warn(
                'DEBUG: Слишком много событий',
                this.#watcherEvents.size
            );
        }

        await Promise.all([...this.#watcherEvents].map(async (
            [filename, event]: [string, IWatchEvent]
        ) => {
            return this.#processWatcherEvent(event);
        }));
    }

    async #processWatcherEvent(event: IWatchEvent): Promise<void> {
        this.#watcherEvents.delete(event.path);

        const absolutePath = join(event.target.toString(), event.path);

        const ts = Date.now();

        let stats: Stats | null = null;

        try {
            stats = await stat(absolutePath);
        } catch (error) {
            if (error.code === 'ENOENT') {
                // return;
            }

            console.error(error);
        }

        // const index: IFileIndexItem = this.get(absolutePath) || {
        //     modified: 0,
        //     hash: '',
        // };

        // const isFolder = stats ? stats.isDirectory() : void 0;

        /*
            1) Изменение файла
                1.1) Переименование
                1.2) Изменение внутренностей
            2) Удаление файла
            3) Добавление файла
            4) Перенос файла (слияние 2 и 3)

            5) Переименование директории
            6) Удаление директории
            7) Перенос директории
        */
    }

    /** Возвращает изменения, которые есть между двумя состояниями индекса */
    static getIndexDifferences(
        index1: FileIndex,
        index2: FileIndex | null
    ): FileIndexChanges {
        const changes = new FileIndexChanges();

        const index2Clone = new Map(index2 || void 0);

        index1.forEach((original: IFileIndexItem, path: string): void => {
            const version = index2Clone.get(path);

            if (!version) {
                changes.set(path, {
                    ...original,
                    type: FileIndexEventType.removed,
                });

                return;
            }

            index2Clone.delete(path);

            if (
                original.modified !== version.modified ||
                original.hash !== version.hash
            ) {
                changes.set(path, {
                    ...version,
                    type: FileIndexEventType.changed,
                });

                return;
            }

            // Иначе изменений нет
        });

        index2Clone.forEach((version: IFileIndexItem, path: string) => {
            const original = index1.get(path);

            if (!original) {
                changes.set(path, {
                    ...version,
                    type: FileIndexEventType.added,
                });

                return;
            }

            throw new Error('Неизвестное состояние индекса');
        });

        return changes;
    }
}


export {
    FileWatcher,
}
