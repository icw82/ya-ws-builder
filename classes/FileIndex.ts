import { Target } from '../lib/arguments.js';
import { IFileIndexItem, TFilePath } from './IFileIndex.js';


class FileIndex extends Map<TFilePath, IFileIndexItem> {
    merge(index: FileIndex): void {
        index.forEach((item: IFileIndexItem) => {
            this.set(item.path, item);
        });
    }

    splitByTargets(): Map<Target, FileIndex> {
        const result = new Map<Target, FileIndex>();

        this.forEach((item: IFileIndexItem, path: TFilePath): void => {
            if (!result.has(item.target)) {
                result.set(item.target, new FileIndex());
            }

            result.get(item.target)?.set(item.path, item);
        });

        return result;
    }
}


export {
    FileIndex,
};
