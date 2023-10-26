import { existsSync, statSync, } from 'node:fs';
import type { WatchEventType } from 'node:fs';

import { calculateFileHash } from '../lib/calculateFileHash.js';

import {
    FileIndex,
    FileIndexEventType,
    IFileIndexEvent,
    IFileIndexItem,
} from './FileIndex.js';


interface IFsEvent {
    // path: string;
    type: FileIndexEventType;
    ts: number;

    hash?: string;
    isFolder?: boolean;
};


interface IEventProcessorParams {
    debounceTime: number;
    fileIndex: FileIndex;

    onChanges: (changes: IFileIndexEvent) => Promise<void>;
}


class EventProcessor {
    readonly debounceTime: number;
    readonly fileIndex: FileIndex;

    #pending: boolean;
    #timer: NodeJS.Timeout | null;
    #events: Map<string, WatchEventType> = new Map();

    #onChanges: (changes: IFileIndexEvent) => Promise<void>;

    constructor({
        debounceTime,
        fileIndex,
        onChanges,
    }: IEventProcessorParams) {
        this.debounceTime = debounceTime;
        this.fileIndex = fileIndex;

        this.handleWatchEvent = this.handleWatchEvent.bind(this);
        this.#onChanges = onChanges;
    }

    async #process(): Promise<void> {
        if (this.#pending) {
            throw new Error('Изменения уже обрабатываются');
        }

        this.#pending = true;

        if (this.#events.size > 100) {
            console.warn('DEBUG: Слишком много событий', this.#events.size);
        }

        const changes = new Map<string, IFsEvent>();

        await Promise.all([...this.#events.entries()].map(async (
            [path, event]: [string, WatchEventType]
        ): Promise<void> => {
            this.#events.delete(path);

            const ts = Date.now();
            const stat = existsSync(path) ? statSync(path) : null;
            const index: IFileIndexItem = this.fileIndex.get(path) || {
                modified: 0,
                hash: '',
            };
            const isFolder = stat ? stat.isDirectory() : void 0;

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

            if (event === 'change') {
                if (stat.mtimeMs === index?.modified) {
                    // console.log('Без изменений (время):', path);

                    return;
                }

                index.modified = stat.mtimeMs;
                this.fileIndex.set(path, index);

                if (isFolder) {
                    // console.log('Изменение директории:', path);

                    changes.set(path, {
                        type: FileIndexEventType.changed,
                        isFolder,
                        ts
                    });

                    return;
                }

                const hash = await calculateFileHash(path);

                if (hash === index?.hash) {
                    console.log('Без изменений (хэш):', path);

                    return;
                };

                index.hash = hash;
                this.fileIndex.set(path, index);

                // console.log('Изменение файла:', path);

                changes.set(path, {
                    type: FileIndexEventType.changed,
                    isFolder,
                    hash,
                    ts
                });

                return;
            }

            if (event === 'rename') {
                if (stat) {
                    const hash = isFolder ? await calculateFileHash(path) : void 0;

                    changes.set(path, {
                        type: FileIndexEventType.added,
                        isFolder,
                        hash,
                        ts
                    });

                    // Осталось понять, это новое или переименованное;

                    return;

                } else {
                    // console.log('Удаление:', path);

                    changes.set(path, {
                        type: FileIndexEventType.removed,
                        isFolder,
                        ts
                    });
                };

                return;
            }

            console.warn('Неожидаемое событие:', event, path);
        }));

        await this.#handleChanges(changes);

        this.#pending = false;
    }

    async #handleChanges(changes: Map<string, IFsEvent>) {

        console.log('changes:', changes);

        // Изменение папок

        // удаление более ранних событий

        // Запись в индекс

        // Разделение на чанки, чтобы не вызывать все изменения одновременно?
        // Сколько должно быть «потоков?»

        // Вызов обратной функции для каждого случая
        for (const [path, event] of changes.entries()) {
            await this.#onChanges({
                isFolder: event.isFolder,
                path,
                type: event.type,
            });
        }

        this.#events.clear();

        // this.fileIndex.save();

        // changes.forEach((change: IFsEvent, path: string): void => {

        // });

        // this.#onChanges(changes.map((item: IFsEvent, ) => ({

        // })));
    }

    #processDebounced() {
        clearTimeout(this.#timer);

        this.#timer = setTimeout(() => {
            if (this.#pending) {
                this.#processDebounced();

                return;
            }

            this.#process();

        }, this.debounceTime);
    }

    handleWatchEvent(type: WatchEventType, path: string) {
        if (!path) {
            console.warn(`Событие без указания файла: ${ type }`);

            return;
        }

        this.#events.set(path, type);

        this.#processDebounced();
    }
}


export {
    EventProcessor
};
