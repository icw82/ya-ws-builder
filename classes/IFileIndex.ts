
import type { WatchEventType } from 'node:fs';

import type { ITargets, Target } from '../lib/arguments.js';
import type {
    FileIndexCache,
    IFileIndexCacheParams
} from './FileIndexCache.js';


/** Путь до файла в целевой папке */
type TFilePath = string;

interface IFileIndexParams {/** Список целевых директорий */
    targets: ITargets;

    watch: IFileIndexWatchParams;
    cache: FileIndexCache;

    onChanges: (event: IFileIndexChange) => Promise<boolean>;
}

interface IFileIndexWatchParams {
    debounceTime?: number;
}

interface IFileIndexItem {
    /** Хэш файла */
    hash: string;

    /** Временная метка модификации */
    modified: number;

    /** Путь до файла в целевой папке */
    path: TFilePath;

    /** Флаг Директории */
    isFolder: boolean;

    /** Ссылка на целевую директорию */
    target: Target;
}

interface IFileIndexChange extends IFileIndexItem {
    type: FileIndexEventType;
}

interface IWatchEvent {
    target: Target;
    path: TFilePath;
    type: WatchEventType;
}

enum FileIndexEventType {
    added = 1,
    changed = 2,
    removed = 0,
}


export {
    FileIndexEventType,

    IFileIndexCacheParams,
    IFileIndexChange,
    IFileIndexItem,
    IFileIndexParams,
    IFileIndexWatchParams,
    IWatchEvent,
    TFilePath,
};
