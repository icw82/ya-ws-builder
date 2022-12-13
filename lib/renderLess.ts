import { readFile } from 'node:fs';

import less = require('less');


const inlineSources = async (
    map: {
        sources: string[];
        sourcesContent?: unknown[];
    }
): Promise<unknown> => {
    if (map.sourcesContent) {
        return map;
    }

    try {
        map.sourcesContent = await Promise.all(
            map.sources.map((source) => {
                return new Promise((resolve, reject) => {
                    readFile(source, 'utf8', (err, data) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(data);
                        }
                    });
                });
            })
        );

    } catch (err) {
        // WARN?
    }

    return map;

};

interface IRenderLessOptions {
    compress?: boolean;
    paths?: string[];
    filename?: string;
    sourceMap?: boolean;
    dumpLineNumbers?: boolean;
    pluginManager?: unknown;
    // variables:
    // strictUnits
}

interface IRenderLessResult {
    result: string;
    imports: unknown[];
}

const renderLess = async (
    sourceString: string,
    options?: IRenderLessOptions
): Promise<IRenderLessResult> => new Promise((resolve, reject): void => {
    const callback = (error, renderResult): void => {
        if (error) {
            reject(error);

            return;
        }

        // console.log('LESS callback result =>', result);

        const callbackResult: IRenderLessResult = {
            result: renderResult.css,
            imports: renderResult.imports,
        };

        if (options?.sourceMap && renderResult.map) {
            // obj.sourcemap = JSON.parse(result.map);

            // void inlineSources(obj.sourcemap).then((map) => {
            //     obj.sourcemap = map;
            //     resolve(obj);
            // });
        } else {
            resolve(callbackResult);
        }

    };

    return less.render(sourceString, options, callback);
});


export {
    renderLess,
};
