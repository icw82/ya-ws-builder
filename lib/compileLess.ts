import { readFileSync } from 'node:fs';
import { promises as fs } from 'node:fs';

import { renderLess } from './renderLess';


interface ISourceAndDestination {
    source: string;
    dest?: string; // Если нет, компилить туда же
}

const compileLess = async (
    sourceAndDestinations: ISourceAndDestination | ISourceAndDestination[]
): Promise<void> => {
    if (!Array.isArray(sourceAndDestinations)) {
        sourceAndDestinations = [sourceAndDestinations];
    }

    const compile = async (
        { source, dest }: ISourceAndDestination
    ): Promise<void> => {
        const sourceString = readFileSync(source).toString();
        const renderResult = await renderLess(sourceString);

        if (!dest) {
            throw new TypeError('dest не определён');
        }

        await fs.writeFile(dest, renderResult.result);
    };

    await Promise.all(
        sourceAndDestinations.map(compile)
    );
};


export {
    compileLess,
};
