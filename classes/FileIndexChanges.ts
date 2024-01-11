import type { IFileIndexChange, TFilePath } from './IFileIndex.js';


const merge = (
    prev: IFileIndexChange | undefined,
    current: IFileIndexChange
): IFileIndexChange => {
    if (!prev) {
        return current;
    }

    if (prev.isFolder !== current.isFolder) {
        throw new Error('Странность при слиянии изменений')
    }

    if (prev.modified > current.modified) {
        return prev;
    }

    return current;
}

class FileIndexChanges extends Map<TFilePath, IFileIndexChange> {
    merge(changes: FileIndexChanges): void {
        changes.forEach((change: IFileIndexChange) => {
            this.set(
                change.path,
                merge(
                    this.get(change.path),
                    change
                )
            );
        });
    }

    *byTime(): IterableIterator<[TFilePath, IFileIndexChange]> {
        const sorted = [
            ...this.entries()
        ].sort(([ , change1], [ , change2]): number => {
            if (change1.isFolder === change1.isFolder) {
                return change1.modified - change2.modified
            } else {
                return change1.isFolder ? -1 : 1;
            }
        });

        for (const [path, change] of sorted) {
            yield [path, change];
        }
    }
}


export {
    FileIndexChanges,
}
